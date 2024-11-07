import {
    PrismaNestedPoolWithSingleLayerNesting,
    prismaPoolMinimal,
    PrismaPoolMinimal,
    PrismaPoolTokenWithDynamicData,
    PrismaPoolTokenWithExpandedNesting,
    prismaPoolWithExpandedNesting,
    PrismaPoolWithExpandedNesting,
} from '../../../prisma/prisma-types';
import {
    GqlBalancePoolAprItem,
    GqlBalancePoolAprSubItem,
    GqlPoolDynamicData,
    GqlPoolFeaturedPoolGroup,
    GqlPoolFeaturedPool,
    GqlPoolInvestConfig,
    GqlPoolInvestOption,
    GqlPoolMinimal,
    GqlPoolNestingType,
    GqlPoolComposableStableNested,
    GqlPoolStaking,
    GqlPoolToken,
    GqlPoolTokenDisplay,
    GqlPoolTokenExpanded,
    GqlPoolTokenUnion,
    GqlPoolUnion,
    GqlPoolUserBalance,
    GqlPoolWithdrawConfig,
    GqlPoolWithdrawOption,
    QueryPoolGetPoolsArgs,
    GqlPoolTokenDetail,
    GqlNestedPool,
    GqlPoolAprItem,
    GqlPoolAprItemType,
    GqlUserStakedBalance,
    GqlPoolFilterCategory,
    HookData,
    GqlPoolAggregator,
    LiquidityManagement,
    Hook,
} from '../../../schema';
import { isSameAddress } from '@balancer-labs/sdk';
import _ from 'lodash';
import { prisma } from '../../../prisma/prisma-client';
import { Chain, Prisma, PrismaPoolAprType, PrismaUserStakedBalance, PrismaUserWalletBalance } from '@prisma/client';
import { isWeightedPoolV2 } from './pool-utils';
import { networkContext } from '../../network/network-context.service';
import { fixedNumber } from '../../view-helpers/fixed-number';
import { BeethovenChainIds, chainToIdMap } from '../../network/network-config';
import { GithubContentService } from '../../content/github-content.service';
import { SanityContentService } from '../../content/sanity-content.service';
import { ElementData, FxData, GyroData, StableData } from '../subgraph-mapper';
import { ZERO_ADDRESS } from '@balancer/sdk';
import { tokenService } from '../../token/token.service';
import { p } from 'msw/lib/glossary-dc3fd077';

const isToken = (text: string) => text.match(/^0x[0-9a-fA-F]{40}$/);
const isPoolId = (text: string) => isToken(text) || text.match(/^0x[0-9a-fA-F]{64}$/);

export class PoolGqlLoaderService {
    public async getPool(id: string, chain: Chain, userAddress?: string): Promise<GqlPoolUnion> {
        let pool = undefined;
        pool = await prisma.prismaPool.findUnique({
            where: { id_chain: { id, chain: chain } },
            include: {
                ...this.getPoolInclude(userAddress),
            },
        });

        if (!pool) {
            throw new Error('Pool with id does not exist');
        }

        if (pool.type === 'UNKNOWN') {
            throw new Error('Pool exists, but has an unknown type');
        }

        const mappedPool = this.mapPoolToGqlPool(
            pool,
            pool.userWalletBalances,
            userAddress ? pool.staking.map((staking) => staking.userStakedBalances).flat() : [],
        );

        // load rate provider data into PoolTokenDetail model
        await this.enrichWithRateproviderData(mappedPool);

        // load underlying token info into PoolTokenDetail and GqlPoolTokenDisplay
        await this.enrichWithErc4626Data(mappedPool);

        return mappedPool;
    }

    private async enrichWithErc4626Data(mappedPool: GqlPoolUnion | GqlPoolAggregator) {
        for (const token of mappedPool.poolTokens) {
            if (token.isErc4626) {
                const prismaToken = await prisma.prismaToken.findUnique({
                    where: { address_chain: { address: token.address, chain: mappedPool.chain } },
                });
                if (prismaToken?.underlyingTokenAddress) {
                    const underlyingTokenDefinition = await tokenService.getTokenDefinition(
                        prismaToken.underlyingTokenAddress,
                        mappedPool.chain,
                    );
                    token.underlyingToken = underlyingTokenDefinition;
                    if ((mappedPool as GqlPoolUnion).displayTokens) {
                        (mappedPool as GqlPoolUnion).displayTokens.push();
                    }
                }

                const erc4626ReviewData = await prisma.prismaErc4626ReviewData.findUnique({
                    where: {
                        chain_erc4626Address: {
                            chain: mappedPool.chain,
                            erc4626Address: token.address,
                        },
                    },
                });
                if (erc4626ReviewData) {
                    token.erc4626ReviewData = {
                        ...erc4626ReviewData,
                        warnings: erc4626ReviewData.warnings?.split(',') || [],
                    };
                }
            }

            if (token.hasNestedPool) {
                for (const nestedToken of token.nestedPool!.tokens) {
                    if (nestedToken.isErc4626) {
                        const prismaToken = await prisma.prismaToken.findUnique({
                            where: { address_chain: { address: nestedToken.address, chain: mappedPool.chain } },
                        });
                        if (prismaToken?.underlyingTokenAddress) {
                            const tokenDefinition = await tokenService.getTokenDefinition(
                                prismaToken.underlyingTokenAddress,
                                mappedPool.chain,
                            );
                            nestedToken.underlyingToken = tokenDefinition;
                        }

                        const erc4626ReviewData = await prisma.prismaErc4626ReviewData.findUnique({
                            where: {
                                chain_erc4626Address: {
                                    chain: mappedPool.chain,
                                    erc4626Address: nestedToken.address,
                                },
                            },
                        });
                        if (erc4626ReviewData) {
                            nestedToken.erc4626ReviewData = {
                                ...erc4626ReviewData,
                                warnings: erc4626ReviewData.warnings?.split(',') || [],
                            };
                        }
                    }
                }
            }
        }
    }

