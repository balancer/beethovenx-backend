import type { Chain } from '@prisma/client';
import type { BigNumber } from 'ethers';
import type { PoolAprService } from '../pool/pool-types';
import type { UserStakedBalanceService } from '../user/user-types';
import type { BaseProvider } from '@ethersproject/providers';
import type { GqlChain } from '../../schema';
import type { ContentService } from '../content/content-types';
import type { YbAprConfig } from './apr-config-types';
import type { BalancerSubgraphService } from '../subgraphs/balancer-subgraph/balancer-subgraph.service';
import { SftmxSubgraphService } from '../sources/subgraphs/sftmx-subgraph/sftmx.service';

export interface NetworkConfig {
    data: NetworkData;
    contentService: ContentService;
    poolAprServices: PoolAprService[];
    userStakedBalanceServices: UserStakedBalanceService[];
    provider: BaseProvider;
    workerJobs: WorkerJob[];
    services: NetworkServices;
}

interface NetworkServices {
    balancerSubgraphService: BalancerSubgraphService;
    sftmxSubgraphService?: SftmxSubgraphService;
}

export interface WorkerJob {
    name: string;
    interval: number;
    alarmEvaluationPeriod?: number;
    alarmDatapointsToAlarm?: number;
}

export type DeploymentEnv = 'canary' | 'main';

export interface NetworkData {
    chain: {
        slug: string;
        id: number;
        nativeAssetAddress: string;
        wrappedNativeAssetAddress: string;
        prismaId: Chain;
        gqlId: GqlChain;
    };
    eth: {
        address: string;
        addressFormatted: string;
        symbol: string;
        name: string;
    };
    weth: {
        address: string;
        addressFormatted: string;
    };
    rpcUrl: string;
    rpcMaxBlockRange: number;
    coingecko: {
        nativeAssetId: string;
        platformId: string;
        excludedTokenAddresses: string[];
    };
    subgraphs: {
        startDate: string;
        balancer: string[];
        balancerV3?: string;
        balancerPoolsV3?: string;
        blocks: string;
        masterchef?: string;
        reliquary?: string;
        sftmx?: string;
        beetsBar?: string;
        gauge?: string;
        aura?: string;
        cowAmm?: string;
    };
    protocolToken: 'beets' | 'bal';
    beets?: {
        address: string;
    };
    fbeets?: {
        address: string;
        farmId: string;
        poolId: string;
        poolAddress: string;
    };
    sftmx?: {
        stakingContractAddress: string;
        sftmxAddress: string;
    };
    bal?: {
        address: string;
    };
    veBal?: {
        address: string;
        bptAddress: string;
        delegationProxy: string;
    };
    gaugeControllerAddress?: string;
    gaugeControllerHelperAddress?: string;
    gyro?: {
        config: string;
    };
    balancer: {
        v2: {
            vaultAddress: string;
            defaultSwapFeePercentage: string;
            defaultYieldFeePercentage: string;
            tokenAdmin?: string;
            balancerQueriesAddress: string;
        };
        v3: {
            vaultAddress: string;
            routerAddress: string;
            defaultSwapFeePercentage: string;
            defaultYieldFeePercentage: string;
            tokenAdmin?: string;
        };
    };
    hooks?: {
        feeTakingHook?: string[];
        exitFeeHook?: string[];
    };
    multicall: string;
    multicall3: string;
    masterchef?: {
        address: string;
        excludedFarmIds: string[];
    };
    ybAprConfig: YbAprConfig;
    reliquary?: {
        address: string;
        excludedFarmIds: string[];
    };
    avgBlockSpeed: number;
    sor?: {
        poolIdsToExclude?: string[];
    };
    datastudio?: {
        [key in DeploymentEnv]: {
            user: string;
            sheetId: string;
            compositionTabName: string;
            databaseTabName: string;
            emissionDataTabName: string;
        };
    };
    monitoring: {
        [key in DeploymentEnv]: {
            alarmTopicArn: string;
        };
    };
}

export type HookType = keyof NonNullable<NetworkData['hooks']>;
