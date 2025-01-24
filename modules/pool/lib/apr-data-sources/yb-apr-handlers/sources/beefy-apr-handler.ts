import { BeefyAprConfig } from '../../../../../network/apr-config-types';
import { AprHandler } from '../types';
import axios from 'axios';

export class BeefyAprHandler implements AprHandler {
    tokens: {
        [tokenName: string]: {
            address: string;
            vaultId: string;
            isIbYield?: boolean;
        };
    };
    sourceUrl: string;
    group = 'BEEFY';

    constructor(config: BeefyAprConfig) {
        this.tokens = config.tokens;
        this.sourceUrl = config.sourceUrl;
    }

    async getAprs() {
        try {
            const { data: aprData } = await axios.get<VaultApr>(this.sourceUrl);
            const aprs = Object.values(this.tokens)
                .map(({ address, vaultId, isIbYield }) => {
                    const apr = aprData[vaultId] ?? 0;
                    return {
                        [address]: {
                            apr,
                            isIbYield: isIbYield ?? false,
                            group: this.group,
                        },
                    };
                })
                .flat()
                .reduce((acc, curr) => ({ ...acc, ...curr }), {});

            return aprs;
        } catch (error) {
            console.error(`Beefy IB APR hanlder failed: `, error);
            return {};
        }
    }
}

type VaultApr = Record<string, number>;
