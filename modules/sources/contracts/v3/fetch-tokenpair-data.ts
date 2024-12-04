import { MathSol, WAD, ZERO_ADDRESS } from '@balancer/sdk';
import { parseEther, parseUnits } from 'viem';
import { ViemClient } from '../../types';
import { ViemMulticallCall, multicallViem } from '../../../web3/multicaller-viem';
import BalancerRouterAbi from '../abis/BalancerRouter';

interface PoolInput {
    id: string;
    address: string;
    protocolVersion: number;
    tokens: {
        address: string;
        index: number;
        balance: string;
        balanceUSD: number;
        token: {
            decimals: number;
        };
    }[];
    dynamicData: {
        totalLiquidity: number;
        totalShares: string;
    } | null;
}

interface PoolTokenPairsOutput {
    [poolId: string]: {
        tokenPairs: TokenPairData[];
    };
}

export type TokenPairData = {
    tokenA: string;
    tokenB: string;
    normalizedLiquidity: string;
    spotPrice: string;
};

interface TokenPair {
    poolId: string;
    poolTvl: number;
    poolTokensLength: number;
    valid: boolean;
    tokenA: Token;
    tokenB: Token;
    normalizedLiqudity: bigint;
    spotPrice: bigint;
    aToBAmountIn: bigint;
    aToBAmountOut: bigint;
    bToAAmountOut: bigint;
    effectivePrice: bigint;
    effectivePriceAmountIn: bigint;
    protocolVersion: number;
}

interface Token {
    address: string;
    decimals: number;
    balance: string;
    balanceUsd: number;
    index: number;
}

interface OnchainData {
    effectivePriceAmountOut: bigint;
    aToBAmountOut: bigint;
    bToAAmountOut: bigint;
}

export async function fetchTokenPairData(
    routerAddress: string,
    pools: PoolInput[],
    client: ViemClient,
): Promise<PoolTokenPairsOutput> {
    if (pools.length === 0) {
        return {};
    }

    const tokenPairOutput: PoolTokenPairsOutput = {};

    let multicallerRouter: ViemMulticallCall[] = [];
    // only inlcude pools with TVL >=$1000
    // for each pool, get pairs
    // for each pair per pool, create multicall to do a swap with $100 (min liq is $1k, so there should be at least $100 for each token) for effectivePrice calc and a swap with 1% TVL
    //     then create multicall to do the second swap for each pair using the result of the first 1% swap as input, to calculate the spot price
    // https://github.com/balancer/b-sdk/pull/204/files#diff-52e6d86a27aec03f59dd3daee140b625fd99bd9199936bbccc50ee550d0b0806

    let tokenPairs = generateTokenPairs(pools);

    tokenPairs.forEach((tokenPair) => {
        if (tokenPair.valid) {
            // prepare swap amounts in
            // tokenA->tokenB with 1% of tokenA balance
            tokenPair.aToBAmountIn = parseUnits(tokenPair.tokenA.balance, tokenPair.tokenA.decimals) / 100n;
            // tokenA->tokenB with 100USD worth of tokenA
            const oneHundredUsdOfTokenA = (parseFloat(tokenPair.tokenA.balance) / tokenPair.tokenA.balanceUsd) * 100;
            tokenPair.effectivePriceAmountIn = parseUnits(`${oneHundredUsdOfTokenA}`, tokenPair.tokenA.decimals);

            addEffectivePriceCallsToMulticaller(tokenPair, routerAddress, multicallerRouter);
            addAToBPriceCallsToMulticaller(tokenPair, routerAddress, multicallerRouter);
        }
    });

    const resultOne = (await multicallViem(client, multicallerRouter)) as {
        [id: string]: OnchainData;
    };

    tokenPairs.forEach((tokenPair) => {
        if (tokenPair.valid) {
            getEffectivePriceFromResult(tokenPair, resultOne);
            getAToBAmountOutFromResult(tokenPair, resultOne);
        }
    });

    multicallerRouter = [];
    tokenPairs.forEach((tokenPair) => {
        if (tokenPair.valid) {
            addBToAPriceCallsToMulticaller(tokenPair, routerAddress, multicallerRouter);
        }
    });

    const resultTwo = (await multicallViem(client, multicallerRouter)) as {
        [id: string]: OnchainData;
    };

    tokenPairs.forEach((tokenPair) => {
        if (tokenPair.valid) {
            getBToAAmountFromResult(tokenPair, resultTwo);
            calculateSpotPrice(tokenPair);
            calculateNormalizedLiquidity(tokenPair);
        }

        // prepare output
        pools.forEach((pool) => {
            if (pool.id === tokenPair.poolId) {
                if (!tokenPairOutput[pool.id]) {
                    tokenPairOutput[pool.id] = {
                        tokenPairs: [],
                    };
                }
                tokenPairOutput[pool.id].tokenPairs.push({
                    tokenA: tokenPair.tokenA.address,
                    tokenB: tokenPair.tokenB.address,
                    normalizedLiquidity: tokenPair.normalizedLiqudity.toString(),
                    spotPrice: tokenPair.spotPrice.toString(),
                });
            }
        });
    });

    return tokenPairOutput;
}

