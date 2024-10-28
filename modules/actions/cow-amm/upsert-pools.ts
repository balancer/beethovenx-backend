import { Chain } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';
import { fetchCowAmmData } from '../../sources/contracts';
import { enrichPoolUpsertsUsd } from '../../sources/enrichers';
import { poolUpsertTransformerCowAmm } from '../../sources/transformers';
import type { CowAmmSubgraphClient } from '../../sources/subgraphs';
import type { ViemClient } from '../../sources/types';
import { applyOnchainDataUpdateCowAmm } from '../../sources/enrichers/apply-onchain-data';
import { PoolUpsertData } from '../../../prisma/prisma-types';

/**
 * Gets a list of pool ids and fetches the data from the subgraph and rpc, and then upserts into the database.
 *
 * @param ids List of pool ids to fetch and upsert
 * @param viemClient
 * @param cowAmmSubgraphClient
 * @param chain
 */
export const upsertPools = async (
    ids: string[],
    viemClient: ViemClient,
    cowAmmSubgraphClient: CowAmmSubgraphClient,
    chain: Chain,
    blockNumber: bigint,
) => {
    const sgPools = await cowAmmSubgraphClient.getAllPools({ id_in: ids });

    // Get onchain data for the pools
    const onchainData = await fetchCowAmmData(
        sgPools.map((pool) => pool.id),
        viemClient,
        blockNumber,
    );

    // Get the prices
    const prices = await prisma.prismaTokenCurrentPrice
        .findMany({
            where: {
                chain: chain,
            },
        })
        .then((prices) => Object.fromEntries(prices.map((price) => [price.tokenAddress, price.price])));

    const pools = sgPools
        .map((fragment) => poolUpsertTransformerCowAmm(fragment, chain, blockNumber))
        .map((upsert) =>
            applyOnchainDataUpdateCowAmm<PoolUpsertData>(
                upsert,
                onchainData[upsert.pool.id],
                upsert.tokens,
                chain,
                upsert.pool.id,
            ),
        )
        .map((upsert) => enrichPoolUpsertsUsd<PoolUpsertData>(upsert, prices));

    // Upserts pools to the database
    // TODO: extract to a DB helper
    for (const { pool, tokens, poolToken, poolDynamicData, poolTokenDynamicData, poolExpandedTokens } of pools) {
        try {
            await prisma.$transaction([
                prisma.prismaToken.createMany({
                    data: tokens,
                    skipDuplicates: true,
                }),

                prisma.prismaPool.upsert({
                    where: { id_chain: { id: pool.id, chain: pool.chain } },
                    create: pool,
                    update: pool,
                }),

                prisma.prismaPoolDynamicData.upsert({
                    where: { poolId_chain: { poolId: pool.id, chain: pool.chain } },
                    create: poolDynamicData,
                    update: poolDynamicData,
                }),

                // First nullify the pool tokens and then insert them again
                prisma.prismaPoolToken.deleteMany({ where: { poolId: pool.id } }),
                prisma.prismaPoolTokenDynamicData.deleteMany({ where: { poolTokenId: { startsWith: pool.id } } }),
                prisma.prismaPoolExpandedTokens.deleteMany({ where: { poolId: pool.id } }),

                prisma.prismaPoolToken.createMany({
                    data: poolToken,
                    skipDuplicates: true,
                }),

                prisma.prismaPoolTokenDynamicData.createMany({
                    data: poolTokenDynamicData,
                    skipDuplicates: true,
                }),

                prisma.prismaPoolExpandedTokens.createMany({
                    data: poolExpandedTokens,
                    skipDuplicates: true,
                }),
            ]);
        } catch (e) {
            console.error('Error upserting pool', e);
        }
    }

    return ids;
};