    private async enrichWithRateproviderData(mappedPool: GqlPoolUnion | GqlPoolAggregator) {
        for (const token of mappedPool.poolTokens) {
            if (token.priceRateProvider && token.priceRateProvider !== ZERO_ADDRESS) {
                const rateproviderData = await prisma.prismaPriceRateProviderData.findUnique({
                    where: {
                        chain_rateProviderAddress: {
                            chain: mappedPool.chain,
                            rateProviderAddress: token.priceRateProvider,
                        },
                    },
                });
                if (rateproviderData) {
                    token.priceRateProviderData = {
                        ...rateproviderData,
                        warnings: rateproviderData.warnings?.split(',') || [],
                        upgradeableComponents:
                            (rateproviderData.upgradableComponents as {
                                implementationReviewed: string;
                                entryPoint: string;
                            }[]) || [],
                        address: rateproviderData.rateProviderAddress,
                        reviewFile: rateproviderData.reviewUrl,
                    };
                }
            }
            if (token.hasNestedPool) {
                for (const nestedToken of token.nestedPool!.tokens) {
                    if (nestedToken.priceRateProvider && nestedToken.priceRateProvider !== ZERO_ADDRESS) {
                        const rateproviderData = await prisma.prismaPriceRateProviderData.findUnique({
                            where: {
                                chain_rateProviderAddress: {
                                    chain: mappedPool.chain,
                                    rateProviderAddress: nestedToken.priceRateProvider,
                                },
                            },
                        });
                        if (rateproviderData) {
                            nestedToken.priceRateProviderData = {
                                ...rateproviderData,
                                warnings: rateproviderData.warnings?.split(',') || [],
                                upgradeableComponents:
                                    (rateproviderData.upgradableComponents as {
                                        implementationReviewed: string;
                                        entryPoint: string;
                                    }[]) || [],
                                address: rateproviderData.rateProviderAddress,
                            };
                        }
                    }
                }
            }
        }
    }

    public async getAggregatorPools(args: QueryPoolGetPoolsArgs): Promise<GqlPoolAggregator[]> {
        // add limits per default
        args.first = args.first || 1000;
        args.skip = args.skip || 0;

        const pools = await prisma.prismaPool.findMany({
            ...this.mapQueryArgsToPoolQuery(args),
            where: {
                ...this.mapQueryArgsToPoolQuery(args).where,
                dynamicData: {
                    swapEnabled: true,
                    isPaused: false,
                    isInRecoveryMode: false,
                },
            },
            include: {
                ...this.getPoolInclude(),
            },
        });
        const gqlPools = pools.map((pool) => this.mapPoolToAggregatorPool(pool));

        for (const mappedPool of gqlPools) {
            // load rate provider data into PoolTokenDetail model
            await this.enrichWithRateproviderData(mappedPool);

            // load underlying token info into PoolTokenDetail and GqlPoolTokenDisplay
            await this.enrichWithErc4626Data(mappedPool);
        }

        return gqlPools;
    }

    public async getPools(args: QueryPoolGetPoolsArgs): Promise<GqlPoolMinimal[]> {
        // only include wallet and staked balances if the query requests it
        // this makes sure that we don't load ALL user balances when we don't filter on userAddress
        // need to support ordering and paging by userbalanceUsd. Need to take care of that here, as the DB does not (and should not) store the usd balance
        if (args.where?.userAddress) {
            const first = args.first;
            const skip = args.skip ? args.skip : 0;
            if (args.orderBy === 'userbalanceUsd') {
                // we need to retrieve all pools, regardless of paging request as we can't page on a DB level because there is no balance usd stored
                args.first = undefined;
                args.skip = undefined;
            }
            // const includeQuery = args.where.userAddress ? prismaPoolMinimal.include.staking.include.
            const pools = await prisma.prismaPool.findMany({
                ...this.mapQueryArgsToPoolQuery(args),
                include: {
                    ...this.getPoolInclude(args.where.userAddress),
                },
            });

            const gqlPools = pools.map((pool) =>
                this.mapToMinimalGqlPool(
                    pool,
                    pool.userWalletBalances,
                    pool.staking.map((staking) => staking.userStakedBalances).flat(),
                ),
            );

            if (args.orderBy === 'userbalanceUsd') {
                let sortedPools = [];
                if (args.orderDirection === 'asc') {
                    sortedPools = gqlPools.sort(
                        (a, b) => a.userBalance!.totalBalanceUsd - b.userBalance!.totalBalanceUsd,
                    );
                } else {
                    sortedPools = gqlPools.sort(
                        (a, b) => b.userBalance!.totalBalanceUsd - a.userBalance!.totalBalanceUsd,
                    );
                }
                return first ? sortedPools.slice(skip, skip + first) : sortedPools.slice(skip, undefined);
            }

            return gqlPools;
        }

        const pools = await prisma.prismaPool.findMany({
            ...this.mapQueryArgsToPoolQuery(args),
            include: prismaPoolMinimal.include,
        });

        return pools.map((pool) => this.mapToMinimalGqlPool(pool));
    }

    public mapToMinimalGqlPool(
        pool: PrismaPoolMinimal,
        userWalletbalances: PrismaUserWalletBalance[] = [],
        userStakedBalances: PrismaUserStakedBalance[] = [],
    ): GqlPoolMinimal {
        return {
            ...pool,
            liquidityManagement: (pool.liquidityManagement as LiquidityManagement) || undefined,
            hook: this.mapHookData(pool),
            incentivized: pool.categories.some((category) => category === 'INCENTIVIZED'),
            vaultVersion: pool.protocolVersion,
            decimals: 18,
            dynamicData: this.getPoolDynamicData(pool),
            allTokens: this.mapAllTokens(pool),
            displayTokens: this.mapDisplayTokens(pool),
            staking: this.getStakingData(pool),
            userBalance: this.getUserBalance(pool, userWalletbalances, userStakedBalances),
            categories: pool.categories as GqlPoolFilterCategory[],
            tags: pool.categories,
            hasErc4626: pool.allTokens.some((token) => token.token.types.some((type) => type.type === 'ERC4626')),
            hasNestedErc4626: pool.allTokens.some((token) =>
                token.nestedPool?.allTokens.some((token) => token.token.types.some((type) => type.type === 'ERC4626')),
            ),
        };
    }

    public async getPoolsCount(args: QueryPoolGetPoolsArgs): Promise<number> {
        return prisma.prismaPool.count({ where: this.mapQueryArgsToPoolQuery(args).where });
    }

    public async getFeaturedPoolGroups(chains: Chain[]): Promise<GqlPoolFeaturedPoolGroup[]> {
        const featuredPoolGroups = [];
        if (chains.some((chain) => BeethovenChainIds.includes(chainToIdMap[chain]))) {
            const sanityContentService = new SanityContentService();
            featuredPoolGroups.push(...(await sanityContentService.getFeaturedPoolGroups(chains)));
        }
        const poolIds = featuredPoolGroups
            .map((group) =>
                group.items
                    .filter((item) => item._type === 'homeScreenFeaturedPoolGroupPoolId')
                    .map((item) => (item._type === 'homeScreenFeaturedPoolGroupPoolId' ? item.poolId : '')),
            )
            .flat();

        const pools = await this.getPools({ where: { idIn: poolIds } });

        return featuredPoolGroups.map((group) => {
            return {
                ...group,
                items: group.items
                    //filter out any invalid pool ids
                    .filter((item) => {
                        if (item._type === 'homeScreenFeaturedPoolGroupPoolId') {
                            return !!pools.find((pool) => pool.id === item.poolId);
                        }

                        return true;
                    })
                    .map((item) => {
                        if (item._type === 'homeScreenFeaturedPoolGroupPoolId') {
                            const pool = pools.find((pool) => pool.id === item.poolId);

                            return { __typename: 'GqlPoolMinimal', ...pool! };
                        } else {
                            return { __typename: 'GqlFeaturePoolGroupItemExternalLink', ...item };
                        }
                    }),
            };
        });
    }

