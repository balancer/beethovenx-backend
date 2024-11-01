// yarn vitest sor-debug.test.ts
import { Chain } from '@prisma/client';
import { initRequestScopedContext, setRequestScopedContextValue } from '../context/request-scoped-context';
import { chainIdToChain } from '../network/chain-id-to-chain';
import { PoolController } from '../controllers/pool-controller'; // Add this import statement
import { sorService } from './sor.service';

describe('sor debugging', () => {
    it('sor v2 arb eth->usdc', async () => {
        const chain = Chain.FANTOM;

        const chainId = Object.keys(chainIdToChain).find((key) => chainIdToChain[key] === chain) as string;
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', chainId);
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await poolService.loadOnChainDataForAllPools();
        // await poolService.updateLiquidityValuesForPools();

        const swaps = await sorService.getSorSwapPaths({
            chain,
            tokenIn: '0xf24bcf4d1e507740041c9cfd2dddb29585adce1e', // BAL
            tokenOut: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // WETH
            swapType: 'EXACT_IN',
            swapAmount: '1',
            queryBatchSwap: false,
            // useProtocolVersion: 2,
            // callDataInput: {
            //     receiver: '0xb5e6b895734409Df411a052195eb4EE7e40d8696',
            //     sender: '0xb5e6b895734409Df411a052195eb4EE7e40d8696',
            //     slippagePercentage: '0.1',
            // },
        });

        console.log(swaps.returnAmount);
        expect(parseFloat(swaps.returnAmount)).toBeGreaterThan(0);
    }, 5000000);

    it('sor v3 sepolia eth->usdc', async () => {
        const chain = Chain.SEPOLIA;

        const chainId = Object.keys(chainIdToChain).find((key) => chainIdToChain[key] === chain) as string;
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', chainId);
        //only do once before starting to debug
        await PoolController().reloadPoolsV3(chain);

        const swaps = await sorService.getSorSwapPaths({
            chain,
            tokenIn: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8', // USDC (aave)
            tokenOut: '0xff34b3d4aee8ddcd6f9afffb6fe49bd371b8a357', // DAI (aave)
            swapType: 'EXACT_IN',
            swapAmount: '1',
            queryBatchSwap: false,
            useProtocolVersion: 3,
            // callDataInput: {
            //     receiver: '0xb5e6b895734409Df411a052195eb4EE7e40d8696',
            //     sender: '0xb5e6b895734409Df411a052195eb4EE7e40d8696',
            //     slippagePercentage: '0.1',
            // },
        });

        console.log(swaps.returnAmount);
        for (const route of swaps.routes) {
            for (const hop of route.hops) {
                console.log(hop.pool.address);
            }
        }
        expect(parseFloat(swaps.returnAmount)).toBeGreaterThan(0);
    }, 5000000);

    it('sor v2 fantom gyro', async () => {
        const chain = Chain.FANTOM;

        const chainId = Object.keys(chainIdToChain).find((key) => chainIdToChain[key] === chain) as string;
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', chainId);
        //only do once before starting to debug
        // await PoolController().syncOnchainDataForPoolsV2(chain, [
        //     '0xff236989201b0f2691c3208af68d15c6d79ce8a7000200000000000000000903',
        // ]);
        // await PoolController().updateLiquidityValuesForActivePools(chain);

        const SFTMX = '0xd7028092c830b5c8fce061af2e593413ebbc1fc1';
        const WFTM = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83';
        const USDCE = '0x2f733095b80a04b38b0d10cc884524a3d09b836a';

        // const swapPaths = await sorService.getSorSwapPaths({
        //     chain,
        //     tokenIn: WFTM,
        //     tokenOut: USDCE,
        //     swapType: 'EXACT_IN',
        //     swapAmount: '10000',
        //     queryBatchSwap: false,
        //     useProtocolVersion: 2,
        //     // callDataInput: {
        //     //     receiver: '0xb5e6b895734409Df411a052195eb4EE7e40d8696',
        //     //     sender: '0xb5e6b895734409Df411a052195eb4EE7e40d8696',
        //     //     slippagePercentage: '0.1',
        //     // },
        // });

        const swaps = await sorService.getSorSwaps({
            chain,
            tokenIn: WFTM,
            tokenOut: USDCE,
            swapType: 'EXACT_IN',
            swapAmount: '10000',
            // queryBatchSwap: false,
            // useProtocolVersion: 3,
            // callDataInput: {
            //     receiver: '0xb5e6b895734409Df411a052195eb4EE7e40d8696',
            //     sender: '0xb5e6b895734409Df411a052195eb4EE7e40d8696',
            //     slippagePercentage: '0.1',
            // },
            swapOptions: {
                maxPools: 8,
            },
        });

        for (const route of swaps.routes) {
            for (const hop of route.hops) {
                if (hop.pool.id === '0xff236989201b0f2691c3208af68d15c6d79ce8a7000200000000000000000903') {
                    console.log(`ECLP`);
                }
            }
        }
        expect(parseFloat(swaps.returnAmount)).toBeGreaterThan(0);
        console.log(swaps.returnAmount);
    }, 5000000);
});
