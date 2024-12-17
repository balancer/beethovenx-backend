import { Prisma, Chain } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma-client';
import { now, roundToMidnight } from '../../../common/time';
import _ from 'lodash';
import cache from 'memory-cache';

const priceCacheTTL = 5 * 60 * 1000; // 5 minutes

export const applyUSDValues = async (
    rawSnapshots: Prisma.PrismaPoolSnapshotUncheckedCreateInput[],
    fetchPrices = fetchPricesHelper,
    fetchPoolTokens = fetchPoolTokensHelper,
): Promise<Prisma.PrismaPoolSnapshotUncheckedCreateInput[]> => {
    const lastMidnight = roundToMidnight(now());
    const snapshots: Prisma.PrismaPoolSnapshotUncheckedCreateInput[] = [];

    const poolIds = [...new Set(rawSnapshots.map((snapshot) => snapshot.poolId))];

    // Pool tokens are needed, because SG returns raw token amounts and we need token addresses
    const poolTokens = await fetchPoolTokens(poolIds);

    const groupedByPoolId = _.groupBy(rawSnapshots, 'poolId');

    let snapshotCount = 0;
    for (const [, poolSnapshots] of Object.entries(groupedByPoolId)) {
        console.log('Processing snapshots for pool', poolSnapshots[0].poolId, poolSnapshots[0].chain);
        const tokens = _.sortBy(poolTokens[poolSnapshots[0].poolId], 'index');

        if (!tokens) {
            throw new Error(
                `Pool tokens not found for pool ${poolSnapshots[0].poolId} on chain ${poolSnapshots[0].chain}`,
            );
        }

        const sortedSnapshots = _.sortBy(poolSnapshots, 'timestamp');
        for (let index = 0; index < sortedSnapshots.length; index++) {
            const snapshot = sortedSnapshots[index];
            const previousSnapshot = index > 0 && snapshots[snapshotCount - 1];

            const prices = await fetchPrices(
                snapshot.chain,
                snapshot.timestamp < lastMidnight ? snapshot.timestamp : undefined,
            );

            let volume24h = 0;
            const swapTokenWithPrice = Object.values(tokens).find(({ address }) => prices[address]);
            if (swapTokenWithPrice) {
                const swapVolume = (snapshot.dailyVolumes as string[])[swapTokenWithPrice.index] || '0'; // Some snapshots have empty arrays
                volume24h = parseFloat(swapVolume) * prices[swapTokenWithPrice.address];
            }

            const fees24h = calculateValue(snapshot.dailySwapFees as string[], tokens, prices);
            const surplus24h = calculateValue(snapshot.dailySurpluses as string[], tokens, prices);
            const totalLiquidity = calculateValue(snapshot.amounts as string[], tokens, prices);
            const sharePrice = snapshot.totalSharesNum === 0 ? 0 : totalLiquidity / snapshot.totalSharesNum;

            let totalSwapVolume = snapshot.totalSwapVolume || volume24h;
            let totalSwapFee = snapshot.totalSwapFee || fees24h;
            let totalSurplus = snapshot.totalSurplus || surplus24h;

            // Calculate daily values as the difference from the previous snapshot
            if (previousSnapshot) {
                totalSwapVolume = previousSnapshot.totalSwapVolume + volume24h;
                totalSwapFee = previousSnapshot.totalSwapFee + fees24h;
                totalSurplus = (previousSnapshot.totalSurplus || 0) + surplus24h;
            }

            snapshots.push({
                ...snapshot,
                volume24h,
                fees24h,
                surplus24h,
                totalLiquidity,
                sharePrice,
                totalSwapVolume,
                totalSwapFee,
                totalSurplus,
            });

            snapshotCount++;
        }
    }

    return snapshots;
};

const calculateValue = (amounts: string[], tokens: Record<number, any>, prices: Record<string, number>) => {
    if (!amounts || !tokens || !prices) return 0;

    return amounts.reduce((acc, amount, index) => {
        const token = tokens[index];
        return token && prices[token.address] ? acc + parseFloat(amount) * prices[token.address] : acc;
    }, 0);
};

/**
 *
 * @param chain
 * @param timestamp No timestamp for current prices
 * @returns
 */
const fetchPricesHelper = async (chain: Chain, timestamp?: number): Promise<Record<string, number>> => {
    // Check cache
    const cacheKey = `prices-${chain}-${timestamp || 'current'}`;
    const cachedPrices = cache.get(cacheKey);
    if (cachedPrices) return cachedPrices;

    const selector = {
        where: { chain, ...(timestamp ? { timestamp } : {}) }, // No timestamp for current prices
        select: { tokenAddress: true, price: true },
    };

    const priceData = await (timestamp
        ? prisma.prismaTokenPrice.findMany(selector)
        : prisma.prismaTokenCurrentPrice.findMany(selector));

    const prices = priceData.reduce((acc, { tokenAddress, price }) => ({ ...acc, [tokenAddress]: price }), {});

    // Update cache
    if (Object.keys(prices).length > 0) {
        cache.put(cacheKey, prices, priceCacheTTL);
    }

    return prices;
};

const fetchPoolTokensHelper = (poolIds: string[]): Promise<Record<string, any[]>> => {
    return prisma.prismaPoolToken
        .findMany({
            where: { poolId: { in: poolIds } },
            select: { poolId: true, address: true, index: true },
        })
        .then((tokens) => _.groupBy(tokens, 'poolId'));
};
