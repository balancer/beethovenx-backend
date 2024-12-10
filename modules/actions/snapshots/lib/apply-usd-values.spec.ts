import { applyUSDValues } from './apply-usd-values';
import { Chain, Prisma } from '@prisma/client';

describe('applyUSDValues', () => {
    const mockFetchPrices = jest.fn();
    const mockFetchPoolTokens = jest.fn();

    const chain: Chain = 'MAINNET';

    it('should calculate USD values for snapshots correctly', async () => {
        const inputSnapshots = [
            {
                id: '1',
                poolId: 'poolA',
                timestamp: 86400,
                amounts: ['100', '200'],
                totalVolumes: ['50', '100'],
                totalProtocolSwapFees: ['5', '10'],
                totalSharesNum: 500,
                chain,
            },
            {
                id: '2',
                poolId: 'poolB',
                timestamp: 86400,
                amounts: ['300'],
                totalVolumes: ['200'],
                totalProtocolSwapFees: ['20'],
                totalSharesNum: 300,
                chain,
            },
        ];

        mockFetchPrices.mockResolvedValueOnce({
            token1: 2,
            token2: 3,
            token3: 5,
        });

        mockFetchPoolTokens.mockResolvedValueOnce({
            poolA: [
                { index: 0, address: 'token1' },
                { index: 1, address: 'token2' },
            ],
            poolB: [{ index: 0, address: 'token3' }],
        });

        const expectedOutput = [
            {
                id: '1',
                poolId: 'poolA',
                timestamp: 86400,
                amounts: ['100', '200'],
                totalVolumes: ['50', '100'],
                totalProtocolSwapFees: ['5', '10'],
                totalSharesNum: 500,
                chain,
                totalLiquidity: 800, // (100 * 2 + 200 * 3)
                totalSwapVolume: 400, // (50 * 2 + 100 * 3)
                totalSwapFee: 40, // (5 * 2 + 10 * 3)
                sharePrice: 1.6, // totalLiquidity / totalSharesNum
            },
            {
                id: '2',
                poolId: 'poolB',
                timestamp: 86400,
                amounts: ['300'],
                totalVolumes: ['200'],
                totalProtocolSwapFees: ['20'],
                totalSharesNum: 300,
                chain,
                totalLiquidity: 1500, // (300 * 5)
                totalSwapVolume: 1000, // (200 * 5)
                totalSwapFee: 100, // (20 * 5)
                sharePrice: 5, // totalLiquidity / totalSharesNum
            },
        ];

        const result = await applyUSDValues(
            inputSnapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[],
            mockFetchPrices,
            mockFetchPoolTokens,
        );

        expect(result).toEqual(expectedOutput);
    });

    it('should skip snapshots without amounts, volumes, or fees', async () => {
        const inputSnapshots = [
            {
                id: '1',
                poolId: 'poolA',
                timestamp: 86400,
                chain,
            },
            {
                id: '2',
                poolId: 'poolB',
                timestamp: 86400,
                amounts: ['300'],
                totalVolumes: ['200'],
                totalProtocolSwapFees: ['20'],
                totalSharesNum: 300,
                chain,
            },
        ];

        mockFetchPrices.mockResolvedValueOnce({
            token3: 5,
        });

        mockFetchPoolTokens.mockResolvedValueOnce({
            poolB: [{ index: 0, address: 'token3' }],
        });

        const expectedOutput = [
            {
                id: '1',
                poolId: 'poolA',
                timestamp: 86400,
                chain,
            }, // Unchanged
            {
                id: '2',
                poolId: 'poolB',
                timestamp: 86400,
                amounts: ['300'],
                totalVolumes: ['200'],
                totalProtocolSwapFees: ['20'],
                totalSharesNum: 300,
                chain,
                totalLiquidity: 1500, // (300 * 5)
                totalSwapVolume: 1000, // (200 * 5)
                totalSwapFee: 100, // (20 * 5)
                sharePrice: 5, // totalLiquidity / totalSharesNum
            },
        ];

        const result = await applyUSDValues(
            inputSnapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[],
            mockFetchPrices,
            mockFetchPoolTokens,
        );

        expect(result).toEqual(expectedOutput);
    });

    it('should handle missing pool tokens gracefully', async () => {
        const inputSnapshots = [
            {
                id: '1',
                poolId: 'poolA',
                timestamp: 86400,
                amounts: ['100', '200'],
                totalVolumes: ['50', '100'],
                totalProtocolSwapFees: ['5', '10'],
                totalSharesNum: 500,
                chain,
            },
        ];

        mockFetchPrices.mockResolvedValueOnce({});
        mockFetchPoolTokens.mockResolvedValueOnce({});

        const expectedOutput = [
            {
                id: '1',
                poolId: 'poolA',
                timestamp: 86400,
                amounts: ['100', '200'],
                totalVolumes: ['50', '100'],
                totalProtocolSwapFees: ['5', '10'],
                totalSharesNum: 500,
                chain,
            }, // Unchanged
        ];

        const result = await applyUSDValues(
            inputSnapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[],
            mockFetchPrices,
            mockFetchPoolTokens,
        );

        expect(result).toEqual(expectedOutput);
    });

    it('should return an empty array if no snapshots are provided', async () => {
        const inputSnapshots = [];

        const result = await applyUSDValues(inputSnapshots, mockFetchPrices, mockFetchPoolTokens);

        expect(result).toEqual([]);
    });
});
