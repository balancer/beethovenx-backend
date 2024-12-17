import { Prisma, PrismaPoolType } from '@prisma/client';
import { prisma } from '../../prisma/prisma-client';
import moment from 'moment';
import _ from 'lodash';

export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

type DefaulToken = 'usdc' | 'wftm' | 'wbtc' | 'weth' | 'beets' | 'dai' | 'boo' | 'fba' | 'fbeets';

export const defaultTokens: Record<DefaulToken, Prisma.PrismaTokenCreateInput> = {
    usdc: {
        address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        chain: 'FANTOM',
    },
    wftm: {
        address: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
        symbol: 'wFTM',
        name: 'Wrapped Fantom',
        decimals: 18,
        chain: 'FANTOM',
    },
    wbtc: {
        address: '0x321162cd933e2be498cd2267a90534a804051b11',
        symbol: 'wBTC',
        name: 'Wrapped Bitcoin',
        decimals: 8,
        chain: 'FANTOM',
    },
    weth: {
        address: '0x74b23882a30290451a17c44f4f05243b6b58c76d',
        symbol: 'wETH',
        name: 'Wrapped Ethereum',
        decimals: 18,
        chain: 'FANTOM',
    },
    beets: {
        address: '0xf24bcf4d1e507740041c9cfd2dddb29585adce1e',
        symbol: 'BEETS',
        name: 'Beethoven X',
        decimals: 18,
        chain: 'FANTOM',
    },
    dai: {
        address: '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e',
        symbol: 'DAI',
        name: 'Dai',
        decimals: 18,
        chain: 'FANTOM',
    },
    boo: {
        address: '0x841fad6eae12c286d1fd18d1d525dffa75c7effe',
        symbol: 'BOO',
        name: 'Spookyswap',
        decimals: 18,
        chain: 'FANTOM',
    },
    fba: {
        address: '0x0e249130b3545a2a287de9f27d805cab95f03db9',
        symbol: 'FBA',
        name: 'Firebird Aggregator',
        decimals: 18,
        chain: 'FANTOM',
    },
    fbeets: {
        address: '0xfcef8a994209d6916eb2c86cdd2afd60aa6f54b1',
        symbol: 'FBEETS',
        name: 'Fresh Beets',
        decimals: 18,
        chain: 'FANTOM',
    },
};

export async function createTokens(tokens: Prisma.PrismaTokenCreateInput[]) {
    await prisma.prismaToken.createMany({
        data: tokens,
    });
}

const defaultWeightedPool: Prisma.PrismaPoolCreateInput = {
    id: '0xf3a602d30dcb723a74a0198313a7551feaca7dac00010000000000000000005f',
    chain: 'FANTOM',
    createTime: moment().subtract(10, 'days').unix(),
    address: '0xf3a602d30dcb723a74a0198313a7551feaca7dac',
    symbol: 'BPT-QUARTET',
    name: 'A Late Quartet',
    decimals: 18,
    type: PrismaPoolType.WEIGHTED,
    swapFeeManager: '0x0000000000000000000000000000000000000000',
    factory: '0x92b377187bccc6556fced2f1e6dad65850c20630',
    tokens: {},
    dynamicData: {
        create: {
            id: '0xf3a602d30dcb723a74a0198313a7551feaca7dac00010000000000000000005f',
            blockNumber: 45000000,
            swapFee: '0.0025',
            swapEnabled: true,
            totalShares: '98618',
            totalSharesNum: 98618,
            totalLiquidity: 6128429,
            volume24h: 650860,
            fees24h: 1626,
            volume48h: 1082006,
            fees48h: 2705,
        },
    },
    staking: {
        create: {
            id: '17',
            address: '0x8166994d9ebbe5829ec86bd81258149b87facfd3',
            type: 'MASTER_CHEF',
        },
    },
};

export async function createWeightedPoolFromDefault(
    pool: DeepPartial<Prisma.PrismaPoolCreateInput> & { id: string },
    tokens: Prisma.PrismaTokenCreateInput[],
) {
    await prisma.prismaToken.createMany({
        data: tokens,
        skipDuplicates: true,
    });

    if (defaultWeightedPool.dynamicData?.create) {
        defaultWeightedPool.dynamicData.create.id = pool.id;
    }

    if (defaultWeightedPool.staking?.create) {
        defaultWeightedPool.staking.create = {
            id: `${pool.id}-stake`,
            address: '0x8166994d9ebbe5829ec86bd81258149b87facfd3',
            type: 'MASTER_CHEF',
        };
    }

    const mergedPoolPartial = _.merge(defaultWeightedPool, pool);

    const data = [];
    let counter = 0;
    for (const token of tokens) {
        data.push({
            id: `${pool.id}-${token.address}`,
            address: token.address,
            index: counter,
            balance: '0',
            balanceUSD: 0,
            priceRate: '1',
        });
        counter += 1;
    }

    mergedPoolPartial.tokens = {
        createMany: { data },
    };

    await prisma.prismaPool.create({
        data: mergedPoolPartial,
    });

    return prisma.prismaPool.findFirstOrThrow({
        where: { id: pool.id },
        include: {
            staking: true,
            dynamicData: true,
            tokens: true,
        },
    });
}