// V3 pools
function generateTokenPairs(filteredPools: PoolInput[]): TokenPair[] {
    const tokenPairs: TokenPair[] = [];

    for (const pool of filteredPools) {
        const poolTokens = pool.tokens.map((token) => ({
            address: token.address,
            decimals: token.token.decimals,
            balance: token.balance || '0',
            balanceUsd: token.balanceUSD || 0,
            index: token.index,
        }));
        const poolTvl = pool.dynamicData?.totalLiquidity || 0;
        // remove pools that have <$1000 TVL or a token without a balance or USD balance
        const valid =
            poolTvl >= 1000 &&
            poolTokens.every((token) => token.balance !== '0') &&
            poolTokens.every((token) => token.balanceUsd !== 0);

        const tokenPairData = {
            poolId: pool.id,
            poolTvl,
            poolTokensLength: poolTokens.length,
            valid,
            normalizedLiqudity: 0n,
            spotPrice: 0n,
            aToBAmountIn: 0n,
            aToBAmountOut: 0n,
            bToAAmountOut: 0n,
            effectivePrice: 0n,
            effectivePriceAmountIn: 0n,
            protocolVersion: pool.protocolVersion,
        };
        // create pairs between all pool tokens
        for (let i = 0; i < poolTokens.length - 1; i++) {
            for (let j = i + 1; j < poolTokens.length; j++) {
                tokenPairs.push({
                    ...tokenPairData,
                    tokenA: poolTokens[i],
                    tokenB: poolTokens[j],
                });
            }
        }
        // create pairs between pool tokens and BPT
        const bpt = {
            address: pool.address,
            decimals: 18,
            balance: pool.dynamicData?.totalShares || '0',
            balanceUsd: poolTvl,
            index: -1,
        };
        for (const tokenB of poolTokens) {
            tokenPairs.push({
                ...tokenPairData,
                tokenA: bpt,
                tokenB,
            });
        }
    }
    return tokenPairs;
}

// call remove/swap from tokenA->tokenB with 100USD worth of tokenA
function addEffectivePriceCallsToMulticaller(
    tokenPair: TokenPair,
    balancerRouterAddress: string,
    multicaller: ViemMulticallCall[],
) {
    if (isBptTokenPair(tokenPair)) {
        multicaller.push({
            path: `${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}.effectivePriceAmountOut`,
            address: balancerRouterAddress as `0x${string}`,
            functionName: 'queryRemoveLiquiditySingleTokenExactIn',
            abi: BalancerRouterAbi,
            args: [tokenPair.poolId, tokenPair.effectivePriceAmountIn, tokenPair.tokenB.address, ZERO_ADDRESS],
        });
    } else {
        multicaller.push({
            path: `${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}.effectivePriceAmountOut`,
            address: balancerRouterAddress as `0x${string}`,
            functionName: 'querySwapSingleTokenExactIn',
            abi: BalancerRouterAbi,
            args: [
                tokenPair.poolId,
                tokenPair.tokenA.address,
                tokenPair.tokenB.address,
                tokenPair.effectivePriceAmountIn,
                ZERO_ADDRESS,
            ],
        });
    }
}

// call remove/swap from tokenA->tokenB with 1% of tokenA balance
function addAToBPriceCallsToMulticaller(
    tokenPair: TokenPair,
    balancerRouterAddress: string,
    multicaller: ViemMulticallCall[],
) {
    if (isBptTokenPair(tokenPair)) {
        multicaller.push({
            path: `${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}.aToBAmountOut`,
            address: balancerRouterAddress as `0x${string}`,
            functionName: 'queryRemoveLiquiditySingleTokenExactIn',
            abi: BalancerRouterAbi,
            args: [tokenPair.poolId, tokenPair.aToBAmountIn, tokenPair.tokenB.address, ZERO_ADDRESS],
        });
    } else {
        multicaller.push({
            path: `${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}.aToBAmountOut`,
            address: balancerRouterAddress as `0x${string}`,
            functionName: 'querySwapSingleTokenExactIn',
            abi: BalancerRouterAbi,
            args: [
                tokenPair.poolId,
                tokenPair.tokenA.address,
                tokenPair.tokenB.address,
                tokenPair.aToBAmountIn,
                ZERO_ADDRESS,
            ],
        });
    }
}

