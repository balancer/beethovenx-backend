const TAGS_URL = 'https://raw.githubusercontent.com/balancer/metadata/refs/heads/main/pools/tags/index.json';

type TagItem = {
    id: string;
    pools: string[];
};

export const getPoolMetadataTags = async (
    existingTags: Record<string, Set<string>>,
): Promise<Record<string, Set<string>>> => {
    const response = await fetch(TAGS_URL);
    const tagsList = (await response.json()) as TagItem[];

    for (const tag of tagsList) {
        if (tag.pools) {
            tag.pools.forEach((poolId) => {
                if (!existingTags[poolId]) {
                    existingTags[poolId] = new Set();
                }
                existingTags[poolId].add(tag.id.toUpperCase());
            });
        }
    }

    return existingTags;
};
