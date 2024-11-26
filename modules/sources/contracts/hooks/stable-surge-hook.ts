// Sepolia 0xcc4a97bb41dc77013d625fc2a5e7867603d4c78b

import { ViemMulticallCall } from '../../../web3/multicaller-viem';
import stableSurgeHookAbi from '../abis/stable-surge-hook';

export const stableSurgeHook = (address: string, poolAddress: string): ViemMulticallCall[] => [
    {
        path: `surgeThresholdPercentage`,
        address: address as `0x${string}`,
        abi: stableSurgeHookAbi,
        functionName: 'getSurgeThresholdPercentage',
        args: [poolAddress],
    },
    {
        path: `maxSurgeFeePercentage`,
        address: address as `0x${string}`,
        abi: stableSurgeHookAbi,
        functionName: 'MAX_SURGE_FEE_PERCENTAGE',
    },
];
