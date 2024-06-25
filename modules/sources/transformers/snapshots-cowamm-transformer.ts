import _ from 'lodash';
import { Chain, PrismaPoolSnapshot, PrismaToken } from '@prisma/client';
import { weiToFloat } from '../../common/numbers';
import { CowAmmSnapshotFragment } from '../subgraphs/cow-amm/generated/types';

/**
 * Takes V3 subgraph snapshots and transforms them into DB entries.
 *
 * @param poolId - pool ID
 * @param poolTokens - list of token addresses
 * @param epoch - timestamp of the current day
 * @param chain - chain
 * @param allTokens - list of all tokens, used to get decimals
 * @param prices - token prices used to calculate USD values
 * @param previousDaySnapshot - previous day snapshot used to calculate daily values and acts as a fallback for total values when there were no swaps in the current day
 * @param snapshot - V3 snapshot
 * @returns
 */
export const snapshotsCowAmmTransformer = (
    poolId: string,
    poolTokens: string[],
    epoch: number,
    chain: Chain,
    allTokens: PrismaToken[],
    prices: Record<string, number>,
    previousDaySnapshot?: PrismaPoolSnapshot,
    snapshot?: CowAmmSnapshotFragment,
): PrismaPoolSnapshot => {
    // Subgraph is storing balances in wei, we need to convert them to float using token decimals
    const decimals = Object.fromEntries(
        allTokens.filter((t) => poolTokens.includes(t.address)).map((t) => [t.address, t.decimals]),
    );

    // Use when the pool is new and there are no snapshots yet
    const defaultZeros = Array.from({ length: poolTokens.length }, () => '0');

    // `poolId-epoch` is used as the ID
    const base = {
        id: `${poolId}-${epoch}`,
        chain,
        poolId,
        timestamp: epoch,
        protocolVersion: 1,
    };

    const values = {
        totalShares: snapshot?.totalShares || previousDaySnapshot?.totalShares || '0',
        totalSharesNum: weiToFloat(snapshot?.totalShares || previousDaySnapshot?.totalShares || '0', 18),
        swapsCount: Number(snapshot?.swapsCount) || previousDaySnapshot?.swapsCount || 0,
        holdersCount: Number(snapshot?.holdersCount) || previousDaySnapshot?.holdersCount || 0,
        totalVolumes:
            snapshot?.totalVolume.map((balance, index) => {
                const address = poolTokens[index];
                return String(weiToFloat(balance, decimals[address] || 18));
            }) ||
            previousDaySnapshot?.totalVolumes ||
            defaultZeros,
        totalSurpluses:
            snapshot?.totalSurplus.map((balance, index) => {
                const address = poolTokens[index];
                return String(weiToFloat(balance, decimals[address] || 18));
            }) ||
            previousDaySnapshot?.totalSurpluses ||
            defaultZeros,
        totalProtocolSwapFees: defaultZeros,
        totalProtocolYieldFees: defaultZeros,
        amounts:
            snapshot?.balances.map((balance, index) => {
                const address = poolTokens[index];
                return String(weiToFloat(balance, decimals[address] || 18));
            }) ||
            previousDaySnapshot?.amounts ||
            defaultZeros,
    };

    const tvl = values.amounts.reduce((acc, amount, index) => {
        const address = poolTokens[index];
        if (!prices[address]) {
            console.error(`Missing price for ${address} on ${chain}`);
            return acc;
        }
        return parseFloat(amount) * prices[address] + acc;
    }, 0);

    const lastVolume = previousDaySnapshot?.totalSwapVolume || 0;

    const dailyVolume =
        snapshot?.totalVolume.reduce((acc, volume, index) => {
            const address = poolTokens[index];
            const previousVolume = previousDaySnapshot?.totalVolumes[index] || '0';
            const diff = weiToFloat(volume, decimals[address] || 18) - parseFloat(previousVolume);
            if (!prices[address]) {
                return acc;
            }
            return acc + diff * prices[address];
        }, 0) || 0;

    const lastSurplus = previousDaySnapshot?.totalSurplus || 0;

    const dailySurplus =
        snapshot?.totalSurplus.reduce((acc, surplus, index) => {
            const address = poolTokens[index];
            const previousSurplus = previousDaySnapshot?.totalSurpluses[index] || '0';
            const diff = weiToFloat(surplus, decimals[address] || 18) - parseFloat(previousSurplus);
            if (!prices[address]) {
                return acc;
            }
            return acc + diff * prices[address];
        }, 0) || 0;

    const totalVolume = lastVolume + dailyVolume;

    const totalSurplus = lastSurplus + dailySurplus;

    const lastFees = previousDaySnapshot?.totalSwapFee || 0;

    const dailyFees = dailyVolume * parseFloat(snapshot?.pool.swapFee || '0');

    const totalFees = lastFees + dailyFees;

    const usdValues = {
        totalLiquidity: tvl,
        sharePrice: values.totalSharesNum === 0 ? 0 : tvl / values.totalSharesNum,
        volume24h: dailyVolume,
        fees24h: dailyFees,
        surplus24h: dailySurplus,
        totalSwapVolume: totalVolume,
        totalSwapFee: totalFees,
        totalSurplus: totalSurplus,
    };

    return {
        ...base,
        ...values,
        ...usdValues,
    };
};
