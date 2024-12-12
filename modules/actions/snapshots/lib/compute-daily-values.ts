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

        // Handle edge case when there is only one snapshot per pool
        if (sortedSnapshots.length === 1) {
            return [
                {
                    ...sortedSnapshots[0],
                    volume24h: sortedSnapshots[0].totalSwapVolume || 0,
                    fees24h: sortedSnapshots[0].totalSwapFee || 0,
                },
            ];
        }

        return sortedSnapshots.map((snapshot, index) => {
            const previousSnapshot = sortedSnapshots[index - 1];

            // Initialize daily values with the snapshot values
            let volume24h = snapshot.volume24h || 0;
            let fees24h = snapshot.fees24h || 0;

            // Calculate daily values as the difference from the previous snapshot
            if (previousSnapshot) {
                volume24h = Math.max((snapshot.totalSwapVolume || 0) - (previousSnapshot.totalSwapVolume || 0), 0);
                fees24h = Math.max((snapshot.totalSwapFee || 0) - (previousSnapshot.totalSwapFee || 0), 0);
            }

            return {
                ...snapshot,
                volume24h,
                fees24h,
            };
        });
    });

    return updatedSnapshots;
};
