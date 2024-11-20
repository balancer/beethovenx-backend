import { Abi } from 'abitype';
import FX from '../../../pool/abi/FxPool.json';
import { getViemClient, ViemClient } from '../../../sources/viem-client';
import { Chain, PrismaPoolType } from '@prisma/client';
import { update } from '../v3/type-data/update';

export const syncPoolTypeOnchainData = async (
    pools: { id: string; address: string; type: PrismaPoolType }[],
    chain: Chain,
) => {
    const viemClient = getViemClient(chain);

    // Get FX pools
    const fxPools = pools.filter((pool) => pool.type === 'FX');
    const quoteTokens = await fetchFxQuoteTokens(fxPools, viemClient);
    await update(quoteTokens);

    return true;
};

export const fetchFxQuoteTokens = async (pools: { id: string; address: string }[], viemClient: ViemClient) => {
    // Fetch the tokens from the subgraph
    const contracts = pools.map(({ address }) => {
        return {
            address: address as `0x${string}`,
            abi: FX as Abi,
            functionName: 'derivatives',
            args: [1],
        };
    });

    const results = await viemClient.multicall({ contracts, allowFailure: true });

    return results
        .map((call, index) => {
            // If the call failed, return null
            if (call.status === 'failure') return null;

            return {
                id: pools[index].id,
                typeData: { quoteToken: (call.result as string).toLowerCase() },
            };
        })
        .filter((quoteToken): quoteToken is { id: string; typeData: { quoteToken: string } } => quoteToken !== null);
};
