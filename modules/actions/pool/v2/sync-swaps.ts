import { Chain, PrismaPoolSwap, PrismaTokenCurrentPrice } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma-client';
import { V2SubgraphClient } from '../../../subgraphs/balancer-subgraph';
import _ from 'lodash';
import { swapV2Transformer } from '../../../sources/transformers/swap-v2-transformer';
import { OrderDirection, Swap_OrderBy } from '../../../subgraphs/balancer-subgraph/generated/balancer-subgraph-types';
import { swapsUsd } from '../../../sources/enrichers/swaps-usd';
import moment from 'moment';
import { isSupportedInt, prismaBulkExecuteOperations } from '../../../../prisma/prisma-util';
import * as Sentry from '@sentry/node';
import { getPriceForToken } from '../../../helper/get-price-for-token';

/**
 * Adds all swaps since daysToSync to the database. Checks for latest synced swap to avoid duplicate work.
 *
 * @param subgraphClient
 * @param chain
 * @returns
 */
export async function syncSwaps(subgraphClient: V2SubgraphClient, chain: Chain): Promise<string[]> {
    const protocolVersion = 2;

    // Get latest event from the DB
    const latestEvent = await prisma.prismaPoolEvent.findFirst({
        select: {
            blockNumber: true,
            blockTimestamp: true,
        },
        where: {
            type: 'SWAP',
            chain: chain,
            protocolVersion,
        },
        orderBy: {
            blockTimestamp: 'desc',
        },
    });

    // Querying by timestamp of Fantom, because it has events without a block number in the DB
    const where = latestEvent
        ? chain === Chain.FANTOM
            ? { timestamp_gte: Number(latestEvent.blockTimestamp) }
            : { block_gte: String(latestEvent.blockNumber) }
        : {};

    // Get events
    console.time('BalancerSwaps');
    const { swaps } = await subgraphClient.BalancerSwaps({
        first: 1000,
        where: {
            ...where,
            poolId_in: ['0x32cc63ffeccb7c0508d64e4d37145313cc053b27000200000000000000000cb4'],
        },
        orderBy: Swap_OrderBy.Block,
        orderDirection: OrderDirection.Asc,
    });
    console.timeEnd('BalancerSwaps');

    console.time('swapV2Transformer');
    const dbSwaps = swaps.map((swap) => swapV2Transformer(swap, chain));
    console.timeEnd('swapV2Transformer');

    // TODO: parse batchSwaps, if needed

    // Enrich with USD values
    console.time('swapsUsd');
    const dbEntries = await swapsUsd(dbSwaps, chain);
    console.timeEnd('swapsUsd');

    console.time('prismaPoolEvent.createMany');
    await prisma.prismaPoolEvent.createMany({
        skipDuplicates: true,
        data: dbEntries,
    });
    console.timeEnd('prismaPoolEvent.createMany');

    return dbEntries.map((entry) => entry.poolId);
}

/**
 * Syncs all swaps for the last 48 hours. We fetch the timestamp of the last stored swap to avoid
 * duplicate effort. Return an array of poolIds with swaps added.
 */
