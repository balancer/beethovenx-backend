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

    // Pool tokens are needed, because SG returns raw token amounts
    const poolTokens = await fetchPoolTokens(poolIds);

    // For each timestamp, fetch the prices and calculate USD values
    const groupedTimestamps = _.groupBy(rawSnapshots, 'timestamp');

    for (const [timestamp, group] of Object.entries(groupedTimestamps)) {
        // For each poolId, calculate USD values
        const prices = await fetchPrices(
            group[0].chain,
            parseInt(timestamp) < lastMidnight ? parseInt(timestamp) : undefined,
        );

        for (const snapshot of group) {
            if (
                !poolTokens[snapshot.poolId] ||
                poolTokens[snapshot.poolId].length === 0 ||
                !snapshot.amounts ||
                !snapshot.totalVolumes ||
                !snapshot.totalSwapFees
            ) {
                snapshots.push(snapshot);
                continue;
            }

            const tokens = _.keyBy(poolTokens[snapshot.poolId], 'index');

            // With token do we have the price for?
            let swapTokenIndex = Object.values(tokens).findIndex(({ address }) => prices[address]);
            if (swapTokenIndex < 0) swapTokenIndex = 0;
            const swapVolume = (snapshot.totalVolumes as string[])[swapTokenIndex] || '0'; // Some snapshots have empty arrays

            // Swap volume is only for the tokenIn
            const totalSwapVolume = parseFloat(swapVolume) * (prices[tokens[swapTokenIndex].address] || 0);
            const totalLiquidity = calculateValue(snapshot.amounts as string[], tokens, prices);
            const totalSwapFee = calculateValue(snapshot.totalSwapFees as string[], tokens, prices);
            const sharePrice = snapshot.totalSharesNum === 0 ? 0 : totalLiquidity / snapshot.totalSharesNum;

            const totalSurplus = calculateValue(snapshot.totalSurpluses as string[], tokens, prices);

            // Calculate USD values
            const usdValues = {
                totalLiquidity,
                totalSwapVolume,
                totalSwapFee,
                sharePrice,
                totalSurplus,
            };

            snapshots.push({ ...snapshot, ...usdValues });
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
