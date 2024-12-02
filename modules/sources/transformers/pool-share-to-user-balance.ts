import { PoolShareFragment } from '../subgraphs/balancer-v3-vault/generated/types';
import { Chain, Prisma } from '@prisma/client';

export const poolShareToUserBalance = (
    poolShare: PoolShareFragment,
    chain: Chain,
): Prisma.PrismaUserWalletBalanceCreateManyInput => {
    const [poolId, userAddress] = poolShare.id.split('-');

    return {
        id: poolShare.id,
        chain: chain,
        poolId,
        userAddress,
        tokenAddress: poolId,
        balance: poolShare.balance,
        balanceNum: parseFloat(poolShare.balance),
    };
};
