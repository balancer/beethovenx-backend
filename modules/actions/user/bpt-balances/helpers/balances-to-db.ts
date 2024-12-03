import { Prisma, PrismaLastBlockSyncedCategory } from '@prisma/client';
import { prisma } from '../../../../../prisma/prisma-client';
import _ from 'lodash';

export const balancesToDb = (
    balances: Prisma.PrismaUserWalletBalanceCreateManyInput[],
    endBlock: number,
    syncType?: PrismaLastBlockSyncedCategory,
) => {
    // Make sure we have all the balances from the same chain
    if (balances.length > 0 && _.uniq(balances.map(({ chain }) => chain)).length !== 1) {
        throw new Error('Balances should be from the same chain');
    }

    if (balances.length === 0) {
        return [];
    }

    const obsoleteIDs = balances.filter((balance) => balance.balanceNum === 0).map(({ id }) => id);
    const chain = balances[0].chain;

    return [
        // Wallet balances are related to users table, so we need to create all users records first
        prisma.prismaUser.createMany({
            data: _.uniq(balances.map(({ userAddress }) => ({ address: userAddress }))),
            skipDuplicates: true,
        }),

        // Create or update the balances
        ...balances
            .filter((share) => share.balanceNum > 0)
            .map((dbEntry) => {
                const { id, chain, ...data } = dbEntry;

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
            }),

        // Max 32767 IDs per deleteMany call that DB can handle
        ..._.chunk(obsoleteIDs, 32000).map((ids) =>
            prisma.prismaUserWalletBalance.deleteMany({
                where: {
                    id: { in: ids },
                    chain,
                },
            }),
        ),

        // Update the synced block number when provided
        ...(syncType
            ? [
                  prisma.prismaLastBlockSynced.upsert({
                      where: {
                          category_chain: {
                              category: syncType,
                              chain,
                          },
                      },
                      create: {
                          chain,
                          category: syncType,
                          blockNumber: endBlock,
                      },
                      update: {
                          blockNumber: endBlock,
                      },
                  }),
              ]
            : []),
    ];
};
