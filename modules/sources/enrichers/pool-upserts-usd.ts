import { PoolDynamicUpsertData } from '../../../prisma/prisma-types';

export const enrichPoolUpsertsUsd = <T extends PoolDynamicUpsertData>(
    data: T,
    prices: { [address: string]: number },
): T => {
    const poolTokenDynamicData =
        data.poolTokenDynamicData?.map((token) => ({
            ...token,
            balanceUSD: parseFloat(token.balance) * prices[token.id.split('-')[1]] || 0,
        })) ?? [];

    const poolDynamicData = {
        ...data.poolDynamicData,
        totalLiquidity: poolTokenDynamicData.reduce((acc, token) => acc + Number(token.balanceUSD), 0),
    };

    return {
        ...data,
        poolDynamicData,
        poolTokenDynamicData,
    };
};
