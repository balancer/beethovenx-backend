import { Chain } from '@prisma/client';
import { prisma } from '../../../../../prisma/prisma-client';
import { zeroAddress } from 'viem';
import _ from 'lodash';
import { balancesToDb } from './balances-to-db';
import { getLastSyncedBlock } from '../../../pool/last-synced-block';
import { BALANCES_SYNC_BLOCKS_MARGIN } from '../../../../../config';
import { UserBalancesSubgraphClient } from '../../../../sources/subgraphs/types';
import { getViemClient } from '../../../../sources/viem-client';

/**
 *
 * @param poolIds needs a list of pools existing in the DB, some are deleted, like Linear pools
 * @param subgraphClient implementing getMetadata and getAllPoolSharesWithBalance
 * @param chain
 * @param syncCategory used to store the last synced block in the DB based on the category, skipping the sync block when not provided
 * @returns the number of blocks synced
 */
export const syncBptBalancesFromSubgraph = async (
    poolIds: string[],
    subgraphClient: UserBalancesSubgraphClient,
    chain: Chain,
    syncCategory?: 'BPT_BALANCES_V2' | 'BPT_BALANCES_V3' | 'BPT_BALANCES_COW_AMM' | 'BPT_BALANCES_FBEETS',
) => {
    // Must have poolIds to sync
    if (poolIds.length === 0) {
        console.log(`syncBptBalancesFromSubgraph ${syncCategory} on ${chain} no pools provided`);
        return 0;
    }

    // endBlock is the latest synced block on the subgraph
    const {
        block: { number: endBlock },
    } = await subgraphClient.getMetadata();

    // If the subgraph is not synced, throw
    const viemClient = getViemClient(chain);
    const latestBlock = await viemClient.getBlockNumber();
    if (Number(latestBlock) - endBlock > 60) {
        throw new Error(
            `syncBptBalancesFromSubgraph ${syncCategory} on ${chain} subgraph lagging behind by ${
                Number(latestBlock) - endBlock
            } blocks`,
        );
    }

    // Get the balances synced block from the DB
    const startBlock = syncCategory ? await getLastSyncedBlock(chain, syncCategory) : 0;
    const fromBlock = Math.max(startBlock - BALANCES_SYNC_BLOCKS_MARGIN, 0);
    const benchMessage = `syncBptBalancesFromSubgraph ${syncCategory} on ${chain} from ${fromBlock} to ${endBlock} for ${poolIds.length} pools`;
    console.log(benchMessage);
    console.time(benchMessage);
    const poolShares = await subgraphClient.getAllPoolSharesWithBalance(poolIds, [zeroAddress], fromBlock);
    console.timeEnd(benchMessage);
    console.log(`syncBptBalancesFromSubgraph ${syncCategory} on ${chain} got ${poolShares.length} poolShares`);
    const operations = balancesToDb(poolShares, endBlock, syncCategory);
    try {
        await prisma.$transaction(operations);
    } catch (e: any) {
        console.error(`syncBptBalancesFromSubgraph ${syncCategory}`, e.message);
        return 0;
    }

    return endBlock - startBlock;
};
