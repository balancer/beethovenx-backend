import { gql, request } from 'graphql-request';
import { AprHandler } from '../types';
import { Chain } from '@prisma/client';

const url = 'https://blue-api.morpho.org/graphql';
const query = gql`
    {
        vaults(first: 1000, where: { netApy_gte: 0.00001 }) {
            items {
                address
                chain {
                    network
                }
                state {
                    netApy
                }
            }
        }
    }
`;

type Vault = {
    address: string;
    chain: {
        network: 'ethereum' | 'base';
    };
    state: {
        netApy: number;
    };
};

type BlueApiResponse = {
    vaults: {
        items: Vault[];
    };
};

export class MorphoAprHandler implements AprHandler {
    group = 'MORPHO';

    constructor() {}

    async getAprs(chain: Chain) {
        if (chain !== Chain.MAINNET && chain !== Chain.BASE) {
            return {};
        }

        const morphoChain = chain === Chain.MAINNET ? 'ethereum' : 'base';

        try {
            const r = await request<BlueApiResponse>(url, query);
            const items = r?.vaults?.items;
            const aprs = Object.fromEntries(
                items
                    .filter((vault) => vault.chain.network === morphoChain)
                    .map((vault) => [
                        vault.address,
                        {
                            apr: vault.state.netApy,
                            group: this.group,
                            isIbYield: true,
                        },
                    ]),
            );

            return aprs;
        } catch (e) {
            console.error(`Failed to fetch Morpho APRs`, e);
            return {};
        }
    }
}
