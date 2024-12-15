import { Chain } from '@prisma/client';
import mainnet from '../../config/mainnet';
import { getViemClient } from '../sources/viem-client';
import { parseAbi } from 'viem';

const abi = parseAbi(['function getInflationRate() view returns (uint256)']);

export async function getInflationRate(chain: Chain) {
    if (chain === Chain.MAINNET) {
        const client = getViemClient(chain);
        const inflationRate = await client.readContract({
            address: mainnet.balancer.v2.tokenAdmin! as `0x${string}`,
            abi,
            functionName: 'getInflationRate',
        });
        return inflationRate;
    } else {
        return 0n;
    }
}