    public async getFeaturedPools(chains: Chain[]): Promise<GqlPoolFeaturedPool[]> {
        const githubContentService = new GithubContentService();
        const featuredPoolsFromService = await githubContentService.getFeaturedPools(chains);

        const featuredPools: GqlPoolFeaturedPool[] = [];

        for (const contentPool of featuredPoolsFromService) {
            const pool = await this.getPool(contentPool.poolId.toLowerCase(), contentPool.chain);
            featuredPools.push({
                poolId: contentPool.poolId,
                primary: contentPool.primary,
                pool: pool,
                description: contentPool.description,
            });
        }

        return featuredPools;
    }

    private mapQueryArgsToPoolQuery(args: QueryPoolGetPoolsArgs): Prisma.PrismaPoolFindManyArgs {
        let orderBy: Prisma.PrismaPoolOrderByWithRelationInput = {};
        const orderDirection = args.orderDirection || 'desc';
        const userAddress = args.where?.userAddress;

        switch (args.orderBy) {
            case 'totalLiquidity':
                orderBy = { dynamicData: { totalLiquidity: orderDirection } };
                break;
            case 'totalShares':
                orderBy = { dynamicData: { totalSharesNum: orderDirection } };
                break;
            case 'volume24h':
                orderBy = { dynamicData: { volume24h: orderDirection } };
                break;
            case 'fees24h':
                orderBy = { dynamicData: { fees24h: orderDirection } };
                break;
            case 'apr':
                orderBy = { dynamicData: { apr: orderDirection } };
                break;
        }

        const baseQuery: Prisma.PrismaPoolFindManyArgs = {
            take: args.first || undefined,
            skip: args.skip || undefined,
            orderBy,
        };

        if (!args.where && !args.textSearch) {
            return {
                ...baseQuery,
                where: {
                    NOT: {
                        categories: {
                            has: 'BLACK_LISTED',
                        },
                    },
                    dynamicData: {
                        totalSharesNum: {
                            gt: 0.000000000001,
                        },
                    },
                },
            };
        }

        const where = args.where || {};
        let textSearch: Prisma.StringFilter | undefined;
        if (args.textSearch && isPoolId(args.textSearch)) {
            where.idIn = [args.textSearch];
        } else if (args.textSearch) {
            textSearch = { contains: args.textSearch, mode: 'insensitive' as const };
        }

        const allTokensFilter = [];
        where?.tokensIn?.forEach((token) => {
            allTokensFilter.push({
                allTokens: {
                    some: {
                        token: {
                            address: {
                                equals: token.toLowerCase(),
                            },
                        },
                    },
                },
            });
        });

        if (where?.tokensNotIn) {
            allTokensFilter.push({
                allTokens: {
                    every: {
                        token: {
                            address: {
                                notIn: where.tokensNotIn.map((t) => t.toLowerCase()) || undefined,
                            },
                        },
                    },
                },
            });
        }

        const userArgs: Prisma.PrismaPoolWhereInput = userAddress
            ? {
                  OR: [
                      {
                          userWalletBalances: {
                              some: {
                                  userAddress: {
                                      equals: userAddress.toLowerCase(),
                                  },
                                  balanceNum: { gt: 0 },
                              },
                          },
                      },
                      {
                          userStakedBalances: {
                              some: {
                                  userAddress: {
                                      equals: userAddress.toLowerCase(),
                                  },
                                  balanceNum: { gt: 0 },
                              },
                          },
                      },
                  ],
              }
            : {};

        const filterArgs: Prisma.PrismaPoolWhereInput = {
            dynamicData: {
                totalSharesNum: {
                    gt: 0.000000000001,
                },
                totalLiquidity: {
                    gt: where?.minTvl || undefined,
                },
            },
            chain: {
                in: where?.chainIn || undefined,
                notIn: where?.chainNotIn || undefined,
            },
            protocolVersion: {
                in: where?.protocolVersionIn || undefined,
            },
            type: {
                in: where?.poolTypeIn || undefined,
                notIn: where?.poolTypeNotIn || undefined,
            },
            createTime: {
                gt: where?.createTime?.gt || undefined,
                lt: where?.createTime?.lt || undefined,
            },
            AND: allTokensFilter,
            id: {
                in: where?.idIn?.map((id) => id.toLowerCase()) || undefined,
                notIn: where?.idNotIn?.map((id) => id.toLowerCase()) || undefined,
            },
            ...(where?.categoryIn && !where?.tagIn
                ? { categories: { hasSome: where.categoryIn.map((s) => s.toUpperCase()) } }
                : {}),
            ...(where?.categoryNotIn && !where?.tagNotIn
                ? { NOT: { categories: { hasSome: where.categoryNotIn.map((s) => s.toUpperCase()) } } }
                : {}),
            ...(where?.tagIn && !where?.categoryIn
                ? { categories: { hasSome: where.tagIn.map((s) => s.toUpperCase()) } }
                : {}),
            ...(where?.tagNotIn && !where?.categoryNotIn
                ? { NOT: { categories: { hasSome: where.tagNotIn.map((s) => s.toUpperCase()) } } }
                : {}),
            filters: {
                ...(where?.filterNotIn
                    ? {
                          every: {
                              filterId: {
                                  notIn: where.filterNotIn,
                              },
                          },
                      }
                    : {}),
                ...(where?.filterIn
                    ? {
                          some: {
                              filterId: {
                                  in: where.filterIn,
                              },
                          },
                      }
                    : {}),
            },
            ...(where?.hasHook !== undefined && where.hasHook
                ? { hookId: { not: null } }
                : where?.hasHook !== undefined && !where.hasHook
                ? { hookId: null }
                : {}),
        };

        if (!textSearch) {
            return {
                ...baseQuery,
                where: {
                    ...filterArgs,
                    ...userArgs,
                },
            };
        }

        return {
            ...baseQuery,
            where: {
                OR: [
                    { name: textSearch, ...filterArgs, ...userArgs },
                    { symbol: textSearch, ...filterArgs, ...userArgs },
                    {
                        ...filterArgs,
                        ...userArgs,
                        allTokens: {
                            some: {
                                OR: [
                                    {
                                        token: {
                                            name: textSearch,
                                            address: filterArgs.allTokens?.some?.token?.address,
                                        },
                                    },
                                    {
                                        token: {
                                            symbol: textSearch,
                                            address: filterArgs.allTokens?.some?.token?.address,
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
        };
    }

    private mapPoolToAggregatorPool(pool: PrismaPoolWithExpandedNesting): GqlPoolAggregator {
        const { typeData, ...poolWithoutTypeData } = pool;

        const mappedData = {
            decimals: 18,
            dynamicData: this.getPoolDynamicData(pool),
            poolTokens: pool.tokens.map((token) => this.mapPoolToken(token, token.nestedPool !== null)),
            vaultVersion: poolWithoutTypeData.protocolVersion,
            liquidityManagement: (pool.liquidityManagement as LiquidityManagement) || undefined,
            hook: this.mapHookData(pool),
        };

        switch (pool.type) {
            case 'STABLE':
                return {
                    ...poolWithoutTypeData,
                    ...(typeData as StableData),
                    ...mappedData,
                };
            case 'META_STABLE':
                return {
                    ...poolWithoutTypeData,
                    ...(typeData as StableData),
                    ...mappedData,
                };
            case 'COMPOSABLE_STABLE':
                return {
                    ...poolWithoutTypeData,
                    ...(typeData as StableData),
                    ...mappedData,
                    // bptPriceRate: bpt?.dynamicData?.priceRate || '1.0',
                };
            case 'ELEMENT':
                return {
                    ...poolWithoutTypeData,
                    ...(typeData as ElementData),
                    ...mappedData,
                };
            case 'LIQUIDITY_BOOTSTRAPPING':
                return {
                    ...poolWithoutTypeData,
                    ...mappedData,
                };
            case 'GYRO':
            case 'GYRO3':
            case 'GYROE':
                return {
                    ...poolWithoutTypeData,
                    ...(typeData as GyroData),
                    ...mappedData,
                };
            case 'FX':
                return {
                    ...poolWithoutTypeData,
                    ...mappedData,
                    ...(typeData as FxData),
                };
        }

        return {
            ...poolWithoutTypeData,
            ...mappedData,
        };
    }

    private mapPoolToGqlPool(
        pool: PrismaPoolWithExpandedNesting,
        userWalletbalances: PrismaUserWalletBalance[] = [],
        userStakedBalances: PrismaUserStakedBalance[] = [],
    ): GqlPoolUnion {
        const { typeData, ...poolWithoutTypeData } = pool;

        const mappedData = {
            decimals: 18,
            staking: this.getStakingData(pool),
            dynamicData: this.getPoolDynamicData(pool),
            investConfig: this.getPoolInvestConfig(pool), // TODO DEPRECATE
            withdrawConfig: this.getPoolWithdrawConfig(pool), // TODO DEPRECATE
            nestingType: this.getPoolNestingType(pool),
            tokens: pool.tokens.map((token) => this.mapPoolTokenToGqlUnion(token)), // TODO DEPRECATE
            allTokens: this.mapAllTokens(pool),
            displayTokens: this.mapDisplayTokens(pool),
            poolTokens: pool.tokens.map((token) => this.mapPoolToken(token, token.nestedPool !== null)),
            userBalance: this.getUserBalance(pool, userWalletbalances, userStakedBalances),
            vaultVersion: poolWithoutTypeData.protocolVersion,
            categories: pool.categories as GqlPoolFilterCategory[],
            tags: pool.categories,
            hook: this.mapHookData(pool),
            liquidityManagement: (pool.liquidityManagement as LiquidityManagement) || undefined,
            hasErc4626: pool.allTokens.some((token) => token.token.types.some((type) => type.type === 'ERC4626')),
            hasNestedErc4626: pool.allTokens.some((token) =>
                token.nestedPool?.allTokens.some((token) => token.token.types.some((type) => type.type === 'ERC4626')),
            ),
        };

        //TODO: may need to build out the types here still
        switch (pool.type) {
            case 'STABLE':
                return {
                    __typename: 'GqlPoolStable',
                    ...poolWithoutTypeData,
                    ...(typeData as StableData),
                    ...mappedData,
                    tokens: mappedData.tokens as GqlPoolToken[],
                };
            case 'META_STABLE':
                return {
                    __typename: 'GqlPoolMetaStable',
                    ...poolWithoutTypeData,
                    ...(typeData as StableData),
                    ...mappedData,
                    tokens: mappedData.tokens as GqlPoolToken[],
                };
            case 'COMPOSABLE_STABLE':
                return {
                    __typename: 'GqlPoolComposableStable',
                    ...poolWithoutTypeData,
                    ...(typeData as StableData),
                    ...mappedData,
                };
            case 'ELEMENT':
                return {
                    __typename: 'GqlPoolElement',
                    ...poolWithoutTypeData,
                    ...(typeData as ElementData),
                    ...mappedData,
                    tokens: mappedData.tokens as GqlPoolToken[],
                };
            case 'LIQUIDITY_BOOTSTRAPPING':
                return {
                    __typename: 'GqlPoolLiquidityBootstrapping',
                    ...poolWithoutTypeData,
                    ...mappedData,
                };
            case 'GYRO':
            case 'GYRO3':
            case 'GYROE':
                return {
                    __typename: 'GqlPoolGyro',
                    ...poolWithoutTypeData,
                    ...(typeData as GyroData),
                    ...mappedData,
                };
            case 'FX':
                return {
                    __typename: 'GqlPoolFx',
                    ...poolWithoutTypeData,
                    ...mappedData,
                    ...(typeData as FxData),
                };
        }

        return {
            __typename: 'GqlPoolWeighted',
            ...poolWithoutTypeData,
            ...mappedData,
        };
    }

    private mapAllTokens(pool: PrismaPoolMinimal): GqlPoolTokenExpanded[] {
        return pool.allTokens.map((token) => {
            const poolToken = pool.tokens.find((poolToken) => poolToken.address === token.token.address);
            const isNested = !poolToken;
            const isPhantomBpt = token.tokenAddress === pool.address;
            const isMainToken = !token.token.types.some((type) => type.type === 'PHANTOM_BPT' || type.type === 'BPT');
            const isErc4626 = token.token.types.some((type) => type.type === 'ERC4626');

            return {
                ...token.token,
                id: `${pool.id}-${token.tokenAddress}`,
                weight: poolToken?.dynamicData?.weight,
                isNested,
                isPhantomBpt,
                isMainToken,
                isErc4626,
            };
        });
    }

    private mapDisplayTokens(pool: PrismaPoolMinimal): GqlPoolTokenDisplay[] {
        return pool.tokens
            .filter((token) => token.address !== pool.address)
            .map((poolToken) => {
                const allToken = pool.allTokens.find((allToken) => allToken.token.address === poolToken.address);
                if (allToken?.nestedPool) {
                    const mainTokens =
                        allToken.nestedPool.allTokens.filter(
                            (nestedToken) =>
                                !nestedToken.token.types.some(
                                    (type) => type.type === 'PHANTOM_BPT' || type.type === 'BPT',
                                ),
                        ) || [];

                    return {
                        id: `${pool.id}-${poolToken.token.address}`,
                        ...poolToken.token,
                        weight: poolToken?.dynamicData?.weight,
                        nestedTokens: mainTokens.map((mainToken) => ({
                            id: `${pool.id}-${poolToken.token.address}-${mainToken.tokenAddress}`,
                            ...mainToken.token,
                        })),
                    };
                }

                return {
                    id: `${pool.id}-${poolToken.token.address}`,
                    ...poolToken.token,
                    weight: poolToken?.dynamicData?.weight,
                };
            });
    }

    private mapPoolToken(
        poolToken: PrismaPoolTokenWithExpandedNesting,
        hasNestedPool: boolean,
        nestedPercentage = 1,
    ): GqlPoolTokenDetail {
        const { nestedPool } = poolToken;

        return {
            id: `${poolToken.poolId}-${poolToken.token.address}`,
            ...poolToken.token,
            index: poolToken.index,
            balance: String(parseFloat(poolToken.dynamicData?.balance || '0') * nestedPercentage),
            balanceUSD: String((poolToken.dynamicData?.balanceUSD || 0) * nestedPercentage),
            priceRate: poolToken.dynamicData?.priceRate || '1.0',
            priceRateProvider: poolToken.priceRateProvider,
            weight: poolToken?.dynamicData?.weight,
            hasNestedPool: hasNestedPool,
            nestedPool: nestedPool ? this.mapNestedPool(nestedPool, poolToken.dynamicData?.balance || '0') : undefined,
            isAllowed: poolToken.token.types.some(
                (type) => type.type === 'WHITE_LISTED' || type.type === 'PHANTOM_BPT' || type.type === 'BPT',
            ),
            isErc4626: poolToken.token.types.some((type) => type.type === 'ERC4626'),
            scalingFactor: poolToken.scalingFactor,
        };
    }

    private mapNestedPool(nestedPool: PrismaNestedPoolWithSingleLayerNesting, tokenBalance: string): GqlNestedPool {
        const totalShares = parseFloat(nestedPool.dynamicData?.totalShares || '0');
        const percentOfSupplyNested = totalShares > 0 ? parseFloat(tokenBalance) / totalShares : 0;
        const totalLiquidity = nestedPool.dynamicData?.totalLiquidity || 0;

        return {
            ...nestedPool,
            liquidityManagement: (nestedPool.liquidityManagement as LiquidityManagement) || undefined,
            totalLiquidity: `${totalLiquidity}`,
            totalShares: `${totalShares}`,
            nestedShares: `${totalShares * percentOfSupplyNested}`,
            nestedLiquidity: `${totalLiquidity * percentOfSupplyNested}`,
            nestedPercentage: `${percentOfSupplyNested}`,
            tokens: nestedPool.tokens.map((token) =>
                this.mapPoolToken(
                    {
                        ...token,
                        nestedPool: null,
                    },
                    token.nestedPool !== null,
                    percentOfSupplyNested,
                ),
            ),
            swapFee: nestedPool.dynamicData?.swapFee || '0',
            bptPriceRate: (nestedPool.typeData as StableData).bptPriceRate || '1.0',
        };
    }

    private getStakingData(pool: PrismaPoolMinimal): GqlPoolStaking | null {
        if (pool.staking.length === 0) {
            return null;
        }

        for (const staking of pool.staking) {
            // This is needed to cast type APR type of the reliquary level from prisma (float) to the type of GQL (bigdecimal/string)
            if (staking.reliquary) {
                return {
                    ...staking,
                    reliquary: {
                        ...staking.reliquary,
                        levels: staking.reliquary.levels.map((level) => ({
                            ...level,
                            apr: `${level.apr}`,
                        })),
                    },
                    farm: null,
                    gauge: null,
                    aura: null,
                };
            } else if (staking.farm) {
                return {
                    ...staking,
                    gauge: null,
                    reliquary: null,
                    aura: null,
                };
            } else if (staking.vebal) {
                return {
                    ...staking,
                    gauge: null,
                    reliquary: null,
                    aura: null,
                };
            }
        }

        const sorted = this.getSortedGauges(pool);

        return {
            ...sorted[0],
            gauge: {
                ...sorted[0].gauge!,
                otherGauges: sorted.slice(1).map((item) => item.gauge!),
            },
            aura: pool.staking.find((staking) => staking.type === 'AURA' && !staking.aura!.isShutdown)?.aura,
            farm: null,
            reliquary: null,
        };
    }

    private getSortedGauges(pool: PrismaPoolMinimal) {
        return _.sortBy(pool.staking, (staking) => {
            if (staking.gauge) {
                switch (staking.gauge.status) {
                    case 'PREFERRED':
                        return 0;
                    case 'ACTIVE':
                        return 1;
                    case 'KILLED':
                        return 2;
                }
            }

            return 100;
        }).filter((staking) => staking.gauge);
    }

    private getUserBalance(
        pool: PrismaPoolMinimal,
        userWalletBalances: PrismaUserWalletBalance[],
        userStakedBalances: PrismaUserStakedBalance[],
    ): GqlPoolUserBalance {
        let bptPrice = 0;
        if (pool.dynamicData && pool.dynamicData.totalLiquidity > 0 && parseFloat(pool.dynamicData.totalShares) > 0) {
            bptPrice = pool.dynamicData.totalLiquidity / parseFloat(pool.dynamicData.totalShares);
        }
        const walletBalance = userWalletBalances.at(0)?.balance || '0';
        const walletBalanceNum = userWalletBalances.at(0)?.balanceNum || 0;
        const walletBalanceUsd = walletBalanceNum * bptPrice;

        const gqlUserStakedBalances: GqlUserStakedBalance[] = [];

        let totalBalance = walletBalanceNum;

        for (const balance of userStakedBalances) {
            const stakedBalanceNum = balance.balanceNum || 0;
            const stakedBalanceUsd = stakedBalanceNum * bptPrice;

            const staking = pool.staking.find((staking) => staking.id === balance.stakingId);

            gqlUserStakedBalances.push({
                balance: balance.balance,
                balanceUsd: stakedBalanceUsd,
                stakingType: staking!.type,
                stakingId: staking!.id,
            });
            totalBalance += stakedBalanceNum;
        }

        return {
            walletBalance: walletBalance,
            walletBalanceUsd,
            totalBalance: totalBalance.toString(),
            totalBalanceUsd: totalBalance * bptPrice,
            stakedBalances: gqlUserStakedBalances,
        };
    }

    private getPoolDynamicData(pool: PrismaPoolMinimal): GqlPoolDynamicData {
        const {
            fees24h,
            totalLiquidity,
            volume24h,
            surplus24h,
            fees48h,
            volume48h,
            surplus48h,
            yieldCapture24h,
            yieldCapture48h,
            totalLiquidity24hAgo,
            totalShares24hAgo,
            lifetimeVolume,
            lifetimeSwapFees,
            holdersCount,
            swapsCount,
            sharePriceAth,
            sharePriceAthTimestamp,
            sharePriceAtl,
            sharePriceAtlTimestamp,
            totalLiquidityAth,
            totalLiquidityAthTimestamp,
            totalLiquidityAtl,
            totalLiquidityAtlTimestamp,
            volume24hAtl,
            volume24hAthTimestamp,
            volume24hAth,
            volume24hAtlTimestamp,
            fees24hAtl,
            fees24hAthTimestamp,
            fees24hAth,
            fees24hAtlTimestamp,
        } = pool.dynamicData!;

        const newAprItemsSchema = this.buildAprItems(pool);

        const allAprItems = pool.aprItems?.filter((item) => item.apr > 0 || (item.range?.max ?? 0 > 0)) || [];
        const aprItems = allAprItems.filter(
            (item) => item.type !== 'SWAP_FEE_24H' && item.type !== 'SWAP_FEE_7D' && item.type !== 'SWAP_FEE_30D',
        );
        const swapAprItems = aprItems.filter((item) => item.type == 'SWAP_FEE');

        // swap apr cannot have a range, so we can already sum it up
        const aprItemsWithNoGroup = aprItems.filter((item) => !item.group);

        const hasAprRange = !!aprItems.find((item) => item.range);
        let aprTotal = `0`;
        let swapAprTotal = `0`;
        let nativeRewardAprTotal = `0`;
        let thirdPartyAprTotal = `0`;

        let aprRangeMin: string | undefined;
        let aprRangeMax: string | undefined;

        let nativeAprRangeMin: string | undefined;
        let nativeAprRangeMax: string | undefined;

        let thirdPartyAprRangeMin: string | undefined;
        let thirdPartyAprRangeMax: string | undefined;

        let hasRewardApr = false;

        // It is likely that if either native or third party APR has a range, that both of them have a range
        // therefore if there is a least one item with a range, we show both rewards in a range, although min and max might be identical
        if (hasAprRange) {
            let swapFeeApr = 0;
            let currentAprRangeMinTotal = 0;
            let currentAprRangeMaxTotal = 0;
            let currentNativeAprRangeMin = 0;
            let currentNativeAprRangeMax = 0;
            let currentThirdPartyAprRangeMin = 0;
            let currentThirdPartyAprRangeMax = 0;

            for (let aprItem of aprItems) {
                let minApr: number;
                let maxApr: number;

                if (aprItem.range) {
                    minApr = aprItem.range.min;
                    maxApr = aprItem.range.max;
                } else {
                    minApr = aprItem.apr;
                    maxApr = aprItem.apr;
                }

                currentAprRangeMinTotal += minApr;
                currentAprRangeMaxTotal += maxApr;

                switch (aprItem.type) {
                    case PrismaPoolAprType.NATIVE_REWARD: {
                        currentNativeAprRangeMin += minApr;
                        currentNativeAprRangeMax += maxApr;
                        break;
                    }
                    case PrismaPoolAprType.THIRD_PARTY_REWARD: {
                        currentThirdPartyAprRangeMin += minApr;
                        currentThirdPartyAprRangeMax += maxApr;
                        break;
                    }
                    case PrismaPoolAprType.VOTING: {
                        currentThirdPartyAprRangeMin += minApr;
                        currentThirdPartyAprRangeMax += maxApr;
                        break;
                    }
                    case 'SWAP_FEE': {
                        swapFeeApr += maxApr;
                        break;
                    }
                }
            }
            swapAprTotal = `${swapFeeApr}`;
            aprRangeMin = `${currentAprRangeMinTotal}`;
            aprRangeMax = `${currentAprRangeMaxTotal}`;
            nativeAprRangeMin = `${currentNativeAprRangeMin}`;
            nativeAprRangeMax = `${currentNativeAprRangeMax}`;
            thirdPartyAprRangeMin = `${currentThirdPartyAprRangeMin}`;
            thirdPartyAprRangeMax = `${currentThirdPartyAprRangeMax}`;
            hasRewardApr = currentNativeAprRangeMax > 0 || currentThirdPartyAprRangeMax > 0;
        } else {
            const nativeRewardAprItems = aprItems.filter((item) => item.type === 'NATIVE_REWARD');
            const thirdPartyRewardAprItems = aprItems.filter((item) => item.type === 'THIRD_PARTY_REWARD');
            aprTotal = `${_.sumBy(aprItems, 'apr')}`;
            swapAprTotal = `${_.sumBy(swapAprItems, 'apr')}`;
            nativeRewardAprTotal = `${_.sumBy(nativeRewardAprItems, 'apr')}`;
            thirdPartyAprTotal = `${_.sumBy(thirdPartyRewardAprItems, 'apr')}`;
            hasRewardApr = nativeRewardAprItems.length > 0 || thirdPartyRewardAprItems.length > 0;
        }

        const grouped = _.groupBy(
            aprItems.filter((item) => item.group),
            (item) => item.group,
        );

        return {
            ...pool.dynamicData!,
            totalLiquidity: `${fixedNumber(totalLiquidity, 2)}`,
            totalLiquidity24hAgo: `${fixedNumber(totalLiquidity24hAgo, 2)}`,
            totalShares24hAgo,
            totalSupply: pool.dynamicData?.totalShares || '0',
            fees24h: `${fixedNumber(fees24h, 2)}`,
            volume24h: `${fixedNumber(volume24h, 2)}`,
            surplus24h: `${fixedNumber(surplus24h, 2)}`,
            surplus48h: `${fixedNumber(surplus48h, 2)}`,
            yieldCapture24h: `${fixedNumber(yieldCapture24h, 2)}`,
            yieldCapture48h: `${fixedNumber(yieldCapture48h, 2)}`,
            fees48h: `${fixedNumber(fees48h, 2)}`,
            volume48h: `${fixedNumber(volume48h, 2)}`,
            lifetimeVolume: `${fixedNumber(lifetimeVolume, 2)}`,
            lifetimeSwapFees: `${fixedNumber(lifetimeSwapFees, 2)}`,
            holdersCount: `${holdersCount}`,
            swapsCount: `${swapsCount}`,
            sharePriceAth: `${sharePriceAth}`,
            sharePriceAtl: `${sharePriceAtl}`,
            totalLiquidityAth: `${fixedNumber(totalLiquidityAth, 2)}`,
            totalLiquidityAtl: `${fixedNumber(totalLiquidityAtl, 2)}`,
            volume24hAtl: `${fixedNumber(volume24hAtl, 2)}`,
            volume24hAth: `${fixedNumber(volume24hAth, 2)}`,
            fees24hAtl: `${fixedNumber(fees24hAtl, 2)}`,
            fees24hAth: `${fixedNumber(fees24hAth, 2)}`,
            sharePriceAthTimestamp,
            sharePriceAtlTimestamp,
            totalLiquidityAthTimestamp,
            totalLiquidityAtlTimestamp,
            fees24hAthTimestamp,
            fees24hAtlTimestamp,
            volume24hAthTimestamp,
            volume24hAtlTimestamp,
            aprItems: newAprItemsSchema,
            apr: {
                apr:
                    typeof aprRangeMin !== 'undefined' && typeof aprRangeMax !== 'undefined'
                        ? {
                              __typename: 'GqlPoolAprRange',
                              min: aprRangeMin,
                              max: aprRangeMax,
                          }
                        : { __typename: 'GqlPoolAprTotal', total: aprTotal },
                swapApr: swapAprTotal,
                nativeRewardApr:
                    typeof nativeAprRangeMin !== 'undefined' && typeof nativeAprRangeMax !== 'undefined'
                        ? {
                              __typename: 'GqlPoolAprRange',
                              min: nativeAprRangeMin,
                              max: nativeAprRangeMax,
                          }
                        : { __typename: 'GqlPoolAprTotal', total: nativeRewardAprTotal },
                thirdPartyApr:
                    typeof thirdPartyAprRangeMin !== 'undefined' && typeof thirdPartyAprRangeMax !== 'undefined'
                        ? {
                              __typename: 'GqlPoolAprRange',
                              min: thirdPartyAprRangeMin,
                              max: thirdPartyAprRangeMax,
                          }
                        : { __typename: 'GqlPoolAprTotal', total: thirdPartyAprTotal },
                items: [
                    ...aprItemsWithNoGroup.flatMap((item): GqlBalancePoolAprItem[] => {
                        if (item.range) {
                            return [
                                {
                                    id: item.id,
                                    apr: {
                                        __typename: 'GqlPoolAprRange',
                                        min: item.range.min.toString(),
                                        max: item.range.max.toString(),
                                    },
                                    title: item.title,
                                    subItems: [],
                                },
                            ];
                        } else {
                            return [
                                {
                                    ...item,
                                    apr: { __typename: 'GqlPoolAprTotal', total: `${item.apr}` },
                                    subItems: [],
                                },
                            ];
                        }
                    }),
                    ..._.map(grouped, (items, group): GqlBalancePoolAprItem => {
                        // todo: might need to support apr ranges as well at some point
                        const subItems = items.map(
                            (item): GqlBalancePoolAprSubItem => ({
                                ...item,
                                apr: { __typename: 'GqlPoolAprTotal', total: `${item.apr}` },
                            }),
                        );
                        let apr = 0;
                        for (const item of items) {
                            if (
                                item.type === 'SWAP_FEE_24H' ||
                                item.type === 'SWAP_FEE_7D' ||
                                item.type === 'SWAP_FEE_30D' ||
                                item.type === 'SURPLUS_24H' ||
                                item.type === 'SURPLUS_7D' ||
                                item.type === 'SURPLUS_30D'
                            ) {
                            } else {
                                apr += item.apr;
                            }
                        }
                        const title = `${group.charAt(0) + group.slice(1).toLowerCase()} boosted APR`;

                        return {
                            id: `${pool.id}-${group}`,
                            title,
                            apr: { __typename: 'GqlPoolAprTotal', total: `${apr}` },
                            subItems,
                        };
                    }),
                ],
                hasRewardApr,
            },
        };
    }

    private buildAprItems(pool: PrismaPoolMinimal): GqlPoolAprItem[] {
        const aprItems: GqlPoolAprItem[] = [];

        for (const aprItem of pool.aprItems) {
            if (aprItem.apr === 0 || (aprItem.range && aprItem.range.max === 0)) {
                continue;
            }

            let type: GqlPoolAprItemType;
            switch (aprItem.type) {
                case PrismaPoolAprType.NATIVE_REWARD:
                    if (pool.chain === 'FANTOM') {
                        type = 'MABEETS_EMISSIONS';
                    } else {
                        type = 'VEBAL_EMISSIONS';
                    }
                    break;
                case PrismaPoolAprType.THIRD_PARTY_REWARD:
                    type = 'STAKING';
                    break;
                case null:
                    type = 'NESTED';
                    break;
                default:
                    type = aprItem.type;
                    break;
            }

            if (aprItem.range) {
                aprItems.push({
                    id: aprItem.id,
                    title: aprItem.title,
                    apr: aprItem.range.min,
                    type: type,
                    rewardTokenAddress: aprItem.rewardTokenAddress,
                    rewardTokenSymbol: aprItem.rewardTokenSymbol,
                });
                aprItems.push({
                    id: `${aprItem.id}-boost`,
                    title: aprItem.title,
                    apr: aprItem.range.max - aprItem.range.min,
                    type: 'STAKING_BOOST',
                    rewardTokenAddress: aprItem.rewardTokenAddress,
                    rewardTokenSymbol: aprItem.rewardTokenSymbol,
                });
            } else {
                aprItems.push({
                    id: aprItem.id,
                    title: aprItem.title,
                    apr: aprItem.apr,
                    type: type,
                    rewardTokenAddress: aprItem.rewardTokenAddress,
                    rewardTokenSymbol: aprItem.rewardTokenSymbol,
                });
            }
        }

        return aprItems;
    }

    private getPoolInvestConfig(pool: PrismaPoolWithExpandedNesting): GqlPoolInvestConfig {
        const poolTokens = pool.tokens.filter((token) => token.address !== pool.address);
        const supportsNativeAssetDeposit = pool.type !== 'COMPOSABLE_STABLE';
        let options: GqlPoolInvestOption[] = [];

        for (const poolToken of poolTokens) {
            options = [...options, ...this.getActionOptionsForPoolToken(pool, poolToken, supportsNativeAssetDeposit)];
        }

        return {
            //TODO could flag these as disabled in sanity
            proportionalEnabled: pool.type !== 'COMPOSABLE_STABLE' && pool.type !== 'META_STABLE',
            singleAssetEnabled: true,
            options,
        };
    }

    private getPoolWithdrawConfig(pool: PrismaPoolWithExpandedNesting): GqlPoolWithdrawConfig {
        const poolTokens = pool.tokens.filter((token) => token.address !== pool.address);
        let options: GqlPoolWithdrawOption[] = [];

        for (const poolToken of poolTokens) {
            options = [...options, ...this.getActionOptionsForPoolToken(pool, poolToken, false, true)];
        }

        return {
            //TODO could flag these as disabled in sanity
            proportionalEnabled: true,
            singleAssetEnabled: true,
            options,
        };
    }

    private getActionOptionsForPoolToken(
        pool: PrismaPoolWithExpandedNesting,
        poolToken: PrismaPoolTokenWithExpandedNesting,
        supportsNativeAsset: boolean,
        isWithdraw?: boolean,
    ): { poolTokenAddress: string; poolTokenIndex: number; tokenOptions: GqlPoolToken[] }[] {
        const nestedPool = poolToken.nestedPool;
        const options: GqlPoolInvestOption[] = [];

        if (nestedPool && nestedPool.type === 'COMPOSABLE_STABLE') {
            const nestedTokens = nestedPool.tokens.filter((token) => token.address !== nestedPool.address);

            if (pool.type === 'COMPOSABLE_STABLE' || isWeightedPoolV2(pool)) {
                //when nesting a composable stable inside a composable stable, all of the underlying tokens can be used when investing
                //when withdrawing from a v2 weighted pool, we withdraw into all underlying assets.
                // ie: USDC/DAI/USDT for nested bbaUSD
                for (const nestedToken of nestedTokens) {
                    options.push({
                        poolTokenIndex: poolToken.index,
                        poolTokenAddress: poolToken.address,
                        tokenOptions: [this.mapPoolTokenToGql(nestedToken)],
                    });
                }
            } else {
                //if the parent pool does not have phantom bpt (ie: weighted), the user can only invest with 1 of the composable stable tokens
                options.push({
                    poolTokenIndex: poolToken.index,
                    poolTokenAddress: poolToken.address,
                    tokenOptions: nestedTokens.map((nestedToken) => {
                        return this.mapPoolTokenToGql(nestedToken);
                    }),
                });
            }
        } else {
            const isWrappedNativeAsset = isSameAddress(poolToken.address, networkContext.data.weth.address);

            options.push({
                poolTokenIndex: poolToken.index,
                poolTokenAddress: poolToken.address,
                tokenOptions:
                    isWrappedNativeAsset && supportsNativeAsset
                        ? [
                              this.mapPoolTokenToGql(poolToken),
                              this.mapPoolTokenToGql({
                                  ...poolToken,
                                  token: {
                                      ...poolToken.token,
                                      symbol: networkContext.data.eth.symbol,
                                      address: networkContext.data.eth.address,
                                      name: networkContext.data.eth.name,
                                  },
                                  id: `${pool.id}-${networkContext.data.eth.address}`,
                              }),
                          ]
                        : [this.mapPoolTokenToGql(poolToken)],
            });
        }

        return options;
    }

    private mapPoolTokenToGqlUnion(token: PrismaPoolTokenWithExpandedNesting): GqlPoolTokenUnion {
        const { nestedPool } = token;

        if (nestedPool && nestedPool.type === 'COMPOSABLE_STABLE') {
            const totalShares = parseFloat(nestedPool.dynamicData?.totalShares || '0');
            const percentOfSupplyNested =
                totalShares > 0 ? parseFloat(token.dynamicData?.balance || '0') / totalShares : 0;

            //50_000_000_000_000
            return {
                ...this.mapPoolTokenToGql(token),
                __typename: 'GqlPoolTokenComposableStable',
                pool: this.mapNestedPoolToGqlPoolComposableStableNested(nestedPool, percentOfSupplyNested),
            };
        }

        return this.mapPoolTokenToGql(token);
    }

    private mapPoolTokenToGql(poolToken: PrismaPoolTokenWithDynamicData): GqlPoolToken {
        return {
            id: poolToken.id,
            ...poolToken.token,
            __typename: 'GqlPoolToken',
            priceRate: poolToken.dynamicData?.priceRate || '1.0',
            priceRateProvider: poolToken.priceRateProvider,
            balance: poolToken.dynamicData?.balance || '0',
            index: poolToken.index,
            weight: poolToken.dynamicData?.weight,
            totalBalance: poolToken.dynamicData?.balance || '0',
        };
    }

    private mapHookData(pool: PrismaPoolMinimal): Hook | undefined {
        if (!pool.hook) {
            return undefined;
        }

        return {
            ...pool.hook,
            dynamicData: pool.hook.dynamicData as HookData,
            ...(pool.hook.reviewData
                ? {
                      reviewData: {
                          ...pool.hook.reviewData,
                          warnings: pool.hook.reviewData?.warnings?.split(',') || [],
                      },
                  }
                : { reviewData: undefined }),
        };
    }

    private mapNestedPoolToGqlPoolComposableStableNested(
        pool: PrismaNestedPoolWithSingleLayerNesting,
        percentOfSupplyNested: number,
    ): GqlPoolComposableStableNested {
        const bpt = pool.tokens.find((token) => token.address === pool.address);

        return {
            __typename: 'GqlPoolComposableStableNested',
            ...pool,
            ...(pool.typeData as StableData)!,
            nestingType: this.getPoolNestingType(pool),
            tokens: pool.tokens.map((token) => this.mapPoolTokenToGql(token)),
            totalLiquidity: `${pool.dynamicData?.totalLiquidity || 0}`,
            totalShares: pool.dynamicData?.totalShares || '0',
            swapFee: pool.dynamicData?.swapFee || '0',
            bptPriceRate: bpt?.dynamicData?.priceRate || '1.0',
            categories: pool.categories as GqlPoolFilterCategory[],
            tags: pool.categories,
        };
    }

    private getPoolNestingType(pool: PrismaNestedPoolWithSingleLayerNesting): GqlPoolNestingType {
        const tokens = pool.tokens.filter((token) => token.address !== pool.address);
        const numTokensWithNestedPool = tokens.filter((token) => !!token.nestedPool).length;

        if (numTokensWithNestedPool === tokens.length) {
            return 'HAS_ONLY_PHANTOM_BPT';
        } else if (numTokensWithNestedPool > 0) {
            return 'HAS_SOME_PHANTOM_BPT';
        }

        return 'NO_NESTING';
    }

    private getPoolInclude(userAddress?: string) {
        if (!userAddress) {
            return {
                ...prismaPoolWithExpandedNesting.include,
                staking: {
                    include: {
                        ...prismaPoolWithExpandedNesting.include.staking.include,
                        userStakedBalances: false,
                    },
                },
                userWalletBalances: false,
            };
        }

        return {
            ...prismaPoolWithExpandedNesting.include,
            staking: {
                include: {
                    ...prismaPoolWithExpandedNesting.include.staking.include,
                    userStakedBalances: {
                        where: {
                            userAddress: {
                                equals: userAddress.toLowerCase(),
                            },
                            balanceNum: { gt: 0 },
                        },
                    },
                },
            },
            userWalletBalances: {
                where: {
                    userAddress: {
                        equals: userAddress.toLowerCase(),
                    },
                    balanceNum: { gt: 0 },
                },
            },
        };
    }
}
