import axios from 'axios';
import { AprHandler } from '../types';

export class AaveAprHandler implements AprHandler {
    tokens: {
        [assetName: string]: {
            underlyingAssetAddress: string;
            aTokenAddress: string;
            wrappedTokens: {
                [tokenName: string]: string;
            };
            isIbYield?: boolean;
        };
    };
    subgraphUrl: string;
    group = 'AAVE';

    readonly query = `query getReserves($aTokens: [String!], $underlyingAssets: [Bytes!]) {
    reserves(
      where: {
        aToken_in: $aTokens
        underlyingAsset_in: $underlyingAssets
        isActive: true
      }
    ) {
      id
      underlyingAsset
      liquidityRate
    }
  }`;

    constructor(aprHandlerConfig: {
        subgraphUrl: string;
        tokens: {
            [underlyingAssetName: string]: {
                underlyingAssetAddress: string;
                aTokenAddress: string;
                wrappedTokens: {
                    [wrappedTokenName: string]: string;
                };
                isIbYield?: boolean;
            };
        };
    }) {
        this.tokens = aprHandlerConfig.tokens;
        this.subgraphUrl = aprHandlerConfig.subgraphUrl;
    }

    async getAprs() {
        try {
            const requestQuery = {
                operationName: 'getReserves',
                query: this.query,
                variables: {
                    aTokens: Object.values(this.tokens).map(({ aTokenAddress }) => aTokenAddress),
                    underlyingAssets: Object.values(this.tokens).map(
                        ({ underlyingAssetAddress }) => underlyingAssetAddress,
                    ),
                },
            };
            const { data } = await axios({
                url: this.subgraphUrl,
                method: 'post',
                data: requestQuery,
                headers: { 'Content-Type': 'application/json' },
            });
            const {
                data: { reserves },
            } = data as ReserveResponse;

            const aprsByUnderlyingAddress = Object.fromEntries(
                reserves.map((r) => [
                    r.underlyingAsset,
                    // Converting from aave ray number (27 digits) to float
                    Number(r.liquidityRate.slice(0, 27)) / 1e27,
                ]),
            );
            const aprEntries = Object.values(this.tokens)
                .map(({ wrappedTokens, underlyingAssetAddress, isIbYield }) => {
                    const apr = aprsByUnderlyingAddress[underlyingAssetAddress];
                    return Object.values(wrappedTokens).map((wrappedTokenAddress) => ({
                        [wrappedTokenAddress]: {
                            apr,
                            isIbYield: isIbYield ?? false,
                            group: this.group,
                        },
                    }));
                })
                .flat()
                .reduce((acc, curr) => ({ ...acc, ...curr }), {});
            return aprEntries;
        } catch (e) {
            console.error(`Failed to fetch Aave APR in subgraph ${this.subgraphUrl}:`, e);
            return {};
        }
    }
}

interface ReserveResponse {
    data: {
        reserves: [
            {
                underlyingAsset: string;
                liquidityRate: string;
            },
        ];
    };
}
