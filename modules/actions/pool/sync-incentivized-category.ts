import { Chain, Prisma } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';

export const syncIncentivizedCategory = async () => {
    const poolsWithReward = await prisma.prismaPoolAprItem.findMany({
        select: { poolId: true },
        where: {
            type: {
                in: ['NATIVE_REWARD', 'THIRD_PARTY_REWARD', 'MERKL', 'VOTING', 'LOCKING'],
            },
            apr: {
                gt: 0,
            },
        },
    });

    const ids = poolsWithReward.map(({ poolId }) => poolId);

    if (ids.length === 0) return;

    await prisma.$transaction([
        // Remove incentivized category from pools
        prisma.$executeRaw`UPDATE "PrismaPool"
        SET categories = array_remove(categories, 'INCENTIVIZED')
        WHERE 'INCENTIVIZED' = ANY(categories);`,

        // Readd 'incentivized' category to incentivized pools only
        prisma.$executeRaw`UPDATE "PrismaPool"
        SET categories = array_append(categories, 'INCENTIVIZED')
        WHERE id IN (${Prisma.join(ids)});`,
    ]);
};
