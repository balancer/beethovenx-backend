import {
    GqlPoolEventsDataRange,
    GqlPoolAddRemoveEventV3,
    GqlPoolSwapEventV3,
    QueryPoolEventsArgs,
    GqlPoolSwapEventCowAmm,
} from '../../apps/api/gql/generated-schema';
import { prisma } from '../../prisma/prisma-client';
import { Chain, PoolEventType, Prisma } from '@prisma/client';
import { JoinExitEvent, SwapEvent } from '../../prisma/prisma-types';
import { daysAgo } from '../common/time';

const parseJoinExit = (event: JoinExitEvent): GqlPoolAddRemoveEventV3 => {
    return {
        __typename: 'GqlPoolAddRemoveEventV3',
        tokens: event.payload.tokens.map((token) => ({
            address: token.address,
            amount: token.amount,
            valueUSD: token.valueUSD,
        })),
        ...event,
        type: event.type === 'JOIN' ? 'ADD' : 'REMOVE',
        valueUSD: event.valueUSD,
        timestamp: event.blockTimestamp,
        sender: event.userAddress,
    };
};

const parseSwap = (event: SwapEvent): GqlPoolSwapEventV3 => {
    return {
        __typename: 'GqlPoolSwapEventV3',
        ...event,
        valueUSD: event.valueUSD || 0,
        sender: event.userAddress,
        timestamp: event.blockTimestamp,
        tokenIn: {
            ...event.payload.tokenIn,
            valueUSD: event.valueUSD,
        },
        tokenOut: {
            ...event.payload.tokenOut,
            valueUSD: event.valueUSD,
        },
        fee: {
            ...event.payload.fee,
            valueUSD: Number(event.payload.fee.valueUSD),
        },
    };
};

const parseCowAmmSwap = (event: SwapEvent): GqlPoolSwapEventCowAmm => {
    const regularSwap = parseSwap(event);
    return {
        ...regularSwap,
        __typename: 'GqlPoolSwapEventCowAmm',
        surplus: (event.payload.surplus && {
            ...event.payload.surplus,
            valueUSD: Number(event.payload.surplus.valueUSD),
        }) || { address: '', amount: '0', valueUSD: 0 },
    };
};

const rangeToTimestamp = (range: GqlPoolEventsDataRange): number => {
    switch (range) {
        case 'THIRTY_DAYS':
            return daysAgo(30);
        case 'NINETY_DAYS':
            return daysAgo(90);
        default:
            return daysAgo(7);
    }
};

const getMultichainEvents = async (chainIn: Chain[]) => {
    const results = await Promise.all(
        chainIn.map(async (chain) => {
            return (
                await prisma.prismaPoolEvent.findMany({
                    where: {
                        chain,
                    },
                    take: 100,
                    orderBy: [
                        {
                            blockTimestamp: 'desc',
                        },
                        {
                            blockNumber: 'desc',
                        },
                        {
                            logIndex: 'desc',
                        },
                    ],
                })
            ).map((event) =>
                event.type === 'SWAP' && (event as SwapEvent).payload?.surplus
                    ? parseCowAmmSwap(event as SwapEvent)
                    : event.type === 'SWAP'
                    ? parseSwap(event as SwapEvent)
                    : parseJoinExit(event as JoinExitEvent),
            );
        }),
    );

    return results.flat().sort((a, b) => {
        if (a.blockTimestamp === b.blockTimestamp) {
            if (a.blockNumber === b.blockNumber) {
                return a.logIndex - b.logIndex;
            }
            return a.blockNumber - b.blockNumber;
        }
        return a.blockTimestamp - b.blockTimestamp;
    });
};

export function EventsQueryController(tracer?: any) {
    return {
        /**
         * Getting pool events, with pagination and filtering. This is for all vault versions.
         *
         * @param param.first - number of items to return
         * @param param.skip - number of items to skip
         * @param param.where - filtering conditions
         * @returns
         */
        getEvents: async ({
            first,
            skip,
            where,
        }: QueryPoolEventsArgs): Promise<(GqlPoolSwapEventV3 | GqlPoolSwapEventCowAmm | GqlPoolAddRemoveEventV3)[]> => {
            // Setting default values
            first = Math.min(1000, first ?? 1000); // Limiting to 1000 items
            skip = skip ?? 0;
            let { chainIn, poolIdIn, userAddress, typeIn, range, valueUSD_gt, valueUSD_gte } = where || {};

            const conditions: Prisma.PrismaPoolEventWhereInput = {};

            // Table is partitioned by chain, so querying by many chains is extermenly inefficient.
            if (chainIn && chainIn.length > 1) {
                return getMultichainEvents(chainIn as Chain[]);
            }

            if (chainIn && chainIn.length) {
                conditions.chain = {
                    in: chainIn as Chain[],
                };
            }

            if (poolIdIn && poolIdIn.length) {
                conditions.poolId = {
                    in: poolIdIn as string[],
                };
            }

            if (typeIn && typeIn.length) {
                // Translate JOIN / EXIT to ADD / REMOVE
                const dbTypes: PoolEventType[] = [];
                if (typeIn.includes('ADD')) {
                    dbTypes.push('JOIN');
                }
                if (typeIn.includes('REMOVE')) {
                    dbTypes.push('EXIT');
                }
                if (typeIn.includes('SWAP')) {
                    dbTypes.push('SWAP');
                }
                conditions.type = {
                    in: dbTypes,
                };
            }

            if (userAddress) {
                conditions.userAddress = {
                    equals: userAddress.toLowerCase(),
                };
            }

            if (range) {
                conditions.blockTimestamp = {
                    gte: rangeToTimestamp(range),
                };
            }

            if (typeof valueUSD_gt === 'number' && !isNaN(valueUSD_gt) && valueUSD_gte === undefined) {
                conditions.valueUSD = {
                    gt: valueUSD_gt,
                };
            }

            if (typeof valueUSD_gte === 'number' && !isNaN(valueUSD_gte) && valueUSD_gt === undefined) {
                conditions.valueUSD = {
                    gte: valueUSD_gte,
                };
            }

            const dbEvents = await prisma.prismaPoolEvent.findMany({
                where: conditions,
                take: first,
                skip,
                orderBy: [
                    {
                        blockTimestamp: 'desc',
                    },
                    {
                        blockNumber: 'desc',
                    },
                    {
                        logIndex: 'desc',
                    },
                ],
            });

            const results = dbEvents.map((event) =>
                event.type === 'SWAP' && (event as SwapEvent).payload?.surplus
                    ? parseCowAmmSwap(event as SwapEvent)
                    : event.type === 'SWAP'
                    ? parseSwap(event as SwapEvent)
                    : parseJoinExit(event as JoinExitEvent),
            );

            return results;
        },
    };
}
