import { formatUnits } from 'viem';
import { OnchainDataCowAmm } from '../contracts';
import { Chain } from '@prisma/client';
import { PoolDynamicUpsertData, PoolUpsertData } from '../../../prisma/prisma-types';

export const applyOnchainDataUpdateV3 = <T extends PoolDynamicUpsertData>(
    data: Partial<PoolUpsertData> = {},
    onchainPoolData: PoolDynamicUpsertData,
    allTokens: { address: string; decimals: number }[],
    chain: Chain,
): T => {
    const decimals = Object.fromEntries(allTokens.map((token) => [token.address, token.decimals]));
    return {
        ...data,
        poolDynamicData: {
            ...(data.poolDynamicData ?? { chain }), // Adding a chain as a default, in unexpected cases where dynamic data doesn't exist yet
            ...onchainPoolData.poolDynamicData,
        },
        poolToken: (data.poolToken || onchainPoolData.poolToken)?.map((token) => {
            const onchainTokenData = onchainPoolData.poolToken?.find((t) => token.id === t.id);
            if (!onchainTokenData) return token;
            return {
                ...token,
                ...onchainTokenData,
            };
        }),
        poolTokenDynamicData: (data.poolTokenDynamicData || onchainPoolData.poolTokenDynamicData)?.map((token) => {
            const onchainTokenData = onchainPoolData.poolTokenDynamicData?.find((t) => token.id === t.id);
            if (!onchainTokenData) return token;
            return {
                ...token,
                ...onchainTokenData,
                chain,
                balance: formatUnits(BigInt(onchainTokenData.balance), decimals[onchainTokenData.id.split('-')[1]]),
                balanceUSD: 0,
            };
        }),
    } as T;
};

export const applyOnchainDataUpdateCowAmm = <T extends PoolDynamicUpsertData>(
    data: Partial<PoolUpsertData> = {},
    onchainPoolData: OnchainDataCowAmm,
    allTokens: { address: string; decimals: number }[],
    chain: Chain,
    poolId: string,
): T => {
    const decimals = Object.fromEntries(allTokens.map((token) => [token.address, token.decimals]));

    return {
        ...data,
        poolDynamicData: {
            ...data.poolDynamicData,
            ...onchainPoolData.poolDynamicData,
            id: poolId.toLowerCase(),
            pool: {
                connect: {
                    id_chain: {
                        id: poolId.toLowerCase(),
                        chain: chain,
                    },
                },
            },
            swapEnabled: true,
            totalLiquidity: 0,
        },
        poolTokenDynamicData: (data.poolTokenDynamicData || onchainPoolData.poolTokenDynamicData)?.map((token) => {
            const onchainTokenData = onchainPoolData.poolTokenDynamicData?.find((t) => token.id === t.id);
            if (!onchainTokenData) return token;
            return {
                ...token,
                ...onchainTokenData,
                balance: formatUnits(onchainTokenData.balance, decimals[onchainTokenData.id.split('-')[1]]),
                priceRate: '1',
                balanceUSD: 0,
            };
        }),
    } as T;
};
