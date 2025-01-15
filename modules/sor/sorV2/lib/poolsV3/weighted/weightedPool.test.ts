// yarn vitest poolsV3/weighted/weightedPool.test.ts

import { parseEther } from 'viem';

import { PrismaPoolAndHookWithDynamic } from '../../../../../../prisma/prisma-types';
import { WAD } from '../../utils/math';
import { WeightedPoolV3 } from './weightedPool';
import { createRandomAddress } from '../../../../../../test/utils';

// keep factories imports at the end - moving up will break the test
import {
    poolTokenFactory,
    prismaPoolDynamicDataFactory,
    prismaPoolFactory,
    prismaPoolTokenFactory,
    hookFactory,
} from '../../../../../../test/factories';

describe('SOR V3 Weighted Pool Tests', () => {
    let scalingFactors: bigint[];
    let swapFee: string;
    let aggregateSwapFee: bigint;
    let tokenAddresses: string[];
    let tokenBalances: string[];
    let tokenDecimals: number[];
    let tokenWeights: string[];
    let totalShares: string;
    let weightedPool: WeightedPoolV3;
    let weightedPrismaPool: PrismaPoolAndHookWithDynamic;
    let weightedPoolWithHook: WeightedPoolV3;
    let weightedPrismaPoolWithHook: PrismaPoolAndHookWithDynamic;
    let poolAddress: string;
    let hookType: string;

    beforeAll(() => {
        swapFee = '0.001';
        tokenBalances = ['52110', '51290'];
        tokenDecimals = [6, 18];
        tokenWeights = ['0.4', '0.6'];
        totalShares = '100000';
        scalingFactors = [10n ** 12n, 10n ** 0n];
        poolAddress = createRandomAddress();
        aggregateSwapFee = 0n;
        hookType = 'DirectionalFee';

        const poolToken1 = prismaPoolTokenFactory.build({
            token: poolTokenFactory.build({ decimals: tokenDecimals[0] }),
            balance: tokenBalances[0],
            weight: tokenWeights[0],
        });
        const poolToken2 = prismaPoolTokenFactory.build({
            token: poolTokenFactory.build({ decimals: tokenDecimals[1] }),
            balance: tokenBalances[1],
            weight: tokenWeights[1],
        });

        tokenAddresses = [poolToken1.address, poolToken2.address];

        weightedPrismaPool = prismaPoolFactory.build({
            type: 'WEIGHTED',
            address: poolAddress,
            protocolVersion: 3,
            tokens: [poolToken1, poolToken2],
            dynamicData: prismaPoolDynamicDataFactory.build({ swapFee, totalShares }),
            liquidityManagement: {
                disableUnbalancedLiquidity: true,
                enableAddLiquidityCustom: false,
                enableDonation: false,
                enableRemoveLiquidityCustom: false,
            },
        });
        weightedPool = WeightedPoolV3.fromPrismaPool(weightedPrismaPool);

        const dynamicData = {};

        const directionalFeeHook = hookFactory.build({
            name: hookType,
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

        weightedPrismaPoolWithHook = prismaPoolFactory.build({
            type: 'WEIGHTED',
            address: poolAddress,
            protocolVersion: 3,
            tokens: [poolToken1, poolToken2],
            dynamicData: prismaPoolDynamicDataFactory.build({ swapFee, totalShares }),
            hook: directionalFeeHook,
            liquidityManagement: {
                disableUnbalancedLiquidity: true,
                enableAddLiquidityCustom: false,
                enableDonation: false,
                enableRemoveLiquidityCustom: false,
            },
        });
        weightedPoolWithHook = WeightedPoolV3.fromPrismaPool(weightedPrismaPoolWithHook);
    });

    test('Get Pool State', () => {
        const poolState = {
            poolType: 'WEIGHTED',
            poolAddress: poolAddress,
            swapFee: parseEther(swapFee),
            aggregateSwapFee: aggregateSwapFee,
            balancesLiveScaled18: tokenBalances.map((b) => parseEther(b)),
            tokenRates: Array(tokenBalances.length).fill(WAD),
            totalSupply: parseEther(totalShares),
            weights: tokenWeights.map((w) => parseEther(w)),
            tokens: tokenAddresses,
            scalingFactors,
            supportsUnbalancedLiquidity: false,
        };
        expect(poolState).toEqual(weightedPool.getPoolState());
    });
    test('get Pool State with hook', () => {
        const poolState = {
            poolType: 'WEIGHTED',
            poolAddress: poolAddress,
            swapFee: parseEther(swapFee),
            aggregateSwapFee: aggregateSwapFee,
            balancesLiveScaled18: tokenBalances.map((b) => parseEther(b)),
            tokenRates: Array(tokenBalances.length).fill(WAD),
            totalSupply: parseEther(totalShares),
            weights: tokenWeights.map((w) => parseEther(w)),
            tokens: tokenAddresses,
            scalingFactors,
            hookType: 'DirectionalFee',
            supportsUnbalancedLiquidity: false,
        };
        expect(poolState).toEqual(weightedPoolWithHook.getPoolState('DirectionalFee'));
    });
});
