import { createPublicClient, formatEther, http, parseAbi } from 'viem';
import { mainnet } from 'viem/chains';
import type { AprHandler } from '../types';
import config from '../../../../../../config/mainnet';

const client = createPublicClient({
    chain: mainnet,
    transport: http(config.rpcUrl),
});

const distributor = '0xc93ab6aca2c14422a65a31010ac2b4baa86a21b3' as `0x${string}`;
const vETH = '0x38d64ce1bdf1a9f24e0ec469c9cade61236fb4a0' as `0x${string}`;
const svETH = '0x6733f0283711f225a447e759d859a70b0c0fd2bc' as `0x${string}`;

const distributorAbi = parseAbi(['function svETHRewardPerEpoch() view returns (uint256)']);
const vETHAbi = parseAbi(['function balanceOf(address) view returns (uint256)']);

export class svEthAprHandler implements AprHandler {
    async getAprs() {
        const rate = (await client.readContract({
            address: distributor,
            abi: distributorAbi,
            functionName: 'svETHRewardPerEpoch',
        })) as bigint;

        const balance = (await client.readContract({
            address: vETH,
            abi: vETHAbi,
            functionName: 'balanceOf',
            args: [svETH],
        })) as bigint;

        return {
            [svETH]: {
                apr: (parseFloat(formatEther(rate)) * 1095) / parseFloat(formatEther(balance)),
                isIbYield: true,
            },
        };
    }
}
