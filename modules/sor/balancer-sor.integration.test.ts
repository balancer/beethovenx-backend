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

// this test works with 11th deployment.
// Vault explorer is at 0xa9F171e84A95c103aD4aFAC3Ec83810f9cA193a8
// 

const protocolVersion = 3;

describe('Balancer SOR Integration Tests', () => {
    let rpcUrl: string;
    let paths: PathWithAmount[];
    let sdkSwap: Swap;
    let snapshot: Hex;
    let client: TestClient;

    beforeAll(async () => {
        // start fork to run queries against
        ({ rpcUrl } = await startFork(ANVIL_NETWORKS.SEPOLIA, undefined, BigInt(7194758)));
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
                    balance: '0.45883381704945025',
                    weight: '0.5',
                }),
            });
            const BAL = prismaPoolTokenFactory.build({
                address: '0xb19382073c7a0addbb56ac6af1808fa49e377b75',
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '545.3163082215016',
                    weight: '0.5',
                }),
            });
            const prismaWeightedPool = prismaPoolFactory.build({
                address: '0x2ff3b96e0057a1f25f1d62ab800554ccdb268ab8',
                type: 'WEIGHTED',
                protocolVersion,
                tokens: [WETH, BAL],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '15.811388300841580395',
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
            const poolAddress = '0x946e59e9637f44eb122fe64b372aaf6ed0441da1';
            const stataUSDC = prismaPoolTokenFactory.build({
                address: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8',
                token: { decimals: 6 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '5000',
                    priceRate: '1.0',
                }),
            });
            const stataDAI = prismaPoolTokenFactory.build({
                address: '0xff34b3d4aee8ddcd6f9afffb6fe49bd371b8a357',
                token: { decimals: 18 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '5000',
                    priceRate: '1.0',
                }),
            });
            const prismaStablePool = prismaPoolFactory.stable('1000').build({
                address: poolAddress,
                tokens: [stataUSDC, stataDAI],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '4658.364513711819743703',
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
            // Pool 1. this pool is supposed to have two stable coins
            // for deploy-11 this is 0xd63db0b88dca565633fb8d70a70b9b8093d34a7e
            // this pool is a StablePool
            const boostedPoolAddress = '0xd63db0b88dca565633fb8d70a70b9b8093d34a7e';
            stataEthUSDC = prismaPoolTokenFactory.build({
                address: '0x8a88124522dbbf1e56352ba3de1d9f78c143751e',
                token: { decimals: 6 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '40115.966516',
                    priceRate: '1.188786817374030336',
                }),
            });
            const stataEthUSDT = prismaPoolTokenFactory.build({
                address: '0x978206fae13faf5a8d293fb614326b237684b750',
                token: { decimals: 6 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '39902.990379',
                    priceRate: '1.331374983002799388',
                }),
            });
            boostedPool = prismaPoolFactory.stable('1000').build({
                address: boostedPoolAddress,
                tokens: [stataEthUSDC, stataEthUSDT],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '103653.516813821815363945',
                    swapFee: '0.001',
                }),
            });

            // Pool 2. this pool is supposed to have the BPT of pool 1 and WETH.
            const weightedPoolAddress = '0x965f7d7387d81056ebf0edaf4a869dc46471a676';
            const stataEthUSDC_stataEthUSDT_BPT = prismaPoolTokenFactory.build({
                address: '0xd63db0b88dca565633fb8d70a70b9b8093d34a7e',
                token: { decimals: 18 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '312.91923822067736',
                }),
            });
            WETH = prismaPoolTokenFactory.build({
                address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
                token: { decimals: 18 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '0.9655661351585926',
                }),
            });
            weightedPool = prismaPoolFactory.build({
                address: weightedPoolAddress,
                tokens: [stataEthUSDC_stataEthUSDT_BPT, WETH],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '17.378968946746477877',
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
            const poolAddress = '0xd63db0b88dca565633fb8d70a70b9b8093d34a7e';
            const stataUSDC = prismaPoolTokenFactory.build({
                address: '0x8a88124522dbbf1e56352ba3de1d9f78c143751e',
                token: { decimals: 6, underlyingTokenAddress: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8' },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '40115.966516',
                    priceRate: '1.188786817374030336',
                }),
            });
            const stataDAI = prismaPoolTokenFactory.build({
                address: '0x978206fae13faf5a8d293fb614326b237684b750',
                token: { decimals: 6, underlyingTokenAddress: '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0' },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '39902.990379',
                    priceRate: '1.331374983002799388',
                }),
            });
            const prismaStablePool = prismaPoolFactory.stable('1000').build({
                address: poolAddress,
                tokens: [stataUSDC, stataDAI],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '103653.516813821815363945',
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

    describe('Pools Path with hooks -', async () => {
        // the 11th testnet deployment has pools of the following type:
        // ExitFeeHook - triggered on removeLiquidity operations
        // FeeTakingHook - 
        // DirectionalFeeHook - 
        // LotteryHook -
        
        let WETH, BAL, stataDAI, stataUSDC, aaveFaucetDai, aaveFaucetUsdc: ReturnType<typeof prismaPoolTokenFactory.build>;
        let prismaWeightedPool, prismaStablePool, prismaStablePoolWithDirectionalFee: ReturnType<typeof prismaPoolFactory.build>;
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
                name: 'ExitFee',
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

            // 11th testnet deployment the hook is at 0xD9e535a65eb38F962B84f7BBD2bf60293bA54058 
            directionalFeeHook = hookFactory.build({
                name: 'DirectionalFee',
                dynamicData: dynamicData,
                enableHookAdjustedAmounts: true,
                pools: [prismaStablePool, prismaStablePoolWithDirectionalFee],
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
                liquidityManagement: {
                    disableUnbalancedLiquidity: true,
                }
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


            //  
            aaveFaucetDai = prismaPoolTokenFactory.build({
                address: '0xff34b3d4aee8ddcd6f9afffb6fe49bd371b8a357',
                token: { decimals: 18 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '25000',
                    priceRate: '1.0',
                }),
            });

            aaveFaucetUsdc = prismaPoolTokenFactory.build({
                address: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8',
                token: { decimals: 6 },
                dynamicData: prismaPoolTokenDynamicDataFactory.build({
                    balance: '25000',
                    priceRate: '1.0',
                }),
            });

            // 11th testnet deployment this pool at is 0x676F89B5e1563Eef4D1344Dc629812b1e9c1B0d7 
            prismaStablePoolWithDirectionalFee = prismaPoolFactory.stable('1000').build({
                address: '0x676F89B5e1563Eef4D1344Dc629812b1e9c1B0d7',
                tokens: [aaveFaucetUsdc, aaveFaucetDai],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '50000',
                    swapFee: '0.001',
                }),
                hook: directionalFeeHook,

            });




        })
        test('SOR quote should match swap query with exit fee hook used', async () => {
            // The SOR considers pool joins and exits as potential swaps. However a pool's liquidity management struct
            // defines if unbalanced join operations are allowed. Since the exit fee hook does not allow
            // unbalanced pool operations the SOR must not find a path through a pool where unbalanced operations
            // are disallowed. 

            // BPT swap
            const bpt = new Token(
                parseFloat(chainToIdMap[BAL.token.chain]),
                prismaWeightedPool.address as Address,
                18,
            );
            const weth = new Token(
                parseFloat(chainToIdMap[WETH.token.chain]),
                WETH.address as Address,
                WETH.token.decimals,
            );
            const amountIn = BigInt(1e18);

            paths = (await sorGetPathsWithPools(
                bpt,
                weth,
                SwapKind.GivenIn,
                amountIn,
                [prismaWeightedPool], // This pool has an exit fee hook
                protocolVersion,
            )) as PathWithAmount[];

            // The pools liquidity management disallowed unbalanced joins/exits.
            // The sor sets the output amount to 0 in this case.
            expect(paths[0].outputAmount.amount).toEqual(0n);
        })
        test('SOR quote should match swap query with directional fee hook used', async () => {

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
        })
    });
    afterAll(async () => {
        await stopAnvilForks();
    });
});
