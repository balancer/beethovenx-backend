import { prisma } from '../../../prisma/prisma-client';
import {
    BalancerPoolSnapshotFragment,
    OrderDirection,
    PoolSnapshot_OrderBy,
} from '../../subgraphs/balancer-subgraph/generated/balancer-subgraph-types';
import { GqlPoolSnapshotDataRange } from '../../../apps/api/gql/generated-schema';
import moment from 'moment-timezone';
import _ from 'lodash';
import { Chain, PrismaPoolSnapshot } from '@prisma/client';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import { prismaPoolWithExpandedNesting } from '../../../prisma/prisma-types';
import { blocksSubgraphService } from '../../subgraphs/blocks-subgraph/blocks-subgraph.service';
import { TokenHistoricalPrices } from '../../token/lib/coingecko-data.service';
import { V2SubgraphClient } from '../../subgraphs/balancer-subgraph';

export class PoolSnapshotService {
    constructor(
        private balancerSubgraphService: V2SubgraphClient,
        private chain: Chain,
        private prices?: Record<string, number>,
    ) {}

    public async getSnapshotsForPool(poolId: string, chain: Chain, range: GqlPoolSnapshotDataRange) {
        const timestamp = this.getTimestampForRange(range);

        return prisma.prismaPoolSnapshot.findMany({
            where: { poolId, timestamp: { gte: timestamp }, chain },
            orderBy: { timestamp: 'asc' },
        });
    }

    public async getSnapshotForPool(poolId: string, timestamp: number, chain: Chain) {
        return prisma.prismaPoolSnapshot.findUnique({
            where: { id_chain: { id: `${poolId}-${timestamp}`, chain } },
        });
    }

    /*
    Per default, this method syncs the snapshot from today and from yesterday (daysTosync=2). It is important to also sync the snapshot from
    yesterday in the cron-job to capture all the changes between when it last ran and midnight. 
    */
    public async syncLatestSnapshotsForAllPools(daysToSync = 2) {
        let operations: any[] = [];
        const daysAgoStartOfDay = moment()
            .utc()
            .startOf('day')
            .subtract(daysToSync - 1, 'days')
            .unix();

        // per default (daysToSync=2) returns snapshots from yesterday and today
        const allSnapshots = await this.balancerSubgraphService.legacyService.getAllPoolSnapshots({
            where: { timestamp_gte: daysAgoStartOfDay },
            orderBy: PoolSnapshot_OrderBy.Timestamp,
            orderDirection: OrderDirection.Asc,
        });

        const latestSyncedSnapshots = await prisma.prismaPoolSnapshot.findMany({
            where: {
                // there is no guarantee that a pool receives a swap per day, so we get the last day with a swap
                timestamp: { lte: moment().utc().startOf('day').subtract(daysToSync, 'days').unix() },
                chain: this.chain,
            },
            orderBy: { timestamp: 'desc' },
            distinct: 'poolId',
        });

        const poolIds = _.uniq(allSnapshots.map((snapshot) => snapshot.pool.id));
        const pools = await prisma.prismaPool.findMany({
            where: { id: { in: poolIds }, chain: this.chain },
            include: { tokens: { select: { address: true, index: true } } },
        });

        for (const pool of pools) {
            const snapshots = allSnapshots.filter((snapshot) => snapshot.pool.id === pool.id);
            const latestSyncedSnapshot = latestSyncedSnapshots.find((snapshot) => snapshot.poolId === pool.id);

            if (!latestSyncedSnapshot && pool.createTime < daysAgoStartOfDay) {
                // in this instance, this pool should already have snapshots stored.
                // since that's not the case, we reload from the subgraph and bail.
                await this.loadAllSnapshotsForPools([pool.id], false);
                continue;
            }

            const startTotalSwapVolume = `${latestSyncedSnapshot?.totalSwapVolume || '0'}`;
            const startTotalSwapFee = `${latestSyncedSnapshot?.totalSwapFee || '0'}`;

            const poolOperations = snapshots.map((snapshot, index) => {
                const prevTotalSwapVolume = index === 0 ? startTotalSwapVolume : snapshots[index - 1].swapVolume;
                const prevTotalSwapFee = index === 0 ? startTotalSwapFee : snapshots[index - 1].swapFees;

                const data = this.getPrismaPoolSnapshotFromSubgraphData(
                    snapshot,
                    prevTotalSwapVolume,
                    prevTotalSwapFee,
                    pool.tokens,
                );

                return prisma.prismaPoolSnapshot.upsert({
                    where: { id_chain: { id: snapshot.id, chain: this.chain } },
                    create: data,
                    update: data,
                });
            });
            operations.push(...poolOperations);
        }

        await prismaBulkExecuteOperations(operations);

        const poolsWithoutSnapshots = await prisma.prismaPool.findMany({
            where: {
                OR: [
                    { type: 'COMPOSABLE_STABLE', chain: this.chain },
                    { tokens: { some: { nestedPoolId: { not: null } } }, chain: this.chain },
                ],
            },
            include: { tokens: true },
        });

        for (const pool of poolsWithoutSnapshots) {
            await this.createPoolSnapshotsForPoolsMissingSubgraphData(pool.id, daysToSync);
        }
    }

