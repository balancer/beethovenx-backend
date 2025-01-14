import { prisma } from '../../../prisma/prisma-client';
import _ from 'lodash';
import moment from 'moment-timezone';
import { isSupportedInt, prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import { TokenService } from '../../token/token.service';
import { networkContext } from '../../network/network-context.service';
import { capturesYield } from './pool-utils';
import * as Sentry from '@sentry/node';

export class PoolUsdDataService {
    constructor(private readonly tokenService: TokenService) {}

    private get balancerSubgraphService() {
        return networkContext.services.balancerSubgraphService;
    }

    private get chain() {
        return networkContext.chain;
    }

    /**
     * This function depends on pools data to be up to date, so it should be called after
     * poolService.syncAllPoolsFromSubgraph or mutation poolSyncAllPoolsFromSubgraph
     */
    public async updateLifetimeValuesForAllPools() {
        let updates: any[] = [];
        const subgraphPools = await this.balancerSubgraphService.getAllPools({});
        const stakedUsers = await prisma.prismaUserStakedBalance.groupBy({
            by: ['poolId'],
            _count: { userAddress: true },
            where: { chain: this.chain, balanceNum: { gt: 0 } },
        });

        const subgraphPoolIds = subgraphPools.map((pool) => pool.id);

        const dbPools = await prisma.prismaPool.findMany({
            where: { id: { in: subgraphPoolIds }, chain: this.chain },
            include: {
                dynamicData: true,
                snapshots: true,
            },
        });

        for (const pool of subgraphPools) {
            const staked = stakedUsers.find((stakedUser) => stakedUser.poolId === pool.id);
            const dbPool = dbPools.find((poolInDb) => poolInDb.id === pool.id);
            if (!dbPool) continue;

            // Limit numbers, as we have seen some pools with skewd values
            const max = 1e18;
            const lifetimeVolume = Math.min(parseFloat(pool.totalSwapVolume), max);
            const lifetimeSwapFees = Math.min(parseFloat(pool.totalSwapFee), max);
            const holdersCount = parseInt(pool.holdersCount) + (staked?._count.userAddress || 0);

            if (
                !dbPool.dynamicData ||
                dbPool.dynamicData.lifetimeVolume !== lifetimeVolume ||
                dbPool.dynamicData.lifetimeSwapFees !== lifetimeSwapFees ||
                dbPool.dynamicData.holdersCount !== holdersCount ||
                dbPool.dynamicData.swapsCount !== parseInt(pool.swapsCount)
            ) {
                updates.push(
                    prisma.prismaPoolDynamicData.update({
                        where: { id_chain: { id: pool.id, chain: this.chain } },
                        data: {
                            lifetimeVolume: lifetimeVolume,
                            lifetimeSwapFees: lifetimeSwapFees,
                            holdersCount: holdersCount,
                            swapsCount: parseInt(pool.swapsCount),
                        },
                    }),
                );
            }

            if (dbPool.snapshots.length > 0) {
                const sharePriceAth = _.orderBy(dbPool.snapshots, 'sharePrice', 'desc')[0];
                const sharePriceAtl = _.orderBy(dbPool.snapshots, 'sharePrice', 'asc')[0];
                const totalLiquidityAth = _.orderBy(dbPool.snapshots, 'totalLiquidity', 'desc')[0];
                const totalLiquidityAtl = _.orderBy(dbPool.snapshots, 'totalLiquidity', 'asc')[0];
                const volume24hAth = _.orderBy(dbPool.snapshots, 'volume24h', 'desc')[0];
                const volume24hAtl = _.orderBy(dbPool.snapshots, 'volume24h', 'asc')[0];
                const fees24hAth = _.orderBy(dbPool.snapshots, 'fees24h', 'desc')[0];
                const fees24hAtl = _.orderBy(dbPool.snapshots, 'fees24h', 'asc')[0];

                if (
                    !dbPool.dynamicData ||
                    dbPool.dynamicData.sharePriceAth !== sharePriceAth.sharePrice ||
                    dbPool.dynamicData.sharePriceAthTimestamp !== sharePriceAth.timestamp ||
                    dbPool.dynamicData.sharePriceAtl !== sharePriceAtl.sharePrice ||
                    dbPool.dynamicData.sharePriceAtlTimestamp !== sharePriceAtl.timestamp ||
                    dbPool.dynamicData.totalLiquidityAth !== totalLiquidityAth.totalLiquidity ||
                    dbPool.dynamicData.totalLiquidityAthTimestamp !== totalLiquidityAth.timestamp ||
                    dbPool.dynamicData.totalLiquidityAtl !== totalLiquidityAtl.totalLiquidity ||
                    dbPool.dynamicData.totalLiquidityAtlTimestamp !== totalLiquidityAtl.timestamp ||
                    dbPool.dynamicData.volume24hAth !== volume24hAth.volume24h ||
                    dbPool.dynamicData.volume24hAthTimestamp !== volume24hAth.timestamp ||
                    dbPool.dynamicData.volume24hAtl !== volume24hAtl.volume24h ||
                    dbPool.dynamicData.volume24hAtlTimestamp !== volume24hAtl.timestamp ||
                    dbPool.dynamicData.fees24hAth !== fees24hAth.fees24h ||
                    dbPool.dynamicData.fees24hAthTimestamp !== fees24hAth.timestamp ||
                    dbPool.dynamicData.fees24hAtl !== fees24hAtl.fees24h ||
                    dbPool.dynamicData.fees24hAtlTimestamp !== fees24hAtl.timestamp
                ) {
                    updates.push(
                        prisma.prismaPoolDynamicData.update({
                            where: { id_chain: { id: pool.id, chain: this.chain } },
                            data: {
                                sharePriceAth: sharePriceAth.sharePrice,
                                sharePriceAthTimestamp: sharePriceAth.timestamp,
                                sharePriceAtl: sharePriceAtl.sharePrice,
                                sharePriceAtlTimestamp: sharePriceAtl.timestamp,

                                totalLiquidityAth: totalLiquidityAth.totalLiquidity,
                                totalLiquidityAthTimestamp: totalLiquidityAth.timestamp,
                                totalLiquidityAtl: totalLiquidityAtl.totalLiquidity,
                                totalLiquidityAtlTimestamp: totalLiquidityAtl.timestamp,

                                volume24hAth: volume24hAth.volume24h,
                                volume24hAthTimestamp: volume24hAth.timestamp,
                                volume24hAtl: volume24hAtl.volume24h,
                                volume24hAtlTimestamp: volume24hAtl.timestamp,

                                fees24hAth: fees24hAth.fees24h,
                                fees24hAthTimestamp: fees24hAth.timestamp,
                                fees24hAtl: fees24hAtl.fees24h,
                                fees24hAtlTimestamp: fees24hAtl.timestamp,
                            },
                        }),
                    );
                }
            }
        }

        await prismaBulkExecuteOperations(updates);
    }
}
