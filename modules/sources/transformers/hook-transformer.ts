import { V3JoinedSubgraphPool } from '../subgraphs';
import { zeroAddress } from 'viem';

export type HookData = {
    address: string;
    name?: string;
    enableHookAdjustedAmounts: boolean;
    shouldCallAfterSwap: boolean;
    shouldCallBeforeSwap: boolean;
    shouldCallAfterInitialize: boolean;
    shouldCallBeforeInitialize: boolean;
    shouldCallAfterAddLiquidity: boolean;
    shouldCallBeforeAddLiquidity: boolean;
    shouldCallAfterRemoveLiquidity: boolean;
    shouldCallBeforeRemoveLiquidity: boolean;
    shouldCallComputeDynamicSwapFee: boolean;
    dynamicData?: Record<string, string>;
    reviewData?: {
        summary: string;
        reviewFile: string;
        warnings: string[];
    };
};

export const hookTransformer = (poolData: V3JoinedSubgraphPool): HookData | undefined => {
    // By default v3 pools have a hook config with the address 0x0
    // We don't want to store this in the database because it's not doing anything
    const hookConfig =
        poolData.hookConfig && poolData.hookConfig.hook.address !== zeroAddress ? poolData.hookConfig : undefined;

    if (!hookConfig) {
        return undefined;
    }

    const { hook, ...hookFlags } = hookConfig;

    return {
        address: hook.address.toLowerCase(),
        ...hookFlags,
    };
};
