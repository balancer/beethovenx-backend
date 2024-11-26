import axios from 'axios';
import { AprHandler } from '../types';
import { TetuAprConfig } from '../../../../../network/apr-config-types';

export class TetuAprHandler implements AprHandler {
    sourceUrl: string;
    tokens: {
        [tokenName: string]: {
            address: string;
            isIbYield?: boolean;
        };
    };
    readonly group = 'TETU';

    constructor(aprHandlerConfig: TetuAprConfig) {
        this.sourceUrl = aprHandlerConfig.sourceUrl;
        this.tokens = aprHandlerConfig.tokens;
    }

    async getAprs() {
        try {
            const { data } = await axios.get(this.sourceUrl);
            const json = data as { vault: string; apr: number }[];
            const aprs = json
                .filter(({ vault }) =>
                    Object.values(this.tokens)
                        .map(({ address }) => address)
                        .includes(vault.toLowerCase()),
                )
                .map((t) => [
                    t.vault,
                    {
                        apr: t.apr / 100,
                        isIbYield:
                            Object.values(this.tokens).find(({ address }) => address === t.vault)?.isIbYield ?? false,
                        group: this.group,
                    },
                ]);
            return Object.fromEntries(aprs);
        } catch (error) {
            console.error('Failed to fetch Tetu APR:', error);
            return {};
        }
    }
}
