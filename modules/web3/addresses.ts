import { Chain } from '@prisma/client';
import { zeroAddress } from 'viem';
import config from '../../config';

export function addressesMatch(address1: string, address2: string) {
    return address1.toLowerCase() === address2.toLowerCase();
}

export function replaceZeroAddressWithEth(address: string, chain: Chain) {
    if (address.toLowerCase() === zeroAddress) {
        return config[chain].eth.address;
    }

    return address;
}
