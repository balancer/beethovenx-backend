import { PrismaPoolWithDynamicAndHook } from '../../../../../../prisma/prisma-types';
import { Chain } from '@prisma/client';
import { MathSol, WAD } from '../../utils/math';
import { Address, Hex, parseEther, parseUnits } from 'viem';
import {
    _calcBptInGivenExactTokensOut,
    _calcBptOutGivenExactTokensIn,
    _calcInGivenOut,
    _calcOutGivenIn,
    _calcTokenInGivenExactBptOut,
    _calcTokenOutGivenExactBptIn,
    _calculateInvariant,
} from './stableMath';
import { BigintIsh, PoolType, SwapKind, Token, TokenAmount } from '@balancer/sdk';
import { chainToIdMap } from '../../../../../network/network-config';
import { StableData } from '../../../../../pool/subgraph-mapper';
import { TokenPairData } from '../../../../../pool/lib/pool-on-chain-tokenpair-data';
import { BasePool } from '../basePool';
import { BasePoolToken } from '../basePoolToken';

export class ComposableStablePoolToken extends BasePoolToken {
    public readonly rate: bigint;

    public constructor(token: Token, amount: BigintIsh, index: number, rate: BigintIsh) {
        super(token, amount, index);
        this.rate = BigInt(rate);
        this.scale18 = (this.amount * this.scalar * this.rate) / WAD;
    }

    public increase(amount: bigint): TokenAmount {
        this.amount = this.amount + amount;
        this.scale18 = (this.amount * this.scalar * this.rate) / WAD;
        return this;
    }

    public decrease(amount: bigint): TokenAmount {
        this.amount = this.amount - amount;
        this.scale18 = (this.amount * this.scalar * this.rate) / WAD;
        return this;
    }
}

export class ComposableStablePool implements BasePool {
    public readonly chain: Chain;
    public readonly id: Hex;
    public readonly address: string;
    public readonly poolType: PoolType = PoolType.ComposableStable;
    public readonly amp: bigint;
    public readonly swapFee: bigint;
    public readonly bptIndex: number;
    public readonly tokenPairs: TokenPairData[];

    public totalShares: bigint;
    public tokens: ComposableStablePoolToken[];

    private readonly tokenMap: Map<string, ComposableStablePoolToken>;
    private readonly tokenIndexMap: Map<string, number>;

    static fromPrismaPool(pool: PrismaPoolWithDynamicAndHook): ComposableStablePool {
        const poolTokens: ComposableStablePoolToken[] = [];

        if (!pool.dynamicData) throw new Error('Stable pool has no dynamic data');

        for (const poolToken of pool.tokens) {
            if (!poolToken.dynamicData?.priceRate) throw new Error('Stable pool token does not have a price rate');
            const token = new Token(
                parseFloat(chainToIdMap[pool.chain]),
                poolToken.address as Address,
                poolToken.token.decimals,
                poolToken.token.symbol,
                poolToken.token.name,
            );
            const scale18 = parseEther(poolToken.dynamicData.balance);
            const tokenAmount = TokenAmount.fromScale18Amount(token, scale18);

            poolTokens.push(
                new ComposableStablePoolToken(
                    token,
                    tokenAmount.amount,
                    poolToken.index,
                    parseEther(poolToken.dynamicData.priceRate),
                ),
            );
        }

        const totalShares = parseEther(pool.dynamicData.totalShares);
        const amp = parseUnits((pool.typeData as StableData).amp, 3);

        return new ComposableStablePool(
            pool.id as Hex,
            pool.address,
            pool.chain,
            amp,
            parseEther(pool.dynamicData.swapFee),
            poolTokens,
            totalShares,
            pool.dynamicData.tokenPairsData as TokenPairData[],
        );
    }

    constructor(
        id: Hex,
        address: string,
        chain: Chain,
        amp: bigint,
        swapFee: bigint,
        tokens: ComposableStablePoolToken[],
        totalShares: bigint,
        tokenPairs: TokenPairData[],
    ) {
        this.chain = chain;
        this.id = id;
        this.address = address;
        this.amp = amp;
        this.swapFee = swapFee;
        this.totalShares = totalShares;

        this.tokens = tokens.sort((a, b) => a.index - b.index);
        this.tokenMap = new Map(this.tokens.map((token) => [token.token.address, token]));
        this.tokenIndexMap = new Map(this.tokens.map((token) => [token.token.address, token.index]));

        this.bptIndex = this.tokens.findIndex((t) => t.token.address === this.address);
        this.tokenPairs = tokenPairs;
    }

