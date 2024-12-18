import { prisma } from '../../../prisma/prisma-client';
import { fetchSonicStakingData } from '../../sources/contracts/fetch-sts-staking-data';
import { StsSubgraphService } from '../../sources/subgraphs/sts-subgraph/sts.service';
import { Address, formatEther } from 'viem';
import { ViemClient } from '../../sources/viem-client';

export async function syncStakingData(
    stakingContractAddress: Address,
    viemClient: ViemClient,
    subgraphService: StsSubgraphService,
    baseApr: number,
    validatorFee: number,
) {
    const stakingDataOnchain = await fetchSonicStakingData(stakingContractAddress, viemClient);
    const validators = await subgraphService.getAllValidators();

    const stakingApr =
        (parseFloat(stakingDataOnchain.totalDelegated) / parseFloat(stakingDataOnchain.totalAssets)) *
        (baseApr * (1 - validatorFee)) *
        (1 - parseFloat(stakingDataOnchain.protocolFee));

    await prisma.prismaStakedSonicData.upsert({
        where: { id: stakingContractAddress },
        create: {
            id: stakingContractAddress,
            totalAssets: stakingDataOnchain.totalAssets,
            totalAssetsDelegated: stakingDataOnchain.totalDelegated,
            totalAssetsPool: stakingDataOnchain.totalPool,
            exchangeRate: stakingDataOnchain.exchangeRate,
            stakingApr: `${stakingApr}`,
        },
        update: {
            id: stakingContractAddress,
            totalAssets: stakingDataOnchain.totalAssets,
            totalAssetsDelegated: stakingDataOnchain.totalDelegated,
            totalAssetsPool: stakingDataOnchain.totalPool,
            exchangeRate: stakingDataOnchain.exchangeRate,
            stakingApr: `${stakingApr}`,
        },
    });

    for (const validator of validators) {
        await prisma.prismaStakedSonicDelegatedValidator.upsert({
            where: { validatorId: validator.id },
            create: {
                validatorId: validator.id,
                assetsDelegated: validator.amountAssetsDelegated,
                sonicStakingId: stakingContractAddress,
            },
            update: {
                validatorId: validator.id,
                assetsDelegated: validator.amountAssetsDelegated,
            },
        });
    }
}
