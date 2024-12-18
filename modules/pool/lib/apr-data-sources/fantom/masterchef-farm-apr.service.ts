import { PrismaPoolAprItem, PrismaTokenCurrentPrice } from '@prisma/client';
import { prisma } from '../../../../../prisma/prisma-client';
import { PrismaPoolWithExpandedNesting, PrismaPoolWithTokens } from '../../../../../prisma/prisma-types';
import { prismaBulkExecuteOperations } from '../../../../../prisma/prisma-util';
import { secondsPerYear } from '../../../../common/time';
import { blocksSubgraphService } from '../../../../subgraphs/blocks-subgraph/blocks-subgraph.service';
import { FarmFragment } from '../../../../subgraphs/masterchef-subgraph/generated/masterchef-subgraph-types';
import { tokenService } from '../../../../token/token.service';
import { PoolAprService } from '../../../pool-types';
import { networkContext } from '../../../../network/network-context.service';
import { MasterchefSubgraphService } from '../../../../subgraphs/masterchef-subgraph/masterchef.service';

const FARM_EMISSIONS_PERCENT = 0.872;

export class MasterchefFarmAprService implements PoolAprService {
    constructor(private readonly beetsAddress: string) {}

    public getAprServiceName(): string {
        return 'MasterchefFarmAprService';
    }

    public async updateAprForPools(pools: PrismaPoolWithTokens[]): Promise<void> {
        const chain = pools[0].chain;
        const masterchefService = new MasterchefSubgraphService(networkContext.data.subgraphs.masterchef!);
        const farms = await masterchefService.getAllFarms({});

        const blocksPerDay = await blocksSubgraphService.getBlocksPerDay();
        const blocksPerYear = blocksPerDay * 365;
        const tokenPrices = await tokenService.getTokenPrices(chain);
        const operations: any[] = [];

        const expandedMasterchefPools = await prisma.prismaPool.findMany({
            where: { chain: networkContext.chain, id: { in: pools.map((pool) => pool.id) } },
            include: {
                dynamicData: true,
            },
        });

        for (const pool of expandedMasterchefPools) {
            const farm = farms.find((farm) => {
                if (pool.id === networkContext.data.fbeets!.poolId) {
                    return farm.id === networkContext.data.fbeets!.farmId;
                }

                return farm.pair.toLowerCase() === pool.address.toLowerCase();
            });

            if (!farm || !pool.dynamicData) {
                continue;
            }

            const farmBptBalance = Number(parseInt(farm.slpBalance) / 1e18);
            const totalShares = parseFloat(pool.dynamicData.totalShares);
            const totalLiquidity = pool.dynamicData?.totalLiquidity || 0;
            const farmTvl = totalShares > 0 ? (farmBptBalance / totalShares) * totalLiquidity : 0;

            const items = await this.calculateFarmApr(pool.id, farm, farmTvl, blocksPerYear, tokenPrices);

            items.forEach((item) => {
                operations.push(
                    prisma.prismaPoolAprItem.upsert({
                        where: { id_chain: { id: item.id, chain: networkContext.chain } },
                        update: item,
                        create: item,
                    }),
                );
            });
        }

        const poolsWithNoAllocPoints = farms
            .filter((farm) => parseFloat(farm.allocPoint) === 0)
            .map((farm) => farm.pair);

        //TODO: this could be optimized, doesn't need to be run everytime
        await prisma.prismaPoolAprItem.deleteMany({
            where: {
                type: 'NATIVE_REWARD',
                pool: { address: { in: poolsWithNoAllocPoints } },
                chain: networkContext.chain,
            },
        });

        await prismaBulkExecuteOperations(operations);
    }

    private async calculateFarmApr(
        poolId: string,
        farm: FarmFragment,
        farmTvl: number,
        blocksPerYear: number,
        tokenPrices: PrismaTokenCurrentPrice[],
    ): Promise<PrismaPoolAprItem[]> {
        if (farmTvl <= 0) {
            return [];
        }

        const beetsPrice = tokenService.getPriceForToken(tokenPrices, this.beetsAddress, networkContext.chain);
        const beetsPerBlock = Number(parseInt(farm.masterChef.beetsPerBlock) / 1e18) * FARM_EMISSIONS_PERCENT;
        const beetsPerYear = beetsPerBlock * blocksPerYear;
        const farmBeetsPerYear = (parseInt(farm.allocPoint) / parseInt(farm.masterChef.totalAllocPoint)) * beetsPerYear;
        const beetsValuePerYear = beetsPrice * farmBeetsPerYear;
        const items: PrismaPoolAprItem[] = [];
        const beetsApr = beetsValuePerYear / farmTvl;

        if (beetsApr > 0) {
            items.push({
                id: `${poolId}-beets-apr`,
                chain: networkContext.chain,
                poolId,
                title: 'BEETS reward APR',
                apr: beetsApr,
                type: 'NATIVE_REWARD',
                group: null,
                rewardTokenAddress: this.beetsAddress,
                rewardTokenSymbol: 'BEETS',
            });
        }

        if (farm.rewarder) {
            for (const rewardToken of farm.rewarder?.rewardTokens) {
                const farmRewarder = await prisma.prismaPoolStakingMasterChefFarmRewarder.findUniqueOrThrow({
                    where: {
                        id_chain: {
                            id: `${farm.id.toLowerCase()}-${farm.rewarder?.id.toLowerCase()}-${rewardToken.token.toLowerCase()}`,
                            chain: networkContext.chain,
                        },
                    },
                });
                const rewardTokenPrice = tokenService.getPriceForToken(
                    tokenPrices,
                    rewardToken.token,
                    networkContext.chain,
                );
                const rewardTokenPerYear = parseFloat(farmRewarder.rewardPerSecond) * secondsPerYear;
                const rewardTokenValuePerYear = rewardTokenPrice * rewardTokenPerYear;
                const rewardApr = rewardTokenValuePerYear / farmTvl > 0 ? rewardTokenValuePerYear / farmTvl : 0;

                items.push({
                    id: `${poolId}-${rewardToken.symbol}-apr`,
                    chain: networkContext.chain,
                    poolId,
                    title: `${rewardToken.symbol} reward APR`,
                    apr: rewardApr,
                    type: 'THIRD_PARTY_REWARD',
                    group: null,
                    rewardTokenAddress: rewardToken.token,
                    rewardTokenSymbol: rewardToken.symbol,
                });
            }
        }

        return items;
    }
}
