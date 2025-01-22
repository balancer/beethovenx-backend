import { PrismaToken } from '@prisma/client';
import { Multicaller3Viem } from '../../../web3/multicaller-viem';
import MinimalErc4626Abi from '../abis/MinimalERC4626';
import { formatUnits, parseEther, parseUnits } from 'viem';

/**
 * Fetches convertToAssets rates for a list of ERC4626 tokens and returns them as strings
 * @param erc4626Tokens
 * @returns
 */
export const fetchUnwrapRates = async (
    erc4626Tokens: PrismaToken[],
    underlyingTokenMap: { [address: string]: PrismaToken },
): Promise<{
    [id: string]: string;
}> => {
    if (erc4626Tokens.length === 0) {
        return {};
    }
    const chain = erc4626Tokens[0].chain;
    const caller = new Multicaller3Viem(chain, MinimalErc4626Abi);
    erc4626Tokens.forEach((token) => caller.call(token.address, token.address, 'convertToAssets', [parseEther('1')]));
    const results = await caller.execute<{ [id: string]: bigint }>();

    // Convert the results to floats
    const formattedResults = Object.fromEntries(
        Object.entries(results).map(([key, value], index) => {
            const token = erc4626Tokens[index];
            const underlyingToken = token.underlyingTokenAddress
                ? underlyingTokenMap[token.underlyingTokenAddress]
                : null;
            if (!underlyingToken) {
                console.error(`Missing underlying token for ${key}`);
                return [key, { unwrapRate: '1', unwrapRateDecimals: 18 }];
            }
            const unwrapRateDecimals = 18 - token.decimals + underlyingToken.decimals;
            return [key, formatUnits(value, unwrapRateDecimals)];
        }),
    );

    return formattedResults;
};