    public async loadAllSnapshotsForPools(poolIds: string[], reload: boolean) {
        //assuming the pool does not have more than 5,000 snapshots, we should be ok.
        const allSnapshots = await this.balancerSubgraphService.legacyService.getAllPoolSnapshots({
            where: { pool_in: poolIds },
            orderBy: PoolSnapshot_OrderBy.Timestamp,
            orderDirection: OrderDirection.Asc,
        });

        for (const poolId of poolIds) {
            const snapshots = allSnapshots.filter((snapshot) => snapshot.pool.id === poolId);

            // Get pool token data
            const tokens = await prisma.prismaPoolToken.findMany({
                where: { poolId: poolId, chain: this.chain },
                select: { address: true, index: true },
            });

            await prisma.$transaction([
                ...((reload && [prisma.prismaPoolSnapshot.deleteMany({ where: { poolId, chain: this.chain } })]) || []),
                prisma.prismaPoolSnapshot.createMany({
                    data: snapshots.map((snapshot, index) => {
                        let prevTotalSwapVolume = index === 0 ? '0' : snapshots[index - 1].swapVolume;
                        let prevTotalSwapFee = index === 0 ? '0' : snapshots[index - 1].swapFees;

                        return this.getPrismaPoolSnapshotFromSubgraphData(
                            snapshot,
                            prevTotalSwapVolume,
                            prevTotalSwapFee,
                            tokens,
                        );
                    }),
                    skipDuplicates: true,
                }),
            ]);
        }
    }

    public async createPoolSnapshotsForPoolsMissingSubgraphData(poolId: string, numDays = -1) {
        const pool = await prisma.prismaPool.findUniqueOrThrow({
            where: { id_chain: { id: poolId, chain: this.chain } },
            include: prismaPoolWithExpandedNesting.include,
        });

        const startTimestamp =
            numDays >= 0 ? moment().utc().startOf('day').subtract(numDays, 'days').unix() : pool.createTime;

        if (numDays < 0) {
            numDays = moment().diff(moment.unix(startTimestamp), 'days');
        }

        const swaps = await this.balancerSubgraphService.legacyService.getAllSwapsWithPaging({
            where: { poolId },
            startTimestamp,
        });

        const tokenPriceMap: TokenHistoricalPrices = {};

        for (const token of pool.tokens) {
            if (token.address === pool.address) {
                continue;
            }

            if (token.nestedPoolId && token.nestedPool) {
                const snapshots = await prisma.prismaPoolSnapshot.findMany({
                    where: { poolId: token.nestedPoolId, chain: this.chain },
                });

                tokenPriceMap[token.address] = snapshots.map((snapshot) => ({
                    timestamp: snapshot.timestamp,
                    price: snapshot.sharePrice,
                }));
            } else {
                // check DB for correct price first before trying coingecko
                const priceForDays = await prisma.prismaTokenPrice.findMany({
                    where: {
                        tokenAddress: token.address,
                        timestamp: { gte: startTimestamp },
                        chain: this.chain,
                    },
                });
                if (priceForDays.length === 0) {
                    console.log(
                        `No historical price in DB for to create pool snapshots. Skipping token ${token.address}.`,
                    );
                } else {
                    tokenPriceMap[token.address] = priceForDays;
                }
            }
        }

        const dailyBlocks = await blocksSubgraphService.getDailyBlocks(numDays);

        for (const block of dailyBlocks) {
            const startTimestamp = parseInt(block.timestamp);
            const endTimestamp = startTimestamp + 86400;
            const swapsForDay = swaps.filter(
                (swap) =>
                    swap.timestamp >= startTimestamp &&
                    swap.timestamp < endTimestamp &&
                    swap.tokenIn !== pool.address &&
                    swap.tokenOut !== pool.address,
            );

            const volume24h = _.sumBy(swapsForDay, (swap) => {
                const prices = this.getTokenPricesForTimestamp(swap.timestamp, tokenPriceMap);
                let valueUsd = 0;

                if (prices[swap.tokenIn]) {
                    valueUsd = prices[swap.tokenIn] * parseFloat(swap.tokenAmountIn);
                } else if (prices[swap.tokenOut]) {
                    valueUsd = prices[swap.tokenOut] * parseFloat(swap.tokenAmountOut);
                }

                return valueUsd;
            });

            const { pool: poolAtBlock } = await this.balancerSubgraphService.legacyService.getPool({
                id: poolId,
                block: { number: parseInt(block.number) },
            });

            if (!poolAtBlock) {
                console.log(
                    `pool does not exist at block. Pool id: ${poolId}, block: ${block.number}, skipping block...`,
                );
                continue;
            }

            const tokenPrices = this.getTokenPricesForTimestamp(endTimestamp, tokenPriceMap);
            const totalLiquidity = _.sumBy(
                poolAtBlock.tokens || [],
                (token) => parseFloat(token.balance) * (tokenPrices[token.address] || 0),
            );
            const totalShares = parseFloat(poolAtBlock.totalShares);

            const id = `${poolId}-${startTimestamp}`;
            const data = {
                id,
                chain: this.chain,
                poolId,
                timestamp: startTimestamp,
                totalLiquidity: totalLiquidity || 0,
                totalShares: poolAtBlock.totalShares,
                totalSharesNum: totalShares,
                swapsCount: parseInt(poolAtBlock.swapsCount),
                holdersCount: parseInt(poolAtBlock.holdersCount),
                amounts: (poolAtBlock.tokens || []).map((token) => token.balance),
                volume24h,
                fees24h: volume24h * parseFloat(poolAtBlock.swapFee),
                sharePrice: totalLiquidity > 0 && totalShares > 0 ? totalLiquidity / totalShares : 0,

                //TODO: these are always 0 at the moment
                totalSwapVolume: parseFloat(poolAtBlock.totalSwapVolume),
                totalSwapFee: parseFloat(poolAtBlock.totalSwapFee),
            };

            try {
                await prisma.prismaPoolSnapshot.upsert({
                    where: { id_chain: { id, chain: this.chain } },
                    create: data,
                    update: data,
                });
            } catch (e) {
                console.log('pool snapshot upsert for ' + id, data);
                throw e;
            }
        }
    }

