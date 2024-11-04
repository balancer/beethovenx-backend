import { TokenPriceItem } from './token-types';
import { prisma } from '../../prisma/prisma-client';
import { TokenPriceService } from './lib/token-price.service';
import {
    Chain,
    PrismaPriceRateProviderData,
    PrismaToken,
    PrismaTokenCurrentPrice,
    PrismaTokenDynamicData,
    PrismaTokenPrice,
} from '@prisma/client';
import { CoingeckoDataService } from './lib/coingecko-data.service';
import { Cache, CacheClass } from 'memory-cache';
import {
    GqlPriceRateProviderData,
    GqlToken,
    GqlTokenChartDataRange,
    MutationTokenDeleteTokenTypeArgs,
} from '../../schema';
import { networkContext } from '../network/network-context.service';
import { Dictionary } from 'lodash';
import { AllNetworkConfigsKeyedOnChain } from '../network/network-config';
import { chainIdToChain } from '../network/chain-id-to-chain';
import { GithubContentService } from '../content/github-content.service';

const TOKEN_PRICES_CACHE_KEY = `token:prices:current`;
const TOKEN_PRICES_24H_AGO_CACHE_KEY = `token:prices:24h-ago`;
const ALL_TOKENS_CACHE_KEY = `tokens:all`;

export class TokenService {
    cache: CacheClass<string, any>;
    constructor(
        private readonly tokenPriceService: TokenPriceService,
        private readonly coingeckoDataService: CoingeckoDataService,
    ) {
        this.cache = new Cache<string, any>();
    }

    public async syncTokenContentData() {
        //sync coingecko Ids first, then override Ids from the content service
        await this.coingeckoDataService.syncCoingeckoIds();
        const githubContentService = new GithubContentService();
        await githubContentService.syncTokenContentData([networkContext.chain]);
    }

    public async getToken(address: string, chain = networkContext.chain): Promise<PrismaToken | null> {
        return prisma.prismaToken.findUnique({
            where: {
                address_chain: {
                    address: address.toLowerCase(),
                    chain,
                },
            },
        });
    }

    public async getTokens(addresses?: string[], chain = networkContext.chain): Promise<PrismaToken[]> {
        let tokens: PrismaToken[] | null = this.cache.get(`${ALL_TOKENS_CACHE_KEY}:${chain}`);
        if (!tokens) {
            tokens = await prisma.prismaToken.findMany({ where: { chain: chain } });
            this.cache.put(`${ALL_TOKENS_CACHE_KEY}:${chain}`, tokens, 5 * 60 * 1000);
        }
        if (addresses) {
            return tokens.filter((token) => addresses.includes(token.address));
        }
        return tokens;
    }

    public async getTokenDefinition(address: string, chain: Chain): Promise<GqlToken | undefined> {
        const token = await prisma.prismaToken.findUnique({
            where: { address_chain: { address: address, chain: chain } },
            include: { types: true },
        });

        if (token) {
            const rateProviderData = await this.getPriceRateProviderData([token]);
            return {
                ...token,
                chainId: AllNetworkConfigsKeyedOnChain[token.chain].data.chain.id,
                tradable: !token.types.find((type) => type.type === 'PHANTOM_BPT' || type.type === 'BPT'),
                rateProviderData: rateProviderData[token.address],
                coingeckoId: token.coingeckoTokenId,
                isErc4626: token.types.some((type) => type.type === 'ERC4626'),
            };
        }

        return undefined;
    }

