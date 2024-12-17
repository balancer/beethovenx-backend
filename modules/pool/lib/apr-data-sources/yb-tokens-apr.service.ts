import { PoolAprService } from '../../pool-types';
import { PrismaPoolWithTokens } from '../../../../prisma/prisma-types';
import { prisma } from '../../../../prisma/prisma-client';
import { prismaBulkExecuteOperations } from '../../../../prisma/prisma-util';
import { Chain, PrismaPoolAprItemGroup, PrismaPoolAprType } from '@prisma/client';
import { YbAprHandlers, TokenApr } from './yb-apr-handlers';
import { tokenService } from '../../../token/token.service';
import { collectsYieldFee, tokenCollectsYieldFee } from '../pool-utils';
import { YbAprConfig } from '../../../network/apr-config-types';

const MORPHO_TOKEN = '0x58d97b57bb95320f9a05dc918aef65434969c2b2';
const MORPHO_RATE = 0.07605350252138458;

export class YbTokensAprService implements PoolAprService {
    private ybTokensAprHandlers: YbAprHandlers;
    private underlyingMap: { [wrapper: string]: string } = {};

    constructor(private aprConfig: YbAprConfig, private chain: Chain) {
        this.ybTokensAprHandlers = new YbAprHandlers(this.aprConfig, chain);
        // Build a map of wrapped tokens to underlying tokens for Aave
        const aaveMerged = {
            ...aprConfig.aave?.v3?.tokens,
            ...aprConfig.aave?.lido?.tokens,
        };

        const aaveTokens = Object.fromEntries(
            Object.values(aaveMerged).flatMap((market) =>
                Object.values(market.wrappedTokens).map((wrapper) => [wrapper, market.underlyingAssetAddress]),
            ),
        );

        this.underlyingMap = {
            ...aaveTokens,
            ...(aprConfig.morpho?.tokens || {}),
        };
    }

    getAprServiceName(): string {
        return 'YbTokensAprService';
    }

    public async updateAprForPools(pools: PrismaPoolWithTokens[]): Promise<void> {
        const operations: any[] = [];
        const chains = Array.from(new Set(pools.map((pool) => pool.chain)));
        const tokenPrices = await tokenService.getCurrentTokenPrices(chains).then((prices) =>
            Object.fromEntries(
                prices.map((price) => {
                    return [price.tokenAddress, price.price];
                }),
            ),
        );
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

            const tokenAprs = pool.tokens.map((token) => {
                const tokenApr = aprs.get(token.address);
                return {
                    ...token,
                    ...tokenApr,
                    share: (parseFloat(token.balance) * tokenPrices[token.address]) / totalLiquidity,
                };
            });

            for (const token of tokenAprs) {
                if (!token.apr || !token.share) {
                    continue;
                }

                let userApr = token.apr * token.share;

                // AAVE + LST case, we need to apply the underlying token APR on top of the AAVE market APR
                const underlying = this.underlyingMap[token.address];
                if (underlying) {
                    const underlyingApr = aprs.get(underlying);
                    if (underlyingApr) {
                        userApr = ((1 + token.apr) * (1 + underlyingApr.apr) - 1) * token.share;
                    }
                }

                let fee = 0;
                if (collectsYieldFee(pool) && tokenCollectsYieldFee(token) && pool.dynamicData) {
                    fee =
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
                    group: token.group as PrismaPoolAprItemGroup,
                    type: yieldType,
                    rewardTokenAddress: token.address,
                    rewardTokenSymbol: token.token.symbol,
                };

                // Custom APR for MORPHO vaults, hardcoding, because it's complicated to get it from the API
                if (data.group === PrismaPoolAprItemGroup.MORPHO) {
                    const morphoTokensShare = tokenAprs
                        .filter((t) => t.group === 'MORPHO')
                        .reduce((acc, t) => acc + t.share, 0);
                    const morphoId = `${pool.id}-morpho`;
                    const morphoData = {
                        ...data,
                        id: morphoId,
                        apr: MORPHO_RATE * morphoTokensShare,
                        type: PrismaPoolAprType.IB_YIELD,
                        title: 'MORPHO APR',
                        rewardTokenAddress: MORPHO_TOKEN,
                        rewardTokenSymbol: 'MORPHO',
                    };
                    operations.push(
                        prisma.prismaPoolAprItem.upsert({
                            where: { id_chain: { id: morphoId, chain: pool.chain } },
                            create: morphoData,
                            update: morphoData,
                        }),
                    );
                }

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
