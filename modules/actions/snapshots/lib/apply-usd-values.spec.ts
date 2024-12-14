import { applyUSDValues } from './apply-usd-values'; // Adjust the import path
import { Prisma } from '@prisma/client';
import { vi } from 'vitest';

describe('applyUSDValues', () => {
    const mockFetchPrices = vi.fn();
    const mockFetchPoolTokens = vi.fn();

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('value updates', () => {
        it('should correctly calculate and update snapshot values', async () => {
            const rawSnapshots = [
                {
                    poolId: 'pool1',
                    chain: 'chain1',
                    timestamp: 1 * 86400,
                    dailyVolumes: ['100', '200'],
                    dailySwapFees: ['1', '2'],
                    dailySurpluses: ['3', '4'],
                    amounts: ['10', '20'],
                    totalSharesNum: 100,
                    totalSwapVolume: 500,
                    totalSwapFee: 10,
                    totalSurplus: 50,
                },
                {
                    poolId: 'pool1',
                    chain: 'chain1',
                    timestamp: 2 * 86400,
                    dailyVolumes: ['100', '200'],
                    dailySwapFees: ['1', '2'],
                    dailySurpluses: ['3', '4'],
                    amounts: ['10', '20'],
                    totalSharesNum: 100,
                    totalSwapVolume: 500,
                    totalSwapFee: 10,
                    totalSurplus: 50,
                },
            ];

            const mockPoolTokens = {
                pool1: [
                    { address: 'token1', index: 0 },
                    { address: 'token2', index: 1 },
                ],
            };

            const mockPrices = {
                token1: 2,
                token2: 3,
            };

            mockFetchPoolTokens.mockResolvedValue(mockPoolTokens);
            mockFetchPrices.mockResolvedValue(mockPrices);

            const result = await applyUSDValues(
                rawSnapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[],
                mockFetchPrices,
                mockFetchPoolTokens,
            );

            expect(result).toEqual([
                {
                    ...rawSnapshots[0],
                    volume24h: 200, // 100 * 2 (token1 price)
                    fees24h: 8, // 2 * 3 + 1 * 2
                    surplus24h: 18, // 4 * 3 + 3 * 2
                    totalLiquidity: 80, // 20 * 3 + 10 * 2
                    sharePrice: 0.8, // totalLiquidity / totalSharesNum
                },
                {
                    ...rawSnapshots[1],
                    volume24h: 200, // 100 * 2 (token2 price)
                    fees24h: 8, // 2 * 3 + 1 * 2
                    surplus24h: 18, // 4 * 3 + 3 * 2
                    totalLiquidity: 80, // 20 * 3 + 10 * 2
                    sharePrice: 0.8, // totalLiquidity / totalSharesNum
                    totalSwapVolume: rawSnapshots[0].totalSwapVolume + 200, // 500 + volume24h
                    totalSwapFee: 18, // 10 + fees24h
                    totalSurplus: 68, // 50 + surplus24h
                },
            ]);
        });

        it('should handle snapshots with missing token prices', async () => {
            const rawSnapshots = [
                {
                    poolId: 'pool2',
                    chain: 'chain2',
                    timestamp: 1633024800,
                    dailyVolumes: ['50', '100'],
                    dailySwapFees: ['0.5', '1'],
                    dailySurpluses: ['1.5', '2'],
                    amounts: ['5', '10'],
                    totalSharesNum: 50,
                    totalSwapVolume: 300,
                    totalSwapFee: 5,
                    totalSurplus: 20,
                },
            ]; // Explicit casting

            const mockPoolTokens = {
                pool2: [
                    { address: 'token3', index: 0 },
                    { address: 'token4', index: 1 },
                ],
            };

            const mockPrices = {
                token4: 1, // Missing token3 price
            };

            mockFetchPoolTokens.mockResolvedValue(mockPoolTokens);
            mockFetchPrices.mockResolvedValue(mockPrices);

            const result = await applyUSDValues(
                rawSnapshots as Prisma.PrismaPoolSnapshotUncheckedCreateInput[],
                mockFetchPrices,
                mockFetchPoolTokens,
            );

            expect(result).toEqual([
                {
                    ...rawSnapshots[0],
                    volume24h: Number(rawSnapshots[0].dailyVolumes[1]),
                    fees24h: Number(rawSnapshots[0].dailySwapFees[1]),
                    surplus24h: Number(rawSnapshots[0].dailySurpluses[1]),
                    totalLiquidity: Number(rawSnapshots[0].amounts[1]), // 5 * 1
                    sharePrice: Number(rawSnapshots[0].amounts[1]) / rawSnapshots[0].totalSharesNum,
                },
            ]);
        });
    });
});
