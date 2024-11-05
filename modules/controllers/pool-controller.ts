import config from '../../config';
import { addPools as addPoolsV2 } from '../actions/pool/v2/add-pools';
import { getV2SubgraphClient } from '../subgraphs/balancer-subgraph';
import {
    syncOnchainDataForAllPools as syncOnchainDataForAllPoolsV2,
    syncChangedPools as syncChangedPoolsV2,
    syncOnChainDataForPools as syncOnChainDataForPoolsV2,
} from '../actions/pool/v2';
import { getViemClient } from '../sources/viem-client';
import { getBlockNumbersSubgraphClient, getV3JoinedSubgraphClient, getVaultSubgraphClient } from '../sources/subgraphs';
import { prisma } from '../../prisma/prisma-client';
import { updateLiquidity24hAgo, updateLiquidityValuesForPools } from '../actions/pool/update-liquidity';
import { Chain, PrismaLastBlockSyncedCategory } from '@prisma/client';
import { getVaultClient } from '../sources/contracts/v3/vault-client';
import { upsertPools as upsertPoolsV3 } from '../actions/pool/v3/upsert-pools';
import { syncPools as syncPoolsV3 } from '../actions/pool/v3/sync-pools';
import { getChangedPoolsV3 } from '../sources/logs/get-changed-pools';
import { syncTokenPairs } from '../actions/pool/v3/sync-tokenpairs';
import { HookType } from '../network/network-config-types';
import { syncHookData } from '../actions/pool/v3/sync-hook-data';
import { getLastSyncedBlock, upsertLastSyncedBlock } from '../actions/pool/last-synced-block';

