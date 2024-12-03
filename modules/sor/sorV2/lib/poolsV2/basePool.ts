import { BufferState, PoolState } from '@balancer-labs/balancer-maths';
import { PoolType, SwapKind, Token, TokenAmount } from '@balancer/sdk';
import { Hex } from 'viem';
import { BasePoolToken } from './basePoolToken';
import { Erc4626PoolToken } from './erc4626PoolToken';

export interface BasePool {
    readonly poolType: PoolType | string;
    readonly id: Hex;
    readonly address: string;
    swapFee: bigint;
    tokens: BasePoolToken[];
    getNormalizedLiquidity(tokenIn: Token, tokenOut: Token): bigint;
    swapGivenIn(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount, mutateBalances?: boolean): TokenAmount;
    swapGivenOut(tokenIn: Token, tokenOut: Token, swapAmount: TokenAmount, mutateBalances?: boolean): TokenAmount;
    getLimitAmountSwap(tokenIn: Token, tokenOut: Token, swapKind: SwapKind): bigint;
    /**
     * Validate that pool contains tokenIn and tokenOut provided and returns pool specific token data (e.g. balance, index, weight, rate, etc.)
     */
    getPoolTokens(tokenIn: Token, tokenOut: Token): { tIn: BasePoolToken; tOut: BasePoolToken };
}

export interface BasePoolV3 extends BasePool {
    tokens: (BasePoolToken | Erc4626PoolToken)[];
    getPoolState(): PoolState | BufferState;
}
