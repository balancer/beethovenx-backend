import { Chain } from '@prisma/client';
import { getV2SubgraphClient } from '../../../subgraphs/balancer-subgraph';
import { getViemClient } from '../../../sources/viem-client';
import { prisma } from '../../../../prisma/prisma-client';
import { syncBptBalancesFromSubgraph } from './helpers/sync-bpt-balances-from-subgraph';
import { syncBptBalancesFromRpc } from './helpers/sync-bpt-balances-from-rpc';

export const syncBptBalancesV2 = async (chain: Chain, subgraphUrl?: string) => {
    if (!subgraphUrl) {
        console.log(`syncBptBalancesV2 on ${chain} missing subgraphUrls`);
        return;
    }

    const subgraphClient = getV2SubgraphClient(subgraphUrl, chain);
    const viemClient = getViemClient(chain);

    const poolIds = await prisma.prismaPool
        .findMany({
            where: {
                chain,
                protocolVersion: 2,
            },
            select: {
                id: true,
            },
        })
        .then((pools) => pools.map((pool) => pool.id));

    let syncedRange = 0;
    try {
        syncedRange = await syncBptBalancesFromSubgraph(poolIds, subgraphClient, chain, 'BPT_BALANCES_V2');
    } catch (e: any) {
        console.log(`syncBptBalancesFromSubgraph BPT_BALANCES_V2 on ${chain} failed, trying RPC`, e.message);
        syncedRange = await syncBptBalancesFromRpc(poolIds, viemClient, chain, 'BPT_BALANCES_V2');
    }

    return syncedRange;
};
