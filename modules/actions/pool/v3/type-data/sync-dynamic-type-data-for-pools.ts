/**
 * Dynamic data changes over time and needs to be updated periodically.
 * Contract data is used as a source of truth.
 */

import { PoolsClient } from '../../../../sources/contracts';
import { PrismaPool, PrismaPoolType } from '@prisma/client';
import { StableTypeData } from '../../../../sources/contracts/pool-type-dynamic-data';
import { prisma } from '../../../../../prisma/prisma-client';
import { prismaBulkExecuteOperations } from '../../../../../prisma/prisma-util';

export async function syncDynamicTypeDataForPools(
    poolsClient: PoolsClient,
    pools: PrismaPool[],
    blockNumber?: bigint,
): Promise<void> {
    // Get dynamic data for each pool type
    const poolTypeData = await poolsClient.fetchPoolTypeData(pools, blockNumber);
    const operations = [];

    for (const pool of pools) {
        const poolTypeDataForPool = poolTypeData.find((data) => data.id === pool.id);
        if (pool.type === PrismaPoolType.STABLE) {
            //only update if data has changed
            if (
                (pool.typeData as StableTypeData).amp !== poolTypeDataForPool?.typeData.amp ||
                (pool.typeData as StableTypeData).bptPriceRate !== poolTypeDataForPool?.typeData.bptPriceRate
            ) {
                operations.push(
                    prisma.prismaPool.update({
                        where: { id_chain: { id: pool.id, chain: pool.chain } },
                        data: {
                            typeData: {
                                ...(pool.typeData as StableTypeData),
                                amp: poolTypeDataForPool?.typeData.amp,
                                bptPriceRate: poolTypeDataForPool?.typeData.bptPriceRate,
                            },
                        },
                    }),
                );
            }
        }
    }

    await prismaBulkExecuteOperations(operations, false);
}
