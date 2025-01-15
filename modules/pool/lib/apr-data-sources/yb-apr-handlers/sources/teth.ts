import { AprHandler } from '../types';

const url = 'https://api.treehouse.finance/rate/mey';

// The apr config needs to be custom made as the resulting value
// is equal to Lido's wstETH APR plus the data from the below query.
export class TreehouseAprHandler implements AprHandler {
    constructor(private config: { address: string }) {}

    async getAprs() {
        try {
            const response = await fetch(url);
            const { key, message, data } = (await response.json()) as { key: string; message: string; data: string };
            if (key !== 'SUCCESS') {
                throw new Error('Treehouse API failed: ' + message);
            }

            // Get Lido wstETH APR
            const lido = await fetch('https://eth-api.lido.fi/v1/protocol/steth/apr/sma');
            const {
                data: { smaApr },
            } = (await lido.json()) as { data: { smaApr: number } };

            const aprs = {
                [this.config.address]: {
                    apr: (parseFloat(data) + smaApr) / 100,
                    isIbYield: true,
                },
            };

            return aprs;
        } catch (error) {
            console.error(`Treehouse IB APR handler failed: `, error);
            return {};
        }
    }
}
