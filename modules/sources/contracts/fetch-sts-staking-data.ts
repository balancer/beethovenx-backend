import { Address, formatEther, formatUnits } from 'viem';
import SonicStaking from './abis/SonicStaking';
import { ViemClient } from '../types';

export interface OnchainSonicStakingData {
    totalAssets: string;
    totalDelegated: string;
    totalPool: string;
    exchangeRate: string;
    protocolFee: string;
}

export async function fetchSonicStakingData(
    stakingContractAddress: Address,
    client: ViemClient,
): Promise<OnchainSonicStakingData> {
    const stakingContractArgs = {
        address: stakingContractAddress,
        abi: SonicStaking,
    };

    const [totalAssets, totalDelegated, totalPool, exchangeRate, protocolFeeBIPS] = await client.multicall({
        contracts: [
            {
                ...stakingContractArgs,
                functionName: 'totalAssets',
            },
            {
                ...stakingContractArgs,
                functionName: 'totalDelegated',
            },
            {
                ...stakingContractArgs,
                functionName: 'totalPool',
            },
            {
                ...stakingContractArgs,
                functionName: 'getRate',
            },
            {
                ...stakingContractArgs,
                functionName: 'protocolFeeBIPS',
            },
        ],
        allowFailure: false,
        multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11',
    });

    const stakingData: OnchainSonicStakingData = {
        totalAssets: formatEther(totalAssets),
        totalDelegated: formatEther(totalDelegated),
        totalPool: formatEther(totalPool),
        exchangeRate: formatEther(exchangeRate),
        protocolFee: formatUnits(protocolFeeBIPS, 4),
    };

    return stakingData;
}
