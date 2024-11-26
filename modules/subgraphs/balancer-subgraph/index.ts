import { GraphQLClient } from 'graphql-request';
import {
    OrderDirection,
    PoolBalancesFragment,
    PoolBalancesQueryVariables,
    BalancerPoolSnapshotFragment,
    Pool_OrderBy,
    PoolSnapshot_OrderBy,
    getSdk,
} from './generated/balancer-subgraph-types';
import { BalancerSubgraphService } from './balancer-subgraph.service';
import { wrapSdkWithRetryAndRotation } from '../../sources/subgraphs/retry-on-failure';
import { Chain } from '@prisma/client';

export type V2SubgraphClient = ReturnType<typeof getV2SubgraphClient>;

export function getV2SubgraphClient(urls: string[], chain: Chain) {
    const sdkClients = urls.map((url) => getSdk(new GraphQLClient(url)));
    const sdkWithRetryAndRotation = wrapSdkWithRetryAndRotation(sdkClients);

    return {
        ...sdkWithRetryAndRotation,
        legacyService: new BalancerSubgraphService(urls, chain),
        async getAllSnapshotIds(poolId?: string): Promise<string[]> {
            const limit = 1000;
            let hasMore = true;
            let id = `0x`;
            let items: { id: string }[] = [];
            const where = poolId ? { pool: poolId } : {};

            while (hasMore) {
                const response = await sdkWithRetryAndRotation.BalancerSnapshotIds({
                    where: { ...where, id_gt: id },
                    orderBy: PoolSnapshot_OrderBy.Id,
                    orderDirection: OrderDirection.Asc,
                    first: limit,
                });

                items = [...items, ...response.poolSnapshots];

                if (response.poolSnapshots.length < limit) {
                    hasMore = false;
                } else {
                    id = items[items.length - 1].id;
                }
            }

            return items.map(({ id }) => id);
        },
        async getSnapshotsForTimestamp(timestamp: number): Promise<BalancerPoolSnapshotFragment[]> {
            const limit = 1000;
            let hasMore = true;
            let id = `0x`;
            let snapshots: BalancerPoolSnapshotFragment[] = [];

            while (hasMore) {
                const response = await sdkWithRetryAndRotation.BalancerPoolSnapshots({
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
        async getAllPoolBalances({ where, block }: PoolBalancesQueryVariables): Promise<PoolBalancesFragment[]> {
            const limit = 1000;
            let hasMore = true;
            let id = `0x`;
            let data: PoolBalancesFragment[] = [];

            while (hasMore) {
                const response = await sdkWithRetryAndRotation.PoolBalances({
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
