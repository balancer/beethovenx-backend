import { Address, SwapKind, Token, TokenAmount } from '@balancer/sdk';
import { PathGraphEdgeData, PathGraphTraversalConfig } from './pathGraphTypes';
import { BasePool } from '../poolsV2/basePool';
import { PathLocal } from '../path';
import { BufferPool } from '../poolsV3/buffer/bufferPool';
import { Erc4626PoolToken } from '../poolsV2/erc4626PoolToken';

const DEFAULT_MAX_PATHS_PER_TOKEN_PAIR = 2;

export class PathGraph {
    private nodes: Map<string, { isPhantomBpt: boolean }>;
    private edges: Map<string, Map<string, PathGraphEdgeData[]>>;
    private poolAddressMap: Map<string, BasePool>;
    private maxPathsPerTokenPair = DEFAULT_MAX_PATHS_PER_TOKEN_PAIR;

    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.poolAddressMap = new Map();
    }

    // We build a directed graph for all pools.
    // Nodes are tokens and edges are triads: [pool.id, tokenIn, tokenOut].
    // The current criterion for including a pool path into this graph is the following:
    // (a) We include every path that includes a phantom BPT.
    // (b) For any token pair x -> y, we include only the most liquid ${maxPathsPerTokenPair}
    // pool pairs (default 2).
    public buildGraph({
        pools,
        maxPathsPerTokenPair = DEFAULT_MAX_PATHS_PER_TOKEN_PAIR,
        enableAddRemoveLiquidityPaths,
    }: {
        pools: BasePool[];
        maxPathsPerTokenPair?: number;
        enableAddRemoveLiquidityPaths: boolean;
    }) {
        this.poolAddressMap = new Map();
        this.nodes = new Map();
        this.edges = new Map();
        this.maxPathsPerTokenPair = maxPathsPerTokenPair;

        this.insertBufferPools(pools); // Add buffer pools to the pool list

        this.buildPoolAddressMap(pools);

        this.addAllTokensAsGraphNodes({ pools, enableAddRemoveLiquidityPaths });

        this.addTokenPairsAsGraphEdges({ pools, maxPathsPerTokenPair, enableAddRemoveLiquidityPaths });
    }

    // Since the path combinations here can get quite large, we use configurable parameters
    // to enforce upper limits across several dimensions, defined in the pathConfig.
    // (a) maxDepth - the max depth of the traversal (length of token path), defaults to 7.
    // (b) maxNonBoostedPathDepth - the max depth for any path that does not contain a phantom bpt.
    // (c) maxNonBoostedHopTokensInBoostedPath - The max number of non boosted hop tokens
    // allowed in a boosted path.
    // (d) approxPathsToReturn - search for up to this many paths. Since all paths for a single traversal
    // are added, its possible that the amount returned is larger than this number.
    // (e) poolIdsToInclude - Only include paths with these poolIds (optional)

    // Additionally, we impose the following requirements for a path to be considered valid
    // (a) It does not visit the same token twice
    // (b) It does not use the same pool twice
    public getCandidatePaths({
        tokenIn,
        tokenOut,
        graphTraversalConfig,
    }: {
        tokenIn: Token;
        tokenOut: Token;
        graphTraversalConfig?: Partial<PathGraphTraversalConfig>;
    }): PathLocal[] {
        // apply defaults, allowing caller override whatever they'd like
        const config: PathGraphTraversalConfig = {
            maxDepth: 6,
            maxNonBoostedPathDepth: 3,
            maxNonBoostedHopTokensInBoostedPath: 2,
            approxPathsToReturn: 5,
            ...graphTraversalConfig,
        };

        const tokenPaths = this.findAllValidTokenPaths({
            token: tokenIn.wrapped,
            tokenIn: tokenIn.wrapped,
            tokenOut: tokenOut.wrapped,
            config,
            tokenPath: [tokenIn.wrapped],
        }).sort((a, b) => (a.length < b.length ? -1 : 1));

        const paths: PathGraphEdgeData[][] = [];
        const selectedPathIds: string[] = [];

        // the tokenPairIndex refers to the nth most liquid path for a token
        // pair x -> y. maxPathsPerTokenPair is provided as a config on graph init
        for (let idx = 0; idx < this.maxPathsPerTokenPair; idx++) {
            for (let i = 0; i < tokenPaths.length; i++) {
                const path = this.expandTokenPath({
                    tokenPath: tokenPaths[i],
                    tokenPairIndex: idx,
                });

                if (
                    this.isValidPath({
                        path,
                        seenPoolAddresses: [],
                        selectedPathIds,
                        config,
                    })
                ) {
                    selectedPathIds.push(this.getIdForPath(path));
                    paths.push(path);
                }
            }

            // we've found enough paths, there's no need to go deeper into the token pair options.
            // TODO this breaks the SOR when there is a tilted GYRO pool. Titled gyro pools have a wrong normalized liquidity. This is just a workaround and the normalized liquidity should be fixed.
            // if (paths.length >= config.approxPathsToReturn) {
            //     break;
            // }
        }

        return this.sortAndFilterPaths(paths).map((path) => {
            const pathTokens: Token[] = [...path.map((segment) => segment.tokenOut)];
            pathTokens.unshift(tokenIn);
            pathTokens[pathTokens.length - 1] = tokenOut;

            return new PathLocal(
                pathTokens,
                path.map((segment) => segment.pool),
                path.map((segment) => segment.isBuffer),
            );
        });
    }

    private sortAndFilterPaths(paths: PathGraphEdgeData[][]): PathGraphEdgeData[][] {
        const pathsWithLimits = paths
            .map((path) => {
                try {
                    const limit = this.getLimitAmountSwapForPath(path, SwapKind.GivenIn);
                    return { path, limit };
                } catch (_e) {
                    console.log('Error getting limit for path', path.map((p) => p.pool.id).join(' -> '));
                    return undefined;
                }
            })
            .filter((path): path is { path: PathGraphEdgeData[]; limit: bigint } => !!path)
            .sort((a, b) => (a.limit < b.limit ? 1 : -1));

        const filtered: PathGraphEdgeData[][] = [];

        // Remove any paths with duplicate pools. since the paths are now sorted by limit,
        // selecting the first path will always be the optimal.
        for (const { path } of pathsWithLimits) {
            let seenPools: string[] = [];
            let isValid = true;

            for (const segment of path) {
                if (seenPools.includes(segment.pool.id)) {
                    isValid = false;
                    break;
                }
            }

            if (isValid) {
                filtered.push(path);
                seenPools = [...seenPools, ...path.map((segment) => segment.pool.id)];
            }
        }

        return filtered;
    }

    /**
     * Create buffer pools from ERC4626 tokens and add them to the pool list
     * @param pools
     */
    private insertBufferPools(pools: BasePool[]) {
        const bufferPools = new Set<BufferPool>();
        for (const pool of pools) {
            for (const token of pool.tokens) {
                if ('underlyingTokenAddress' in token) {
                    const erc4626Token = token as Erc4626PoolToken;
                    bufferPools.add(BufferPool.fromErc4626Token(erc4626Token));
                }
            }
        }
        pools.push(...bufferPools);
    }

    private buildPoolAddressMap(pools: BasePool[]) {
        for (const pool of pools) {
            this.poolAddressMap.set(pool.address, pool);
        }
    }

    private addAllTokensAsGraphNodes({
        pools,
        enableAddRemoveLiquidityPaths,
    }: {
        pools: BasePool[];
        enableAddRemoveLiquidityPaths: boolean;
    }) {
        for (const pool of pools) {
            const tokens = [...pool.tokens.map((t) => t.token)];
            if (enableAddRemoveLiquidityPaths && pool.poolType !== 'Buffer') {
                tokens.push(new Token(pool.tokens[0].token.chainId, pool.address as Address, 18)); // Add BPT as token nodes
            }
            for (const token of tokens) {
                if (!this.nodes.has(token.wrapped)) {
                    this.addNode(token);
                }
            }
        }
    }

    private addTokenPairsAsGraphEdges({
        pools,
        maxPathsPerTokenPair,
        enableAddRemoveLiquidityPaths,
    }: {
        pools: BasePool[];
        maxPathsPerTokenPair: number;
        enableAddRemoveLiquidityPaths: boolean;
    }) {
        for (const pool of pools) {
            const tokens = [...pool.tokens.map((t) => t.token)];
            if (enableAddRemoveLiquidityPaths) {
                tokens.push(new Token(pool.tokens[0].token.chainId, pool.address as Address, 18)); // Also consider BPT token pairs
            }
            for (const tokenIn of tokens) {
                for (const tokenOut of tokens) {
                    if (tokenIn === tokenOut) continue;
                    this.addEdge({
                        edgeProps: {
                            pool,
                            tokenIn,
                            tokenOut,
                            normalizedLiquidity: pool.getNormalizedLiquidity(tokenIn, tokenOut),
                            isBuffer: pool.poolType === 'Buffer',
                        },
                        maxPathsPerTokenPair,
                    });
                }
            }
        }
    }

    private addNode(token: Token): void {
        this.nodes.set(token.wrapped, {
            isPhantomBpt: !!this.poolAddressMap.get(token.wrapped),
        });

        if (!this.edges.has(token.wrapped)) {
            this.edges.set(token.wrapped, new Map());
        }
    }

    /**
     * Returns the vertices connected to a given vertex
     */
    public getConnectedVertices(tokenAddress: string): string[] {
        const result: string[] = [];
        const edges = this.edges.get(tokenAddress) || [];

        for (const [otherToken] of edges) {
            result.push(otherToken);
        }

        return result;
    }

    /**
     * Adds a directed edge from a source vertex to a destination
     */
    private addEdge({
        edgeProps,
        maxPathsPerTokenPair,
    }: {
        edgeProps: PathGraphEdgeData;
        maxPathsPerTokenPair: number;
    }): void {
        const tokenInVertex = this.nodes.get(edgeProps.tokenIn.wrapped);
        const tokenOutVertex = this.nodes.get(edgeProps.tokenOut.wrapped);
        const tokenInNode = this.edges.get(edgeProps.tokenIn.wrapped);

        if (!tokenInVertex || !tokenOutVertex || !tokenInNode) {
            throw new Error('Attempting to add invalid edge');
        }

        const hasPhantomBpt = tokenInVertex.isPhantomBpt || tokenOutVertex.isPhantomBpt;
        const existingEdges = tokenInNode.get(edgeProps.tokenOut.wrapped) || [];

        //TODO: ideally we don't call sort every time, this isn't performant
        const sorted = [...existingEdges, edgeProps].sort((a, b) =>
            a.normalizedLiquidity > b.normalizedLiquidity ? -1 : 1,
        );

        // TODO: double check if the hasPhantomBpt issue is not affecting v3 liquidity more frequently (considering all
        // pools have their BPT artificially added so we consider them for add/remove liquidity steps)
        tokenInNode.set(
            edgeProps.tokenOut.wrapped,
            sorted.length > maxPathsPerTokenPair && !hasPhantomBpt ? sorted.slice(0, 2) : sorted,
        );
    }

    public findAllValidTokenPaths(args: {
        token: string;
        tokenIn: string;
        tokenOut: string;
        tokenPath: string[];
        config: PathGraphTraversalConfig;
    }): string[][] {
        const tokenPaths: string[][] = [];

        this.traverseBfs({
            ...args,
            callback: (tokenPath) => {
                tokenPaths.push(tokenPath);
            },
        });

        return tokenPaths;
    }

    public expandTokenPath({ tokenPath, tokenPairIndex }: { tokenPath: string[]; tokenPairIndex: number }) {
        const segments: PathGraphEdgeData[] = [];

        for (let i = 0; i < tokenPath.length - 1; i++) {
            const edge = this.edges.get(tokenPath[i])?.get(tokenPath[i + 1]);

            if (!edge || edge.length === 0) {
                throw new Error(`Missing edge for pair ${tokenPath[i]} -> ${tokenPath[i + 1]}`);
            }

            segments.push(edge[tokenPairIndex] || edge[0]);
        }

        return segments;
    }

    private traverseBfs({
        token,
        tokenIn,
        tokenOut,
        tokenPath,
        callback,
        config,
    }: {
        token: string;
        tokenIn: string;
        tokenOut: string;
        tokenPath: string[];
        callback: (tokenPath: string[]) => void;
        config: PathGraphTraversalConfig;
    }): void {
        const neighbors = this.getConnectedVertices(token);

        for (const neighbor of neighbors) {
            const validTokenPath = this.isValidTokenPath({
                tokenPath: [...tokenPath, neighbor],
                tokenIn,
                tokenOut,
                config,
            });

            if (validTokenPath && neighbor === tokenOut) {
                callback([...tokenPath, neighbor]);
            } else if (validTokenPath && !tokenPath.includes(neighbor)) {
                this.traverseBfs({
                    tokenPath: [...tokenPath, neighbor],
                    token: neighbor,
                    tokenIn,
                    tokenOut,
                    callback,
                    config,
                });
            }
        }
    }

    private isValidTokenPath({
        tokenPath,
        config,
        tokenIn,
        tokenOut,
    }: {
        tokenPath: string[];
        config: PathGraphTraversalConfig;
        tokenIn: string;
        tokenOut: string;
    }) {
        const isCompletePath = tokenPath[tokenPath.length - 1] === tokenOut;
        const hopTokens = tokenPath.filter((token) => token !== tokenIn && token !== tokenOut);
        const numStandardHopTokens = hopTokens.filter((token) => !this.poolAddressMap.has(token)).length;
        const isBoostedPath = tokenPath.filter((token) => this.poolAddressMap.has(token)).length > 0;

        if (tokenPath.length > config.maxDepth) {
            return false;
        }

        if (isBoostedPath && numStandardHopTokens > config.maxNonBoostedHopTokensInBoostedPath) {
            return false;
        }

        // if the path length is greater than maxNonBoostedPathDepth, then this path
        // will only be valid if its a boosted path, so it must honor maxNonBoostedHopTokensInBoostedPath
        if (
            tokenPath.length > config.maxNonBoostedPathDepth &&
            numStandardHopTokens > config.maxNonBoostedHopTokensInBoostedPath
        ) {
            return false;
        }

        if (isCompletePath && !isBoostedPath && tokenPath.length > config.maxNonBoostedPathDepth) {
            return false;
        }

        return true;
    }

    private isValidPath({
        path,
        seenPoolAddresses,
        selectedPathIds,
        config,
    }: {
        path: PathGraphEdgeData[];
        seenPoolAddresses: string[];
        selectedPathIds: string[];
        config: PathGraphTraversalConfig;
    }) {
        const poolIdsInPath = path.map((segment) => segment.pool.id);
        const uniquePools = [...new Set(poolIdsInPath)];

        if (config.poolIdsToInclude) {
            for (const poolId of poolIdsInPath) {
                if (!config.poolIdsToInclude.includes(poolId)) {
                    //path includes a pool that is not allowed for this traversal
                    return false;
                }
            }
        }

        //dont include any path that hops through the same pool twice
        if (uniquePools.length !== poolIdsInPath.length) {
            return false;
        }

        for (const segment of path) {
            if (seenPoolAddresses.includes(segment.pool.address)) {
                //this path contains a pool that has already been used
                return false;
            }
        }

        //this is a duplicate path
        if (selectedPathIds.includes(this.getIdForPath(path))) {
            return false;
        }

        return true;
    }

    private getIdForPath(path: PathGraphEdgeData[]): string {
        let id = '';

        for (const segment of path) {
            if (id.length > 0) {
                id += '_';
            }

            id += `${segment.pool.id}-${segment.tokenIn}-${segment.tokenOut}`;
        }

        return id;
    }

    private filterVolatilePools(poolAddresses: string[]): string[] {
        const filtered: string[] = [];

        for (const poolAddress of poolAddresses) {
            if (this.poolAddressMap.get(poolAddress)?.poolType === 'WEIGHTED') {
                filtered.push(poolAddress);
            }
        }

        return filtered;
    }

    private getLimitAmountSwapForPath(path: PathGraphEdgeData[], swapKind: SwapKind): bigint {
        let limit = path[path.length - 1].pool.getLimitAmountSwap(
            path[path.length - 1].tokenIn,
            path[path.length - 1].tokenOut,
            swapKind,
        );

        for (let i = path.length - 2; i >= 0; i--) {
            const poolLimitExactIn = path[i].pool.getLimitAmountSwap(
                path[i].tokenIn,
                path[i].tokenOut,
                SwapKind.GivenIn,
            );
            const poolLimitExactOut = path[i].pool.getLimitAmountSwap(
                path[i].tokenIn,
                path[i].tokenOut,
                SwapKind.GivenOut,
            );

            if (poolLimitExactOut <= limit) {
                limit = poolLimitExactIn;
            } else {
                const pulledLimit = path[i].pool.swapGivenOut(
                    path[i].tokenIn,
                    path[i].tokenOut,
                    TokenAmount.fromRawAmount(path[i].tokenOut, limit),
                ).amount;

                limit = pulledLimit > poolLimitExactIn ? poolLimitExactIn : pulledLimit;
            }
        }

        return limit;
    }
}
