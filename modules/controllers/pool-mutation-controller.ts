import config from '../../config';
import { prisma } from '../../prisma/prisma-client';
import { syncPools } from '../actions/pool/v3/sync-pools';
import { syncSwaps } from '../actions/pool/v3/sync-swaps';
import { syncTokenPairs } from '../actions/pool/v3/sync-tokenpairs';
import { updateVolumeAndFees } from '../actions/pool/update-volume-and-fees';
import { getVaultSubgraphClient } from '../sources/subgraphs';
import { getViemClient } from '../sources/viem-client';
import { Chain } from '@prisma/client';

/**
 * Controller responsible for matching job requests to configured job handlers
 *
 * @param name - the name of the job
 * @param chain - the chain to run the job on
 * @returns a controller with configured job handlers
 */
export function PoolMutationController(tracer?: any) {
    // Setup tracing
    // ...
    return {
        async loadSwapsFeesVolumeForAllPoolsV3(chain: Chain) {
            const {
                subgraphs: { balancerV3 },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancerV3) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const vaultSubgraphClient = getVaultSubgraphClient(balancerV3, chain);

            const poolsWithNewSwaps = await syncSwaps(vaultSubgraphClient, chain);
            await updateVolumeAndFees(chain, poolsWithNewSwaps);
            return poolsWithNewSwaps;
        },
        async loadOnchainDataForAllPoolsV3(chain: Chain) {
            const {
                balancer: {
                    v3: { vaultAddress, routerAddress },
                },
            } = config[chain];

            // Guard against unconfigured chains
            if (!vaultAddress) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const pools = await prisma.prismaPool.findMany({
                where: { chain, protocolVersion: 3 },
            });
            const dbIds = pools.map((pool) => pool.id.toLowerCase());
            const viemClient = getViemClient(chain);
            const blockNumber = await viemClient.getBlockNumber();

            await syncPools(pools, viemClient, vaultAddress, chain, blockNumber);
            await syncTokenPairs(dbIds, viemClient, routerAddress, chain);
            return dbIds;
        },
    };
}
