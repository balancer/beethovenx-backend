import { Chain, PrismaPoolFilter, PrismaPoolStakingType, PrismaPoolSwap } from '@prisma/client';
import _ from 'lodash';
import moment from 'moment-timezone';
import { prisma } from '../../prisma/prisma-client';
import {
    GqlChain,
    GqlPoolAggregator,
    GqlPoolBatchSwap,
    GqlPoolFeaturedPool,
    GqlPoolFeaturedPoolGroup,
    GqlPoolJoinExit,
    GqlPoolMinimal,
    GqlPoolSnapshotDataRange,
    GqlPoolUnion,
    QueryPoolGetBatchSwapsArgs,
    QueryPoolGetJoinExitsArgs,
    QueryPoolGetPoolsArgs,
    QueryPoolGetSwapsArgs,
} from '../../schema';
import { blocksSubgraphService } from '../subgraphs/blocks-subgraph/blocks-subgraph.service';
import { tokenService } from '../token/token.service';
import { userService } from '../user/user.service';
import { PoolAprUpdaterService } from './lib/pool-apr-updater.service';
import { PoolCreatorService } from './lib/pool-creator.service';
import { PoolGqlLoaderService } from './lib/pool-gql-loader.service';
import { PoolOnChainDataService, PoolOnChainDataServiceOptions } from './lib/pool-on-chain-data.service';
import { PoolSnapshotService } from './lib/pool-snapshot.service';
import { PoolSwapService } from './lib/pool-swap.service';
import { PoolUsdDataService } from './lib/pool-usd-data.service';
import { networkContext } from '../network/network-context.service';
import { ReliquarySubgraphService } from '../subgraphs/reliquary-subgraph/reliquary.service';
import { ReliquarySnapshotService } from './lib/reliquary-snapshot.service';
import { coingeckoDataService } from '../token/lib/coingecko-data.service';
import { syncIncentivizedCategory } from '../actions/pool/sync-incentivized-category';
import {
    deleteGaugeStakingForAllPools,
    deleteMasterchefStakingForAllPools,
    deleteReliquaryStakingForAllPools,
    loadReliquarySnapshotsForAllFarms,
    syncGaugeStakingForPools,
    syncMasterchefStakingForPools,
    syncReliquaryStakingForPools,
} from '../actions/pool/staking';
import { MasterchefSubgraphService } from '../subgraphs/masterchef-subgraph/masterchef.service';
import { AllNetworkConfigsKeyedOnChain } from '../network/network-config';
import { GaugeSubgraphService } from '../subgraphs/gauge-subgraph/gauge-subgraph.service';
import { deleteAuraStakingForAllPools, syncAuraStakingForPools } from '../actions/pool/staking/sync-aura-staking';
import { AuraSubgraphService } from '../sources/subgraphs/aura/aura.service';
import { syncVebalStakingForPools } from '../actions/pool/staking/sync-vebal-staking';

export class PoolService {
    constructor(
        private readonly poolCreatorService: PoolCreatorService,
        private readonly poolOnChainDataService: PoolOnChainDataService,
        private readonly poolUsdDataService: PoolUsdDataService,
        private readonly poolGqlLoaderService: PoolGqlLoaderService,
        private readonly poolAprUpdaterService: PoolAprUpdaterService,
        private readonly poolSwapService: PoolSwapService,
        private readonly poolSnapshotService: PoolSnapshotService,
    ) {}

    private get chain() {
        return networkContext.chain;
    }
    private get balancerSubgraphService() {
        return networkContext.services.balancerSubgraphService;
    }

    public async getGqlPool(id: string, chain: GqlChain, userAddress?: string): Promise<GqlPoolUnion> {
        return this.poolGqlLoaderService.getPool(id, chain, userAddress);
    }

    public async getGqlPools(args: QueryPoolGetPoolsArgs): Promise<GqlPoolMinimal[]> {
        return this.poolGqlLoaderService.getPools(args);
    }

