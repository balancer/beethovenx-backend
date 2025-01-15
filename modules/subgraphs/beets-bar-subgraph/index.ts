import { BeetsBarSubgraphService } from './beets-bar.service';
import { Chain } from '@prisma/client';

export type BeetsBarSubgraphClient = ReturnType<typeof getBeetsBarSubgraphClient>;

export function getBeetsBarSubgraphClient(url: string, chain: Chain) {
    const beetsBarService = new BeetsBarSubgraphService(url, chain);

    return {
        getMetadata: beetsBarService.getMetadata.bind(beetsBarService),
        // Getting all balances from the BeetsBar
        async getAllPoolSharesWithBalance(poolIds: string[], excludedAddresses: string[], startBlock?: number) {
            // Haking the poolIds to pass the poolId and fbeets address
            const [poolId, tokenAddress] = poolIds;
            const fbeetsHolders = await beetsBarService.getAllUsers({
                where: {
                    address_not_in: excludedAddresses,
                    _change_block: startBlock && startBlock > 0 ? { number_gte: startBlock } : undefined,
                },
            }); // where: { fBeets_not: '0' } - fetching all instead, because we need to delete them from the DB

            return fbeetsHolders.map(({ address: userAddress, fBeets: balance }) => ({
                id: `fbeets-${userAddress}`,
                chain,
                userAddress,
                tokenAddress,
                balance,
                balanceNum: parseFloat(balance),
                poolId,
            }));
        },
    };
}
