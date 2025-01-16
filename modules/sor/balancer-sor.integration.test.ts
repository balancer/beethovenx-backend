// yarn vitest balancer-sor.integration.test.ts

import { ExactInQueryOutput, Swap, SwapKind, Token, Address, Path, ExactOutQueryOutput } from '@balancer/sdk';

import { PathWithAmount } from './sorV2/lib/path';
import { sorGetPathsWithPools } from './sorV2/lib/static';
import { getOutputAmount, getInputAmount } from './sorV2/lib/utils/helpers';
import { chainToChainId as chainToIdMap } from '../network/chain-id-to-chain';

import { ANVIL_NETWORKS, startFork, stopAnvilForks } from '../../test/anvil/anvil-global-setup';
import {
    prismaPoolDynamicDataFactory,
    prismaPoolFactory,
    prismaPoolTokenFactory,
    hookFactory,
} from '../../test/factories';
import { createTestClient, formatEther, Hex, http, parseEther, TestClient } from 'viem';
import { sepolia } from 'viem/chains';

/**
 * Test Data:
 *
 * In order to properly compare SOR quotes vs SDK queries, we need to setup test data from a specific blockNumber.
 * Although the API does not provide that functionality, we can use subgraph to achieve it.
 * These tests run against the 12th testnet deployment and these are their respective subgraphs:
 * - data common to all pools: [balancer subgraph](https://api.studio.thegraph.com/query/75376/balancer-v3-sepolia/version/latest/graphql)
 *   - tokens (address, balance, decimals)
 *   - totalShares
 *   - swapFee
 * - data specific to each pool type: [pools subgraph](https://api.studio.thegraph.com/query/75376/balancer-pools-v3-sepolia/version/latest/graphql)
 *   - weight
 *   - amp
 * The only item missing from subgraph is priceRate, which can be fetched from a Tenderly simulation (getPoolTokenRates)
 * against the VaultExplorer contract (0xEB15EBBF9C1a4D7D243d57dE447Df0b97C40c324).
 *
 * TODO: improve test data setup by creating a script that fetches all necessary data automatically for a given blockNumber.
 */

const protocolVersion = 3;

