import _ from 'lodash';
import { BalancerSwapFragment } from '../../subgraphs/balancer-subgraph/generated/balancer-subgraph-types';
import { Chain } from '@prisma/client';
import { SwapEvent } from '../../../prisma/prisma-types';

/**
 * Takes V2 subgraph swaps and transforms them into DB entries
 *
 * @param swaps
 * @param chain
 * @returns
 */
export function swapV2Transformer(
    swap: BalancerSwapFragment,
    chain: Chain,
    fxPools: { id: string; typeData: { quoteToken: string } }[] = [],
): SwapEvent {
    // Avoiding scientific notation
    const feeFloat = parseFloat(swap.tokenAmountIn) * parseFloat(swap.poolId.swapFee ?? 0);
    let fee = feeFloat < 1e6 ? feeFloat.toFixed(18).replace(/0+$/, '').replace(/\.$/, '') : String(feeFloat);
    let feeFloatUSD = parseFloat(swap.valueUSD) * parseFloat(swap.poolId.swapFee ?? 0);
    let feeUSD =
        feeFloatUSD < 1e6 ? feeFloatUSD.toFixed(18).replace(/0+$/, '').replace(/\.$/, '') : String(feeFloatUSD);

    // FX pools have a different fee calculation
    // Replica of the subgraph logic:
    // https://github.com/balancer/balancer-subgraph-v2/blob/60453224453bd07a0a3a22a8ad6cc26e65fd809f/src/mappings/vault.ts#L551-L564
    if (swap.poolId.poolType === 'FX') {
        // Find the pool that has the quote token
        const fxPool = fxPools.find((pool) => pool.id === swap.poolId.id);
        if (fxPool && [swap.tokenOut, swap.tokenIn].includes(fxPool.typeData.quoteToken)) {
            const quoteTokenAddress = fxPool.typeData.quoteToken;
            const baseTokenAddress = swap.tokenIn === quoteTokenAddress ? swap.tokenOut : swap.tokenIn;
            let isTokenInBase = swap.tokenOut === quoteTokenAddress;
            let baseToken = swap.poolId.tokens?.find(({ token }) => token.address == baseTokenAddress);
            let quoteToken = swap.poolId.tokens?.find(({ token }) => token.address == quoteTokenAddress);
            let baseRate = baseToken != null ? baseToken.token.latestFXPrice : null;
            let quoteRate = quoteToken != null ? quoteToken.token.latestFXPrice : null;

            if (baseRate && quoteRate) {
                if (isTokenInBase) {
                    feeFloatUSD +=
                        parseFloat(swap.tokenAmountIn) * parseFloat(baseRate) -
                        parseFloat(swap.tokenAmountOut) * parseFloat(quoteRate);
                    // Need to set the fee in the tokenIn price, because it's later recalculated based on the DB prices
                    fee = String(feeFloatUSD / parseFloat(baseRate)); // fee / tokenIn price
                } else {
                    feeFloatUSD +=
                        parseFloat(swap.tokenAmountIn) * parseFloat(quoteRate) -
                        parseFloat(swap.tokenAmountOut) * parseFloat(baseRate);
                    // Need to set the fee in the tokenIn price, because it's later recalculated based on the DB prices
                    fee = String(feeFloatUSD / parseFloat(quoteRate)); // fee / tokenIn price
                }
            }

            feeUSD = String(feeFloatUSD);
        }
    }

    return {
        id: swap.id, // tx + logIndex
        tx: swap.tx,
        type: 'SWAP',
        poolId: swap.poolId.id,
        chain: chain,
        protocolVersion: 2,
        userAddress: swap.userAddress.id,
        blockNumber: Number(swap.block ?? 0), // FANTOM is missing block
        blockTimestamp: Number(swap.timestamp),
        logIndex: Number(swap.id.substring(66)),
        valueUSD: Number(swap.valueUSD),
        payload: {
            fee: {
                address: swap.tokenIn,
                amount: fee,
                valueUSD: feeUSD,
            },
            tokenIn: {
                address: swap.tokenIn,
                amount: swap.tokenAmountIn,
            },
            tokenOut: {
                address: swap.tokenOut,
                amount: swap.tokenAmountOut,
            },
        },
    };
}
