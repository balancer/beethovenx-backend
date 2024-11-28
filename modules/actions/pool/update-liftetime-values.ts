import { Chain, PrismaPoolType } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';

// This is a helper for V3 and CowAmm pools only. V2 is already handled and concidered legacy.
export const updateLifetimeValues = async (chain: Chain, protocolVersion?: number, type?: PrismaPoolType) => {
    const holders = await getHoldersCount(chain, protocolVersion, type);
    const lifetime = await getSwapLifetimeValues(chain, protocolVersion, type);

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

const getHoldersCount = async (chain: Chain, protocolVersion?: number, type?: PrismaPoolType) => {
    const holders = await prisma.prismaUserWalletBalance.groupBy({
        by: ['poolId', 'chain'],
        _count: { userAddress: true },
        where: {
            chain,
            pool: {
                protocolVersion,
                type,
            },
        },
    });
    // This is overfetching, because of V2 pools
    const stakers = await prisma.prismaUserStakedBalance.groupBy({
        by: ['poolId', 'chain'],
        _count: { userAddress: true },
        where: {
            chain,
            pool: {
                protocolVersion,
                type,
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

const getSwapLifetimeValues = async (chain: Chain, protocolVersion?: number, type?: PrismaPoolType) => {
    // Get latest snapshots for each pool
    const swapLifetimeValues = await prisma.prismaPoolSnapshot.groupBy({
        by: ['poolId', 'chain'],
        _sum: {
            fees24h: true,
            volume24h: true,
        },
        where: {
            chain,
            protocolVersion,
            pool: {
                type,
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
