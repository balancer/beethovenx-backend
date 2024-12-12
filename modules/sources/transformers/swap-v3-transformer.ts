import _ from 'lodash';
import { SwapFragment } from '../subgraphs/balancer-v3-vault/generated/types';
import { Chain } from '@prisma/client';
import { SwapEvent } from '../../../prisma/prisma-types';
import { prisma } from '../../../prisma/prisma-client';

/**
 * Takes V3 subgraph swaps and transforms them into DB entries
 *
 * @param swaps
 * @param chain
 * @returns
 */
export async function swapV3Transformer(swaps: SwapFragment[], chain: Chain): Promise<SwapEvent[]> {
    return swaps.map((swap) => ({
        id: swap.id, // tx + logIndex
        tx: swap.transactionHash,
        type: 'SWAP',
        poolId: swap.pool,
        chain: chain,
        protocolVersion: 3,
        userAddress: swap.user.id,
        blockNumber: Number(swap.blockNumber),
        blockTimestamp: Number(swap.blockTimestamp),
        logIndex: Number(swap.logIndex),
        valueUSD: 0, // Will be calculated later
        payload: {
            fee: {
                address: swap.swapFeeToken,
                amount: swap.swapFeeAmount,
                valueUSD: '0', // Will be calculated later
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
    }));
}
