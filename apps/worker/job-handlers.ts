import * as Sentry from '@sentry/node';
import { Express, NextFunction } from 'express';
import { tokenService } from '../../modules/token/token.service';
import { poolService } from '../../modules/pool/pool.service';
import { blocksSubgraphService } from '../../modules/subgraphs/blocks-subgraph/blocks-subgraph.service';
import { userService } from '../../modules/user/user.service';
import { protocolService } from '../../modules/protocol/protocol.service';
import { datastudioService } from '../../modules/datastudio/datastudio.service';
import { initRequestScopedContext, setRequestScopedContextValue } from '../../modules/context/request-scoped-context';
import { networkContext } from '../../modules/network/network-context.service';
import { veBalService } from '../../modules/vebal/vebal.service';
import { veBalVotingListService } from '../../modules/vebal/vebal-voting-list.service';
import { cronsMetricPublisher } from '../../modules/metrics/metrics.client';
import moment from 'moment';
import { cronsDurationMetricPublisher } from '../../modules/metrics/cron-duration-metrics.client';
import { syncLatestFXPrices } from '../../modules/token/latest-fx-price';
import { AllNetworkConfigs, AllNetworkConfigsKeyedOnChain } from '../../modules/network/network-config';
import { chainIdToChain } from '../../modules/network/chain-id-to-chain';
import { Chain } from '@prisma/client';
import {
    SftmxController,
    CowAmmController,
    SnapshotsController,
    AprsController,
    ContentController,
    PoolController,
    EventController,
    StakingController,
} from '../../modules/controllers';
import { updateVolumeAndFees } from '../../modules/actions/pool/update-volume-and-fees';

const runningJobs: Set<string> = new Set();

const sftmxController = SftmxController();

async function runIfNotAlreadyRunning(
    id: string,
    chainId: string,
    fn: () => any,
    res: any,
    next: NextFunction,
): Promise<void> {
    const jobId = `${id}-${chainId}`;

    console.log(`Current jobqueue length: ${runningJobs.size}`);

    if (runningJobs.has(jobId)) {
        if (process.env.AWS_ALERTS === 'true') {
            await cronsMetricPublisher.publish(`${jobId}-skip`);
        }
        console.log(`Skip job ${jobId}-skip`);
        res.sendStatus(200);
        return;
    }

    const startJobTime = moment();

    try {
        runningJobs.add(jobId);

        console.time(jobId);
        console.log(`Start job ${jobId}-start`);

        await fn();

        const durationSuccess = moment.duration(moment().diff(startJobTime)).asSeconds();
        if (process.env.AWS_ALERTS === 'true') {
            await cronsMetricPublisher.publish(`${jobId}-done`);
            await cronsDurationMetricPublisher.publish(`${jobId}-done`, durationSuccess);
        }
        console.log(`Successful job ${jobId}-done`);
    } catch (error: any) {
        const durationError = moment.duration(moment().diff(startJobTime)).asSeconds();
        if (process.env.AWS_ALERTS === 'true') {
            await cronsMetricPublisher.publish(`${jobId}-error`);
            await cronsDurationMetricPublisher.publish(`${jobId}-error`, durationError);
        }
        console.log(`Error job ${jobId}-error`, error.message || error);
        next(error);
    } finally {
        runningJobs.delete(jobId);
        console.timeEnd(jobId);
        res.sendStatus(200);
    }
}

export function configureWorkerRoutes(app: Express) {
    app.post('/', async (req, res, next) => {
        Sentry.withIsolationScope(async (scope) => {
            const job = req.body as { name: string; chain: string };
            const sentryTransactionName = `${job.name}-${job.chain}`;

            // Clear breadcrumbs to avoid mixing them between requests
            // That doesn't always work, but it's better than nothing
            scope.clearBreadcrumbs();
            scope.setTransactionName(sentryTransactionName);
            scope.setTag('job', job.name);
            scope.setTag('chain', job.chain);

            initRequestScopedContext();
            setRequestScopedContextValue('chainId', job.chain);

            // Start profiling span for the job
            Sentry.startSpan({ op: 'job', name: sentryTransactionName }, () => {
                setupJobHandlers(job.name, job.chain, res, next);
            });
        });
    });
}

