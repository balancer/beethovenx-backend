import { Chain } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';

// This function is a special case for the initial snapshots
export const specialCaseForInitialSnapshots = async (chain: Chain) => {
    return prisma.$executeRaw`WITH single_snapshot_pools AS (
        SELECT
            "poolId",
            COUNT(*) AS record_count
        FROM
            public."PrismaPoolSnapshot"
        WHERE
            "protocolVersion" = 3
            AND chain = ${chain}::"Chain"
        GROUP BY
            "poolId"
        HAVING
            COUNT(*) = 1
    )
    UPDATE public."PrismaPoolSnapshot" AS ps
    SET
        volume24h = ps."totalSwapVolume",
        fees24h = ps."totalSwapFee"
    FROM
        single_snapshot_pools srp
    WHERE
        "protocolVersion" = 3
        AND ps."poolId" = srp."poolId"
        AND ps.chain = ${chain}::"Chain";`;
};
