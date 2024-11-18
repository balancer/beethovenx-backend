import { Address, Hex, parseEther } from 'viem';
import { PrismaPoolAndHookWithDynamic } from '../../../../../../prisma/prisma-types';
import { Chain } from '@prisma/client';
import { _calcInGivenOut, _calcOutGivenIn, _calculateInvariant, _findVirtualParams } from './gyro2Math';
import { MathSol, WAD } from '../../utils/math';
import { SWAP_LIMIT_FACTOR } from '../../utils/gyroHelpers/math';
import { PoolType, SwapKind, Token, TokenAmount, BigintIsh } from '@balancer/sdk';
import { chainToIdMap } from '../../../../../network/network-config';
import { GyroData } from '../../../../../pool/subgraph-mapper';
import { TokenPairData } from '../../../../../pool/lib/pool-on-chain-tokenpair-data';
import { BasePool } from '../basePool';
import { BasePoolToken } from '../basePoolToken';

export class Gyro2PoolToken extends BasePoolToken {
    public readonly rate: bigint;

    public constructor(token: Token, amount: BigintIsh, index: number, rate: BigintIsh) {
        super(token, amount, index);
        this.rate = BigInt(rate);
    }
}

export class Gyro2Pool implements BasePool {
    public readonly chain: Chain;
    public readonly id: Hex;
    public readonly address: string;
    public readonly poolType: PoolType = PoolType.Gyro2;
    public readonly poolTypeVersion: number;
    public readonly swapFee: bigint;
    public readonly tokens: Gyro2PoolToken[];
    public readonly tokenPairs: TokenPairData[];

    private readonly sqrtAlpha: bigint;
    private readonly sqrtBeta: bigint;
    private readonly tokenMap: Map<string, Gyro2PoolToken>;

