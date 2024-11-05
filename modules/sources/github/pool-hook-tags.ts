import { prisma } from '../../../prisma/prisma-client';
import { chainIdToChain } from '../../network/chain-id-to-chain';

const TAGS_URL = 'https://raw.githubusercontent.com/balancer/metadata/refs/heads/main/hooks/index.json';

type HooksMetadata = {
    id: string;
    addresses: {
        [chainId: string]: string[];
    };
};

export const getPoolHookTags = async (
    existingTags: Record<string, Set<string>>,
): Promise<Record<string, Set<string>>> => {
    const response = await fetch(TAGS_URL);
    const hooksMetadataList = (await response.json()) as HooksMetadata[];

    for (const hookMetadata of hooksMetadataList) {
        for (const chainId in hookMetadata.addresses) {
            const addresses = hookMetadata.addresses[chainId];
            const poolsWithThisHook = await prisma.prismaPool.findMany({
                where: { chain: chainIdToChain[chainId], hook: { address: { in: addresses } } },
            });
            for (const pool of poolsWithThisHook) {
                if (!existingTags[pool.id]) {
                    existingTags[pool.id] = new Set();
                }
                existingTags[pool.id].add(`${hookMetadata.id.toUpperCase()}`);
            }
        }
    }

    return existingTags;
};
