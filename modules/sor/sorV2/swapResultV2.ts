import {
    GqlSorSwapType,
    GqlSorGetSwapsResponse,
    GqlSorSwap,
    GqlPoolMinimal,
    GqlSorSwapRoute,
    GqlSorSwapRouteHop,
} from '../../../schema';
import { Chain } from '@prisma/client';
import { SwapResult } from '../types';
import { poolService } from '../../pool/pool.service';
import { BigNumber } from 'ethers';
import { oldBnum } from '../../big-number/old-big-number';
import { AllNetworkConfigsKeyedOnChain } from '../../network/network-config';
import { formatFixed } from '@ethersproject/bignumber';
import { replaceZeroAddressWithEth } from '../../web3/addresses';
import { BatchSwapStep, SingleSwap, SwapKind, TokenAmount, ZERO_ADDRESS } from '@balancer/sdk';
import { SwapLocal } from './lib/swapLocal';
import { calculatePriceImpact } from './lib/utils/helpers';

export class SwapResultV2 implements SwapResult {
    private swap: SwapLocal | null;
    private chain: Chain;
    public inputAmount: bigint = BigInt(0);
    public outputAmount: bigint = BigInt(0);
    public isValid: boolean;

    constructor(swap: SwapLocal | null, chain: Chain) {
        if (swap === null) {
            this.isValid = false;
            this.swap = null;
            this.chain = chain;
        } else {
            this.isValid = true;
            this.swap = swap;
            this.inputAmount = swap.inputAmount.amount;
            this.outputAmount = swap.outputAmount.amount;
            this.chain = chain;
        }
    }

    async getSorSwapResponse(queryFirst = false): Promise<GqlSorGetSwapsResponse> {
        if (!this.isValid || this.swap === null) throw new Error('No Response - Invalid Swap');

        if (!queryFirst) return this.mapResultToBeetsSwap(this.swap, this.swap.inputAmount, this.swap.outputAmount);
        else {
            const rpcUrl = AllNetworkConfigsKeyedOnChain[this.chain].data.rpcUrl;
            const updatedResult = await this.swap.query(rpcUrl);

            const inputAmount = this.swap.swapKind === SwapKind.GivenIn ? this.swap.inputAmount : updatedResult;
            const outputAmount = this.swap.swapKind === SwapKind.GivenIn ? updatedResult : this.swap.outputAmount;

            return this.mapResultToBeetsSwap(this.swap, inputAmount, outputAmount);
        }
    }

    private async mapResultToBeetsSwap(
        swap: SwapLocal,
        inputAmount: TokenAmount,
        outputAmount: TokenAmount,
    ): Promise<GqlSorGetSwapsResponse> {
        let priceImpact: string | undefined;

        try {
            priceImpact = calculatePriceImpact(swap.paths, swap.swapKind).decimal.toFixed(4);
        } catch (error) {}

        // const priceImpact = swap.priceImpact.decimal.toFixed(4);
        let poolIds: string[];
        if (swap.isBatchSwap) {
            const swaps = swap.swaps as BatchSwapStep[];
            poolIds = swaps.map((swap) => swap.poolId);
        } else {
            const singleSwap = swap.swaps as SingleSwap;
            poolIds = [singleSwap.poolId];
        }
        const pools = await poolService.getGqlPools({
            where: { idIn: poolIds },
        });

        const swapAmountForSwaps =
            swap.swapKind === SwapKind.GivenIn ? inputAmount.amount.toString() : outputAmount.amount.toString();
        const returnAmountFromSwaps =
            swap.swapKind === SwapKind.GivenIn ? outputAmount.amount.toString() : inputAmount.amount.toString();

        const tokenInAmountFixed = formatFixed(inputAmount.amount.toString(), inputAmount.token.decimals);
        const tokenOutAmountFixed = formatFixed(outputAmount.amount.toString(), outputAmount.token.decimals);

        const swapAmountQuery =
            swap.swapKind === SwapKind.GivenOut ? outputAmount.amount.toString() : inputAmount.amount.toString();
        const returnAmount =
            swap.swapKind === SwapKind.GivenIn ? outputAmount.amount.toString() : inputAmount.amount.toString();
        const swapAmountQueryFixed = swap.swapKind === SwapKind.GivenOut ? tokenOutAmountFixed : tokenInAmountFixed;
        const returnAmountFixed = swap.swapKind === SwapKind.GivenIn ? tokenOutAmountFixed : tokenInAmountFixed;

        const effectivePrice = oldBnum(tokenInAmountFixed).div(tokenOutAmountFixed);
        const effectivePriceReversed = oldBnum(tokenOutAmountFixed).div(tokenInAmountFixed);

        const routes = this.mapRoutes(
            swap.swaps,
            inputAmount.amount.toString(),
            outputAmount.amount.toString(),
            pools,
            swap.inputAmount.token.address,
            swap.outputAmount.token.address,
            swap.assets,
            swap.swapKind,
        );

        for (const route of routes) {
            route.tokenInAmount = oldBnum(tokenInAmountFixed)
                .multipliedBy(route.share)
                .dp(inputAmount.token.decimals)
                .toString();
            route.tokenOutAmount = oldBnum(tokenOutAmountFixed)
                .multipliedBy(route.share)
                .dp(outputAmount.token.decimals)
                .toString();
        }

        return {
            swaps: this.mapSwaps(swap.swaps, swap.assets),
            marketSp: '0', // Daniel confirmed returning 0 should be fine here
            tokenAddresses: swap.assets,
            tokenIn: replaceZeroAddressWithEth(inputAmount.token.address),
            tokenOut: replaceZeroAddressWithEth(outputAmount.token.address),
            swapType: this.mapSwapKind(swap.swapKind),
            tokenInAmount: tokenInAmountFixed,
            tokenOutAmount: tokenOutAmountFixed,
            swapAmount: swapAmountQueryFixed,
            swapAmountScaled: swapAmountQuery,
            swapAmountForSwaps: swapAmountForSwaps ? BigNumber.from(swapAmountForSwaps).toString() : undefined,
            returnAmount: returnAmountFixed,
            returnAmountScaled: returnAmount,
            returnAmountConsideringFees: BigNumber.from(returnAmountFromSwaps).toString(),
            returnAmountFromSwaps: returnAmountFromSwaps ? BigNumber.from(returnAmountFromSwaps).toString() : undefined,
            routes: routes.map((route) => ({
                ...route,
                hops: route.hops.map((hop) => ({
                    ...hop,
                    pool: pools.find((pool) => pool.id === hop.poolId)!,
                })),
            })),
            effectivePrice: effectivePrice.toString(),
            effectivePriceReversed: effectivePriceReversed.toString(),
            priceImpact: priceImpact || '0',
        };
    }

