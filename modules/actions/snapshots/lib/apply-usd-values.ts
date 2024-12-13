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

    for (const [, poolSnapshots] of Object.entries(groupedByPoolId)) {
        console.log('Processing snapshots for pool', poolSnapshots[0].poolId, poolSnapshots[0].chain);
        const sortedSnapshots = _.sortBy(poolSnapshots, 'timestamp');
        for (let index = 0; index < sortedSnapshots.length; index++) {
            const snapshot = sortedSnapshots[index];
            const previousSnapshot = sortedSnapshots[index - 1];
            const tokens = poolTokens[snapshot.poolId];

            if (!tokens) {
                throw new Error(`Pool tokens not found for pool ${snapshot.poolId} on chain ${snapshot.chain}`);
            }

            const prices = await fetchPrices(
                snapshot.chain,
                snapshot.timestamp < lastMidnight ? snapshot.timestamp : undefined,
            );

            let swapTokenIndex = Object.values(tokens).findIndex(({ address }) => prices[address]);
            if (swapTokenIndex < 0) swapTokenIndex = 0;

            const swapVolume = (snapshot.dailyVolumes as string[])[swapTokenIndex] || '0'; // Some snapshots have empty arrays
            const volume24h = parseFloat(swapVolume) * (prices[tokens[swapTokenIndex].address] || 0);

            const fees24h = calculateValue(snapshot.dailySwapFees as string[], tokens, prices);
            const surplus24h = calculateValue(snapshot.dailySurpluses as string[], tokens, prices);
            const totalLiquidity = calculateValue(snapshot.amounts as string[], tokens, prices);
            const sharePrice = snapshot.totalSharesNum === 0 ? 0 : totalLiquidity / snapshot.totalSharesNum;

            let totalSwapVolume = snapshot.totalSwapVolume;
            let totalSwapFee = snapshot.totalSwapFee;
            let totalSurplus = snapshot.totalSurplus;

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
    if (cachedPrices) {
        console.log('Using cached prices', cacheKey);
        return cachedPrices;
    }

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
