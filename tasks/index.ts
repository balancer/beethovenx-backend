import moment from 'moment';
import {
    SftmxController,
    SnapshotsController,
    UserBalancesController,
    CowAmmController,
    AprsController,
    ContentController,
    FXPoolsController,
    PoolController,
    EventController,
    PoolMutationController,
    StakingController,
} from '../modules/controllers';
import { chainIdToChain } from '../modules/network/chain-id-to-chain';

import { backsyncSwaps } from './subgraph-syncing/backsync-swaps';

// TODO needed?
const sftmxController = SftmxController();
const snapshotsController = SnapshotsController();

/**
 * Used to run jobs or mutations locally from the command line
 * e.g. `yarn task sync-pools-v3 11155111`
 *
 * @param job
 * @param chain
 * @returns
 */
async function run(job: string = process.argv[2], chainId: string = process.argv[3]) {
    console.log('Running job', job, chainId);

    const chain = chainIdToChain[chainId];

    if (job === 'add-pools-v2') {
        return PoolController().addPoolsV2(chain);
    } else if (job === 'sync-all-pools-v2') {
        return PoolController().syncOnchainDataForAllPoolsV2(chain);
    } else if (job === 'sync-changed-pools-v2') {
        return PoolController().syncChangedPoolsV2(chain);
    } else if (job === 'add-pools-v3') {
        return PoolController().addPoolsV3(chain);
    } else if (job === 'reload-pools-v3') {
        return PoolController().reloadPoolsV3(chain);
    } else if (job === 'sync-pools-v3') {
        return PoolController().syncChangedPoolsV3(chain);
    } else if (job === 'sync-staking') {
        return StakingController().syncStaking(chain);
    } else if (job === 'sync-join-exits-v3') {
        return EventController().syncJoinExitsV3(chain);
    } else if (job === 'sync-join-exits-v2') {
        return EventController().syncJoinExitsV2(chain);
    } else if (job === 'sync-swaps-v2') {
        return EventController().syncSwapsUpdateVolumeAndFeesV2(chain);
    } else if (job === 'sync-snapshots-v2') {
        return snapshotsController.syncSnapshotsV2(chain);
    } else if (job === 'fill-missing-snapshots-v2') {
        return snapshotsController.fillMissingSnapshotsV2(chain);
    } else if (job === 'sync-snapshots-v3') {
        return snapshotsController.syncSnapshotsV3(chain);
    } else if (job === 'fill-missing-snapshots-v3') {
        return snapshotsController.fillMissingSnapshotsV3(chain);
    } else if (job === 'sync-swaps-v3') {
        return EventController().syncSwapsV3(chain);
    } else if (job === 'update-liquidity-24h-ago-v3') {
        return PoolController().updateLiquidity24hAgoV3(chain);
    } else if (job === 'sync-sftmx-staking') {
        return sftmxController.syncSftmxStakingData(chain);
    } else if (job === 'sync-sftmx-withdrawal') {
        return sftmxController.syncSftmxWithdrawalrequests(chain);
    } else if (job === 'sync-sftmx-staking-snapshots') {
        return sftmxController.syncSftmxStakingSnapshots(chain);
    } else if (job === 'sync-user-balances-v2') {
        return UserBalancesController().syncUserBalancesFromV2Subgraph(chain);
    } else if (job === 'sync-user-balances-v3') {
        return UserBalancesController().syncUserBalancesFromV3Subgraph(chain);
    } else if (job === 'load-onchain-data-v3') {
        return PoolMutationController().loadOnchainDataForAllPoolsV3(chain);
    } else if (job === 'add-new-cow-amm-pools') {
        return CowAmmController().addPools(chain);
    } else if (job === 'sync-cow-amm-pools') {
        return CowAmmController().syncPools(chain);
    } else if (job === 'reload-cow-amm-pools') {
        return CowAmmController().reloadPools(chain);
    } else if (job === 'sync-cow-amm-snapshots') {
        return CowAmmController().syncSnapshots(chain);
    } else if (job === 'sync-all-cow-amm-snapshots') {
        // Run in loop until we end up at todays snapshot (also sync todays)
        let allSnapshotsSynced = false;
        while (!allSnapshotsSynced) {
            allSnapshotsSynced =
                (await CowAmmController().syncSnapshots(chain)) === moment().utc().startOf('day').unix();
        }
        return allSnapshotsSynced;
    } else if (job === 'sync-cow-amm-swaps') {
        return CowAmmController().syncSwaps(chain);
    } else if (job === 'update-com-amm-volume-and-fees') {
        return CowAmmController().updateVolumeAndFees(chain);
    } else if (job === 'sync-cow-amm-join-exits') {
        return CowAmmController().syncJoinExits(chain);
    } else if (job === 'update-surplus-aprs') {
        return CowAmmController().updateSurplusAprs();
    } else if (job === 'update-cow-amm-volume-and-fees') {
        return CowAmmController().updateVolumeAndFees(chain);
    } else if (job === 'sync-cow-amm-balances') {
        return CowAmmController().syncBalances(chain);
    } else if (job === 'sync-categories') {
        return ContentController().syncCategories();
    } else if (job === 'sync-latest-fx-prices') {
        return FXPoolsController().syncLatestPrices(chain);
    } else if (job === 'backsync-swaps') {
        // Run in loop until no new swaps are found
        let status: string | undefined = 'true';
        let i = 0;
        while (status) {
            console.time('backsyncSwaps page time');
            status = await backsyncSwaps(chain);
            console.timeEnd('backsyncSwaps page time');
            i += 1000;
            console.log('Processed', i, 'swaps');
        }
        return 'OK';
    } else if (job === 'sync-merkl') {
        return AprsController().syncMerkl();
    } else if (job === 'sync-rate-provider-reviews') {
        return ContentController().syncRateProviderReviews();
    } else if (job === 'sync-hook-data') {
        return PoolController().syncHookData(chain);
    }
    return Promise.reject(new Error(`Unknown job: ${job}`));
}

run()
    .then((r) => console.log(r))
    .then(() => process.exit(0))
    .catch((e) => console.error(e));
