import { GraphQLClient } from 'graphql-request';
import {
    OrderDirection,
    Pool_OrderBy,
    PoolSnapshot_OrderBy,
    PoolsQueryVariables,
    SwapFragment,
    Swap_OrderBy,
    VaultPoolFragment,
    PoolShareFragment,
    PoolShare_OrderBy,
    getSdk,
    PoolBalancesFragment,
    PoolBalancesQueryVariables,
    PoolSnapshotFragment,
    PoolSnapshot_Filter,
} from './generated/types';
import { Chain, Prisma } from '@prisma/client';
import { snapshotToDb } from './transformers/snapshotToDb';

export function getVaultSubgraphClient(url: string, chain: Chain) {
    const sdk = getSdk(new GraphQLClient(url));

    return {
        ...sdk,
        chain: chain,
        async getMetadata() {
            return sdk.Metadata().then((response) => {
                if (response && response.meta) {
                    return response.meta;
                } else {
                    // Return a default value if meta is not present
                    return Promise.reject('Error fetching metadata');
                }
            });
        },
        async getAllPoolSharesWithBalance(
            poolIds: string[] = [],
            excludedAddresses: string[],
            startBlock?: number,
        ): Promise<Prisma.PrismaUserWalletBalanceCreateManyInput[]> {
            const allPoolShares: PoolShareFragment[] = [];
            let hasMore = true;
            let id = `0`;
            const pageSize = 1000;

            while (hasMore) {
                const shares = await sdk.PoolShares({
                    where: {
                        id_gt: id,
                        pool_in: poolIds.length > 0 ? poolIds : undefined,
                        user_not_in: excludedAddresses,
                        _change_block: startBlock && startBlock > 0 ? { number_gte: startBlock } : undefined,
                    },
                    orderBy: PoolShare_OrderBy.Id,
                    orderDirection: OrderDirection.Asc,
                    first: pageSize,
                });

                if (shares.poolShares.length === 0) {
                    break;
                }

                if (shares.poolShares.length < pageSize) {
                    hasMore = false;
                }

                allPoolShares.push(...shares.poolShares);
                id = shares.poolShares[shares.poolShares.length - 1].id;
            }

            return allPoolShares
                .map(({ id, balance }) => {
                    const [poolId, userAddress] = id.split('-').map((x) => x.toLowerCase());

                    return {
                        id,
                        poolId,
                        chain,
                        //ensure the user balance isn't negative, unsure how the subgraph ever allows this to happen
                        balance: parseFloat(balance) < 0 ? '0' : balance,
                        balanceNum: Math.max(0, parseFloat(balance)),
                        tokenAddress: poolId,
                        userAddress,
                    };
                })
                .filter((share) => (poolIds.length > 0 ? poolIds.includes(share.poolId) : true));
        },
        async getAllInitializedPools(where: PoolsQueryVariables['where']): Promise<VaultPoolFragment[]> {
            const limit = 1000;
            let hasMore = true;
            let id = `0x`;
            let pools: VaultPoolFragment[] = [];

            while (hasMore) {
                const response = await sdk.Pools({
                    where: { ...where, id_gt: id, isInitialized: true },
                    orderBy: Pool_OrderBy.Id,
                    orderDirection: OrderDirection.Asc,
                    first: limit,
                });

                pools = [...pools, ...response.pools];

                if (response.pools.length < limit) {
                    hasMore = false;
                } else {
                    id = response.pools[response.pools.length - 1].id;
                }
            }

            return pools;
        },
        async getSnapshotsForTimestamp(timestamp: number): Promise<PoolSnapshotFragment[]> {
            const limit = 1000;
            let hasMore = true;
            let id = `0x`;
            let snapshots: PoolSnapshotFragment[] = [];

            while (hasMore) {
                const response = await sdk.PoolSnapshots({
                    where: { timestamp, id_gt: id },
                    orderBy: PoolSnapshot_OrderBy.Id,
                    orderDirection: OrderDirection.Asc,
                    first: limit,
                });

                snapshots = [...snapshots, ...response.poolSnapshots];

                if (response.poolSnapshots.length < limit) {
                    hasMore = false;
                } else {
                    id = snapshots[snapshots.length - 1].id;
                }
            }

            return snapshots;
        },
        async getAllSnapshots(where: PoolSnapshot_Filter): Promise<Prisma.PrismaPoolSnapshotUncheckedCreateInput[]> {
            const limit = 1000;
            let hasMore = true;
            let id = `0x`;
            let snapshots: PoolSnapshotFragment[] = [];

            while (hasMore) {
                const response = await sdk.PoolSnapshots({
                    where: { ...where, id_gt: id },
                    orderBy: PoolSnapshot_OrderBy.Id,
                    orderDirection: OrderDirection.Asc,
                    first: limit,
                });

                snapshots = [...snapshots, ...response.poolSnapshots];

                if (response.poolSnapshots.length < limit) {
                    hasMore = false;
                } else {
                    id = snapshots[snapshots.length - 1].id;
                }
            }

            return snapshots.map((s) => snapshotToDb(chain, 3, s));
        },
        async getSwapsSince(timestamp: number): Promise<SwapFragment[]> {
            const limit = 1000;
            let hasMore = true;
            let startTimestamp = `${timestamp}`;
            let swaps: SwapFragment[] = [];

            while (hasMore) {
                const response = await sdk.Swaps({
                    where: { blockTimestamp_gt: startTimestamp },
                    orderBy: Swap_OrderBy.BlockTimestamp,
                    orderDirection: OrderDirection.Asc,
                    first: limit,
                });

                swaps = [...swaps, ...response.swaps];

                if (response.swaps.length < limit) {
                    hasMore = false;
                } else {
                    startTimestamp = response.swaps[response.swaps.length - 1].blockTimestamp;
                }
            }

            return swaps;
        },
        async getAllPoolShares(): Promise<PoolShareFragment[]> {
            const limit = 1000;
            let hasMore = true;
            let id = `0x`;
            let poolShares: PoolShareFragment[] = [];

            while (hasMore) {
                const response = await sdk.PoolShares({
                    where: { id_gt: id, user_not: '0x0000000000000000000000000000000000000000' },
                    orderBy: PoolShare_OrderBy.Id,
                    orderDirection: OrderDirection.Asc,
                    first: limit,
                });

                poolShares = [...poolShares, ...response.poolShares];

                if (response.poolShares.length < limit) {
                    hasMore = false;
                } else {
                    id = response.poolShares[response.poolShares.length - 1].id;
                }
            }

            return poolShares;
        },
        async getAllPoolBalances({ where, block }: PoolBalancesQueryVariables): Promise<PoolBalancesFragment[]> {
            const limit = 1000;
            let hasMore = true;
            let id = `0x`;
            let data: PoolBalancesFragment[] = [];

            while (hasMore) {
                const response = await sdk.PoolBalances({
                    where: { ...where, id_gt: id },
                    orderBy: Pool_OrderBy.Id,
                    orderDirection: OrderDirection.Asc,
                    first: limit,
                    block,
                });

                data = [...data, ...response.pools];

                if (response.pools.length < limit) {
                    hasMore = false;
                } else {
                    id = response.pools[response.pools.length - 1].id;
                }
            }

            return data;
        },
    };
}

