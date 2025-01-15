import { Chain } from '@prisma/client';
import { getBeetsBarSubgraphClient } from '../../../subgraphs/beets-bar-subgraph';
import { syncBptBalancesFromSubgraph } from './helpers/sync-bpt-balances-from-subgraph';
import fantom from '../../../../config/fantom';

export const syncBptBalancesFbeets = async (chain: Chain, subgraphUrl?: string) => {
    // Config for Fantom
    const { fbeets } = fantom;

    if (!subgraphUrl || chain !== 'FANTOM' || !fbeets) {
        console.log(`syncBptBalancesFbeets on ${chain} misconfiguration`);
        return;
    }

    const subgraphClient = getBeetsBarSubgraphClient(subgraphUrl, chain);

    const poolIds = [fbeets.poolId, fbeets.address];

    let syncedRange = 0;
    try {
        syncedRange = await syncBptBalancesFromSubgraph(poolIds, subgraphClient, chain, 'BPT_BALANCES_FBEETS');
    } catch (e: any) {
        console.error(`syncBptBalancesFbeets on ${chain} failed: ${e.message}`);
    }

    return syncedRange;
};
