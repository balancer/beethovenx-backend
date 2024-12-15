import { prisma } from '../../../prisma/prisma-client';
import { getViemClient } from '../../sources/viem-client';
import fantom from '../../../config/fantom';
import { formatEther, parseAbi } from 'viem';

const abi = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
]);

export class FbeetsService {
    constructor() {}

    public async getRatio(): Promise<string> {
        const fbeets = await prisma.prismaFbeets.findFirst({});
        if (!fbeets) {
            throw new Error('Fbeets data has not yet been synced');
        }

        return fbeets.ratio;
    }

    public async syncRatio() {
        const client = getViemClient('FANTOM');
        const contracts = [
            {
                address: fantom.fbeets!.address as `0x${string}`,
                abi,
                functionName: 'totalSupply',
            },
            {
                address: fantom.fbeets!.poolAddress as `0x${string}`,
                abi,
                functionName: 'balanceOf',
                args: [fantom.fbeets!.address],
            },
        ];
        const [totalSupply, bptBalance] = await client.multicall({ contracts, allowFailure: false });

        const ratio = (Number(formatEther(bptBalance)) / Number(formatEther(totalSupply)))
            .toFixed(22)
            .replace(/\.?0+$/, '');

        await prisma.prismaFbeets.upsert({
            where: { id: 'fbeets' },
            update: { ratio },
            create: { id: 'fbeets', ratio },
        });
    }
}
