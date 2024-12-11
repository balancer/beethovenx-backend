import { TokenPriceHandler } from '../../token-types';
import { PrismaTokenWithTypes } from '../../../../prisma/prisma-types';
import { timestampRoundedUpToNearestHour } from '../../../common/time';
import { prisma } from '../../../../prisma/prisma-client';
import _ from 'lodash';
import { tokenAndPrice, updatePrices } from './price-handler-helper';
import { Chain } from '@prisma/client';
import { parseAbiItem } from 'abitype';
import { getViemClient } from '../../../sources/viem-client';
import config from '../../../../config';

export class AavePriceHandlerService implements TokenPriceHandler {
    public readonly exitIfFails = false;
    public readonly id = 'AavePriceHandlerService';
    aaveTokens = Object.keys(config).flatMap((chain) => {
        const chainConfig = config[chain as keyof typeof config];
        const v3 = chainConfig.ybAprConfig.aave?.v3?.tokens;
        if (!v3) return [];
        return Object.values(v3).flatMap(({ aTokenAddress, underlyingAssetAddress, wrappedTokens }) =>
            Object.values(wrappedTokens).map((wrappedToken) => ({
                wrappedToken,
                aToken: aTokenAddress,
                underlying: underlyingAssetAddress,
                chain: chain as Chain,
            })),
        );
    });

    private getAcceptedTokens(tokens: PrismaTokenWithTypes[]): PrismaTokenWithTypes[] {
        const list = this.aaveTokens.map((token) => token.wrappedToken);
        return tokens.filter((token) => list.includes(token.address));
    }

    public async updatePricesForTokens(tokens: PrismaTokenWithTypes[]): Promise<PrismaTokenWithTypes[]> {
        const acceptedTokens = this.getAcceptedTokens(tokens);
        const acceptedAddresses = acceptedTokens.map((token) => token.address);
        const acceptedAaveTokens = this.aaveTokens.filter((token) => acceptedAddresses.includes(token.wrappedToken));
        const tokenAndPrices: tokenAndPrice[] = [];
        const timestamp = timestampRoundedUpToNearestHour();

        // Group tokens by chain
        const tokensByChain = _.groupBy(acceptedTokens, 'chain');

        const updatedTokens: PrismaTokenWithTypes[] = [];
        for (const chain in tokensByChain) {
            const aaveTokensForChain = acceptedAaveTokens.filter((token) => token.chain === (chain as Chain));
            if (!aaveTokensForChain.length) {
                continue;
            }

            // Fetch rates for aave tokens
            const addresses = aaveTokensForChain.map((token) => token.wrappedToken);
            const underlying = aaveTokensForChain.map((token) => token.underlying);
            const contracts = addresses.map((address) => ({
                address: address as `0x${string}`,
                // Returns rates for the rebasing tokens returned in RAYs (27 decimals)
                abi: [parseAbiItem('function rate() view returns (uint256)')],
                functionName: 'rate',
            }));
            const rates = await getViemClient(chain as Chain)
                .multicall({ contracts, allowFailure: true })
                .then((res) => res.map((r) => (r.status === 'success' ? r.result : 1000000000000000000000000000n)));
            const rateMap = _.zipObject(
                addresses,
                rates.map((r) => Number(r) / 1e27),
            );

            const underlyingPrices = await prisma.prismaTokenCurrentPrice.findMany({
                where: { tokenAddress: { in: _.uniq(underlying) }, chain: chain as Chain },
            });
            const underlyingMap = _.zipObject(
                underlyingPrices.map((p) => p.tokenAddress),
                underlyingPrices,
            );

            for (const token of tokensByChain[chain]) {
                const underlying = aaveTokensForChain.find((t) => t.wrappedToken === token.address)?.underlying;
                if (!underlying) {
                    throw new Error(`AavePriceHandlerService: Underlying token for ${token.address} not found`);
                }
                try {
                    const price = Number((rateMap[token.address] * underlyingMap[underlying].price).toFixed(2));

                    updatedTokens.push(token);
                    tokenAndPrices.push({
                        address: token.address,
                        chain: token.chain,
                        price,
                    });
                } catch (e: any) {
                    console.error('Aave price failed for', token.address, chain, e.message);
                }
            }
        }

        await updatePrices(this.id, tokenAndPrices, timestamp);

        return updatedTokens;
    }
}
