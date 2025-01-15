// yarn vitest stablePool.test.ts

import { parseEther, parseUnits } from 'viem';

import { PrismaPoolAndHookWithDynamic } from '../../../../../../prisma/prisma-types';
import { WAD } from '../../utils/math';
import { StablePoolV3 } from './stablePool';

import { Token, TokenAmount } from '@balancer/sdk';

// keep factories imports at the end - moving up will break the test
import {
    poolTokenFactory,
    prismaPoolDynamicDataFactory,
    prismaPoolFactory,
    prismaPoolTokenFactory,
    hookFactory,
} from '../../../../../../test/factories';
import { createRandomAddress } from '../../../../../../test/utils';

describe('SOR V3 Stable Pool Tests', () => {
    let amp: string;
    let scalingFactors: bigint[];
    let aggregateSwapFee: bigint;
    let stablePool: StablePoolV3;
    let stablePoolWithHook: StablePoolV3;
    let stablePrismaPool: PrismaPoolAndHookWithDynamic;
    let stablePrismaPoolWithHook: PrismaPoolAndHookWithDynamic;
    let swapFee: string;
    let tokenAddresses: string[];
    let tokenBalances: string[];
    let tokenDecimals: number[];
    let tokenRates: string[];
    let totalShares: string;
    let poolAddress: string;

    beforeAll(() => {
        swapFee = '0.001';
        tokenBalances = ['52110', '51290'];
        tokenDecimals = [6, 18];
        tokenRates = ['1', '1'];
        totalShares = '100000';
        amp = '1000';
        scalingFactors = [10n ** 12n, 10n ** 0n];
        aggregateSwapFee = 0n;
        poolAddress = createRandomAddress();

        const poolToken1 = prismaPoolTokenFactory.build({
            token: poolTokenFactory.build({ decimals: tokenDecimals[0] }),
            balance: tokenBalances[0],
            priceRate: tokenRates[0],
        });
        const poolToken2 = prismaPoolTokenFactory.build({
            token: poolTokenFactory.build({ decimals: tokenDecimals[1] }),
            balance: tokenBalances[1],
            priceRate: tokenRates[1],
        });

        tokenAddresses = [poolToken1.address, poolToken2.address];

        const hookDynamicData = {
            surgeThresholdPercentage: '0.3',
        };

        const stableSurgeHook = hookFactory.build({
            name: 'StableSurge',
            dynamicData: hookDynamicData,
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

        stablePrismaPool = prismaPoolFactory.build({
            address: poolAddress,
            type: 'STABLE',
            protocolVersion: 3,
            typeData: {
                amp,
            },
            tokens: [poolToken1, poolToken2],
            dynamicData: prismaPoolDynamicDataFactory.build({ swapFee, totalShares }),
            liquidityManagement: {
                disableUnbalancedLiquidity: true,
                enableAddLiquidityCustom: false,
                enableDonation: false,
                enableRemoveLiquidityCustom: false,
            },
        });
        stablePool = StablePoolV3.fromPrismaPool(stablePrismaPool);

        stablePrismaPoolWithHook = prismaPoolFactory.build({
            address: poolAddress,
            hook: stableSurgeHook,
            type: 'STABLE',
            protocolVersion: 3,
            typeData: {
                amp,
            },
            tokens: [poolToken1, poolToken2],
            dynamicData: prismaPoolDynamicDataFactory.build({ swapFee, totalShares }),
            liquidityManagement: {
                disableUnbalancedLiquidity: true,
                enableAddLiquidityCustom: false,
                enableDonation: false,
                enableRemoveLiquidityCustom: false,
            },
        });
        stablePoolWithHook = StablePoolV3.fromPrismaPool(stablePrismaPoolWithHook);
    });

    test('Get Pool State', () => {
        const poolState = {
            poolType: 'STABLE',
            poolAddress: poolAddress,
            swapFee: parseEther(swapFee),
            balancesLiveScaled18: tokenBalances.map((b) => parseEther(b)),
            tokenRates: tokenRates.map((r) => parseEther(r)),
            totalSupply: parseEther(totalShares),
            amp: parseUnits(amp, 3),
            tokens: tokenAddresses,
            scalingFactors,
            aggregateSwapFee,
            supportsUnbalancedLiquidity: false,
        };
        expect(poolState).toEqual(stablePool.getPoolState());
    });
    test('Get Pool State with hook', () => {
        const poolState = {
            poolType: 'STABLE',
            hookType: 'StableSurge',
            poolAddress: poolAddress,
            swapFee: parseEther(swapFee),
            balancesLiveScaled18: tokenBalances.map((b) => parseEther(b)),
            tokenRates: tokenRates.map((r) => parseEther(r)),
            totalSupply: parseEther(totalShares),
            amp: parseUnits(amp, 3),
            tokens: tokenAddresses,
            scalingFactors,
            aggregateSwapFee,
            supportsUnbalancedLiquidity: false,
        };
        expect(poolState).toEqual(stablePoolWithHook.getPoolState('StableSurge'));
    });
    test('results differ when hookState is passed', () => {
        const poolToken1 = new Token(1, stablePool.tokens[0].token.address, 18, 'pt1', 'poolToken2');

        const poolToken2 = new Token(1, stablePool.tokens[1].token.address, 18, 'pt2', 'poolToken2');

        // If given a high enough swap Amount, the pool with hookState should return a lower amount Out
        // as it charges the surge Fee.
        const tokenAmountOut = stablePool.swapGivenIn(
            poolToken1,
            poolToken2,
            TokenAmount.fromRawAmount(poolToken1, '777700000000'),
        );

        const tokenAmountOutWithHook = stablePoolWithHook.swapGivenIn(
            poolToken1,
            poolToken2,
            TokenAmount.fromRawAmount(poolToken1, '777700000000'),
        );
        expect(tokenAmountOut.amount > tokenAmountOutWithHook.amount).toBe(true);
    });
});
