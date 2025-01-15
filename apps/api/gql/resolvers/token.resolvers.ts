import { GqlChain, GqlHistoricalTokenPrice, Resolvers } from '../generated-schema';
import _ from 'lodash';
import { isAdminRoute } from '../../../../modules/auth/auth-context';
import { tokenService } from '../../../../modules/token/token.service';
import { headerChain } from '../../../../modules/context/header-chain';
import { syncLatestFXPrices } from '../../../../modules/token/latest-fx-price';
import moment from 'moment';
import { TokenController } from '../../../../modules/controllers/token-controller';
import config from '../../../../config';
import { GraphQLError } from 'graphql';

const resolvers: Resolvers = {
    Query: {
        tokenGetTokens: async (parent, args, context) => {
            const currentChain = headerChain();
            if (!args.chains && currentChain) {
                args.chains = [currentChain];
            } else if (!args.chains) {
                throw new GraphQLError('Provide "chains" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            return tokenService.getTokenDefinitions(args);
        },
        tokenGetCurrentPrices: async (parent, { chains }, context) => {
            const currentChain = headerChain();
            if (!chains && currentChain) {
                chains = [currentChain];
            } else if (!chains) {
                throw new GraphQLError('Provide "chains" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            const prices = await tokenService.getCurrentTokenPrices(chains);

            return prices.map((price) => ({
                address: price.tokenAddress,
                price: price.price,
                chain: price.chain,
                updatedAt: moment(price.updatedAt).unix(),
                updatedBy: price.updatedBy,
            }));
        },
        tokenGetHistoricalPrices: async (parent, { addresses, chain, range }, context) => {
            const data = await tokenService.getTokenPricesForRange(addresses, range, chain);

            const grouped = _.groupBy(data, 'tokenAddress');

            const result: GqlHistoricalTokenPrice[] = [];
            for (const address in grouped) {
                result.push({
                    address: address,
                    chain: grouped[address][0].chain,
                    prices: grouped[address].map((entry) => ({
                        timestamp: `${entry.timestamp}`,
                        price: entry.price,
                        updatedAt: moment(entry.updatedAt).unix(),
                        updatedBy: entry.updatedBy,
                    })),
                });
            }
            return result;
        },
        tokenGetTokenDynamicData: async (parent, { address, chain }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            const data = await tokenService.getTokenDynamicData(address, chain);

            return data
                ? {
                      ...data,
                      id: data.coingeckoId,
                      fdv: data.fdv ? `${data.fdv}` : null,
                      marketCap: data.marketCap ? `${data.marketCap}` : null,
                      updatedAt: data.updatedAt.toUTCString(),
                  }
                : null;
        },
        tokenGetTokensDynamicData: async (parent, { addresses, chain }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            const items = await tokenService.getTokensDynamicData(addresses, chain);

            return items.map((item) => ({
                ...item,
                id: item.coingeckoId,
                fdv: item.fdv ? `${item.fdv}` : null,
                marketCap: item.marketCap ? `${item.marketCap}` : null,
                updatedAt: item.updatedAt.toUTCString(),
            }));
        },
        tokenGetPriceChartData: async (parent, { address, range, chain }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            const data = await tokenService.getTokenPriceForRange(address, range, chain);

            return data.map((item) => ({
                id: `${address}-${item.timestamp}`,
                timestamp: item.timestamp,
                price: `${item.price}`,
            }));
        },
        tokenGetRelativePriceChartData: async (parent, { tokenIn, tokenOut, range, chain }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            const data = await tokenService.getRelativeDataForRange(tokenIn, tokenOut, range, chain);

            return data.map((item) => ({
                id: `${tokenIn}-${tokenOut}-${item.timestamp}`,
                timestamp: item.timestamp,
                price: `${item.price}`,
            }));
        },
        tokenGetCandlestickChartData: async (parent, { address, range, chain }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            const data = await tokenService.getTokenPriceForRange(address, range, chain);

            return data.map((item) => ({
                id: `${address}-${item.timestamp}`,
                timestamp: item.timestamp,
                open: `${item.open}`,
                high: `${item.high}`,
                low: `${item.low}`,
                close: `${item.close}`,
            }));
        },
        tokenGetTokenData: async (parent, { address, chain }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            const token = await tokenService.getToken(address, chain);
            if (token) {
                return {
                    ...token,
                    id: token.address,
                    tokenAddress: token.address,
                };
            }
            return null;
        },
        tokenGetTokensData: async (parent, { addresses }, context) => {
            const chain = headerChain() || 'MAINNET';
            const tokens = await tokenService.getTokens(chain, addresses);
            return tokens.map((token) => ({ ...token, id: token.address, tokenAddress: token.address }));
        },
        tokenGetProtocolTokenPrice: async (parent, { chain }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            return tokenService.getProtocolTokenPrice(chain);
        },
    },
    Mutation: {
        tokenReloadTokenPrices: async (parent, { chains }, context) => {
            isAdminRoute(context);

            await tokenService.updateTokenPrices(chains);

            return true;
        },
        tokenSyncTokenDefinitions: async (parent, {}, context) => {
            isAdminRoute(context);
            const chain = headerChain() || 'MAINNET';

            await tokenService.syncTokenContentData(chain);

            return 'success';
        },
        tokenSyncLatestFxPrices: async (parent, { chain }, context) => {
            isAdminRoute(context);
            const subgraphUrl = config[chain].subgraphs.balancer;

            await syncLatestFXPrices(subgraphUrl, chain);

            return 'success';
        },
        tokenDeleteTokenType: async (parent, args, context) => {
            isAdminRoute(context);
            const chain = headerChain() || 'MAINNET';

            await tokenService.deleteTokenType(args, chain);

            return 'success';
        },
        tokenReloadAllTokenTypes: async (parent, {}, context) => {
            isAdminRoute(context);
            const chain = headerChain() || 'MAINNET';

            await tokenService.reloadAllTokenTypes(chain);

            return 'success';
        },
        tokenReloadErc4626Tokens: async (parent, { chains }, context) => {
            isAdminRoute(context);

            const result: { type: string; chain: GqlChain; success: boolean; error: string | undefined }[] = [];

            for (const chain of chains) {
                try {
                    await TokenController().syncErc4626Tokens(chain);
                    result.push({ type: 'v3', chain, success: true, error: undefined });
                } catch (e) {
                    result.push({ type: 'v3', chain, success: false, error: `${e}` });
                    console.log(`Could not reload v3 pools for chain ${chain}: ${e}`);
                }
            }

            return result;
        },
    },
};

export default resolvers;
