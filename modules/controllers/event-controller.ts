import config from '../../config';

import { BalancerSubgraphService } from '../subgraphs/balancer-subgraph/balancer-subgraph.service';
import { getV2SubgraphClient } from '../subgraphs/balancer-subgraph';
import { syncJoinExits as syncJoinExitsV2 } from '../actions/pool/v2/sync-join-exits';
import { syncJoinExits as syncJoinExitsV3 } from '../actions/pool/v3/sync-join-exits';
import { syncSwaps as syncSwapsV2, syncSwapsForLast48Hours } from '../actions/pool/v2/sync-swaps';
import { syncSwaps as syncSwapsV3 } from '../actions/pool/v3/sync-swaps';
import { Chain } from '@prisma/client';
import { updateVolumeAndFees } from '../actions/pool/update-volume-and-fees';
import { getVaultSubgraphClient } from '../sources/subgraphs/balancer-v3-vault';

export function EventController() {
    return {
        async syncJoinExitsV2(chain: Chain) {
            const {
                subgraphs: { balancer },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancer) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const subgraphClient = new BalancerSubgraphService(balancer, chain);
            const entries = await syncJoinExitsV2(subgraphClient, chain);
            return entries;
        },
        async syncSwapsUpdateVolumeAndFeesV2(chain: Chain) {
            const {
                subgraphs: { balancer },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancer) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const subgraphClient = getV2SubgraphClient(balancer, chain);
            const poolsWithNewSwaps = await syncSwapsV2(subgraphClient, chain);
            await syncSwapsForLast48Hours(subgraphClient, chain);
            await updateVolumeAndFees(chain, poolsWithNewSwaps);

            return poolsWithNewSwaps;
        },
        async syncJoinExitsV3(chain: Chain) {
            const {
                subgraphs: { balancerV3 },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancerV3) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const vaultSubgraphClient = getVaultSubgraphClient(balancerV3, chain);
            const entries = await syncJoinExitsV3(vaultSubgraphClient, chain);
            return entries;
        },
        async syncSwapsV3(chain: Chain) {
            const {
                subgraphs: { balancerV3 },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancerV3) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const vaultSubgraphClient = getVaultSubgraphClient(balancerV3, chain);
            const entries = await syncSwapsV3(vaultSubgraphClient, chain);
            return entries;
        },
        async syncSwapsUpdateVolumeAndFeesV3(chain: Chain) {
            const {
                subgraphs: { balancerV3 },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancerV3) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const vaultSubgraphClient = getVaultSubgraphClient(balancerV3, chain);

            const poolsWithNewSwaps = await syncSwapsV3(vaultSubgraphClient, chain);
            await updateVolumeAndFees(chain, poolsWithNewSwaps);
            return poolsWithNewSwaps;
        },
    };
}
