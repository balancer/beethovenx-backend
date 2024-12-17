import { addressesMatch } from '../../../web3/addresses';
import { Chain, PrismaPoolStakingType } from '@prisma/client';
import _ from 'lodash';
import { prisma } from '../../../../prisma/prisma-client';
import { prismaBulkExecuteOperations } from '../../../../prisma/prisma-util';
import { ReliquarySubgraphService } from '../../../subgraphs/reliquary-subgraph/reliquary.service';
import { ReliquarySnapshotService } from '../../../pool/lib/reliquary-snapshot.service';

export const syncReliquaryStakingForPools = async (
    chain: Chain,
    reliquarySubgraphService: ReliquarySubgraphService,
    reliquaryAddress: string,
    excludedFarmIds: string[],
): Promise<void> => {
    if (chain !== 'FANTOM' && chain !== 'SONIC') {
        return;
    }

    const { reliquary } = await reliquarySubgraphService.getReliquary({ id: reliquaryAddress });
    if (!reliquary) {
        throw new Error(`Reliquary with id ${reliquaryAddress} not found in subgraph`);
    }
    const farms = await reliquarySubgraphService.getAllFarms({});
    const filteredFarms = farms.filter((farm) => !excludedFarmIds.includes(farm.pid.toString()));
    const pools = await prisma.prismaPool.findMany({
        where: { chain: chain },
        include: { staking: { include: { farm: { include: { rewarders: true } } } } },
    });
    const operations: any[] = [];

    for (const farm of filteredFarms) {
        const pool = pools.find((pool) => addressesMatch(pool.address, farm.poolTokenAddress));

        if (!pool) {
            console.warn(
                `Missing pool for farm with id ${farm.pid} with pool token ${farm.poolTokenAddress}. Skipping...`,
            );
            continue;
        }

        const farmId = `${farm.pid}`;
        const stakingId = `reliquary-${farm.pid}`;
        const farmAllocationPoints = farm.allocPoint;
        const reliquaryTotalAllocationPoints = reliquary.totalAllocPoint;

        const beetsPerSecond = (
            parseFloat(reliquary.emissionCurve.rewardPerSecond) *
            (farmAllocationPoints / reliquaryTotalAllocationPoints)
        ).toString();

        operations.push(
            prisma.prismaPoolStaking.upsert({
                where: { id_chain: { id: stakingId, chain: chain } },
                create: {
                    id: stakingId,
                    chain: chain,
                    poolId: pool.id,
                    type: 'RELIQUARY',
                    address: reliquaryAddress,
                },
                update: {},
            }),
        );

        let totalBalance = `0`;
        let totalWeightedBalance = `0`;

        const levelOperations = [];
        for (let farmLevel of farm.levels) {
            const { allocationPoints, balance, level, requiredMaturity } = farmLevel;

            totalBalance = `${parseFloat(totalBalance) + parseFloat(balance)}`;
            totalWeightedBalance = `${parseFloat(totalWeightedBalance) + parseFloat(balance) * allocationPoints}`;

            levelOperations.push(
                prisma.prismaPoolStakingReliquaryFarmLevel.upsert({
                    where: { id_chain: { id: `${farmId}-${level}`, chain: chain } },
                    create: {
                        id: `${farmId}-${level}`,
                        chain: chain,
                        farmId,
                        allocationPoints,
                        balance,
                        level,
                        requiredMaturity,
                        // apr will be updated by apr service
                        apr: 0,
                    },
                    update: {
                        balance,
                    },
                }),
            );
        }
        operations.push(
            prisma.prismaPoolStakingReliquaryFarm.upsert({
                where: { id_chain: { id: farmId, chain: chain } },
                create: {
                    id: farmId,
                    chain: chain,
                    stakingId: stakingId,
                    name: farm.name,
                    beetsPerSecond: beetsPerSecond,
                    totalBalance: totalBalance.toString(),
                    totalWeightedBalance: totalWeightedBalance.toString(),
                },
                update: {
                    beetsPerSecond: beetsPerSecond,
                    totalBalance: totalBalance.toString(),
                    totalWeightedBalance: totalWeightedBalance.toString(),
                    name: farm.name,
                },
            }),
        );
        operations.push(...levelOperations);
    }

    await prismaBulkExecuteOperations(operations, true);
};

export const deleteReliquaryStakingForAllPools = async (reloadStakingTypes: PrismaPoolStakingType[], chain: Chain) => {
    if (chain !== 'FANTOM') {
        return;
    }
    if (reloadStakingTypes.includes('RELIQUARY')) {
        await prisma.prismaUserStakedBalance.deleteMany({
            where: { staking: { type: 'RELIQUARY' }, chain: chain },
        });
        // need to remove snapshots as well as they have a FK in reliquary staking
        await prisma.prismaReliquaryTokenBalanceSnapshot.deleteMany({ where: { chain: chain } });
        await prisma.prismaReliquaryLevelSnapshot.deleteMany({ where: { chain: chain } });
        await prisma.prismaReliquaryFarmSnapshot.deleteMany({ where: { chain: chain } });
        await prisma.prismaUserRelicSnapshot.deleteMany({});

        await prisma.prismaPoolStakingReliquaryFarmLevel.deleteMany({ where: { chain: chain } });
        await prisma.prismaPoolStakingReliquaryFarm.deleteMany({ where: { chain: chain } });
        await prisma.prismaPoolStaking.deleteMany({ where: { type: 'RELIQUARY', chain: chain } });
    }
};

export const loadReliquarySnapshotsForAllFarms = async (
    chain: Chain,
    reliquarySubgraphUrl?: string,
    excludedFarmIds: string[] = [],
) => {
    if (reliquarySubgraphUrl) {
        const reliquarySnapshotService = new ReliquarySnapshotService(
            new ReliquarySubgraphService(reliquarySubgraphUrl),
        );
        await prisma.prismaReliquaryTokenBalanceSnapshot.deleteMany({ where: { chain } });
        await prisma.prismaReliquaryLevelSnapshot.deleteMany({ where: { chain } });
        await prisma.prismaReliquaryFarmSnapshot.deleteMany({ where: { chain } });

        const farms = await prisma.prismaPoolStakingReliquaryFarm.findMany({ where: { chain } });
        const farmIds = farms.map((farm) => parseFloat(farm.id));
        for (const farmId of farmIds) {
            await reliquarySnapshotService.loadAllSnapshotsForFarm(farmId, excludedFarmIds, chain);
        }
    }
};
