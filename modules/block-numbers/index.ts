import { Chain, Prisma } from '@prisma/client';
import { prisma } from '../../prisma/prisma-client';

export const blockNumbers = (db = prisma) => ({
    /**
     * Get the block number for a given timestamp
     *
     * @param chain
     * @param timestamp
     * @returns
     */
    async getBlock(chain: Chain, timestamp: number) {
        const [event] = await db.$queryRawUnsafe<{ blockNumber: number }[]>(`
            SELECT "blockNumber"
            FROM "PartitionedPoolEvent"
            WHERE chain = '${chain}'
            AND "blockTimestamp" <= ${timestamp}::integer
            ORDER BY "blockTimestamp" DESC
            LIMIT 1;
        `);

        return event?.blockNumber;
    },
    /**
     * Gets the number of blocks per day meaning the speed of the chain.
     * Calculated from average number of blocks per day for the last 3 days.
     *
     * @param chain
     * @param timestamp
     * @returns
     */
    async getBlocksPerDay(chain: Chain) {
        const [blocks] = await db.$queryRawUnsafe<{ max: number; min: number }[]>(`
            SELECT
                MAX("blockNumber") as max,
                MIN("blockNumber") as min
            FROM "PartitionedPoolEvent"
            WHERE chain = '${chain}'
            AND "blockTimestamp" >= (EXTRACT(EPOCH FROM NOW()) - 86400 * 3)::integer;
        `);

        const range = blocks.max - blocks.min;

        return Math.ceil(range / 3);
    },
    /**
     * Block numbers for the last n days closest to 00:00:00 (UTC)
     *
     * @param chain
     * @param days
     * @returns
     */
    async getDailyBlocks(chain: Chain, days: number) {
        const blocks = await db.$queryRawUnsafe<{ timestamp: number; number: number }[]>(`
            SELECT 
                ("blockTimestamp"/86400)::INTEGER * 86400 as timestamp,
                MIN("blockNumber") as number
            FROM "PartitionedPoolEvent"
            WHERE chain = '${chain}'
            AND "blockTimestamp" >= ((EXTRACT(EPOCH FROM NOW()) / 86400)::integer * 86400 - 86400 * ${days})::integer
            GROUP BY 1
            ORDER BY 1 DESC;
        `);

        return blocks;
    },
});
