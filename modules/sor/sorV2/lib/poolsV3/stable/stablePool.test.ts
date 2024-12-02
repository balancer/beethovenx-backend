// yarn vitest stablePool.test.ts

import { parseEther, parseUnits } from 'viem';

import { PrismaPoolWithDynamic, PrismaHookWithDynamic } from '../../../../../../prisma/prisma-types';
import { WAD } from '../../utils/math';
import { StablePool } from './stablePool';

// keep factories imports at the end - moving up will break the test
import {
    poolTokenFactory,
    prismaPoolDynamicDataFactory,
    prismaPoolFactory,
    prismaPoolTokenDynamicDataFactory,
    prismaPoolTokenFactory,
    hookFactory,
    hookDataFactory,
} from '../../../../../../test/factories';
import { stable } from '../../../../../pool/pool-data';

describe('SOR V3 Stable Pool Tests', () => {
    let amp: string;
    let scalingFactors: bigint[];
    let stablePool: StablePool;
    let stablePrismaPool: PrismaPoolWithDynamic;
    let swapFee: string;
    let tokenAddresses: string[];
    let tokenBalances: string[];
    let tokenDecimals: number[];
    let tokenRates: string[];
    let totalShares: string;

    test('Get Pool State', () => {
        setupStablePool(false);
        const poolState = {
            poolType: 'Stable',
            swapFee: parseEther(swapFee),
            balancesLiveScaled18: tokenBalances.map((b) => parseEther(b)),
            tokenRates: tokenRates.map((r) => parseEther(r)),
            totalSupply: parseEther(totalShares),
            amp: parseUnits(amp, 3),
            tokens: tokenAddresses,
            scalingFactors,
            aggregateSwapFee: 0n
        };
        expect(poolState).toEqual(stablePool.getPoolState());
    });

    const setupStablePool = (hooks: boolean) => {
        swapFee = '0.01';
        tokenBalances = ['169', '144'];
        tokenDecimals = [6, 18];
        tokenRates = ['1', '1'];
        totalShares = '156';
        amp = '10';
        scalingFactors = [WAD * 10n ** 12n, WAD];

        const poolToken1 = prismaPoolTokenFactory.build({
            token: poolTokenFactory.build({ decimals: tokenDecimals[0] }),
            dynamicData: prismaPoolTokenDynamicDataFactory.build({
                balance: tokenBalances[0],
                priceRate: tokenRates[0],
            }),
        });
        const poolToken2 = prismaPoolTokenFactory.build({
            token: poolTokenFactory.build({ decimals: tokenDecimals[1] }),
            dynamicData: prismaPoolTokenDynamicDataFactory.build({
                balance: tokenBalances[1],
                priceRate: tokenRates[1],
            }),
        });

        tokenAddresses = [poolToken1.address, poolToken2.address];

        stablePrismaPool = prismaPoolFactory.build({
            type: 'STABLE',
            protocolVersion: 3,
            typeData: {
                amp,
            },
            tokens: [poolToken1, poolToken2],
            dynamicData: prismaPoolDynamicDataFactory.build({ swapFee, totalShares }),
        });
        if (!hooks) {
            stablePool = StablePool.fromPrismaPool(stablePrismaPool, []);
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
                poolsIds: [stablePrismaPool.address, '0x102b75a27e5e157f93c679dd7a25fdfcdbc1473c'],
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

            stablePool = StablePool.fromPrismaPool(stablePrismaPool, [prismaHook1, prismaHook2]);
        }
    }
});
