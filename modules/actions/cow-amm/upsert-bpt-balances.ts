import { Chain, PrismaUserWalletBalance } from '@prisma/client';
import { CowAmmSubgraphClient } from '../../sources/subgraphs';
import { prisma } from '../../../prisma/prisma-client';

export const upsertBptBalances = async (subgraphClient: CowAmmSubgraphClient, chain: Chain, poolIds?: string[]) => {
    const where = poolIds ? { pool_in: poolIds } : undefined;
    const poolShares = await subgraphClient.getAllPoolShares(where);

    const dbEntries = poolShares
        .map((poolShare) => {
            const poolId = poolShare.id.substring(0, 42).toLowerCase();
            const userAddress = `0x${poolShare.id.substring(42)}`.toLowerCase();
            const id = `${poolId}-${userAddress}`;

            if (poolId === userAddress) return false;

            return {
                id,
                poolId,
                userAddress,
                chain: chain,
                tokenAddress: poolId,
                balance: poolShare.balance,
                balanceNum: Number(poolShare.balance),
            };
        })
        .filter(Boolean) as PrismaUserWalletBalance[];

    // wallet balances are related to users table, so we need to create all users records first
    await prisma.prismaUser.createMany({
        data: dbEntries.map(({ userAddress }) => ({ address: userAddress })),
        skipDuplicates: true,
    });

    return await Promise.allSettled(
        dbEntries.map((dbEntry) => {
            const { id, ...data } = dbEntry;

            if (data.balanceNum > 0) {
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
            } else {
                return prisma.prismaUserWalletBalance.deleteMany({
                    where: {
                        id,
                        chain,
                    },
                });
            }
        }),
    ).then((results) => {
        const errors = results
            .map((result, index) => {
                if (result.status === 'rejected') {
                    return dbEntries[index].poolId;
                }
            })
            .filter(Boolean)
            .filter((value, index, self) => self.indexOf(value) === index);
        if (errors.length) {
            console.error(
                `Error upserting CowAMM balances on ${chain} for pools - possibly not synced from subgraph`,
                errors,
            );
        }
    });
};
