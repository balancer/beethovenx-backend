import _ from 'lodash';
import { BalancerPoolSnapshotFragment } from '../../subgraphs/balancer-subgraph/generated/balancer-subgraph-types';
import { Chain, PrismaPoolSnapshot } from '@prisma/client';
import { parseUnits } from 'viem';

/**
 * Takes V2 subgraph snapshots and transforms them into DB entries.
 *
 * @param poolId - pool ID
 * @param poolTokens - list of token addresses
 * @param epoch - timestamp of the current day
 * @param chain - chain
 * @param allTokens - list of all tokens, used to get decimals
 * @param previousDaySnapshot - previous day snapshot used to calculate daily values and acts as a fallback for total values when there were no swaps in the current day
 * @param snapshot - V2 snapshot
 * @returns
 */
export const snapshotsV2Transformer = (
    poolId: string,
    poolTokens: string[],
    epoch: number,
    chain: Chain,
    prices: Record<string, number>,
    previousDaySnapshot?: PrismaPoolSnapshot,
    snapshot?: BalancerPoolSnapshotFragment,
): PrismaPoolSnapshot | undefined => {
    if (!snapshot && !previousDaySnapshot) {
        return;
    }

    // Use when the pool is new and there are no snapshots yet
    const defaultZeros = Array.from({ length: poolTokens.length }, () => '0');

    // `poolId-epoch` is used as the ID
    const base = {
        id: `${poolId}-${epoch}`,
        chain,
        poolId,
        timestamp: epoch,
        protocolVersion: 2,
    };

    const values = {
        totalShares: String(parseUnits(snapshot?.totalShares || '0', 18)) || previousDaySnapshot?.totalShares || '0',
        totalSharesNum: parseFloat(snapshot?.totalShares || '0') || previousDaySnapshot?.totalSharesNum || 0,
        swapsCount: Number(snapshot?.swapsCount) || previousDaySnapshot?.swapsCount || 0,
        holdersCount: Number(snapshot?.holdersCount) || previousDaySnapshot?.holdersCount || 0,
        amounts: snapshot?.amounts || previousDaySnapshot?.amounts || defaultZeros,
        totalVolumes: [], // V3 field only, it's a split in token volumes
        totalSwapFees: [], // V3 field only, it's a split in token volumes
        totalProtocolSwapFees: [], // V3 field only, it's a split in fees per token
        totalProtocolYieldFees: [], // V3 field only, it's a split in fees per token
        totalSurpluses: [], // V3 field only, it's a split in token surpluses
        dailyVolumes: [], // V3 field only, it's a split in token volumes
        dailySwapFees: [], // V3 field only, it's a split in token volumes
        dailyProtocolSwapFees: [], // V3 field only, it's a split in fees per token
        dailyProtocolYieldFees: [], // V3 field only, it's a split in fees per token
        dailySurpluses: [], // V3 field only, it's a split in token surpluses
    };

    // Calculate USD values
    let totalLiquidity = 0;

    try {
        totalLiquidity = values.amounts.reduce((acc, amount, index) => {
            const address = poolTokens[index];
            if (!prices[address]) {
                throw 'Price not found';
            }
            return parseFloat(amount) * prices[address] + acc;
        }, 0);
    } catch (e) {
        // There was a missing price, fallback to the subgraph value
    }

    // Fallback to the subgraph values when prices aren't available
    totalLiquidity =
        totalLiquidity || (snapshot && parseFloat(snapshot.liquidity)) || previousDaySnapshot?.totalLiquidity || 0;

    const totalVolume = (snapshot && parseFloat(snapshot.swapVolume)) || previousDaySnapshot?.totalSwapVolume || 0;
    const dailyVolume = totalVolume - (previousDaySnapshot?.totalSwapVolume || 0);
    const totalFees = (snapshot && parseFloat(snapshot.swapFees)) || previousDaySnapshot?.totalSwapFee || 0;
    const dailyFees = totalFees - (previousDaySnapshot?.totalSwapFee || 0);

    const usdValues = {
        totalLiquidity: totalLiquidity,
        sharePrice: values.totalSharesNum === 0 ? 0 : totalLiquidity / values.totalSharesNum,
        volume24h: dailyVolume,
        fees24h: dailyFees,
        surplus24h: 0,
        totalSwapVolume: totalVolume,
        totalSwapFee: totalFees,
        totalSurplus: 0,
    };

    return {
        ...base,
        ...values,
        ...usdValues,
    };
};
