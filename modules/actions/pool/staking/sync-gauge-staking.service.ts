/**
 * Supports calculation of BAL and token rewards sent to gauges.
 * Balancer has 3 types of gauges:
 *
 * 1. Mainnet gauges with working supply and relative weight
 * 2. Old L2 gauges with BAL rewards sent as a reward token
 * 3. New L2 gauges (aka child chain gauges) with direct BAL rewards through a streamer.
 *
 * Reward data is fetched onchain and stored in the DB as a token rate per second.
 */
import { prisma } from '../../../../prisma/prisma-client';
import { prismaBulkExecuteOperations } from '../../../../prisma/prisma-util';
import { Chain, PrismaPoolStakingType } from '@prisma/client';
import { networkContext } from '../../../network/network-context.service';
import { GaugeSubgraphService, LiquidityGaugeStatus } from '../../../subgraphs/gauge-subgraph/gauge-subgraph.service';
import gaugeControllerAbi from '../../../vebal/abi/gaugeController.json';
import childChainGaugeV2Abi from './abi/ChildChainGaugeV2.json';
import childChainGaugeV1Abi from './abi/ChildChainGaugeV1.json';
import mainnetLiquidityGaugeAbi from './abi/MainnetLiquidityGauge.json';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import type { JsonFragment } from '@ethersproject/abi';
import { Multicaller3 } from '../../../web3/multicaller3';
import { getInflationRate } from '../../../vebal/balancer-token-admin.service';
import _ from 'lodash';

interface GaugeRewardData {
    [address: string]: {
        rewardData: {
            [address: string]: {
                period_finish?: BigNumber;
                rate?: BigNumber;
            };
        };
    };
}

interface GaugeBalDistributionData {
    [address: string]: {
        rate?: BigNumber;
        weight?: BigNumber;
        workingSupply?: BigNumber;
        totalSupply?: BigNumber;
        relativeWeightCap?: BigNumber;
    };
}

