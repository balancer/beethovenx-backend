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

        // break swapAmount into 25%, 50%, 75% and 100% ratios, so we're able to split quote into multiple paths
        let validPaths = [...paths];
        let selectedPaths: PathLocal[] = [];
        const swapAmounts = [
            swapAmount.mulDownFixed(parseEther(String(0.25))),
            swapAmount.mulDownFixed(parseEther(String(0.5))),
            swapAmount.mulDownFixed(parseEther(String(0.75))),
            swapAmount,
        ];

        // initialize quotePaths arrays for each swapAmount ratio
        const quotePathsByRatio: PathWithAmount[][] = swapAmounts.map(() => []);

        // Quote paths for each swapAmount ratio
        swapAmounts.forEach((amount, i) => {
            validPaths.forEach((path) => {
                try {
                    quotePathsByRatio[i].push(new PathWithAmount(path.tokens, path.pools, path.isBuffer, amount));
                    selectedPaths.push(path);
                } catch {
                    // console.log('Invalid path:');
                    // console.log(path.tokens.map((token) => token.symbol).join(' -> '));
                    // console.log(path.pools.map((pool) => pool.id).join(' -> '));
                    return;
                }
            });

            validPaths = selectedPaths;
            selectedPaths = [];
        });

        // sort each quotePaths array by outputAmount or inputAmount
        quotePathsByRatio.forEach((quotePaths) => {
            quotePaths.sort((a, b) => {
                if (swapKind === SwapKind.GivenIn) {
                    return Number(b.outputAmount.amount) - Number(a.outputAmount.amount);
                } else {
                    return Number(a.inputAmount.amount) - Number(b.inputAmount.amount);
                }
            });
        });

        // select best split path candidates based on their ratio combination
        const quotePaths25 = quotePathsByRatio[0];
        const quotePaths50 = quotePathsByRatio[1];
        const quotePaths75 = quotePathsByRatio[2];
        const quotePaths100 = quotePathsByRatio[3];

        const splitPaths: PathWithAmount[][] = [];

        if (quotePaths100.length > 0) {
            splitPaths.push([quotePaths100[0]]);
        }

        if (quotePaths75.length > 0 && quotePaths25.length > 1) {
            // prevent bestPath25 from being the same as bestPath75
            const bestPath25 = quotePaths25.find((path) => path.pools !== quotePaths75[0].pools) as PathWithAmount;
            splitPaths.push(this.splitPaths(swapAmount, bestPath25, quotePaths75[0])); // 25/75
        }

        if (quotePaths50.length > 1) {
            splitPaths.push(this.splitPaths(swapAmount, quotePaths50[0], quotePaths50[1])); // 50/50
        }

        if (splitPaths.length === 0) {
            // console.log('No valid paths found');
            return null;
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

    // split paths making sure there is no dust left behind from rounding swapAmount ratios
    private splitPaths(swapAmount: TokenAmount, pathA: PathWithAmount, pathB: PathWithAmount) {
        const swapAmountUp = pathA.swapAmount;
        const swapAmountDown = swapAmount.sub(swapAmountUp);

        const pathUp = new PathWithAmount(pathA.tokens, pathA.pools, pathA.isBuffer, swapAmountUp);
        const pathDown = new PathWithAmount(pathB.tokens, pathB.pools, pathB.isBuffer, swapAmountDown);

        return [pathUp, pathDown];
    }
}
