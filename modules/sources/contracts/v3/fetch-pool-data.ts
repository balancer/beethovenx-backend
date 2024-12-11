import { AbiParameterToPrimitiveType, ExtractAbiFunction } from 'abitype';
import { ViemClient } from '../../types';
import VaultV3Abi from '../abis/VaultV3';

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
export interface OnchainDataV3 {
    totalSupply: bigint;
    swapFee: bigint;
    aggregateSwapFee?: bigint;
    aggregateYieldFee?: bigint;
    // amp?: [bigint, boolean, bigint];
    isPoolPaused: boolean;
    isPoolInRecoveryMode: boolean;
    tokens: {
        address: string;
        balance: bigint;
        rateProvider: string;
        rate: bigint;
        isErc4626: boolean;
        scalingFactor: bigint;
    }[];
}

export async function fetchPoolData(
    vault: string,
    pools: string[],
    client: ViemClient,
    blockNumber?: bigint,
): Promise<{ [address: string]: OnchainDataV3 }> {
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

        return [
            pool.toLowerCase(),
            {
                totalSupply: results[pointer].status === 'success' ? (results[pointer].result as bigint) : undefined,
                swapFee: config?.staticSwapFeePercentage,
                aggregateSwapFee: config?.aggregateSwapFeePercentage,
                aggregateYieldFee: config?.aggregateYieldFeePercentage,
                isPoolPaused: config?.isPoolPaused,
                isPoolInRecoveryMode: config?.isPoolInRecoveryMode,
                tokens: poolTokenInfo?.[0].map((token: string, i: number) => ({
                    address: token.toLowerCase(),
                    balance: poolTokenInfo[2][i],
                    paysYieldFees: poolTokenInfo[1][i].paysYieldFees,
                    rateProvider: poolTokenInfo[1][i].rateProvider,
                    rate: poolTokenRates ? poolTokenRates[1][i] : 1000000000000000000n,
                    isErc4626: false, // will be added later in the process
                    scalingFactor: poolTokenRates ? poolTokenRates[0][i] : 1000000000000000000n,
                })),
            },
        ];
    });

    return Object.fromEntries(parsedResults);
}