export const syncGaugeStakingForPools = async (
    gaugeSubgraphService: GaugeSubgraphService,
    balAddressInput: string,
): Promise<void> => {
    const balAddress = balAddressInput.toLowerCase();

    const balMulticaller = new Multicaller3([
        ...childChainGaugeV2Abi.filter((abi) => abi.name === 'totalSupply'),
        ...childChainGaugeV2Abi.filter((abi) => abi.name === 'working_supply'),
        ...childChainGaugeV2Abi.filter((abi) => abi.name === 'inflation_rate'),
        ...mainnetLiquidityGaugeAbi.filter((abi) => abi.name === 'getRelativeWeightCap'),
        gaugeControllerAbi.find((abi) => abi.name === 'gauge_relative_weight'),
    ] as JsonFragment[]);

    const rewardsMulticallerV1 = new Multicaller3([
        ...childChainGaugeV1Abi.filter((abi) => abi.name === 'reward_data'),
    ]);

    const rewardsMulticallerV2 = new Multicaller3([
        ...childChainGaugeV2Abi.filter((abi) => abi.name === 'reward_data'),
    ]);

    // Getting data from the DB and subgraph

    const dbPools = await prisma.prismaPool.findMany({
        where: { chain: networkContext.chain },
        include: { staking: { include: { gauge: { include: { rewards: true } } } } },
    });

    const poolAddresses = dbPools.map((pool) => pool.address);
    const { liquidityGauges: subgraphGauges } = await gaugeSubgraphService.getAllGaugesForPoolAddresses(poolAddresses);

    /*
    TODO This can result in multiple preferential gauges for a pool 
    because its a manual two-step process to set them (set new preferential and unset old preferential)
    We are logginga sentry error if that happens.
    */
    const gaugesForDb = subgraphGauges.map((gauge) => ({
        id: gauge.id,
        poolId: gauge.poolId || gauge.poolAddress,
        status: gauge.isKilled
            ? 'KILLED'
            : !gauge.isPreferentialGauge
            ? 'ACTIVE'
            : ('PREFERRED' as LiquidityGaugeStatus),
        version: gauge.streamer || networkContext.chain == 'MAINNET' ? 1 : (2 as 1 | 2),
        tokens: gauge.tokens || [],
        createTime: gauge.gauge?.addedTimestamp,
    }));

    for (const gauge of gaugesForDb) {
        const preferredGaugesForPool = gaugesForDb.filter((g) => gauge.poolId === g.poolId && g.status === 'PREFERRED');
        if (preferredGaugesForPool.length > 1) {
            console.error(
                `Pool ${gauge.poolId} on ${
                    networkContext.chain
                } has multiple preferred gauges: ${preferredGaugesForPool.map((gauge) => gauge.id)}`,
            );
        }
    }

    // Get tokens used for all reward tokens including native BAL address, which might not be on the list of tokens stored in the gauge
    const prismaTokens = await prisma.prismaToken.findMany({
        where: {
            address: {
                in: [
                    balAddress,
                    ...subgraphGauges
                        .map((gauge) => gauge.tokens?.map((token) => token.id.split('-')[0].toLowerCase()))
                        .flat()
                        .filter((address): address is string => !!address),
                ],
            },
            chain: networkContext.chain,
        },
    });

    const onchainRates = await getOnchainRewardTokensData(
        gaugesForDb,
        balAddress,
        balMulticaller,
        rewardsMulticallerV1,
        rewardsMulticallerV2,
    );

    // Prepare DB operations
    const operations: any[] = [];

    const allDbStakings = dbPools.map((pool) => pool.staking).flat();
    const allDbStakingGauges = dbPools
        .map((pool) => pool.staking)
        .flat()
        .map((gauge) => gauge.gauge);

    // DB operations for gauges
    for (const gauge of gaugesForDb) {
        const dbStaking = allDbStakings.find((staking) => staking.id === gauge.id);
        if (!dbStaking) {
            operations.push(
                prisma.prismaPoolStaking.upsert({
                    where: { id_chain: { id: gauge.id, chain: networkContext.chain } },
                    create: {
                        id: gauge.id,
                        chain: networkContext.chain,
                        poolId: gauge.poolId,
                        type: 'GAUGE',
                        address: gauge.id,
                    },
                    update: {},
                }),
            );
        }

        const dbStakingGauge = allDbStakingGauges.find((stakingGauge) => stakingGauge?.id === gauge.id);
        const workingSupply = onchainRates.find(({ id }) => id.includes(gauge.id))?.workingSupply;
        const totalSupply = onchainRates.find(({ id }) => id.includes(gauge.id))?.totalSupply;
        if (
            !dbStakingGauge ||
            dbStakingGauge.status !== gauge.status ||
            dbStakingGauge.version !== gauge.version ||
            dbStakingGauge.workingSupply !== workingSupply ||
            dbStakingGauge.totalSupply !== totalSupply
        ) {
            operations.push(
                prisma.prismaPoolStakingGauge.upsert({
                    where: { id_chain: { id: gauge.id, chain: networkContext.chain } },
                    create: {
                        id: gauge.id,
                        stakingId: gauge.id,
                        gaugeAddress: gauge.id,
                        chain: networkContext.chain,
                        status: gauge.status,
                        version: gauge.version,
                        workingSupply: workingSupply,
                        totalSupply: totalSupply,
                    },
                    update: {
                        status: gauge.status,
                        version: gauge.version,
                        workingSupply: workingSupply,
                        totalSupply: totalSupply,
                    },
                }),
            );
        }
    }

    const allStakingGaugeRewards = allDbStakingGauges.map((gauge) => gauge?.rewards).flat();

    // DB operations for gauge reward tokens
    for (const { id, rewardPerSecond, isVeBalemissions } of onchainRates) {
        const [gaugeId, tokenAddress] = id.toLowerCase().split('-');
        const token = prismaTokens.find((token) => token.address === tokenAddress);
        if (!token) {
            // Report missing tokens for active rewards only
            if (Number(rewardPerSecond) > 0) {
                const poolId = subgraphGauges.find((gauge) => gauge.id === gaugeId)?.poolId;
                console.error(
                    `Could not find reward token (${tokenAddress}) in DB for gauge ${gaugeId} of pool ${poolId} on chain ${networkContext.chain}`,
                );
            }
            continue;
        }

        const dbStakingGaugeRewards = allStakingGaugeRewards.find((rewards) => rewards?.id === id);

        if (!dbStakingGaugeRewards || dbStakingGaugeRewards.rewardPerSecond !== rewardPerSecond) {
            operations.push(
                prisma.prismaPoolStakingGaugeReward.upsert({
                    create: {
                        id,
                        chain: networkContext.chain,
                        gaugeId,
                        tokenAddress,
                        rewardPerSecond,
                        isVeBalemissions,
                    },
                    update: {
                        rewardPerSecond,
                        isVeBalemissions,
                    },
                    where: { id_chain: { id, chain: networkContext.chain } },
                }),
            );
        }
    }

    await prismaBulkExecuteOperations(operations, true);
};

const getOnchainRewardTokensData = async (
    gauges: { id: string; version: 1 | 2; tokens: { id: string; decimals: number }[] }[],
    balAddress: string,
    balMulticaller: Multicaller3,
    rewardsMulticallerV1: Multicaller3,
    rewardsMulticallerV2: Multicaller3,
): Promise<
    {
        id: string;
        rewardPerSecond: string;
        workingSupply: string;
        totalSupply: string;
        isVeBalemissions: boolean;
    }[]
