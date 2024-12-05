import { PoolAprService } from '../../pool-types';
import { PrismaPoolWithTokens } from '../../../../prisma/prisma-types';
import { prisma } from '../../../../prisma/prisma-client';
import { prismaBulkExecuteOperations } from '../../../../prisma/prisma-util';

const MAX_DB_INT = 9223372036854775807;

export class SwapFeeAprService implements PoolAprService {
    public getAprServiceName(): string {
        return 'SwapFeeAprService';
    }

    public async updateAprForPools(pools: PrismaPoolWithTokens[]): Promise<void> {
        const chain = pools[0].chain;
        const operations: any[] = [];

        const poolsExpanded = await prisma.prismaPool.findMany({
            where: { chain, id: { in: pools.map((pool) => pool.id) } },
            include: {
                dynamicData: true,
            },
        });

        for (const pool of poolsExpanded) {
            if (pool.dynamicData) {
                const apr =
                    pool.dynamicData.totalLiquidity > 0
                        ? (pool.dynamicData.fees24h * 365) / pool.dynamicData.totalLiquidity
                        : 0;

                let protocolFee = parseFloat(pool.dynamicData.protocolSwapFee);
                if (pool.type === 'GYROE') {
                    // Gyro has custom protocol fee structure
                    protocolFee = parseFloat(pool.dynamicData.protocolYieldFee || '0');
                }

                if (pool.protocolVersion === 3) {
                    protocolFee = parseFloat(pool.dynamicData.aggregateSwapFee);
                }

                if (pool.dynamicData.isInRecoveryMode || pool.type === 'LIQUIDITY_BOOTSTRAPPING') {
                    // pool does not collect any protocol fees
                    protocolFee = 0;
                }

                let userApr = apr * (1 - protocolFee);

                // TODO: clean this up
                if (userApr > MAX_DB_INT) {
                    userApr = 0;
                }

                operations.push(
                    prisma.prismaPoolAprItem.upsert({
                        where: { id_chain: { id: `${pool.id}-swap-apr-24h`, chain } },
                        create: {
                            id: `${pool.id}-swap-apr-24h`,
                            chain,
                            poolId: pool.id,
                            title: 'Swap fees APR (24h)',
                            apr: userApr,
                            type: 'SWAP_FEE_24H',
                        },
                        update: { apr: userApr },
                    }),
                );
            }
        }

        await prismaBulkExecuteOperations(operations);
    }
}
