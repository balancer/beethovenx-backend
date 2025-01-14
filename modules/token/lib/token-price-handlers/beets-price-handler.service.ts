import { TokenPriceHandler } from '../../token-types';
import { PrismaTokenWithTypes } from '../../../../prisma/prisma-types';
import { timestampRoundedUpToNearestHour } from '../../../common/time';
import { prisma } from '../../../../prisma/prisma-client';
import { SwapKind, BatchSwapStep } from '@balancer/sdk';
import { fp } from '../../../big-number/big-number';
import { Contract } from '@ethersproject/contracts';
import { zeroAddress as AddressZero } from 'viem';
import VaultAbi from '../../../pool/abi/Vault.json';
import { ethers } from 'ethers';
import { formatFixed } from '@ethersproject/bignumber';
import { tokenAndPrice, updatePrices } from './price-handler-helper';
import { Chain } from '@prisma/client';
import { AllNetworkConfigs } from '../../../network/network-config';

type FundManagement = {
    sender: string;
    recipient: string;
    fromInternalBalance: boolean;
    toInternalBalance: boolean;
};

export class BeetsPriceHandlerService implements TokenPriceHandler {
    public readonly exitIfFails = false;
    public readonly id = 'BeetsPriceHandlerService';

    private readonly beetsFtmAddress = '0xf24bcf4d1e507740041c9cfd2dddb29585adce1e';
    private readonly beetsSonicAddress = '0x2d0e0814e62d80056181f5cd932274405966e4f0';
    private readonly beetsOptimismAddress = '0xb4bc46bc6cb217b59ea8f4530bae26bf69f677f0';
    private readonly stSAddress = '0xe5da20f15420ad15de0fa650600afc998bbe3955';
    private readonly freshBeetsPoolId = '0x10ac2f9dae6539e77e372adb14b1bf8fbd16b3e8000200000000000000000005';
    private readonly VaultSonicAddress = '0xba12222222228d8ba445958a75a0704d566bf2c8';
    private readonly beetsRpcProvider = 'https://rpc.soniclabs.com/';

    private getAcceptedTokens(tokens: PrismaTokenWithTypes[]): PrismaTokenWithTypes[] {
        return tokens.filter(
            (token) =>
                (token.chain === 'FANTOM' && token.address === this.beetsFtmAddress) ||
                (token.chain === 'OPTIMISM' && token.address === this.beetsOptimismAddress) ||
                (token.chain === 'SONIC' && token.address === this.beetsSonicAddress),
        );
    }

    public async updatePricesForTokens(
        tokens: PrismaTokenWithTypes[],
        chains: Chain[],
    ): Promise<PrismaTokenWithTypes[]> {
        const acceptedTokens = this.getAcceptedTokens(tokens);
        const updatedTokens: PrismaTokenWithTypes[] = [];
        const tokenAndPrices: tokenAndPrice[] = [];
        const timestamp = timestampRoundedUpToNearestHour();

        const assets: string[] = [this.beetsSonicAddress, this.stSAddress];
        const swaps: BatchSwapStep[] = [
            {
                poolId: this.freshBeetsPoolId,
                assetInIndex: 0n,
                assetOutIndex: 1n,
                amount: fp(1).toBigInt(),
                userData: '0x',
            },
        ];

        const vaultContract = new Contract(
            this.VaultSonicAddress,
            VaultAbi,
            new ethers.providers.JsonRpcProvider(this.beetsRpcProvider),
        );
        const funds: FundManagement = {
            sender: AddressZero,
            recipient: AddressZero,
            fromInternalBalance: false,
            toInternalBalance: false,
        };

        let tokenOutAmountScaled = '0';
        try {
            const deltas = await vaultContract.queryBatchSwap(SwapKind.GivenIn, swaps, assets, funds);
            tokenOutAmountScaled = deltas[assets.indexOf(this.stSAddress)] ?? '0';
        } catch (err) {
            console.log(`queryBatchSwapTokensIn error: `, err);
        }

        if (tokenOutAmountScaled === '0') {
            throw new Error('BeetsPriceHandlerService: Could not get beets price from on-chain.');
        }

        const stSPrice = await prisma.prismaTokenCurrentPrice.findUniqueOrThrow({
            where: {
                tokenAddress_chain: { tokenAddress: this.stSAddress.toLowerCase(), chain: 'SONIC' },
            },
        });

        const beetsPrice = stSPrice.price * Math.abs(parseFloat(formatFixed(tokenOutAmountScaled, 18)));

        for (const token of acceptedTokens) {
            tokenAndPrices.push({ address: token.address, chain: token.chain, price: beetsPrice });

            updatedTokens.push(token);
        }

        await updatePrices(this.id, tokenAndPrices, timestamp);

        return updatedTokens;
    }
}
