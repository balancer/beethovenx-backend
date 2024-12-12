import { gql, request } from 'graphql-request';
import { AprHandler } from '../types';

const url = 'https://blue-api.morpho.org/graphql';
const query = gql`
    {
        vault(id: "560b57bd-0e46-425f-9549-f3e38be0e1e6") {
            asset {
                yield {
                    apr
                }
            }
        }
    }
`;

type USDLResponse = {
    vault: {
        asset: {
            yield: {
                apr: number;
            };
        };
    };
};

export class UsdlAprHandler implements AprHandler {
    constructor() {}

    async getAprs() {
        try {
            const r = await request<USDLResponse>(url, query);
            const apr = r?.vault?.asset?.yield?.apr;

            return {
                '0x7751e2f4b8ae93ef6b79d86419d42fe3295a4559': {
                    apr: apr,
                    isIbYield: true,
                },
            };
        } catch (e) {
            console.error(`Failed to fetch Morpho APRs`, e);
            return {} as {};
        }
    }
}
