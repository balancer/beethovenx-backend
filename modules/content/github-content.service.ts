import { isSameAddress } from '@balancer-labs/sdk';
import axios from 'axios';
import { prisma } from '../../prisma/prisma-client';
import { ContentService, FeaturedPool, HomeScreenFeaturedPoolGroup, HomeScreenNewsItem } from './content-types';
import { chainIdToChain, chainToChainId as chainToIdMap } from '../network/chain-id-to-chain';
import { Chain, Prisma } from '@prisma/client';

const POOLS_METADATA_URL = 'https://raw.githubusercontent.com/balancer/metadata/main/pools/featured.json';

const TOKEN_LIST_URL = 'https://raw.githubusercontent.com/balancer/tokenlists/main/generated/balancer.tokenlist.json';

const RATEPROVIDER_REVIEW_URL =
    'https://raw.githubusercontent.com/balancer/code-review/main/rate-providers/registry.json';

const RATEPROVIDER_BASE_URL = 'https://raw.githubusercontent.com/balancer/code-review/main/rate-providers/';

interface FeaturedPoolMetadata {
    id: string;
    imageUrl: string;
    primary: boolean;
    chainId: number;
    description: string;
}
interface WhitelistedTokenList {
    name: string;
    timestamp: string;
    tokens: WhitelistedToken[];
}

interface WhitelistedToken {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    extensions?: {
        coingeckoId?: string;
    };
}

interface RateProviderReview {
    [chain: string]: {
        [rateproviderAddress: string]: {
            name: string;
            asset: string;
            summary: string;
            review: string;
            warnings: string[];
            factory: string;
            upgradeableComponents: {
                entrypoint: string;
                implementationReviewed: string;
            }[];
        };
    };
}

export class GithubContentService implements ContentService {
    async syncTokenContentData(chains: Chain[]): Promise<void> {
        const { data: githubAllTokenList } = await axios.get<WhitelistedTokenList>(TOKEN_LIST_URL);

        for (const chain of chains) {
            const filteredTokenList = githubAllTokenList.tokens.filter((token) => {
                if (`${token.chainId}` !== chainToIdMap[chain]) {
                    return false;
                }

                const requiredKeys = ['chainId', 'address', 'name', 'symbol', 'decimals'];
                return requiredKeys.every((key) => token?.[key as keyof WhitelistedToken] != null);
            });

            for (const githubToken of filteredTokenList) {
                const tokenAddress = githubToken.address.toLowerCase();

                await prisma.prismaToken.upsert({
                    where: {
                        address_chain: { address: tokenAddress, chain: chain },
                    },
                    create: {
                        name: githubToken.name.replace(/[\x00]/g, ''),
                        address: tokenAddress,
                        chain: chainIdToChain[githubToken.chainId],
                        symbol: githubToken.symbol.replace(/[\x00]/g, ''),
                        decimals: githubToken.decimals,
                        logoURI: githubToken.logoURI,
                        coingeckoTokenId: githubToken.extensions?.coingeckoId,
                        coingeckoPlatformId: null,
                        coingeckoContractAddress: null,
                        description: null,
                        websiteUrl: null,
                        discordUrl: null,
                        telegramUrl: null,
                        twitterUsername: null,
                    },
                    update: {
                        name: githubToken.name.replace(/[\x00]/g, ''),
                        address: tokenAddress,
                        chain: chainIdToChain[githubToken.chainId],
                        symbol: githubToken.symbol.replace(/[\x00]/g, ''),
                        decimals: githubToken.decimals,
                        logoURI: githubToken.logoURI,
                        coingeckoTokenId: githubToken.extensions?.coingeckoId,
                        // coingeckoPlatformId: null,
                        // coingeckoContractAddress: null,
                        // description: null,
                        // websiteUrl: null,
                        // discordUrl: null,
                        // telegramUrl: null,
                        // twitterUsername: null,
                    },
                });
            }

            const whiteListedTokens = await prisma.prismaTokenType.findMany({
                where: {
                    type: 'WHITE_LISTED',
                    chain: chain,
                },
            });

            const addToWhitelist = filteredTokenList.filter((githubToken) => {
                return !whiteListedTokens.some((dbToken) => isSameAddress(githubToken.address, dbToken.tokenAddress));
            });

            const removeFromWhitelist = whiteListedTokens.filter((dbToken) => {
                return !filteredTokenList.some((githubToken) =>
                    isSameAddress(dbToken.tokenAddress, githubToken.address),
                );
            });

            await prisma.prismaTokenType.createMany({
                data: addToWhitelist.map((token) => ({
                    id: `${token.address}-white-listed`,
                    chain: chain,
                    tokenAddress: token.address.toLowerCase(),
                    type: 'WHITE_LISTED' as const,
                })),
                skipDuplicates: true,
            });

            await prisma.prismaTokenType.deleteMany({
                where: { id: { in: removeFromWhitelist.map((token) => token.id) }, chain: chain },
            });

            await this.syncTokenTypes(chain);
        }
    }

    private async syncTokenTypes(chain: Chain) {
        const pools = await prisma.prismaPool.findMany({
            where: { chain: chain },
            select: {
                address: true,
                symbol: true,
                name: true,
                type: true,
                typeData: true,
                tokens: { orderBy: { index: 'asc' } },
            },
        });
        const tokens = await prisma.prismaToken.findMany({
            include: { types: true },
            where: { chain: chain },
        });
        const types: Prisma.PrismaTokenTypeCreateManyInput[] = [];

        for (const token of tokens) {
            const tokenTypes = token.types.map((tokenType) => tokenType.type);
            const pool = pools.find((pool) => pool.address === token.address);

            if (pool && !tokenTypes.includes('BPT')) {
                types.push({
                    id: `${token.address}-bpt`,
                    chain: chain,
                    type: 'BPT',
                    tokenAddress: token.address,
                });
            }

            if (pool?.type === 'COMPOSABLE_STABLE' && !tokenTypes.includes('PHANTOM_BPT')) {
                types.push({
                    id: `${token.address}-phantom-bpt`,
                    chain: chain,
                    type: 'PHANTOM_BPT',
                    tokenAddress: token.address,
                });
            }
        }

        await prisma.prismaTokenType.createMany({ skipDuplicates: true, data: types });
    }

    async syncPoolContentData(chain: Chain): Promise<void> {}

    async getFeaturedPoolGroups(chains: Chain[]): Promise<HomeScreenFeaturedPoolGroup[]> {
        return [];
    }

    async getFeaturedPools(chains: Chain[]): Promise<FeaturedPool[]> {
        const { data } = await axios.get<FeaturedPoolMetadata[]>(POOLS_METADATA_URL);
        const pools = data.filter((pool) => chains.includes(chainIdToChain[pool.chainId]));
        return pools.map(({ id, primary, chainId, description }) => ({
            poolId: id,
            chain: chainIdToChain[chainId],
            primary: Boolean(primary),
            description: description,
        })) as FeaturedPool[];
    }

    async getNewsItems(chain: Chain): Promise<HomeScreenNewsItem[]> {
        return [];
    }
}
