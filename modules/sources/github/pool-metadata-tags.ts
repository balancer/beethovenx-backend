const TAGS_URL = 'https://raw.githubusercontent.com/balancer/metadata/refs/heads/main/pools/tags/index.json';

type TagItem = {
    id: string;
    name: string;
    pools: string[];
};

export const getPoolMetadataTags = async (): Promise<{ [poolId: string]: string[] }> => {
    const response = await fetch(TAGS_URL);
    const tagsList = (await response.json()) as TagItem[];

    // Transform the metadata to the desired format
    const transformed: Record<string, string[]> = {};

    for (const tag of tagsList) {
        tag.pools.forEach((poolId) => {
            if (!transformed[poolId]) {
                transformed[poolId] = [];
            }
            transformed[poolId].push(tag.id.toUpperCase());
        });
    }

    return transformed;
};
