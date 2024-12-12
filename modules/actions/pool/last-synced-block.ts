import { Chain, PrismaLastBlockSyncedCategory } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';

export const getLastSyncedBlock = async (chain: Chain, syncCategory: PrismaLastBlockSyncedCategory) => {
    const lastSyncBlock = (
        await prisma.prismaLastBlockSynced.findFirst({
            where: {
                category: syncCategory,
                chain,
            },
        })
    )?.blockNumber;

    return lastSyncBlock || 0;
};

export const upsertLastSyncedBlock = async (
    chain: Chain,
    syncCategory: PrismaLastBlockSyncedCategory,
    blockNumber: number,
) => {
    await prisma.prismaLastBlockSynced.upsert({
        where: {
            category_chain: {
                category: syncCategory,
                chain,
            },
        },
        update: {
            blockNumber: blockNumber,
        },
        create: {
            category: syncCategory,
            blockNumber: blockNumber,
            chain,
        },
    });
};