    static fromPrismaPool(pool: PrismaPoolAndHookWithDynamic): Gyro2Pool {
        const poolTokens: Gyro2PoolToken[] = [];

        if (!pool.dynamicData || !pool.typeData) {
            throw new Error('No dynamic data for pool');
        }

        for (const poolToken of pool.tokens) {
            if (!poolToken.dynamicData) {
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

            poolTokens.push(
                new Gyro2PoolToken(
                    token,
                    tokenAmount.amount,
                    poolToken.index,
                    parseEther(poolToken.dynamicData.priceRate),
                ),
            );
        }

        const gyroData = pool.typeData as GyroData;

        return new Gyro2Pool(
            pool.id as Hex,
            pool.address,
            pool.chain,
            pool.version,
            parseEther(pool.dynamicData.swapFee),
            parseEther(gyroData.sqrtAlpha!),
            parseEther(gyroData.sqrtBeta!),
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
        sqrtAlpha: bigint,
        sqrtBeta: bigint,
        tokens: Gyro2PoolToken[],
        tokenPairs: TokenPairData[],
    ) {
        this.id = id;
        this.address = address;
        this.chain = chain;
        this.poolTypeVersion = poolTypeVersion;
        this.swapFee = swapFee;
        this.sqrtAlpha = sqrtAlpha;
        this.sqrtBeta = sqrtBeta;
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
        // The Gyro2CLPPool contract has the following onSwap execution order.
        // See details here https://vscode.blockscan.com/arbitrum-one/0x14abd18d1fa335e9f630a658a2799b33208763fa
        // Or a sim here https://dashboard.tenderly.co/mcquardt/project/simulator/f74b23ae-fcb5-459e-b4cf-f21055298a8c?trace=0.0.0.0.2.2.1.5.7.2
        // 1. onSwap
        // 2. swap Type decision
        // 3. upscale balances reported by the Vault
        // 5. calculate invariant & virtual paramIn & virtualParamOut
        // 6. substract swap fee from swapAmount
        // 7. do _calcOutGivenIn
        // 8. final amountOut get downscaled by rate

        // These tIn, tOut are vault reported balances (scaled to 18 decimals)
        const { tIn, tOut, sqrtAlpha, sqrtBeta } = this.getPoolPairData(tokenIn, tokenOut);
        const invariant = _calculateInvariant(
            [MathSol.mulUpFixed(tIn.scale18, tIn.rate), MathSol.mulUpFixed(tOut.scale18, tOut.rate)],
            sqrtAlpha,
            sqrtBeta,
        );
        const [virtualParamIn, virtualParamOut] = _findVirtualParams(invariant, sqrtAlpha, sqrtBeta);
        const inAmountLessFee = this.subtractSwapFeeAmount(swapAmount);

        const outAmountScale18 = _calcOutGivenIn(
            MathSol.mulUpFixed(tIn.scale18, tIn.rate),
            MathSol.mulUpFixed(tOut.scale18, tOut.rate),
            inAmountLessFee.scale18,
            virtualParamIn,
            virtualParamOut,
        );

        if (outAmountScale18 > tOut.scale18) throw new Error('ASSET_BOUNDS_EXCEEDED');

        // Gyro2CLPPool does not downscale in the Pool contract, but the Vault downscales.
        const outAmount = TokenAmount.fromScale18Amount(tokenOut, outAmountScale18).divDownFixed(tOut.rate);

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
        // The Gyro2CLPPool contract has the following onSwap execution order.
        // See details here https://vscode.blockscan.com/arbitrum-one/0x14abd18d1fa335e9f630a658a2799b33208763fa
        // Or a sim here https://dashboard.tenderly.co/mkflow27/balancer/simulator/0322ee9f-89af-4cf4-9b2b-7a414c13ad9d
        // 1. onSwap
        // 2. swap Type decision
        // 3. upscale balances reported by the Vault
        // 5. calculate invariant & virtual paramIn & virtualParamOut
        // 6. upscale swapAmount
        // 7. do _calcInGivenOut
        // 8. downscale amountIn
        // 9. calculate swap fee amountIn.divUp(getSwapFeePercentage().complement());

        const { tIn, tOut, sqrtAlpha, sqrtBeta } = this.getPoolPairData(tokenIn, tokenOut);

        if (swapAmount.scale18 > tOut.scale18) throw new Error('ASSET_BOUNDS_EXCEEDED');

        const invariant = _calculateInvariant(
            [MathSol.mulUpFixed(tIn.scale18, tIn.rate), MathSol.mulUpFixed(tOut.scale18, tOut.rate)],
            sqrtAlpha,
            sqrtBeta,
        );
        const [virtualParamIn, virtualParamOut] = _findVirtualParams(invariant, sqrtAlpha, sqrtBeta);
        const inAmountLessFee = _calcInGivenOut(
            MathSol.mulUpFixed(tIn.scale18, tIn.rate),
            MathSol.mulUpFixed(tOut.scale18, tOut.rate),
            MathSol.mulUpFixed(swapAmount.scale18, tOut.rate), //amountOut
            virtualParamIn,
            virtualParamOut,
        );

        const inAmountLessSwapFeeRateUndone = MathSol.divDownFixed(inAmountLessFee, tIn.rate);
        const inAmount = this.addSwapFeeAmount(TokenAmount.fromScale18Amount(tokenIn, inAmountLessSwapFeeRateUndone));

        if (mutateBalances) {
            tIn.decrease(inAmount.amount);
            tOut.increase(swapAmount.amount);
        }

        return inAmount;
    }

    public getLimitAmountSwap(tokenIn: Token, tokenOut: Token, swapKind: SwapKind): bigint {
        const { tIn, tOut, sqrtAlpha, sqrtBeta } = this.getPoolPairData(tokenIn, tokenOut);
        if (swapKind === SwapKind.GivenIn) {
            const invariant = _calculateInvariant([tIn.scale18, tOut.scale18], sqrtAlpha, sqrtBeta);
            const maxAmountInAssetInPool = MathSol.mulUpFixed(
                invariant,
                MathSol.divDownFixed(WAD, sqrtAlpha) - MathSol.divDownFixed(WAD, sqrtBeta),
            ); // x+ = L * (1/sqrtAlpha - 1/sqrtBeta)
            const limitAmountIn = maxAmountInAssetInPool - tIn.scale18;
            const limitAmountInPlusSwapFee = MathSol.divDownFixed(limitAmountIn, WAD - this.swapFee);
            return MathSol.mulDownFixed(limitAmountInPlusSwapFee, SWAP_LIMIT_FACTOR);
        }
        return MathSol.mulDownFixed(tOut.amount, SWAP_LIMIT_FACTOR);
    }

    public subtractSwapFeeAmount(amount: TokenAmount): TokenAmount {
        const feeAmount = amount.mulUpFixed(this.swapFee);
        return amount.sub(feeAmount);
    }

    public addSwapFeeAmount(amount: TokenAmount): TokenAmount {
        return amount.divUpFixed(MathSol.complementFixed(this.swapFee));
    }

    public getPoolTokens(tokenIn: Token, tokenOut: Token): { tIn: Gyro2PoolToken; tOut: Gyro2PoolToken } {
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
        tIn: Gyro2PoolToken;
        tOut: Gyro2PoolToken;
        sqrtAlpha: bigint;
        sqrtBeta: bigint;
    } {
        const { tIn, tOut } = this.getPoolTokens(tokenIn, tokenOut);

        const sqrtAlpha = tIn.index === 0 ? this.sqrtAlpha : MathSol.divDownFixed(WAD, this.sqrtBeta);
        const sqrtBeta = tIn.index === 0 ? this.sqrtBeta : MathSol.divDownFixed(WAD, this.sqrtAlpha);

        return { tIn, tOut, sqrtAlpha, sqrtBeta };
    }
}
