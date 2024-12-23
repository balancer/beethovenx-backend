import _ from 'lodash';
import { daysAgo, roundToHour, roundToMidnight } from '../../common/time';
import { Chain } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';
import { SwapEvent } from '../../../prisma/prisma-types';

/**
 * Takes swaps events and enriches them with USD values
 *
 * @param swaps
 * @param chain
 * @returns
 */
export async function swapsUsd(swaps: SwapEvent[], chain: Chain): Promise<SwapEvent[]> {
    // Enrich with USD values
    // Group swaps based on timestamp, hourly and daily buckets
    const groupedSwaps = _.groupBy(swaps, (swap) => {
        const timestamp = swap.blockTimestamp;
        // If swap is older than 30 days, round to midnight
        if (timestamp < daysAgo(30)) {
            return roundToMidnight(timestamp);
        }
        // Otherwise round to the nearest hour
        return roundToHour(timestamp);
    });

    const dbEntries: SwapEvent[] = [];
    for (const [timestamp, swaps] of Object.entries(groupedSwaps)) {
        const tokenPrices = await prisma.prismaTokenPrice.findMany({
            where: {
                timestamp: {
                    equals: parseInt(timestamp),
                },
                chain,
            },
        });

        for (const swap of swaps) {
            const tokenIn = tokenPrices.find((price) => price.tokenAddress === swap.payload.tokenIn.address);
            const tokenOut = tokenPrices.find((price) => price.tokenAddress === swap.payload.tokenOut.address);
            const feeToken = tokenPrices.find((price) => price.tokenAddress === swap.payload.fee.address);
            const surplusToken = tokenPrices.find((price) => price.tokenAddress === swap.payload.surplus?.address);
            const feeValueUSD = parseFloat(swap.payload.fee.amount) * (feeToken?.price || 0);

            const payload = {
                fee: {
                    ...swap.payload.fee,
                    valueUSD: String(feeValueUSD > 0 ? feeValueUSD : swap.payload.fee.valueUSD),
                },
                tokenIn: {
                    ...swap.payload.tokenIn,
                },
                tokenOut: {
                    ...swap.payload.tokenOut,
                },
                surplus: swap.payload.surplus
                    ? {
                          ...swap.payload.surplus,
                          valueUSD: String((surplusToken?.price || 0) * parseFloat(swap.payload.surplus.amount)),
                      }
                    : undefined,
            };

            const valueUSD =
                (tokenIn?.price || 0) * parseFloat(swap.payload.tokenIn.amount) ||
                (tokenOut?.price || 0) * parseFloat(swap.payload.tokenOut.amount);

            dbEntries.push({
                ...swap,
                // Taking all the chances to get the token price
                valueUSD,
                payload,
            });
        }
    }
    return dbEntries;
}
