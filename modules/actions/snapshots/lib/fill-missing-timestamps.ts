import { Prisma } from '@prisma/client';
import { secondsPerDay } from '../../../common/time';
import _ from 'lodash';

export const fillMissingTimestamps = (
    items: Prisma.PrismaPoolSnapshotUncheckedCreateInput[],
): Prisma.PrismaPoolSnapshotUncheckedCreateInput[] => {
    // Group items by poolId
    const grouped = _.groupBy(items, 'poolId');

    // Iterate over each poolId group
    const filledGroups = _.flatMap(grouped, (groupItems, poolId) => {
        // Sort the group by timestamp
        const sortedItems = _.sortBy(groupItems, 'timestamp');

        // Find the range of timestamps
        const timestamps = sortedItems.map((item) => item.timestamp);
        const minTimestamp = _.min(timestamps) ?? 0;
        const maxTimestamp = _.max(timestamps) ?? 0;

        // Generate all timestamps within the range
        const allTimestamps: number[] = [];
        for (let ts = minTimestamp; ts <= maxTimestamp; ts += secondsPerDay) {
            allTimestamps.push(ts);
        }

        // If all timestamps are already present, no need to fill
        if (sortedItems.length === allTimestamps.length) {
            return sortedItems;
        }

        // Fill missing timestamps
        const filledItems: Prisma.PrismaPoolSnapshotUncheckedCreateInput[] = [];
        let lastKnownItem: Prisma.PrismaPoolSnapshotUncheckedCreateInput | null = null;

        for (const timestamp of allTimestamps) {
            const existingItem = sortedItems.find((item) => item.timestamp === timestamp);
            if (existingItem) {
                filledItems.push(existingItem);
                lastKnownItem = existingItem;
            } else if (lastKnownItem) {
                // Clone the last known item and update the timestamp
                filledItems.push({ ...lastKnownItem, timestamp, id: `${poolId}-${timestamp}` });
            }
        }

        return filledItems;
    });

    return filledGroups;
};