describe('Balancer SOR Integration Tests', () => {
    let rpcUrl: string;
    let paths: PathWithAmount[];
    let sdkSwap: Swap;
    let snapshot: Hex;
    let client: TestClient;

    beforeAll(async () => {
        // start fork to run queries against
        ({ rpcUrl } = await startFork(ANVIL_NETWORKS.SEPOLIA, undefined, BigInt(7303517)));
        client = createTestClient({
            mode: 'anvil',
            chain: sepolia,
            transport: http(rpcUrl),
        });
        snapshot = await client.snapshot();
    });

    beforeEach(async () => {
        await client.revert({
            id: snapshot,
        });
        snapshot = await client.snapshot();
    });

    describe('Weighted Pool Path', () => {
        beforeAll(async () => {
            // setup mock pool data
            const WETH = prismaPoolTokenFactory.build({
                address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
                balance: '4.536240319632451',
                weight: '0.5',
            });
            const BAL = prismaPoolTokenFactory.build({
                address: '0xb19382073c7a0addbb56ac6af1808fa49e377b75',
                balance: '4478.688211421803',
                weight: '0.5',
            });
            const prismaWeightedPool = prismaPoolFactory.build({
                address: '0xb790fa0ba5d563b814b0ca1716c414f6b99937b2',
                type: 'WEIGHTED',
                protocolVersion,
                tokens: [WETH, BAL],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '142.53017869910634229',
                    swapFee: '0.01',
                }),
            });

            // get SOR paths
            const tIn = new Token(parseFloat(chainToIdMap['SEPOLIA']), BAL.address as Address, BAL.token.decimals);
            const tOut = new Token(parseFloat(chainToIdMap['SEPOLIA']), WETH.address as Address, WETH.token.decimals);
            const amountIn = BigInt(0.1e18);
            paths = (await sorGetPathsWithPools(
                tIn,
                tOut,
                SwapKind.GivenIn,
                amountIn,
                [prismaWeightedPool],
                protocolVersion,
            )) as PathWithAmount[];

            // build SDK swap from SOR paths
            sdkSwap = new Swap({
                chainId: parseFloat(chainToIdMap['SEPOLIA']),
                paths: paths.map((path) => ({
                    protocolVersion,
                    inputAmountRaw: path.inputAmount.amount,
                    outputAmountRaw: path.outputAmount.amount,
                    tokens: path.tokens.map((token) => ({
                        address: token.address,
                        decimals: token.decimals,
                    })),
                    pools: path.pools.map((pool) => pool.id),
                })),
                swapKind: SwapKind.GivenIn,
            });
        });

        test('SOR quote should match swap query', async () => {
            const returnAmountSOR = getOutputAmount(paths);
            const queryOutput = await sdkSwap.query(rpcUrl);
            const returnAmountQuery = (queryOutput as ExactInQueryOutput).expectedAmountOut;
            expect(returnAmountQuery.amount).toEqual(returnAmountSOR.amount);
        });
    });

    describe('Stable Pool Path', () => {
        beforeAll(async () => {
            // setup mock pool data for a stable pool
            const poolAddress = '0x1d7699323e1b927c15afe5781fd21a8552a8ea38';
            const USDT = prismaPoolTokenFactory.build({
                address: '0x6bf294b80c7d8dc72dee762af5d01260b756a051',
                token: { decimals: 6 },
                balance: '1',
                priceRate: '1.0',
            });
            const USDC = prismaPoolTokenFactory.build({
                address: '0x80d6d3946ed8a1da4e226aa21ccddc32bd127d1a',
                token: { decimals: 6 },
                balance: '1',
                priceRate: '1.0',
            });
            const prismaStablePool = prismaPoolFactory.stable('1000').build({
                address: poolAddress,
                tokens: [USDT, USDC],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '2',
                    swapFee: '0.001',
                }),
            });

            // get SOR paths
            const tIn = new Token(
                parseFloat(chainToIdMap[USDC.token.chain]),
                USDT.address as Address,
                USDT.token.decimals,
            );
            const tOut = new Token(
                parseFloat(chainToIdMap[USDT.token.chain]),
                USDC.address as Address,
                USDC.token.decimals,
            );
            const amountIn = BigInt(1000e6);
            paths = (await sorGetPathsWithPools(
                tIn,
                tOut,
                SwapKind.GivenIn,
                amountIn,
                [prismaStablePool],
                protocolVersion,
            )) as PathWithAmount[];

            const swapPaths: Path[] = paths.map((path) => ({
                protocolVersion,
                inputAmountRaw: path.inputAmount.amount,
                outputAmountRaw: path.outputAmount.amount,
                tokens: path.tokens.map((token) => ({
                    address: token.address,
                    decimals: token.decimals,
                })),
                pools: path.pools.map((pool) => pool.id),
            }));

            // build SDK swap from SOR paths
            sdkSwap = new Swap({
                chainId: parseFloat(chainToIdMap['SEPOLIA']),
                paths: swapPaths,
                swapKind: SwapKind.GivenIn,
            });
        });

        test('SOR quote should match swap query', async () => {
            const returnAmountSOR = getOutputAmount(paths);
            const queryOutput = await sdkSwap.query(rpcUrl);
            const returnAmountQuery = (queryOutput as ExactInQueryOutput).expectedAmountOut;
            expect(returnAmountQuery.amount).toEqual(returnAmountSOR.amount);
        });
    });

    describe('Add/Remove Liquidity Paths', () => {
        let stataEthUSDC: ReturnType<typeof prismaPoolTokenFactory.build>;
        let WETH: ReturnType<typeof prismaPoolTokenFactory.build>;
        let boostedPool: ReturnType<typeof prismaPoolFactory.build>;
        let weightedPool: ReturnType<typeof prismaPoolFactory.build>;

        beforeAll(async () => {
            // setup mock pool data
            // Pool 1. this pool is supposed to have two stable coins
            // for deploy-11 this is 0x1d7699323e1b927c15afe5781fd21a8552a8ea38
            // this pool is a StablePool
            const boostedPoolAddress = '0x59fa488dda749cdd41772bb068bb23ee955a6d7a';
            stataEthUSDC = prismaPoolTokenFactory.build({
                address: '0x8a88124522dbbf1e56352ba3de1d9f78c143751e',
                token: { decimals: 6 },
                balance: '17046.594346',
                priceRate: '1.216261233431405026',
            });
            const stataEthUSDT = prismaPoolTokenFactory.build({
                address: '0x978206fae13faf5a8d293fb614326b237684b750',
                token: { decimals: 6 },
                balance: '58206.030088',
                priceRate: '1.371108722796244136',
            });
            boostedPool = prismaPoolFactory.stable('1000').build({
                address: boostedPoolAddress,
                tokens: [stataEthUSDC, stataEthUSDT],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '98722.363453387463962451',
                    swapFee: '0.001',
                }),
            });

            // Pool 2. this pool is supposed to have the BPT of pool 1 and WETH.
            const weightedPoolAddress = '0x693cc6a39bbf35464f53d6a5dbf7d6c2fa93741c';
            const stataEthUSDC_stataEthUSDT_BPT = prismaPoolTokenFactory.build({
                address: '0x59fa488dda749cdd41772bb068bb23ee955a6d7a',
                token: { decimals: 18 },
                balance: '536.112912071673838086',
            });
            WETH = prismaPoolTokenFactory.build({
                address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
                token: { decimals: 18 },
                balance: '0.641025581212023582',
            });
            weightedPool = prismaPoolFactory.build({
                address: weightedPoolAddress,
                tokens: [stataEthUSDC_stataEthUSDT_BPT, WETH],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '18.481916220523369438',
                    swapFee: '0.01',
                }),
            });
        });

        // statA [add] bpt [swap] weth
        describe('Add Liquidity Path', () => {
            beforeAll(async () => {
                // get SOR paths
                const tIn = new Token(
                    parseFloat(chainToIdMap[stataEthUSDC.token.chain]),
                    stataEthUSDC.address as Address,
                    stataEthUSDC.token.decimals,
                );
                const tOut = new Token(
                    parseFloat(chainToIdMap[WETH.token.chain]),
                    WETH.address as Address,
                    WETH.token.decimals,
                );
                const amountIn = BigInt(10e6);
                paths = (await sorGetPathsWithPools(
                    tIn,
                    tOut,
                    SwapKind.GivenIn,
                    amountIn,
                    [boostedPool, weightedPool],
                    protocolVersion,
                )) as PathWithAmount[];

                const swapPaths: Path[] = paths.map((path) => ({
                    protocolVersion,
                    inputAmountRaw: path.inputAmount.amount,
                    outputAmountRaw: path.outputAmount.amount,
                    tokens: path.tokens.map((token) => ({
                        address: token.address,
                        decimals: token.decimals,
                    })),
                    pools: path.pools.map((pool) => pool.id),
                }));

                // build SDK swap from SOR paths
                sdkSwap = new Swap({
                    chainId: parseFloat(chainToIdMap['SEPOLIA']),
                    paths: swapPaths,
                    swapKind: SwapKind.GivenIn,
                });
            });

            test('SOR quote should match swap query', async () => {
                const returnAmountSOR = getOutputAmount(paths);
                const queryOutput = await sdkSwap.query(rpcUrl);
                const returnAmountQuery = (queryOutput as ExactInQueryOutput).expectedAmountOut;
                expect(returnAmountQuery.amount).toEqual(returnAmountSOR.amount);
            });
        });

        // weth [swap] bpt [remove] usdc
        describe('Remove Liquidity Path', () => {
            beforeAll(async () => {
                // get SOR paths
                const tIn = new Token(
                    parseFloat(chainToIdMap[WETH.token.chain]),
                    WETH.address as Address,
                    WETH.token.decimals,
                );
                const tOut = new Token(
                    parseFloat(chainToIdMap[stataEthUSDC.token.chain]),
                    stataEthUSDC.address as Address,
                    stataEthUSDC.token.decimals,
                );
                const amountIn = parseEther('0.0001');
                paths = (await sorGetPathsWithPools(
                    tIn,
                    tOut,
                    SwapKind.GivenIn,
                    amountIn,
                    [boostedPool, weightedPool],
                    protocolVersion,
                )) as PathWithAmount[];

                const swapPaths: Path[] = paths.map((path) => ({
                    protocolVersion,
                    inputAmountRaw: path.inputAmount.amount,
                    outputAmountRaw: path.outputAmount.amount,
                    tokens: path.tokens.map((token) => ({
                        address: token.address,
                        decimals: token.decimals,
                    })),
                    pools: path.pools.map((pool) => pool.id),
                }));

                // build SDK swap from SOR paths
                sdkSwap = new Swap({
                    chainId: parseFloat(chainToIdMap['SEPOLIA']),
                    paths: swapPaths,
                    swapKind: SwapKind.GivenIn,
                });
            });

            test('SOR quote should match swap query', async () => {
                const returnAmountSOR = getOutputAmount(paths);
                const queryOutput = await sdkSwap.query(rpcUrl);
                const returnAmountQuery = (queryOutput as ExactInQueryOutput).expectedAmountOut;
                expect(returnAmountQuery.amount).toEqual(returnAmountSOR.amount);
            });
        });
    });

    describe('Buffer Pool Path', () => {
        beforeAll(async () => {
            // setup mock pool data for a stable pool (with yield bearing assets)
            const poolAddress = '0x59fa488dda749cdd41772bb068bb23ee955a6d7a';
            const stataUSDC = prismaPoolTokenFactory.build({
                address: '0x8a88124522dbbf1e56352ba3de1d9f78c143751e',
                token: { decimals: 6, underlyingTokenAddress: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8' },
                balance: '17046.594346',
                priceRate: '1.208650468656424855',
            });
            const stataUSDT = prismaPoolTokenFactory.build({
                address: '0x978206fae13faf5a8d293fb614326b237684b750',
                token: { decimals: 6, underlyingTokenAddress: '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0' },
                balance: '58206.030088',
                priceRate: '1.359644528988548697',
            });
            const prismaStablePool = prismaPoolFactory.stable('1000').build({
                address: poolAddress,
                tokens: [stataUSDC, stataUSDT],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '98722.363453387463962451',
                    swapFee: '0.001',
                }),
            });

            // get SOR paths
            const tIn = new Token(
                parseFloat(chainToIdMap[stataUSDC.token.chain]),
                stataUSDC.token.underlyingTokenAddress as Address, // USDC
                stataUSDC.token.decimals,
            );
            const tOut = new Token(
                parseFloat(chainToIdMap[stataUSDT.token.chain]),
                stataUSDT.token.underlyingTokenAddress as Address, // DAI
                stataUSDT.token.decimals,
            );
            const amountIn = BigInt(10e6);
            paths = (await sorGetPathsWithPools(
                tIn,
                tOut,
                SwapKind.GivenIn,
                amountIn,
                [prismaStablePool],
                protocolVersion,
            )) as PathWithAmount[];

            const swapPaths: Path[] = paths.map((path) => ({
                protocolVersion,
                inputAmountRaw: path.inputAmount.amount,
                outputAmountRaw: path.outputAmount.amount,
                tokens: path.tokens.map((token) => ({
                    address: token.address,
                    decimals: token.decimals,
                })),
                pools: path.pools.map((pool) => pool.id),
                isBuffer: path.isBuffer,
            }));

            // build SDK swap from SOR paths
            sdkSwap = new Swap({
                chainId: parseFloat(chainToIdMap['SEPOLIA']),
                paths: swapPaths,
                swapKind: SwapKind.GivenIn,
            });
        });

        test('SOR quote should match swap query', async () => {
            const returnAmountSOR = getOutputAmount(paths);
            const queryOutput = await sdkSwap.query(rpcUrl);
            const returnAmountQuery = (queryOutput as ExactInQueryOutput).expectedAmountOut;
            const returnAmountQueryFloat = parseFloat(formatEther(returnAmountQuery.amount));
            const returnAmountSORFloat = parseFloat(formatEther(returnAmountSOR.amount));
            expect(returnAmountQueryFloat).toBeCloseTo(returnAmountSORFloat, 2);
        });
    });

    describe('Pools Path with hooks -', async () => {
        // the 11th testnet deployment has pools of the following type:
        // ExitFeeHook - triggered on removeLiquidity operations
        // FeeTakingHook -
        // DirectionalFeeHook -
        // LotteryHook -

        let WETH,
            BAL,
            stataUSDT,
            stataUSDC,
            aaveFaucetDai,
            aaveFaucetUsdc: ReturnType<typeof prismaPoolTokenFactory.build>;
        let prismaWeightedPool,
            prismaStablePool,
            prismaStablePoolWithExitFee,
            prismaStablePoolWithDirectionalFee: ReturnType<typeof prismaPoolFactory.build>;

        let exitFeeHook, directionalFeeHook: ReturnType<typeof hookFactory.build>;

        let weightedBpt: Token;
        let stableBpt: Token;
        let wethToken: Token;
        let aaveFaucetUsdcToken: Token;

        beforeAll(async () => {
            // setup mock pool data - Weighted
            WETH = prismaPoolTokenFactory.build({
                address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
                balance: '0.5',
                weight: '0.5',
            });
            BAL = prismaPoolTokenFactory.build({
                address: '0xb19382073c7a0addbb56ac6af1808fa49e377b75',
                balance: '500',
                weight: '0.5',
            });

            const dynamicData = {
                // Add any specific dynamic data parameters here
                addLiquidityFeePercentage: '0.01',
                removeLiquidityFeePercentage: '0.01',
                swapFeePercentage: '0.01',
            };
            exitFeeHook = hookFactory.build({
                name: 'ExitFee',
                dynamicData: dynamicData,
                enableHookAdjustedAmounts: true,
                shouldCallAfterAddLiquidity: true,
                shouldCallAfterInitialize: true,
                shouldCallAfterRemoveLiquidity: true,
                shouldCallAfterSwap: true,
                shouldCallBeforeAddLiquidity: true,
                shouldCallBeforeInitialize: true,
                shouldCallBeforeRemoveLiquidity: true,
                shouldCallBeforeSwap: true,
                shouldCallComputeDynamicSwapFee: true,
            });

            // 11th testnet deployment the hook is at 0xD9e535a65eb38F962B84f7BBD2bf60293bA54058
            directionalFeeHook = hookFactory.build({
                name: 'DirectionalFee',
                dynamicData: dynamicData,
                enableHookAdjustedAmounts: true,
                shouldCallAfterAddLiquidity: true,
                shouldCallAfterInitialize: true,
                shouldCallAfterRemoveLiquidity: true,
                shouldCallAfterSwap: true,
                shouldCallBeforeAddLiquidity: true,
                shouldCallBeforeInitialize: true,
                shouldCallBeforeRemoveLiquidity: true,
                shouldCallBeforeSwap: true,
                shouldCallComputeDynamicSwapFee: true,
            });

            // this pool has an exitFee hook
            prismaWeightedPool = prismaPoolFactory.build({
                address: '0x268F89A2B850B5Eb802b455e4e7D670Cb0B0e503',
                type: 'WEIGHTED',
                protocolVersion,
                tokens: [WETH, BAL],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '15.811388300841580395',
                    swapFee: '0.01',
                }),
                hook: exitFeeHook,
                liquidityManagement: {
                    disableUnbalancedLiquidity: true,
                    enableAddLiquidityCustom: false,
                    enableDonation: false,
                    enableRemoveLiquidityCustom: false,
                },
            });

            //
            aaveFaucetDai = prismaPoolTokenFactory.build({
                address: '0xff34b3d4aee8ddcd6f9afffb6fe49bd371b8a357',
                token: { decimals: 18 },
                balance: '25000',
                priceRate: '1.0',
            });

            aaveFaucetUsdc = prismaPoolTokenFactory.build({
                address: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8',
                token: { decimals: 6 },
                balance: '25000',
                priceRate: '1.0',
            });

            // 11th testnet deployment this pool at is 0x676F89B5e1563Eef4D1344Dc629812b1e9c1B0d7
            prismaStablePoolWithDirectionalFee = prismaPoolFactory.stable('1000').build({
                address: '0xc7512572bca89b90d604f88557d270716dcfea78',
                tokens: [aaveFaucetUsdc, aaveFaucetDai],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '50000',
                    swapFee: '0.001',
                }),
                hook: directionalFeeHook,
            });

            prismaStablePoolWithExitFee = prismaPoolFactory.stable('1000').build({
                address: '0xc7512572bca89b90d604f88557d270716dcfea78',
                tokens: [aaveFaucetUsdc, aaveFaucetDai],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '50000',
                    swapFee: '0.001',
                }),
                hook: exitFeeHook,
                liquidityManagement: {
                    disableUnbalancedLiquidity: true,
                    enableAddLiquidityCustom: false,
                    enableDonation: false,
                    enableRemoveLiquidityCustom: false,
                },
            });

            weightedBpt = new Token(
                parseFloat(chainToIdMap[BAL.token.chain]),
                prismaWeightedPool.address as Address,
                18,
            );
            wethToken = new Token(
                parseFloat(chainToIdMap[WETH.token.chain]),
                WETH.address as Address,
                WETH.token.decimals,
            );

            stableBpt = new Token(
                parseFloat(chainToIdMap[BAL.token.chain]),
                prismaStablePoolWithExitFee.address as Address,
                18,
            );
            aaveFaucetUsdcToken = new Token(
                parseFloat(chainToIdMap[WETH.token.chain]),
                aaveFaucetUsdc.address as Address,
                aaveFaucetUsdc.token.decimals,
            );
        });
        test('Weighted: SOR should not find path for exit swap with exit fee hook used - GIVEN IN', async () => {
            // The SOR considers pool joins and exits as potential swaps. However a pool's liquidity management struct
            // defines if unbalanced join operations are allowed. Since the exit fee hook does not allow
            // unbalanced pool operations the SOR must not find a path through a pool where unbalanced operations
            // are disallowed.

            const amountIn = BigInt(1e18);

            paths = (await sorGetPathsWithPools(
                weightedBpt,
                wethToken,
                SwapKind.GivenIn,
                amountIn,
                [prismaWeightedPool], // This pool has an exit fee hook
                protocolVersion,
            )) as PathWithAmount[];

            // The pools liquidity management disallowed unbalanced joins/exits.
            // The sor sets the output amount to 0 in this case.
            expect(paths[0].outputAmount.amount).toEqual(0n);
        });
        test('Weighted: SOR should not find path for exit swap with exit fee hook used - GIVEN OUT', async () => {
            // The SOR considers pool joins and exits as potential swaps. However a pool's liquidity management struct
            // defines if unbalanced join operations are allowed. Since the exit fee hook does not allow
            // unbalanced pool operations the SOR must not find a path through a pool where unbalanced operations
            // are disallowed.

            const amountOut = BigInt(1e18);

            paths = (await sorGetPathsWithPools(
                weightedBpt,
                wethToken,
                SwapKind.GivenOut,
                amountOut,
                [prismaWeightedPool], // This pool has an exit fee hook
                protocolVersion,
            )) as PathWithAmount[];

            // The pools liquidity management disallowed unbalanced joins/exits.
            // The sor sets the output amount to 0 in this case.
            expect(paths[0].inputAmount.amount).toEqual(0n);
        });
        test('Weighted: SOR should not find path for join swap with exit fee hook used - GIVEN IN', async () => {
            // The SOR considers pool joins and exits as potential swaps. However a pool's liquidity management struct
            // defines if unbalanced join operations are allowed. Since the exit fee hook does not allow
            // unbalanced pool operations the SOR must not find a path through a pool where unbalanced operations
            // are disallowed.

            const amountIn = BigInt(1e18);

            paths = (await sorGetPathsWithPools(
                wethToken,
                weightedBpt,
                SwapKind.GivenIn,
                amountIn,
                [prismaWeightedPool], // This pool has an exit fee hook
                protocolVersion,
            )) as PathWithAmount[];

            // The pools liquidity management disallowed unbalanced joins/exits.
            // The sor sets the output amount to 0 in this case.
            expect(paths[0].outputAmount.amount).toEqual(0n);
        });
        test('Weighted: SOR should not find path for join swap with exit fee hook used - GIVEN OUT', async () => {
            // The SOR considers pool joins and exits as potential swaps. However a pool's liquidity management struct
            // defines if unbalanced join operations are allowed. Since the exit fee hook does not allow
            // unbalanced pool operations the SOR must not find a path through a pool where unbalanced operations
            // are disallowed.

            const amountOut = BigInt(1e18);

            paths = (await sorGetPathsWithPools(
                wethToken,
                weightedBpt,
                SwapKind.GivenOut,
                amountOut,
                [prismaWeightedPool], // This pool has an exit fee hook
                protocolVersion,
            )) as PathWithAmount[];

            // The pools liquidity management disallowed unbalanced joins/exits.
            // The sor sets the output amount to 0 in this case.
            expect(paths[0].inputAmount.amount).toEqual(0n);
        });
        test('Stable: SOR should not find path for exit swap with exit fee hook used - GIVEN IN', async () => {
            // The SOR considers pool joins and exits as potential swaps. However a pool's liquidity management struct
            // defines if unbalanced join operations are allowed. Since the exit fee hook does not allow
            // unbalanced pool operations the SOR must not find a path through a pool where unbalanced operations
            // are disallowed.

            const amountIn = BigInt(1e18);

            paths = (await sorGetPathsWithPools(
                stableBpt,
                aaveFaucetUsdcToken,
                SwapKind.GivenIn,
                amountIn,
                [prismaStablePoolWithExitFee], // This pool has an exit fee hook
                protocolVersion,
            )) as PathWithAmount[];

            // The pools liquidity management disallowed unbalanced joins/exits.
            // The sor sets the output amount to 0 in this case.
            expect(paths[0].outputAmount.amount).toEqual(0n);
        });
        test('Stable: SOR should not find path for exit swap with exit fee hook used - GIVEN OUT', async () => {
            // The SOR considers pool joins and exits as potential swaps. However a pool's liquidity management struct
            // defines if unbalanced join operations are allowed. Since the exit fee hook does not allow
            // unbalanced pool operations the SOR must not find a path through a pool where unbalanced operations
            // are disallowed.

            const amountOut = BigInt(1e18);

            paths = (await sorGetPathsWithPools(
                stableBpt,
                aaveFaucetUsdcToken,
                SwapKind.GivenOut,
                amountOut,
                [prismaStablePoolWithExitFee], // This pool has an exit fee hook
                protocolVersion,
            )) as PathWithAmount[];

            // The pools liquidity management disallowed unbalanced joins/exits.
            // The sor sets the output amount to 0 in this case.
            expect(paths[0].inputAmount.amount).toEqual(0n);
        });
        test('Stable: SOR should not find path for join swap with exit fee hook used - GIVEN IN', async () => {
            // The SOR considers pool joins and exits as potential swaps. However a pool's liquidity management struct
            // defines if unbalanced join operations are allowed. Since the exit fee hook does not allow
            // unbalanced pool operations the SOR must not find a path through a pool where unbalanced operations
            // are disallowed.

            const amountIn = BigInt(1e18);

            paths = (await sorGetPathsWithPools(
                aaveFaucetUsdcToken,
                stableBpt,
                SwapKind.GivenIn,
                amountIn,
                [prismaStablePoolWithExitFee], // This pool has an exit fee hook
                protocolVersion,
            )) as PathWithAmount[];

            // The pools liquidity management disallowed unbalanced joins/exits.
            // The sor sets the output amount to 0 in this case.
            expect(paths[0].outputAmount.amount).toEqual(0n);
        });
        test('Stable: SOR should not find path for join swap with exit fee hook used - GIVEN OUT', async () => {
            // The SOR considers pool joins and exits as potential swaps. However a pool's liquidity management struct
            // defines if unbalanced join operations are allowed. Since the exit fee hook does not allow
            // unbalanced pool operations the SOR must not find a path through a pool where unbalanced operations
            // are disallowed.

            const amountOut = BigInt(1e18);

            paths = (await sorGetPathsWithPools(
                aaveFaucetUsdcToken,
                stableBpt,
                SwapKind.GivenOut,
                amountOut,
                [prismaStablePoolWithExitFee], // This pool has an exit fee hook
                protocolVersion,
            )) as PathWithAmount[];

            // The pools liquidity management disallowed unbalanced joins/exits.
            // The sor sets the output amount to 0 in this case.
            expect(paths[0].inputAmount.amount).toEqual(0n);
        });
        test('SOR quote should match swap query with directional fee hook used - GIVEN IN', async () => {
            // GIVEN IN
            const dai = new Token(
                parseFloat(chainToIdMap[BAL.token.chain]),
                aaveFaucetDai.address as Address,
                aaveFaucetDai.token.decimals,
            );
            const usdc = new Token(
                parseFloat(chainToIdMap[WETH.token.chain]),
                aaveFaucetUsdc.address as Address,
                aaveFaucetUsdc.token.decimals,
            );
            const amountIn = BigInt(1e18);

            paths = (await sorGetPathsWithPools(
                dai,
                usdc,
                SwapKind.GivenIn,
                amountIn,
                [prismaStablePoolWithDirectionalFee], //both pools have hooks.
                protocolVersion,
            )) as PathWithAmount[];

            const swapPaths: Path[] = paths.map((path) => ({
                protocolVersion,
                inputAmountRaw: path.inputAmount.amount,
                outputAmountRaw: path.outputAmount.amount,
                tokens: path.tokens.map((token) => ({
                    address: token.address,
                    decimals: token.decimals,
                })),
                pools: path.pools.map((pool) => pool.id),
            }));

            // build SDK swap from SOR paths
            sdkSwap = new Swap({
                chainId: parseFloat(chainToIdMap['SEPOLIA']),
                paths: swapPaths,
                swapKind: SwapKind.GivenIn,
            });

            const returnAmountSOR = getOutputAmount(paths);
            const queryOutput = await sdkSwap.query(rpcUrl);
            const returnAmountQuery = (queryOutput as ExactInQueryOutput).expectedAmountOut;
            expect(returnAmountQuery.amount).toEqual(returnAmountSOR.amount);
        });
        test('SOR quote should match swap query with directional fee hook used - GIVEN OUT', async () => {
            // GIVEN OUT
            const dai = new Token(
                parseFloat(chainToIdMap[BAL.token.chain]),
                aaveFaucetDai.address as Address,
                aaveFaucetDai.token.decimals,
            );
            const usdc = new Token(
                parseFloat(chainToIdMap[WETH.token.chain]),
                aaveFaucetUsdc.address as Address,
                aaveFaucetUsdc.token.decimals,
            );
            const amountOut = BigInt(1e6);

            paths = (await sorGetPathsWithPools(
                dai, //tokenIn
                usdc, //tokenOut
                SwapKind.GivenOut,
                amountOut,
                [prismaStablePoolWithDirectionalFee], //both pools have hooks.
                protocolVersion,
            )) as PathWithAmount[];

            const swapPaths: Path[] = paths.map((path) => ({
                protocolVersion,
                inputAmountRaw: path.inputAmount.amount,
                outputAmountRaw: path.outputAmount.amount,
                tokens: path.tokens.map((token) => ({
                    address: token.address,
                    decimals: token.decimals,
                })),
                pools: path.pools.map((pool) => pool.id),
            }));

            // build SDK swap from SOR paths
            sdkSwap = new Swap({
                chainId: parseFloat(chainToIdMap['SEPOLIA']),
                paths: swapPaths,
                swapKind: SwapKind.GivenOut,
            });

            const returnAmountSOR = getInputAmount(paths);
            const queryOutput = await sdkSwap.query(rpcUrl);
            const returnAmountQuery = (queryOutput as ExactOutQueryOutput).expectedAmountIn;
            expect(returnAmountQuery.amount).toEqual(returnAmountSOR.amount);
        });
    });
    afterAll(async () => {
        await stopAnvilForks();
    });
});
