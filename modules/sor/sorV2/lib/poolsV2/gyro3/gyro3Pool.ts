import { Address, Hex, parseEther } from 'viem';
import { PrismaPoolAndHookWithDynamic } from '../../../../../../prisma/prisma-types';
import { Chain } from '@prisma/client';
import { MathSol, WAD } from '../../utils/math';
import { MathGyro, SWAP_LIMIT_FACTOR } from '../../utils/gyroHelpers/math';
import { _calcInGivenOut, _calcOutGivenIn, _calculateInvariant } from './gyro3Math';
import { PoolType, SwapKind, Token, TokenAmount } from '@balancer/sdk';
import { chainToIdMap } from '../../../../../network/network-config';
import { GyroData } from '../../../../../pool/subgraph-mapper';
import { TokenPairData } from '../../../../../pool/lib/pool-on-chain-tokenpair-data';
import { BasePool } from '../basePool';
import { BasePoolToken } from '../basePoolToken';

export class Gyro3Pool implements BasePool {
    public readonly chain: Chain;
    public readonly id: Hex;
    public readonly address: string;
    public readonly poolType: PoolType = PoolType.Gyro3;
    public readonly poolTypeVersion: number;
    public readonly swapFee: bigint;
    public readonly tokens: BasePoolToken[];
    public readonly tokenPairs: TokenPairData[];

    private readonly root3Alpha: bigint;
    private readonly tokenMap: Map<string, BasePoolToken>;

    static fromPrismaPool(pool: PrismaPoolAndHookWithDynamic): Gyro3Pool {
        const poolTokens: BasePoolToken[] = [];

        if (!pool.dynamicData || !pool.typeData) {
            throw new Error('No dynamic data for pool');
        }

        for (const poolToken of pool.tokens) {
            if (!poolToken.dynamicData?.balance) {
                throw new Error('Gyro pool as no dynamic pool token data');
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

            poolTokens.push(new BasePoolToken(token, tokenAmount.amount, poolToken.index));
        }

        return new Gyro3Pool(
            pool.id as Hex,
            pool.address,
            pool.chain,
            pool.version,
            parseEther(pool.dynamicData.swapFee),
            parseEther((pool.typeData as GyroData).root3Alpha!),
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
        root3Alpha: bigint,
        tokens: BasePoolToken[],
        tokenPairs: TokenPairData[],
    ) {
        this.id = id;
        this.address = address;
        this.chain = chain;
        this.poolTypeVersion = poolTypeVersion;
        this.swapFee = swapFee;
        this.root3Alpha = root3Alpha;
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
        const { tIn, tOut, tertiary } = this.getPoolPairData(tokenIn, tokenOut);
        const invariant = _calculateInvariant([tIn.scale18, tOut.scale18, tertiary.scale18], this.root3Alpha);
        const virtualOffsetInOut = MathGyro.mulDown(invariant, this.root3Alpha);
        const inAmountLessFee = this.subtractSwapFeeAmount(swapAmount);

        const outAmountScale18 = _calcOutGivenIn(
            tIn.scale18,
            tOut.scale18,
            inAmountLessFee.scale18,
            virtualOffsetInOut,
        );

        if (outAmountScale18 > tOut.scale18) throw new Error('ASSET_BOUNDS_EXCEEDED');

        const outAmount = TokenAmount.fromScale18Amount(tokenOut, outAmountScale18);

        if (mutateBalances) {
            tIn.increase(swapAmount.amount);
            tOut.decrease(outAmount.amount);
        }

        return outAmount;
    }

    public swapGivenOut(
        tokenIn: Token,
        tokenOut: Token,
        swapAmount: TokenAmount,
        mutateBalances?: boolean,
    ): TokenAmount {
        const { tIn, tOut, tertiary } = this.getPoolPairData(tokenIn, tokenOut);

        if (swapAmount.scale18 > tOut.scale18) throw new Error('ASSET_BOUNDS_EXCEEDED');

        const invariant = _calculateInvariant([tIn.scale18, tOut.scale18, tertiary.scale18], this.root3Alpha);

        const virtualOffsetInOut = MathGyro.mulDown(invariant, this.root3Alpha);

        const inAmountLessFee = _calcInGivenOut(tIn.scale18, tOut.scale18, swapAmount.scale18, virtualOffsetInOut);
        const inAmount = this.addSwapFeeAmount(TokenAmount.fromScale18Amount(tokenIn, inAmountLessFee, true));

        if (mutateBalances) {
            tIn.decrease(inAmount.amount);
            tOut.increase(swapAmount.amount);
        }

        return inAmount;
    }

    public getLimitAmountSwap(tokenIn: Token, tokenOut: Token, swapKind: SwapKind): bigint {
        const { tIn, tOut, tertiary } = this.getPoolPairData(tokenIn, tokenOut);
        if (swapKind === SwapKind.GivenIn) {
            const invariant = _calculateInvariant([tIn.scale18, tOut.scale18, tertiary.scale18], this.root3Alpha);
            const a = MathGyro.mulDown(invariant, this.root3Alpha);
            const maxAmountInAssetInPool = MathGyro.divDown(MathGyro.mulDown(tIn.scale18 + a, tOut.scale18 + a), a) - a; // (x + a)(y + a) / a - a
            const limitAmountIn = maxAmountInAssetInPool - tIn.scale18;
            const limitAmountInPlusSwapFee = MathGyro.divDown(limitAmountIn, WAD - this.swapFee);
            const limit = TokenAmount.fromScale18Amount(tIn.token, limitAmountInPlusSwapFee);
            return MathGyro.mulDown(limit.amount, SWAP_LIMIT_FACTOR);
        }
        return MathGyro.mulDown(tOut.amount, SWAP_LIMIT_FACTOR);
    }

    public subtractSwapFeeAmount(amount: TokenAmount): TokenAmount {
        const feeAmount = amount.mulUpFixed(this.swapFee);
        return amount.sub(feeAmount);
    }

    public addSwapFeeAmount(amount: TokenAmount): TokenAmount {
        return amount.divUpFixed(MathSol.complementFixed(this.swapFee));
    }

    public getPoolTokens(tokenIn: Token, tokenOut: Token): { tIn: BasePoolToken; tOut: BasePoolToken } {
        const tIn = this.tokenMap.get(tokenIn.wrapped);
        const tOut = this.tokenMap.get(tokenOut.wrapped);

        if (!tIn || !tOut) {
            throw new Error('Pool does not contain the tokens provided');
        }

        return { tIn, tOut };
    }

    public getPoolPairData(
        tokenIn: Token,
        tokenOut: Token,
    ): {
        tIn: BasePoolToken;
        tOut: BasePoolToken;
        tertiary: BasePoolToken;
    } {
        const { tIn, tOut } = this.getPoolTokens(tokenIn, tokenOut);

        const tertiaryAddress = this.tokens
            .map((t) => t.token.wrapped)
            .find((a) => a !== tokenIn.wrapped && a !== tokenOut.wrapped);
        const tertiary = this.tokenMap.get(tertiaryAddress as string);

        if (!tertiary) {
            throw new Error('Pool does not contain tertiary token');
        }

        return { tIn, tOut, tertiary };
    }
}
