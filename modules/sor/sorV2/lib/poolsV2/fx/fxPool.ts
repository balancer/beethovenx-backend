import { Address, Hex, parseEther, parseUnits } from 'viem';
import { FxPoolToken } from './fxPoolToken';
import { PrismaPoolAndHookWithDynamic } from '../../../../../../prisma/prisma-types';
import { MathFx, parseFixedCurveParam } from './helpers';
import { FxData } from '../../../../../pool/subgraph-mapper';
import { Chain } from '@prisma/client';
import { _calcInGivenOut, _calcOutGivenIn } from './fxMath';
import { RAY } from '../../utils/math';
import { FxPoolPairData } from './types';
import { PoolType, SwapKind, Token, TokenAmount } from '@balancer/sdk';
import { chainToIdMap } from '../../../../../network/network-config';
import { TokenPairData } from '../../../../../pool/lib/pool-on-chain-tokenpair-data';
import { BasePool } from '../basePool';

const isUSDC = (address: string): boolean => {
    return (
        address.toLowerCase() === '0x2791bca1f2de4661ed88a30c99a7a9449aa84174' ||
        address.toLowerCase() === '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    );
};

export class FxPool implements BasePool {
    public readonly chain: Chain;
    public readonly id: Hex;
    public readonly address: string;
    public readonly poolType: PoolType = PoolType.Fx;
    public readonly poolTypeVersion: number;
    public readonly swapFee: bigint;
    public readonly alpha: bigint;
    public readonly beta: bigint;
    public readonly lambda: bigint;
    public readonly delta: bigint;
    public readonly epsilon: bigint;
    public readonly tokens: FxPoolToken[];
    public readonly tokenPairs: TokenPairData[];

    private readonly tokenMap: Map<string, FxPoolToken>;

    static fromPrismaPool(pool: PrismaPoolAndHookWithDynamic): FxPool {
        const poolTokens: FxPoolToken[] = [];

        if (!pool.dynamicData) {
            throw new Error('No dynamic data for pool');
        }

        for (const poolToken of pool.tokens) {
            if (!poolToken.dynamicData?.latestFxPrice) {
                throw new Error('FX pool token does not have latestFXPrice');
            }

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
                new FxPoolToken(
                    token,
                    tokenAmount.amount,
                    poolToken.index,
                    `${poolToken.dynamicData.latestFxPrice}`,
                    // TODO query fxOracleDecimals
                    // poolToken.token.fxOracleDecimals || 8,
                    8,
                ),
            );
        }

        return new FxPool(
            pool.id as Hex,
            pool.address,
            pool.chain,
            pool.version,
            parseEther(pool.dynamicData.swapFee),
            parseFixedCurveParam((pool.typeData as FxData).alpha as string),
            parseFixedCurveParam((pool.typeData as FxData).beta as string),
            parseFixedCurveParam((pool.typeData as FxData).lambda as string),
            parseUnits((pool.typeData as FxData).delta as string, 36),
            parseFixedCurveParam((pool.typeData as FxData).epsilon as string),
            poolTokens,
            pool.dynamicData.tokenPairsData as TokenPairData[],
        );
    }

    constructor(
        id: Hex,
        address: string,
        chain: Chain,
        poolTypeVersion: number,
        swapFee: bigint,
        alpha: bigint,
        beta: bigint,
        lambda: bigint,
        delta: bigint,
        epsilon: bigint,
        tokens: FxPoolToken[],
        tokenPairs: TokenPairData[],
    ) {
        this.id = id;
        this.address = address;
        this.chain = chain;
        this.poolTypeVersion = poolTypeVersion;
        this.swapFee = swapFee;
        this.alpha = alpha;
        this.beta = beta;
        this.lambda = lambda;
        this.delta = delta;
        this.epsilon = epsilon;
        this.tokens = tokens;
        this.tokenMap = new Map(this.tokens.map((token) => [token.token.address, token]));
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
        const poolPairData = this.getPoolPairData(tokenIn, tokenOut, swapAmount.amount, SwapKind.GivenIn);
        if (poolPairData.tIn === poolPairData.tOut) return poolPairData.tIn;

        const amountOutNumeraire = _calcOutGivenIn(poolPairData);

        const amountOutNumeraireLessFee = MathFx.mulDownFixed(amountOutNumeraire, RAY - this.epsilon);

        const fxAmountOut = FxPoolToken.fromNumeraire(poolPairData.tOut, amountOutNumeraireLessFee);

        const amountOut = TokenAmount.fromRawAmount(fxAmountOut.token, fxAmountOut.amount);

        if (mutateBalances) {
            poolPairData.tIn.increase(swapAmount.amount);
            poolPairData.tOut.decrease(amountOut.amount);
        }

        return amountOut;
    }

    public swapGivenOut(
        tokenIn: Token,
        tokenOut: Token,
        swapAmount: TokenAmount,
        mutateBalances?: boolean,
    ): TokenAmount {
        const poolPairData = this.getPoolPairData(tokenIn, tokenOut, swapAmount.amount, SwapKind.GivenOut);
        if (poolPairData.tIn === poolPairData.tOut) return poolPairData.tOut;

        const amountInNumeraire = _calcInGivenOut(poolPairData);

        const amountInNumeraireWithFee = MathFx.mulDownFixed(amountInNumeraire, RAY + this.epsilon);

        const fxAmountIn = FxPoolToken.fromNumeraire(poolPairData.tIn, amountInNumeraireWithFee);

        const amountIn = TokenAmount.fromRawAmount(fxAmountIn.token, fxAmountIn.amount);

        if (mutateBalances) {
            poolPairData.tIn.decrease(amountIn.amount);
            poolPairData.tOut.increase(swapAmount.amount);
        }

        return amountIn;
    }

    /**
     * Fx pool logic has an alpha region where it halts swaps.
     * maxLimit  = [(1 + alpha) * oGLiq * 0.5] - token liquidity
     */
    public getLimitAmountSwap(tokenIn: Token, tokenOut: Token, swapKind: SwapKind): bigint {
        const { _oGLiq, tIn, tOut } = this.getPoolPairData(tokenIn, tokenOut, 0n, swapKind);
        const maxLimit = MathFx.mulDownFixed(this.alpha + RAY, _oGLiq) / 2n; // TODO: double check if RAY is indeed 1e36 or 1e27 - google says it's 1e27
        if (swapKind === SwapKind.GivenIn) {
            const maxAmount = maxLimit - tIn.numeraire;
            return FxPoolToken.fromNumeraire(tIn, maxAmount).amount;
        }
        const maxAmount = maxLimit - tOut.numeraire;
        return FxPoolToken.fromNumeraire(tOut, maxAmount).amount;
    }

    public getPoolTokens(tokenIn: Token, tokenOut: Token): { tIn: FxPoolToken; tOut: FxPoolToken } {
        const tIn = this.tokenMap.get(tokenIn.wrapped);
        const tOut = this.tokenMap.get(tokenOut.wrapped);

        if (!tIn || !tOut) {
            throw new Error('Token not found');
        }

        return { tIn, tOut };
    }

    public getPoolPairData(tokenIn: Token, tokenOut: Token, swapAmount: bigint, swapKind: SwapKind): FxPoolPairData {
        const { tIn, tOut } = this.getPoolTokens(tokenIn, tokenOut);

        const usdcToken = isUSDC(tokenIn.address) ? tIn : tOut;
        const baseToken = isUSDC(tokenIn.address) ? tOut : tIn;

        const givenToken =
            swapKind === SwapKind.GivenIn
                ? new FxPoolToken(tIn.token, swapAmount, tIn.index, tIn.latestFXPrice, tIn.fxOracleDecimals)
                : new FxPoolToken(tOut.token, swapAmount, tOut.index, tOut.latestFXPrice, tOut.fxOracleDecimals);

        return {
            tIn,
            tOut,
            alpha: this.alpha,
            beta: this.beta,
            delta: this.delta,
            lambda: this.lambda,
            _oGLiq: baseToken.numeraire + usdcToken.numeraire,
            _nGLiq: baseToken.numeraire + usdcToken.numeraire,
            _oBals: [usdcToken.numeraire, baseToken.numeraire],
            _nBals: isUSDC(tokenIn.address)
                ? [usdcToken.numeraire + givenToken.numeraire, baseToken.numeraire - givenToken.numeraire]
                : [usdcToken.numeraire - givenToken.numeraire, baseToken.numeraire + givenToken.numeraire],
            givenToken,
            swapKind,
        };
    }
}
