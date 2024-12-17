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

type FundManagement = {
    sender: string;
    recipient: string;
    fromInternalBalance: boolean;
    toInternalBalance: boolean;
};

export class BeetsPriceHandlerService implements TokenPriceHandler {
    public readonly exitIfFails = false;
    public readonly id = 'BeetsPriceHandlerService';

    private readonly beetsFtmAddress = '0xF24Bcf4d1e507740041C9cFd2DddB29585aDCe1e';
    private readonly wftmFtmAddress = '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83';
    private readonly freshBeetsPoolId = '0x9e4341acef4147196e99d648c5e43b3fc9d026780002000000000000000005ec';
    private readonly VaultFtmAddress = '0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce';
    private readonly beetsAddressOptimism = '0xb4bc46bc6cb217b59ea8f4530bae26bf69f677f0';
    private readonly beetsRpcProvider = 'https://rpc.ftm.tools';

    private getAcceptedTokens(tokens: PrismaTokenWithTypes[]): PrismaTokenWithTypes[] {
        return tokens.filter(
            (token) =>
                (token.chain === 'FANTOM' && token.address === this.beetsFtmAddress) ||
                (token.chain === 'OPTIMISM' && token.address === this.beetsAddressOptimism),
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

        const assets: string[] = [this.beetsFtmAddress, this.wftmFtmAddress];
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
            this.VaultFtmAddress,
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
            tokenOutAmountScaled = deltas[assets.indexOf(this.wftmFtmAddress)] ?? '0';
        } catch (err) {
            console.log(`queryBatchSwapTokensIn error: `, err);
        }

        if (tokenOutAmountScaled === '0') {
            throw new Error('BeetsPriceHandlerService: Could not get beets price from on-chain.');
        }

        const ftmPrice = await prisma.prismaTokenCurrentPrice.findUniqueOrThrow({
            where: {
                tokenAddress_chain: { tokenAddress: this.wftmFtmAddress.toLowerCase(), chain: 'FANTOM' },
            },
        });

        const beetsPrice = ftmPrice.price * Math.abs(parseFloat(formatFixed(tokenOutAmountScaled, 18)));

        for (const token of acceptedTokens) {
            tokenAndPrices.push({ address: token.address, chain: token.chain, price: beetsPrice });

            updatedTokens.push(token);
        }

        await updatePrices(this.id, tokenAndPrices, timestamp);

        return updatedTokens;
    }
}
