import { Chain } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';
import { V2SubgraphClient } from '../../subgraphs/balancer-subgraph';
import _ from 'lodash';
import { snapshotsV2Transformer } from '../../sources/transformers/snapshots-v2-transformer';

const protocolVersion = 2;

export async function syncSnapshotsV2All(
    subgraphClient: V2SubgraphClient,
    chain: Chain,
    poolId?: string,
): Promise<string[]> {
    // Get all snapshot IDs from subgraph
    const snapshotIds = await subgraphClient.getAllSnapshotIds(poolId);

    // DB ids
    const dbIds = await prisma.prismaPoolSnapshot
        .findMany({
            where: {
                chain,
                protocolVersion,
                poolId,
            },
            select: {
                id: true,
            },
        })
        .then((snapshots) => snapshots.map(({ id }) => id));

    console.log(`Found ${snapshotIds.length} snapshots in subgraph`);
    console.log(`Found ${dbIds.length} snapshots in DB`);

    // Find missing snapshots
    let missingIds = _.difference(snapshotIds, dbIds);
    console.log(`Found ${missingIds.length} missing snapshots`);

    if (missingIds.length === 0) {
        return [];
    }

    // Fetch missing snapshots, but only for current pool IDs
    if (!poolId) {
        const poolIds = await prisma.prismaPool
            .findMany({
                where: { chain },
                select: { id: true },
            })
            .then((pools) => new Set(pools.map(({ id }) => id)));

        missingIds = missingIds.filter((id) => poolIds.has(id.split('-')[0]));
    }

    // Fetch missing snapshots
    // Batch missing ids by 1000 items
    const batchSize = 1000;
    const missingIdsBatched = _.chunk(missingIds, batchSize);
    const snapshots = await Promise.allSettled(
        missingIdsBatched.map(async (ids) => {
            const snapshots = await subgraphClient.BalancerPoolSnapshots({
                where: { id_in: ids },
                first: batchSize,
            });
            return snapshots;
        }),
    ).then((results) =>
        results.flatMap((result) => {
            if (result.status === 'fulfilled') {
                return result.value.poolSnapshots;
            }
            return [];
        }),
    );
    // Group snapshots by timestamp
    const groupedSnapshots = _.groupBy(snapshots, 'timestamp');
    console.log(`Found ${Object.keys(groupedSnapshots).length} unique timestamps`);

    // Process snapshots
    await Promise.all(
        Object.entries(groupedSnapshots).flatMap(async ([timestampStr, snapshots]) => {
            const timestamp = Number(timestampStr);
            console.log(`Processing ${snapshots.length} snapshots for timestamp ${timestamp}`);

            // Get prices for the timestamp
            const prices = await prisma.prismaTokenPrice
                .findMany({
                    where: {
                        chain,
                        timestamp,
                    },
                    select: {
                        tokenAddress: true,
                        price: true,
                    },
                })
                .then((prices) =>
                    prices.reduce<{ [address: string]: number }>(
                        (acc, p) => ({ ...acc, [p.tokenAddress]: p.price }),
                        {},
                    ),
                );

            const snapshotsTransformed = snapshots.map((snapshot) =>
                snapshotsV2Transformer(
                    snapshot.pool.id,
                    snapshot.pool.tokens!.map((t) => t.address),
                    timestamp,
                    chain,
                    prices,
                    undefined,
                    snapshot,
                ),
            );

            return snapshotsTransformed
                .filter((s): s is NonNullable<typeof s> => s !== undefined)
                .map((s) =>
                    prisma.prismaPoolSnapshot
                        .upsert({
                            where: {
                                id_chain: {
                                    id: s.id,
                                    chain,
                                },
                            },
                            create: s,
                            update: s,
                        })
                        .catch(console.error),
                );
        }),
    );

    return missingIds;
}