    public async getTokenDefinitions(chains: Chain[]): Promise<GqlToken[]> {
        const tokens = await prisma.prismaToken.findMany({
            where: { types: { some: { type: 'WHITE_LISTED' } }, chain: { in: chains } },
            include: { types: true, dynamicData: true },
            orderBy: { priority: 'desc' },
        });

        for (const chain of chains) {
            const weth = tokens.find(
                (token) =>
                    token.chain === chain && token.address === AllNetworkConfigsKeyedOnChain[chain].data.weth.address,
            );

            if (weth) {
                tokens.push({
                    ...weth,
                    name: AllNetworkConfigsKeyedOnChain[chain].data.eth.name,
                    address: AllNetworkConfigsKeyedOnChain[chain].data.eth.address,
                    symbol: AllNetworkConfigsKeyedOnChain[chain].data.eth.symbol,
                    chain: AllNetworkConfigsKeyedOnChain[chain].data.chain.prismaId,
                });
            }
        }

        tokens.sort((a, b) => {
            if (!a.dynamicData?.marketCap) {
                return 1;
            }
            if (!b.dynamicData?.marketCap) {
                return -1;
            }
            if (a.dynamicData.marketCap > b.dynamicData.marketCap) {
                return -1;
            }
            if (a.dynamicData.marketCap < b.dynamicData.marketCap) {
                return 1;
            }
            return 0;
        });

        const rateProviderData = await this.getPriceRateProviderData(tokens);

        return tokens.map((token) => ({
            ...token,
            chainId: AllNetworkConfigsKeyedOnChain[token.chain].data.chain.id,
            tradable: !token.types.find((type) => type.type === 'PHANTOM_BPT' || type.type === 'BPT'),
            rateProviderData: rateProviderData[token.address],
            coingeckoId: token.coingeckoTokenId,
            isErc4626: token.types.some((type) => type.type === 'ERC4626'),
        }));
    }

    private async getPriceRateProviderData(
        tokens: PrismaToken[],
    ): Promise<Record<string, GqlPriceRateProviderData | undefined>> {
        const priceRateProviders = await prisma.prismaPriceRateProviderData.findMany({
            where: {
                tokenAddress: {
                    in: tokens.map((t) => t.address),
                },
            },
        });

        const priceRateProviderDataResult: Record<string, GqlPriceRateProviderData | undefined> = {};

        for (const token of tokens) {
            const providersForToken = priceRateProviders.filter((provider) => provider.tokenAddress === token.address);

            if (providersForToken.length === 1) {
                priceRateProviderDataResult[token.address] = {
                    ...providersForToken[0],
                    warnings: providersForToken[0].warnings?.split(',') || [],
                    address: providersForToken[0].rateProviderAddress,
                };
            } else if (providersForToken.length > 1) {
                // need to find the "preferred" price rate provider
                // only return the safe one
                // if all are reviewed and safe, we can just return the first one
                for (const provider of providersForToken) {
                    if (provider.reviewed && provider.summary === 'safe') {
                        priceRateProviderDataResult[token.address] = {
                            ...provider,
                            warnings: provider.warnings?.split(',') || [],
                            address: provider.rateProviderAddress,
                        };
                    }
                }
            } else {
                priceRateProviderDataResult[token.address] = undefined;
            }
        }
        return priceRateProviderDataResult;
    }

    public async updateTokenPrices(chains: Chain[]): Promise<void> {
        return this.tokenPriceService.updateAllTokenPrices(chains);
    }

    public async getTokenPrices(chain = networkContext.chain): Promise<PrismaTokenCurrentPrice[]> {
        let tokenPrices = this.cache.get(`${TOKEN_PRICES_CACHE_KEY}:${chain}`);
        if (!tokenPrices) {
            tokenPrices = await this.tokenPriceService.getCurrentTokenPrices([chain]);
            this.cache.put(`${TOKEN_PRICES_CACHE_KEY}:${chain}`, tokenPrices, 30 * 1000);
        }
        return tokenPrices;
    }

    public async getTokenPricesForChains(chains: Chain[]): Promise<Dictionary<PrismaTokenCurrentPrice[]>> {
        const response: Dictionary<PrismaTokenCurrentPrice[]> = {};

        for (const chain of chains) {
            response[chain] = await this.getTokenPrices(chain);
        }

        return response;
    }

    public async getCurrentTokenPrices(chains: Chain[]): Promise<PrismaTokenCurrentPrice[]> {
        return this.tokenPriceService.getCurrentTokenPrices(chains);
    }

