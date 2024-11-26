// Sepolia 0xcc4a97bb41dc77013d625fc2a5e7867603d4c78b

import { ViemMulticallCall } from '../../../web3/multicaller-viem';
import feeTakingHookAbi from '../abis/fee-taking-hook';

export const feeTakingHook = (address: string): ViemMulticallCall[] => [
    {
        path: `swapFeePercentage`,
        address: address as `0x${string}`,
        abi: feeTakingHookAbi,
        functionName: 'hookSwapFeePercentage',
    },
    {
        path: `addLiquidityFeePercentage`,
        address: address as `0x${string}`,
        abi: feeTakingHookAbi,
        functionName: 'addLiquidityHookFeePercentage',
    },
    {
        path: `removeLiquidityFeePercentage`,
        address: address as `0x${string}`,
        abi: feeTakingHookAbi,
        functionName: 'removeLiquidityHookFeePercentage',
    },
];
