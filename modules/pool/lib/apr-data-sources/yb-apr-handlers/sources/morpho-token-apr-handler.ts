import { gql, request } from 'graphql-request';
import { AprHandler } from '../types';

const url = 'https://blue-api.morpho.org/graphql';
const query = gql`
    {
        vault(id: "560b57bd-0e46-425f-9549-f3e38be0e1e6") {
            state {
                netApyWithoutRewards
                netApy
            }
        }
    }
`;

type Response = {
    vault: {
        state: {
            netApyWithoutRewards: number;
            netApy: number;
        };
    };
};

export class MorphoTokenAprHandler implements AprHandler {
    constructor() {}

    async getAprs() {
        try {
            const r = await request<Response>(url, query);
            const apr = r?.vault?.state?.netApy - r?.vault?.state?.netApyWithoutRewards;

            return {
                '0x58d97b57bb95320f9a05dc918aef65434969c2b2': {
                    apr: apr,
                    isIbYield: false,
                },
            };
        } catch (e) {
            console.error(`Failed to fetch Morpho APRs`, e);
            return {} as { [token: string]: { apr: number; isIbYield: boolean } };
        }
    }
}
