import moment from 'moment-timezone';
import { prisma } from '../../prisma/prisma-client';
import { Cache } from 'memory-cache';
import { Chain, PrismaLastBlockSyncedCategory, PrismaUserBalanceType } from '@prisma/client';
import _ from 'lodash';
import { networkContext } from '../network/network-context.service';
import { AllNetworkConfigs, AllNetworkConfigsKeyedOnChain } from '../network/network-config';
import { GqlProtocolMetricsAggregated, GqlProtocolMetricsChain } from '../../schema';
import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../subgraphs/balancer-subgraph/generated/balancer-subgraph-types';
import axios from 'axios';
import { tokenService } from '../token/token.service';
import { getV2SubgraphClient } from '../subgraphs/balancer-subgraph';

interface LatestSyncedBlocks {
    userWalletSyncBlock: string;
    userStakeSyncBlock: string;
    poolSyncBlock: string;
}

export const PROTOCOL_METRICS_CACHE_KEY = `protocol:metrics`;

export class ProtocolService {
    private cache = new Cache<string, GqlProtocolMetricsChain>();

    constructor() {}

    public async getAggregatedMetrics(chains: Chain[]): Promise<GqlProtocolMetricsAggregated> {
        const chainMetrics: GqlProtocolMetricsChain[] = [];

        for (const chain of chains) {
            // this should resolve quickly if all chains are cached, possible to get slammed by an unlucky query though
            const metrics = await this.getMetrics(chain);

            chainMetrics.push(metrics);
        }

        const totalLiquidity = _.sumBy(chainMetrics, (metrics) => parseFloat(metrics.totalLiquidity));
        const totalSwapFee = _.sumBy(chainMetrics, (metrics) => parseFloat(metrics.totalSwapFee));
        const totalSwapVolume = _.sumBy(chainMetrics, (metrics) => parseFloat(metrics.totalSwapVolume));
        const poolCount = _.sumBy(chainMetrics, (metrics) => parseInt(metrics.poolCount));
        const swapVolume24h = _.sumBy(chainMetrics, (metrics) => parseFloat(metrics.swapVolume24h));
        const swapFee24h = _.sumBy(chainMetrics, (metrics) => parseFloat(metrics.swapFee24h));
        const yieldCapture24h = _.sumBy(chainMetrics, (metrics) => parseFloat(metrics.yieldCapture24h));
        const numLiquidityProviders = _.sumBy(chainMetrics, (metrics) => parseInt(metrics.numLiquidityProviders));

        return {
            totalLiquidity: `${totalLiquidity}`,
            totalSwapFee: `${totalSwapFee}`,
            totalSwapVolume: `${totalSwapVolume}`,
            poolCount: `${poolCount}`,
            swapVolume24h: `${swapVolume24h}`,
            swapFee24h: `${swapFee24h}`,
            yieldCapture24h: `${yieldCapture24h}`,
            numLiquidityProviders: `${numLiquidityProviders}`,
            chains: chainMetrics,
        };
    }

    public async getMetrics(chain: Chain): Promise<GqlProtocolMetricsChain> {
        const cached = this.cache.get(`${PROTOCOL_METRICS_CACHE_KEY}:${chain}`);

        if (cached) {
            return cached;
        }

        return this.cacheProtocolMetrics(chain);
    }