> => {
    // Get onchain data for BAL rewards
    const currentWeek = Math.floor(Date.now() / 1000 / 604800);
    for (const gauge of gauges) {
        balMulticaller.call(`${gauge.id}.totalSupply`, gauge.id, 'totalSupply', [], true);
        if (gauge.version === 2) {
            balMulticaller.call(`${gauge.id}.rate`, gauge.id, 'inflation_rate', [currentWeek], true);
            balMulticaller.call(`${gauge.id}.workingSupply`, gauge.id, 'working_supply', [], true);
        } else if (networkContext.chain === Chain.MAINNET) {
            balMulticaller.call(
                `${gauge.id}.weight`,
                networkContext.data.gaugeControllerAddress!,
                'gauge_relative_weight',
                [gauge.id],
                true,
            );
            balMulticaller.call(`${gauge.id}.workingSupply`, gauge.id, 'working_supply', [], true);
            balMulticaller.call(`${gauge.id}.relativeWeightCap`, gauge.id, 'getRelativeWeightCap', [], true);
        }
    }
    const balData = (await balMulticaller.execute()) as GaugeBalDistributionData;

    // Get onchain data for reward tokens
    const decimals: { [address: string]: number } = {};
    for (const gauge of gauges) {
        for (const token of gauge.tokens ?? []) {
            const [address] = token.id.toLowerCase().split('-');
            decimals[address] = token.decimals;
            if (gauge.version === 1) {
                rewardsMulticallerV1.call(
                    `${gauge.id}.rewardData.${address}`,
                    gauge.id,
                    'reward_data',
                    [address],
                    true,
                );
            } else {
                rewardsMulticallerV2.call(
                    `${gauge.id}.rewardData.${address}`,
                    gauge.id,
                    'reward_data',
                    [address],
                    true,
                );
            }
        }
    }
    const rewardsDataV1 = (await rewardsMulticallerV1.execute()) as GaugeRewardData;
    const rewardsDataV2 = (await rewardsMulticallerV2.execute()) as GaugeRewardData;
    const rewardsData = { ...rewardsDataV1, ...rewardsDataV2 };

    const totalBalRate = parseFloat(formatUnits(await getInflationRate()));
    const now = Math.floor(Date.now() / 1000);

    // Format onchain rates for all the rewards
    const onchainRates = [
        ...Object.keys(balData).map((gaugeAddress) => {
            const id = `${gaugeAddress}-${balAddress}-balgauge`.toLowerCase();
            const { rate, weight, workingSupply, totalSupply, relativeWeightCap } = balData[gaugeAddress];

            let weightAfterCap;
            if (relativeWeightCap && weight) {
                weightAfterCap = Math.min(parseFloat(formatUnits(relativeWeightCap)), parseFloat(formatUnits(weight)));
            }
            const rewardPerSecond = rate
                ? formatUnits(rate) // L2 V2 case for BAL rewards
                : weightAfterCap
                ? (weightAfterCap! * totalBalRate).toFixed(18) // mainnet case for BAL rewards
                : '0'; // mainnet case without any votes for this gauge for BAL rewards

            return {
                id,
                rewardPerSecond,
                workingSupply: workingSupply ? formatUnits(workingSupply) : '0',
                totalSupply: totalSupply ? formatUnits(totalSupply) : '0',
                isVeBalemissions: true,
            };
        }),
        ...Object.keys(rewardsData)
            .map((gaugeAddress) => [
                // L2 V1 case with any token
                ...Object.keys(rewardsData[gaugeAddress].rewardData).map((tokenAddress) => {
                    const id = `${gaugeAddress}-${tokenAddress}-reward`.toLowerCase();
                    const { rate, period_finish } = rewardsData[gaugeAddress].rewardData[tokenAddress];
                    const rewardPerSecond =
                        period_finish && period_finish.toNumber() > now
                            ? formatUnits(rate!, decimals[tokenAddress])
                            : '0.0';
                    const { totalSupply } = balData[gaugeAddress];

                    return {
                        id,
                        rewardPerSecond,
                        workingSupply: '0',
                        totalSupply: totalSupply ? formatUnits(totalSupply) : '0',
                        isVeBalemissions: false,
                    };
                }),
            ])
            .flat(),
    ] as {
        id: string;
        rewardPerSecond: string;
        workingSupply: string;
        totalSupply: string;
        isVeBalemissions: boolean;
    }[];

    return onchainRates;
};

export const deleteGaugeStakingForAllPools = async (
    stakingTypes: PrismaPoolStakingType[],
    chain: Chain,
): Promise<void> => {
    if (stakingTypes.includes('GAUGE')) {
        await prisma.prismaUserStakedBalance.deleteMany({
            where: { staking: { type: 'GAUGE', chain: chain } },
        });
        await prisma.prismaVotingGauge.deleteMany({
            where: { chain: chain },
        });
        await prisma.prismaPoolStakingGaugeReward.deleteMany({ where: { chain: chain } });
        await prisma.prismaPoolStakingGauge.deleteMany({ where: { chain: chain } });
        await prisma.prismaPoolStaking.deleteMany({ where: { chain: chain, type: 'GAUGE' } });
    }
};
