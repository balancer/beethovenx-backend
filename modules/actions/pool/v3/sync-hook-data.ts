import { fetchHookData } from '../../../sources/contracts/hooks/fetch-hook-data';
import { prisma } from '../../../../prisma/prisma-client';
import type { HookType } from '../../../network/network-config-types';
import type { ViemClient } from '../../../sources/viem-client';
import type { Chain, PrismaPool } from '@prisma/client';
import { HookData } from '../../../sources/transformers';
import { prismaBulkExecuteOperations } from '../../../../prisma/prisma-util';

/**
 * Gets and stores known hooks data
 *
 * @param hooks - known hooks addresses
 * @param viemClient
 */
export const syncHookData = async (
    pools: PrismaPool[],
    hooksTypes: { feeTakingHook?: string[]; exitFeeHook?: string[]; stableSurgeHook?: string[] },
    viemClient: ViemClient,
    chain: Chain,
): Promise<void> => {
    if (pools.length === 0) {
        return;
    }
    const operations = [];

    for (const pool of pools) {
        const hookData = pool.hook as HookData | null;
        if (!hookData) {
            continue;
        }
        const keys = Object.keys(hooksTypes) as HookType[];
        const hookType = keys.find((key) => hooksTypes[key]?.includes(hookData.address));

        if (!hookType) {
            continue;
        }

        // Get hooks data
        const data = await fetchHookData(viemClient, hookData.address, hookType);

        operations.push(
            prisma.prismaPool.update({
                where: { id_chain: { id: pool.id, chain } },
                data: {
                    hook: {
                        ...(hookData as HookData),
                        dynamicData: data,
                    },
                },
            }),
        );
    }
    await prismaBulkExecuteOperations(operations, false);
};
