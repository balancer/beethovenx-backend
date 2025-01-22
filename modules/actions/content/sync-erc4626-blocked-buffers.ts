import { prisma } from '../../../prisma/prisma-client';
import { chainIdToChain } from '../../network/chain-id-to-chain';
import { getBlockedBuffers } from '../../sources/github/pool-erc4626-buffer-blocklist';

export const syncBlockedBuffers = async (): Promise<void> => {
    const blockedBuffers = await getBlockedBuffers();

    for (const chainId in blockedBuffers) {
        const blockedBuffersForErc4626Addresses = blockedBuffers[chainId].map((address) => address.toLowerCase());
        const chain = chainIdToChain[chainId];
        await prisma.$transaction([
            prisma.prismaToken.updateMany({
                where: {
                    chain: chain,
                },
                data: { isBufferAllowed: true },
            }),
            prisma.prismaToken.updateMany({
                where: {
                    chain: chain,
                    address: { in: blockedBuffersForErc4626Addresses },
                },
                data: { isBufferAllowed: false },
            }),
        ]);
    }
};