    public async getProtocolTokenPrice(chain: Chain): Promise<string> {
        const tokenPrices = await tokenService.getTokenPrices();

        if (networkContext.data.protocolToken === 'bal') {
            return tokenService.getPriceForToken(tokenPrices, networkContext.data.bal!.address, chain).toString();
        } else {
            return tokenService.getPriceForToken(tokenPrices, networkContext.data.beets!.address, chain).toString();
        }
    }

    public getPriceForToken(tokenPrices: PrismaTokenCurrentPrice[], tokenAddress: string, chain: Chain): number {
        return this.tokenPriceService.getPriceForToken(tokenPrices, tokenAddress, chain);
    }

    public async getTokenDynamicData(tokenAddress: string, chain: Chain): Promise<PrismaTokenDynamicData | null> {
        const token = await prisma.prismaToken.findUnique({
            where: {
                address_chain: {
                    address: tokenAddress.toLowerCase(),
                    chain: chain,
                },
            },
            include: {
                dynamicData: true,
            },
        });

        if (token) {
            return token.dynamicData;
        }

        return null;
    }

    public async getTokensDynamicData(tokenAddresses: string[], chain: Chain): Promise<PrismaTokenDynamicData[]> {
        const tokens = await prisma.prismaToken.findMany({
            where: {
                address: { in: tokenAddresses.map((address) => address.toLowerCase()) },
                chain: chain,
            },
            include: {
                dynamicData: true,
            },
        });

        // why doesn't this work with map??
        const dynamicData: PrismaTokenDynamicData[] = [];
        for (const token of tokens) {
            if (token.dynamicData) {
                dynamicData.push(token.dynamicData);
            }
        }

        return dynamicData;
    }

    public async getTokenPricesForRange(
        tokenAddress: string[],
        range: GqlTokenChartDataRange,
        chain: Chain,
    ): Promise<PrismaTokenPrice[]> {
        return this.tokenPriceService.getTokenPricesForRange(tokenAddress, range, chain);
    }

    public async getTokenPriceForRange(
        tokenAddress: string,
        range: GqlTokenChartDataRange,
        chain: Chain,
    ): Promise<PrismaTokenPrice[]> {
        return this.tokenPriceService.getTokenPricesForRange([tokenAddress], range, chain);
    }

    public async getRelativeDataForRange(
        tokenIn: string,
        tokenOut: string,
        range: GqlTokenChartDataRange,
        chain: Chain,
    ): Promise<TokenPriceItem[]> {
        return this.tokenPriceService.getRelativeDataForRange(tokenIn, tokenOut, range, chain);
    }

    public async getTokenPriceFrom24hAgo(chain: Chain): Promise<PrismaTokenCurrentPrice[]> {
        let tokenPrices24hAgo = this.cache.get(`${TOKEN_PRICES_24H_AGO_CACHE_KEY}:${chain}`);
        if (!tokenPrices24hAgo) {
            tokenPrices24hAgo = await this.tokenPriceService.getTokenPricesFrom24hAgo([chain]);
            this.cache.put(`${TOKEN_PRICES_24H_AGO_CACHE_KEY}:${chain}`, tokenPrices24hAgo, 60 * 15 * 1000);
        }
        return tokenPrices24hAgo;
    }

    public async purgeOldTokenPricesForAllChains() {
        return this.tokenPriceService.purgeOldTokenPricesForAllChains();
    }

    public async deleteTokenType({ tokenAddress, type }: MutationTokenDeleteTokenTypeArgs) {
        await prisma.prismaTokenType.delete({
            where: {
                tokenAddress_type_chain: {
                    tokenAddress,
                    type,
                    chain: networkContext.chain,
                },
            },
        });
    }
    public async reloadAllTokenTypes() {
        await prisma.prismaTokenType.deleteMany({
            where: { chain: networkContext.chain },
        });

        const githubContentService = new GithubContentService();
        await githubContentService.syncTokenContentData([networkContext.chain]);
    }
}

export const tokenService = new TokenService(new TokenPriceService(), new CoingeckoDataService());
