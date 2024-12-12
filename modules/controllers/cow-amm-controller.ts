import config from '../../config';
import { prisma } from '../../prisma/prisma-client';
import { chainIdToChain } from '../network/chain-id-to-chain';
import { getViemClient } from '../sources/viem-client';
import { getCowAmmSubgraphClient } from '../sources/subgraphs';
import {
    fetchChangedPools,
    fetchNewPools,
    upsertPools,
    syncSnapshots,
    syncSwaps,
    syncJoinExits,
    updateSurplusAPRs,
} from '../actions/cow-amm';
import { Chain, PrismaLastBlockSyncedCategory } from '@prisma/client';
import { updateVolumeAndFees } from '../actions/pool/update-volume-and-fees';
import moment from 'moment';
import { upsertBptBalances } from '../actions/cow-amm/upsert-bpt-balances';
import { getLastSyncedBlock, upsertLastSyncedBlock } from '../actions/pool/last-synced-block';
import { updateLifetimeValues } from '../actions/pool/update-liftetime-values';

export function CowAmmController(tracer?: any) {
    const getSubgraphClient = (chain: Chain) => {
        const {
            subgraphs: { cowAmm },
        } = config[chain];

        // Guard against unconfigured chains
        if (!cowAmm) {
            throw new Error(`Chain not configured: ${chain}`);
        }

        const client = getCowAmmSubgraphClient(cowAmm);

        return client;
    };
    return {
        /**
         * Adds new pools found in subgraph to the database
         *
         * @param chainId
         */
        async addPools(chain: Chain) {
            const subgraphClient = getSubgraphClient(chain);
            const newPools = await fetchNewPools(subgraphClient, chain);
            const viemClient = getViemClient(chain);
            const blockNumber = await viemClient.getBlockNumber();

            const ids = await upsertPools(newPools, viemClient, subgraphClient, chain, blockNumber);
            // Initialize balances for the new pools
            await upsertBptBalances(subgraphClient, chain, ids);

            return ids;
        },
        /**
         * Takes all the pools from subgraph, enriches with onchain data and upserts them to the database
         *
         * @param chainId
         */
        async reloadPools(chain: Chain) {
            const subgraphClient = getSubgraphClient(chain);
            const allPools = await subgraphClient.getAllPools({ isInitialized: true });
            const viemClient = getViemClient(chain);
            const blockNumber = await viemClient.getBlockNumber();

            await upsertPools(
                allPools.map((pool) => pool.id),
                viemClient,
                subgraphClient,
                chain,
                blockNumber,
            );

            return allPools.map((pool) => pool.id);
        },
        /**
         * Syncs database pools state with the onchain state, based on the events
         *
         * @param chainId
         */
        async syncPools(chain: Chain) {
            const subgraphClient = getSubgraphClient(chain);
            const viemClient = getViemClient(chain);

            let lastSyncBlock = await getLastSyncedBlock(chain, PrismaLastBlockSyncedCategory.COW_AMM_POOLS);

            const fromBlock = lastSyncBlock + 1;
            const toBlock = await viemClient.getBlockNumber();

            // no new blocks have been minted, needed for slow networks
            if (fromBlock > toBlock) {
                return [];
            }

            let poolsToSync: string[] = [];

            if (fromBlock > 1) {
                const changedPools = await fetchChangedPools(viemClient, chain, fromBlock, Number(toBlock));

                if (changedPools.length === 0) {
                    return [];
                }
                poolsToSync = changedPools;
            } else {
                poolsToSync = await prisma.prismaPool
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
            }

            await upsertPools(poolsToSync, viemClient, subgraphClient, chain, toBlock);
            await updateVolumeAndFees(chain, poolsToSync);
            await updateSurplusAPRs();

            await upsertLastSyncedBlock(chain, PrismaLastBlockSyncedCategory.COW_AMM_POOLS, Number(toBlock));

            return poolsToSync;
        },
        async syncSnapshots(chain: Chain) {
            const subgraphClient = getSubgraphClient(chain);
            const timestamp = await syncSnapshots(subgraphClient, chain);
            // update lifetime values based on snapshots
            await updateLifetimeValues(chain, undefined, 'COW_AMM');
            return timestamp;
        },
        async syncAllSnapshots(chain: Chain) {
            // Run in loop until we end up at todays snapshot (also sync todays)
            let allSnapshotsSynced = false;
            let timestamp = 0;
            while (!allSnapshotsSynced) {
                timestamp = await CowAmmController().syncSnapshots(chain);
                allSnapshotsSynced = timestamp === moment().utc().startOf('day').unix();
            }
            return timestamp;
        },
        async syncJoinExits(chain: Chain) {
            const subgraphClient = getSubgraphClient(chain);
            const entries = await syncJoinExits(subgraphClient, chain);
            return entries;
        },
        async syncSwaps(chain: Chain) {
            const subgraphClient = getSubgraphClient(chain);
            const swaps = await syncSwaps(subgraphClient, chain);
            const poolIds = swaps
                .map((event) => event.poolId)
                .filter((value, index, self) => self.indexOf(value) === index);
            return poolIds;
        },
        async updateSurplusAprs() {
            const aprs = await updateSurplusAPRs();
            return aprs;
        },
        async updateVolumeAndFees(chain: Chain) {
            const cowPools = await prisma.prismaPool.findMany({ where: { chain, type: 'COW_AMM' } });
            await updateVolumeAndFees(
                chain,
                cowPools.map((pool) => pool.id),
            );
            return true;
        },
        async syncBalances(chain: Chain) {
            let subgraphClient: ReturnType<typeof getSubgraphClient>;
            try {
                subgraphClient = getSubgraphClient(chain);
            } catch (e) {
                return false;
            }

            await upsertBptBalances(subgraphClient, chain);

            return true;
        },
    };
}
