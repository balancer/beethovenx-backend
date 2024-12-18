import { abi } from './abis/oErc20';
import { AprHandler } from '..';
import { OvixAprConfig } from '../../../../../network/apr-config-types';
import { getViemClient } from '../../../../../sources/viem-client';
import { Chain } from '@prisma/client';

export class OvixAprHandler implements AprHandler {
    tokens: {
        [tokenName: string]: {
            yieldAddress: string;
            wrappedAddress: string;
            isIbYield?: boolean;
        };
    };
    readonly group = 'OVIX';

    constructor(aprHandlerConfig: OvixAprConfig) {
        this.tokens = aprHandlerConfig.tokens;
    }

    async getAprs(chain: Chain) {
        const client = getViemClient(chain);

        try {
            const addresses = Object.values(this.tokens).map(({ yieldAddress }) => yieldAddress as `0x${string}`);
            const contracts = addresses.map((address) => ({
                address,
                abi,
                functionName: 'borrowRatePerTimestamp',
            }));
            const rates = await client.multicall({ contracts, allowFailure: false });

            const aprEntries = Object.values(this.tokens).map(({ wrappedAddress, isIbYield }, index) => [
                wrappedAddress,
                {
                    apr: Math.pow(1 + Number(rates[index]) / 1e18, 365 * 24 * 60 * 60) - 1,
                    isIbYield: isIbYield ?? false,
                    group: this.group,
                },
            ]);

            return Object.fromEntries(await Promise.all(aprEntries));
        } catch (error) {
            console.error('Failed to fetch Ovix APR:', error);
            return {};
        }
    }
}
