// yarn vitest poolsV2/stable/stablePool.integration.test.ts

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

import { ExactInQueryOutput, Swap, SwapKind, Token, Address, Path } from '@balancer/sdk';

import { createTestClient, Hex, http, TestClient } from 'viem';
import { mainnet } from 'viem/chains';

import { PathWithAmount } from '../../path';
import { sorGetPathsWithPools } from '../../static';
import { getOutputAmount } from '../../utils/helpers';
import { chainToChainId } from '../../../../../network/chain-id-to-chain';
import { ANVIL_NETWORKS, startFork } from '../../../../../../test/anvil/anvil-global-setup';
import {
    prismaPoolDynamicDataFactory,
    prismaPoolFactory,
    prismaPoolTokenFactory,
} from '../../../../../../test/factories';
import { Chain } from '@prisma/client';

const protocolVersion = 2;

describe('Balancer SOR Integration Tests', () => {
    let rpcUrl: string;
    let paths: PathWithAmount[];
    let sdkSwap: Swap;
    let snapshot: Hex;
    let client: TestClient;

    beforeAll(async () => {
        // start fork to run queries against
        ({ rpcUrl } = await startFork(ANVIL_NETWORKS.MAINNET));
        client = createTestClient({
            mode: 'anvil',
            chain: mainnet,
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

    describe('Stable Pool Path', () => {
        beforeAll(async () => {
            // setup mock pool data for a stable pool
            const poolAddress = '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6';
            const DOLA = prismaPoolTokenFactory.build({
                address: '0x865377367054516e17014ccded1e7d814edc9ce4',
                balance: '2767570.699080547814532726',
                priceRate: '1',
            });
            const USDC = prismaPoolTokenFactory.build({
                address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                token: { decimals: 6 },
                balance: '1207675.308342',
                priceRate: '1',
            });
            const prismaStablePool = prismaPoolFactory.stable('200').build({
                chain: Chain.MAINNET,
                id: '0xff4ce5aaab5a627bf82f4a571ab1ce94aa365ea6000200000000000000000426',
                address: poolAddress,
                tokens: [DOLA, USDC],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '3950733.111397308216047101',
                    swapFee: '0.0004',
                }),
            });

            // get SOR paths
            const tIn = new Token(
                parseFloat(chainToChainId[DOLA.token.chain]),
                DOLA.address as Address,
                DOLA.token.decimals,
            );
            const tOut = new Token(
                parseFloat(chainToChainId[USDC.token.chain]),
                USDC.address as Address,
                USDC.token.decimals,
            );
            const amountIn = BigInt(100e18);
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
                chainId: parseFloat(chainToChainId['MAINNET']),
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
