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
        // it's not enough, because won't handle the first snapshot when syncing from scratch,
        // needs a separate action
        if (sortedSnapshots.length === 1) {
            return [
                {
                    ...sortedSnapshots[0],
                    dailyVolumes: sortedSnapshots[0].totalVolumes || [],
                    dailySwapFees: sortedSnapshots[0].totalSwapFees || [],
                    dailySurpluses: sortedSnapshots[0].totalSurpluses || [],
                },
            ];
        }

        return _.map(sortedSnapshots, (snapshot, index) => {
            const previousSnapshot = sortedSnapshots[index - 1];

            // Initialize daily values with the snapshot values
            let dailyVolumes = sortedSnapshots[0].totalVolumes || [];
            let dailySwapFees = sortedSnapshots[0].totalSwapFees || [];
            let dailySurpluses = sortedSnapshots[0].totalSurpluses || [];

            // Calculate daily values as the difference from the previous snapshot
            if (previousSnapshot) {
                dailyVolumes = diff(snapshot.totalVolumes as string[], previousSnapshot.totalVolumes as string[]);
                dailySwapFees = diff(snapshot.totalSwapFees as string[], previousSnapshot.totalSwapFees as string[]);
                dailySurpluses = diff(snapshot.totalSurpluses as string[], previousSnapshot.totalSurpluses as string[]);
            }

            return {
                ...snapshot,
                dailyVolumes,
                dailySwapFees,
                dailySurpluses,
            };
        });
    });

    return updatedSnapshots;
};

// Helper function to calculate the daily values
const diff = (current: string[], previous: string[]) =>
    current.map((value, i) => String(parseFloat(value) - parseFloat(previous[i] || '0')));
