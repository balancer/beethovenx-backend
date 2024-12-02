import { Factory } from 'fishery';
import { createRandomAddress } from '../utils';
import { Chain } from '@prisma/client';

import { HookData } from '../../modules/sources/transformers/hook-transformer';

class PrismaHookFactory extends Factory<HookData> {}

export const hookFactory = PrismaHookFactory.define(({ params }) => {
    const hookAddress = params?.address ?? createRandomAddress();

    return {
        address: hookAddress,
        name: params.name || 'Test Hook',
        enableHookAdjustedAmounts: params?.enableHookAdjustedAmounts ?? false,
        shouldCallAfterSwap: params?.shouldCallAfterSwap ?? false,
        shouldCallBeforeSwap: params?.shouldCallBeforeSwap ?? false,
        shouldCallAfterInitialize: params?.shouldCallAfterInitialize ?? false,
        shouldCallBeforeInitialize: params?.shouldCallBeforeInitialize ?? false,
        shouldCallAfterAddLiquidity: params?.shouldCallAfterAddLiquidity ?? false,
        shouldCallBeforeAddLiquidity: params?.shouldCallBeforeAddLiquidity ?? false,
        shouldCallAfterRemoveLiquidity: params?.shouldCallAfterRemoveLiquidity ?? false,
        shouldCallBeforeRemoveLiquidity: params?.shouldCallBeforeRemoveLiquidity ?? false,
        shouldCallComputeDynamicSwapFee: params?.shouldCallComputeDynamicSwapFee ?? false,
        dynamicData: params?.dynamicData ?? {},
        reviewData: params?.reviewData ?? {
            summary: '',
            reviewFile: '',
            warnings: [],
        },
    } as HookData;
});
