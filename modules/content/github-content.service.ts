import { addressesMatch } from '../web3/addresses';
import axios from 'axios';
import { prisma } from '../../prisma/prisma-client';
import { ContentService, FeaturedPool, HomeScreenFeaturedPoolGroup, HomeScreenNewsItem } from './content-types';
import { chainIdToChain, chainToChainId as chainToIdMap } from '../network/chain-id-to-chain';
import { Chain, Prisma, PrismaTokenType, PrismaTokenTypeOption } from '@prisma/client';

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
        const {
            data: { tokens },
        } = await axios.get<WhitelistedTokenList>(TOKEN_LIST_URL);

        // Validate results
        const requiredKeys = ['chainId', 'address', 'name', 'symbol', 'decimals'];
        const chainIds = chains.map((chain) => Number(chainToIdMap[chain]));
        const upsertTokens = tokens
            .filter(
                (token) =>
                    requiredKeys.every((key) => token?.[key as keyof WhitelistedToken] != null) &&
                    chainIds.includes(token.chainId),
            )
            .map((token) => ({
                address: token.address.toLowerCase(),
                chain: chainIdToChain[token.chainId],
                name: token.name.replace(/[\x00]/g, ''),
                symbol: token.symbol.replace(/[\x00]/g, ''),
                decimals: token.decimals,
                logoURI: token.logoURI,
                coingeckoTokenId: token.extensions?.coingeckoId,
                types: {
                    connectOrCreate: {
                        where: {
                            tokenAddress_type_chain: {
                                tokenAddress: token.address.toLowerCase(),
                                type: PrismaTokenTypeOption.WHITE_LISTED,
                                chain: chainIdToChain[token.chainId],
                            },
                        },
                        create: {
                            id: `${token.address.toLowerCase()}-white-listed`,
                            type: PrismaTokenTypeOption.WHITE_LISTED,
                        },
                    },
                },
            }));

        const upserts = upsertTokens.map((token) =>
            prisma.prismaToken.upsert({
                where: {
                    address_chain: { address: token.address, chain: token.chain },
                },
                create: token,
                update: token,
            }),
        );

        await prisma.$transaction(upserts);

        // Fetch whitelisted tokens
        const whitelistedTokens = await prisma.prismaTokenType.findMany({
            select: { id: true, tokenAddress: true, chain: true },
            where: { type: PrismaTokenTypeOption.WHITE_LISTED },
        });

        // Remove tokens that are no longer whitelisted used to find tokens removed from github
        const githubWhitelistMap = upsertTokens.reduce((acc, token) => {
            acc[`${token.address}-${token.chain}`] = true;
            return acc;
        }, {} as Record<string, boolean>);

        const removeFromWhitelist = whitelistedTokens
            .filter((token) => githubWhitelistMap[`${token.tokenAddress}-${token.chain}`] == null)
            .reduce((acc, token) => {
                if (acc[token.chain]) {
                    acc[token.chain].push(token);
                } else {
                    acc[token.chain] = [token];
                }
                return acc;
            }, {} as Record<Chain, { id: string; chain: Chain }[]>);

        for (const [chain, tokens] of Object.entries(removeFromWhitelist)) {
            await prisma.prismaTokenType.deleteMany({
                where: { id: { in: tokens.map((token) => token.id) }, chain: chain as Chain },
            });
        }

        // TODO: This should be removed and moved to pool creation, it doesn't ever change
        for (const chain of chains) {
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
            where: {
                chain: chain,
                address: {
                    in: pools.map((pool) => pool.address),
                },
            },
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