    public async cacheProtocolMetrics(chain: Chain): Promise<GqlProtocolMetricsChain> {
        const oneDayAgo = moment().subtract(24, 'hours').unix();

        const client = getV2SubgraphClient(AllNetworkConfigsKeyedOnChain[chain].data.subgraphs.balancer, chain);

        const { balancers } = await client.BalancerProtocolData({});
        const { totalSwapFee, totalSwapVolume } = balancers[0];

        const pools = await prisma.prismaPool.findMany({
            where: {
                type: {
                    in: [
                        'WEIGHTED',
                        'STABLE',
                        'COMPOSABLE_STABLE',
                        'META_STABLE',
                        'LIQUIDITY_BOOTSTRAPPING',
                        'GYRO',
                        'GYRO3',
                        'GYROE',
                        'COW_AMM',
                        'FX',
                    ],
                },
                NOT: { categories: { has: 'BLACK_LISTED' } },
                dynamicData: {
                    totalSharesNum: {
                        gt: 0.000000000001,
                    },
                },
                chain,
            },
            include: { dynamicData: true },
        });

        const poolCount = pools.length;

        const swaps = await prisma.prismaPoolEvent.findMany({
            select: { poolId: true, valueUSD: true, blockTimestamp: true },
            where: { blockTimestamp: { gte: oneDayAgo }, chain, type: 'SWAP' },
        });
        const filteredSwaps = swaps.filter((swap) => pools.find((pool) => pool.id === swap.poolId));

        const holdersQueryResponse = await prisma.prismaPoolDynamicData.aggregate({
            _sum: { holdersCount: true },
            where: { chain },
        });

        const totalLiquidity = _.sumBy(pools, (pool) => (!pool.dynamicData ? 0 : pool.dynamicData.totalLiquidity));
        const swapVolume24h = _.sumBy(filteredSwaps, (swap) => swap.valueUSD);
        const swapFee24h = _.sumBy(filteredSwaps, (swap) => {
            const pool = pools.find((pool) => pool.id === swap.poolId);

            return parseFloat(pool?.dynamicData?.swapFee || '0') * swap.valueUSD;
        });

        const yieldCapture24h = _.sumBy(pools, (pool) => (!pool.dynamicData ? 0 : pool.dynamicData.yieldCapture24h));

        const balancerV1Tvl = await this.getBalancerV1Tvl(`${AllNetworkConfigsKeyedOnChain[chain].data.chain.id}`);
        const sftmxTvl = await this.getSftmXTVL(`${AllNetworkConfigsKeyedOnChain[chain].data.chain.id}`);

        const protocolData = {
            chainId: `${AllNetworkConfigsKeyedOnChain[chain].data.chain.id}`,
            totalLiquidity: `${totalLiquidity + balancerV1Tvl + sftmxTvl}`,
            totalSwapFee,
            totalSwapVolume,
            poolCount: `${poolCount}`,
            swapVolume24h: `${swapVolume24h}`,
            swapFee24h: `${swapFee24h}`,
            yieldCapture24h: `${yieldCapture24h}`,
            numLiquidityProviders: `${holdersQueryResponse._sum.holdersCount || '0'}`,
        };

        this.cache.put(`${PROTOCOL_METRICS_CACHE_KEY}:${chain}`, protocolData, 60 * 30 * 1000);

        return protocolData;
    }

    public async getLatestSyncedBlocks(): Promise<LatestSyncedBlocks> {
        const userStakeSyncBlock = await prisma.prismaUserBalanceSyncStatus.findUnique({
            where: { type_chain: { type: PrismaUserBalanceType.STAKED, chain: networkContext.chain } },
        });

        const userWalletSyncBlock = await prisma.prismaUserBalanceSyncStatus.findUnique({
            where: { type_chain: { type: PrismaUserBalanceType.WALLET, chain: networkContext.chain } },
        });

        const poolSyncBlock = await prisma.prismaLastBlockSynced.findUnique({
            where: { category_chain: { category: PrismaLastBlockSyncedCategory.POOLS, chain: networkContext.chain } },
        });

        return {
            userWalletSyncBlock: `${userWalletSyncBlock?.blockNumber}`,
            userStakeSyncBlock: `${userStakeSyncBlock?.blockNumber}`,
            poolSyncBlock: `${poolSyncBlock?.blockNumber}`,
        };
    }

    private async getSftmXTVL(chainId: string): Promise<number> {
        if (chainId !== '250') {
            return 0;
        }

        const tokenprices = await tokenService.getTokenPrices(AllNetworkConfigs[chainId].data.chain.prismaId);
        const ftmPrice = tokenService.getPriceForToken(
            tokenprices,
            AllNetworkConfigs[chainId].data.weth.address,
            AllNetworkConfigs[chainId].data.chain.prismaId,
        );

        if (AllNetworkConfigs[chainId].data.sftmx) {
            const stakingData = await prisma.prismaSftmxStakingData.findUniqueOrThrow({
                where: { id: AllNetworkConfigs[chainId].data.sftmx!.stakingContractAddress },
            });
            return parseFloat(stakingData.totalFtm) * ftmPrice;
        }
        return 0;
    }

    private async getBalancerV1Tvl(chainId: string): Promise<number> {
        if (chainId !== '1') {
            return 0;
        }

        const { data } = await axios.get<number>('https://api.llama.fi/tvl/balancer-v1');

        return data;
    }
}

export const protocolService = new ProtocolService();
