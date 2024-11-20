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
        const lifetimeSwapFees = lifetime[key]?.lifetimeSwapFees || 0;
        const lifetimeVolume = lifetime[key]?.lifetimeVolume || 0;

        return {
            where: {
                poolId_chain: {
                    poolId,
                    chain: chain as Chain,
                },
            },
            data: {
                holdersCount,
                lifetimeSwapFees,
                lifetimeVolume,
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
    const swapLifetimeValues = await prisma.prismaPoolSnapshot.groupBy({
        by: ['poolId', 'chain'],
        _sum: {
            fees24h: true,
            volume24h: true,
        },
        where: {
            poolId: {
                in: poolIds,
            },
        },
    });

    const lifetimeValues = swapLifetimeValues.reduce((acc, { poolId, chain, _sum }) => {
        const key = `${poolId}-${chain}`;
        if (!acc[key]) {
            acc[key] = { lifetimeSwapFees: 0, lifetimeVolume: 0 };
        }
        acc[key].lifetimeSwapFees += _sum.fees24h || 0;
        acc[key].lifetimeVolume += _sum.volume24h || 0;
        return acc;
    }, {} as Record<string, { lifetimeSwapFees: number; lifetimeVolume: number }>);

    return lifetimeValues;
};