const defaultWeightedPoolSnapshot: Prisma.PrismaPoolSnapshotCreateInput = {
    id: '0xf3a602d30dcb723a74a0198313a7551feaca7dac00010000000000000000005f-1660089600',
    pool: {
        connect: {
            id_chain: { id: '0xf3a602d30dcb723a74a0198313a7551feaca7dac00010000000000000000005f', chain: 'FANTOM' },
        },
    },
    timestamp: 1660089600,
    fees24h: 2515,
    volume24h: 1006335,
    swapsCount: 760976,
    holdersCount: 100,
    sharePrice: 74.3,
    totalLiquidity: 7824300.8,
    totalShares: '105175.6',
    totalSharesNum: 105175.6,
    totalSwapFee: 1698548.418925,
    totalSwapVolume: 1066689432.036545,
    amounts: ['2168756.502379', '4663180.282740217636656087', '79.26189779', '1022.899752557829627982'],
};

export async function createWeightedPoolSnapshotFromDefault(
    snapshot: DeepPartial<Prisma.PrismaPoolSnapshotCreateInput> & { pool: { connect: { id: string } } },
) {
    await prisma.prismaPoolSnapshot.create({
        data: _.merge(defaultWeightedPoolSnapshot, snapshot),
    });
}

function randomNumberFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export async function createRandomSnapshotsForPoolForTimestamp(poolId: string, tokenCount: number, timestamp: number) {
    const totlaShares = randomNumberFromInterval(100000, 3000000);
    const amounts = Array.from({ length: tokenCount }, () => randomNumberFromInterval(10, 50).toString());
    await prisma.prismaPoolSnapshot.create({
        data: {
            id: `${poolId}-${timestamp}`,
            pool: {
                connect: {
                    id_chain: { id: poolId, chain: 'FANTOM' },
                },
            },
            timestamp,
            fees24h: randomNumberFromInterval(100, 5000),
            volume24h: randomNumberFromInterval(1000, 50000),
            swapsCount: randomNumberFromInterval(1000, 50000),
            holdersCount: randomNumberFromInterval(10, 500),
            sharePrice: randomNumberFromInterval(100, 500),
            totalLiquidity: randomNumberFromInterval(10000, 500000),
            totalShares: totlaShares.toString(),
            totalSharesNum: totlaShares,
            totalSwapFee: randomNumberFromInterval(10000, 500000),
            totalSwapVolume: randomNumberFromInterval(100000, 5000000),
            amounts,
        },
    });
}

export async function createRandomSnapshotsForPool(poolId: string, tokenCount: number, numSnapshots: number) {
    for (let i = 0; i < numSnapshots; i++) {
        const timestamp = moment().startOf('day').subtract(i, 'days').unix();
        const totlaShares = randomNumberFromInterval(100000, 3000000);
        const amounts = Array.from({ length: tokenCount }, () => randomNumberFromInterval(10, 50).toString());
        await prisma.prismaPoolSnapshot.create({
            data: {
                id: `${poolId}-${timestamp}`,
                pool: {
                    connect: {
                        id_chain: { id: poolId, chain: 'FANTOM' },
                    },
                },
                timestamp,
                fees24h: randomNumberFromInterval(100, 5000),
                volume24h: randomNumberFromInterval(1000, 50000),
                swapsCount: randomNumberFromInterval(1000, 50000),
                holdersCount: randomNumberFromInterval(10, 500),
                sharePrice: randomNumberFromInterval(100, 500),
                totalLiquidity: randomNumberFromInterval(10000, 500000),
                totalShares: totlaShares.toString(),
                totalSharesNum: totlaShares,
                totalSwapFee: randomNumberFromInterval(10000, 500000),
                totalSwapVolume: randomNumberFromInterval(100000, 5000000),
                amounts,
            },
        });
    }
}

const defaultUserBalanceSnapshot: Omit<Prisma.PrismaUserPoolBalanceSnapshotCreateInput, 'id'> = {
    // id: `0x001a-0x0000000000000000000000000000000000000001-${moment().unix()}`,
    timestamp: moment().unix(),
    user: {
        connect: {
            address: '0x0000000000000000000000000000000000000001',
        },
    },
    poolToken: '0x001',
    pool: { connect: { id_chain: { id: '0x001a', chain: 'FANTOM' } } },
    walletBalance: '1',
    farmBalance: '1',
    gaugeBalance: '0',
    totalBalance: '2',
    percentShare: '0.01',
    totalValueUSD: '10',
    fees24h: '1',
};

export async function createUserPoolBalanceSnapshot(
    snapshot: DeepPartial<Prisma.PrismaUserPoolBalanceSnapshotCreateInput> & {
        id: string;
        pool: { connect: { id: string } };
        user: { connect: { address: string } };
    },
) {
    await prisma.prismaUserPoolBalanceSnapshot.create({
        data: _.merge(defaultUserBalanceSnapshot, snapshot),
    });
}
