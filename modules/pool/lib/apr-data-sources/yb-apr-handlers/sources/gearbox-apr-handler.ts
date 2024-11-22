import axios from 'axios';
import { AprHandler } from '../types';
import { GearBoxAprConfig } from '../../../../../network/apr-config-types';

export class GearboxAprHandler implements AprHandler {
    url: string;
    tokens: { [key: string]: { address: string; isIbYield?: boolean } };
    readonly group = 'GEARBOX';

    constructor(aprHandlerConfig: GearBoxAprConfig) {
        this.tokens = aprHandlerConfig.tokens;
        this.url = aprHandlerConfig.sourceUrl;
    }

    async getAprs() {
        try {
            const { data } = await axios.get(this.url);
            const json = data as { data: { dieselToken: string; depositAPY_RAY: string }[] };

            const aprEntries = json.data
                .filter((t) =>
                    Object.values(this.tokens)
                        .map(({ address }) => address)
                        .includes(t.dieselToken.toLowerCase()),
                )
                .map(({ dieselToken, depositAPY_RAY }) => {
                    const tokenObj = Object.values(this.tokens).find(
                        ({ address }) => address === dieselToken.toLowerCase(),
                    );
                    return [
                        dieselToken,
                        {
                            apr: Number(depositAPY_RAY.slice(0, 27)) / 1e27,
                            isIbYield: tokenObj?.isIbYield ?? false,
                            group: this.group,
                        },
                    ];
                });
            return Object.fromEntries(aprEntries);
        } catch (error) {
            console.error('Failed to fetch Gearbox APR:', error);
            return {};
        }
    }
}
