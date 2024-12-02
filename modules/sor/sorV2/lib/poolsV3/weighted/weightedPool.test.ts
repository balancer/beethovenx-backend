// yarn vitest poolsV3/weighted/weightedPool.test.ts

import { parseEther } from 'viem';

import { PrismaPoolWithDynamic } from '../../../../../../prisma/prisma-types';
import { WAD } from '../../utils/math';
import { WeightedPoolV3 } from './weightedPool';

// keep factories imports at the end - moving up will break the test
import {
    poolTokenFactory,
    prismaPoolDynamicDataFactory,
    prismaPoolFactory,
    prismaPoolTokenDynamicDataFactory,
    prismaPoolTokenFactory,
    hookFactory,
    hookDataFactory
} from '../../../../../../test/factories';

describe('SOR V3 Weighted Pool Tests', () => {
    let scalingFactors: bigint[];
    let swapFee: string;
    let tokenAddresses: string[];
    let tokenBalances: string[];
    let tokenDecimals: number[];
    let tokenWeights: string[];
    let totalShares: string;
    let weightedPool: WeightedPoolV3;
    let weightedPrismaPool: PrismaPoolWithDynamic;

    beforeAll(() => {
        
    });

    test('Get Pool State', () => {
        setupWeightedPool(false);
        const poolState = {
            poolType: 'Weighted',
            swapFee: parseEther(swapFee),
            balancesLiveScaled18: tokenBalances.map((b) => parseEther(b)),
            tokenRates: Array(tokenBalances.length).fill(WAD),
            totalSupply: parseEther(totalShares),
            weights: tokenWeights.map((w) => parseEther(w)),
            tokens: tokenAddresses,
            scalingFactors,
            aggregateSwapFee: 0n
        };
        expect(poolState).toEqual(weightedPool.getPoolState());
    });

    const setupWeightedPool = (hasHooks: boolean) => {
        swapFee = '0.01';
        tokenBalances = ['169', '144'];
        tokenDecimals = [6, 18];
        tokenWeights = ['0.4', '0.6'];
        totalShares = '156';
        scalingFactors = [WAD * 10n ** 12n, WAD];

        const poolToken1 = prismaPoolTokenFactory.build({
            token: poolTokenFactory.build({ decimals: tokenDecimals[0] }),
            dynamicData: prismaPoolTokenDynamicDataFactory.build({
                balance: tokenBalances[0],
                weight: tokenWeights[0],
            }),
        });
        const poolToken2 = prismaPoolTokenFactory.build({
            token: poolTokenFactory.build({ decimals: tokenDecimals[1] }),
            dynamicData: prismaPoolTokenDynamicDataFactory.build({
                balance: tokenBalances[1],
                weight: tokenWeights[1],
            }),
        });

        tokenAddresses = [poolToken1.address, poolToken2.address];

        weightedPrismaPool = prismaPoolFactory.build({
            type: 'WEIGHTED',
            protocolVersion: 3,
            tokens: [poolToken1, poolToken2],
            dynamicData: prismaPoolDynamicDataFactory.build({ swapFee, totalShares }),
        });
        if (!hasHooks) {
            weightedPool = WeightedPoolV3.fromPrismaPool(weightedPrismaPool, []);
        } else {

            // create hooks here due to needing to pass stable pool address
            // The stable pool has a hook attached in this test
            const dynamicData = hookDataFactory.build({
                // Add any specific dynamic data parameters here
                addLiquidityFeePercentage: '0.01',
                removeLiquidityFeePercentage: '0.01',
                swapFeePercentage: '0.01'
            });

            // Create the Hook instance
            const prismaHook1 = hookFactory.build({
                dynamicData: dynamicData,
                enableHookAdjustedAmounts: true,
                poolsIds: [weightedPrismaPool.address, '0x102b75a27e5e157f93c679dd7a25fdfcdbc1473c'],
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

            // Create the Hook instance
            const prismaHook2 = hookFactory.build({
                dynamicData: dynamicData,
                enableHookAdjustedAmounts: true,
                poolsIds: ['0x102b75a27e5e157f93c679dd6a25fdfcdbc1473f', '0x102b75a17e5e157f93c679dd7a25fdfcdbc1473c'],
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

            weightedPool = WeightedPoolV3.fromPrismaPool(weightedPrismaPool, [prismaHook1, prismaHook2]);
        }
    }
});
