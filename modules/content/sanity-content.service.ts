import { isSameAddress } from '@balancer-labs/sdk';
import { Chain, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/prisma-client';
import {
    ConfigHomeScreen,
    ContentService,
    FeaturedPool,
    HomeScreenFeaturedPoolGroup,
    HomeScreenNewsItem,
} from './content-types';
import SanityClient from '@sanity/client';
import { env } from '../../apps/env';
import { chainToChainId as chainToIdMap } from '../network/chain-id-to-chain';

interface SanityToken {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    priority: number;
    coingeckoPlatformId?: string;
    coingeckoContractAddress?: string;
    coingeckoTokenId?: string;
    description?: string;
    websiteUrl?: string;
    twitterUsername?: string;
    discordUrl?: string;
    telegramUrl?: string;
}

const SANITY_TOKEN_TYPE_MAP: { [key: string]: string } = {
    '250': 'fantomToken',
    '4': 'rinkebyToken',
    '10': 'optimismToken',
};

export class SanityContentService implements ContentService {
    constructor(private readonly projectId = '1g2ag2hb', private readonly dataset = 'production') {}

    async syncRateProviderReviews(chains: Chain[]): Promise<void> {}

    async syncTokenContentData(chains: Chain[]): Promise<void> {
        for (const chain of chains) {
            const sanityTokens = await this.getSanityClient().fetch<SanityToken[]>(`
                *[_type=="${SANITY_TOKEN_TYPE_MAP[chainToIdMap[chain]]}"] {
                    name,
                    address,
                    symbol,
                    decimals,
                    logoURI,
                    'priority': coalesce(priority, 0),
                    coingeckoPlatformId,
                    coingeckoContractAddress,
                    coingeckoTokenId,
                    description,
                    websiteUrl,
                    twitterUsername,
                    discordUrl,
                    telegramUrl
                }
            `);

            //TODO: could be more intelligent about when to upsert
            for (const sanityToken of sanityTokens) {
                const tokenAddress = sanityToken.address.toLowerCase();
                let tokenData = {};
                if (
                    sanityToken.description ||
                    sanityToken.websiteUrl ||
                    sanityToken.discordUrl ||
                    sanityToken.telegramUrl ||
                    sanityToken.twitterUsername
                ) {
                    tokenData = {
                        description: sanityToken.description || null,
                        websiteUrl: sanityToken.websiteUrl || null,
                        discordUrl: sanityToken.discordUrl || null,
                        telegramUrl: sanityToken.telegramUrl || null,
                        twitterUsername: sanityToken.twitterUsername || null,
                    };
                }

                await prisma.prismaToken.upsert({
                    where: {
                        address_chain: { address: tokenAddress, chain: chain },
                    },
                    create: {
                        name: sanityToken.name,
                        address: tokenAddress,
                        chain: chain,
                        symbol: sanityToken.symbol,
                        decimals: sanityToken.decimals,
                        logoURI: sanityToken.logoURI,
                        priority: sanityToken.priority,
                        coingeckoPlatformId: sanityToken.coingeckoPlatformId?.toLowerCase(),
                        coingeckoContractAddress: sanityToken.coingeckoContractAddress?.toLowerCase(),
                        coingeckoTokenId: sanityToken.coingeckoTokenId?.toLowerCase(),
                        ...tokenData,
                    },
                    update: {
                        name: sanityToken.name,
                        symbol: sanityToken.symbol,
                        // if you update a field with "undefined" it will actually NOT update the field at all, need to use "null" to set to null
                        // once we remove the entry from sanity, it will use whatever was provided by coingecko as it wont update here anymore (is set to undefined)
                        logoURI: { set: sanityToken.logoURI || null },
                        decimals: sanityToken.decimals,
                        priority: sanityToken.priority,
                        coingeckoPlatformId: sanityToken.coingeckoPlatformId?.toLowerCase(),
                        coingeckoContractAddress: sanityToken.coingeckoContractAddress?.toLowerCase(),
                        coingeckoTokenId: sanityToken.coingeckoTokenId?.toLowerCase(),
                        ...tokenData,
                    },
                });
            }

            const whiteListedTokens = await prisma.prismaTokenType.findMany({
                where: {
                    type: 'WHITE_LISTED',
                    chain: chain,
                },
            });

            const addToWhitelist = sanityTokens.filter((sanityToken) => {
                return !whiteListedTokens.some((dbToken) => isSameAddress(sanityToken.address, dbToken.tokenAddress));
            });

            const removeFromWhitelist = whiteListedTokens.filter((dbToken) => {
                return !sanityTokens.some((sanityToken) => isSameAddress(dbToken.tokenAddress, sanityToken.address));
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
        const pools = await this.loadPoolData(chain);
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

    private async loadPoolData(chain: Chain) {
        return prisma.prismaPool.findMany({
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
    }

    public async getFeaturedPoolGroups(chains: Chain[]): Promise<HomeScreenFeaturedPoolGroup[]> {
        const featuredPoolGroups: HomeScreenFeaturedPoolGroup[] = [];
        for (const chain of chains) {
            const data = await this.getSanityClient().fetch<ConfigHomeScreen | null>(`
            *[_type == "homeScreen" && chainId == ${chainToIdMap[chain]}][0]{
                ...,
                "featuredPoolGroups": featuredPoolGroups[]{
                    ...,
                    "icon": icon.asset->url + "?w=64",
                    "items": items[]{
                        ...,
                        "image": image.asset->url + "?w=600"
                    }
                },
                "newsItems": newsItems[]{
                    ...,
                    "image": image.asset->url + "?w=800"
                }
            }
        `);
            if (data) {
                featuredPoolGroups.push(...data.featuredPoolGroups);
            }
        }
        return featuredPoolGroups;
    }

    public async getFeaturedPools(chains: Chain[]): Promise<FeaturedPool[]> {
        const featuredPools: FeaturedPool[] = [];
        for (const chain of chains) {
            const data = await this.getSanityClient().fetch<ConfigHomeScreen | null>(`
            *[_type == "homeScreen" && chainId == ${chainToIdMap[chain]}][0]{
                ...,
                "featuredPoolGroups": featuredPoolGroups[]{
                    ...,
                    "icon": icon.asset->url + "?w=64",
                    "items": items[]{
                        ...,
                        "image": image.asset->url + "?w=600"
                    }
                },
                "newsItems": newsItems[]{
                    ...,
                    "image": image.asset->url + "?w=800"
                }
            }
        `);
            if (data) {
                const featuredPoolGroupItems = data.featuredPoolGroups.find(
                    (group) => group.id === 'popular-pools',
                )?.items;
                if (featuredPoolGroupItems) {
                    for (let i = 0; i < featuredPoolGroupItems.length; i++) {
                        const group = featuredPoolGroupItems[i];
                        if (group._type === 'homeScreenFeaturedPoolGroupPoolId') {
                            featuredPools.push({
                                poolId: group.poolId,
                                primary: i === 0 ? true : false,
                                chain: chain,
                                description: '',
                            });
                        }
                    }
                }
            }
        }
        return featuredPools;
    }

    public async getNewsItems(chain: Chain): Promise<HomeScreenNewsItem[]> {
        const data = await this.getSanityClient().fetch<ConfigHomeScreen | null>(`
    *[_type == "homeScreen" && chainId == ${chainToIdMap[chain]}][0]{
        ...,
        "featuredPoolGroups": featuredPoolGroups[]{
            ...,
            "icon": icon.asset->url + "?w=64",
            "items": items[]{
                ...,
                "image": image.asset->url + "?w=600"
            }
        },
        "newsItems": newsItems[]{
            ...,
            "image": image.asset->url + "?w=800"
        }
    }
`);

        if (data?.newsItems) {
            return data.newsItems;
        }
        throw new Error(`No news items found for chain id ${chain}`);
    }

    private getSanityClient() {
        return SanityClient({
            projectId: this.projectId,
            dataset: this.dataset,
            apiVersion: '2021-12-15',
            token: env.SANITY_API_TOKEN,
            useCdn: false,
        });
    }
}
