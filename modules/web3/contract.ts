import { getAddress } from 'ethers/lib/utils';
import { Contract } from 'ethers';
import { networkContext } from '../network/network-context.service';
import { BaseProvider } from '@ethersproject/providers';

export function returnChecksum() {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const result = originalMethod.apply(this, args);
            return getAddress(result);
        };
        return descriptor;
    };
}

export function getContractAt<T extends Contract>(address: string, abi: any): T {
    return new Contract(address, abi, networkContext.provider) as T;
}

export function getContractAtForNetwork<T extends Contract>(address: string, abi: any, provider: BaseProvider): T {
    return new Contract(address, abi, provider) as T;
}
