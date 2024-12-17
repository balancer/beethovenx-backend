import { Chain } from '@prisma/client';
import { Multicaller3Viem } from '../../../web3/multicaller-viem';
import MinimalErc4626Abi from '../abis/MinimalERC4626';
import { formatEther, parseEther } from 'viem';

/**
 * Fetches convertToAssets rates for a list of ERC4626 tokens and returns them as floats
 *
 * @param addresses
 * @param chain
 * @returns
 */
export const fetchUnwrapRates = async (addresses: string[], chain: Chain) => {
    const caller = new Multicaller3Viem(chain, MinimalErc4626Abi);
    addresses.forEach((address) => caller.call(address, address, 'convertToAssets', [parseEther('1')]));
    const results = await caller.execute<{ [id: string]: bigint }>();

    // Convert the results to floats
    const formattedResults = Object.fromEntries(
        Object.entries(results).map(([key, value]) => [key, parseFloat(formatEther(value))]),
    );

    return formattedResults;
};
