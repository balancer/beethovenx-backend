import { TokenPriceHandler } from '../../token-types';
import { PrismaTokenWithTypes } from '../../../../prisma/prisma-types';
import { prisma } from '../../../../prisma/prisma-client';
import { timestampRoundedUpToNearestHour } from '../../../common/time';
import { Chain } from '@prisma/client';
import _ from 'lodash';
import { coingeckoDataService } from '../coingecko-data.service';
import { tokenAndPrice, updatePrices } from './price-handler-helper';
import { prismaBulkExecuteOperations } from '../../../../prisma/prisma-util';
import config from '../../../../config';

export class CoingeckoPriceHandlerService implements TokenPriceHandler {
    public readonly exitIfFails = true;
    public readonly id = 'CoingeckoPriceHandlerService';

    private getAcceptedTokens(tokens: PrismaTokenWithTypes[]): PrismaTokenWithTypes[] {
        // excluded via network config
        const excludedFromCoingecko: { address: string; chain: Chain }[] = [];
        for (const data of Object.values(config)) {
            data.coingecko.excludedTokenAddresses.forEach((address) =>
                excludedFromCoingecko.push({ address: address, chain: data.chain.prismaId }),
            );
        }
        return tokens.filter(
            (token) =>
                !excludedFromCoingecko.find(
                    (excluded) => excluded.address === token.address && excluded.chain === token.chain,
                ) &&
                //excluded via content service
                !token.excludedFromCoingecko &&
                token.coingeckoTokenId,
        );
    }

    // we update based on coingecko ID
    public async updatePricesForTokens(
        tokens: PrismaTokenWithTypes[],
        chains: Chain[],
    ): Promise<PrismaTokenWithTypes[]> {
        const acceptedTokens = this.getAcceptedTokens(tokens);

        const timestamp = timestampRoundedUpToNearestHour();
        const updated: PrismaTokenWithTypes[] = [];
        const tokenAndPrices: tokenAndPrice[] = [];

        const uniqueTokensWithIds = _.uniqBy(acceptedTokens, 'coingeckoTokenId');

        const chunks = _.chunk(uniqueTokensWithIds, 250); //max page size is 250

        for (const chunk of chunks) {
            const response = await coingeckoDataService.getMarketDataForTokenIds(
                chunk.map((item) => item.coingeckoTokenId || ''),
            );
            let operations: any[] = [];

            for (const item of response) {
                const tokensToUpdate = acceptedTokens.filter((token) => token.coingeckoTokenId === item.id);
                for (const tokenToUpdate of tokensToUpdate) {
                    // if we have a price at all
                    if (item.current_price) {
                        const data = {
                            price: item.current_price,
                            ath: item.ath ?? item.current_price,
                            atl: item.atl ?? item.current_price,
                            marketCap: item.market_cap ?? undefined,
                            fdv: item.fully_diluted_valuation ?? undefined,
                            high24h: item.high_24h ?? item.current_price,
                            low24h: item.low_24h ?? item.current_price,
                            priceChange24h: item.price_change_24h ?? 0,
                            priceChangePercent24h: item.price_change_percentage_24h ?? 0,
                            priceChangePercent7d: item.price_change_percentage_7d_in_currency ?? undefined,
                            priceChangePercent14d: item.price_change_percentage_14d_in_currency ?? undefined,
                            priceChangePercent30d: item.price_change_percentage_30d_in_currency ?? undefined,
                            updatedAt: item.last_updated,
                        };

                        operations.push(
                            prisma.prismaTokenDynamicData.upsert({
                                where: {
                                    tokenAddress_chain: {
                                        tokenAddress: tokenToUpdate.address,
                                        chain: tokenToUpdate.chain,
                                    },
                                },
                                update: data,
                                create: {
                                    coingeckoId: item.id,
                                    tokenAddress: tokenToUpdate.address,
                                    chain: tokenToUpdate.chain,
                                    ...data,
                                },
                            }),
                        );

                        tokenAndPrices.push({
                            address: tokenToUpdate.address,
                            chain: tokenToUpdate.chain,
                            price: item.current_price,
                        });
                        updated.push(tokenToUpdate);
                    }
                }
            }
            await updatePrices(this.id, tokenAndPrices, timestamp);

            await prismaBulkExecuteOperations(operations);
        }
        return updated;
    }
}
