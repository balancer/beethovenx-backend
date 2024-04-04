import { Prisma, PrismaToken, PrismaTokenTypeOption, PrismaPoolEvent } from '@prisma/client';

export type SwapEvent = PrismaPoolEvent & {
    type: 'SWAP';
    payload: {
        fee: {
            address: string;
            amount: string;
            valueUSD: number;
        };
        tokenIn: {
            address: string;
            amount: string;
            valueUSD: number;
        };
        tokenOut: {
            address: string;
            amount: string;
            valueUSD: number;
        };
    };
};

export type JoinExitEvent = PrismaPoolEvent & {
    type: 'JOIN' | 'EXIT';
    payload: {
        tokens: {
            address: string;
            amount: string;
            valueUSD: number;
        }[];
    };
};

export const poolWithTokens = Prisma.validator<Prisma.PrismaPoolArgs>()({
    include: { tokens: true },
});

export type PrismaPoolWithTokens = Prisma.PrismaPoolGetPayload<typeof poolWithTokens>;

const poolTokenWithDynamicData = Prisma.validator<Prisma.PrismaPoolTokenArgs>()({
    include: { dynamicData: true, token: true },
});

export type PrismaPoolTokenWithDynamicData = Prisma.PrismaPoolTokenGetPayload<typeof poolTokenWithDynamicData>;

export const prismaPoolWithExpandedNesting = Prisma.validator<Prisma.PrismaPoolArgs>()({
    include: {
        dynamicData: true,
        staking: {
            include: {
                farm: {
                    include: {
                        rewarders: true,
                    },
                },
                gauge: {
                    include: {
                        rewards: true,
                    },
                },
                reliquary: {
                    include: {
                        levels: {
                            orderBy: { level: 'asc' },
                        },
                    },
                },
            },
        },
        categories: true,
        allTokens: {
            include: {
                token: {
                    include: {
                        types: true,
                    },
                },
                nestedPool: {
                    include: {
                        allTokens: {
                            include: {
                                token: {
                                    include: {
                                        types: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        aprItems: {
            include: {
                range: true,
            },
        },
        tokens: {
            orderBy: { index: 'asc' },
            include: {
                dynamicData: true,
                token: true,
                nestedPool: {
                    include: {
                        dynamicData: true,
                        tokens: {
                            orderBy: { index: 'asc' },
                            include: {
                                token: true,
                                dynamicData: true,
                                nestedPool: {
                                    include: {
                                        dynamicData: true,
                                        tokens: {
                                            orderBy: { index: 'asc' },
                                            include: {
                                                token: true,
                                                dynamicData: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
});

export type PrismaPoolWithExpandedNesting = Prisma.PrismaPoolGetPayload<typeof prismaPoolWithExpandedNesting>;

const nestedPoolWithSingleLayerNesting = Prisma.validator<Prisma.PrismaPoolArgs>()({
    include: {
        dynamicData: true,
        tokens: {
            orderBy: { index: 'asc' },
            include: {
                token: true,
                dynamicData: true,
                nestedPool: {
                    include: {
                        dynamicData: true,
                        tokens: {
                            orderBy: { index: 'asc' },
                            include: {
                                token: true,
                                dynamicData: true,
                            },
                        },
                    },
                },
            },
        },
    },
});

export type PrismaNestedPoolWithSingleLayerNesting = Prisma.PrismaPoolGetPayload<
    typeof nestedPoolWithSingleLayerNesting
>;

const nestedPoolWithNoNesting = Prisma.validator<Prisma.PrismaPoolArgs>()({
    include: {
        dynamicData: true,
        tokens: {
            orderBy: { index: 'asc' },
            include: {
                token: true,
                dynamicData: true,
            },
        },
    },
});

export type PrismaNestedPoolWithNoNesting = Prisma.PrismaPoolGetPayload<typeof nestedPoolWithNoNesting>;

const prismaPoolTokenWithExpandedNesting = Prisma.validator<Prisma.PrismaPoolTokenArgs>()({
    include: {
        token: true,
        dynamicData: true,
        nestedPool: {
            include: {
                dynamicData: true,
                tokens: {
                    orderBy: { index: 'asc' },
                    include: {
                        token: true,
                        dynamicData: true,
                        nestedPool: {
                            include: {
                                dynamicData: true,
                                tokens: {
                                    orderBy: { index: 'asc' },
                                    include: {
                                        token: true,
                                        dynamicData: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
});

export type PrismaPoolTokenWithExpandedNesting = Prisma.PrismaPoolTokenGetPayload<
    typeof prismaPoolTokenWithExpandedNesting
>;

const prismaPoolTokenWithSingleLayerNesting = Prisma.validator<Prisma.PrismaPoolTokenArgs>()({
    include: {
        token: true,
        dynamicData: true,
        nestedPool: {
            include: {
                dynamicData: true,
                tokens: {
                    orderBy: { index: 'asc' },
                    include: {
                        token: true,
                        dynamicData: true,
                    },
                },
            },
        },
    },
});

export type PrismaPoolTokenWithSingleLayerNesting = Prisma.PrismaPoolTokenGetPayload<
    typeof prismaPoolTokenWithSingleLayerNesting
>;

export type PrismaTokenWithTypes = PrismaToken & {
    types: PrismaTokenTypeOption[];
};

export const prismaPoolMinimal = Prisma.validator<Prisma.PrismaPoolArgs>()({
    include: {
        dynamicData: true,
        categories: true,
        allTokens: {
            include: {
                token: {
                    include: {
                        types: true,
                    },
                },
                nestedPool: {
                    include: {
                        allTokens: {
                            include: {
                                token: {
                                    include: {
                                        types: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        aprItems: {
            include: {
                range: true,
            },
        },
        tokens: {
            orderBy: { index: 'asc' },
            include: {
                token: true,
                dynamicData: true,
            },
        },
        staking: {
            include: {
                farm: {
                    include: {
                        rewarders: true,
                    },
                },
                gauge: {
                    include: {
                        rewards: true,
                    },
                },
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

export type PrismaPoolMinimal = Prisma.PrismaPoolGetPayload<typeof prismaPoolMinimal>;

export const prismaPoolBatchSwapWithSwaps = Prisma.validator<Prisma.PrismaPoolBatchSwapArgs>()({
    include: {
        swaps: { include: { pool: { include: prismaPoolMinimal.include } } },
    },
});

export type PrismaPoolBatchSwapWithSwaps = Prisma.PrismaPoolBatchSwapGetPayload<typeof prismaPoolBatchSwapWithSwaps>;

export const prismaPoolWithDynamic = Prisma.validator<Prisma.PrismaPoolArgs>()({
    include: {
        dynamicData: true,
        tokens: {
            orderBy: { index: 'asc' },
            include: {
                token: true,
                dynamicData: true,
            },
        },
    },
});

export type PrismaPoolWithDynamic = Prisma.PrismaPoolGetPayload<typeof prismaPoolWithDynamic>;
