// yarn vitest sor-debug.test.ts
import { Chain } from '@prisma/client';
import { initRequestScopedContext, setRequestScopedContextValue } from '../context/request-scoped-context';
import { chainIdToChain } from '../network/chain-id-to-chain';
import { PoolController } from '../controllers/pool-controller';
import { TokenController } from '../controllers/token-controller';
import { sorService } from './sor.service';

describe('sor debugging', () => {
    it('sor v2', async () => {
        const useProtocolVersion = 2;
        const chain = Chain.MAINNET;

        const chainId = Object.keys(chainIdToChain).find((key) => chainIdToChain[key] === chain) as string;
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', chainId);
        //only do once before starting to debug
        // await PoolController().addPoolsV2(chain);
        // await PoolController().syncOnchainDataForAllPoolsV2(chain);
        // await PoolController().syncChangedPoolsV2(chain);
        // await PoolController().updateLiquidityValuesForActivePools(chain);

        const swaps = await sorService.getSorSwapPaths({
            chain,
            tokenIn: '0x865377367054516e17014ccded1e7d814edc9ce4', // dola
            tokenOut: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // usdc
            swapType: 'EXACT_IN',
            swapAmount: '100',
            useProtocolVersion,
            // callDataInput: {
            //     receiver: '0xb5e6b895734409Df411a052195eb4EE7e40d8696',
            //     sender: '0xb5e6b895734409Df411a052195eb4EE7e40d8696',
            //     slippagePercentage: '0.1',
            // },
        });

        console.log(swaps.returnAmount);
        expect(parseFloat(swaps.returnAmount)).toBeGreaterThan(0);
    }, 5000000);

    it('sor v3', async () => {
        const useProtocolVersion = 3;
        const chain = Chain.MAINNET;

        const chainId = Object.keys(chainIdToChain).find((key) => chainIdToChain[key] === chain) as string;
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', chainId);
        // only do once before starting to debug
        // await PoolController().reloadPoolsV3(chain);
        // await TokenController().syncErc4626Tokens(chain);
        // await TokenController().syncErc4626UnwrapRates(chain);

        // to update liquidity values, first update the token prices through a mutation
        // yarn dev; yarn mutation 'tokenReloadTokenPrices(chains: [MAINNET])' 1
        // await PoolController().updateLiquidityValuesForActivePools(chain);

        const swaps = await sorService.getSorSwapPaths({
            chain,
            tokenIn: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
            tokenOut: '0x7204b7dbf9412567835633b6f00c3edc3a8d6330', // csUSDC
            swapType: 'EXACT_IN',
            swapAmount: '1000',
            useProtocolVersion,
            // poolIds: ['0x10a04efba5b880e169920fd4348527c64fb29d4d'], // boosted
        });

        console.log(swaps.returnAmount);
        for (const route of swaps.routes) {
            for (const hop of route.hops) {
                console.log(hop.pool.address);
            }
        }
        expect(parseFloat(swaps.returnAmount)).toBeGreaterThan(0);
    }, 5000000);
});