    private mapSwaps(swaps: BatchSwapStep[] | SingleSwap, assets: string[]): GqlSorSwap[] {
        if (Array.isArray(swaps)) {
            return swaps.map((swap) => {
                return {
                    ...swap,
                    assetInIndex: Number(swap.assetInIndex.toString()),
                    assetOutIndex: Number(swap.assetOutIndex.toString()),
                    amount: swap.amount.toString(),
                };
            });
        } else {
            const assetInIndex = assets.indexOf(swaps.assetIn);
            const assetOutIndex = assets.indexOf(swaps.assetOut);
            return [
                {
                    ...swaps,
                    assetInIndex,
                    assetOutIndex,
                    amount: swaps.amount.toString(),
                    userData: swaps.userData,
                },
            ];
        }
    }

    private mapSwapKind(kind: SwapKind): GqlSorSwapType {
        return kind === SwapKind.GivenIn ? 'EXACT_IN' : 'EXACT_OUT';
    }

    private mapRoutes(
        swaps: BatchSwapStep[] | SingleSwap,
        amountIn: string,
        amountOut: string,
        pools: GqlPoolMinimal[],
        assetIn: string,
        assetOut: string,
        assets: string[],
        kind: SwapKind,
    ): GqlSorSwapRoute[] {
        const isBatchSwap = Array.isArray(swaps);
        if (!isBatchSwap) {
            const pool = pools.find((p) => p.id === swaps.poolId);
            if (!pool) throw new Error('Pool not found while mapping route');
            return [this.mapSingleSwap(swaps, amountIn, amountOut, pool)];
        }
        const paths = this.splitPaths(swaps, assetIn, assetOut, assets, kind);
        return paths.map((p) => this.mapBatchSwap(p, amountIn, amountOut, kind, assets, pools));
    }

    private mapBatchSwap(
        swaps: BatchSwapStep[],
        amountIn: string,
        amountOut: string,
        kind: SwapKind,
        assets: string[],
        pools: GqlPoolMinimal[],
    ): GqlSorSwapRoute {
        const exactIn = kind === SwapKind.GivenIn;
        const first = swaps[0];
        const last = swaps[swaps.length - 1];
        let tokenInAmount: string;
        let tokenOutAmount: string;
        let share: bigint;
        const one = BigInt(1e18);
        if (exactIn) {
            tokenInAmount = first.amount.toString();
            share = (BigInt(tokenInAmount) * one) / BigInt(amountIn);
            tokenOutAmount = ((BigInt(amountOut) * share) / one).toString();
        } else {
            tokenOutAmount = last.amount.toString();
            share = (BigInt(tokenOutAmount) * one) / BigInt(amountOut);
            tokenInAmount = ((BigInt(amountIn) * share) / one).toString();
        }

        return {
            tokenIn: assets[Number(first.assetInIndex)],
            tokenOut: assets[Number(last.assetOutIndex)],
            tokenInAmount,
            tokenOutAmount,
            share: Number(formatFixed(share.toString(), 18)),
            hops: swaps.map((swap, i) => {
                return {
                    tokenIn: assets[Number(swap.assetInIndex)],
                    tokenOut: assets[Number(swap.assetOutIndex)],
                    tokenInAmount: i === 0 ? tokenInAmount : '0',
                    tokenOutAmount: i === swaps.length - 1 ? tokenOutAmount : '0',
                    poolId: swap.poolId,
                    pool: pools.find((p) => p.id === swap.poolId) as GqlPoolMinimal,
                };
            }),
        };
    }

