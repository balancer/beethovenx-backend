import { formatEther } from 'viem';
import type { HookType } from '../../../network/network-config-types';
import type { ViemMulticallCall } from '../../../web3/multicaller-viem';
import { multicallViem } from '../../../web3/multicaller-viem';
import { ViemClient } from '../../types';
import { feeTakingHook } from './fee-taking-hook';
import { exitFeeHook } from './exit-fee-hook';
import { stableSurgeHook } from './stable-surge-hook';

export const fetchHookData = async (
    client: ViemClient,
    address: string,
    type: HookType,
    poolAddress: string,
): Promise<Record<string, string>> => {
    let calls: ViemMulticallCall[] = [];

    switch (type) {
        case 'feeTakingHook':
            calls = [...calls, ...feeTakingHook(address)];
            break;
        case 'exitFeeHook':
            calls = [...calls, ...exitFeeHook(address)];
            break;
        case 'stableSurgeHook':
            calls = [...calls, ...stableSurgeHook(address, poolAddress)];
            break;
        default:
            break;
    }

    const results = await multicallViem(client, calls);

    // Parse all results bignumber values to percentages
    for (const key of Object.keys(results)) {
        results[key] = formatEther(results[key]);
    }

    return results;
};