    private getPrismaPoolSnapshotFromSubgraphData(
        snapshot: BalancerPoolSnapshotFragment,
        prevTotalSwapVolume: string,
        prevTotalSwapFee: string,
        poolTokens?: { address: string; index: number }[],
    ): PrismaPoolSnapshot {
        let totalLiquidity = parseFloat(snapshot.liquidity);

        if (totalLiquidity === 0 && poolTokens && this.prices) {
            const prices = this.prices;
            try {
                totalLiquidity = snapshot.amounts.reduce((acc, amount, index) => {
                    const addressIndex = poolTokens.findIndex((token) => token.index === index);
                    const { address } = poolTokens[addressIndex];
                    if (!prices[address]) {
                        throw 'Price not found';
                    }
                    return parseFloat(amount) * prices[address] + acc;
                }, 0);
            } catch (e) {
                // There was a missing price, fallback to the subgraph value
            }
        }

        const totalShares = parseFloat(snapshot.totalShares);

        return {
            id: snapshot.id,
            chain: this.chain,
            poolId: snapshot.pool.id,
            timestamp: snapshot.timestamp,
            protocolVersion: 2,
            totalLiquidity: totalLiquidity,
            totalShares: snapshot.totalShares,
            totalSharesNum: parseFloat(snapshot.totalShares),
            totalSwapVolume: parseFloat(snapshot.swapVolume),
            totalSwapFee: parseFloat(snapshot.swapFees),
            totalSurplus: 0,
            swapsCount: parseInt(snapshot.swapsCount),
            holdersCount: parseInt(snapshot.holdersCount),
            amounts: snapshot.amounts,
            volume24h: Math.max(parseFloat(snapshot.swapVolume) - parseFloat(prevTotalSwapVolume), 0),
            fees24h: Math.max(parseFloat(snapshot.swapFees) - parseFloat(prevTotalSwapFee), 0),
            surplus24h: 0,
            sharePrice: totalLiquidity > 0 && totalShares > 0 ? totalLiquidity / totalShares : 0,
            totalProtocolSwapFees: [],
            totalProtocolYieldFees: [],
            totalVolumes: [],
            totalSwapFees: [],
            totalSurpluses: [],
            dailyProtocolSwapFees: [],
            dailyProtocolYieldFees: [],
            dailyVolumes: [],
            dailySwapFees: [],
            dailySurpluses: [],
        };
    }

    private getTimestampForRange(range: GqlPoolSnapshotDataRange): number {
        switch (range) {
            case 'THIRTY_DAYS':
                return moment().startOf('day').subtract(30, 'days').unix();
            case 'NINETY_DAYS':
                return moment().startOf('day').subtract(90, 'days').unix();
            case 'ONE_HUNDRED_EIGHTY_DAYS':
                return moment().startOf('day').subtract(180, 'days').unix();
            case 'ONE_YEAR':
                return moment().startOf('day').subtract(365, 'days').unix();
            case 'ALL_TIME':
                return 0;
        }
    }

    public getTokenPricesForTimestamp(
        timestamp: number,
        tokenHistoricalPrices: TokenHistoricalPrices,
    ): { [address: string]: number } {
        const msTimestamp = timestamp * 1000;
        return _.mapValues(tokenHistoricalPrices, (tokenPrices) => {
            if (tokenPrices.length === 0) {
                return 0;
            }

            const closest = tokenPrices.reduce((a, b) => {
                return Math.abs(b.timestamp - msTimestamp) < Math.abs(a.timestamp - msTimestamp) ? b : a;
            });

            return closest.price;
        });
    }
}
