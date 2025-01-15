// yarn vitest balancer-v2-sor.integration.test.ts

import { ExactInQueryOutput, Swap, SwapKind, Token, Address, Path } from '@balancer/sdk';

import { PathWithAmount } from '../path';
import { sorGetPathsWithPools } from '../static';
import { getOutputAmount } from '../utils/helpers';
import { chainToChainId as chainToIdMap } from '../../../../network/chain-id-to-chain';

import { ANVIL_NETWORKS, startFork, stopAnvilForks } from '../../../../../test/anvil/anvil-global-setup';
import { prismaPoolDynamicDataFactory, prismaPoolFactory, prismaPoolTokenFactory } from '../../../../../test/factories';
import { createTestClient, Hex, http, TestClient } from 'viem';
import { sepolia } from 'viem/chains';

/**
 * Test Data:
 *
 * In order to properly compare SOR quotes vs SDK queries, we need to setup test data from a specific blockNumber.
 * Although the API does not provide that functionality, we can use subgraph to achieve it.
 * These tests run against [BalancerV2 subgraph](https://thegraph.com/explorer/subgraphs/C4ayEZP2yTXRAB8vSaTrgN4m9anTe9Mdm2ViyiAuV9TV?view=Query)
 * TODO: improve test data setup by creating a script that fetches all necessary data automatically for a given blockNumber.
 */

const protocolVersion = 2;

describe('Balancer V2 SOR Integration Tests', () => {
    let rpcUrl: string;
    let paths: PathWithAmount[];
    let sdkSwap: Swap;
    let snapshot: Hex;
    let client: TestClient;

    beforeAll(async () => {
        // start fork to run queries against
        ({ rpcUrl } = await startFork(ANVIL_NETWORKS.GNOSIS_CHAIN));
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

    describe('Weighted Pool Path - Token with 0 decimals', () => {
        beforeAll(async () => {
            // setup mock pool data
            const wxDAI = prismaPoolTokenFactory.build({
                address: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
                balance: '1818.053229398448550484',
                weight: '0.5',
            });
            const MPS = prismaPoolTokenFactory.build({
                address: '0xfa57aa7beed63d03aaf85ffd1753f5f6242588fb',
                balance: '437',
                weight: '0.5',
                token: {
                    decimals: 0,
                },
            });
            const prismaWeightedPool = prismaPoolFactory.build({
                id: '0x4bcf6b48906fa0f68bea1fc255869a41241d4851000200000000000000000021',
                address: '0x4bcf6b48906fa0f68bea1fc255869a41241d4851',
                type: 'WEIGHTED',
                protocolVersion,
                tokens: [wxDAI, MPS],
                dynamicData: prismaPoolDynamicDataFactory.build({
                    totalShares: '1551.518323760171904919',
                    swapFee: '0.03',
                }),
                chain: 'GNOSIS',
            });

            // get SOR paths
            const tIn = new Token(parseFloat(chainToIdMap['GNOSIS']), wxDAI.address as Address, wxDAI.token.decimals);
            const tOut = new Token(parseFloat(chainToIdMap['GNOSIS']), MPS.address as Address, MPS.token.decimals);
            const amountIn = BigInt(1e18);
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
                chainId: parseFloat(chainToIdMap['GNOSIS']),
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
});
