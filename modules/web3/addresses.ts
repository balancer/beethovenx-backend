import { zeroAddress } from 'viem';
import { networkContext } from '../network/network-context.service';

export function addressesMatch(address1: string, address2: string) {
    return address1.toLowerCase() === address2.toLowerCase();
}

export function replaceZeroAddressWithEth(address: string) {
    if (address.toLowerCase() === zeroAddress) {
        return networkContext.data.eth.address;
    }

    return address;
}
