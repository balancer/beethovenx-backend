import { Chain } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';

export const updateLifetimeValues = async (poolIds: string[]) => {
    const holders = await getHoldersCount(poolIds);
    const lifetime = await getSwapLifetimeValues(poolIds);

    // Merge all keys into an unique list
    const allKeys = [...Object.keys(holders), ...Object.keys(lifetime)].reduce((acc, key) => {
        if (!acc.includes(key)) acc.push(key);
        return acc;
    }, [] as string[]);

    const data = allKeys.map((key) => {
        const [poolId, chain] = key.split('-');
        const holdersCount = holders[key] || 0;
        const totalSwapFee = lifetime[key]?.totalSwapFee || 0;
        const totalSwapVolume = lifetime[key]?.totalSwapVolume || 0;

        return {
            where: {
                poolId_chain: {
                    poolId,
                    chain: chain as Chain,
                },
            },
            data: {
                holdersCount,
                lifetimeSwapFees: totalSwapFee,
                lifetimeVolume: totalSwapVolume,
            },
        };
    });

    const updates = data.map((record) => {
        const { where, data } = record;

        return prisma.prismaPoolDynamicData.update({
            where,
            data,
        });
    });

    return prisma.$transaction(updates);
};

const getHoldersCount = async (poolIds: string[]) => {
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

    return pools;
};

const getSwapLifetimeValues = async (poolIds: string[]) => {
    // Get latest snapshots for each pool
    const snapshots = await prisma.prismaPoolSnapshot.findMany({
        where: {
            poolId: {
                in: poolIds,
            },
        },
        orderBy: {
            timestamp: 'desc',
        },
        distinct: ['poolId', 'chain'],
        select: {
            poolId: true,
            chain: true,
            totalSwapFee: true,
            totalSwapVolume: true,
        },
    });

    const lifetimeValues = snapshots.reduce((acc, { poolId, chain, totalSwapFee, totalSwapVolume }) => {
        if (!poolId) return acc;
        acc[`${poolId}-${chain}`] = { totalSwapFee, totalSwapVolume };
        return acc;
    }, {} as Record<string, { totalSwapFee: number; totalSwapVolume: number }>);

    return lifetimeValues;
};
