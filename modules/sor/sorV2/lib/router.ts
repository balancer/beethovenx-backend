import { SwapKind, Token, TokenAmount } from '@balancer/sdk';
import { PathGraph } from './pathGraph/pathGraph';
import { PathGraphTraversalConfig } from './pathGraph/pathGraphTypes';
import { MathSol, WAD, max, min } from './utils/math';
import { BasePool } from './poolsV2/basePool';
import { PathLocal, PathWithAmount } from './path';
import { parseEther } from 'viem';

export class Router {
    private readonly pathGraph: PathGraph;

    constructor() {
        this.pathGraph = new PathGraph();
    }

    public getCandidatePaths(
        tokenIn: Token,
        tokenOut: Token,
        pools: BasePool[],
        enableAddRemoveLiquidityPaths: boolean,
        graphTraversalConfig?: Partial<PathGraphTraversalConfig>,
    ): PathLocal[] {
        this.pathGraph.buildGraph({ pools, enableAddRemoveLiquidityPaths });

        const candidatePaths = this.pathGraph.getCandidatePaths({
            tokenIn,
            tokenOut,
            graphTraversalConfig,
        });

        return candidatePaths;
    }

    public getBestPaths(paths: PathLocal[], swapKind: SwapKind, swapAmount: TokenAmount): PathWithAmount[] | null {
        if (paths.length === 0) {
            throw new Error('No potential swap paths provided');
        }

        const quotePaths: PathWithAmount[] = [];

        // Check if PathWithAmount is valid (each hop pool swap limit)
        paths.forEach((path) => {
            try {
                quotePaths.push(new PathWithAmount(path.tokens, path.pools, path.isBuffer, swapAmount));
            } catch {
                // console.log('Invalid path:');
                // console.log(path.tokens.map((token) => token.symbol).join(' -> '));
                // console.log(path.pools.map((pool) => pool.id).join(' -> '));
                return;
            }
        });

        if (quotePaths.length === 0) {
            // console.log('No valid paths found');
            return null;
        }

        let valueArr: { item: PathWithAmount; value: number }[];

        if (swapKind === SwapKind.GivenIn) {
            valueArr = quotePaths.map((item) => {
                return {
                    item,
                    value: Number(item.outputAmount.amount),
                };
            });
            valueArr.sort((a, b) => b.value - a.value);
        } else {
            valueArr = quotePaths.map((item) => {
                return {
                    item,
                    value: Number(item.inputAmount.amount),
                };
            });
            valueArr.sort((a, b) => a.value - b.value);
        }

        const orderedQuotePaths = valueArr.map((item) => item.item);

        // If there is only one path, return it
        if (orderedQuotePaths.length === 1) {
            return orderedQuotePaths;
        }

        const bestPath = orderedQuotePaths[0];
        const secondBestPath = orderedQuotePaths[1];

        const splitPaths = [
            [bestPath], // single path (no split)
        ];

        const ratios = [
            0.25, // 25/75 split
            0.5, // 50/50 split
            0.75, // 75/25 split
        ];
        for (const ratio of ratios) {
            try {
                const paths = this.splitPaths(swapAmount, bestPath, secondBestPath, ratio);
                splitPaths.push(paths);
            } catch (error) {
                console.log(`Error splitting paths: ${error}`);
            }
        }

        // prevent splitPaths from failing due to normalizedLiquidity not being properly filled out
        try {
            const normalizedLiquiditySplitPaths = this.splitPathsNormalizedLiquidity(
                swapAmount,
                bestPath,
                secondBestPath,
            );
            if (normalizedLiquiditySplitPaths !== undefined) {
                splitPaths.push(normalizedLiquiditySplitPaths);
            }
        } catch (error) {
            console.log(`Error splitting paths by normalized liquidity: ${error}`);
        }

        // Find the split path that yields the best result (i.e. maxAmountOut on GivenIn, minAmountIn on GivenOut)
        let bestSplitPaths: PathWithAmount[] = [];
        if (swapKind === SwapKind.GivenIn) {
            const splitPathsAmountsOut = splitPaths.map((paths) =>
                paths.map((path) => path.outputAmount.amount).reduce((acc, amountOut) => acc + amountOut, 0n),
            );
            const maxAmountOutIndex = splitPathsAmountsOut.indexOf(max(splitPathsAmountsOut));
            bestSplitPaths = splitPaths[maxAmountOutIndex];
        } else {
            const splitPathsAmountsIn = splitPaths.map((paths) =>
                paths.map((path) => path.inputAmount.amount).reduce((acc, amountIn) => acc + amountIn, 0n),
            );
            const minAmountInIndex = splitPathsAmountsIn.indexOf(min(splitPathsAmountsIn));
            bestSplitPaths = splitPaths[minAmountInIndex];
        }

        console.log(`SOR_SPLIT_PATHS_${splitPaths.indexOf(bestSplitPaths)}`);

        return bestSplitPaths;
    }

