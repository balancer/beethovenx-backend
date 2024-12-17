import { PoolAprService } from '../../pool-types';
import { PrismaPoolWithTokens, prismaPoolWithExpandedNesting } from '../../../../prisma/prisma-types';
import { prisma } from '../../../../prisma/prisma-client';
import { collectsYieldFee } from '../pool-utils';
import { networkContext } from '../../../network/network-context.service';

export class BoostedPoolAprService implements PoolAprService {
    public getAprServiceName(): string {
        return 'BoostedPoolAprService';
    }

    public async updateAprForPools(pools: PrismaPoolWithTokens[]): Promise<void> {
        // need to do multiple queries otherwise the nesting is too deep for many pools. Error: stack depth limit exceeded
        const poolsWithNestedPool = await prisma.prismaPool.findMany({
            where: {
                chain: networkContext.chain,
                id: { in: pools.map((pool) => pool.id) },
                tokens: { some: { nestedPoolId: { not: null } } },
            },
            include: {
                dynamicData: true,
                tokens: {
                    orderBy: { index: 'asc' },
                    include: {
                        nestedPool: true,
                        token: true,
                    },
                },
            },
        });

        for (const pool of poolsWithNestedPool) {
            const protocolYieldFeePercentage = parseFloat(pool.dynamicData?.protocolYieldFee || '0');
            const tokens = pool.tokens.filter((token) => {
                // exclude the phantom bpt pool token itself
                if (token.address === pool.address) {
                    return false;
                }
            });

            const poolIds = tokens.map((token) => token.nestedPool?.id || '');
            // swap fee and IB yield is also earned on the parent pool
            const aprItems = await prisma.prismaPoolAprItem.findMany({
                where: {
                    poolId: { in: poolIds },
                    type: { in: ['IB_YIELD', 'SWAP_FEE'] },
                    chain: networkContext.chain,
                },
            });

            for (const token of tokens) {
                const tokenAprItems = aprItems.filter((item) => item.poolId === token.nestedPoolId);

                if (
                    !pool.dynamicData ||
                    !token.nestedPool ||
                    !token.nestedPool.type ||
                    token.balanceUSD === 0 ||
                    pool.dynamicData.totalLiquidity === 0
                ) {
                    continue;
                }

                for (const aprItem of tokenAprItems) {
                    const itemId = `${pool.id}-${aprItem.id}`;
                    //scale the apr as a % of total liquidity

                    const apr = aprItem.apr * (token.balanceUSD / pool.dynamicData.totalLiquidity);
                    let userApr = apr;

                    if (
                        collectsYieldFee(pool) &&
                        // nested tokens/bpts that dont have a rate provider, we don't take any fees
                        token.priceRate !== '1.0'
                    ) {
                        userApr = userApr * (1 - protocolYieldFeePercentage);
                    }

                    const title = aprItem.type === 'SWAP_FEE' ? `${token.token.symbol} APR` : aprItem.title;

                    await prisma.prismaPoolAprItem.upsert({
                        where: { id_chain: { id: itemId, chain: networkContext.chain } },
                        create: {
                            id: itemId,
                            chain: networkContext.chain,
                            poolId: pool.id,
                            apr: userApr,
                            title: title,
                            group: aprItem.group,
                            rewardTokenAddress: aprItem.rewardTokenAddress,
                            rewardTokenSymbol: aprItem.rewardTokenSymbol,
                        },
                        update: {
                            apr: userApr,
                            title: title,
                            rewardTokenAddress: aprItem.rewardTokenAddress,
                            rewardTokenSymbol: aprItem.rewardTokenSymbol,
                        },
                    });
                }
            }
        }
    }
}
