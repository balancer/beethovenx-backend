import { Chain } from '@prisma/client';
import { prisma } from '../../../prisma/prisma-client';
import { ViemClient } from '../../sources/viem-client';
import { fetchErc4626AndUnderlyingTokenData } from '../../sources/contracts/fetch-erc4626-token-data';

/**
 * Syncs erc4626 tokens and their underlying tokens
 * Only needed to update this info on already created tokens
 */
export const syncErc4626Tokens = async (viemClient: ViemClient, chain: Chain) => {
    const allTokens = await prisma.prismaToken.findMany({
        where: {
            chain,
        },
    });

    const erc4626AndUnderlying = await fetchErc4626AndUnderlyingTokenData(allTokens, viemClient);

    for (const token of erc4626AndUnderlying) {
        await prisma.prismaToken.upsert({
            where: {
                address_chain: {
                    address: token.address,
                    chain: chain,
                },
            },
            create: {
                ...token,
                chain,
            },
            update: {
                ...token,
            },
        });

        if (token.underlyingTokenAddress) {
            await prisma.prismaTokenType.upsert({
                where: {
                    id_chain: {
                        id: `${token.address}-erc4626`,
                        chain,
                    },
                },
                create: {
                    id: `${token.address}-erc4626`,
                    chain,
                    tokenAddress: token.address,
                    type: 'ERC4626',
                },
                update: {
                    id: `${token.address}-erc4626`,
                    chain,
                    tokenAddress: token.address,
                    type: 'ERC4626',
                },
            });
        }
    }
};
