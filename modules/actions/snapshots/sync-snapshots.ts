import { Chain, Prisma, PrismaLastBlockSyncedCategory } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';
import _ from 'lodash';
import { PoolSnapshot_Filter } from '../../sources/subgraphs/balancer-v3-vault/generated/types';
import { fillMissingTimestamps } from './lib/fill-missing-timestamps';
import { computeDailyValues } from './lib/compute-daily-values';
import { applyUSDValues } from './lib/apply-usd-values';

type SnapshotsSubgraphClient = {
    getMetadata: () => Promise<{ block: { number: number } }>;
    getAllSnapshots: (args: PoolSnapshot_Filter) => Promise<Prisma.PrismaPoolSnapshotUncheckedCreateInput[]>;
};

export async function syncSnapshots(
    subgraphClient: SnapshotsSubgraphClient,
    category: PrismaLastBlockSyncedCategory,
    chain: Chain,
    options: {
        poolIds?: string[]; // Optional: Specific pool IDs to sync
        startFromLastSyncedBlock?: boolean; // Optional: Whether to sync based on the latest block
    } = {},
): Promise<string[]> {
    const { poolIds = [], startFromLastSyncedBlock = true } = options;
    const currentBlock = await subgraphClient.getMetadata().then((meta) => meta.block.number);

    let lastBlock = 0;
    if (startFromLastSyncedBlock) {
        lastBlock = await prisma.prismaLastBlockSynced
            .findFirst({
                where: { chain, category },
                select: { blockNumber: true },
            })
            .then((lastBlock) => lastBlock?.blockNumber || 0);
    }

    // Fetch pool IDs from DB
    const poolIdsInDb = await prisma.prismaPool
        .findMany({ where: { chain, ...(poolIds.length > 0 ? { id: { in: poolIds } } : {}) } })
        .then((pools) => pools.map((pool) => pool.id));

    if (poolIdsInDb.length === 0) {
        return [];
    }

    // Fetch snapshots from subgraph client
    const snapshots = await subgraphClient
        .getAllSnapshots({
            pool_: { isInitialized: true },
            ...(startFromLastSyncedBlock && lastBlock > 0 ? { _change_block: { number_gte: lastBlock } } : {}),
            ...(poolIds.length > 0 ? { pool_in: poolIds } : {}),
        })
        .then((snapshots) => snapshots.filter((snapshot) => poolIdsInDb.includes(snapshot.poolId)));

    if (!snapshots || snapshots.length === 0) {
        return [];
    }

    let mergedSnapshots: Prisma.PrismaPoolSnapshotUncheckedCreateInput[] = snapshots;

    if (startFromLastSyncedBlock) {
        // Get pool IDs and fetch the 2 latest snapshots for each from the DB
        const poolIds = [...new Set(snapshots.map((snapshot) => snapshot.poolId))];
        const dbSnapshots: Prisma.PrismaPoolSnapshotUncheckedCreateInput[] = await prisma.$queryRaw<
            (Prisma.PrismaPoolSnapshotUncheckedCreateInput & { row_num: number })[]
        >`
            WITH latest_snapshots AS (
                SELECT *,
                    ROW_NUMBER() OVER (PARTITION BY "poolId" ORDER BY "timestamp" DESC) AS row_num
                FROM "PrismaPoolSnapshot"
                WHERE "chain" = ${chain}::"Chain" AND "poolId" IN (${Prisma.join(poolIds)})
            )
            SELECT *
            FROM latest_snapshots
            WHERE row_num <= 2;
        `.then((snapshots) => snapshots.map(({ row_num, ...snapshot }) => snapshot));

        // Merge the new snapshots with the existing ones
        mergedSnapshots = Object.values(
            [...dbSnapshots, ...snapshots].reduce((acc, item) => {
                if (!acc[item.id]) {
                    acc[item.id] = { ...item }; // Create new entry if not exists
                } else {
                    acc[item.id] = { ...acc[item.id], ...item }; // Merge properties
                }
                return acc;
            }, {} as Record<string, Prisma.PrismaPoolSnapshotUncheckedCreateInput>),
        );
    }

    // Process snapshots
    const processedSnapshots = await processSnapshots(Promise.resolve(mergedSnapshots));

    // Use upserts to sync snapshots into the DB
    const upserts = processedSnapshots.map((snapshot) =>
        prisma.prismaPoolSnapshot.upsert({
            where: { id_chain: { id: snapshot.id, chain: snapshot.chain } },
            create: snapshot,
            update: snapshot,
        }),
    );

    // Execute upserts in batches
    const BATCH_SIZE = 500;
    for (let i = 0; i < upserts.length; i += BATCH_SIZE) {
        const batch = upserts.slice(i, i + BATCH_SIZE);
        await prisma.$transaction(batch);
    }

    // Update the last block synced
    if (startFromLastSyncedBlock || poolIds.length === 0) {
        await prisma.prismaLastBlockSynced.upsert({
            where: { category_chain: { chain, category } },
            create: { chain, category, blockNumber: currentBlock },
            update: { blockNumber: currentBlock },
        });
    }

    return processedSnapshots.map((snapshot) => snapshot.id);
}

export const processSnapshots = async (snapshots: Promise<Prisma.PrismaPoolSnapshotUncheckedCreateInput[]>) => {
    return snapshots.then(fillMissingTimestamps).then(applyUSDValues).then(computeDailyValues);
};
