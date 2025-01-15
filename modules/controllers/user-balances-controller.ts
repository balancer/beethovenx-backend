import { Chain } from '@prisma/client';
import config from '../../config';
import {
    syncBptBalancesV2,
    syncBptBalancesV3,
    syncBptBalancesCowAmm,
    syncBptBalancesFbeets,
} from '../actions/user/bpt-balances';

export function UserBalancesController(tracer?: any) {
    return {
        async syncBalances(chain: Chain) {
            const {
                subgraphs: { balancer, balancerV3, cowAmm, beetsBar },
            } = config[chain];

            // Run all syncs in parallel
            await Promise.all([
                syncBptBalancesV2(chain, balancer),
                syncBptBalancesV3(chain, balancerV3),
                syncBptBalancesCowAmm(chain, cowAmm),
                syncBptBalancesFbeets(chain, beetsBar),
            ]);

            return true;
        },
        async syncUserBalancesFromV2Subgraph(chain: Chain) {
            const {
                subgraphs: { balancer },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancer) {
                throw new Error(`Chain not configured: ${chain}`);
            }

            const syncedBlocks = await syncBptBalancesV2(chain, balancer);
            return syncedBlocks;
        },
        async syncUserBalancesFromV3Subgraph(chain: Chain) {
            const {
                subgraphs: { balancerV3 },
            } = config[chain];

            // Guard against unconfigured chains
            if (!balancerV3) {
                return [];
            }

            const syncedBlocks = await syncBptBalancesV3(chain, balancerV3);
            return syncedBlocks;
        },
    };
}
