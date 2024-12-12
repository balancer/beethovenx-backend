import { Prisma } from '@prisma/client';
import _ from 'lodash';

export const computeDailyValues = (
    snapshots: Prisma.PrismaPoolSnapshotUncheckedCreateInput[],
): Prisma.PrismaPoolSnapshotUncheckedCreateInput[] => {
    // Group snapshots by poolId
    const groupedByPoolId = _.groupBy(snapshots, 'poolId');

    // Iterate through each group to compute daily values
    const updatedSnapshots = _.flatMap(groupedByPoolId, (snapshots) => {
        // Sort snapshots by timestamp for the pool
        const sortedSnapshots = _.sortBy(snapshots, 'timestamp');

        return sortedSnapshots.map((snapshot, index) => {
            const previousSnapshot = sortedSnapshots[index - 1];

            // Calculate daily values as the difference from the previous snapshot
            const volume24h = previousSnapshot
                ? Math.max((snapshot.totalSwapVolume || 0) - (previousSnapshot?.totalSwapVolume || 0), 0)
                : snapshot.volume24h;
            const fees24h = previousSnapshot
                ? Math.max((snapshot.totalSwapFee || 0) - (previousSnapshot?.totalSwapFee || 0), 0)
                : snapshot.fees24h;

            return {
                ...snapshot,
                volume24h,
                fees24h,
            };
        });
    });

    return updatedSnapshots;
};
