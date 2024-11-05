import { Chain, Prisma } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';
import { getPoolMetadataTags as getPoolMetadataTags } from '../../sources/github/pool-metadata-tags';
import { syncIncentivizedCategory } from '../pool/sync-incentivized-category';
import { get } from 'lodash';
import { getPoolBoostedTags } from '../../sources/github/pool-boosted-tags';
import { getPoolHookTags } from '../../sources/github/pool-hook-tags';

export const syncTags = async (): Promise<void> => {
    // Get metadata
    const metadataTags = await getPoolMetadataTags();

    const boostedTags = await getPoolBoostedTags();

    const hookTags = await getPoolHookTags();

    // Convert the transformed object to an array of PoolTags
    const tagsData = Object.entries(metadataTags).map(([id, tags]) => ({
        id,
        tags,
    }));

    // Check if the pool exists in the DB
    const existingPools = await prisma.prismaPool.findMany({
        select: {
            chain: true,
            id: true,
        },
    });

    const existingPoolIds = existingPools.map(({ id }) => id);

    const idToChain = existingPools.reduce((acc, { id, chain }) => {
        acc[id] = chain;
        return acc;
    }, {} as Record<string, Chain>);

    // Skip items that are missing in the DB
    const filteredMetadata = tagsData.filter(({ id }) => existingPoolIds.includes(id));

    const data = filteredMetadata.map(({ id, tags }) => ({
        where: {
            id_chain: {
                id,
                chain: idToChain[id],
            },
        },
        data: {
            categories: tags
                .map((tag) => tag.toUpperCase())
                .map((tag) => (tag === 'BLACKLISTED' ? 'BLACK_LISTED' : tag)),
        },
    }));

    // Insert new categories
    await prisma.$transaction([
        // Update existing categories
        ...data.map(({ where, data }) => prisma.prismaPool.update({ where, data })),
        // Remove categories from pools that are not in the metadata
        prisma.prismaPool.updateMany({
            where: {
                NOT: {
                    id: {
                        in: filteredMetadata.map(({ id }) => id),
                    },
                },
            },
            data: {
                categories: [],
            },
        }),
    ]);

    // Sync incentivized category
    await syncIncentivizedCategory();
};
