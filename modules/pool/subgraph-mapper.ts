import { Chain, Prisma, PrismaPoolType } from '@prisma/client';
import { BalancerPoolFragment } from '../subgraphs/balancer-subgraph/generated/balancer-subgraph-types';
import { AddressZero } from '@ethersproject/constants';
import { fx, gyro, element, stable } from './pool-data';

export const subgraphToPrismaCreate = (
    pool: BalancerPoolFragment,
    chain: Chain,
    blockNumber: number,
    nestedPools: { id: string; address: string }[],
) => {
    const dbData = subgraphMapper(pool, chain, blockNumber, nestedPools);

    const prismaPoolRecordWithAssociations = {
        data: {
            ...dbData.base,
            typeData: dbData.typeData,
            tokens: {
                createMany: {
                    data: dbData.tokens,
                },
            },
            dynamicData: {
                create: {
                    id: dbData.base.id,
                    ...dbData.dynamicData,
                },
            },
        },
    };

    return prismaPoolRecordWithAssociations;
};

export const subgraphToPrismaUpdate = (
    pool: BalancerPoolFragment,
    chain: Chain,
    blockNumber: number,
    nestedPools: { id: string; address: string }[],
) => {
    const dbData = subgraphMapper(pool, chain, blockNumber, nestedPools);
    const { id, ...baseWithoutId } = dbData.base;

    const prismaPoolRecordWithDataAssociations = {
        ...baseWithoutId,
        typeData: dbData.typeData,
        tokens: {
            update: dbData.tokens.map((token) => ({
                where: {
                    id_chain: {
                        id: token.id,
                        chain: chain,
                    },
                },
                data: {
                    ...token,
                },
            })),
        },
    };

    return prismaPoolRecordWithDataAssociations;
};

const subgraphMapper = (
    pool: BalancerPoolFragment,
    chain: Chain,
    blockNumber: number,
    nestedPools: { id: string; address: string }[],
) => {
    const type = mapSubgraphPoolTypeToPoolType(pool.poolType!);
    const version = mapPoolTypeVersion(pool.poolType!, pool.poolTypeVersion!);

    const base = {
        id: pool.id,
        chain: chain,
        createTime: pool.createTime,
        address: pool.address,
        symbol: pool.symbol || '',
        name: pool.name || '',
        decimals: 18,
        type: type,
        version: version,
        swapFeeManager: pool.owner || AddressZero,
        factory: pool.factory,
    };

    const dynamicData = {
        blockNumber,
        swapFee: pool.swapFee,
        swapEnabled: pool.swapEnabled,
        totalShares: pool.totalShares,
        totalSharesNum: parseFloat(pool.totalShares),
        totalLiquidity: Math.max(parseFloat(pool.totalLiquidity), 0),
    };

    const typeData: ReturnType<typeof typeDataMapper[keyof typeof typeDataMapper]> | {} = Object.keys(
        typeDataMapper,
    ).includes(type)
        ? typeDataMapper[type as keyof typeof typeDataMapper](pool)
        : {};

    const tokens =
        pool.tokens?.map((token) => {
            const nestedPool = nestedPools.find((nestedPool) => {
                return pool.id !== nestedPool.id && nestedPool.address === token.address;
            });

            let priceRateProvider;
            if (pool.priceRateProviders) {
                const data = pool.priceRateProviders.find((provider) => provider.token.address === token.address);
                priceRateProvider = data?.address;
            }

            return {
                id: token.id,
                address: token.address,
                priceRateProvider,
                exemptFromProtocolYieldFee: token.isExemptFromYieldProtocolFee
                    ? token.isExemptFromYieldProtocolFee
                    : false,
                nestedPoolId: nestedPool?.id,
                index: token.index || pool.tokensList.findIndex((address) => address === token.address),
            };
        }) ?? [];

    return {
        base,
        dynamicData,
        tokens,
        typeData,
    };
};

const mapSubgraphPoolTypeToPoolType = (poolType: string): PrismaPoolType => {
    switch (poolType) {
        case 'Weighted':
            return 'WEIGHTED';
        case 'LiquidityBootstrapping':
            return 'LIQUIDITY_BOOTSTRAPPING';
        case 'Stable':
            return 'STABLE';
        case 'MetaStable':
            return 'META_STABLE';
        // for the old phantom stable pool, we add it to the DB as type COMPOSABLE_STABLE with version 0
        case 'StablePhantom':
            return 'COMPOSABLE_STABLE';
        case 'ComposableStable':
            return 'COMPOSABLE_STABLE';
        case 'Element':
            return 'ELEMENT';
        case 'Investment':
            return 'INVESTMENT';
        case 'Gyro2':
            return 'GYRO';
        case 'Gyro3':
            return 'GYRO3';
        case 'GyroE':
            return 'GYROE';
        case 'FX':
            return 'FX';
    }

    return 'UNKNOWN';
};

const mapPoolTypeVersion = (poolType: string, poolTypeVersion: number): number => {
    // for the old phantom stable pool, we add it to the DB as type COMPOSABLE_STABLE with version 0
    let version = poolTypeVersion ? poolTypeVersion : 1;
    if (poolType === 'StablePhantom') {
        version = 0;
    }

    return version;
};

const typeDataMapper = {
    ELEMENT: element,
    FX: fx,
    GYRO: gyro,
    GYRO3: gyro,
    GYROE: gyro,
    STABLE: stable,
    COMPOSABLE_STABLE: stable,
    META_STABLE: stable,
};

export type FxData = ReturnType<typeof fx>;
export type GyroData = ReturnType<typeof gyro>;
export type ElementData = ReturnType<typeof element>;
export type StableData = ReturnType<typeof stable>;
