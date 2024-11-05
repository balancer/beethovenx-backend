import { fetchHookData } from '../../../sources/contracts/hooks/fetch-hook-data';
import { prisma } from '../../../../prisma/prisma-client';
import type { HookType } from '../../../network/network-config-types';
import type { ViemClient } from '../../../sources/viem-client';
import type { Chain } from '@prisma/client';

/**
 * Gets and stores known hooks data
 *
 * @param hooks - known hooks addresses
 * @param viemClient
 */
export const syncHookData = async (
    addresses: Record<string, HookType>,
    viemClient: ViemClient,
    chain: Chain,
): Promise<void> => {
    if (!addresses || Object.keys(addresses).length === 0) {
        return;
    }

    // Get hooks data
    const data = await fetchHookData(viemClient, addresses);

    // Update hooks data to the database
    return Promise.allSettled(
        Object.keys(data).map((address) =>
            prisma.prismaHook.update({
                where: { address_chain: { address, chain } },
                data: {
                    dynamicData: data[address],
                },
            }),
        ),
    ).then((results) => {
        for (const result of results) {
            if (result.status === 'rejected') {
                console.error(result.reason);
            }
        }
    });
};
