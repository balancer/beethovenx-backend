import exp from 'constants';
import { initRequestScopedContext, setRequestScopedContextValue } from '../context/request-scoped-context';
import { poolService } from '../pool/pool.service';
import { userService } from '../user/user.service';
import { tokenService } from '../token/token.service';
import mainnet from '../../config/mainnet';
import { prisma } from '../../prisma/prisma-client';
import { CowAmmController } from '../controllers/cow-amm-controller';
import { ContentController } from '../controllers/content-controller';
import { chainToIdMap } from '../network/network-config';
import { PoolController } from '../controllers';
import { GqlPoolComposableStable, GqlPoolStable } from '../../schema';
describe('pool debugging', () => {
    it('query pools', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '11155111');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await poolService.syncChangedPools();
        // await tokenService.updateTokenPrices(['MAINNET']);
        // await PoolController().reloadPoolsV3('SEPOLIA');

        // const allAggPools = await poolService.getAggregatorPools({
        //     where: { chainIn: ['SEPOLIA'], protocolVersionIn: [3] },
        // });

        // console.log(allAggPools.length);

        const allPools = await poolService.getGqlPools({
            where: { chainIn: ['SEPOLIA'], protocolVersionIn: [3] },
        });

        console.log(allPools.length);
        for (const pool of allPools) {
            console.log(pool.id);
            console.log(pool.hasErc4626);
            console.log(pool.hasNestedErc4626);
        }

        // const poolAfterNewSync = await poolService.getGqlPool('0x8fc07bcf9b88ace84c7523248dc4a85f638c9536', 'SEPOLIA');

        // expect(poolAfterNewSync.dynamicData.isPaused).toBe(true);
    }, 5000000);

    it('sync pools', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '10');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await poolService.syncChangedPools();
        // await tokenService.updateTokenPrices(['MAINNET']);
        // await PoolController().reloadPoolsV3('SEPOLIA');

        // const allPools = await poolService.getGqlPools({ where: { chainIn: ['SEPOLIA'], protocolVersionIn: [3] } });
        await PoolController().syncOnchainDataForPoolsV2('FANTOM', [
            '0x593000b762de3c465855336e95c8bb46080af064000000000000000000000760',
        ]);
        const stablev3 = (await poolService.getGqlPool(
            '0x711fd80b36723bce3b42ad6622903e1e39d911dd',
            'SEPOLIA',
        )) as GqlPoolStable;
        const stablev2 = (await poolService.getGqlPool(
            '0x593000b762de3c465855336e95c8bb46080af064000000000000000000000760',
            'FANTOM',
        )) as GqlPoolComposableStable;

        console.log(stablev3.bptPriceRate);
        console.log(stablev2.bptPriceRate);

        // const poolAfterNewSync = await poolService.getGqlPool('0x8fc07bcf9b88ace84c7523248dc4a85f638c9536', 'SEPOLIA');

        // expect(poolAfterNewSync.dynamicData.isPaused).toBe(true);
    }, 5000000);

    it('sync aprs', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '250');
        // //only do once before starting to debug
        // // await poolService.syncAllPoolsFromSubgraph();
        // await userService.initWalletBalancesForAllPools();
        // await poolService.reloadStakingForAllPools(['GAUGE'], 'MAINNET');
        // await userService.initStakedBalances(['GAUGE']);
        // // await CowAmmController().reloadPools('MAINNET');
        // // await CowAmmController().syncSwaps('1');
        // // await tokenService.updateTokenPrices(['MAINNET']);
        // await poolService.syncStakingForPools(['MAINNET']);
        await poolService.updatePoolAprs('FANTOM');
        const aprs = await prisma.prismaPoolAprItem.findMany({
            where: { chain: 'FANTOM', poolId: '0x593000b762de3c465855336e95c8bb46080af064000000000000000000000760' },
        });
        console.log(aprs);
        const pool = await poolService.getGqlPool(
            '0x593000b762de3c465855336e95c8bb46080af064000000000000000000000760',
            'FANTOM',
        );
        expect(pool.dynamicData.aprItems).toBeDefined();
        expect(pool.dynamicData.aprItems.length).toBeGreaterThan(0);

        // await poolService.updatePoolAprs('MAINNET');
        // expect(aprs[0].apr).toBeGreaterThan(0);
    }, 5000000);

    it('get new apr items', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '1');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await poolService.updatePoolAprs('ARBITRUM');
        await poolService.reloadAllPoolAprs('MAINNET');
        const pool = await poolService.getGqlPool('0xf08d4dea369c456d26a3168ff0024b904f2d8b91', 'MAINNET');
        expect(pool.dynamicData.aprItems).toBeDefined();
        expect(pool.dynamicData.aprItems.length).toBeGreaterThan(0);
    }, 5000000);

    it('get types in pooltokens', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '42161');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        const pool = await poolService.getGqlPool(
            '0x2ce4457acac29da4736ae6f5cd9f583a6b335c270000000000000000000004dc',
            'ARBITRUM',
        );
        expect(pool.poolTokens[0].isAllowed).toBeDefined();
        expect(pool.poolTokens[0].isAllowed).toBeTruthy();

        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '10');
        const poolOp = await poolService.getGqlPool(
            '0xd4156a7a7e85d8cb2de2932807d8d5f08d05a88900020000000000000000011c',
            'OPTIMISM',
        );
        expect(poolOp.poolTokens[0].isAllowed).toBeDefined();
        expect(poolOp.poolTokens[0].isAllowed).toBeTruthy();
        expect(poolOp.poolTokens[1].isAllowed).toBeDefined();
        expect(poolOp.poolTokens[1].isAllowed).toBeFalsy();

        const poolOpBpt = await poolService.getGqlPool(
            '0x5f8893506ddc4c271837187d14a9c87964a074dc000000000000000000000106',
            'OPTIMISM',
        );
        expect(poolOpBpt.poolTokens[0].isAllowed).toBeDefined();
        expect(poolOpBpt.poolTokens[0].isAllowed).toBeTruthy();
        expect(poolOpBpt.poolTokens[1].isAllowed).toBeDefined();
        expect(poolOpBpt.poolTokens[1].isAllowed).toBeTruthy();
        expect(poolOpBpt.poolTokens[2].isAllowed).toBeDefined();
        expect(poolOpBpt.poolTokens[2].isAllowed).toBeTruthy();
        expect(poolOpBpt.poolTokens[3].isAllowed).toBeDefined();
        expect(poolOpBpt.poolTokens[3].isAllowed).toBeTruthy();
    }, 5000000);

    it('sync aura staking', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '1');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await poolService.loadOnChainDataForAllPools();
        await poolService.reloadStakingForAllPools(['AURA'], 'MAINNET');
        const pool = await poolService.getGqlPool(
            '0xcfca23ca9ca720b6e98e3eb9b6aa0ffc4a5c08b9000200000000000000000274',
            'MAINNET',
        );
        expect(pool.staking).toBeDefined();
        expect(pool.staking?.aura).toBeDefined();
        expect(pool.staking?.aura?.apr).toBeGreaterThan(0);
        expect(pool.staking?.aura?.auraPoolAddress).toBe('0x1204f5060be8b716f5a62b4df4ce32acd01a69f5');
    }, 5000000);

    it('sync gauge staking on l2', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '10');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await poolService.loadOnChainDataForAllPools();
        await poolService.reloadStakingForAllPools(['GAUGE'], 'OPTIMISM');
        const pool = await poolService.getGqlPool(
            '0x39965c9dab5448482cf7e002f583c812ceb53046000100000000000000000003',
            'OPTIMISM',
        );
        expect(pool.staking).toBeDefined();
    }, 5000000);

    it('sync gauge staking for cow', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '1');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await poolService.loadOnChainDataForAllPools();
        await poolService.reloadStakingForAllPools(['GAUGE'], 'MAINNET');
        const pool = await poolService.getGqlPool('0xc9d5204e7c04a1be300b33e3979479be75132ac5', 'MAINNET');
        expect(pool.staking).toBeDefined();
    }, 5000000);

    it('sync user staking', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '1');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await poolService.loadOnChainDataForAllPools();
        // await userService.initWalletBalancesForAllPools();
        await poolService.reloadStakingForAllPools(['AURA'], 'MAINNET');
        // await userService.initStakedBalances(['AURA']);

        // await userService.syncChangedStakedBalances();

        const pool = await poolService.getGqlPool(
            '0xcfca23ca9ca720b6e98e3eb9b6aa0ffc4a5c08b9000200000000000000000274',
            'MAINNET',
            '0xc9cea7a3984cefd7a8d2a0405999cb62e8d206dc',
        );
        expect(pool.staking).toBeDefined();
        expect(pool.staking?.aura).toBeDefined();
        expect(pool.staking?.aura?.apr).toBeGreaterThan(0);
        expect(pool.staking?.aura?.auraPoolAddress).toBe('0x1204f5060be8b716f5a62b4df4ce32acd01a69f5');
        expect(pool.staking?.aura?.auraPoolId).toBe('100');
        expect(pool.staking?.aura?.isShutdown).toBe(false);

        // expect(pool.userBalance).toBeDefined();
        // expect(pool.userBalance?.totalBalance).not.toBe('0');
        // expect(pool.userBalance?.totalBalanceUsd).toBeGreaterThan(0);
        // expect(pool.userBalance?.walletBalance).toEqual('0');
        // expect(pool.userBalance?.walletBalanceUsd).toEqual(0);
        // expect(pool.userBalance?.stakedBalances.length).toBeGreaterThan(0);
    }, 5000000);

    it('debug vebal staking', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '1');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await poolService.loadOnChainDataForAllPools();
        // await userService.initWalletBalancesForAllPools();
        // await userService.initStakedBalances(['AURA']);
        await poolService.reloadStakingForAllPools(['VEBAL'], 'MAINNET');

        await userService.syncChangedStakedBalances();

        const pool = await poolService.getGqlPool(
            '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
            'MAINNET',
            '0xd86a11b0c859c18bfc1b4acd072c5afe57e79438',
        );
        expect(pool.staking).toBeDefined();
        expect(pool.staking?.vebal).toBeDefined();
        expect(pool.staking?.vebal?.vebalAddress).toBe(mainnet.veBal?.address);

        expect(pool.userBalance).toBeDefined();
        expect(pool.userBalance?.totalBalance).not.toBe('0');
        expect(pool.userBalance?.totalBalanceUsd).toBeGreaterThan(0);
        expect(pool.userBalance?.walletBalance).not.toBe('0');
        expect(pool.userBalance?.walletBalanceUsd).toBeGreaterThan(0);
        expect(pool.userBalance?.stakedBalances.length).toBeGreaterThan(0);
    }, 5000000);

    it('debug user staking', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '42161');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await poolService.loadOnChainDataForAllPools();
        // await userService.initWalletBalancesForAllPools();
        await poolService.syncStakingForPools(['ARBITRUM']);
        // await userService.initStakedBalances(['AURA']);

        await userService.syncChangedStakedBalances();

        const pool = await poolService.getGqlPool(
            '0xc7fa3a3527435720f0e2a4c1378335324dd4f9b3000200000000000000000459',
            'ARBITRUM',
            '0xbee21365a462b8df12cfe9ab7c40f1bb5f5ed495',
        );
        expect(pool.staking).toBeDefined();
        expect(pool.staking?.aura).toBeDefined();
        expect(pool.staking?.aura?.apr).toBeGreaterThan(0);
        // expect(pool.staking?.aura?.auraPoolAddress).toBe('0x1204f5060be8b716f5a62b4df4ce32acd01a69f5');

        expect(pool.userBalance).toBeDefined();
        expect(pool.userBalance?.totalBalance).not.toBe('0');
        expect(pool.userBalance?.totalBalanceUsd).toBeGreaterThan(0);
        expect(pool.userBalance?.walletBalance).toEqual('0');
        expect(pool.userBalance?.walletBalanceUsd).toEqual(0);
        expect(pool.userBalance?.stakedBalances.length).toBeGreaterThan(0);
    }, 5000000);

    it('sync tvl', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '250');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await tokenService.syncTokenContentData();
        // await poolService.loadOnChainDataForAllPools();
        // await tokenService.updateTokenPrices(['FANTOM']);
        await poolService.updateLiquidityValuesForPools();
        const pool = await poolService.getGqlPool(
            '0x80a02eb6c4197e571129657044b0cc41d6517b5a00010000000000000000084b',
            'FANTOM',
        );
        expect(pool.dynamicData.totalLiquidity).not.toBe('0');
    }, 5000000);

    it('delete and sync pools', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '252');

        await prisma.prismaPool.deleteMany({
            where: { chain: 'FRAXTAL' },
        });

        let pools = await poolService.getGqlPools({ where: { chainIn: ['FRAXTAL'] } });

        expect(pools.length).toBe(0);

        await poolService.syncAllPoolsFromSubgraph();
        await poolService.initOnChainDataForAllPools();
        await poolService.reloadStakingForAllPools(['GAUGE'], 'FRAXTAL');
        await userService.initWalletBalancesForAllPools();
        await userService.initStakedBalances(['GAUGE']);

        pools = await poolService.getGqlPools({ where: { chainIn: ['FRAXTAL'] } });

        expect(pools.length).toBeGreaterThan(0);

        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // await poolService.syncChangedPools();
    }, 5000000);
});
