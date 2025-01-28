import { TokenPriceHandler } from '../../token-types';
import { PrismaTokenWithTypes } from '../../../../prisma/prisma-types';
import { timestampRoundedUpToNearestHour } from '../../../common/time';
import { prisma } from '../../../../prisma/prisma-client';
import _ from 'lodash';
import { tokenAndPrice, updatePrices } from './price-handler-helper';
import { Chain } from '@prisma/client';

export class ERC4626PriceHandlerService implements TokenPriceHandler {
    public readonly exitIfFails = false;
    public readonly id = 'ERC4626PriceHandlerService';

    private getAcceptedTokens(tokens: PrismaTokenWithTypes[]): PrismaTokenWithTypes[] {
        return tokens.filter((token) => token.types.includes('ERC4626'));
    }

    public async updatePricesForTokens(tokens: PrismaTokenWithTypes[]): Promise<PrismaTokenWithTypes[]> {
        const acceptedTokens = this.getAcceptedTokens(tokens);

        const tokenAndPrices: tokenAndPrice[] = [];
        const timestamp = timestampRoundedUpToNearestHour();

        // Group tokens by chain
        const tokensByChain = _.groupBy(acceptedTokens, 'chain');

        const updatedTokens: PrismaTokenWithTypes[] = [];
        for (const chain in tokensByChain) {
            // Use existing rates for erc4626 tokens);

            const erc4626TokensForChain = tokensByChain[chain];
            if (!erc4626TokensForChain.length) {
                continue;
            }

            // Fetch rates for aave tokens
            const underlying = erc4626TokensForChain
                .map((token) => token.underlyingTokenAddress)
                .filter((address) => address !== null);

            const underlyingPrices = await prisma.prismaTokenCurrentPrice.findMany({
                where: { tokenAddress: { in: _.uniq(underlying) }, chain: chain as Chain },
            });

            const underlyingMap = _.zipObject(
                underlyingPrices.map((p) => p.tokenAddress),
                underlyingPrices,
            );

            const rateMap = _.zipObject(
                erc4626TokensForChain.map((token) => token.address),
                erc4626TokensForChain.map((token) => Number(token.unwrapRate)),
            );

            for (const erc4626Token of erc4626TokensForChain) {
                const dbToken = acceptedTokens.find((t) => t.address === erc4626Token.address);
                const underlying = erc4626Token.underlyingTokenAddress;
                if (!dbToken || !underlying || !underlyingMap[underlying]) {
                    console.error(
                        `ERC4626PriceHandlerService: Underlying price for ERC4626 ${erc4626Token.symbol} (underlying address: ${erc4626Token.underlyingTokenAddress}) on ${chain} not found`,
                    );
                    continue;
                }
                try {
                    const price = Number((rateMap[erc4626Token.address] * underlyingMap[underlying].price).toFixed(2));

                    updatedTokens.push(dbToken);
                    tokenAndPrices.push({
                        address: erc4626Token.address,
                        chain: erc4626Token.chain,
                        price,
                    });
                } catch (e: any) {
                    console.error('ERC4626 price failed for', erc4626Token.address, chain, e.message);
                }
            }
        }

        await updatePrices(this.id, tokenAndPrices, timestamp);

        return updatedTokens;
    }
}