    private splitPaths(
        swapAmount: TokenAmount,
        bestPath: PathWithAmount,
        secondBestPath: PathWithAmount,
        bestPathRatio: number,
    ) {
        const ratio = parseEther(String(bestPathRatio));
        const swapAmountUp = swapAmount.mulDownFixed(ratio);
        const swapAmountDown = swapAmount.sub(swapAmountUp);

        const pathUp = new PathWithAmount(bestPath.tokens, bestPath.pools, bestPath.isBuffer, swapAmountUp);
        const pathDown = new PathWithAmount(
            secondBestPath.tokens,
            secondBestPath.pools,
            secondBestPath.isBuffer,
            swapAmountDown,
        );

        return [pathUp, pathDown];
    }

    /**
     * Normalized Liquidity (NL) = 1/Price Impact (PI)
     *
     * NL_path = 1/PI_path
     * NL_path = 1/(PI_1 + PI_2 + PI_3...) = 1/(1/NL_1 + 1/NL_2 + ...)
     */
    private splitPathsNormalizedLiquidity(
        swapAmount: TokenAmount,
        bestPath: PathWithAmount,
        secondBestPath: PathWithAmount,
    ) {
        const bestPathNLs = bestPath.pools.map((p, i) =>
            p.getNormalizedLiquidity(bestPath.tokens[i], bestPath.tokens[i + 1]),
        );
        const secondBestPathNLs = secondBestPath.pools.map((p, i) =>
            p.getNormalizedLiquidity(secondBestPath.tokens[i], secondBestPath.tokens[i + 1]),
        );
        if (bestPathNLs.some((nl) => nl === 0n) || secondBestPathNLs.some((nl) => nl === 0n)) {
            return undefined; // TODO: check what could be causing NL to be 0 for some token pairs
        }

        const bestPathNL = MathSol.divDownFixed(
            WAD,
            bestPathNLs.reduce((acc, normLiq) => acc + MathSol.divDownFixed(WAD, normLiq), 0n),
        );
        const secondBestPathNL = MathSol.divDownFixed(
            WAD,
            secondBestPathNLs.reduce((acc, normLiq) => acc + MathSol.divDownFixed(WAD, normLiq), 0n),
        );

        const swapAmountNormUp = swapAmount.mulDownFixed(bestPathNL).divDownFixed(bestPathNL + secondBestPathNL);
        const swapAmountNormDown = swapAmount.sub(swapAmountNormUp);

        const pathNormUp = new PathWithAmount(bestPath.tokens, bestPath.pools, bestPath.isBuffer, swapAmountNormUp);
        const pathNormDown = new PathWithAmount(
            secondBestPath.tokens,
            secondBestPath.pools,
            secondBestPath.isBuffer,
            swapAmountNormDown,
        );

        return [pathNormUp, pathNormDown];
    }
}
