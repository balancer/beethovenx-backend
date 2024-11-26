import { Chain, PrismaPoolSnapshot } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';

export const recalculateDailyValues = async (chain: Chain, poolId?: string): Promise<void> => {
    const snapshots = await prisma.prismaPoolSnapshot.findMany({
        where: {
            chain,
            poolId,
        },
        orderBy: {
            timestamp: 'asc',
        },
    });

    console.log(
        `Recalculating daily values for ${chain} ${poolId ? `pool ${poolId}` : 'pools'} with ${
            snapshots.length
        } snapshots.`,
    );

    if (!snapshots.length) {
        return;
    }

    // Group by poolId
    const poolSnapshots = snapshots.reduce((acc, snapshot) => {
        if (!acc[snapshot.poolId]) {
            acc[snapshot.poolId] = [];
        }

        acc[snapshot.poolId].push(snapshot);

        return acc;
    }, {} as Record<string, PrismaPoolSnapshot[]>);

    const operations = Object.values(poolSnapshots).flatMap((snapshots) => {
        return snapshots.map((snapshot, index) => {
            const previousSnapshot = index > 0 ? snapshots[index - 1] : ({} as any);

            const dailyValues = {
                volume24h: snapshot.totalSwapVolume - previousSnapshot?.totalSwapVolume || 0,
                fees24h: snapshot.totalSwapFee - previousSnapshot?.totalSwapFee || 0,
            };

            return prisma.prismaPoolSnapshot.update({
                where: {
                    id_chain: {
                        id: snapshot.id,
                        chain,
                    },
                },
                data: {
                    ...dailyValues,
                },
            });
        });
    });

    console.log(
        `Recalculating daily values for ${chain} ${poolId ? `pool ${poolId}` : 'pools'} with ${
            operations.length
        } operations.`,
    );

    await prisma.$transaction(operations);
};
