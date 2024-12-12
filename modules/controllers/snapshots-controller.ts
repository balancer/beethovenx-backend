import { Chain } from '@prisma/client';
import config from '../../config';
import { prisma } from '../../prisma/prisma-client';
import { syncSnapshotsV2, fillMissingSnapshotsV2, syncSnapshots } from '../actions/snapshots';
import { PoolSnapshotService } from '../actions/snapshots/pool-snapshot-service';
import { getVaultSubgraphClient } from '../sources/subgraphs';
import { getV2SubgraphClient } from '../subgraphs/balancer-subgraph';
import { updateLifetimeValues } from '../actions/pool/update-liftetime-values';

/**
 * Controller responsible for configuring and executing ETL actions.
 *
 * @example
 * ```ts
 * const snapshotsController = SnapshotsController();
 * await snapshotsController.syncSnapshotsV3('1');
 * ```
 *
 * @param name - the name of the action
 * @param chain - the chain to run the action on
 * @returns a controller with configured action handlers
 */
export function SnapshotsController(tracer?: any) {
    // Setup tracing
    // ...
    return {
        async syncSnapshotsV2(chain: Chain) {
            const {
                subgraphs: { balancer },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancer) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const subgraphClient = getV2SubgraphClient(balancer, chain);
            const entries = await syncSnapshotsV2(subgraphClient, chain);
            return entries;
        },
        async syncSnapshotForPools(poolIds: string[], chain: Chain, reload = false) {
            const {
                subgraphs: { balancer },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancer) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const prices = await prisma.prismaTokenCurrentPrice
                .findMany({
                    where: {
                        chain,
                    },
                    select: {
                        tokenAddress: true,
                        price: true,
                    },
                })
                .then((prices) => prices.reduce((acc, p) => ({ ...acc, [p.tokenAddress]: p.price }), {}));

            const subgraphClient = getV2SubgraphClient(balancer, chain);
            const service = new PoolSnapshotService(subgraphClient, chain, prices);
            const entries = await service.loadAllSnapshotsForPools(poolIds, reload);

            return entries;
        },
        async syncSnapshotsV3(chain: Chain) {
            const {
                subgraphs: { balancerV3 },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancerV3) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const vaultSubgraphClient = getVaultSubgraphClient(balancerV3, chain);
            const entries = await syncSnapshots(vaultSubgraphClient, 'SNAPSHOTS_V3', chain);
            // update lifetime values based on snapshots
            await updateLifetimeValues(chain, 3);
            return entries;
        },
        async syncAllSnapshotsV3(chain: Chain) {
            const {
                subgraphs: { balancerV3 },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancerV3) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const vaultSubgraphClient = getVaultSubgraphClient(balancerV3, chain);
            const entries = await syncSnapshots(vaultSubgraphClient, 'SNAPSHOTS_V3', chain, {
                startFromLastSyncedBlock: false,
            });
            // update lifetime values based on snapshots
            await updateLifetimeValues(chain, 3);
            return entries;
        },
        async fillMissingSnapshotsV2(chain: Chain) {
            const entries = await fillMissingSnapshotsV2(chain);
            return entries;
        },
    };
}
