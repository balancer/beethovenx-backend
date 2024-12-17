import { Chain, PrismaPool } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma-client';
import { enrichPoolUpsertsUsd } from '../../../sources/enrichers/pool-upserts-usd';
import { VaultClient, getVaultClient, getPoolsClient } from '../../../sources/contracts';
import { syncDynamicTypeDataForPools } from './type-data/sync-dynamic-type-data-for-pools';
import { ViemClient } from '../../../sources/viem-client';
import { applyOnchainDataUpdateV3 } from '../../../sources/enrichers/apply-onchain-data';
import { fetchCombinedData } from '../../../sources/contracts/v3/fetch-combined-data';

const syncVaultData = async (vaultClient: VaultClient, chain: Chain, ids: string[], blockNumber: bigint) => {
    // Enrich with onchain data for all the pools
    const onchainData = await fetchCombinedData(ids, chain, vaultClient, blockNumber);

    // Needed to get the token decimals for the USD calculations,
    // Keeping it external, because we fetch these tokens in the upsert pools function
    const allTokens = await prisma.prismaToken.findMany({
        where: {
            chain: chain,
        },
    });

    // Get the data for the tables about pools
    const dbUpdates = Object.keys(onchainData).map((id) =>
        applyOnchainDataUpdateV3({}, onchainData[id], allTokens, chain, id, blockNumber),
    );

    // Get the prices
    const prices = await prisma.prismaTokenCurrentPrice
        .findMany({
            where: {
                chain: chain,
            },
        })
        .then((prices) => Object.fromEntries(prices.map((price) => [price.tokenAddress, price.price])));

    const poolsWithUSD = dbUpdates.map((upsert) =>
        enrichPoolUpsertsUsd({ poolDynamicData: upsert.poolDynamicData, poolToken: upsert.poolToken }, prices),
    );

    // Update pools data to the database
    for (const { poolDynamicData, poolToken } of poolsWithUSD) {
        try {
            await prisma.$transaction([
                prisma.prismaPoolDynamicData.update({
                    where: {
                        poolId_chain: {
                            poolId: poolDynamicData.id,
                            chain: chain,
                        },
                    },
                    data: poolDynamicData,
                }),
                ...poolToken.map((token) =>
                    prisma.prismaPoolToken.upsert({
                        where: {
                            id_chain: {
                                id: token.id,
                                chain,
                            },
                        },
                        create: token,
                        update: token,
                    }),
                ),
            ]);
        } catch (e) {
            console.error('Error upserting pool', e);
        }
    }

    return ids;
};

/**
 * Gets and syncs all the pools state with the database
 *
 * TODO: simplify the schema by merging the pool and poolDynamicData tables and the poolToken, expandedToken tables
 *
 * @param pools - The pools to sync
 * @param viemClient
 * @param vaultAddress
 * @param chain
 * @param blockNumber
 */
export const syncPools = async (
    pools: PrismaPool[],
    client: ViemClient,
    vaultAddress: string,
    chain: Chain,
    blockNumber: bigint,
) => {
    const vaultClient = getVaultClient(client, vaultAddress);
    const poolsClient = getPoolsClient(client);

    await syncVaultData(
        vaultClient,
        chain,
        pools.map(({ id }) => id),
        blockNumber,
    );
    await syncDynamicTypeDataForPools(poolsClient, pools, blockNumber);

    return pools.map(({ id }) => id);
};
