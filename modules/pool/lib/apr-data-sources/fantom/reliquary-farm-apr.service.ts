import { addressesMatch } from '../../../../web3/addresses';
import { PrismaPoolAprType } from '@prisma/client';
import { prisma } from '../../../../../prisma/prisma-client';
import { PrismaPoolWithTokens } from '../../../../../prisma/prisma-types';
import { prismaBulkExecuteOperations } from '../../../../../prisma/prisma-util';
import { secondsPerYear } from '../../../../common/time';
import { tokenService } from '../../../../token/token.service';
import { PoolAprService } from '../../../pool-types';
import { networkContext } from '../../../../network/network-context.service';
import { ReliquarySubgraphService } from '../../../../subgraphs/reliquary-subgraph/reliquary.service';

export class ReliquaryFarmAprService implements PoolAprService {
    constructor(private readonly beetsAddress: string) {}

    public getAprServiceName(): string {
        return 'ReliquaryFarmAprService';
    }

    public async updateAprForPools(pools: PrismaPoolWithTokens[]): Promise<void> {
        const chain = pools[0].chain;
        const reliquarySubgraphService = new ReliquarySubgraphService(networkContext.data.subgraphs.reliquary!);
        const allSubgraphFarms = await reliquarySubgraphService.getAllFarms({});

        const filteredFarms = allSubgraphFarms.filter(
            (farm) => !networkContext.data.reliquary!.excludedFarmIds.includes(farm.pid.toString()),
        );

        const expandedReliquaryPools = await prisma.prismaPool.findMany({
            where: { chain: chain, id: { in: pools.map((pool) => pool.id) } },
            include: {
                dynamicData: true,
                staking: {
                    include: {
                        reliquary: {
                            include: {
                                levels: {
                                    orderBy: { level: 'asc' },
                                },
                            },
                        },
                    },
                },
            },
        });

        const tokenPrices = await tokenService.getTokenPrices(chain);
        const operations: any[] = [];

        for (const pool of expandedReliquaryPools) {
            const subgraphFarm = filteredFarms.find((farm) => addressesMatch(pool.address, farm.poolTokenAddress));
            let farm;
            for (const stake of pool.staking) {
                farm = stake.reliquary;
            }

            if (!subgraphFarm || !pool.dynamicData || !farm || subgraphFarm.totalBalance === '0') {
                continue;
            }

            const totalShares = parseFloat(pool.dynamicData.totalShares);
            const totalLiquidity = pool.dynamicData?.totalLiquidity || 0;
            const pricePerShare = totalLiquidity / totalShares;

            const beetsPrice = tokenService.getPriceForToken(tokenPrices, this.beetsAddress, chain);
            const farmBeetsPerYear = parseFloat(farm.beetsPerSecond) * secondsPerYear;
            const beetsValuePerYear = beetsPrice * farmBeetsPerYear;

            const totalWeightedSupply = subgraphFarm.levels.reduce(
                (total, level) => total + level.allocationPoints * parseFloat(level.balance),
                0,
            );

            /*
                on the pool overview & detail page, we only show min & max apr values, but on the 
                reliquary page we want to show apr values for each level, so we search for the min / max 
                apr values and add the as apr items and also update the apr for each level of the farm
            */
            let minApr = 0;
            let maxApr = 0;

            for (let farmLevel of subgraphFarm.levels) {
                const levelSupply = parseFloat(farmLevel.balance);
                const aprShare = (farmLevel.allocationPoints * levelSupply) / totalWeightedSupply;
                const apr = levelSupply !== 0 ? (beetsValuePerYear * aprShare) / (levelSupply * pricePerShare) : 0;

                if (minApr === 0 && maxApr === 0) {
                    minApr = apr;
                    maxApr = apr;
                } else if (apr !== 0 && apr < minApr) {
                    minApr = apr;
                } else if (apr > maxApr) {
                    maxApr = apr;
                }
                operations.push(
                    prisma.prismaPoolStakingReliquaryFarmLevel.update({
                        where: {
                            id_chain: {
                                id: `${subgraphFarm.pid}-${farmLevel.level}`,
                                chain: chain,
                            },
                        },
                        data: {
                            apr: apr || 0,
                        },
                    }),
                );
            }

            operations.push(
                prisma.prismaPoolAprItem.upsert({
                    where: { id_chain: { id: `${pool.id}-beets-apr`, chain: chain } },
                    update: {
                        range: {
                            update: { min: minApr, max: maxApr },
                        },
                    },
                    create: {
                        id: `${pool.id}-beets-apr`,
                        chain: chain,
                        poolId: pool.id,
                        title: 'BEETS reward APR',
                        apr: maxApr,
                        range: {
                            create: {
                                id: `${pool.id}-beets-apr-range`,
                                min: minApr,
                                max: maxApr,
                            },
                        },
                        type: PrismaPoolAprType.NATIVE_REWARD,
                        group: null,
                        rewardTokenAddress: this.beetsAddress,
                        rewardTokenSymbol: 'BEETS',
                    },
                }),
            );
        }

        await prismaBulkExecuteOperations(operations);
    }
}