    public async getAggregatorPools(args: QueryPoolGetPoolsArgs): Promise<GqlPoolAggregator[]> {
        return this.poolGqlLoaderService.getAggregatorPools(args);
    }

    public async getPoolsCount(args: QueryPoolGetPoolsArgs): Promise<number> {
        return this.poolGqlLoaderService.getPoolsCount(args);
    }

    public async getPoolFilters(): Promise<PrismaPoolFilter[]> {
        return prisma.prismaPoolFilter.findMany({ where: { chain: this.chain } });
    }

    public async getPoolSwaps(args: QueryPoolGetSwapsArgs): Promise<PrismaPoolSwap[]> {
        return this.poolSwapService.getSwaps(args);
    }

    public async getPoolBatchSwaps(args: QueryPoolGetBatchSwapsArgs): Promise<GqlPoolBatchSwap[]> {
        const batchSwaps = await this.poolSwapService.getBatchSwaps(args);

        return batchSwaps.map((batchSwap) => ({
            ...batchSwap,
            swaps: batchSwap.swaps.map((swap) => {
                return {
                    ...swap,
                    pool: {
                        id: swap.pool.id,
                        name: swap.pool.name,
                        type: swap.pool.type,
                        symbol: swap.pool.symbol,
                        allTokens: swap.pool.tokens.map((token) => ({
                            address: token.address,
                            isNested: token.nestedPoolId !== null,
                            isPhantomBpt: token.address === swap.pool.address,
                            weight: token.weight,
                        })),
                    },
                };
            }),
        }));
    }

    public async getPoolJoinExits(args: QueryPoolGetJoinExitsArgs): Promise<GqlPoolJoinExit[]> {
        return this.poolSwapService.getJoinExits(args);
    }

    public async getFeaturedPoolGroups(chains: Chain[]): Promise<GqlPoolFeaturedPoolGroup[]> {
        return this.poolGqlLoaderService.getFeaturedPoolGroups(chains);
    }

    public async getFeaturedPools(chains: Chain[]): Promise<GqlPoolFeaturedPool[]> {
        return this.poolGqlLoaderService.getFeaturedPools(chains);
    }

    public async getSnapshotsForPool(poolId: string, chain: Chain, range: GqlPoolSnapshotDataRange) {
        return this.poolSnapshotService.getSnapshotsForPool(poolId, chain, range);
    }

    public async getSnapshotsForReliquaryFarm(id: number, range: GqlPoolSnapshotDataRange) {
        if (networkContext.data.subgraphs.reliquary) {
            const reliquarySnapshotService = new ReliquarySnapshotService(
                new ReliquarySubgraphService(networkContext.data.subgraphs.reliquary),
            );

            return reliquarySnapshotService.getSnapshotsForFarm(id, range);
        }
        return [];
    }

    public async syncAllPoolsFromSubgraph(): Promise<string[]> {
        const blockNumber = await networkContext.provider.getBlockNumber();

        return this.poolCreatorService.syncAllPoolsFromSubgraph(blockNumber);
    }

    public async reloadStakingForAllPools(stakingTypes: PrismaPoolStakingType[], chain: Chain): Promise<void> {
        await deleteMasterchefStakingForAllPools(stakingTypes, chain);
        await deleteReliquaryStakingForAllPools(stakingTypes, chain);
        await deleteGaugeStakingForAllPools(stakingTypes, chain);
        await deleteAuraStakingForAllPools(stakingTypes, chain);

        // if we reload staking for reliquary, we also need to reload the snapshots because they are deleted while reloading
        if (stakingTypes.includes('RELIQUARY')) {
            this.loadReliquarySnapshotsForAllFarms();
        }
        // reload it for all pools
        await this.syncStakingForPools([this.chain]);
    }

    public async loadOnChainDataForPoolsWithActiveUpdates() {
        const blockNumber = await networkContext.provider.getBlockNumber();
        const timestamp = moment().subtract(5, 'minutes').unix();
        const poolIds = await this.balancerSubgraphService.getPoolsWithActiveUpdates(timestamp);
        const tokenPrices = await tokenService.getTokenPrices(this.chain);

        await this.poolOnChainDataService.updateOnChainData(poolIds, this.chain, blockNumber, tokenPrices);
    }

