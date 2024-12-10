import { Factory } from 'fishery';
import { createRandomAddress } from '../utils';
import { Chain } from '@prisma/client';

import { HookData } from '../../modules/sources/transformers/hook-transformer';

class PrismaHookFactory extends Factory<HookData> {}

export const hookFactory = PrismaHookFactory.define(({ params }) => {

    return {
        address: createRandomAddress(),
        name: 'Test Hook',
        enableHookAdjustedAmounts: false,
        shouldCallAfterSwap: false,
        shouldCallBeforeSwap: false,
        shouldCallAfterInitialize: false,
        shouldCallBeforeInitialize: false,
        shouldCallAfterAddLiquidity: false,
        shouldCallBeforeAddLiquidity: false,
        shouldCallAfterRemoveLiquidity: false,
        shouldCallBeforeRemoveLiquidity: false,
        shouldCallComputeDynamicSwapFee: false,
        dynamicData:  {},
        reviewData: {
            summary: '',
            reviewFile: '',
            warnings: [],
        },
    } as HookData;
});
