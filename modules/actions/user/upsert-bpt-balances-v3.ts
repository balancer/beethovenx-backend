import { Chain } from '@prisma/client';
import { V3VaultSubgraphClient } from '../../sources/subgraphs';
import { prisma } from '../../../prisma/prisma-client';
import { poolShareToUserBalance } from '../../sources/transformers/pool-share-to-user-balance';

export const upsertBptBalancesV3 = async (vaultSubgraphClient: V3VaultSubgraphClient, chain: Chain) => {
    const poolShares = await vaultSubgraphClient.getAllPoolShares();

    const dbEntries = poolShares.map((poolShare) => poolShareToUserBalance(poolShare, chain));

    // Delete balances missing from the subgraph data and those with 0 balance
    const existingIDs = await prisma.prismaUserWalletBalance
        .findMany({
            where: {
                chain,
            },
            select: {
                id: true,
            },
        })
        .then((entries) => entries.map(({ id }) => id));

    const missingIDs = dbEntries.map(({ id }) => id).filter((id) => !existingIDs.includes(id));

    await prisma.prismaUserWalletBalance.deleteMany({
        where: {
            id: { in: missingIDs },
            chain,
        },
    });

    // wallet balances are related to users table, so we need to create all users records first
    await prisma.prismaUser.createMany({
        data: dbEntries.map(({ userAddress }) => ({ address: userAddress })),
        skipDuplicates: true,
    });

    const operations = dbEntries.map((dbEntry) => {
        const { id, ...data } = dbEntry;

        return prisma.prismaUserWalletBalance.upsert({
            where: {
                id_chain: {
                    id,
                    chain,
                },
            },
            update: data,
            create: dbEntry,
        });
    });

    await prisma.$transaction(operations);
};