export function PoolController(tracer?: any) {
    return {
        async addPoolsV2(chain: Chain) {
            const subgraphUrl = config[chain].subgraphs.balancer;
            const subgraphService = getV2SubgraphClient(subgraphUrl, chain);

            return addPoolsV2(subgraphService, chain);
        },

        async syncOnchainDataForAllPoolsV2(chain: Chain) {
            const vaultAddress = config[chain].balancer.v2.vaultAddress;
            const balancerQueriesAddress = config[chain].balancer.v2.balancerQueriesAddress;
            const yieldProtocolFeePercentage = config[chain].balancer.v2.defaultYieldFeePercentage;
            const swapProtocolFeePercentage = config[chain].balancer.v2.defaultSwapFeePercentage;
            const gyroConfig = config[chain].gyro?.config;

            const viemClient = getViemClient(chain);
            const latestBlock = await viemClient.getBlockNumber();

            return syncOnchainDataForAllPoolsV2(
                Number(latestBlock),
                chain,
                vaultAddress,
                balancerQueriesAddress,
                yieldProtocolFeePercentage,
                swapProtocolFeePercentage,
                gyroConfig,
            );
        },

        async syncOnchainDataForPoolsV2(chain: Chain, poolIds: string[]) {
            const vaultAddress = config[chain].balancer.v2.vaultAddress;
            const balancerQueriesAddress = config[chain].balancer.v2.balancerQueriesAddress;
            const yieldProtocolFeePercentage = config[chain].balancer.v2.defaultYieldFeePercentage;
            const swapProtocolFeePercentage = config[chain].balancer.v2.defaultSwapFeePercentage;
            const gyroConfig = config[chain].gyro?.config;

            const viemClient = getViemClient(chain);
            const latestBlock = await viemClient.getBlockNumber();

            return syncOnChainDataForPoolsV2(
                poolIds,
                Number(latestBlock),
                chain,
                vaultAddress,
                balancerQueriesAddress,
                yieldProtocolFeePercentage,
                swapProtocolFeePercentage,
                gyroConfig,
            );
        },

        async syncChangedPoolsV2(chain: Chain) {
            const vaultAddress = config[chain].balancer.v2.vaultAddress;
            const balancerQueriesAddress = config[chain].balancer.v2.balancerQueriesAddress;
            const yieldProtocolFeePercentage = config[chain].balancer.v2.defaultYieldFeePercentage;
            const swapProtocolFeePercentage = config[chain].balancer.v2.defaultSwapFeePercentage;
            const gyroConfig = config[chain].gyro?.config;

            return syncChangedPoolsV2(
                chain,
                vaultAddress,
                balancerQueriesAddress,
                yieldProtocolFeePercentage,
                swapProtocolFeePercentage,
                gyroConfig,
            );
        },

        async updateLiquidity24hAgoV2(chain: Chain) {
            const {
                subgraphs: { balancer, blocks },
            } = config[chain];

            // Guard against unconfigured chains
            const subgraph = balancer && getV2SubgraphClient(balancer, chain);

            if (!subgraph) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const blocksSubgraph = getBlockNumbersSubgraphClient(blocks);

            const poolIds = await prisma.prismaPoolDynamicData.findMany({
                where: { chain },
                select: { poolId: true },
            });

            const updates = await updateLiquidity24hAgo(
                poolIds.map(({ poolId }) => poolId),
                subgraph,
                blocksSubgraph,
                chain,
            );

            return updates;
        },

        async updateLiquidityValuesForActivePools(chain: Chain) {
            const pools = await prisma.prismaPool.findMany({
                where: {
                    chain,
                    dynamicData: {
                        totalSharesNum: { gt: 0.00000000001 },
                    },
                },
                select: { id: true },
            });

            await updateLiquidityValuesForPools(
                chain,
                pools.map(({ id }) => id),
            );
        },
        async updateLiquidityValuesForInactivePools(chain: Chain) {
            const pools = await prisma.prismaPool.findMany({
                where: {
                    chain,
                    dynamicData: {
                        totalSharesNum: { lte: 0.00000000001 },
                    },
                },
                select: { id: true },
            });

            await updateLiquidityValuesForPools(
                chain,
                pools.map(({ id }) => id),
            );
        },
        /**
         * Adds new pools found in subgraph to the database
         *
         * @param chain
         */
        async addPoolsV3(chain: Chain) {
            const {
                subgraphs: { balancerV3, balancerPoolsV3 },
                balancer: {
                    v3: { vaultAddress },
                },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancerV3 || !balancerPoolsV3 || !vaultAddress) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const pools = await prisma.prismaPool.findMany({
                where: { chain },
            });
            const ids = pools.map((pool) => pool.id);
            if (ids.length === 0) ids.push('');
            const client = getV3JoinedSubgraphClient(balancerV3, balancerPoolsV3);

            // TODO this might break once we have a lot of pools because the filter gets too big
            const newPools = await client.getAllInitializedPools({ id_not_in: ids });

            const viemClient = getViemClient(chain);
            const vaultClient = getVaultClient(viemClient, vaultAddress);
            const latestBlock = await viemClient.getBlockNumber();

            const added = await upsertPoolsV3(
                newPools.sort((a, b) => parseFloat(a.blockTimestamp) - parseFloat(b.blockTimestamp)),
                vaultClient,
                chain,
                latestBlock,
            );

            return added;
        },
        /**
         * Takes all the pools from subgraph, enriches with onchain data and upserts them to the database
         *
         * @param chainId
         */
        async reloadPoolsV3(chain: Chain) {
            const {
                subgraphs: { balancerV3, balancerPoolsV3 },
                balancer: {
                    v3: { vaultAddress },
                },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancerV3 || !balancerPoolsV3 || !vaultAddress) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const client = getV3JoinedSubgraphClient(balancerV3, balancerPoolsV3);
            const allPools = await client.getAllInitializedPools();

            const viemClient = getViemClient(chain);
            const vaultClient = getVaultClient(viemClient, vaultAddress);
            const latestBlock = await viemClient.getBlockNumber();

            const poolsIds = await upsertPoolsV3(allPools, vaultClient, chain, latestBlock);
            const pools = await prisma.prismaPool.findMany({ where: { chain, id: { in: poolsIds } } });
            await syncPoolsV3(pools, viemClient, vaultAddress, chain, latestBlock);

            await upsertLastSyncedBlock(chain, PrismaLastBlockSyncedCategory.POOLS_V3, latestBlock);

            return poolsIds;
        },
        /**
         * Syncs database pools state with the onchain state
         *
         * @param chainId
         */
        async syncChangedPoolsV3(chain: Chain) {
            const {
                balancer: {
                    v3: { vaultAddress, routerAddress },
                },
            } = config[chain];

            // Guard against unconfigured chains
            if (!vaultAddress) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const viemClient = getViemClient(chain);

            const lastSyncBlock = await getLastSyncedBlock(chain, PrismaLastBlockSyncedCategory.POOLS_V3);
            const fromBlock = lastSyncBlock + 1;
            const toBlock = await viemClient.getBlockNumber();

            // Sepolia vault deployment block, uncomment to test from the beginning
            // const fromBlock = 5274748n;

            // Guard against unsynced pools
            if (fromBlock === 0) {
                throw new Error(`No synced pools found for chain: ${chain}. Reload pools first.`);
            }

            const pools = await prisma.prismaPool.findMany({
                where: { chain, protocolVersion: 3 },
            });

            const changedPools = await getChangedPoolsV3(vaultAddress, viemClient, BigInt(fromBlock), BigInt(toBlock));

            const changedPoolsIds = changedPools.map((id) => id.toLowerCase());
            const poolsToSync = pools.filter((pool) => changedPoolsIds.includes(pool.id.toLowerCase())); // only sync pools that are in the database
            if (poolsToSync.length === 0) {
                return [];
            }
            await syncPoolsV3(poolsToSync, viemClient, vaultAddress, chain, toBlock);
            await syncTokenPairs(
                poolsToSync.map(({ id }) => id),
                viemClient,
                routerAddress,
                chain,
            );

            await upsertLastSyncedBlock(chain, PrismaLastBlockSyncedCategory.POOLS_V3, toBlock);

            return poolsToSync.map(({ id }) => id);
        },
        async updateLiquidity24hAgoV3(chain: Chain) {
            const {
                subgraphs: { balancerV3, blocks },
            } = config[chain];

            // Guard against unconfigured chains
            const subgraph = balancerV3 && getVaultSubgraphClient(balancerV3);

            if (!subgraph) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const blocksSubgraph = getBlockNumbersSubgraphClient(blocks);

            const poolIds = await prisma.prismaPoolDynamicData.findMany({
                where: { chain },
                select: { poolId: true },
            });

            const updates = await updateLiquidity24hAgo(
                poolIds.map(({ poolId }) => poolId),
                subgraph,
                blocksSubgraph,
                chain,
            );

            return updates;
        },
        async syncHookData(chain: Chain) {
            const { hooks } = config[chain];

            // Guard against unconfigured chains
            if (!hooks) {
                // Chain doesn't have hooks
                return;
            }

            // Get hook addresses from the database
            const addresses = await prisma.prismaHook
                .findMany({
                    where: { chain },
                    select: { address: true },
                })
                .then((hooks) => hooks.map(({ address }) => address));

            // Map hooks to their config names
            const mappedHooks = addresses.reduce((acc, address) => {
                // find key in config object that has the same value as address
                const keys = Object.keys(hooks) as HookType[];
                const key = keys.find((key) => hooks[key]?.includes(address));
                if (key) {
                    acc[address] = key;
                }
                return acc;
            }, {} as Record<string, HookType>);

            const viemClient = getViemClient(chain);

            await syncHookData(mappedHooks, viemClient, chain);
        },
    };
}
