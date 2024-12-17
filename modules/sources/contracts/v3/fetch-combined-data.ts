import { VaultClient } from './vault-client';
import { fetchUnwrapRates } from './fetch-unwrap-rates';
import { Chain } from '@prisma/client';
import { PoolDataV3 } from './fetch-pool-data';

export interface OnchainDataV3 extends PoolDataV3 {
    tokens: (PoolDataV3['tokens'][number] & { unwrapRate?: number })[];
}

export const fetchCombinedData = async (
    poolIds: string[],
    chain: Chain,
    vaultClient: VaultClient,
    blockNumber: bigint,
): Promise<{ [poolId: string]: OnchainDataV3 }> => {
    const poolData = await vaultClient.fetchPoolData(poolIds, blockNumber);
    const addresses = Object.values(poolData).flatMap((pool) => pool.tokens.map((token) => token.address));
    const unwrapRates = await fetchUnwrapRates(addresses, chain);

    return Object.fromEntries(
        Object.entries(poolData).map(([poolId, poolData]) => [
            poolId,
            {
                ...poolData,
                tokens: poolData.tokens.map((token) => ({
                    ...token,
                    ...(unwrapRates[token.address] ? { unwrapRate: unwrapRates[token.address] } : {}),
                })),
            },
        ]),
    );
};
