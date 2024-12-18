import { Chain } from '@prisma/client';
import { AprHandler } from '..';
import { BloomAprConfig } from '../../../../../network/apr-config-types';
import { abi as bloomBpsFeed } from './abis/bloom-bps-feed';
import { getViemClient } from '../../../../../sources/viem-client';

export class BloomAprHandler implements AprHandler {
    group = 'DEFAULT';

    tokens: BloomAprConfig['tokens'];

    constructor(config: BloomAprConfig) {
        this.tokens = config.tokens;
    }

    async getAprs(chain: Chain) {
        const client = getViemClient(chain);

        const addresses = Object.values(this.tokens).map(({ feedAddress }) => feedAddress as `0x${string}`);
        const contracts = addresses.map((address) => ({
            address,
            abi: bloomBpsFeed,
            functionName: 'currentRate',
        }));
        const rates = await client.multicall({ contracts, allowFailure: false });

        const entries = Object.values(this.tokens).map(({ address, isIbYield }, index) => [
            address,
            {
                apr: (Number(rates[index]) - 10000) / 10000,
                isIbYield: isIbYield ?? false,
                group: this.group,
            },
        ]);

        return Object.fromEntries(entries);
    }
}
