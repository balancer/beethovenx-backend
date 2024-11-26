// yarn vitest balancer-sor.integration.test.ts

import { ExactInQueryOutput, Swap, SwapKind, Token, Address, Path, RemoveLiquidity, RemoveLiquiditySingleTokenExactInInput, RemoveLiquidityConfig, RemoveLiquidityInput, PoolState, RemoveLiquidityKind, BalancerApi, InputAmount } from '@balancer/sdk';

import { PathWithAmount } from './sorV2/lib/path';
import { sorGetPathsWithPools } from './sorV2/lib/static';
import { getOutputAmount } from './sorV2/lib/utils/helpers';
import { chainToIdMap } from '../network/network-config';

import { ANVIL_NETWORKS, startFork, stopAnvilForks } from '../../test/anvil/anvil-global-setup';
import {
    prismaPoolDynamicDataFactory,
    prismaPoolFactory,
    prismaPoolTokenDynamicDataFactory,
    prismaPoolTokenFactory,
    hookDataFactory,
    hookFactory
} from '../../test/factories';
import { createTestClient, formatEther, Hex, http, parseEther, TestClient } from 'viem';
import { sepolia } from 'viem/chains';

/**
 * Test Data:
 *
 * In order to properly compare SOR quotes vs SDK queries, we need to setup test data from a specific blockNumber.
 * Although the API does not provide that functionality, we can use subgraph to achieve it.
 * These tests run against the 10th testnet deployment and these are their respective subgraphs:
 * - data common to all pools: [balancer subgraph](https://api.studio.thegraph.com/query/31386/balancer-v3-sepolia-10th/version/latest/graphql)
 *   - tokens (address, balance, decimals)
 *   - totalShares
 *   - swapFee
 * - data specific to each pool type: [pools subgraph](https://api.studio.thegraph.com/proxy/31386/balancer-pools-v3-sepolia-6th/version/latest/graphql)
 *   - weight
 *   - amp
 * The only item missing from subgraph is priceRate, which can be fetched from a Tenderly simulation (getPoolTokenRates)
 * against the VaultExplorer contract (0x376Fe27C7745e35F6b825eF14Cc1EF8169816883).
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
        ({ rpcUrl } = await startFork(ANVIL_NETWORKS.SEPOLIA, undefined, BigInt(7116463)));
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
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '0.100876256763327071',
                    weight: '0.5',
                }),
            });
            const BAL = prismaPoolTokenFactory.build({
                address: '0xb19382073c7a0addbb56ac6af1808fa49e377b75',
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '100.123907421197983061',
                    weight: '0.5',
                }),
            });
            const prismaWeightedPool = prismaPoolFactory.build({
                address: '0x5e54dad6c2504d63473f95d8025b763fd5b893c6',
                type: 'WEIGHTED',
                protocolVersion,
                tokens: [WETH, BAL],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '3.177970855154274761',
                    swapFee: '0.01',
                }),
            });

            // get SOR paths
            const tIn = new Token(parseFloat(chainToIdMap['SEPOLIA']), BAL.address as Address, 18);
            const tOut = new Token(parseFloat(chainToIdMap['SEPOLIA']), WETH.address as Address, 18);
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
            const poolAddress = '0x7A55d460D9CeeFeaf65b8Ddfa65bDc8c8d7CF419';
            const stataUSDC = prismaPoolTokenFactory.build({
                address: '0x8A88124522dbBF1E56352ba3DE1d9F78C143751e',
                token: { decimals: 6 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '2.62717',
                    priceRate: '1.0',
                }),
            });
            const stataDAI = prismaPoolTokenFactory.build({
                address: '0xDE46e43F46ff74A23a65EBb0580cbe3dFE684a17',
                token: { decimals: 18 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '2.537567543236599587',
                    priceRate: '1.0',
                }),
            });
            const prismaStablePool = prismaPoolFactory.stable('1000').build({
                address: poolAddress,
                tokens: [stataUSDC, stataDAI],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '5.164348866290856965',
                    swapFee: '0.01',
                }),
            });

            // get SOR paths
            const tIn = new Token(
                parseFloat(chainToIdMap[stataUSDC.token.chain]),
                stataUSDC.address as Address,
                stataUSDC.token.decimals,
            );
            const tOut = new Token(
                parseFloat(chainToIdMap[stataDAI.token.chain]),
                stataDAI.address as Address,
                stataDAI.token.decimals,
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
            // Pool 1. this pool is supposed to have a staticAToken and a staticAToken
            // for deploy-10 this is 0x9a80f41e59af098ac33650d67496f865bb91a2ce
            // this pool is a StablePool (Since 2 yb tokens it is a boosted pool)
            const boostedPoolAddress = '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8';
            stataEthUSDC = prismaPoolTokenFactory.build({
                address: '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8',
                token: { decimals: 6 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '50091.839731',
                    priceRate: '1.0',
                }),
            });
            const stataEthUSDT = prismaPoolTokenFactory.build({
                address: '0x978206fAe13faF5a8d293FB614326B237684B750',
                token: { decimals: 6 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '50078.509111',
                    priceRate: '1.0',
                }),
            });
            boostedPool = prismaPoolFactory.stable('1000').build({
                address: boostedPoolAddress,
                tokens: [stataEthUSDC, stataEthUSDT],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '119958.009182131689809926',
                    swapFee: '0.01',
                }),
            });

            // Pool 2. this pool is supposed to have the BPT of pool 1 and WETH.
            const weightedPoolAddress = '0x0270dAf4Ee12cCb1ABc8Aa365054eecb1B7f4f6b';
            const stataEthUSDC_stataEthUSDT_BPT = prismaPoolTokenFactory.build({
                address: '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8',
                token: { decimals: 18 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '254.950119747973464503',
                }),
            });
            WETH = prismaPoolTokenFactory.build({
                address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
                token: { decimals: 18 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '0.098077542761481614',
                }),
            });
            weightedPool = prismaPoolFactory.build({
                address: weightedPoolAddress,
                tokens: [stataEthUSDC_stataEthUSDT_BPT, WETH],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '4.999999999999899965',
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
                const amountIn = BigInt(10000e6);
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
            const poolAddress = '0x7A55d460D9CeeFeaf65b8Ddfa65bDc8c8d7CF419';
            const stataUSDC = prismaPoolTokenFactory.build({
                address: '0x8A88124522dbBF1E56352ba3DE1d9F78C143751e',
                token: { decimals: 6, underlyingTokenAddress: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8' },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '2.62717',
                    priceRate: '1.0',
                }),
            });
            const stataDAI = prismaPoolTokenFactory.build({
                address: '0xDE46e43F46ff74A23a65EBb0580cbe3dFE684a17',
                token: { decimals: 18, underlyingTokenAddress: '0xff34b3d4aee8ddcd6f9afffb6fe49bd371b8a357' },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '2.537567543236599587',
                    priceRate: '1.0',
                }),
            });
            const prismaStablePool = prismaPoolFactory.stable('1000').build({
                address: poolAddress,
                tokens: [stataUSDC, stataDAI],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '5.164348866290856965',
                    swapFee: '0.01',
                }),
            });

            // get SOR paths
            const tIn = new Token(
                parseFloat(chainToIdMap[stataUSDC.token.chain]),
                stataUSDC.token.underlyingTokenAddress as Address, // USDC
                stataUSDC.token.decimals,
            );
            const tOut = new Token(
                parseFloat(chainToIdMap[stataDAI.token.chain]),
                stataDAI.token.underlyingTokenAddress as Address, // DAI
                stataDAI.token.decimals,
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

    describe('Pools Path with hooks', async () => {
        // the 10th testnet deployment has pools of the following type:
        // ExitFeeHook - triggered on removeLiquidity operations
        // FeeTakingHook - 
        // DirectionalFeeHook - 
        // LotteryHook -
        
        let WETH, BAL, stataDAI, stataUSDC: ReturnType<typeof prismaPoolTokenFactory.build>;
        let prismaWeightedPool, prismaStablePool: ReturnType<typeof prismaPoolFactory.build>;
        let exitFeeHook, directionalFeeHook: ReturnType<typeof hookFactory.build>;

        beforeAll(async() => {
            // setup mock pool data - Weighted
            WETH = prismaPoolTokenFactory.build({
                address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '0.005',
                    weight: '0.5',
                }),
            });
            BAL = prismaPoolTokenFactory.build({
                address: '0xb19382073c7a0addbb56ac6af1808fa49e377b75',
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '5',
                    weight: '0.5',
                }),
            });
            stataDAI = prismaPoolTokenFactory.build({
                address: '0xde46e43f46ff74a23a65ebb0580cbe3dfe684a17',
                token: { decimals: 18 },
            });
            stataUSDC = prismaPoolTokenFactory.build({
                address: '0x8a88124522dbbf1e56352ba3de1d9f78c143751e',
                token: { decimals: 6 },
            });
            const dynamicData = {
                // Add any specific dynamic data parameters here
                addLiquidityFeePercentage: '0.01',
                removeLiquidityFeePercentage: '0.01',
                swapFeePercentage: '0.01'
            };
            exitFeeHook = hookFactory.build({
                name: 'ExitFeeHook',
                dynamicData: dynamicData,
                enableHookAdjustedAmounts: true,
                pools: [prismaWeightedPool],
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
            directionalFeeHook = hookFactory.build({
                name: 'DirectionalFeeHook',
                dynamicData: dynamicData,
                enableHookAdjustedAmounts: true,
                pools: [prismaStablePool],
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
                address: '0x75f49d54978d08e4e76a873da6c78e8f6b2901c2',
                type: 'WEIGHTED',
                protocolVersion,
                tokens: [WETH, BAL],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '0.158113883008415798',
                    swapFee: '0.01',
                }),
                hook: exitFeeHook,
            });
            prismaStablePool = prismaPoolFactory.stable('1000').build({
                address: '0x7A55d460D9CeeFeaf65b8Ddfa65bDc8c8d7CF419',
                tokens: [stataUSDC, stataDAI],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '1094.497798261138107409',
                    swapFee: '0.01',
                }),
                hook: exitFeeHook,
            });
        })
        test.only('SOR quote should match swap query with hooks', async () => {
            // This test does not trigger the ExitFeeHook, as the ExitFee is
            // applied on RemoveLiquidity operations
            const tIn = new Token(
                parseFloat(chainToIdMap[BAL.token.chain]),
                BAL.address as Address,
                BAL.token.decimals,
            );
            const tOut = new Token(
                parseFloat(chainToIdMap[WETH.token.chain]),
                WETH.address as Address,
                WETH.token.decimals,
            );
            const amountIn = BigInt(1e18);
            paths = (await sorGetPathsWithPools(
                tIn,
                tOut,
                SwapKind.GivenIn,
                amountIn,
                [prismaStablePool, prismaWeightedPool], //both pools have hooks.
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
        test.only('SOR quote should match swap query with hook logic used', async () => {
            // This test applies the hook logic, as a BPT -> Token Swap will trigger
            // a RemoveLiquidity operation. 
            const tIn = new Token(
                parseFloat('11155111'),
                prismaWeightedPool.address as Address,
                prismaWeightedPool.decimals,
            );
            const tOut = new Token(
                parseFloat(chainToIdMap[WETH.token.chain]),
                WETH.address as Address,
                WETH.token.decimals,
            );
            const amountIn = BigInt(1e18);
            paths = (await sorGetPathsWithPools(
                tIn,
                tOut,
                SwapKind.GivenIn,
                amountIn,
                [prismaWeightedPool],
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
    });
    afterAll(async () => {
        await stopAnvilForks();
    });
});