const setupJobHandlers = async (name: string, chainId: string, res: any, next: NextFunction) => {
    const chain = chainIdToChain[chainId];
    switch (name) {
        case 'sync-changed-pools':
            await runIfNotAlreadyRunning(name, chainId, () => PoolController().syncChangedPoolsV2(chain), res, next);
            break;
        case 'user-sync-wallet-balances-for-all-pools':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => userService.syncChangedWalletBalancesForAllPools(),
                res,
                next,
            );
            break;
        case 'user-sync-staked-balances':
            await runIfNotAlreadyRunning(name, chainId, () => userService.syncChangedStakedBalances(), res, next);
            break;
        case 'update-token-prices':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => tokenService.updateTokenPrices(Object.keys(AllNetworkConfigsKeyedOnChain) as Chain[]),
                res,
                next,
            );
            break;
        case 'update-liquidity-for-active-pools':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => PoolController().updateLiquidityValuesForActivePools(chain),
                res,
                next,
            );
            break;
        case 'update-liquidity-for-inactive-pools':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => PoolController().updateLiquidityValuesForInactivePools(chain),
                res,
                next,
            );
            break;
        case 'update-pool-apr':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => {
                    const chain = chainIdToChain[chainId];
                    return poolService.updatePoolAprs(chain);
                },
                res,
                next,
            );
            break;
        case 'load-on-chain-data-for-pools-with-active-updates':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => poolService.loadOnChainDataForPoolsWithActiveUpdates(),
                res,
                next,
            );
            break;
        case 'sync-new-pools-from-subgraph':
            await runIfNotAlreadyRunning(name, chainId, () => PoolController().addPoolsV2(chain), res, next);
            break;
        case 'sync-join-exits-v2':
            await runIfNotAlreadyRunning(name, chainId, () => EventController().syncJoinExitsV2(chain), res, next);
            break;
        case 'sync-tokens-from-pool-tokens':
            await runIfNotAlreadyRunning(name, chainId, () => tokenService.syncTokenContentData(), res, next);
            break;
        case 'update-liquidity-24h-ago-v2':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => PoolController().updateLiquidity24hAgoV2(chain),
                res,
                next,
            );
            break;
        case 'cache-average-block-time':
            await runIfNotAlreadyRunning(name, chainId, () => blocksSubgraphService.cacheAverageBlockTime(), res, next);
            break;
        case 'sync-staking-for-pools':
            await runIfNotAlreadyRunning(name, chainId, () => StakingController().syncStaking(chain), res, next);
            break;
        case 'cache-protocol-data':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => protocolService.cacheProtocolMetrics(networkContext.chain),
                res,
                next,
            );
            break;
        case 'sync-snapshots-v2':
            await runIfNotAlreadyRunning(name, chainId, () => SnapshotsController().syncSnapshotsV2(chain), res, next);
            break;
        case 'sync-snapshots-v3':
            await runIfNotAlreadyRunning(name, chainId, () => SnapshotsController().syncSnapshotsV3(chain), res, next);
            break;
        case 'update-lifetime-values-for-all-pools':
            await runIfNotAlreadyRunning(name, chainId, () => poolService.updateLifetimeValuesForAllPools(), res, next);
            break;
        case 'feed-data-to-datastudio':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => {
                    const chain = chainIdToChain[chainId];
                    return datastudioService.feedPoolData(chain);
                },
                res,
                next,
            );
            break;
        case 'sync-latest-reliquary-snapshots':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => poolService.syncLatestReliquarySnapshotsForAllFarms(),
                res,
                next,
            );
            break;
        case 'global-purge-old-tokenprices':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => tokenService.purgeOldTokenPricesForAllChains(),
                res,
                next,
            );
            break;
        case 'update-fee-volume-yield-all-pools':
            await runIfNotAlreadyRunning(name, chainId, () => updateVolumeAndFees(chain), res, next);
            break;
        case 'sync-vebal-balances':
            await runIfNotAlreadyRunning(name, chainId, () => veBalService.syncVeBalBalances(), res, next);
            break;
        case 'sync-vebal-snapshots':
            await runIfNotAlreadyRunning(name, chainId, () => veBalService.syncVeBalUserBalanceSnapshots(), res, next);
            break;
        case 'sync-vebal-totalSupply':
            await runIfNotAlreadyRunning(name, chainId, () => veBalService.syncVeBalTotalSupply(), res, next);
            break;
        case 'sync-vebal-voting-gauges':
            await runIfNotAlreadyRunning(name, chainId, () => veBalVotingListService.syncVotingGauges(), res, next);
            break;
        case 'sync-latest-fx-prices':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => {
                    const config = AllNetworkConfigs[chainId].data;
                    const subgraphUrl = config.subgraphs.balancer;
                    const chain = config.chain.prismaId;
                    return syncLatestFXPrices(subgraphUrl, chain);
                },
                res,
                next,
            );
            break;
        case 'sync-sftmx-staking-data':
            await runIfNotAlreadyRunning(name, chainId, () => sftmxController.syncSftmxStakingData(chainId), res, next);
            break;
        case 'sync-sftmx-withdrawal-requests':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => sftmxController.syncSftmxWithdrawalrequests(chainId),
                res,
                next,
            );
            break;
        case 'sync-sftmx-staking-snapshots':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => sftmxController.syncSftmxStakingSnapshots(chainId),
                res,
                next,
            );
            break;
        // V3 Jobs
        case 'add-pools-v3':
            await runIfNotAlreadyRunning(name, chainId, () => PoolController().addPoolsV3(chain), res, next);
            break;
        case 'sync-pools-v3':
            await runIfNotAlreadyRunning(name, chainId, () => PoolController().syncChangedPoolsV3(chain), res, next);
            break;
        case 'sync-hook-data':
            await runIfNotAlreadyRunning(name, chainId, () => PoolController().syncHookData(chain), res, next);
            break;
        case 'sync-swaps-v3':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => EventController().syncSwapsUpdateVolumeAndFeesV3(chain),
                res,
                next,
            );
            break;
        case 'sync-swaps-v2':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => EventController().syncSwapsUpdateVolumeAndFeesV2(chain),
                res,
                next,
            );
            break;
        case 'sync-join-exits-v3':
            await runIfNotAlreadyRunning(name, chainId, () => EventController().syncJoinExitsV3(chain), res, next);
            break;
        case 'update-liquidity-24h-ago-v3':
            await runIfNotAlreadyRunning(
                name,
                chainId,
                () => PoolController().updateLiquidity24hAgoV3(chain),
                res,
                next,
            );
            break;
        // TODO
        // case 'update-lifetime-values-for-all-pools-v3':
        //     await runIfNotAlreadyRunning(
        //         name,
        //         chainId,
        //         () => poolService.updateLifetimeValuesForAllPoolsV3(),
        //         res,
        //         next,
        //     );
        //     break;
        // COW AMM
        case 'add-new-cow-amm-pools':
            await runIfNotAlreadyRunning(name, chainId, () => CowAmmController().addPools(chain), res, next);
            break;
        case 'sync-cow-amm-pools':
            await runIfNotAlreadyRunning(name, chainId, () => CowAmmController().syncPools(chain), res, next);
            break;
        case 'sync-cow-amm-swaps':
            await runIfNotAlreadyRunning(name, chainId, () => CowAmmController().syncSwaps(chain), res, next);
            break;
        case 'sync-cow-amm-join-exits':
            await runIfNotAlreadyRunning(name, chainId, () => CowAmmController().syncJoinExits(chain), res, next);
            break;
        case 'sync-cow-amm-snapshots':
            await runIfNotAlreadyRunning(name, chainId, () => CowAmmController().syncSnapshots(chain), res, next);
            break;
        case 'update-cow-amm-volume-and-fees':
            await runIfNotAlreadyRunning(name, chainId, () => CowAmmController().updateVolumeAndFees(chain), res, next);
            break;
        case 'update-surplus-aprs':
            await runIfNotAlreadyRunning(name, chainId, () => CowAmmController().updateSurplusAprs(), res, next);
            break;
        case 'sync-merkl':
            await runIfNotAlreadyRunning(name, chainId, () => AprsController().syncMerkl(), res, next);
            break;
        case 'sync-categories':
            await runIfNotAlreadyRunning(name, chainId, () => ContentController().syncCategories(), res, next);
            break;
        case 'sync-rate-provider-reviews':
            await runIfNotAlreadyRunning(name, chainId, () => ContentController().syncRateProviderReviews(), res, next);
            break;
        case 'sync-hook-reviews':
            await runIfNotAlreadyRunning(name, chainId, () => ContentController().syncHookReviews(), res, next);
            break;
        case 'sync-erc4626-reviews':
            await runIfNotAlreadyRunning(name, chainId, () => ContentController().syncErc4626Reviews(), res, next);
            break;
        default:
            res.sendStatus(400);
            // throw new Error(`Unhandled job type ${name}`);
            console.log(`Unhandled job type ${name}`);
    }
};
