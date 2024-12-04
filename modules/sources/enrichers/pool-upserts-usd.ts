import _ from 'lodash';
import { PoolDynamicUpsertData } from '../../../prisma/prisma-types';

export const enrichPoolUpsertsUsd = (
    data: PoolDynamicUpsertData,
    prices: { [address: string]: number },
): PoolDynamicUpsertData => {
    const poolToken = data.poolToken.map((token) => ({
        ...token,
        balanceUSD: parseFloat(token.balance) * prices[token.id.split('-')[1]] || 0,
    }));

    const poolTokenDynamicData = data.poolTokenDynamicData.map((token) => ({
        ...token,
        balanceUSD: parseFloat(token.balance) * prices[token.id.split('-')[1]] || 0,
    }));

    const poolDynamicData = {
        ...data.poolDynamicData,
        totalLiquidity: poolTokenDynamicData.reduce((acc, token) => acc + Number(token.balanceUSD), 0),
    };

    return {
        ...data,
        poolDynamicData,
        poolToken,
        poolTokenDynamicData,
    };
};