export type V3VaultSubgraphClient = ReturnType<typeof getVaultSubgraphClient>;

export class BalancerVaultSubgraphSource {
    private sdk: ReturnType<typeof getSdk>;

    /**
     * Creates a subgraph source based on subgraph URL
     * @param subgraphUrl
     */
    constructor(subgraphUrl: string) {
        this.sdk = getSdk(new GraphQLClient(subgraphUrl));
    }

    public async getAllInitializedPools(): Promise<VaultPoolFragment[]> {
        const limit = 1000;
        let hasMore = true;
        let id = `0x`;
        let pools: VaultPoolFragment[] = [];

        while (hasMore) {
            const response = await this.sdk.Pools({
                where: { id_gt: id, isInitialized: true },
                orderBy: Pool_OrderBy.Id,
                orderDirection: OrderDirection.Asc,
                first: limit,
            });

            pools = [...pools, ...response.pools];

            if (response.pools.length < limit) {
                hasMore = false;
            } else {
                id = response.pools[response.pools.length - 1].id;
            }
        }

        return pools;
    }

    public async getSwapsSince(timestamp: number): Promise<SwapFragment[]> {
        const limit = 1000;
        let hasMore = true;
        let startTimestamp = `${timestamp}`;
        let swaps: SwapFragment[] = [];

        while (hasMore) {
            const response = await this.sdk.Swaps({
                where: { blockTimestamp_gt: startTimestamp },
                orderBy: Swap_OrderBy.BlockTimestamp,
                orderDirection: OrderDirection.Asc,
                first: limit,
            });

            swaps = [...swaps, ...response.swaps];

            if (response.swaps.length < limit) {
                hasMore = false;
            } else {
                startTimestamp = response.swaps[response.swaps.length - 1].blockTimestamp;
            }
        }

        return swaps;
    }
}
