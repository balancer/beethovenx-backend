import { prisma } from '../../../prisma/prisma-client';
import { chainIdToChain } from '../../network/chain-id-to-chain';

const ERC4626TAGS_URL = 'https://raw.githubusercontent.com/balancer/metadata/refs/heads/main/erc4626/index.json';

type ERC4626Metadata = {
    id: string;
    addresses: {
        [chainId: string]: string[];
    };
};

export const getErc4626Tags = async (
    existingTags: Record<string, Set<string>>,
): Promise<Record<string, Set<string>>> => {
    const response = await fetch(ERC4626TAGS_URL);
    const erc4626MetadataList = (await response.json()) as ERC4626Metadata[];

    for (const erc4626Metadata of erc4626MetadataList) {
        for (const chainId in erc4626Metadata.addresses) {
            const addresses = erc4626Metadata.addresses[chainId];
            const poolsWithThisErc4626Token = await prisma.prismaPool.findMany({
                where: { chain: chainIdToChain[chainId], allTokens: { some: { tokenAddress: { in: addresses } } } },
            });
            for (const pool of poolsWithThisErc4626Token) {
                if (!existingTags[pool.id]) {
                    existingTags[pool.id] = new Set();
                }
                existingTags[pool.id].add(`${erc4626Metadata.id.toUpperCase()}`);
                existingTags[pool.id].add(`BOOSTED`);
            }
        }
    }

    return existingTags;
};
