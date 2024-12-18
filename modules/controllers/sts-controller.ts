import config from '../../config';
import { getViemClient } from '../sources/viem-client';
import { Address } from 'viem';
import { prisma } from '../../prisma/prisma-client';
import { GqlStakedSonicData } from '../../schema';
import { syncStakingData } from '../actions/sts/sync-staking-data';
import { StsSubgraphService } from '../sources/subgraphs/sts-subgraph/sts.service';

export function StakedSonicController(tracer?: any) {
    return {
        async syncSonicStakingData() {
            const stakingContractAddress = config['SONIC'].sts!.address;
            const stsSubgraphUrl = config['SONIC'].subgraphs.sts!;
            const baseApr = config['SONIC'].sts!.baseApr!;
            const validatorFee = config['SONIC'].sts!.validatorFee;

            // Guard against unconfigured chains
            if (!stakingContractAddress || !stsSubgraphUrl || !baseApr || !validatorFee) {
                throw new Error(`Chain not configured for job sonic staking data`);
            }

            const viemClient = getViemClient('SONIC');
            const stsSubgraphClient = new StsSubgraphService(stsSubgraphUrl);

            await syncStakingData(
                stakingContractAddress as Address,
                viemClient,
                stsSubgraphClient,
                baseApr,
                validatorFee,
            );
        },

        async getStakingData(): Promise<GqlStakedSonicData> {
            const stakingData = await prisma.prismaStakedSonicData.findFirstOrThrow({
                include: {
                    delegatedValidators: true,
                },
            });
            return stakingData;
        },
    };
}
