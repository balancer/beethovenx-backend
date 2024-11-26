import axios from 'axios';
import { AprHandler } from '../types';
import { EulerAprConfig } from '../../../../../network/apr-config-types';

export class EulerAprHandler implements AprHandler {
    tokens: {
        [key: string]: {
            address: string;
            isIbYield?: boolean;
        };
    };
    subgraphUrl: string;
    readonly group = 'EULER';

    readonly query = `
  query getAssetsAPY($eTokenAddress_in: [String!]) {
    assets(
      where: {
        eTokenAddress_in: $eTokenAddress_in
      }
    ) {
      eTokenAddress
      supplyAPY
    }
  }
`;

    constructor(aprHandlerConfig: EulerAprConfig) {
        this.tokens = aprHandlerConfig.tokens;
        this.subgraphUrl = aprHandlerConfig.subgraphUrl;
    }

    async getAprs() {
        try {
            const requestQuery = {
                operationName: 'getAssetsAPY',
                query: this.query,
                variables: {
                    eTokenAddress_in: Object.values(this.tokens).map(({ address }) => address),
                },
            };

            const { data } = await axios({
                url: this.subgraphUrl,
                method: 'POST',
                data: JSON.stringify(requestQuery),
            });

            const {
                data: { assets },
            } = data as EulerResponse;

            const aprEntries = assets.map(({ eTokenAddress, supplyAPY }) => [
                eTokenAddress.toLowerCase(),
                // supplyAPY is 1e27 and apr is in bps (1e4), so all we need is to format to 1e23
                {
                    apr: Number(supplyAPY.slice(0, 27)) / 1e27,
                    isIbYield:
                        Object.values(this.tokens).find(
                            ({ address }) => address.toLowerCase() === eTokenAddress.toLowerCase(),
                        )?.isIbYield ?? false,
                    group: this.group,
                },
            ]);

            return Object.fromEntries(aprEntries);
        } catch (error) {
            console.error(`Euler IB APR handler failed: `, error);
        }
    }
}

interface EulerResponse {
    data: {
        assets: [
            {
                eTokenAddress: string;
                supplyAPY: string;
            },
        ];
    };
}
