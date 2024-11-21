import { prisma } from '../../../prisma/prisma-client';
import { chainIdToChain } from '../../network/chain-id-to-chain';
import { HookData } from '../transformers';

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

    // Get hook addresses from the database
    const poolsWithHooks = await prisma.prismaPool.findMany({
        where: { hook: { not: {} } },
    });

    for (const hookMetadata of hooksMetadataList) {
        for (const chainId in hookMetadata.addresses) {
            const addresses = hookMetadata.addresses[chainId];
            for (const pool of poolsWithHooks) {
                if (pool.chain === chainIdToChain[chainId] && addresses.includes((pool.hook as HookData).address)) {
                    if (!existingTags[pool.id]) {
                        existingTags[pool.id] = new Set();
                    }
                    existingTags[pool.id].add(`${hookMetadata.id.toUpperCase()}`);
                }
            }
        }
    }

    return existingTags;
};