    public getNormalizedLiquidity(tokenIn: Token, tokenOut: Token): bigint {
        const { tIn, tOut } = this.getPoolTokens(tokenIn, tokenOut);

        const tokenPair = this.tokenPairs.find(
            (tokenPair) => tokenPair.tokenA === tIn.token.address && tokenPair.tokenB === tOut.token.address,
        );

        if (tokenPair) {
            return BigInt(tokenPair.normalizedLiquidity);
        }
        return 0n;
    }

    public swapGivenIn(
        tokenIn: Token,
        tokenOut: Token,
        swapAmount: TokenAmount,
        mutateBalances?: boolean,
    ): TokenAmount {
        const { tIn, tOut } = this.getPoolTokens(tokenIn, tokenOut);

        const balancesNoBpt = this.dropBptItem(this.tokens.map((t) => t.scale18));

        // TODO: Fix stable swap limit
        if (swapAmount.scale18 > tIn.scale18) {
            throw new Error('Swap amount exceeds the pool limit');
        }

        const invariant = _calculateInvariant(this.amp, balancesNoBpt);

        let tokenOutScale18: bigint;
        if (tIn.index === this.bptIndex) {
            const amountInWithRate = swapAmount.mulDownFixed(tIn.rate);

            tokenOutScale18 = _calcTokenOutGivenExactBptIn(
                this.amp,
                [...balancesNoBpt],
                this.skipBptIndex(tOut.index),
                amountInWithRate.scale18,
                this.totalShares,
                invariant,
                this.swapFee,
            );
        } else if (tOut.index === this.bptIndex) {
            const amountsIn = new Array(balancesNoBpt.length).fill(0n);

            const amountInWithRate = swapAmount.mulDownFixed(tIn.rate);
            amountsIn[this.skipBptIndex(tIn.index)] = amountInWithRate.scale18;

            tokenOutScale18 = _calcBptOutGivenExactTokensIn(
                this.amp,
                [...balancesNoBpt],
                amountsIn,
                this.totalShares,
                invariant,
                this.swapFee,
            );
        } else {
            const amountInWithFee = this.subtractSwapFeeAmount(swapAmount);
            const amountInWithRate = amountInWithFee.mulDownFixed(this.tokens[tIn.index].rate);

            tokenOutScale18 = _calcOutGivenIn(
                this.amp,
                [...balancesNoBpt],
                this.skipBptIndex(tIn.index),
                this.skipBptIndex(tOut.index),
                amountInWithRate.scale18,
                invariant,
            );
        }

        const amountOut = TokenAmount.fromScale18Amount(tokenOut, tokenOutScale18);
        const amountOutWithRate = amountOut.divDownFixed(tOut.rate);

        if (amountOutWithRate.amount < 0n) throw new Error('Swap output negative');

        if (mutateBalances) {
            tIn.increase(swapAmount.amount);
            tOut.decrease(amountOutWithRate.amount);

            if (tIn.index === this.bptIndex) {
                this.totalShares = this.totalShares - swapAmount.amount;
            } else if (tOut.index === this.bptIndex) {
                this.totalShares = this.totalShares + amountOutWithRate.amount;
            }
        }

        return amountOutWithRate;
    }

