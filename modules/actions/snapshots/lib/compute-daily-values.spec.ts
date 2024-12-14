import { computeDailyValues } from './compute-daily-values';
import { Prisma } from '@prisma/client';

const defaultSnapshot = {
    poolId: '1',
    timestamp: 1 * 86400,
    totalVolumes: ['100', '200'],
    totalSwapFees: ['10', '20'],
    totalSurpluses: ['5', '15'],
};

describe('computeDailyValues', () => {
    it('should return an empty array when input is empty', () => {
        const result = computeDailyValues([]);
        expect(result).toEqual([]);
    });

    it('should handle a single snapshot per pool correctly', () => {
        const snapshots = [defaultSnapshot];
        const result = computeDailyValues(snapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[]);
        expect(result).toEqual([
            {
                ...defaultSnapshot,
                dailyVolumes: ['100', '200'],
                dailySwapFees: ['10', '20'],
                dailySurpluses: ['5', '15'],
            },
        ]);
    });

    it('should calculate daily values for multiple snapshots of a single pool', () => {
        const snapshots = [
            { ...defaultSnapshot },
            {
                ...defaultSnapshot,
                timestamp: 2 * 86400,
                totalVolumes: ['150', '250'],
                totalSwapFees: ['15', '25'],
                totalSurpluses: ['10', '20'],
            },
        ];
        const result = computeDailyValues(snapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[]);
        expect(result).toEqual([
            {
                ...defaultSnapshot,
                dailyVolumes: ['100', '200'],
                dailySwapFees: ['10', '20'],
                dailySurpluses: ['5', '15'],
            },
            {
                ...defaultSnapshot,
                timestamp: 2 * 86400,
                totalVolumes: ['150', '250'],
                totalSwapFees: ['15', '25'],
                totalSurpluses: ['10', '20'],
                dailyVolumes: ['50', '50'],
                dailySwapFees: ['5', '5'],
                dailySurpluses: ['5', '5'],
            },
        ]);
    });

    it('should calculate daily values for multiple pools', () => {
        const snapshots = [
            { ...defaultSnapshot },
            {
                ...defaultSnapshot,
                poolId: '2',
                totalVolumes: ['200', '400'],
                totalSwapFees: ['20', '40'],
                totalSurpluses: ['10', '30'],
            },
            {
                ...defaultSnapshot,
                timestamp: 2 * 86400,
                totalVolumes: ['150', '250'],
                totalSwapFees: ['15', '25'],
                totalSurpluses: ['10', '20'],
            },
            {
                ...defaultSnapshot,
                poolId: '2',
                timestamp: 2 * 86400,
                totalVolumes: ['250', '450'],
                totalSwapFees: ['25', '45'],
                totalSurpluses: ['15', '35'],
            },
        ];
        const result = computeDailyValues(snapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[]);
        expect(result).toEqual([
            {
                ...defaultSnapshot,
                dailyVolumes: ['100', '200'],
                dailySwapFees: ['10', '20'],
                dailySurpluses: ['5', '15'],
            },
            {
                ...defaultSnapshot,
                timestamp: 2 * 86400,
                totalVolumes: ['150', '250'],
                totalSwapFees: ['15', '25'],
                totalSurpluses: ['10', '20'],
                dailyVolumes: ['50', '50'],
                dailySwapFees: ['5', '5'],
                dailySurpluses: ['5', '5'],
            },
            {
                ...defaultSnapshot,
                poolId: '2',
                totalVolumes: ['200', '400'],
                totalSwapFees: ['20', '40'],
                totalSurpluses: ['10', '30'],
                dailyVolumes: ['200', '400'],
                dailySwapFees: ['20', '40'],
                dailySurpluses: ['10', '30'],
            },
            {
                ...defaultSnapshot,
                poolId: '2',
                timestamp: 2 * 86400,
                totalVolumes: ['250', '450'],
                totalSwapFees: ['25', '45'],
                totalSurpluses: ['15', '35'],
                dailyVolumes: ['50', '50'],
                dailySwapFees: ['5', '5'],
                dailySurpluses: ['5', '5'],
            },
        ]);
    });

    it('should never overwrite the first snapshot daily values', () => {
        const snapshots = [
            {
                ...defaultSnapshot,
                dailyVolumes: ['100', '200'],
                dailySwapFees: ['10', '20'],
                dailySurpluses: ['5', '15'],
            },
            {
                ...defaultSnapshot,
                timestamp: 2 * 86400,
                totalVolumes: ['150', '250'],
                totalSwapFees: ['15', '25'],
                totalSurpluses: ['10', '20'],
                dailyVolumes: ['200', '400'],
                dailySwapFees: ['20', '40'],
                dailySurpluses: ['10', '30'],
            },
        ];
        const result = computeDailyValues(snapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[]);
        expect(result[0].dailyVolumes).toBe(snapshots[0].dailyVolumes);
        expect(result[0].dailySwapFees).toBe(snapshots[0].dailySwapFees);
        expect(result[0].dailySurpluses).toBe(snapshots[0].dailySurpluses);
    });
});
