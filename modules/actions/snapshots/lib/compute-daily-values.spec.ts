import { computeDailyValues } from './compute-daily-values';
import { Prisma } from '@prisma/client';

describe('computeDailyValues', () => {
    it('should compute inital values for a single snapshot', () => {
        const inputSnapshots = [{ id: '1', poolId: 'poolA', timestamp: 86400, totalSwapVolume: 100, totalSwapFee: 10 }];

        const expectedOutput = [
            {
                id: '1',
                poolId: 'poolA',
                timestamp: 86400,
                totalSwapVolume: 100,
                totalSwapFee: 10,
                volume24h: 100,
                fees24h: 10,
            },
        ];

        const result = computeDailyValues(inputSnapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[]);

        expect(result).toEqual(expectedOutput);
    });
    it('should compute daily values for a single pool', () => {
        const inputSnapshots = [
            { id: '1', poolId: 'poolA', timestamp: 86400, totalSwapVolume: 100, totalSwapFee: 10 },
            {
                id: '2',
                poolId: 'poolA',
                timestamp: 2 * 86400,
                totalSwapVolume: 300,
                totalSwapFee: 30,
            },
            {
                id: '3',
                poolId: 'poolA',
                timestamp: 3 * 86400,
                totalSwapVolume: 600,
                totalSwapFee: 50,
            },
        ];

        const expectedOutput = [
            {
                id: '1',
                poolId: 'poolA',
                timestamp: 86400,
                totalSwapVolume: 100,
                totalSwapFee: 10,
                volume24h: 0,
                fees24h: 0,
            },
            {
                id: '2',
                poolId: 'poolA',
                timestamp: 2 * 86400,
                totalSwapVolume: 300,
                totalSwapFee: 30,
                volume24h: 200,
                fees24h: 20,
            },
            {
                id: '3',
                poolId: 'poolA',
                timestamp: 3 * 86400,
                totalSwapVolume: 600,
                totalSwapFee: 50,
                volume24h: 300,
                fees24h: 20,
            },
        ];

        const result = computeDailyValues(inputSnapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[]);

        expect(result).toEqual(expectedOutput);
    });

    it('should handle multiple pools independently', () => {
        const inputSnapshots = [
            { id: '1', poolId: 'poolA', timestamp: 86400, totalSwapVolume: 100, totalSwapFee: 10 },
            {
                id: '2',
                poolId: 'poolA',
                timestamp: 2 * 86400,
                totalSwapVolume: 300,
                totalSwapFee: 30,
            },
            { id: '3', poolId: 'poolB', timestamp: 86400, totalSwapVolume: 200, totalSwapFee: 20 },
            {
                id: '4',
                poolId: 'poolB',
                timestamp: 2 * 86400,
                totalSwapVolume: 500,
                totalSwapFee: 50,
            },
        ];

        const expectedOutput = [
            {
                id: '1',
                poolId: 'poolA',
                timestamp: 86400,
                totalSwapVolume: 100,
                totalSwapFee: 10,
                volume24h: 0,
                fees24h: 0,
            },
            {
                id: '2',
                poolId: 'poolA',
                timestamp: 2 * 86400,
                totalSwapVolume: 300,
                totalSwapFee: 30,
                volume24h: 200,
                fees24h: 20,
            },
            {
                id: '3',
                poolId: 'poolB',
                timestamp: 86400,
                totalSwapVolume: 200,
                totalSwapFee: 20,
                volume24h: 0,
                fees24h: 0,
            },
            {
                id: '4',
                poolId: 'poolB',
                timestamp: 2 * 86400,
                totalSwapVolume: 500,
                totalSwapFee: 50,
                volume24h: 300,
                fees24h: 30,
            },
        ];

        const result = computeDailyValues(inputSnapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[]);

        expect(result).toEqual(expectedOutput);
    });
    it('should handle missing totalSwapVolume and totalSwapFee gracefully', () => {
        const inputSnapshots = [
            {
                id: '2',
                poolId: 'poolA',
                timestamp: 2 * 86400,
                totalSwapVolume: 200,
                totalSwapFee: 20,
                volume24h: 100,
                fees24h: 10,
            },
            { id: '3', poolId: 'poolA', timestamp: 3 * 86400, totalSwapVolume: 400, totalSwapFee: 40 },
        ];

        const expectedOutput = [
            {
                id: '2',
                poolId: 'poolA',
                timestamp: 2 * 86400,
                totalSwapVolume: 200,
                totalSwapFee: 20,
                volume24h: 100,
                fees24h: 10,
            },
            {
                id: '3',
                poolId: 'poolA',
                timestamp: 3 * 86400,
                totalSwapVolume: 400,
                totalSwapFee: 40,
                volume24h: 200,
                fees24h: 20,
            },
        ];

        const result = computeDailyValues(inputSnapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[]);

        expect(result).toEqual(expectedOutput);
    });

    it('should return an empty array when input is empty', () => {
        const inputSnapshots = [];

        const result = computeDailyValues(inputSnapshots);

        expect(result).toEqual([]);
    });
});