// call add/swap from tokenB->tokenA with result of tokenA->tokenB remove/swap with 1% tokenA balance
function addBToAPriceCallsToMulticaller(
    tokenPair: TokenPair,
    balancerRouterAddress: string,
    multicaller: ViemMulticallCall[],
) {
    if (isBptTokenPair(tokenPair)) {
        let amountsIn = Array(tokenPair.poolTokensLength).fill(0n);
        amountsIn[tokenPair.tokenB.index] = tokenPair.aToBAmountOut;
        multicaller.push({
            path: `${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}.bToAAmountOut`,
            address: balancerRouterAddress as `0x${string}`,
            functionName: 'queryAddLiquidityUnbalanced',
            abi: BalancerRouterAbi,
            args: [tokenPair.poolId, amountsIn, ZERO_ADDRESS],
        });
    } else {
        multicaller.push({
            path: `${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}.bToAAmountOut`,
            address: balancerRouterAddress as `0x${string}`,
            functionName: 'querySwapSingleTokenExactIn',
            abi: BalancerRouterAbi,
            args: [
                tokenPair.poolId,
                tokenPair.tokenB.address,
                tokenPair.tokenA.address,
                `${tokenPair.aToBAmountOut}`,
                ZERO_ADDRESS,
            ],
        });
    }
}

function getEffectivePriceFromResult(tokenPair: TokenPair, onchainResults: { [id: string]: OnchainData }) {
    const result = onchainResults[`${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}`];

    if (result?.effectivePriceAmountOut && result.effectivePriceAmountOut > 0) {
        // MathSol expects all values with 18 decimals, need to scale them
        tokenPair.effectivePrice = MathSol.divDownFixed(
            parseUnits(tokenPair.effectivePriceAmountIn.toString(), 18 - tokenPair.tokenA.decimals),
            parseUnits(result.effectivePriceAmountOut.toString(), 18 - tokenPair.tokenB.decimals),
        );
    }
}

function getAToBAmountOutFromResult(tokenPair: TokenPair, onchainResults: { [id: string]: OnchainData }) {
    const result = onchainResults[`${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}`];

    if (result?.aToBAmountOut) {
        tokenPair.aToBAmountOut = BigInt(result.aToBAmountOut.toString());
    }
}

function getBToAAmountFromResult(tokenPair: TokenPair, onchainResults: { [id: string]: OnchainData }) {
    const result = onchainResults[`${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}`];

    if (result && result.bToAAmountOut) {
        tokenPair.bToAAmountOut = BigInt(result.bToAAmountOut.toString());
    }
}
function calculateSpotPrice(tokenPair: TokenPair) {
    // MathSol expects all values with 18 decimals, need to scale them
    const aToBAmountInScaled = parseUnits(tokenPair.aToBAmountIn.toString(), 18 - tokenPair.tokenA.decimals);
    const aToBAmountOutScaled = parseUnits(tokenPair.aToBAmountOut.toString(), 18 - tokenPair.tokenB.decimals);
    const bToAAmountOutScaled = parseUnits(tokenPair.bToAAmountOut.toString(), 18 - tokenPair.tokenA.decimals);
    if (aToBAmountInScaled !== 0n && aToBAmountOutScaled !== 0n && bToAAmountOutScaled !== 0n) {
        const priceAtoB = MathSol.divDownFixed(aToBAmountInScaled, aToBAmountOutScaled);
        const priceBtoA = MathSol.divDownFixed(aToBAmountOutScaled, bToAAmountOutScaled);
        tokenPair.spotPrice = MathSol.powDownFixed(MathSol.divDownFixed(priceAtoB, priceBtoA), WAD / 2n);
    } else {
        // this happens if any of the swaps reverted on-chain. Either the tokenBalance in the pool was <100 USD or RPC failed.
        tokenPair.spotPrice = 0n;
    }
}

function calculateNormalizedLiquidity(tokenPair: TokenPair) {
    // spotPrice and effective price are already scaled to 18 decimals by the MathSol output
    let priceRatio = MathSol.divDownFixed(tokenPair.spotPrice, tokenPair.effectivePrice);
    // if priceRatio is = 1, normalizedLiquidity becomes infinity, if it is >1, normalized liqudity becomes negative. Need to cap it.
    // this happens if you get a "bonus" ie positive price impact.
    if (priceRatio > parseEther('0.999999')) {
        console.log(
            `Price ratio was > 0.999999 for token pair ${tokenPair.tokenA.address}/${tokenPair.tokenB.address} in pool ${tokenPair.poolId}.`,
        );
        priceRatio = parseEther('0.999999');
    }
    if (priceRatio !== 0n) {
        const priceImpact = WAD - priceRatio;
        tokenPair.normalizedLiqudity = MathSol.divDownFixed(WAD, priceImpact);
    } else {
        // can happen if the pair could not be priced on-chain and everything is 0 (aToBAmount, effectivePrice, etc) and hence the spotPrice is 0.
        // if that happens, normalizedLiquidity should be 0 as well.
        tokenPair.normalizedLiqudity = 0n;
    }
}

function isBptTokenPair(tokenPair: TokenPair): boolean {
    return tokenPair.tokenA.address === tokenPair.poolId;
}
