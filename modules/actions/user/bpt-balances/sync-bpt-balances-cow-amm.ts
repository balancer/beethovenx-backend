import { Chain } from '@prisma/client';
import { getCowAmmSubgraphClient } from '../../../sources/subgraphs';
import { getViemClient } from '../../../sources/viem-client';
import { prisma } from '../../../../prisma/prisma-client';
import { syncBptBalancesFromSubgraph } from './helpers/sync-bpt-balances-from-subgraph';
import { syncBptBalancesFromRpc } from './helpers/sync-bpt-balances-from-rpc';

export const syncBptBalancesCowAmm = async (chain: Chain, subgraphUrl?: string) => {
    if (!subgraphUrl) {
        console.log(`syncBptBalancesCowAmm on ${chain} missing subgraphUrl`);
        return;
    }

    const subgraphClient = getCowAmmSubgraphClient(subgraphUrl, chain);
    const viemClient = getViemClient(chain);

    const poolIds = await prisma.prismaPool
        .findMany({
            where: {
                chain,
                type: 'COW_AMM',
            },
            select: {
                id: true,
            },
        })
        .then((pools) => pools.map((pool) => pool.id));

    let syncedRange = 0;
    try {
        syncedRange = await syncBptBalancesFromSubgraph(poolIds, subgraphClient, chain, 'BPT_BALANCES_COW_AMM');
    } catch (e: any) {
        console.log(`syncBptBalancesFromSubgraph BPT_BALANCES_COW_AMM on ${chain} failed, trying RPC`, e.message);
        syncedRange = await syncBptBalancesFromRpc(poolIds, viemClient, chain, 'BPT_BALANCES_COW_AMM');
    }

    return syncedRange;
};
