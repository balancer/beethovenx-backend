import { Chain } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma-client';
import { ViemClient } from '../../../sources/viem-client';
import { fetchTokenPairData } from '../../../sources/contracts/v3/fetch-tokenpair-data';

/**
 * Syncs all the token pair data for the given pool ids
 *
 * @param poolIds
 * @param viemClient
 * @param routerAddress
 * @param chain
 */
export const syncTokenPairs = async (
    ids: string[],
    viemClient: ViemClient,
    routerAddress: string,
    chain = 'SEPOLIA' as Chain,
) => {
    // Enrich with onchain tokenpair data for all the pools
    const tokenPairInputPools = await prisma.prismaPool.findMany({
        where: {
            id: { in: ids },
            chain: chain,
        },
        include: {
            tokens: { orderBy: { index: 'asc' }, include: { token: true } },
            dynamicData: true,
        },
    });
    const tokenPairData = await fetchTokenPairData(routerAddress, tokenPairInputPools, viemClient);

    // Update token pair data to the database
    for (const poolId of ids) {
        try {
            await prisma.prismaPoolDynamicData.update({
                where: {
                    poolId_chain: {
                        poolId: poolId,
                        chain: chain,
                    },
                },
                data: {
                    tokenPairsData: tokenPairData[poolId].tokenPairs,
                },
            });
        } catch (e) {
            console.error('Error upserting pool', e);
        }
    }

    return ids;
};
