import { Chain, PrismaPoolType } from '@prisma/client';
import { PoolType } from '../subgraphs/balancer-v3-pools/generated/types';
import { StableData } from '../../pool/subgraph-mapper';
import { fx, gyro, element, stable } from '../../pool/pool-data';
import { V3JoinedSubgraphPool } from '../subgraphs';
import { parseEther, zeroAddress } from 'viem';
import { PoolUpsertData } from '../../../prisma/prisma-types';
import { hookTransformer } from './hook-transformer';
import _ from 'lodash';

// Subgraph to DB format transformation
export const poolUpsertTransformerV3 = (
    poolData: V3JoinedSubgraphPool,
    chain: Chain,
    blockNumber: bigint,
): PoolUpsertData => {
    let type: PrismaPoolType;
    let typeData: ReturnType<typeof typeDataMapper[keyof typeof typeDataMapper]> | {} = {};

    // expand the nested tokens
    const allTokens = _.flattenDeep(
        poolData.tokens.map((token) => [
            token,
            ...(token.nestedPool?.tokens || []).map((nestedToken) => ({
                ...nestedToken,
                nestedPoolId: token.nestedPool?.id || null,
            })),
        ]),
    );

    switch (poolData.factory.type) {
        case PoolType.Weighted:
            type = PrismaPoolType.WEIGHTED;
            break;
        case PoolType.Stable:
            type = PrismaPoolType.STABLE;
            typeData = {
                amp: poolData.stableParams!.amp,
            } as StableData;
            break;
        default:
            type = PrismaPoolType.UNKNOWN;
    }
    return {
        pool: {
            id: poolData.id.toLowerCase(),
            chain: chain,
            protocolVersion: 3,
            address: poolData.id.toLowerCase(),
            decimals: 18,
            symbol: poolData.symbol,
            name: poolData.name,
            owner: zeroAddress, //TODO
            factory: poolData.factory.id.toLowerCase(),
            type: type,
            typeData: typeData,
            version: poolData.factory.version,
            createTime: Number(poolData.blockTimestamp),
            liquidityManagement: poolData.liquidityManagement,
        },
        tokens: [
            ...poolData.tokens.map((token) => ({
                address: token.address,
                decimals: token.decimals,
                symbol: token.symbol,
                name: token.name,
                chain,
            })),
            {
                address: poolData.id,
                decimals: 18,
                symbol: poolData.symbol,
                name: poolData.name,
                chain,
            },
        ],
        hook: hookTransformer(poolData, chain),
        poolDynamicData: {
            id: poolData.id,
            pool: {
                connect: {
                    id_chain: {
                        id: poolData.id,
                        chain: chain,
                    },
                },
            },
            totalShares: String(parseEther(poolData.totalShares)),
            totalSharesNum: Number(poolData.totalShares),
            blockNumber: Number(blockNumber),
            swapFee: '0', // enriched later
            swapEnabled: true,
            holdersCount: Number(poolData.holdersCount),
            totalLiquidity: 0,
            isPaused: false,
            isInRecoveryMode: false,
        },
        poolToken: poolData.tokens.map((token, i) => ({
            id: `${poolData.id}-${token.address}`.toLowerCase(),
            poolId: poolData.id.toLowerCase(),
            chain: chain,
            address: token.address.toLowerCase(),
            index: token.index,
            nestedPoolId: token.nestedPool?.id.toLowerCase() ?? null,
            priceRateProvider: poolData.rateProviders![i].address.toLowerCase(),
            exemptFromProtocolYieldFee: !token.paysYieldFees,
            scalingFactor: token.scalingFactor,
        })),
        poolTokenDynamicData: poolData.tokens.map((token) => ({
            id: `${poolData.id}-${token.address}`.toLowerCase(),
            poolTokenId: `${poolData.id}-${token.address}`.toLowerCase(),
            chain,
            blockNumber: Number(blockNumber),
            balance: token.balance,
            weight: poolData.weightedParams ? poolData.weightedParams.weights[token.index] ?? null : null,
            balanceUSD: 0, // enriched later
            priceRate: '1.0', // enriched later
        })),
        poolExpandedTokens: allTokens.map((token) => ({
            poolId: poolData.id.toLowerCase(),
            chain,
            tokenAddress: token.address,
            nestedPoolId: token.nestedPool?.id || null,
        })),
    };
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
