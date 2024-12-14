import { getLiquidityAndSharesAtTimestamp } from './get-liquidity-and-shares-at-timestamp';
import { vi } from 'vitest';

vi.mock('../../../prisma/prisma-client', () => ({
    prisma: {
        prismaTokenPrice: {
            findMany: vi.fn().mockResolvedValue(
                Array.from({ length: 4 }, (_, i) => ({
                    tokenAddress: `0x${i}`,
                    price: i + 1,
                })),
            ),
        },
    },
}));

const blockNumbersSubgraphClient = {
    fetchBlockByTime: vi.fn().mockResolvedValue(1),
};

describe('getLiquidityAndSharesAtTimestamp', () => {
    it('should return null if there are no pools', async () => {
        const subgraphClient = {
            getAllPoolBalances: vi.fn().mockResolvedValue([]),
        };
        const result = await getLiquidityAndSharesAtTimestamp(
            [],
            subgraphClient as any,
            blockNumbersSubgraphClient as any,
        );
        expect(result).toBeNull();
    });

    it('should return null if there are no token addresses', async () => {
        const subgraphClient = {
            getAllPoolBalances: vi.fn().mockResolvedValue([
                {
                    id: '0x0',
                    address: '0x0',
                    tokens: [],
                },
            ]),
        };
        const result = await getLiquidityAndSharesAtTimestamp(
            ['0x0'],
            subgraphClient as any,
            blockNumbersSubgraphClient as any,
        );
        expect(result).toBeNull();
    });

    it.only('should return the correct TVLs', async () => {
        const tokens = Array.from({ length: 4 }, (_, i) => ({
            address: `0x${i}`,
            balance: `${i + 1}00`,
            priceRate: `1.${i}`,
        }));

        const subgraphClient = {
            getAllPoolBalances: vi.fn().mockResolvedValue([
                {
                    id: '0x0',
                    address: '0x0',
                    tokens,
                },
            ]),
        };
        const result = await getLiquidityAndSharesAtTimestamp(
            ['0x0'],
            subgraphClient as any,
            blockNumbersSubgraphClient as any,
        );

        // 0x0 is BPT, so is filtered out;
        // 200 * 2 * 1.1 + 300 * 3 * 1.2 + 400 * 4 * 1.3 = 3600
        expect(result).toEqual({ '0x0': { tvl: 3600 } });
    });
});
