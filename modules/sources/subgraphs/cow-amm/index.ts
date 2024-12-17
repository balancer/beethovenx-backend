import { GraphQLClient } from 'graphql-request';
import {
    OrderDirection,
    Pool_OrderBy,
    PoolsQueryVariables,
    CowAmmPoolFragment,
    getSdk,
    CowAmmSnapshotFragment,
    PoolSnapshot_OrderBy,
    PoolShareFragment,
    PoolShare_OrderBy,
    PoolSharesQueryVariables,
    PoolSnapshot_Filter,
} from './generated/types';
import { snapshotToDb } from './transformers/snapshotsToDb';
import { Chain, Prisma } from '@prisma/client';

/**
 * Builds a client based on subgraph URL.
 *
 * @param subgraphUrl - url of the subgraph
 * @returns sdk - generated sdk for the subgraph
 */
export const getCowAmmSubgraphClient = (subgraphUrl: string, chain: Chain) => {
    const client = new GraphQLClient(subgraphUrl);
    const sdk = getSdk(client);

    return {
        ...sdk,
        async getMetadata() {
            const { meta } = await sdk.Metadata();
            if (!meta) {
                throw new Error('Missing meta data');
            }
            return meta;
        },
        async getAllPools(where: PoolsQueryVariables['where']): Promise<CowAmmPoolFragment[]> {
            const limit = 1000;
            let hasMore = true;
            let id = `0x`;
            let pools: CowAmmPoolFragment[] = [];

            while (hasMore) {
                const response = await sdk.Pools({
                    where: { ...where, id_gt: id },
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
        async getAllPoolShares(where?: PoolSharesQueryVariables['where']): Promise<PoolShareFragment[]> {
            const limit = 1000;
            let hasMore = true;
            let id = `0x`;
            let poolShares: PoolShareFragment[] = [];

            while (hasMore) {
                const response = await sdk.PoolShares({
                    where: { ...where, id_gt: id, user_not: '0x0000000000000000000000000000000000000000' },
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
        async getSnapshotsForTimestamp(timestamp: number): Promise<CowAmmSnapshotFragment[]> {
            const limit = 1000;
            let hasMore = true;
            let id = `0x`;
            let snapshots: CowAmmSnapshotFragment[] = [];

            while (hasMore) {
                const response = await sdk.Snapshots({
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
            let snapshots: CowAmmSnapshotFragment[] = [];

            while (hasMore) {
                const response = await sdk.Snapshots({
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

            return snapshots.map((s) => snapshotToDb(chain, 1, s));
        },
    };
};

export type CowAmmSubgraphClient = ReturnType<typeof getCowAmmSubgraphClient>;
