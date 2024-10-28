import { Chain } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';

export const updateHoldersCount = async (poolIds: string[]) => {
    const holders = await prisma.prismaUserWalletBalance.groupBy({
        by: ['poolId', 'chain'],
        _count: { userAddress: true },
        where: {
            poolId: {
                in: poolIds,
            },
        },
    });
    const stakers = await prisma.prismaUserStakedBalance.groupBy({
        by: ['poolId', 'chain'],
        _count: { userAddress: true },
        where: {
            poolId: {
                in: poolIds,
            },
        },
    });

    // Merge the two arrays
    const pools = [...holders, ...stakers].reduce((acc, item) => {
        const { poolId, chain } = item;
        if (!poolId) return acc;
        acc[`${poolId}-${chain}`] ||= 0;
        acc[`${poolId}-${chain}`] += item._count.userAddress;
        return acc;
    }, {} as Record<string, number>);

    const updates = Object.keys(pools).map((poolId) => {
        const [id, chain] = poolId.split('-') as [string, Chain];
        return prisma.prismaPoolDynamicData.update({
            where: { id_chain: { id, chain } },
            data: {
                holdersCount: pools[poolId],
            },
        });
    });

    return prisma.$transaction(updates);
};