    private splitPaths(
        swaps: BatchSwapStep[],
        assetIn: string,
        assetOut: string,
        assets: string[],
        kind: SwapKind,
    ): BatchSwapStep[][] {
        const swapsCopy = [...swaps];
        if (kind === SwapKind.GivenOut) {
            swapsCopy.reverse();
        }
        const assetInIndex = BigInt(
            assets.indexOf(
                assetIn === AllNetworkConfigsKeyedOnChain[this.chain].data.eth.address ? ZERO_ADDRESS : assetIn,
            ),
        );
        const assetOutIndex = BigInt(
            assets.indexOf(
                assetOut === AllNetworkConfigsKeyedOnChain[this.chain].data.eth.address ? ZERO_ADDRESS : assetOut,
            ),
        );
        let path: BatchSwapStep[];
        let paths: BatchSwapStep[][] = [];
        swapsCopy.forEach((swap) => {
            if (swap.assetInIndex === assetInIndex && swap.assetOutIndex === assetOutIndex) {
                paths.push([swap]);
            } else if (swap.assetInIndex === assetInIndex) {
                path = [swap];
            } else if (swap.assetOutIndex === assetOutIndex) {
                path.push(swap);
                paths.push(path);
            } else {
                path.push(swap);
            }
        });
        return paths;
    }

    private mapSingleSwap(
        swap: SingleSwap,
        amountIn: string,
        amountOut: string,
        pool: GqlPoolMinimal,
    ): GqlSorSwapRoute {
        const hop: GqlSorSwapRouteHop = {
            pool,
            poolId: swap.poolId,
            tokenIn: swap.assetIn,
            tokenInAmount: amountIn,
            tokenOut: swap.assetOut,
            tokenOutAmount: amountOut,
        };
        return {
            share: 1,
            tokenIn: swap.assetIn,
            tokenOut: swap.assetOut,
            tokenInAmount: amountIn,
            tokenOutAmount: amountOut,
            hops: [hop],
        } as GqlSorSwapRoute;
    }

    // /**
    //  * Formats a sequence of swaps to a format that is useful for displaying the routes in user interfaces.
    //  * Taken directly from Beets SOR: https://github.com/beethovenxfi/balancer-sor/blob/beethovenx-master/src/formatSwaps.ts#L167
    //  * @dev The swaps are converted to an array of routes, where each route has an array of hops
    //  * @param swapType - exact in or exact out
    //  * @param routes - The original Swaps
    //  * @param swapAmount - The total amount being swapped
    //  * @returns SwapInfoRoute[] - The swaps formatted as routes with hops
    //  */
    // private formatRoutesSOR(swapType: SwapTypes, routes: Swap[][], swapAmount: BigNumber): SwapInfoRoute[] {
    //     const exactIn = swapType === SwapTypes.SwapExactIn;

    //     return routes.map((swaps) => {
    //         const first = swaps[0];
    //         const last = swaps[swaps.length - 1];
    //         const tokenInAmount = (exactIn ? first.swapAmount : last.swapAmountOut) || '0';
    //         const tokenOutAmount = (exactIn ? last.swapAmountOut : first.swapAmount) || '0';
    //         const tokenInAmountScaled = oldBnumScale(bnum(tokenInAmount), first.tokenInDecimals);

    //         return {
    //             tokenIn: first.tokenIn,
    //             tokenOut: last.tokenOut,
    //             tokenInAmount,
    //             tokenOutAmount,
    //             share: tokenInAmountScaled.div(bnum(swapAmount.toString())).toNumber(),
    //             hops: swaps.map((swap): SwapInfoRouteHop => {
    //                 return {
    //                     tokenIn: swap.tokenIn,
    //                     tokenOut: swap.tokenOut,
    //                     tokenInAmount: (exactIn ? swap.swapAmount : swap.swapAmountOut) || '0',
    //                     tokenOutAmount: (exactIn ? swap.swapAmountOut : swap.swapAmount) || '0',
    //                     poolId: swap.pool,
    //                 };
    //             }),
    //         };
    //     });
    // }
}
