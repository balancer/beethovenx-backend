import { formatEther, formatUnits, parseEther } from 'viem';
import { OnchainDataCowAmm, PoolDataV3 } from '../contracts';
import { Chain } from '@prisma/client';
import { PoolDynamicUpsertData, PoolUpsertData } from '../../../prisma/prisma-types';

export const applyOnchainDataUpdateV3 = (
    data: Partial<PoolUpsertData> = {},
    onchainPoolData: PoolDataV3,
    allTokens: { address: string; decimals: number }[],
    chain: Chain,
    poolId: string,
    blockNumber: bigint,
): PoolDynamicUpsertData => {
    const decimals = Object.fromEntries(allTokens.map((token) => [token.address, token.decimals]));

    return {
        poolDynamicData: {
            ...data.poolDynamicData,
            id: poolId.toLowerCase(),
            pool: {
                connect: {
                    id_chain: {
                        id: poolId.toLowerCase(),
                        chain: chain,
                    },
                },
            },
            isPaused: onchainPoolData.isPoolPaused,
            isInRecoveryMode: onchainPoolData.isPoolInRecoveryMode,
            totalShares: formatEther(onchainPoolData.totalSupply),
            totalSharesNum: parseFloat(formatEther(onchainPoolData.totalSupply)),
            blockNumber: Number(blockNumber),
            swapFee: formatEther(onchainPoolData.swapFee ?? 0n),
            aggregateSwapFee: formatEther(onchainPoolData.aggregateSwapFee ?? 0n),
            aggregateYieldFee: formatEther(onchainPoolData.aggregateYieldFee ?? 0n),
            swapEnabled: true,
            totalLiquidity: 0,
        },
        poolToken:
            data.poolToken?.map((token) => {
                const tokenData = onchainPoolData.tokens?.find(
                    (t) => t.address.toLowerCase() === token.address.toLowerCase(),
                );
                if (!tokenData) {
                    return token;
                }
                return {
                    ...token,
                    balance: formatUnits(tokenData.balance ?? 0n, decimals[tokenData.address.toLocaleLowerCase()]),
                    priceRate: tokenData.rate ? formatEther(tokenData.rate) : '1',
                    balanceUSD: 0,
                };
            }) ||
            onchainPoolData.tokens?.map((tokenData, index) => ({
                id: `${poolId}-${tokenData.address.toLowerCase()}`,
                chain: chain,
                poolId,
                address: tokenData.address.toLowerCase(),
                index,
                balance: formatUnits(tokenData.balance, decimals[tokenData.address.toLowerCase()]),
                priceRate: formatEther(tokenData.rate),
                balanceUSD: 0,
            })),
    };
};

export const applyOnchainDataUpdateCowAmm = (
    data: Partial<PoolUpsertData> = {},
    onchainPoolData: OnchainDataCowAmm,
    allTokens: { address: string; decimals: number }[],
    chain: Chain,
    poolId: string,
    blockNumber: bigint,
): PoolDynamicUpsertData => {
    const decimals = Object.fromEntries(allTokens.map((token) => [token.address, token.decimals]));

    return {
        poolDynamicData: {
            id: poolId.toLowerCase(),
            pool: {
                connect: {
                    id_chain: {
                        id: poolId.toLowerCase(),
                        chain: chain,
                    },
                },
            },
            totalShares: formatEther(onchainPoolData.totalSupply),
            totalSharesNum: parseFloat(formatEther(onchainPoolData.totalSupply)),
            blockNumber: Number(blockNumber),
            swapFee: formatEther(onchainPoolData.swapFee),
            swapEnabled: true,
            totalLiquidity: 0,
        },
        poolToken:
            data.poolToken?.map((token) => {
                const tokenData = onchainPoolData.tokens?.find(
                    (t) => t.address.toLowerCase() === token.address.toLowerCase(),
                );

                if (!tokenData) {
                    return token;
                }

                return {
                    ...token,
                    balance: formatUnits(tokenData.balance ?? 0n, decimals[tokenData.address.toLocaleLowerCase()]),
                    priceRate: '1',
                    balanceUSD: 0,
                };
            }) ||
            onchainPoolData.tokens?.map((tokenData, index) => ({
                id: `${poolId}-${tokenData.address.toLowerCase()}`,
                chain: chain,
                poolId,
                address: tokenData.address.toLowerCase(),
                index,
                balance: formatUnits(tokenData.balance, decimals[tokenData.address.toLowerCase()]),
                priceRate: '1',
                balanceUSD: 0,
            })),
    };
};
