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
export function swapV2Transformer(swap: BalancerSwapFragment, chain: Chain): SwapEvent {
    // Avoiding scientific notation
    const feeFloat = parseFloat(swap.tokenAmountIn) * parseFloat(swap.poolId.swapFee ?? 0);
    const fee = feeFloat < 1e6 ? feeFloat.toFixed(18).replace(/0+$/, '').replace(/\.$/, '') : String(feeFloat);
    let feeFloatUSD = parseFloat(swap.valueUSD) * parseFloat(swap.poolId.swapFee ?? 0);
    let feeUSD =
        feeFloatUSD < 1e6 ? feeFloatUSD.toFixed(18).replace(/0+$/, '').replace(/\.$/, '') : String(feeFloatUSD);

    if (swap.poolId.poolType === 'FX') {
        const tokenOutAddress = swap.tokenOut;
        const tokenInAddress = swap.tokenIn;
        // FX pools have a different fee calculation
        const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
        let isTokenInBase = tokenOutAddress == USDC_ADDRESS;
        let baseTokenAddress = isTokenInBase ? tokenInAddress : tokenOutAddress;
        let quoteTokenAddress = isTokenInBase ? tokenOutAddress : tokenInAddress;
        let baseToken = swap.poolId.tokens?.find(({ token }) => token.address == baseTokenAddress);
        let quoteToken = swap.poolId.tokens?.find(({ token }) => token.address == quoteTokenAddress);
        let baseRate = baseToken != null ? baseToken.token.latestFXPrice : null;
        let quoteRate = quoteToken != null ? quoteToken.token.latestFXPrice : null;

        if (baseRate && quoteRate) {
            if (isTokenInBase) {
                feeFloatUSD +=
                    parseFloat(swap.tokenAmountIn) * parseFloat(baseRate) -
                    parseFloat(swap.tokenAmountOut) * parseFloat(quoteRate);
            } else {
                feeFloatUSD +=
                    parseFloat(swap.tokenAmountIn) * parseFloat(quoteRate) -
                    parseFloat(swap.tokenAmountOut) * parseFloat(baseRate);
            }
        }

        feeUSD = String(feeFloatUSD);
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
