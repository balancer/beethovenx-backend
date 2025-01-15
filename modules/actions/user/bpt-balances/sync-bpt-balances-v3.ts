import { Chain } from '@prisma/client';
import { getVaultSubgraphClient } from '../../../sources/subgraphs';
import { getViemClient } from '../../../sources/viem-client';
import { prisma } from '../../../../prisma/prisma-client';
import { syncBptBalancesFromSubgraph } from './helpers/sync-bpt-balances-from-subgraph';
import { syncBptBalancesFromRpc } from './helpers/sync-bpt-balances-from-rpc';

export const syncBptBalancesV3 = async (chain: Chain, subgraphUrl?: string) => {
    if (!subgraphUrl) {
        console.log(`syncBptBalancesV3 on ${chain} missing subgraphUrl`);
        return;
    }

    const subgraphClient = getVaultSubgraphClient(subgraphUrl, chain);
    const viemClient = getViemClient(chain);

    const poolIds = await prisma.prismaPool
        .findMany({
            where: {
                chain,
                protocolVersion: 3,
            },
            select: {
                id: true,
            },
        })
        .then((pools) => pools.map((pool) => pool.id));

    let syncedRange = 0;
    try {
        syncedRange = await syncBptBalancesFromSubgraph(poolIds, subgraphClient, chain, 'BPT_BALANCES_V3');
    } catch (e: any) {
        console.log(`syncBptBalancesFromSubgraph BPT_BALANCES_V3 on ${chain} failed, trying RPC`, e.message);
        syncedRange = await syncBptBalancesFromRpc(poolIds, viemClient, chain, 'BPT_BALANCES_V3');
    }

    return syncedRange;
};
