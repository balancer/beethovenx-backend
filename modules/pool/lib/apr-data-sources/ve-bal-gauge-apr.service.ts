/**
 * This service calculates the APR for a pool based on the gauge rewards
 *
 * Definitions:
 * The “working supply” of the gauge - the effective total LP token amount after all deposits have been boosted.
 * "Working balance" is 40% of a user balance in a gauge - used only for BAL rewards on v2 gauges on child gauges or on mainnet
 */
import { PrismaPoolWithTokens } from '../../../../prisma/prisma-types';
import { PoolAprService } from '../../pool-types';
import { TokenService } from '../../../token/token.service';
import { secondsPerYear } from '../../../common/time';
import { PrismaPoolAprItem, PrismaPoolAprRange, PrismaPoolAprType } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma-client';
import { prismaBulkExecuteOperations } from '../../../../prisma/prisma-util';
import { networkContext } from '../../../network/network-context.service';

export class GaugeAprService implements PoolAprService {
    private readonly MAX_VEBAL_BOOST = 2.5;

    constructor(private readonly tokenService: TokenService, private readonly primaryTokens: string[]) {}

    public getAprServiceName(): string {
        return 'GaugeAprService';
    }

    public async updateAprForPools(pools: { id: string }[]): Promise<void> {
        const itemOperations: any[] = [];
        const rangeOperations: any[] = [];

        // Get the data
        const tokenPrices = await this.tokenService.getTokenPrices();
        const stakings = await prisma.prismaPoolStaking.findMany({
            where: {
                poolId: { in: pools.map((pool) => pool.id) },
                type: 'GAUGE',
                chain: networkContext.chain,
            },
            include: {
                gauge: {
                    include: {
                        rewards: true,
                    },
                },
                pool: {
                    include: {
                        dynamicData: true,
                    },
                },
            },
        });

        for (const stake of stakings) {
            const { pool, gauge } = stake;

            if (!gauge || !gauge.rewards || !pool.dynamicData || pool.dynamicData.totalShares === '0') {
                continue;
            }

            // Get token rewards per year with data needed for the DB
            const rewards = await Promise.allSettled(
                gauge.rewards.map(async ({ id, tokenAddress, rewardPerSecond, isVeBalemissions }) => {
                    const price = this.tokenService.getPriceForToken(tokenPrices, tokenAddress, networkContext.chain);
                    if (!price) {
                        return Promise.reject(`Price not found for ${tokenAddress}`);
                    }

                    let definition;
                    try {
                        definition = await prisma.prismaToken.findUniqueOrThrow({
                            where: { address_chain: { address: tokenAddress, chain: networkContext.chain } },
                        });
                    } catch (e) {
                        //we don't have the reward token added as a token, only happens for testing tokens
                        return Promise.reject('Definition not found');
                    }

                    return {
                        id: id,
                        address: tokenAddress,
                        symbol: definition.symbol,
                        rewardPerYear: parseFloat(rewardPerSecond) * secondsPerYear * price,
                        isVeBalemissions: isVeBalemissions,
                    };
                }),
            );

            // Calculate APRs
            const totalShares = parseFloat(pool.dynamicData.totalShares);
            const bptPrice = pool.dynamicData.totalLiquidity / totalShares;
            const gaugeTvl = totalShares > 0 ? parseFloat(gauge.totalSupply) * bptPrice : 0;
            const workingSupply = parseFloat(gauge.workingSupply);

            const aprItems = rewards
                .map((reward) => {
                    if (reward.status === 'rejected') {
                        console.error(
                            `Error: Failed to get reward data for ${gauge.id} on chain ${networkContext.chainId}: ${reward.reason}`,
                        );
                        return null;
                    }

                    const { address, symbol, rewardPerYear, isVeBalemissions } = reward.value;

                    const itemData: PrismaPoolAprItem = {
                        id: `${reward.value.id}-${symbol}-apr`,
                        chain: networkContext.chain,
                        poolId: pool.id,
                        title: `${symbol} reward APR`,
                        group: null,
                        apr: 0,
                        rewardTokenAddress: address,
                        rewardTokenSymbol: symbol,
                        type: isVeBalemissions ? PrismaPoolAprType.NATIVE_REWARD : PrismaPoolAprType.THIRD_PARTY_REWARD,
                    };

                    // veBAL rewards have a range associated with the item
                    // this is deprecated
                    if (isVeBalemissions && (networkContext.chain === 'MAINNET' || gauge.version === 2)) {
                        let minApr = 0;
                        if (workingSupply > 0 && totalShares > 0) {
                            minApr = (((totalShares * 0.4) / workingSupply) * rewardPerYear) / gaugeTvl;
                        } else if (gaugeTvl > 0) {
                            minApr = rewardPerYear / gaugeTvl;
                        }

                        const aprRangeId = `${itemData.id}-range`;

                        const rangeData = {
                            id: aprRangeId,
                            chain: networkContext.chain,
                            aprItemId: itemData.id,
                            min: minApr,
                            max: minApr * this.MAX_VEBAL_BOOST,
                        };

                        itemData.apr = minApr * this.MAX_VEBAL_BOOST;

                        return [itemData, rangeData];
                    } else {
                        itemData.apr = gaugeTvl > 0 ? rewardPerYear / gaugeTvl : 0;

                        return itemData;
                    }
                })
                .flat()
                .filter((apr): apr is PrismaPoolAprItem | PrismaPoolAprRange => apr !== null);

            const items = aprItems.filter((item) => !item.id.includes('apr-range'));
            const ranges = aprItems.filter((item) => item.id.includes('apr-range'));

            itemOperations.push(
                ...items.map((item) =>
                    prisma.prismaPoolAprItem.upsert({
                        where: {
                            id_chain: { id: item.id, chain: networkContext.chain },
                        },
                        update: item,
                        create: item as PrismaPoolAprItem,
                    }),
                ),
            );
            rangeOperations.push(
                ...ranges.map((range) =>
                    prisma.prismaPoolAprRange.upsert({
                        where: {
                            id_chain: { id: range.id, chain: networkContext.chain },
                        },
                        update: range,
                        create: range as PrismaPoolAprRange,
                    }),
                ),
            );
        }

        await prismaBulkExecuteOperations(itemOperations);
        await prismaBulkExecuteOperations(rangeOperations);
    }
}
