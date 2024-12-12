import { Prisma, Chain } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma-client';
import { now, roundToMidnight } from '../../../common/time';
import _ from 'lodash';

const priceCacheTTL = 5 * 60; // 5 minutes
const priceCache: Record<string, { ttl: number; items: Record<string, number> }> = {};

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
                !snapshot.totalProtocolSwapFees
            ) {
                snapshots.push(snapshot);
                continue;
            }

            const tokens = _.keyBy(poolTokens[snapshot.poolId], 'index');

            const totalLiquidity = calculateValue(snapshot.amounts as string[], tokens, prices);
            const totalSwapVolume = calculateValue(snapshot.totalVolumes as string[], tokens, prices);
            const totalSwapFee = calculateValue(snapshot.totalProtocolSwapFees as string[], tokens, prices);
            const sharePrice = snapshot.totalSharesNum === 0 ? 0 : totalLiquidity / snapshot.totalSharesNum;

            // Calculate USD values
            const usdValues = {
                totalLiquidity,
                totalSwapVolume,
                totalSwapFee,
                sharePrice,
            };

            snapshots.push({ ...snapshot, ...usdValues });
        }
    }

    return snapshots;
};

const calculateValue = (amounts: string[], tokens: Record<number, any>, prices: Record<string, number>) => {
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
    const cacheKey = `${chain}-${timestamp || 'current'}`;
    const cachedPrices = priceCache[cacheKey];
    if (cachedPrices && cachedPrices.items.length > 0 && cachedPrices.ttl > now()) {
        return cachedPrices.items;
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
        priceCache[cacheKey] = { ttl: now() + priceCacheTTL, items: prices };
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
