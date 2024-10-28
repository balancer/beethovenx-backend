import { Chain } from '@prisma/client';
import { PoolUpsertData } from '../../../prisma/prisma-types';
import { CowAmmPoolFragment } from '../subgraphs/cow-amm/generated/types';
import { parseEther, zeroAddress } from 'viem';

// Subgraph to DB format transformation
export const poolUpsertTransformerCowAmm = (
    poolFragment: CowAmmPoolFragment,
    chain: Chain,
    blockNumber: bigint,
): PoolUpsertData => ({
    pool: {
        id: poolFragment.id.toLowerCase(),
        chain: chain,
        protocolVersion: 1,
        address: poolFragment.id.toLowerCase(),
        decimals: 18,
        symbol: poolFragment.symbol,
        name: poolFragment.name,
        owner: zeroAddress, //TODO
        factory: poolFragment.factory.id.toLowerCase(),
        type: 'COW_AMM',
        typeData: {},
        version: 1,
        createTime: Number(poolFragment.blockTimestamp),
        liquidityManagement: {},
    },
    tokens: [
        ...poolFragment.tokens.map((token) => ({
            address: token.address,
            decimals: token.decimals,
            symbol: token.symbol,
            name: token.name,
            chain,
        })),
        {
            address: poolFragment.id.toLowerCase(),
            decimals: 18,
            symbol: poolFragment.symbol,
            name: poolFragment.name,
            chain,
        },
    ],
    hook: undefined,
    poolDynamicData: {
        id: poolFragment.id,
        pool: {
            connect: {
                id_chain: {
                    id: poolFragment.id,
                    chain: chain,
                },
            },
        },
        totalShares: String(parseEther(poolFragment.totalShares)),
        totalSharesNum: Number(poolFragment.totalShares),
        blockNumber: Number(blockNumber),
        swapFee: poolFragment.swapFee,
        swapEnabled: true,
        holdersCount: Number(poolFragment.holdersCount),
        totalLiquidity: 0,
        isPaused: false,
        isInRecoveryMode: false,
    },
    poolToken: poolFragment.tokens.map((token, i) => ({
        id: `${poolFragment.id}-${token.address}`.toLowerCase(),
        poolId: poolFragment.id.toLowerCase(),
        chain: chain,
        address: token.address.toLowerCase(),
        index: token.index,
        nestedPoolId: null,
        priceRateProvider: undefined,
        exemptFromProtocolYieldFee: false,
    })),
    poolTokenDynamicData: poolFragment.tokens.map((token) => ({
        id: `${poolFragment.id}-${token.address}`.toLowerCase(),
        poolTokenId: `${poolFragment.id}-${token.address}`.toLowerCase(),
        chain,
        blockNumber: Number(blockNumber),
        balance: token.balance,
        weight: token.weight,
        balanceUSD: 0,
        priceRate: '1.0',
    })),
    poolExpandedTokens: poolFragment.tokens.map(({ address }) => ({
        tokenAddress: address,
        poolId: poolFragment.id,
        chain: chain,
        nestedPoolId: undefined,
    })),
});
