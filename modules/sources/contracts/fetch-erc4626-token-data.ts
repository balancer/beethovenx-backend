import { ViemClient } from '../viem-client';
import MinimalErc4626Abi from './abis/MinimalERC4626';
import { fetchErc20Headers } from '.';
import { multicallViem, ViemMulticallCall } from '../../web3/multicaller-viem';
import { Chain } from '@prisma/client';

interface Erc4626Data {
    asset?: string;
    convertToAssets?: string;
    convertToShares?: string;
    previewDeposit?: string;
    previewMint?: string;
    previewRedeem?: string;
    previewWithdraw?: string;
}

export async function fetchErc4626AndUnderlyingTokenData(
    tokens: { address: string; decimals: number; name: string; symbol: string; chain: Chain }[],
    viemClient: ViemClient,
): Promise<
    {
        address: string;
        decimals: number;
        name: string;
        symbol: string;
        chain: Chain;
        underlyingTokenAddress?: string;
    }[]
> {
    const tokenData: {
        [id: string]: {
            address: string;
            decimals: number;
            name: string;
            symbol: string;
            chain: Chain;
            underlyingTokenAddress?: string;
        };
    } = {};

    const calls: ViemMulticallCall[] = [];

    for (const token of tokens) {
        calls.push(
            {
                path: `${token.address}.asset`,
                address: token.address as `0x${string}`,
                abi: MinimalErc4626Abi,
                functionName: 'asset',
            },
            {
                path: `${token.address}.convertToAssets`,
                address: token.address as `0x${string}`,
                abi: MinimalErc4626Abi,
                functionName: 'convertToAssets',
                args: [1n],
            },
            {
                path: `${token.address}.convertToShares`,
                address: token.address as `0x${string}`,
                abi: MinimalErc4626Abi,
                functionName: 'convertToShares',
                args: [1n],
            },
            {
                path: `${token.address}.previewDeposit`,
                address: token.address as `0x${string}`,
                abi: MinimalErc4626Abi,
                functionName: 'previewDeposit',
                args: [1n],
            },
            {
                path: `${token.address}.previewMint`,
                address: token.address as `0x${string}`,
                abi: MinimalErc4626Abi,
                functionName: 'previewMint',
                args: [1n],
            },
            {
                path: `${token.address}.previewRedeem`,
                address: token.address as `0x${string}`,
                abi: MinimalErc4626Abi,
                functionName: 'previewRedeem',
                args: [1n],
            },
            {
                path: `${token.address}.previewWithdraw`,
                address: token.address as `0x${string}`,
                abi: MinimalErc4626Abi,
                functionName: 'previewWithdraw',
                args: [1n],
            },
        );
    }

    const results = (await multicallViem(viemClient, calls)) as { [tokenAddress: string]: Erc4626Data };

    for (const token of tokens) {
        const result = results[token.address];
        let underlyingTokenAddress: string | undefined = undefined;

        if (
            result.asset !== undefined &&
            result.convertToAssets !== undefined &&
            result.convertToShares !== undefined &&
            result.previewDeposit !== undefined &&
            result.previewMint !== undefined &&
            result.previewRedeem !== undefined &&
            result.previewWithdraw !== undefined
        ) {
            underlyingTokenAddress = result.asset?.toLowerCase();
        }

        tokenData[token.address] = {
            address: token.address,
            decimals: token.decimals,
            name: token.name,
            symbol: token.symbol,
            chain: token.chain,
            underlyingTokenAddress: underlyingTokenAddress,
        };

        if (underlyingTokenAddress && !tokenData[underlyingTokenAddress]) {
            const underlyingTokenDetail = await fetchErc20Headers(
                [underlyingTokenAddress as `0x${string}`],
                viemClient,
            );

            tokenData[underlyingTokenAddress] = {
                address: underlyingTokenAddress,
                decimals: underlyingTokenDetail[underlyingTokenAddress].decimals,
                name: underlyingTokenDetail[underlyingTokenAddress].name,
                symbol: underlyingTokenDetail[underlyingTokenAddress].symbol,
                chain: token.chain,
                underlyingTokenAddress: undefined,
            };
        }
    }

    return [...Object.values(tokenData)];
}
