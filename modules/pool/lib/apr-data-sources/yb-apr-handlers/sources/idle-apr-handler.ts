import axios from 'axios';
import { AprHandler } from '../types';
import { IdleAprConfig } from '../../../../../network/apr-config-types';

export class IdleAprHandler implements AprHandler {
    tokens: {
        [tokenName: string]: {
            address: string;
            wrapped4626Address: string;
            isIbYield?: boolean;
        };
    };
    url: string;
    authorizationHeader: string;
    readonly group = 'IDLE';

    constructor(aprHandlerConfig: IdleAprConfig) {
        this.tokens = aprHandlerConfig.tokens;
        this.url = aprHandlerConfig.sourceUrl;
        this.authorizationHeader = aprHandlerConfig.authorizationHeader;
    }

    async getAprs() {
        try {
            const aprPromises = Object.values(this.tokens).map(async ({ address, wrapped4626Address, isIbYield }) => {
                const { data } = await axios.get([this.url, address, '?isRisk=false&order=desc&limit=1'].join(''), {
                    headers: {
                        Authorization: this.authorizationHeader,
                    },
                });
                const [json] = data as { idleRate: string }[];
                const value = Number(json.idleRate) / 1e20;
                return [
                    wrapped4626Address,
                    {
                        apr: value,
                        isIbYield: isIbYield ?? false,
                        group: this.group,
                    },
                ];
            });
            const res = Array(Object.keys(this.tokens).length);
            for (const [index, aprPromise] of aprPromises.entries()) {
                res[index] = await aprPromise;
            }
            return Object.fromEntries(res);
        } catch (error) {
            console.error('Failed to fetch Idle APR:', error);
            return {};
        }
    }
}
