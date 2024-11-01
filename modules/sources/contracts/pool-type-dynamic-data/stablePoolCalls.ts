import { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from 'abitype';
import { ViemMulticallCall } from '../../../web3/multicaller-viem';
import stableV3 from '../abis/stable-v3';
import { formatEther } from 'viem';
import { StableTypeData } from './types';

type AmplificationParameters = AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof stableV3, 'getAmplificationParameter'>['outputs']
>;
type GetRate = AbiParametersToPrimitiveTypes<ExtractAbiFunction<typeof stableV3, 'getRate'>['outputs']>;

export const stableContractCalls = (ids: string[]): ViemMulticallCall[] => {
    const calls: ViemMulticallCall[] = [];

    for (const id of ids) {
        calls.push(
            {
                path: `${id}.amplificationParameter`,
                address: id as `0x${string}`,
                abi: stableV3,
                functionName: 'getAmplificationParameter',
            },
            {
                path: `${id}.getRate`,
                address: id as `0x${string}`,
                abi: stableV3,
                functionName: 'getRate',
            },
        );
    }

    return calls;
};

export const parseStableContractCalls = (result: {
    amplificationParameter: AmplificationParameters;
    rate: GetRate;
}): StableTypeData => {
    return {
        amp: String(result.amplificationParameter[0] / result.amplificationParameter[2]),
        bptPriceRate: formatEther(result.rate[0]),
    };
};
