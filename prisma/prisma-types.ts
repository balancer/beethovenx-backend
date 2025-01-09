import { Prisma, PrismaToken, PrismaTokenTypeOption, PrismaPoolEvent } from '@prisma/client';

export type PoolUpsertData = {
    pool: Prisma.PrismaPoolCreateInput;
    tokens: Prisma.PrismaTokenCreateInput[];
    poolDynamicData: Prisma.PrismaPoolDynamicDataCreateInput;
    poolToken: Prisma.PrismaPoolTokenCreateManyInput[];
    poolExpandedTokens: Prisma.PrismaPoolExpandedTokensCreateManyInput[];
};

export type PoolDynamicUpsertData = {
    poolDynamicData: Prisma.PrismaPoolDynamicDataCreateInput;
    poolToken: Prisma.PrismaPoolTokenCreateManyInput[];
};

export type SwapEvent = PrismaPoolEvent & {
    type: 'SWAP';
    payload: {
        fee: {
            address: string;
            amount: string;
            valueUSD: string;
        };
        surplus?: {
            address: string;
            amount: string;
            valueUSD: string;
        };
        tokenIn: {
            address: string;
            amount: string;
        };
        tokenOut: {
            address: string;
            amount: string;
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

export const poolWithTokens = Prisma.validator<Prisma.PrismaPoolDefaultArgs>()({
    include: { tokens: true },
});

export type PrismaPoolWithTokens = Prisma.PrismaPoolGetPayload<typeof poolWithTokens>;

const poolTokenWithDynamicData = Prisma.validator<Prisma.PrismaPool$tokensArgs>()({
    include: { token: true },
});

export type PrismaPoolTokenWithDynamicData = Prisma.PrismaPoolTokenGetPayload<typeof poolTokenWithDynamicData>;

export const prismaPoolWithExpandedNesting = Prisma.validator<Prisma.PrismaPoolDefaultArgs>()({
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
                aura: true,
                vebal: true,
            },
        },
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
                token: {
                    include: { types: true },
                },
                nestedPool: {
                    include: {
                        dynamicData: true,
                        tokens: {
                            orderBy: { index: 'asc' },
                            include: {
                                token: {
                                    include: { types: true },
                                },
                                nestedPool: {
                                    include: {
                                        dynamicData: true,
                                        tokens: {
                                            orderBy: { index: 'asc' },
                                            include: {
                                                token: true,
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

export const nestedPoolWithSingleLayerNesting = Prisma.validator<Prisma.PrismaPoolDefaultArgs>()({
    include: {
        dynamicData: true,
        tokens: {
            orderBy: { index: 'asc' },
            include: {
                token: {
                    include: { types: true },
                },
                nestedPool: {
                    include: {
                        dynamicData: true,
                        tokens: {
                            orderBy: { index: 'asc' },
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

export type PrismaNestedPoolWithSingleLayerNesting = Prisma.PrismaPoolGetPayload<
    typeof nestedPoolWithSingleLayerNesting
>;

const nestedPoolWithNoNesting = Prisma.validator<Prisma.PrismaPoolDefaultArgs>()({
    include: {
        dynamicData: true,
        tokens: {
            orderBy: { index: 'asc' },
            include: {
                token: true,
            },
        },
    },
});

export type PrismaNestedPoolWithNoNesting = Prisma.PrismaPoolGetPayload<typeof nestedPoolWithNoNesting>;

const prismaPoolTokenWithExpandedNesting = Prisma.validator<Prisma.PrismaPool$tokensArgs>()({
    include: {
        token: {
            include: {
                types: true,
            },
        },
        nestedPool: {
            include: {
                dynamicData: true,
                tokens: {
                    orderBy: { index: 'asc' },
                    include: {
                        token: {
                            include: {
                                types: true,
                            },
                        },
                        nestedPool: {
                            include: {
                                dynamicData: true,
                                tokens: {
                                    orderBy: { index: 'asc' },
                                    include: {
                                        token: true,
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

const prismaPoolTokenWithSingleLayerNesting = Prisma.validator<Prisma.PrismaPool$tokensArgs>()({
    include: {
        token: true,
        nestedPool: {
            include: {
                dynamicData: true,
                tokens: {
                    orderBy: { index: 'asc' },
                    include: {
                        token: true,
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

export const prismaPoolMinimal = Prisma.validator<Prisma.PrismaPoolDefaultArgs>()({
    include: {
        dynamicData: true,
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
                token: {
                    include: { types: true },
                },
                nestedPool: {
                    include: {
                        dynamicData: true,
                        tokens: {
                            orderBy: { index: 'asc' },
                            include: {
                                token: {
                                    include: { types: true },
                                },
                                nestedPool: {
                                    include: {
                                        dynamicData: true,
                                        tokens: {
                                            orderBy: { index: 'asc' },
                                            include: {
                                                token: true,
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
                aura: true,
                vebal: true,
            },
        },
    },
});

export type PrismaPoolMinimal = Prisma.PrismaPoolGetPayload<typeof prismaPoolMinimal>;

export const prismaPoolBatchSwapWithSwaps = Prisma.validator<Prisma.PrismaPoolSwap$batchSwapArgs>()({
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

export type PrismaPoolBatchSwapWithSwaps = Prisma.PrismaPoolBatchSwapGetPayload<typeof prismaPoolBatchSwapWithSwaps>;

export const prismaPoolAndHookWithDynamic = Prisma.validator<Prisma.PrismaPoolDefaultArgs>()({
    include: {
        dynamicData: true,
        tokens: {
            orderBy: { index: 'asc' },
            include: {
                token: true,
            },
        },
    },
});

export type PrismaPoolAndHookWithDynamic = Prisma.PrismaPoolGetPayload<typeof prismaPoolAndHookWithDynamic>;