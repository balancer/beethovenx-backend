import { Chain } from '@prisma/client';
import { BlockNumbersSubgraphClient, V3VaultSubgraphClient } from '../../sources/subgraphs';
import { V2SubgraphClient } from '../../subgraphs/balancer-subgraph';
import { getLiquidityAndSharesAtTimestamp } from '../../sources/enrichers/get-liquidity-and-shares-at-timestamp';
import { daysAgo, hoursAgo } from '../../common/time';
import { prisma } from '../../../prisma/prisma-client';
import { isSupportedInt } from '../../../prisma/prisma-util';
import * as Sentry from '@sentry/node';
import { getPriceForToken } from '../../helper/get-price-for-token';
import _ from 'lodash';

/**
 * Updates the total liquidity 24h ago for the given pools
 * Comment: is this really necessary to have in the pools? We have snapshots
 *
 * @param ids
 * @param subgraphClient
 * @param blocksClient
 * @param chain
 * @returns
 */
export const updateLiquidity24hAgo = async (
    ids: string[],
    subgraphClient: V2SubgraphClient | V3VaultSubgraphClient,
    blocksClient: BlockNumbersSubgraphClient,
    chain: Chain,
) => {
    // Get liquidity data
    const ts = chain === Chain.SEPOLIA ? hoursAgo(1) : daysAgo(1);
    const data = await getLiquidityAndSharesAtTimestamp(ids, subgraphClient, blocksClient, ts);
    if (!data) return;

    // Update liquidity data
    const updates = Object.entries(data).map(([id, { tvl, totalShares }]) => {
        return {
            where: {
                poolId_chain: {
                    poolId: id,
                    chain,
                },
            },
            data: {
                totalLiquidity24hAgo: tvl,
                totalShares24hAgo: totalShares,
            },
        };
    });

    const updated: string[] = [];
    for (const update of updates) {
        try {
            await prisma.prismaPoolDynamicData.update(update);
            updated.push(update.where.poolId_chain.poolId);
        } catch (e) {
            // TODO: Some V2 pools are missing dynamic data on creation. Should be fixed when creating new pool records.
            // https://github.com/balancer/backend/issues/288
            console.error(
                `Error updating liquidity 24h ago for pool ${update.where.poolId_chain.poolId} ${update.where.poolId_chain.chain} with error: ${e}`,
            );
        }
    }

    return updated;
};

/**
 * Liquidity is dependent on token prices, so the values here are constantly in flux.
 * When updating, the easiest is to update all pools at once.
 */
export const updateLiquidityValuesForPools = async (chain: Chain, poolIds?: string[]) => {
    const tokenPrices = await prisma.prismaTokenCurrentPrice.findMany({
        where: {
            chain,
        },
    });

    const pdts = await prisma.prismaPoolDynamicData.findMany({
        include: { pool: { include: { tokens: true } } },
        where: poolIds ? { poolId: { in: poolIds }, chain } : { chain },
    });

    let updates: any[] = [];

    for (const pdt of pdts) {
        const pool = pdt.pool;
        const balanceUSDs = pool.tokens.map((token) => ({
            id: token.id,
            balanceUSD:
                token.address === pool.address
                    ? 0
                    : parseFloat(token.balance || '0') * getPriceForToken(tokenPrices, token.address, chain),
        }));
        const totalLiquidity = _.sumBy(balanceUSDs, (item) => item.balanceUSD);

        for (const item of balanceUSDs) {
            if (!isSupportedInt(item.balanceUSD)) {
                Sentry.captureException(
                    `Skipping unsupported int size for prismaPoolToken.balanceUSD: ${item.balanceUSD}`,
                    {
                        tags: {
                            tokenId: item.id,
                            poolId: pool.id,
                            poolName: pool.name,
                            chain: pool.chain,
                        },
                    },
                );
                continue;
            }
            updates.push(
                prisma.prismaPoolToken.update({
                    where: { id_chain: { id: item.id, chain: pool.chain } },
                    data: { balanceUSD: item.balanceUSD },
                }),
            );
        }
        if (!isSupportedInt(totalLiquidity)) {
            Sentry.captureException(
                `Skipping unsupported int size for prismaPoolDynamicData.totalLiquidity: ${totalLiquidity} `,
                {
                    tags: {
                        poolId: pool.id,
                        poolName: pool.name,
                        chain: pool.chain,
                    },
                },
            );
            continue;
        }

        updates.push(
            prisma.prismaPoolDynamicData.update({
                where: { id_chain: { id: pool.id, chain: pool.chain } },
                data: { totalLiquidity },
            }),
        );

        if (updates.length > 100) {
            await Promise.all(updates);
            updates = [];
        }
    }

    await Promise.all(updates);
};
