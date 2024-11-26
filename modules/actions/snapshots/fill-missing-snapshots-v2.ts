import { Chain } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';
import { snapshotsV2Transformer } from '../../sources/transformers/snapshots-v2-transformer';

// For each pool in the database, find the missing snapshots,
// fetch previous day entries from the database,
// and fill the missing snapshots with the previous day's data.
export const fillMissingSnapshotsV2 = async (chain: Chain, poolId?: string): Promise<string[]> => {
    const pools = await prisma.prismaPool.findMany({
        select: {
            id: true,
            tokens: {
                select: {
                    index: true,
                    address: true,
                },
            },
        },
        where: {
            protocolVersion: 2,
            chain,
            ...(poolId ? { id: poolId } : {}),
        },
    });

    // Return list of missing timestamps for a pool
    const filledIn: string[] = [];
    for (const pool of pools) {
        const poolId = pool.id;
        const missingTimestamps = await prisma.$queryRawUnsafe<{ day: number }[]>(
            `
            WITH pool_snapshots AS (
                SELECT * FROM "PrismaPoolSnapshot"
                WHERE chain = '${chain}'
                AND "poolId" = '${poolId}'
            ), date_range AS (
                SELECT generate_series(MIN(DATE_TRUNC('day', to_timestamp(timestamp)))::date, MAX(DATE_TRUNC('day', to_timestamp(timestamp)))::date, '1 day'::interval) AS day
                FROM pool_snapshots
            )
            SELECT 
                EXTRACT(EPOCH from dr.day)::int as day
            FROM date_range dr
            LEFT JOIN pool_snapshots e ON dr.day = DATE_TRUNC('day', to_timestamp(timestamp))::date
            WHERE e.id IS NULL
            ORDER BY dr.day;
        `,
        );

        if (missingTimestamps.length === 0) {
            console.log(`All snapshots in place for pool ${poolId}.`);
            continue;
        }

        console.log(`Pool ${poolId} has ${missingTimestamps.length} missing snapshots.`);

        for (const missingTimestamp of missingTimestamps) {
            const timestamp = missingTimestamp.day;
            const previousSnapshot = await prisma.prismaPoolSnapshot.findFirst({
                where: {
                    chain: chain,
                    poolId: poolId,
                    timestamp: timestamp - 86400,
                },
            });

            if (!previousSnapshot) {
                console.log(`Could not find previous snapshot for pool ${poolId} on day ${timestamp}.`);
                continue;
            }

            // Get prices for that day
            const prices = (
                await prisma.prismaTokenPrice.findMany({
                    where: {
                        chain,
                        timestamp,
                    },
                    select: {
                        tokenAddress: true,
                        price: true,
                    },
                })
            ).reduce((acc, { tokenAddress, price }) => {
                acc[tokenAddress] = price;
                return acc;
            }, {} as Record<string, number>);

            const tokens =
                pools
                    .find((p) => p.id === poolId)
                    ?.tokens.reduce((acc, t) => {
                        acc[t.index] = t.address;
                        return acc;
                    }, [] as string[]) ?? [];

            const data = snapshotsV2Transformer(poolId, tokens, timestamp, chain, prices, previousSnapshot);

            if (!data) {
                console.log(`Could not fill in missing snapshot for pool ${poolId} on day ${timestamp}.`);
                continue;
            }

            await prisma.prismaPoolSnapshot.create({
                data,
            });

            filledIn.push(`${poolId}-${timestamp}`);
        }
    }

    return filledIn;
};
