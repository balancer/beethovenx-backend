import { Chain, PrismaPoolType, PrismaTokenCurrentPrice } from '@prisma/client';
import { isSameAddress } from '@balancer-labs/sdk';
import { prisma } from '../../../prisma/prisma-client';
import { isStablePool } from './pool-utils';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import { fetchOnChainPoolState } from './pool-onchain-state';
import { fetchOnChainPoolData } from './pool-onchain-data';
import { fetchOnChainGyroFees } from './pool-onchain-gyro-fee';
import { StableData } from '../subgraph-mapper';
import { fetchTokenPairData } from './pool-on-chain-tokenpair-data';

export const SUPPORTED_POOL_TYPES: PrismaPoolType[] = [
    'WEIGHTED',
    'STABLE',
    'META_STABLE',
    'PHANTOM_STABLE',
    'COMPOSABLE_STABLE',
    'LIQUIDITY_BOOTSTRAPPING',
    'ELEMENT',
    'GYRO',
    'GYRO3',
    'GYROE',
    'FX',
];

export interface PoolOnChainDataServiceOptions {
    vaultAddress: string;
    balancerQueriesAddress: string;
    yieldProtocolFeePercentage: string;
    swapProtocolFeePercentage: string;
    gyroConfig?: string;
}

export class PoolOnChainDataService {
    constructor(private optionsResolver: () => PoolOnChainDataServiceOptions) {}

    private get options() {
        return this.optionsResolver();
    }

    public async updateOnChainStatus(poolIds: string[], chain: Chain): Promise<void> {
        if (poolIds.length === 0) return;

        const filteredPools = await prisma.prismaPool.findMany({
            where: {
                id: { in: poolIds },
                chain,
                type: { in: SUPPORTED_POOL_TYPES },
            },
            include: {
                dynamicData: true,
            },
        });

        const state = await fetchOnChainPoolState(filteredPools, ['ZKEVM', 'FANTOM'].includes(chain) ? 8192 : 32768);

        const operations = [];
        for (const pool of filteredPools) {
            if (!state[pool.id]) continue; // Some pool types are filtered out in the state fetching function

            const { isPaused, isInRecoveryMode } = state[pool.id];
            const data = pool.dynamicData;
            if (data && (data.isPaused !== isPaused || data.isInRecoveryMode !== isInRecoveryMode)) {
                operations.push(
                    prisma.prismaPoolDynamicData.update({
                        where: { id_chain: { id: pool.id, chain: pool.chain } },
                        data: {
                            isPaused,
                            isInRecoveryMode,
                        },
                    }),
                );
            }
        }
        prismaBulkExecuteOperations(operations, false);
    }

