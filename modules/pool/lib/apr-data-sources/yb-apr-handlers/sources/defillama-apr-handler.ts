import { AprHandler } from '../types';
import { YbAprConfig } from '../../../../../network/apr-config-types';

const query = `
  {
    osTokens {
      apy
    }
  }
`;

const requestQuery = {
    query,
};

interface Response {
    data: {
        timestamp: string;
        apyBase: number;
    }[];
}

const baseURL = 'https://yields.llama.fi/chart/';

export class Defillama implements AprHandler {
    constructor(private config: YbAprConfig['defillama']) {}

    async getAprs() {
        const aprs: { token: string; apr: number }[] = [];

        for (const token of this.config!) {
            {
                const response = await fetch(baseURL + token.defillamaPoolId);

                const data = (await response.json()) as Response;

                const apr = Number(data.data[data.data.length - 1].apyBase) / 100;
                aprs.push({ token: token.tokenAddress, apr });
            }
        }
        return Object.fromEntries(aprs.map(({ token, apr }) => [token, { apr, isIbYield: true }]));
    }
}
