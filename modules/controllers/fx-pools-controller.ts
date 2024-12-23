import config from '../../config';
import { prisma } from '../../prisma/prisma-client';
import { syncPoolTypeOnchainData } from '../actions/pool/v2/sync-pool-type-onchain-data';
import { syncLatestFXPrices } from '../token/latest-fx-price';
import { Chain } from '@prisma/client';

export function FXPoolsController() {
    return {
        async syncLatestPrices(chain: Chain) {
            const {
                subgraphs: { balancer },
            } = config[chain];

            return syncLatestFXPrices(balancer, chain);
        },
        async syncQuoteTokens(chain: Chain) {
            const pools = await prisma.prismaPool.findMany({
                where: { chain, type: 'FX' },
            });

            return syncPoolTypeOnchainData(pools, chain);
        },
    };
}
