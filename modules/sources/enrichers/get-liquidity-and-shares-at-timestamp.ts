import { BlockNumbersSubgraphClient, V3VaultSubgraphClient } from '../subgraphs';
import { V2SubgraphClient } from '../../subgraphs/balancer-subgraph';
import { prisma } from '../../../prisma/prisma-client';
import { daysAgo, roundToHour, roundToMidnight } from '../../common/time';
import { DAYS_OF_HOURLY_PRICES } from '../../../config';

export const getLiquidityAndSharesAtTimestamp = async (
    ids: string[],
    vaultClient: V2SubgraphClient | V3VaultSubgraphClient,
    blockNumbersClient: BlockNumbersSubgraphClient,
    timestamp = daysAgo(1), // 24 hours ago
) => {
    const blockNumber = await blockNumbersClient.fetchBlockByTime(timestamp);

    //  If ids count is >= 1000 just get all
    const where = ids.length >= 1000 ? {} : { id_in: ids };
    const allBalances = await vaultClient.getAllPoolBalances({
        where,
        block: { number: Number(blockNumber) },
    });

    // Guard against empty pools, for example when the pools weren't created yet
    if (!allBalances.length) {
        return null;
    }

    // Filter out balances for pool which aren't in the ids list
    const balances = allBalances.filter(({ id }) => ids.includes(id));

    const tokenAddresses = balances
        .map(({ tokens }) => tokens?.map(({ address }) => address))
        .flat()
        .filter((address): address is string => !!address);

    // Guard against empty tokenAddresses
    if (!tokenAddresses.length) {
        return null;
    }

    const roundedTimestamp =
        timestamp > daysAgo(DAYS_OF_HOURLY_PRICES) ? roundToHour(timestamp) : roundToMidnight(timestamp);

    const prices = await prisma.prismaTokenPrice.findMany({
        where: {
            tokenAddress: {
                in: tokenAddresses,
            },
            timestamp: roundedTimestamp,
            chain: vaultClient.chain,
        },
    });

    const tvls = balances.map(({ id, address, totalShares, tokens }) => {
        const tvl = tokens
            ?.filter((token) => token.address !== address) // Filter out the pool token
            .reduce((acc, token) => {
                const price = prices.find((p) => p.tokenAddress === token.address);
                if (!price) return acc;

                return acc + parseFloat(token.balance) * price.price * parseFloat(token.priceRate);
            }, 0);

        return [id, { tvl, totalShares }] as const;
    });

    return Object.fromEntries(tvls);
};
