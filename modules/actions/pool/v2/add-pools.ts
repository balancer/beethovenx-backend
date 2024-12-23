import { Chain, PrismaPool } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma-client';
import { nestedPoolWithSingleLayerNesting } from '../../../../prisma/prisma-types';
import { V2SubgraphClient } from '../../../subgraphs/balancer-subgraph';
import { BalancerPoolFragment } from '../../../subgraphs/balancer-subgraph/generated/balancer-subgraph-types';
import { subgraphToPrismaCreate } from '../../../pool/subgraph-mapper';
import { upsertBptBalancesV2 } from '../../user/upsert-bpt-balances-v2';
import _ from 'lodash';
import { syncPoolTypeOnchainData } from './sync-pool-type-onchain-data';

export const addPools = async (subgraphService: V2SubgraphClient, chain: Chain): Promise<string[]> => {
    const { block } = await subgraphService.legacyService.getMetadata();

    const existing = (await prisma.prismaPool.findMany({ where: { chain }, select: { id: true } })).map(
        (pool) => pool.id,
    );

    const subgraphPools = await subgraphService.legacyService.getAllPools({}, false);

    const newPools = subgraphPools
        .filter((pool) => !existing.includes(pool.id))
        .sort((a, b) => a.createTime - b.createTime);

    // Any pool can be nested
    const allNestedTypePools = [...subgraphPools.map((pool) => ({ id: pool.id, address: pool.address }))];

    const createdPools: string[] = [];
    for (const subgraphPool of newPools) {
        const dbPool = await createPoolRecord(subgraphPool, chain, block.number, allNestedTypePools);
        if (dbPool) {
            createdPools.push(subgraphPool.id);
            // When new FX pool is added, we need to get the quote token
            if (subgraphPool.poolType === 'FX') {
                await syncPoolTypeOnchainData([dbPool], chain);
            }
        }
    }

    // Add user balances for new pools
    if (newPools.length > 0) {
        await upsertBptBalancesV2(
            newPools.map((pool) => pool.id),
            subgraphService,
            chain,
        );
    }

    return createdPools;
};

const createPoolRecord = async (
    pool: BalancerPoolFragment,
    chain: Chain,
    blockNumber: number,
    nestedPools: { id: string; address: string }[],
): Promise<PrismaPool | undefined> => {
    const poolTokens = pool.tokens || [];

    await prisma.prismaToken.createMany({
        skipDuplicates: true,
        data: [
            ...poolTokens.map((token) => ({
                address: token.address,
                symbol: token.symbol,
                name: token.name,
                decimals: token.decimals,
                chain,
            })),
            {
                address: pool.address.toLowerCase(),
                symbol: pool.symbol || '',
                name: pool.name || '',
                decimals: 18,
                chain,
            },
        ],
    });

    const prismaPoolRecordWithAssociations = subgraphToPrismaCreate(pool, chain, blockNumber, nestedPools);

    try {
        const pool = await prisma.prismaPool.create(prismaPoolRecordWithAssociations);

        await createAllTokensRelationshipForPool(pool.id, chain);

        return pool;
    } catch (e) {
        console.error(`Could not create pool ${pool.id} on chain ${chain}. Skipping.`, e);
    }
};

const createAllTokensRelationshipForPool = async (poolId: string, chain: Chain): Promise<void> => {
    const pool = await prisma.prismaPool.findUnique({
        ...nestedPoolWithSingleLayerNesting,
        where: { id_chain: { id: poolId, chain } },
    });

    if (!pool) {
        return;
    }

    const allTokens = _.flattenDeep(
        pool.tokens.map((token) => [
            token,
            ...(token.nestedPool?.tokens || []).map((nestedToken) => ({
                ...nestedToken,
                nestedPoolId: token.nestedPool?.id || null,
            })),
        ]),
    );

    await prisma.prismaPoolExpandedTokens.createMany({
        skipDuplicates: true,
        data: allTokens.map((token) => ({
            poolId,
            chain,
            tokenAddress: token.address,
            nestedPoolId: token.nestedPoolId || null,
        })),
    });
};
