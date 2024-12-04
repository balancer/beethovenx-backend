import { Multicaller3Viem, IMulticaller } from '../../web3/multicaller-viem';
import BalancerQueries from '../abi/BalancerQueries.json';
import { MathSol, WAD, ZERO_ADDRESS } from '@balancer/sdk';
import { parseEther, parseUnits } from 'viem';
import { Chain } from '@prisma/client';

interface PoolInput {
    id: string;
    chain: Chain;
    address: string;
    tokens: {
        address: string;
        balance: string;
        balanceUSD: number;
        token: {
            decimals: number;
        };
    }[];
    dynamicData: {
        totalShares: string;
        totalLiquidity: number;
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
}

interface Token {
    address: string;
    decimals: number;
    balance: string;
    balanceUsd: number;
}

interface OnchainData {
    effectivePriceAmountOut: bigint;
    aToBAmountOut: bigint;
    bToAAmountOut: bigint;
}

export async function fetchTokenPairData(pools: PoolInput[], balancerQueriesAddress: string, batchSize = 1024) {
    if (pools.length === 0) {
        return {};
    }

    const tokenPairOutput: PoolTokenPairsOutput = {};

    const multicaller = new Multicaller3Viem(pools[0].chain, BalancerQueries, batchSize);

    // only inlcude pools with TVL >=$1000
    // for each pool, get pairs
    // for each pair per pool, create multicall to do a swap with $100 (min liq is $1000, so there should be at least $100 for each token) for effectivePrice calc and a swap with 1% TVL
    //     then create multicall to do the second swap for each pair using the result of the first 1% swap as input, to calculate the spot price
    // https://github.com/balancer/b-sdk/pull/204/files#diff-52e6d86a27aec03f59dd3daee140b625fd99bd9199936bbccc50ee550d0b0806

    const tokenPairs = generateTokenPairs(pools);

    tokenPairs.forEach((tokenPair) => {
        if (tokenPair.valid) {
            // prepare swap amounts in
            // tokenA->tokenB with 1% of tokenA balance
            tokenPair.aToBAmountIn = parseUnits(tokenPair.tokenA.balance, tokenPair.tokenA.decimals) / 100n;
            // tokenA->tokenB with 100USD worth of tokenA
            const oneHundred = (parseFloat(tokenPair.tokenA.balance) / tokenPair.tokenA.balanceUsd) * 100;
            let oneHundredStr = oneHundred.toFixed(20);
            if (oneHundredStr.includes('e+')) {
                oneHundredStr = oneHundred.toLocaleString('fullwide', { useGrouping: false });
            }
            tokenPair.effectivePriceAmountIn = parseUnits(`${oneHundredStr}`, tokenPair.tokenA.decimals);

            addEffectivePriceCallsToMulticaller(tokenPair, balancerQueriesAddress, multicaller);
            addAToBPriceCallsToMulticaller(tokenPair, balancerQueriesAddress, multicaller);
        }
    });

    const resultOne = (await multicaller.execute()) as {
        [id: string]: OnchainData;
    };

    tokenPairs.forEach((tokenPair) => {
        if (tokenPair.valid) {
            getAmountOutAndEffectivePriceFromResult(tokenPair, resultOne);
        }
    });

    tokenPairs.forEach((tokenPair) => {
        if (tokenPair.valid) {
            addBToAPriceCallsToMulticaller(tokenPair, balancerQueriesAddress, multicaller);
        }
    });

    const resultTwo = (await multicaller.execute()) as {
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

function generateTokenPairs(filteredPools: PoolInput[]): TokenPair[] {
    const tokenPairs: TokenPair[] = [];

    for (const pool of filteredPools) {
        // create all pairs for pool
        for (let i = 0; i < pool.tokens.length; i++) {
            for (let j = 0; j < pool.tokens.length; j++) {
                const tokenA = pool.tokens[i];
                const tokenB = pool.tokens[j];
                if (tokenA.address === tokenB.address) continue;
                // V2 Validation
                // remove pools that have <$1000 TVL or a token without a balance or USD balance
                // TODO: check if it's trully needed or if we're ok removing only the pairs without balance or balanceUSD
                const valid =
                    (pool.dynamicData?.totalLiquidity || 0) >= 1000 &&
                    !pool.tokens.some((token) => {
                        const balance = token.address === pool.address ? pool.dynamicData?.totalShares : token.balance;
                        return (balance || '0') === '0';
                    }) &&
                    !pool.tokens.some((token) => {
                        const balanceUSD =
                            token.address === pool.address ? pool.dynamicData?.totalLiquidity : token.balanceUSD;
                        return (balanceUSD || 0) === 0;
                    });

                tokenPairs.push({
                    poolId: pool.id,
                    poolTvl: pool.dynamicData?.totalLiquidity || 0,
                    valid,
                    tokenA: {
                        address: tokenA.address,
                        decimals: tokenA.token.decimals,
                        balance:
                            tokenA.address === pool.address
                                ? pool.dynamicData?.totalShares || '0'
                                : tokenA.balance || '0',
                        balanceUsd:
                            tokenA.address === pool.address
                                ? pool.dynamicData?.totalLiquidity || 0
                                : tokenA.balanceUSD || 0,
                    },
                    tokenB: {
                        address: tokenB.address,
                        decimals: tokenB.token.decimals,
                        balance:
                            tokenB.address === pool.address
                                ? pool.dynamicData?.totalShares || '0'
                                : tokenB.balance || '0',
                        balanceUsd:
                            tokenB.address === pool.address
                                ? pool.dynamicData?.totalLiquidity || 0
                                : tokenB.balanceUSD || 0,
                    },
                    normalizedLiqudity: 0n,
                    spotPrice: 0n,
                    aToBAmountIn: 0n,
                    aToBAmountOut: 0n,
                    bToAAmountOut: 0n,
                    effectivePrice: 0n,
                    effectivePriceAmountIn: 0n,
                });
            }
        }
    }
    return tokenPairs;
}

// call querySwap from tokenA->tokenB with 100USD worth of tokenA
function addEffectivePriceCallsToMulticaller(
    tokenPair: TokenPair,
    balancerQueriesAddress: string,
    multicaller: IMulticaller,
) {
    multicaller.call(
        `${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}.effectivePriceAmountOut`,
        balancerQueriesAddress,
        'querySwap',
        [
            [
                tokenPair.poolId,
                0,
                tokenPair.tokenA.address,
                tokenPair.tokenB.address,
                `${tokenPair.effectivePriceAmountIn}`,
                ZERO_ADDRESS,
            ],
            [ZERO_ADDRESS, false, ZERO_ADDRESS, false],
        ],
    );
}

// call querySwap from tokenA->tokenB with 1% of tokenA balance
function addAToBPriceCallsToMulticaller(
    tokenPair: TokenPair,
    balancerQueriesAddress: string,
    multicaller: IMulticaller,
) {
    multicaller.call(
        `${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}.aToBAmountOut`,
        balancerQueriesAddress,
        'querySwap',
        [
            [
                tokenPair.poolId,
                0,
                tokenPair.tokenA.address,
                tokenPair.tokenB.address,
                `${tokenPair.aToBAmountIn}`,
                ZERO_ADDRESS,
            ],
            [ZERO_ADDRESS, false, ZERO_ADDRESS, false],
        ],
    );
}

// call querySwap from tokenA->tokenB with AtoB amount out
function addBToAPriceCallsToMulticaller(
    tokenPair: TokenPair,
    balancerQueriesAddress: string,
    multicaller: IMulticaller,
) {
    multicaller.call(
        `${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}.bToAAmountOut`,
        balancerQueriesAddress,
        'querySwap',
        [
            [
                tokenPair.poolId,
                0,
                tokenPair.tokenB.address,
                tokenPair.tokenA.address,
                `${tokenPair.aToBAmountOut}`,
                ZERO_ADDRESS,
            ],
            [ZERO_ADDRESS, false, ZERO_ADDRESS, false],
        ],
    );
}

function getAmountOutAndEffectivePriceFromResult(tokenPair: TokenPair, onchainResults: { [id: string]: OnchainData }) {
    const result = onchainResults[`${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}`];

    if (result?.effectivePriceAmountOut && result.effectivePriceAmountOut > 0n && result.aToBAmountOut) {
        tokenPair.aToBAmountOut = BigInt(result.aToBAmountOut.toString());
        // MathSol expects all values with 18 decimals, need to scale them
        tokenPair.effectivePrice = MathSol.divDownFixed(
            parseUnits(tokenPair.effectivePriceAmountIn.toString(), 18 - tokenPair.tokenA.decimals),
            parseUnits(result.effectivePriceAmountOut.toString(), 18 - tokenPair.tokenB.decimals),
        );
    }
}

function getBToAAmountFromResult(tokenPair: TokenPair, onchainResults: { [id: string]: OnchainData }) {
    const result = onchainResults[`${tokenPair.poolId}-${tokenPair.tokenA.address}-${tokenPair.tokenB.address}`];

    if (result.bToAAmountOut) {
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
    if (priceRatio > parseEther('1')) {
        console.log(
            `Price ratio was ${priceRatio} for token pair ${tokenPair.tokenA.address}/${tokenPair.tokenB.address} in pool ${tokenPair.poolId}. Setting to 0.999999999999 instead.`,
        );
        priceRatio = parseEther('0.999999999999');
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
