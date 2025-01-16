import { Chain, PrismaPoolStakingType } from '@prisma/client';
import { MasterchefSubgraphService } from '../../../subgraphs/masterchef-subgraph/masterchef.service';
import { ReliquarySubgraphService } from '../../../subgraphs/reliquary-subgraph/reliquary.service';
import { GaugeSubgraphService } from '../../../subgraphs/gauge-subgraph/gauge-subgraph.service';
import { AuraSubgraphService } from '../../../sources/subgraphs/aura/aura.service';
import { deleteMasterchefStakingForAllPools, syncMasterchefStakingForPools } from './sync-master-chef-staking.service';
import {
    deleteReliquaryStakingForAllPools,
    syncReliquaryStakingForPools,
    loadReliquarySnapshotsForAllFarms,
} from './sync-reliquary-staking.service';
import { deleteGaugeStakingForAllPools, syncGaugeStakingForPools } from './sync-gauge-staking.service';
import { deleteAuraStakingForAllPools, syncAuraStakingForPools } from './sync-aura-staking';
import { syncVebalStakingForPools } from './sync-vebal-staking';
import config from '../../../../config';

export const syncStaking = async (chains: Chain[]) => {
    for (const chain of chains) {
        const networkconfig = config[chain];
        if (networkconfig.subgraphs.masterchef) {
            await syncMasterchefStakingForPools(
                chain,
                new MasterchefSubgraphService(networkconfig.subgraphs.masterchef),
                networkconfig.masterchef?.excludedFarmIds || [],
                networkconfig.fbeets?.address || '',
                networkconfig.fbeets?.farmId || '',
                networkconfig.fbeets?.poolId || '',
            );
        }
        if (networkconfig.subgraphs.reliquary) {
            await syncReliquaryStakingForPools(
                chain,
                new ReliquarySubgraphService(networkconfig.subgraphs.reliquary),
                networkconfig.reliquary?.address || '',
                networkconfig.reliquary?.excludedFarmIds || [],
            );
        }
        if (networkconfig.subgraphs.gauge && networkconfig.bal?.address) {
            await syncGaugeStakingForPools(
                new GaugeSubgraphService(networkconfig.subgraphs.gauge),
                networkconfig.bal.address,
            );
        }
        if (networkconfig.subgraphs.aura) {
            await syncAuraStakingForPools(chain, new AuraSubgraphService(networkconfig.subgraphs.aura));
        }

        if (chain === 'MAINNET') {
            await syncVebalStakingForPools();
        }
    }
};

export const reloadStakingForAllPools = async (stakingTypes: PrismaPoolStakingType[], chain: Chain): Promise<void> => {
    const networkconfig = config[chain];
    await deleteMasterchefStakingForAllPools(stakingTypes, chain);
    await deleteReliquaryStakingForAllPools(stakingTypes, chain);
    await deleteGaugeStakingForAllPools(stakingTypes, chain);
    await deleteAuraStakingForAllPools(stakingTypes, chain);

    // if we reload staking for reliquary, we also need to reload the snapshots because they are deleted while reloading
    if (stakingTypes.includes('RELIQUARY')) {
        loadReliquarySnapshotsForAllFarms(
            chain,
            networkconfig.subgraphs.reliquary,
            networkconfig.reliquary?.excludedFarmIds || [],
        );
    }
    // reload it for all pools
    await syncStaking([chain]);
};
