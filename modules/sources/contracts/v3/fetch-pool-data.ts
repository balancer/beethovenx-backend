import { AbiParameterToPrimitiveType, ExtractAbiFunction } from 'abitype';
import { ViemClient } from '../../types';
import VaultV3Abi from '../abis/VaultV3';
import { formatEther } from 'viem';
import type { PoolDynamicUpsertData } from '../../../../prisma/prisma-types';

// TODO: Find out if we need to do that,
// or can somehow get the correct type infered automatically from the viem's result set?
type PoolConfig = AbiParameterToPrimitiveType<ExtractAbiFunction<typeof VaultV3Abi, 'getPoolConfig'>['outputs'][0]>;
type PoolTokenInfo = [
    AbiParameterToPrimitiveType<ExtractAbiFunction<typeof VaultV3Abi, 'getPoolTokenInfo'>['outputs'][0]>, // token address array
    AbiParameterToPrimitiveType<ExtractAbiFunction<typeof VaultV3Abi, 'getPoolTokenInfo'>['outputs'][1]>, // tokenInfo (rateprovider etc)
    AbiParameterToPrimitiveType<ExtractAbiFunction<typeof VaultV3Abi, 'getPoolTokenInfo'>['outputs'][2]>, // balancesRaw
    AbiParameterToPrimitiveType<ExtractAbiFunction<typeof VaultV3Abi, 'getPoolTokenInfo'>['outputs'][3]>, // lastLiveBalances
];
type PoolTokenRates = [
    AbiParameterToPrimitiveType<ExtractAbiFunction<typeof VaultV3Abi, 'getPoolTokenRates'>['outputs'][0]>, // decimalScalingFactors
    AbiParameterToPrimitiveType<ExtractAbiFunction<typeof VaultV3Abi, 'getPoolTokenRates'>['outputs'][1]>, // tokenRates
];

export async function fetchPoolData(
    vault: string,
    pools: string[],
    client: ViemClient,
    blockNumber?: bigint,
): Promise<{ [address: string]: PoolDynamicUpsertData }> {
    const contracts = pools
        .map((pool) => [
            {
                address: vault as `0x${string}`,
                abi: VaultV3Abi,
                functionName: 'totalSupply',
                args: [pool as `0x${string}`],
            },
            {
                address: vault as `0x${string}`,
                abi: VaultV3Abi,
                functionName: 'getPoolConfig',
                args: [pool as `0x${string}`],
            },
            {
                address: vault as `0x${string}`,
                abi: VaultV3Abi,
                functionName: 'getPoolTokenInfo',
                args: [pool as `0x${string}`],
            },
            {
                address: vault as `0x${string}`,
                abi: VaultV3Abi,
                functionName: 'getPoolTokenRates',
                args: [pool as `0x${string}`],
            },
        ])
        .flat();

    // @ts-ignore – viem has some issues with the typings when using imported abis
    const results = await client.multicall({ contracts, blockNumber });

    // Parse the results
    const parsedResults = pools.map((pool, i) => {
        const pointer = i * 4;
        const config =
            results[pointer + 1].status === 'success'
                ? (results[pointer + 1].result as unknown as PoolConfig)
                : undefined;
        const poolTokenInfo =
            results[pointer + 2].status === 'success'
                ? (results[pointer + 2].result as unknown as PoolTokenInfo)
                : undefined;
        const poolTokenRates =
            results[pointer + 3].status === 'success'
                ? (results[pointer + 3].result as unknown as PoolTokenRates)
                : undefined;
        const totalShares = formatEther(
            results[pointer].status === 'success' ? (results[pointer].result as bigint) : 0n,
        );

        return [
            pool.toLowerCase(),
            {
                poolDynamicData: {
                    id: pool.toLowerCase(),
                    totalShares,
                    totalSharesNum: parseFloat(totalShares),
                    swapFee: formatEther(config?.staticSwapFeePercentage ?? 0n),
                    aggregateSwapFee: formatEther(config?.aggregateSwapFeePercentage ?? 0n),
                    aggregateYieldFee: formatEther(config?.aggregateYieldFeePercentage ?? 0n),
                    isPaused: config?.isPoolPaused,
                    isInRecoveryMode: config?.isPoolInRecoveryMode,
                    ...(blockNumber ? { blockNumber: Number(blockNumber) } : {}),
                },
                poolToken: poolTokenInfo?.[0].map((token: string, i: number) => ({
                    id: `${pool}-${token}`.toLowerCase(),
                    address: token.toLowerCase(),
                    exemptFromProtocolYieldFee: !!poolTokenInfo[1][i].paysYieldFees,
                    priceRateProvider: poolTokenInfo[1][i].rateProvider,
                    scalingFactor: String(poolTokenRates ? poolTokenRates[0][i] : 1000000000000000000n),
                })),
                poolTokenDynamicData:
                    poolTokenInfo?.[0].map((token: string, i: number) => ({
                        id: `${pool}-${token}`.toLowerCase(),
                        // Would be great to fetch the decimals onchain as well, so we don't have to rely on the token data
                        balance: String(poolTokenInfo[2][i]),
                        priceRate: formatEther(poolTokenRates ? poolTokenRates[1][i] : 1000000000000000000n),
                        ...(blockNumber ? { blockNumber: Number(blockNumber) } : {}),
                    })) ?? [],
            },
        ];
    });

    return Object.fromEntries(parsedResults);
}
