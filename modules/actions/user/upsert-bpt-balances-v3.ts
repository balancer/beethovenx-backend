import { Chain } from '@prisma/client';
import { V3VaultSubgraphClient } from '../../sources/subgraphs';
import { prisma } from '../../../prisma/prisma-client';
import { poolShareToUserBalance } from '../../sources/transformers/pool-share-to-user-balance';

export const upsertBptBalancesV3 = async (vaultSubgraphClient: V3VaultSubgraphClient, chain: Chain) => {
    const poolShares = await vaultSubgraphClient.getAllPoolShares();

    let dbEntries = poolShares.map((poolShare) => poolShareToUserBalance(poolShare, chain));

    // Temporary filter out balances that dont exist in the DB yet
    await prisma.prismaPool
        .findMany({
            where: {
                chain,
                protocolVersion: 3,
            },
            select: {
                id: true,
            },
        })
        .then((pools) => pools.map(({ id }) => id))
        .then((ids) => {
            dbEntries = dbEntries.filter((entry) => ids.includes(entry.poolId!));
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