    /**
     * Deprecated in favor of StakingController().syncStaking(chain)
     */
    public async syncStakingForPools(chains: Chain[]) {
        for (const chain of chains) {
            const networkconfig = AllNetworkConfigsKeyedOnChain[chain];
            if (networkconfig.data.subgraphs.masterchef) {
                await syncMasterchefStakingForPools(
                    chain,
                    new MasterchefSubgraphService(networkconfig.data.subgraphs.masterchef),
                    networkconfig.data.masterchef?.excludedFarmIds || [],
                    networkconfig.data.fbeets?.address || '',
                    networkconfig.data.fbeets?.farmId || '',
                    networkconfig.data.fbeets?.poolId || '',
                );
            }
            if (networkconfig.data.subgraphs.reliquary) {
                await syncReliquaryStakingForPools(
                    chain,
                    new ReliquarySubgraphService(networkconfig.data.subgraphs.reliquary),
                    networkconfig.data.reliquary?.address || '',
                    networkconfig.data.reliquary?.excludedFarmIds || [],
                );
            }
            if (networkconfig.data.subgraphs.gauge && networkContext.data.bal?.address) {
                await syncGaugeStakingForPools(
                    new GaugeSubgraphService(networkconfig.data.subgraphs.gauge),
                    networkContext.data.bal.address,
                );
            }
            if (networkconfig.data.subgraphs.aura) {
                await syncAuraStakingForPools(chain, new AuraSubgraphService(networkconfig.data.subgraphs.aura));
            }

            if (chain === 'MAINNET') {
                await syncVebalStakingForPools();
            }
        }
    }

    public async updatePoolAprs(chain: Chain) {
        await this.poolAprUpdaterService.updatePoolAprs(chain);
        await syncIncentivizedCategory();
    }

    public async reloadAllPoolAprs(chain: Chain) {
        await this.poolAprUpdaterService.reloadAllPoolAprs(chain);
        await syncIncentivizedCategory();
    }

    public async syncLatestReliquarySnapshotsForAllFarms() {
        if (networkContext.data.subgraphs.reliquary) {
            const reliquarySnapshotService = new ReliquarySnapshotService(
                new ReliquarySubgraphService(networkContext.data.subgraphs.reliquary),
            );
            await reliquarySnapshotService.syncLatestSnapshotsForAllFarms();
        }
    }

    public async loadReliquarySnapshotsForAllFarms() {
        loadReliquarySnapshotsForAllFarms(
            this.chain,
            networkContext.data.subgraphs.reliquary,
            networkContext.data.reliquary?.excludedFarmIds,
        );
    }

    public async updateLifetimeValuesForAllPools() {
        await this.poolUsdDataService.updateLifetimeValuesForAllPools();
    }
}

const optionsResolverForPoolOnChainDataService: () => PoolOnChainDataServiceOptions = () => {
    return {
        chain: networkContext.chain,
        vaultAddress: networkContext.data.balancer.v2.vaultAddress,
        balancerQueriesAddress: networkContext.data.balancer.v2.balancerQueriesAddress,
        yieldProtocolFeePercentage: networkContext.data.balancer.v2.defaultSwapFeePercentage,
        swapProtocolFeePercentage: networkContext.data.balancer.v2.defaultSwapFeePercentage,
        gyroConfig: networkContext.data.gyro?.config,
    };
};

export const poolService = new PoolService(
    new PoolCreatorService(userService),
    new PoolOnChainDataService(optionsResolverForPoolOnChainDataService),
    new PoolUsdDataService(tokenService, blocksSubgraphService),
    new PoolGqlLoaderService(),
    new PoolAprUpdaterService(),
    new PoolSwapService(tokenService),
    new PoolSnapshotService(coingeckoDataService),
);
