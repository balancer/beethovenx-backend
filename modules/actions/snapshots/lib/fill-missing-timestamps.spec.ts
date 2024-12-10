import { fillMissingTimestamps } from './fill-missing-timestamps';
import { Prisma } from '@prisma/client';

describe('fillMissingTimestamps', () => {
    const secondsPerDay = 86400;

    it('should fill missing timestamps correctly', () => {
        const inputSnapshots = [
            { id: 'poolA-86400', poolId: 'poolA', timestamp: 86400 },
            { id: `poolA-${3 * secondsPerDay}`, poolId: 'poolA', timestamp: 3 * secondsPerDay },
        ];

        const expectedOutput = [
            { id: 'poolA-86400', poolId: 'poolA', timestamp: 86400 },
            { id: `poolA-${2 * secondsPerDay}`, poolId: 'poolA', timestamp: 2 * secondsPerDay },
            { id: `poolA-${3 * secondsPerDay}`, poolId: 'poolA', timestamp: 3 * secondsPerDay },
        ];

        const result = fillMissingTimestamps(inputSnapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[]);

        expect(result).toEqual(expectedOutput);
    });

    it('should handle groups with no missing timestamps', () => {
        const inputSnapshots = [
            { id: '1', poolId: 'poolB', timestamp: 86400 },
            { id: '2', poolId: 'poolB', timestamp: 2 * secondsPerDay },
            { id: '3', poolId: 'poolB', timestamp: 3 * secondsPerDay },
        ];

        const expectedOutput = [...inputSnapshots];

        const result = fillMissingTimestamps(inputSnapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[]);

        expect(result).toEqual(expectedOutput);
    });

    it('should return an empty array if the input is empty', () => {
        const inputSnapshots: Prisma.PrismaPoolSnapshotUncheckedCreateInput[] = [];
        const result = fillMissingTimestamps(inputSnapshots);

        expect(result).toEqual([]);
    });

    it('should handle multiple pools independently', () => {
        const inputSnapshots = [
            { id: 'poolA-86400', poolId: 'poolA', timestamp: 86400 },
            { id: `poolA-${3 * secondsPerDay}`, poolId: 'poolA', timestamp: 3 * secondsPerDay },
            { id: '3', poolId: 'poolB', timestamp: 2 * secondsPerDay },
        ];

        const expectedOutput = [
            { id: 'poolA-86400', poolId: 'poolA', timestamp: 86400 },
            { id: `poolA-${2 * secondsPerDay}`, poolId: 'poolA', timestamp: 2 * secondsPerDay }, // Filled for poolA
            { id: `poolA-${3 * secondsPerDay}`, poolId: 'poolA', timestamp: 3 * secondsPerDay },
            { id: '3', poolId: 'poolB', timestamp: 2 * secondsPerDay }, // poolB unchanged
        ];

        const result = fillMissingTimestamps(inputSnapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[]);

        expect(result).toEqual(expectedOutput);
    });
});