    public async updateOnChainData(
        poolIds: string[],
        chain: Chain,
        blockNumber: number,
        tokenPrices: PrismaTokenCurrentPrice[],
    ): Promise<void> {
        if (poolIds.length === 0) {
            return;
        }

        const filteredPools = await prisma.prismaPool.findMany({
            where: {
                id: { in: poolIds },
                chain,
                type: { in: SUPPORTED_POOL_TYPES },
            },
            include: {
                tokens: { orderBy: { index: 'asc' }, include: { dynamicData: true, token: true } },
                dynamicData: true,
            },
        });

        const gyroPools = filteredPools.filter((pool) => pool.type.includes('GYRO'));

        const onchainResults = await fetchOnChainPoolData(
            filteredPools,
            this.options.vaultAddress,
            ['ZKEVM', 'FANTOM'].includes(chain) ? 8192 : 32768,
        );
        const tokenPairData = await fetchTokenPairData(
            filteredPools,
            this.options.balancerQueriesAddress,
            ['ZKEVM', 'FANTOM'].includes(chain) ? 8192 : 32768,
        );
        const gyroFees = await (this.options.gyroConfig
            ? fetchOnChainGyroFees(
                  gyroPools,
                  this.options.gyroConfig,
                  ['ZKEVM', 'FANTOM'].includes(chain) ? 8192 : 32768,
              )
            : Promise.resolve({} as { [address: string]: string }));

        const operations = [];
        for (const pool of filteredPools) {
            const onchainData = onchainResults[pool.id];
            const { tokenPairs } = tokenPairData[pool.id];
            const { amp, poolTokens } = onchainData;

            try {
                const { swapFee, totalShares } = onchainData;
                const swapEnabled =
                    typeof onchainData.swapEnabled !== 'undefined'
                        ? onchainData.swapEnabled
                        : pool.dynamicData?.swapEnabled;

                const yieldProtocolFeePercentage =
                    gyroFees[pool.id] ||
                    onchainData.protocolYieldFeePercentageCache ||
                    String(this.options.yieldProtocolFeePercentage);

                const swapProtocolFeePercentage =
                    gyroFees[pool.id] ||
                    onchainData.protocolSwapFeePercentageCache ||
                    String(this.options.swapProtocolFeePercentage);

                if (
                    pool.dynamicData &&
                    (pool.dynamicData.swapFee !== swapFee ||
                        pool.dynamicData.totalShares !== totalShares ||
                        pool.dynamicData.swapEnabled !== swapEnabled ||
                        pool.dynamicData.protocolYieldFee !== yieldProtocolFeePercentage ||
                        pool.dynamicData.protocolSwapFee !== swapProtocolFeePercentage)
                ) {
                    operations.push(
                        prisma.prismaPoolDynamicData.update({
                            where: { id_chain: { id: pool.id, chain: pool.chain } },
                            data: {
                                swapFee,
                                totalShares,
                                totalSharesNum: parseFloat(totalShares),
                                swapEnabled: typeof swapEnabled !== 'undefined' ? swapEnabled : true,
                                protocolYieldFee: yieldProtocolFeePercentage,
                                protocolSwapFee: swapProtocolFeePercentage,
                                blockNumber,
                            },
                        }),
                    );
                }

                // always update tokenPair data
                if (pool.dynamicData) {
                    operations.push(
                        prisma.prismaPoolDynamicData.update({
                            where: { id_chain: { id: pool.id, chain: pool.chain } },
                            data: {
                                tokenPairsData: tokenPairs,
                            },
                        }),
                    );
                }

                let bptPriceRate = '1.0';
                for (let i = 0; i < poolTokens.tokens.length; i++) {
                    const tokenAddress = poolTokens.tokens[i];
                    const poolToken = pool.tokens.find((token) => isSameAddress(token.address, tokenAddress));

                    if (!poolToken) {
                        throw `Pool Missing Expected Token: ${pool.id} ${tokenAddress}`;
                    }

                    if (poolToken.index !== i) {
                        throw `Pooltoken index mismatch! "poolToken.index": ${poolToken.index} vs "i": ${i} on pool ${pool.id}`;
                    }

                    const balance = poolTokens.balances[i];
                    const weight = onchainData.weights ? onchainData.weights[i] : null;

                    // set token price rate for various rate types

                    // top level token rates, e.g. LSTs in pools
                    let priceRate = poolTokens.rates[i] ?? '1.0';

                    // bpt price rate
                    if (onchainData.rate && isSameAddress(poolToken.address, pool.address)) {
                        priceRate = onchainData.rate;
                        bptPriceRate = priceRate;
                    }

                    if (
                        !poolToken.dynamicData ||
                        poolToken.dynamicData.balance !== balance ||
                        poolToken.dynamicData.priceRate !== priceRate ||
                        poolToken.dynamicData.weight !== weight
                    ) {
                        operations.push(
                            prisma.prismaPoolTokenDynamicData.upsert({
                                where: { id_chain: { id: poolToken.id, chain: poolToken.chain } },
                                create: {
                                    id: poolToken.id,
                                    chain: poolToken.chain,
                                    poolTokenId: poolToken.id,
                                    blockNumber,
                                    priceRate,
                                    weight,
                                    balance,
                                    balanceUSD:
                                        poolToken.address === pool.address
                                            ? 0
                                            : (tokenPrices.find(
                                                  (tokenPrice) =>
                                                      tokenPrice.tokenAddress.toLowerCase() ===
                                                          poolToken.address.toLowerCase() &&
                                                      tokenPrice.chain === poolToken.chain,
                                              )?.price || 0) * parseFloat(balance),
                                },
                                update: {
                                    blockNumber,
                                    priceRate,
                                    weight,
                                    balance,
                                    balanceUSD:
                                        poolToken.address === pool.address
                                            ? 0
                                            : (tokenPrices.find(
                                                  (tokenPrice) =>
                                                      tokenPrice.tokenAddress.toLowerCase() ===
                                                          poolToken.address.toLowerCase() &&
                                                      tokenPrice.chain === poolToken.chain,
                                              )?.price || 0) * parseFloat(balance),
                                },
                            }),
                        );
                    }
                }

                if (isStablePool(pool.type)) {
                    if (!amp) {
                        console.error(`Stable Pool Missing Amp: ${pool.id}`);
                        continue;
                    }

                    //only update if amp has changed
                    if ((pool.typeData as StableData).amp !== amp) {
                        operations.push(
                            prisma.prismaPool.update({
                                where: { id_chain: { id: pool.id, chain: pool.chain } },
                                data: {
                                    typeData: {
                                        ...(pool.typeData as StableData),
                                        amp,
                                        bptPriceRate,
                                    },
                                },
                            }),
                        );
                    }
                }
            } catch (e) {
                console.log('error syncing on chain data', e);
            }
        }

        await prismaBulkExecuteOperations(operations, false);
    }
}
