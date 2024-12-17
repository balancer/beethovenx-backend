import { prisma } from '../../../prisma/prisma-client';
import moment from 'moment-timezone';
import {
    JoinExit_OrderBy,
    OrderDirection,
    Swap_OrderBy,
} from '../../subgraphs/balancer-subgraph/generated/balancer-subgraph-types';
import { tokenService, TokenService } from '../../token/token.service';
import {
    GqlPoolJoinExit,
    GqlPoolSwap,
    QueryPoolGetBatchSwapsArgs,
    QueryPoolGetJoinExitsArgs,
    QueryPoolGetSwapsArgs,
} from '../../../schema';
import { Chain, PrismaPoolSwap } from '@prisma/client';
import _ from 'lodash';
import { isSupportedInt, prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import { PrismaPoolBatchSwapWithSwaps, prismaPoolMinimal } from '../../../prisma/prisma-types';
import { networkContext } from '../../network/network-context.service';
import * as Sentry from '@sentry/node';
import { AllNetworkConfigsKeyedOnChain } from '../../network/network-config';

export class PoolSwapService {
    constructor(private readonly tokenService: TokenService) {}

    private get balancerSubgraphService() {
        return networkContext.services.balancerSubgraphService;
    }

    private get chain() {
        return networkContext.chain;
    }

    public async getJoinExits(args: QueryPoolGetJoinExitsArgs): Promise<GqlPoolJoinExit[]> {
        const first = !args.first || args.first > 100 ? 10 : args.first;

        const allChainsJoinExits: GqlPoolJoinExit[] = [];

        if (args.where?.chainIn) {
            for (const chain of args.where.chainIn) {
                const balancerSubgraphService = AllNetworkConfigsKeyedOnChain[chain].services.balancerSubgraphService;

                const { joinExits } = await balancerSubgraphService.getPoolJoinExits({
                    where: { pool_in: args.where?.poolIdIn },
                    first,
                    skip: args.skip,
                    orderBy: JoinExit_OrderBy.Timestamp,
                    orderDirection: OrderDirection.Desc,
                });

                const mappedJoinExits: GqlPoolJoinExit[] = joinExits.map((joinExit) => ({
                    ...joinExit,
                    __typename: 'GqlPoolJoinExit',
                    chain: chain,
                    poolId: joinExit.pool.id,
                    amounts: joinExit.amounts.map((amount, index) => ({
                        address: joinExit.pool.tokensList[index],
                        amount,
                    })),
                }));

                allChainsJoinExits.push(...mappedJoinExits);
            }
        }

        return allChainsJoinExits;
    }

    public async getUserJoinExitsForPool(
        userAddress: string,
        poolId: string,
        chain: Chain,
        first = 10,
        skip = 0,
    ): Promise<GqlPoolJoinExit[]> {
        const balancerSubgraphService = AllNetworkConfigsKeyedOnChain[chain].services.balancerSubgraphService;

        const { joinExits } = await balancerSubgraphService.getPoolJoinExits({
            where: { pool: poolId, user: userAddress },
            first,
            skip: skip,
            orderBy: JoinExit_OrderBy.Timestamp,
            orderDirection: OrderDirection.Desc,
        });

        return joinExits.map((joinExit) => ({
            ...joinExit,
            __typename: 'GqlPoolJoinExit',
            poolId: joinExit.pool.id,
            chain: chain,
            amounts: joinExit.amounts.map((amount, index) => ({ address: joinExit.pool.tokensList[index], amount })),
        }));
    }

    public async getSwaps(args: QueryPoolGetSwapsArgs): Promise<PrismaPoolSwap[]> {
        const take = !args.first || args.first > 100 ? 10 : args.first;

        return prisma.prismaPoolSwap.findMany({
            take,
            skip: args.skip || undefined,
            where: {
                poolId: {
                    in: args.where?.poolIdIn || undefined,
                },
                tokenIn: {
                    in: args.where?.tokenInIn || undefined,
                },
                tokenOut: {
                    in: args.where?.tokenOutIn || undefined,
                },
                chain: {
                    in: args.where?.chainIn || undefined,
                },
            },
            orderBy: { timestamp: 'desc' },
        });
    }

    public async getUserSwapsForPool(
        userAddress: string,
        poolId: string,
        chain: Chain,
        first = 10,
        skip = 0,
    ): Promise<GqlPoolSwap[]> {
        const balancerSubgraphService = AllNetworkConfigsKeyedOnChain[chain].services.balancerSubgraphService;

        const result = await balancerSubgraphService.getSwaps({
            first,
            skip,
            where: {
                poolId,
                userAddress,
            },
            orderBy: Swap_OrderBy.Timestamp,
            orderDirection: OrderDirection.Desc,
        });

        return result.swaps.map((swap) => ({
            id: swap.id,
            chain: chain,
            userAddress,
            poolId: swap.poolId.id,
            tokenIn: swap.tokenIn,
            tokenAmountIn: swap.tokenAmountIn,
            tokenOut: swap.tokenOut,
            tokenAmountOut: swap.tokenAmountOut,
            valueUSD: parseFloat(swap.valueUSD),
            timestamp: swap.timestamp,
            tx: swap.tx,
        }));
    }

    public async getBatchSwaps(args: QueryPoolGetBatchSwapsArgs): Promise<PrismaPoolBatchSwapWithSwaps[]> {
        const take = !args.first || args.first > 100 ? 10 : args.first;

        return prisma.prismaPoolBatchSwap.findMany({
            take,
            skip: args.skip || undefined,
            where: {
                swaps: args.where?.poolIdIn
                    ? {
                          some: {
                              poolId: {
                                  in: args.where.poolIdIn,
                              },
                          },
                      }
                    : undefined,
                tokenIn: {
                    in: args.where?.tokenInIn || undefined,
                },
                tokenOut: {
                    in: args.where?.tokenOutIn || undefined,
                },
                chain: {
                    in: args.where?.chainIn || undefined,
                },
            },
            orderBy: { timestamp: 'desc' },
            include: {
                swaps: {
                    include: {
                        pool: {
                            include: {
                                tokens: {
                                    include: {
                                        token: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
}
