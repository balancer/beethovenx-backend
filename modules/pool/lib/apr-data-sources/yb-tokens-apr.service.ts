import { PoolAprService } from '../../pool-types';
import { PrismaPoolWithTokens } from '../../../../prisma/prisma-types';
import { prisma } from '../../../../prisma/prisma-client';
import { prismaBulkExecuteOperations } from '../../../../prisma/prisma-util';
import { Chain, PrismaPoolAprItemGroup, PrismaPoolAprType } from '@prisma/client';
import { YbAprHandlers, TokenApr } from './yb-apr-handlers';
import { tokenService } from '../../../token/token.service';
import { collectsYieldFee, tokenCollectsYieldFee } from '../pool-utils';
import { YbAprConfig } from '../../../network/apr-config-types';

export class YbTokensAprService implements PoolAprService {
    private ybTokensAprHandlers: YbAprHandlers;
    private underlyingMap: { [wrapper: string]: string } = {};

    constructor(private aprConfig: YbAprConfig, private chain: Chain) {
        this.ybTokensAprHandlers = new YbAprHandlers(this.aprConfig, chain);
        // Build a map of wrapped tokens to underlying tokens for Aave
        this.underlyingMap = Object.fromEntries(
            Object.values({
                ...aprConfig.aave?.v3?.tokens,
                ...aprConfig.aave?.lido?.tokens,
            }).flatMap((market) =>
                Object.values(market.wrappedTokens).map((wrapper) => [wrapper, market.underlyingAssetAddress]),
            ),
        );
    }

    getAprServiceName(): string {
        return 'YbTokensAprService';
    }

    public async updateAprForPools(pools: PrismaPoolWithTokens[]): Promise<void> {
        const operations: any[] = [];
        const tokenPrices = await tokenService.getTokenPrices(pools[0].chain);
        const aprs = await this.fetchYieldTokensApr();
        const poolsWithYbTokens = pools.filter((pool) => {
            return pool.tokens.find((token) => {
                return Array.from(aprs.keys())
                    .map((key) => key.toLowerCase())
                    .includes(token.address.toLowerCase());
            });
        });

        const poolsWithYbTokensExpanded = await prisma.prismaPool.findMany({
            where: { chain: this.chain, id: { in: poolsWithYbTokens.map((pool) => pool.id) } },
            include: {
                dynamicData: true,
                tokens: {
                    orderBy: { index: 'asc' },
                    include: {
                        token: true,
                    },
                },
            },
        });

        for (const pool of poolsWithYbTokensExpanded) {
            if (!pool.dynamicData) {
                continue;
            }
            const totalLiquidity = pool.dynamicData?.totalLiquidity;
            if (!totalLiquidity) {
                continue;
            }

            for (const token of pool.tokens) {
                const tokenApr = aprs.get(token.address);
                if (!tokenApr) {
                    continue;
                }

                const tokenPrice = tokenService.getPriceForToken(tokenPrices, token.address, pool.chain);
                const tokenBalance = token.balance;

                const tokenLiquidity = tokenPrice * parseFloat(tokenBalance || '0');
                const tokenPercentageInPool = tokenLiquidity / totalLiquidity;

                if (!tokenApr || !tokenPercentageInPool) {
                    continue;
                }

                let userApr = tokenApr.apr * tokenPercentageInPool;

                // AAVE + LST case, we need to apply the underlying token APR on top of the AAVE market APR
                const aaveUnderlying = this.underlyingMap[token.address];
                if (aaveUnderlying) {
                    const underlyingTokenApr = aprs.get(aaveUnderlying);
                    if (underlyingTokenApr) {
                        userApr = ((1 + tokenApr.apr) * (1 + underlyingTokenApr.apr) - 1) * tokenPercentageInPool;
                    }
                }

                if (collectsYieldFee(pool) && tokenCollectsYieldFee(token) && pool.dynamicData) {
                    const fee =
                        pool.type === 'META_STABLE'
                            ? parseFloat(pool.dynamicData.protocolSwapFee || '0')
                            : pool.protocolVersion === 3
                            ? parseFloat(pool.dynamicData.aggregateYieldFee || '0.1')
                            : parseFloat(pool.dynamicData.protocolYieldFee || '0');

                    userApr = userApr * (1 - fee);
                }

                const yieldType: PrismaPoolAprType = 'IB_YIELD';

                const itemId = `${pool.id}-${token.token.symbol}-yield-apr`;

                const data = {
                    id: itemId,
                    chain: pool.chain,
                    poolId: pool.id,
                    title: `${token.token.symbol} APR`,
                    apr: userApr,
                    group: tokenApr.group as PrismaPoolAprItemGroup,
                    type: yieldType,
                    rewardTokenAddress: token.address,
                    rewardTokenSymbol: token.token.symbol,
                };

                operations.push(
                    prisma.prismaPoolAprItem.upsert({
                        where: { id_chain: { id: itemId, chain: pool.chain } },
                        create: data,
                        update: data,
                    }),
                );
            }
        }
        await prismaBulkExecuteOperations(operations);
    }

    private async fetchYieldTokensApr(): Promise<Map<string, TokenApr>> {
        const data = await this.ybTokensAprHandlers.fetchAprsFromAllHandlers();
        return new Map<string, TokenApr>(
            data
                .filter((tokenApr) => {
                    return !isNaN(tokenApr.apr);
                })
                .map((apr) => [apr.address, apr]),
        );
    }
}
