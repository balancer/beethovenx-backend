import { Abi } from 'abitype';
import FX from '../../../pool/abi/FxPool.json';
import { getViemClient, ViemClient } from '../../../sources/viem-client';
import { Chain, PrismaPoolType } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma-client';
import { prismaBulkExecuteOperations } from '../../../../prisma/prisma-util';

const update = async (data: { id: string; chain: Chain; typeData: any }[]) => {
    // Update the pool type data
    const updates = data.map(({ id, chain, typeData }) =>
        prisma.prismaPool.update({
            where: { id_chain: { id, chain } },
            data: { typeData },
        }),
    );

    await prismaBulkExecuteOperations(updates, false);
};

export const syncPoolTypeOnchainData = async (
    pools: { id: string; chain: Chain; address: string; type: PrismaPoolType; typeData: any }[],
    chain: Chain,
) => {
    const viemClient = getViemClient(chain);

    // Get FX pools
    const fxPools = pools.filter((pool) => pool.type === 'FX');
    const quoteTokens = await fetchFxQuoteTokens(fxPools, viemClient);
    await update(quoteTokens);

    return true;
};

export const fetchFxQuoteTokens = async (
    pools: { id: string; chain: Chain; address: string; typeData: any }[],
    viemClient: ViemClient,
) => {
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

            const typeData = { ...pools[index].typeData, quoteToken: (call.result as string).toLowerCase() };

            return {
                id: pools[index].id,
                chain: pools[index].chain,
                typeData,
            };
        })
        .filter((quoteToken): quoteToken is { id: string; chain: Chain; typeData: any } => quoteToken !== null);
};
