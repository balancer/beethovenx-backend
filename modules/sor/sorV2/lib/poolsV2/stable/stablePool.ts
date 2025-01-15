import { Chain } from '@prisma/client';
import { Address, Hex, parseEther, parseUnits } from 'viem';
import { PrismaPoolAndHookWithDynamic } from '../../../../../../prisma/prisma-types';
import { _calcInGivenOut, _calcOutGivenIn, _calculateInvariant } from '../composableStable/stableMath';
import { MathSol, WAD } from '../../utils/math';
import { PoolType, SwapKind, Token, TokenAmount } from '@balancer/sdk';
import { chainToChainId as chainToIdMap } from '../../../../../network/chain-id-to-chain';
import { StableData } from '../../../../../pool/subgraph-mapper';
import { TokenPairData } from '../../../../../pool/lib/pool-on-chain-tokenpair-data';
import { BasePool } from '../basePool';
import { BasePoolToken } from '../basePoolToken';

export class StablePool implements BasePool {
    public readonly chain: Chain;
    public readonly id: Hex;
    public readonly address: string;
    public readonly poolType: PoolType = PoolType.Stable;
    public readonly amp: bigint;
    public readonly swapFee: bigint;
    public readonly tokens: BasePoolToken[];
    public readonly tokenPairs: TokenPairData[];

    private readonly tokenMap: Map<string, BasePoolToken>;

    static fromPrismaPool(pool: PrismaPoolAndHookWithDynamic): StablePool {
        const poolTokens: BasePoolToken[] = [];

        if (!pool.dynamicData) throw new Error('Stable pool has no dynamic data');

        for (const poolToken of pool.tokens) {
            const token = new Token(
                parseFloat(chainToIdMap[pool.chain]),
                poolToken.address as Address,
                poolToken.token.decimals,
                poolToken.token.symbol,
                poolToken.token.name,
            );
            const scale18 = parseEther(poolToken.balance);
            const tokenAmount = TokenAmount.fromScale18Amount(token, scale18);

            poolTokens.push(new BasePoolToken(token, tokenAmount.amount, poolToken.index));
        }

        const amp = parseUnits((pool.typeData as StableData).amp, 3);

        return new StablePool(
            pool.id as Hex,
            pool.address,
            pool.chain,
            amp,
            parseEther(pool.dynamicData.swapFee),
            poolTokens,
            pool.dynamicData.tokenPairsData as TokenPairData[],
        );
    }

    constructor(
        id: Hex,
        address: string,
        chain: Chain,
        amp: bigint,
        swapFee: bigint,
        tokens: BasePoolToken[],
        tokenPairs: TokenPairData[],
    ) {
        this.id = id;
        this.address = address;
        this.chain = chain;
        this.amp = amp;
        this.swapFee = swapFee;

        this.tokens = tokens.sort((a, b) => a.index - b.index);
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
        const { tIn, tOut } = this.getPoolTokens(tokenIn, tokenOut);

        if (swapAmount.amount > tIn.amount) {
            throw new Error('Swap amount exceeds the pool limit');
        }

        const amountInWithFee = this.subtractSwapFeeAmount(swapAmount);
        const balances = this.tokens.map((t) => t.scale18);

        const invariant = _calculateInvariant(this.amp, [...balances], true);

        const tokenOutScale18 = _calcOutGivenIn(
            this.amp,
            [...balances],
            tIn.index,
            tOut.index,
            amountInWithFee.scale18,
            invariant,
        );

        const amountOut = TokenAmount.fromScale18Amount(tokenOut, tokenOutScale18);

        if (amountOut.amount < 0n) throw new Error('Swap output negative');

        if (mutateBalances) {
            tIn.increase(swapAmount.amount);
            tOut.decrease(amountOut.amount);
        }

        return amountOut;
    }

    public swapGivenOut(
        tokenIn: Token,
        tokenOut: Token,
        swapAmount: TokenAmount,
        mutateBalances?: boolean,
    ): TokenAmount {
        const { tIn, tOut } = this.getPoolTokens(tokenIn, tokenOut);

        if (swapAmount.amount > tOut.amount) {
            throw new Error('Swap amount exceeds the pool limit');
        }

        const balances = this.tokens.map((t) => t.scale18);

        const invariant = _calculateInvariant(this.amp, balances, true);

        const tokenInScale18 = _calcInGivenOut(
            this.amp,
            [...balances],
            tIn.index,
            tOut.index,
            swapAmount.scale18,
            invariant,
        );

        const amountIn = TokenAmount.fromScale18Amount(tokenIn, tokenInScale18, true);
        const amountInWithFee = this.addSwapFeeAmount(amountIn);

        if (amountInWithFee.amount < 0n) throw new Error('Swap output negative');

        if (mutateBalances) {
            tIn.increase(amountInWithFee.amount);
            tOut.decrease(swapAmount.amount);
        }

        return amountInWithFee;
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
            // As an approx - use almost the total balance of token out as we can add any amount of tokenIn and expect some back
            return tIn.amount;
        }
        // Return max amount of tokenOut - approx is almost all balance
        return tOut.amount;
    }

    public getPoolTokens(tokenIn: Token, tokenOut: Token): { tIn: BasePoolToken; tOut: BasePoolToken } {
        const tIn = this.tokenMap.get(tokenIn.wrapped);
        const tOut = this.tokenMap.get(tokenOut.wrapped);

        if (!tIn || !tOut) {
            throw new Error('Pool does not contain the tokens provided');
        }

        return { tIn, tOut };
    }
}