export async function syncSwapsForLast48Hours(subgraphClient: V2SubgraphClient, chain: Chain): Promise<string[]> {
    const tokenPrices = await prisma.prismaTokenCurrentPrice.findMany({
        where: {
            chain,
        },
    });
    const lastSwap = await prisma.prismaPoolSwap.findFirst({
        orderBy: { timestamp: 'desc' },
        where: { chain: chain },
    });
    const twoDaysAgo = moment().subtract(2, 'day').unix();
    //ensure we only sync the last 48 hours worth of swaps
    let timestamp = lastSwap && lastSwap.timestamp > twoDaysAgo ? lastSwap.timestamp : twoDaysAgo;
    let hasMore = true;
    let skip = 0;
    const pageSize = 1000;
    const MAX_SKIP = 5000;
    const poolIds = new Set<string>();
    const txs = new Set<string>();

    // Skip creating records for non-existing pools
    const existingPoolIds = (
        await prisma.prismaPool.findMany({
            where: {
                chain: chain,
            },
            select: {
                id: true,
            },
        })
    ).map((pool) => ({ id: pool.id }));

    while (hasMore) {
        const { swaps } = await subgraphClient.legacyService.getSwaps({
            first: pageSize,
            skip,
            where: { timestamp_gte: timestamp },
            orderBy: Swap_OrderBy.Timestamp,
            orderDirection: OrderDirection.Asc,
        });

        const existingPoolsOnlySwaps = swaps.filter((swap) =>
            existingPoolIds.map((pool) => pool.id).includes(swap.poolId.id),
        );

        console.log(`loading ${existingPoolsOnlySwaps.length} new swaps into the db...`);

        if (swaps.length === 0) {
            break;
        }

        await prisma.prismaPoolSwap.createMany({
            skipDuplicates: true,
            data: existingPoolsOnlySwaps.map((swap) => {
                let valueUSD = 0;
                const tokenInPrice = getPriceForToken(tokenPrices, swap.tokenIn, chain);
                const tokenOutPrice = getPriceForToken(tokenPrices, swap.tokenOut, chain);

                if (tokenInPrice > 0) {
                    valueUSD = tokenInPrice * parseFloat(swap.tokenAmountIn);
                } else {
                    valueUSD = tokenOutPrice * parseFloat(swap.tokenAmountOut);
                }

                if (valueUSD === 0) {
                    valueUSD = parseFloat(swap.valueUSD);
                }

                poolIds.add(swap.poolId.id);
                txs.add(swap.tx);
                if (!isSupportedInt(valueUSD)) {
                    Sentry.captureException(`Sett unsupported int size for prismaPoolSwap.valueUSD: ${valueUSD} to 0`, {
                        tags: {
                            tokenIn: swap.tokenIn,
                            tokenInAmount: swap.tokenAmountIn,
                            tokenInPrice: tokenInPrice,
                            tokenOut: swap.tokenOut,
                            tokenOutAmount: swap.tokenAmountOut,
                            tokenOutPrice: tokenOutPrice,
                        },
                    });
                    valueUSD = 0;
                }

                return {
                    id: swap.id,
                    chain: chain,
                    timestamp: swap.timestamp,
                    poolId: swap.poolId.id,
                    userAddress: swap.userAddress.id,
                    tokenIn: swap.tokenIn,
                    tokenInSym: swap.tokenInSym,
                    tokenOut: swap.tokenOut,
                    tokenOutSym: swap.tokenOutSym,
                    tokenAmountIn: swap.tokenAmountIn,
                    tokenAmountOut: swap.tokenAmountOut,
                    tx: swap.tx,
                    valueUSD,
                };
            }),
        });

        await createBatchSwaps(chain, Array.from(txs), tokenPrices);
        txs.clear();

        if (swaps.length < pageSize) {
            hasMore = false;
        }

        skip += pageSize;

        if (skip > MAX_SKIP) {
            timestamp = swaps[swaps.length - 1].timestamp;
            skip = 0;
        }
    }

    await prisma.prismaPoolSwap.deleteMany({
        where: {
            timestamp: { lt: twoDaysAgo },
            chain: chain,
        },
    });
    await prisma.prismaPoolBatchSwap.deleteMany({
        where: {
            timestamp: { lt: twoDaysAgo },
            chain: chain,
        },
    });

    return Array.from(poolIds);
}

async function createBatchSwaps(chain: Chain, txs: string[], tokenPrices: PrismaTokenCurrentPrice[]): Promise<void> {
    const swaps = await prisma.prismaPoolSwap.findMany({ where: { tx: { in: txs }, chain: chain } });
    const groupedByTxAndUser = _.groupBy(swaps, (swap) => `${swap.tx}${swap.userAddress}`);
    let operations: any[] = [
        prisma.prismaPoolSwap.updateMany({
            where: { tx: { in: txs }, chain: chain },
            data: { batchSwapId: null, batchSwapIdx: null },
        }),
        prisma.prismaPoolBatchSwap.deleteMany({ where: { tx: { in: txs }, chain: chain } }),
    ];

    for (const group of Object.values(groupedByTxAndUser)) {
        const inMap = _.keyBy(group, getSwapInKey);
        const outMap = _.keyBy(group, getSwapOutKey);
        //start swaps are the tokenIn-tokenAmountIn that doesn't have an out
        const startSwaps = group.filter((swap) => !outMap[getSwapInKey(swap)]);

        for (const startSwap of startSwaps) {
            const batchSwaps: PrismaPoolSwap[] = [startSwap];
            let current = startSwap;

            while (inMap[getSwapOutKey(current)]) {
                current = inMap[getSwapOutKey(current)];
                batchSwaps.push(current);
            }

            if (batchSwaps.length > 0) {
                const startSwap = batchSwaps[0];
                const endSwap = batchSwaps[batchSwaps.length - 1];

                operations = [
                    ...operations,
                    prisma.prismaPoolBatchSwap.create({
                        data: {
                            id: startSwap.id,
                            chain: chain,
                            timestamp: startSwap.timestamp,
                            userAddress: startSwap.userAddress,
                            tokenIn: startSwap.tokenIn,
                            tokenAmountIn: startSwap.tokenAmountIn,
                            tokenOut: endSwap.tokenOut,
                            tokenAmountOut: endSwap.tokenAmountOut,
                            tx: startSwap.tx,
                            valueUSD: endSwap.valueUSD,
                            tokenInPrice: getPriceForToken(tokenPrices, startSwap.tokenIn, chain),
                            tokenOutPrice: getPriceForToken(tokenPrices, endSwap.tokenOut, chain),
                        },
                    }),
                    ...batchSwaps.map((swap, index) =>
                        prisma.prismaPoolSwap.update({
                            where: { id_chain: { id: swap.id, chain: chain } },
                            data: { batchSwapId: startSwap.id, batchSwapIdx: index },
                        }),
                    ),
                ];
            }
        }
    }

    await prismaBulkExecuteOperations(operations, true);
}

function getSwapOutKey(swap: PrismaPoolSwap): string {
    return `${swap.tokenOut}${swap.tokenAmountOut}`;
}

function getSwapInKey(swap: PrismaPoolSwap): string {
    return `${swap.tokenIn}${swap.tokenAmountIn}`;
}
