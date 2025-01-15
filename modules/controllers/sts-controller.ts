import config from '../../config';
import { getViemClient } from '../sources/viem-client';
import { Address } from 'viem';
import { prisma } from '../../prisma/prisma-client';
import {
    GqlStakedSonicData,
    GqlStakedSonicSnapshot,
    GqlStakedSonicSnapshotDataRange,
} from '../../apps/api/gql/generated-schema';
import { syncStakingData } from '../actions/sts/sync-staking-data';
import { StsSubgraphService } from '../sources/subgraphs/sts-subgraph/sts.service';
import { syncSonicStakingSnapshots } from '../actions/sts/sync-staking-snapshots';
import moment from 'moment';

const getTimestampForRange = (range: GqlStakedSonicSnapshotDataRange): number => {
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

export function StakedSonicController(tracer?: any) {
    return {
        async syncSonicStakingData() {
            const stakingContractAddress = config['SONIC'].sts!.address;
            const stsSubgraphUrl = config['SONIC'].subgraphs.sts!;
            const baseAprUrl = config['SONIC'].sts!.baseAprUrl!;
            const validatorFee = config['SONIC'].sts!.validatorFee;

            // Guard against unconfigured chains
            if (!stakingContractAddress || !stsSubgraphUrl || !baseAprUrl || !validatorFee) {
                throw new Error(`Chain not configured for job sonic staking data`);
            }

            const viemClient = getViemClient('SONIC');
            const stsSubgraphClient = new StsSubgraphService(stsSubgraphUrl);

            await syncStakingData(
                stakingContractAddress as Address,
                viemClient,
                stsSubgraphClient,
                baseAprUrl,
                validatorFee,
            );
        },
        async syncSonicStakingSnapshots() {
            const stsSubgraphUrl = config['SONIC'].subgraphs.sts!;
            const stakingContractAddress = config['SONIC'].sts!.address;

            // Guard against unconfigured chains
            if (!stsSubgraphUrl || !stakingContractAddress) {
                throw new Error(`Chain not configured for job syncSonicStakingSnapshots`);
            }

            const stsSubgraphClient = new StsSubgraphService(stsSubgraphUrl);

            await syncSonicStakingSnapshots(stakingContractAddress as Address, stsSubgraphClient);
        },
        async getStakingData(): Promise<GqlStakedSonicData> {
            const stakingData = await prisma.prismaStakedSonicData.findFirstOrThrow({
                include: {
                    delegatedValidators: true,
                },
            });
            return stakingData;
        },
        async getStakingSnapshots(range: GqlStakedSonicSnapshotDataRange): Promise<GqlStakedSonicSnapshot[]> {
            const timestamp = getTimestampForRange(range);

            const stakingSnapshots = await prisma.prismaSonicStakingDataSnapshot.findMany({
                where: { timestamp: { gte: timestamp } },
                orderBy: { timestamp: 'asc' },
            });

            return stakingSnapshots;
        },
    };
}
