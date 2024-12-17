import { AprHandler } from '..';
import { Chain } from '@prisma/client';
import { getViemClient } from '../../../../../sources/viem-client';
import { parseAbi } from 'viem';

const helperAbi = parseAbi(['function vaultAPY() view returns (uint256)']);

/** Sets the config data used internally */
const config = {
    GNOSIS: {
        sdaiAddress: '0xaf204776c7245bf4147c2612bf6e5972ee483701',
        helperAddress: '0xd499b51fcfc66bd31248ef4b28d656d67e591a94',
    },
};

/** Makes handler callable by chain */
export const chains = Object.keys(config) as Chain[];

export class Handler implements AprHandler {
    async getAprs(chain: Chain) {
        if (chain !== 'GNOSIS') {
            throw `Handler supports GNOSIS only, but called for ${chain}`;
        }

        const client = getViemClient(chain);
        const vaultAPY = await client.readContract({
            address: config[chain].helperAddress as `0x${string}`,
            abi: helperAbi,
            functionName: 'vaultAPY',
        });
        const apr = Number(vaultAPY) * 10 ** -18;

        return {
            [config[chain].sdaiAddress]: {
                apr,
                isIbYield: true,
                group: 'MAKER',
            },
        };
    }
}