    public swapGivenOut(
        tokenIn: Token,
        tokenOut: Token,
        swapAmount: TokenAmount,
        mutateBalances?: boolean,
    ): TokenAmount {
        const { tIn, tOut } = this.getPoolTokens(tokenIn, tokenOut);

        const balancesNoBpt = this.dropBptItem(this.tokens.map((t) => t.scale18));

        // TODO: Fix stable swap limit
        if (swapAmount.scale18 > tOut.scale18) {
            throw new Error('Swap amount exceeds the pool limit');
        }

        const amountOutWithRate = swapAmount.mulDownFixed(tOut.rate);

        const invariant = _calculateInvariant(this.amp, balancesNoBpt);

        let amountIn: TokenAmount;
        if (tIn.index === this.bptIndex) {
            const amountsOut = new Array(balancesNoBpt.length).fill(0n);
            amountsOut[this.skipBptIndex(tOut.index)] = amountOutWithRate.scale18;

            const tokenInScale18 = _calcBptInGivenExactTokensOut(
                this.amp,
                [...balancesNoBpt],
                amountsOut,
                this.totalShares,
                invariant,
                this.swapFee,
            );

            amountIn = TokenAmount.fromScale18Amount(tokenIn, tokenInScale18, true).divDownFixed(tIn.rate);
        } else if (tOut.index === this.bptIndex) {
            const tokenInScale18 = _calcTokenInGivenExactBptOut(
                this.amp,
                [...balancesNoBpt],
                this.skipBptIndex(tIn.index),
                amountOutWithRate.scale18,
                this.totalShares,
                invariant,
                this.swapFee,
            );

            amountIn = TokenAmount.fromScale18Amount(tokenIn, tokenInScale18, true).divDownFixed(tIn.rate);
        } else {
            const tokenInScale18 = _calcInGivenOut(
                this.amp,
                [...balancesNoBpt],
                this.skipBptIndex(tIn.index),
                this.skipBptIndex(tOut.index),
                amountOutWithRate.scale18,
                invariant,
            );

            const amountInWithoutFee = TokenAmount.fromScale18Amount(tokenIn, tokenInScale18, true);
            const amountInWithFee = this.addSwapFeeAmount(amountInWithoutFee);

            amountIn = amountInWithFee.divDownFixed(tIn.rate);
        }

        if (amountIn.amount < 0n) throw new Error('Swap output negative');

        if (mutateBalances) {
            tIn.increase(amountIn.amount);
            tIn.decrease(swapAmount.amount);

            if (tIn.index === this.bptIndex) {
                this.totalShares = this.totalShares - amountIn.amount;
            } else if (tOut.index === this.bptIndex) {
                this.totalShares = this.totalShares + swapAmount.amount;
            }
        }

        return amountIn;
    }

    public subtractSwapFeeAmount(amount: TokenAmount): TokenAmount {
        const feeAmount = amount.mulUpFixed(this.swapFee);
        return amount.sub(feeAmount);
    }

    public addSwapFeeAmount(amount: TokenAmount): TokenAmount {
        return amount.divUpFixed(MathSol.complementFixed(this.swapFee));
    }

    public getLimitAmountSwap(tokenIn: Token, tokenOut: Token, swapKind: SwapKind): bigint {
        const { tIn, tOut } = this.getPoolTokens(tokenIn, tokenOut);

        if (swapKind === SwapKind.GivenIn) {
            // Return max valid amount of tokenIn
            const scale18 = (tOut.scale18 * tOut.rate) / tIn.rate;
            return TokenAmount.fromScale18Amount(tokenIn, scale18).amount;
        }
        // Return max amount of tokenOut - approx is almost all balance
        return tOut.amount;
    }

    public skipBptIndex(index: number): number {
        if (index === this.bptIndex) throw new Error('Cannot skip BPT index');
        return index < this.bptIndex ? index : index - 1;
    }

    public dropBptItem(amounts: bigint[]): bigint[] {
        const amountsWithoutBpt = new Array(amounts.length - 1).fill(0n);
        for (let i = 0; i < amountsWithoutBpt.length; i++) {
            amountsWithoutBpt[i] = amounts[i < this.bptIndex ? i : i + 1];
        }
        return amountsWithoutBpt;
    }

    public getPoolTokens(
        tokenIn: Token,
        tokenOut: Token,
    ): { tIn: ComposableStablePoolToken; tOut: ComposableStablePoolToken } {
        const tIn = this.tokenMap.get(tokenIn.wrapped);
        const tOut = this.tokenMap.get(tokenOut.wrapped);

        if (!tIn || !tOut) {
            throw new Error('Pool does not contain the tokens provided');
        }

        return { tIn, tOut };
    }
}
