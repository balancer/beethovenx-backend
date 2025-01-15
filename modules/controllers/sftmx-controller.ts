import config from '../../config';
import { chainIdToChain } from '../network/chain-id-to-chain';
import { getViemClient } from '../sources/viem-client';
import { syncStakingData as syncSftmxStakingData } from '../actions/sftmx/sync-staking-data';
import { Address } from 'viem';
import { syncWithdrawalRequests as syncSftmxWithdrawalRequests } from '../actions/sftmx/sync-withdrawal-requests';
import { SftmxSubgraphService } from '../sources/subgraphs/sftmx-subgraph/sftmx.service';
import { syncSftmxStakingSnapshots } from '../actions/sftmx/sync-staking-snapshots';
import moment from 'moment';
import { prisma } from '../../prisma/prisma-client';
import {
    GqlSftmxStakingSnapshotDataRange,
    GqlSftmxWithdrawalRequests,
    GqlSftmxStakingData,
    GqlSftmxStakingSnapshot,
} from '../../apps/api/gql/generated-schema';

const SFTMX_STACKINGCONTRACT = config['FANTOM'].sftmx!.stakingContractAddress;

const getTimestampForRange = (range: GqlSftmxStakingSnapshotDataRange): number => {
    switch (range) {
        case 'THIRTY_DAYS':
            return moment().startOf('day').subtract(30, 'days').unix();
        case 'NINETY_DAYS':
            return moment().startOf('day').subtract(90, 'days').unix();
        case 'ONE_HUNDRED_EIGHTY_DAYS':
            return moment().startOf('day').subtract(180, 'days').unix();
        case 'ONE_YEAR':
            return moment().startOf('day').subtract(365, 'days').unix();
        case 'ALL_TIME':
            return 0;
    }
};

export function SftmxController(tracer?: any) {
    return {
        async syncSftmxStakingData(chainId: string) {
            const chain = chainIdToChain[chainId];
            const stakingContractAddress = config[chain].sftmx?.stakingContractAddress;

            // Guard against unconfigured chains
            if (!stakingContractAddress) {
                throw new Error(`Chain not configured for job syncSftmxStakingData: ${chain}`);
            }

            const viemClient = getViemClient(chain);

            await syncSftmxStakingData(stakingContractAddress as Address, viemClient);
        },

        async syncSftmxWithdrawalrequests(chainId: string) {
            const chain = chainIdToChain[chainId];
            const sftmxSubgraphUrl = config[chain].subgraphs.sftmx;
            const stakingContractAddress = config[chain].sftmx?.stakingContractAddress;

            // Guard against unconfigured chains
            if (!sftmxSubgraphUrl || !stakingContractAddress) {
                throw new Error(`Chain not configured for job syncSftmxWithdrawalrequests: ${chain}`);
            }

            const sftmxSubgraphClient = new SftmxSubgraphService(sftmxSubgraphUrl);

            await syncSftmxWithdrawalRequests(stakingContractAddress as Address, sftmxSubgraphClient);
        },

        async syncSftmxStakingSnapshots(chainId: string) {
            const chain = chainIdToChain[chainId];
            const sftmxSubgraphUrl = config[chain].subgraphs.sftmx;
            const stakingContractAddress = config[chain].sftmx?.stakingContractAddress;

            // Guard against unconfigured chains
            if (!sftmxSubgraphUrl || !stakingContractAddress) {
                throw new Error(`Chain not configured for job syncSftmxStakingSnapshots: ${chain}`);
            }

            const sftmxSubgraphClient = new SftmxSubgraphService(sftmxSubgraphUrl);

            await syncSftmxStakingSnapshots(stakingContractAddress as Address, sftmxSubgraphClient);
        },

        async getWithdrawalRequests(user: string): Promise<GqlSftmxWithdrawalRequests[]> {
            const balances = await prisma.prismaSftmxWithdrawalRequest.findMany({
                where: {
                    user: user,
                },
            });
            return balances;
        },

        async getStakingData(): Promise<GqlSftmxStakingData> {
            const stakingData = await prisma.prismaSftmxStakingData.findUniqueOrThrow({
                where: { id: SFTMX_STACKINGCONTRACT },
                include: {
                    vaults: true,
                },
            });
            return {
                totalFtmAmountInPool: stakingData.totalFtmInPool,
                numberOfVaults: stakingData.numberOfVaults,
                totalFtmAmountStaked: stakingData.totalFtmStaked,
                totalFtmAmount: stakingData.totalFtm,
                maxDepositLimit: stakingData.maxDepositLimit,
                minDepositLimit: stakingData.minDepositLimit,
                maintenancePaused: stakingData.maintenancePaused,
                undelegatePaused: stakingData.undelegatePaused,
                withdrawPaused: stakingData.withdrawPaused,
                stakingApr: stakingData.stakingApr,
                exchangeRate: stakingData.exchangeRate,
                withdrawalDelay: stakingData.withdrawalDelay,
                vaults: stakingData.vaults.map((vault) => ({
                    vaultAddress: vault.id,
                    ftmAmountStaked: vault.ftmStaked,
                    isMatured: vault.matured,
                    unlockTimestamp: vault.unlockTimestamp,
                    validatorAddress: vault.validatorAddress,
                    validatorId: vault.validatorId,
                    vaultIndex: vault.vaultIndex,
                })),
            };
        },

        async getStakingSnapshots(range: GqlSftmxStakingSnapshotDataRange): Promise<GqlSftmxStakingSnapshot[]> {
            const timestamp = getTimestampForRange(range);

            const stakingSnapshots = await prisma.prismaSftmxStakingDataSnapshot.findMany({
                where: { timestamp: { gte: timestamp } },
                orderBy: { timestamp: 'asc' },
            });

            return stakingSnapshots.map((snapshot) => ({
                id: snapshot.id,
                timestamp: snapshot.timestamp,
                totalFtmAmount: snapshot.totalFtmAmount,
                totalFtmAmountStaked: snapshot.lockedFtmAmount,
                totalFtmAmountInPool: snapshot.freePoolFtmAmount,
                exchangeRate: snapshot.exchangeRate,
            }));
        },
    };
}
