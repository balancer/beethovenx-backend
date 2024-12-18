import { ethers } from 'ethers';
import { DeploymentEnv, NetworkConfig } from './network-config-types';
import { BoostedPoolAprService } from '../pool/lib/apr-data-sources/nested-pool-apr.service';
import { SwapFeeAprService } from '../pool/lib/apr-data-sources/';
import { GaugeAprService } from '../pool/lib/apr-data-sources/ve-bal-gauge-apr.service';
import { UserSyncGaugeBalanceService } from '../user/lib/user-sync-gauge-balance.service';
import { every } from '../../apps/scheduler/intervals';
import { GithubContentService } from '../content/github-content.service';
import { YbTokensAprService } from '../pool/lib/apr-data-sources/yb-tokens-apr.service';
import { env } from '../../apps/env';
import { BalancerSubgraphService } from '../subgraphs/balancer-subgraph/balancer-subgraph.service';
import config from '../../config';
import { UserSyncAuraBalanceService } from '../user/lib/user-sync-aura-balance.service';

export const arbitrumNetworkData = config.ARBITRUM;

export const arbitrumNetworkConfig: NetworkConfig = {
    data: arbitrumNetworkData,
    contentService: new GithubContentService(),
    provider: new ethers.providers.JsonRpcProvider({ url: arbitrumNetworkData.rpcUrl, timeout: 60000 }),
    poolAprServices: [
        new YbTokensAprService(arbitrumNetworkData.ybAprConfig, arbitrumNetworkData.chain.prismaId),
        new BoostedPoolAprService(),
        new SwapFeeAprService(),
        new GaugeAprService(),
    ],
    userStakedBalanceServices: [new UserSyncGaugeBalanceService(), new UserSyncAuraBalanceService()],
    services: {
        balancerSubgraphService: new BalancerSubgraphService(
            arbitrumNetworkData.subgraphs.balancer,
            arbitrumNetworkData.chain.prismaId,
        ),
    },
    /*
    For sub-minute jobs we set the alarmEvaluationPeriod and alarmDatapointsToAlarm to 1 instead of the default 3. 
    This is needed because the minimum alarm period is 1 minute and we want the alarm to trigger already after 1 minute instead of 3.

    For every 1 days jobs we set the alarmEvaluationPeriod and alarmDatapointsToAlarm to 1 instead of the default 3. 
    This is needed because the maximum alarm evaluation period is 1 day (period * evaluationPeriod).
    */
    workerJobs: [
        {
            name: 'update-liquidity-for-inactive-pools',
            interval: every(1, 'days'),
            alarmEvaluationPeriod: 1,
            alarmDatapointsToAlarm: 1,
        },
        {
            name: 'update-liquidity-for-active-pools',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(6, 'minutes') : every(2, 'minutes'),
        },
        {
            name: 'update-pool-apr',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(6, 'minutes') : every(2, 'minutes'),
        },
        {
            name: 'update-7-30-days-swap-apr',
            interval: every(8, 'hours'),
        },
        {
            name: 'load-on-chain-data-for-pools-with-active-updates',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(4, 'minutes') : every(1, 'minutes'),
        },
        {
            name: 'sync-new-pools-from-subgraph',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(6, 'minutes') : every(2, 'minutes'),
        },
        {
            name: 'sync-tokens-from-pool-tokens',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(10, 'minutes') : every(5, 'minutes'),
        },
        {
            name: 'update-liquidity-24h-ago-v2',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(10, 'minutes') : every(5, 'minutes'),
        },
        {
            name: 'cache-average-block-time',
            interval: every(1, 'hours'),
        },
        {
            name: 'sync-staking-for-pools',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(10, 'minutes') : every(5, 'minutes'),
        },
        {
            name: 'sync-snapshots-v2',
            interval: every(90, 'minutes'),
        },
        {
            name: 'update-lifetime-values-for-all-pools',
            interval: every(50, 'minutes'),
        },
        {
            name: 'sync-changed-pools',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(2, 'minutes') : every(30, 'seconds'),
            alarmEvaluationPeriod: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? 3 : 1,
            alarmDatapointsToAlarm: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? 3 : 1,
        },
        {
            name: 'user-sync-wallet-balances-for-all-pools',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(5, 'minutes') : every(20, 'seconds'),
            alarmEvaluationPeriod: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? 3 : 1,
            alarmDatapointsToAlarm: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? 3 : 1,
        },
        {
            name: 'user-sync-staked-balances',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(5, 'minutes') : every(20, 'seconds'),
            alarmEvaluationPeriod: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? 3 : 1,
            alarmDatapointsToAlarm: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? 3 : 1,
        },
        {
            name: 'update-fee-volume-yield-all-pools',
            interval: every(1, 'hours'),
        },
        {
            name: 'sync-vebal-balances',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(9, 'minutes') : every(3, 'minutes'),
        },
        {
            name: 'sync-vebal-totalSupply',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(10, 'minutes') : every(5, 'minutes'),
        },
        {
            name: 'sync-join-exits-v2',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(10, 'minutes') : every(1, 'minutes'),
        },
        {
            name: 'sync-swaps-v2',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(10, 'minutes') : every(1, 'minutes'),
        },
        // COW AMM
        { name: 'add-new-cow-amm-pools', interval: every(5, 'minutes') },
        {
            name: 'sync-cow-amm-pools',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(2, 'minutes') : every(30, 'seconds'),
            alarmEvaluationPeriod: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? 3 : 1,
            alarmDatapointsToAlarm: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? 3 : 1,
        },
        {
            name: 'sync-cow-amm-swaps',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(10, 'minutes') : every(1, 'minutes'),
        },
        {
            name: 'sync-cow-amm-join-exits',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(10, 'minutes') : every(1, 'minutes'),
        },
        { name: 'sync-cow-amm-snapshots', interval: every(90, 'minutes') },
        {
            name: 'update-cow-amm-volume-and-fees',
            interval: (env.DEPLOYMENT_ENV as DeploymentEnv) === 'canary' ? every(60, 'minutes') : every(20, 'minutes'),
        },
    ],
};
