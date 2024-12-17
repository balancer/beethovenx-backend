import { gql, request } from 'graphql-request';
import { TokenPriceHandler } from '../../token-types';
import { PrismaTokenWithTypes } from '../../../../prisma/prisma-types';
import { timestampRoundedUpToNearestHour } from '../../../common/time';
import { updatePrices } from './price-handler-helper';
import { Chain } from '@prisma/client';

const url = 'https://blue-api.morpho.org/graphql';
const query = gql`
    {
        vaults(first: 1000, where: { totalAssetsUsd_gte: 0.01 }) {
            items {
                address
                chain {
                    network
                }
                state {
                    sharePriceUsd
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
        sharePriceUsd: number;
    };
};

type BlueApiResponse = {
    vaults: {
        items: Vault[];
    };
};

export class MorphoPriceHandlerService implements TokenPriceHandler {
    public readonly exitIfFails = false;
    public readonly id = 'MorphoPriceHandlerService';

    public async updatePricesForTokens(tokens: PrismaTokenWithTypes[]): Promise<PrismaTokenWithTypes[]> {
        const timestamp = timestampRoundedUpToNearestHour();
        const addresses = tokens.map((token) => token.address);
        const {
            vaults: { items },
        } = await request<BlueApiResponse>(url, query);

        const morphoTokens = items
            .filter((vault) => addresses.includes(vault.address.toLowerCase()))
            .map((vault) => ({
                address: vault.address.toLowerCase(),
                price: vault.state.sharePriceUsd,
                chain: vault.chain.network === 'ethereum' ? Chain.MAINNET : Chain.BASE,
            }));

        await updatePrices(this.id, morphoTokens, timestamp);

        const morphoTokenAddresses = morphoTokens.map((token) => token.address);
        const updatedTokens = tokens.filter((token) => morphoTokenAddresses.includes(token.address));

        return updatedTokens;
    }
}
