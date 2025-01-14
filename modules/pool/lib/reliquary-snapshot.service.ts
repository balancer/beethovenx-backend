import { prisma } from '../../../prisma/prisma-client';
import { GqlPoolSnapshotDataRange } from '../../../apps/api/gql/generated-schema';
import moment from 'moment-timezone';
import _ from 'lodash';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import { ReliquarySubgraphService } from '../../subgraphs/reliquary-subgraph/reliquary.service';
import { oneDayInMinutes } from '../../common/time';
import {
    Chain,
    PrismaReliquaryFarmSnapshot,
    PrismaReliquaryLevelSnapshot,
    PrismaReliquaryTokenBalanceSnapshot,
} from '@prisma/client';
import { networkContext } from '../../network/network-context.service';
import { blockNumbers } from '../../block-numbers';

export class ReliquarySnapshotService {
    constructor(private readonly reliquarySubgraphService: ReliquarySubgraphService) {}

    public async getSnapshotsForFarm(farmId: number, range: GqlPoolSnapshotDataRange) {
        const timestamp = this.getTimestampForRange(range);
        return prisma.prismaReliquaryFarmSnapshot.findMany({
            where: { farmId: `${farmId}`, timestamp: { gte: timestamp }, chain: networkContext.chain },
            include: { levelBalances: true, tokenBalances: true },
            orderBy: { timestamp: 'asc' },
        });
    }

    public async syncLatestSnapshotsForAllFarms() {
        const yesterdayMorning = moment().utc().subtract(1, 'day').startOf('day').unix();

        // this returns the last two snapshot per farm, if there are any
        const { farmSnapshots: allSnapshots } = await this.reliquarySubgraphService.getFarmSnapshots({
            where: { snapshotTimestamp_gte: yesterdayMorning },
        });
        const filteredSnapshots = allSnapshots.filter(
            (farm) => !networkContext.data.reliquary!.excludedFarmIds.includes(farm.farmId.toString()),
        );
        const farmIdsInSubgraphSnapshots = _.uniq(filteredSnapshots.map((snapshot) => snapshot.farmId));

        await this.upsertFarmSnapshots(farmIdsInSubgraphSnapshots, filteredSnapshots, networkContext.chain);
    }

    public async loadAllSnapshotsForFarm(farmId: number, excludedFarmIds: string[], chain: Chain) {
        const farmSnapshots = await this.reliquarySubgraphService.getAllFarmSnapshotsForFarm(farmId);
        const filteredSnapshots = farmSnapshots.filter((farm) => !excludedFarmIds.includes(farm.farmId.toString()));
        await this.upsertFarmSnapshots([farmId], filteredSnapshots, chain);
    }

    private async upsertFarmSnapshots(
        farmIds: number[],
        farmSnapshots: {
            id: string;
            snapshotTimestamp: number;
            totalBalance: string;
            dailyDeposited: string;
            dailyWithdrawn: string;
            relicCount: number;
            farmId: number;
        }[],
        chain: Chain,
    ) {
        let operations: any[] = [];
        for (const farmId of farmIds) {
            const snapshots = farmSnapshots.filter((snapshot) => snapshot.farmId === farmId);

            const farmOperations = [];
            for (const snapshot of snapshots) {
                // If we sync snapshots from the past, we want relics from end of that day.
                // If we sync from today, we want relics up to nowish (accomodate for subgraph lagging)
                const timestampForSnapshot =
                    snapshot.snapshotTimestamp + oneDayInMinutes * 60 < moment().utc().unix()
                        ? snapshot.snapshotTimestamp + oneDayInMinutes * 60
                        : moment().utc().unix() - 1200;

                const pool = await prisma.prismaPool.findFirstOrThrow({
                    where: { staking: { some: { reliquary: { id: `${farmId}` } } }, chain: chain },
                    include: { tokens: { include: { token: true } } },
                });

                const mostRecentPoolSnapshot = await prisma.prismaPoolSnapshot.findFirstOrThrow({
                    where: { poolId: pool.id, timestamp: { lte: timestampForSnapshot }, chain: chain },
                    orderBy: { timestamp: 'desc' },
                });

                const blockAtTimestamp = await blockNumbers().getBlock(chain, timestampForSnapshot);
                const relicsInFarm = await this.reliquarySubgraphService.getAllRelicsWithPaging({
                    where: { pid: farmId },
                    block: { number: blockAtTimestamp },
                });
                const levelsAtBlock = await this.reliquarySubgraphService.getPoolLevels({
                    where: { pool_: { pid: farmId } },
                    block: { number: blockAtTimestamp },
                });

                const sharePercentage = parseFloat(snapshot.totalBalance) / mostRecentPoolSnapshot.totalSharesNum;

                const uniqueUsers = _.uniq(relicsInFarm.map((relic) => relic.userAddress));
                const data: PrismaReliquaryFarmSnapshot = {
                    id: snapshot.id,
                    chain: chain,
                    farmId: `${snapshot.farmId}`,
                    timestamp: snapshot.snapshotTimestamp,
                    relicCount: snapshot.relicCount,
                    userCount: uniqueUsers.length,
                    totalBalance: snapshot.totalBalance,
                    dailyDeposited: snapshot.dailyDeposited,
                    dailyWithdrawn: snapshot.dailyWithdrawn,
                    totalLiquidity: `${mostRecentPoolSnapshot.totalLiquidity * sharePercentage}`,
                };
                farmOperations.push(
                    prisma.prismaReliquaryFarmSnapshot.upsert({
                        where: { id_chain: { id: snapshot.id, chain: chain } },
                        create: data,
                        update: data,
                    }),
                );

                for (const level of levelsAtBlock.poolLevels) {
                    const data: PrismaReliquaryLevelSnapshot = {
                        id: `${level.id}-${snapshot.id}`,
                        chain: chain,
                        farmSnapshotId: snapshot.id,
                        level: `${level.level}`,
                        balance: level.balance,
                    };
                    farmOperations.push(
                        prisma.prismaReliquaryLevelSnapshot.upsert({
                            where: { id_chain: { id: `${level.id}-${snapshot.id}`, chain: chain } },
                            create: data,
                            update: data,
                        }),
                    );
                }

                for (const token of pool.tokens) {
                    const data: PrismaReliquaryTokenBalanceSnapshot = {
                        id: `${token.id}-${snapshot.id}`,
                        chain: chain,
                        farmSnapshotId: snapshot.id,
                        address: token.address,
                        symbol: token.token.symbol,
                        name: token.token.name,
                        decimals: token.token.decimals,
                        balance: `${parseFloat(mostRecentPoolSnapshot.amounts[token.index]) * sharePercentage}`,
                    };
                    farmOperations.push(
                        prisma.prismaReliquaryTokenBalanceSnapshot.upsert({
                            where: { id_chain: { id: `${token.id}-${snapshot.id}`, chain: chain } },
                            create: data,
                            update: data,
                        }),
                    );
                }
            }
            operations.push(...farmOperations);
        }
        await prismaBulkExecuteOperations(operations, true);
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
}
