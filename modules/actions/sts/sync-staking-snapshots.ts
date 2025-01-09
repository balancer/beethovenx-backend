import { Address } from 'viem';
import { prisma } from '../../../prisma/prisma-client';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import { StsSubgraphService } from '../../sources/subgraphs/sts-subgraph/sts.service';

export async function syncSonicStakingSnapshots(
    stakingContractAddress: Address,
    stsSubgraphClient: StsSubgraphService,
) {
    const latestSyncedRequest = await prisma.prismaSonicStakingDataSnapshot.findFirst({
        orderBy: {
            timestamp: 'desc',
        },
    });

    const allSnapshots = await stsSubgraphClient.getStakingSnapshotsAfter(latestSyncedRequest?.timestamp || 0);

    const operations = [];
    for (const snapshot of allSnapshots) {
        const snapshotData = {
            id: snapshot.id,
            timestamp: snapshot.snapshotTimestamp,
            totalAssetsPool: snapshot.totalPool,
            totalAssetsDelegated: snapshot.totalDelegated,
            totalAssets: snapshot.totalAssets,
            exchangeRate: snapshot.exchangeRate,
            sonicStakingId: stakingContractAddress,
        };
        operations.push(
            prisma.prismaSonicStakingDataSnapshot.upsert({
                where: { id: snapshotData.id },
                create: snapshotData,
                update: snapshotData,
            }),
        );
    }
    await prismaBulkExecuteOperations(operations);
}
