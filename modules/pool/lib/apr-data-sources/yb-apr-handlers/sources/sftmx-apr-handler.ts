import { AprHandler } from '..';
import { SftmxAprConfig } from '../../../../../network/apr-config-types';
import { formatFixed } from '@ethersproject/bignumber';
import FTMStaking from '../../../../../sources/contracts/abis/FTMStaking';
import SftmxVault from '../../../../../sources/contracts/abis/SftmxVault';
import { Chain } from '@prisma/client';
import { getViemClient } from '../../../../../sources/viem-client';

export class SftmxAprHandler implements AprHandler {
    tokens: {
        [underlyingAssetName: string]: {
            address: string;
            ftmStakingAddress: string;
        };
    };

    constructor(config: SftmxAprConfig) {
        this.tokens = config.tokens;
    }

    async getAprs(chain: Chain) {
        const client = getViemClient(chain);
        const baseApr = 0.018;
        const maxLockApr = 0.06;
        const validatorFee = 0.15;
        const sftmxFee = 0.1;
        const aprs: {
            [tokenAddress: string]: {
                apr: number;
                isIbYield: boolean;
                group?: string;
            };
        } = {};
        try {
            const addresses = Object.keys(this.tokens).map(
                (tokenAddress) => this.tokens[tokenAddress].ftmStakingAddress as `0x${string}`,
            );
            const contracts = addresses.flatMap((address) => [
                {
                    address,
                    abi: FTMStaking,
                    functionName: 'totalFTMWorth',
                },
                {
                    address,
                    abi: FTMStaking,
                    functionName: 'getPoolBalance',
                },
                {
                    address,
                    abi: FTMStaking,
                    functionName: 'getMaturedVaultLength',
                },
            ]);
            // @ts-ignore
            const results = (await client.multicall({ contracts, allowFailure: false })) as bigint[];
            for (let i = 0; i < results.length; i += 3) {
                const ftmStakingAddress = addresses[i];
                const totalFtm = results[i];
                const poolFtm = results[i + 1];
                const maturedVaultCount = results[i + 2];

                if (maturedVaultCount === 0n) {
                    continue;
                }

                const vaultAddressesCalls = Array.from({ length: Number(maturedVaultCount) }).map((_, index) => ({
                    address: ftmStakingAddress as `0x${string}`,
                    abi: FTMStaking,
                    functionName: 'getMaturedVault',
                    args: [index],
                }));
                const vaultAddresses = (await client.multicall({
                    contracts: vaultAddressesCalls,
                    allowFailure: false,
                })) as string[];
                const amountCalls = vaultAddresses.map((vaultAddress) => ({
                    address: vaultAddress as `0x${string}`,
                    abi: SftmxVault,
                    functionName: 'currentStakeValue',
                }));
                const amounts = (await client.multicall({ contracts: amountCalls, allowFailure: false })) as bigint[];
                const maturedFtmAmount = amounts.reduce((acc, amount) => acc + amount, 0n);

                const totalFtmNum = parseFloat(formatFixed(totalFtm.toString(), 18));
                const poolFtmNum = parseFloat(formatFixed(poolFtm.toString(), 18));
                const maturedFtmNum = parseFloat(formatFixed(maturedFtmAmount.toString(), 18));
                const stakedFtmNum = totalFtmNum - poolFtmNum - maturedFtmNum;

                const totalMaxLockApr =
                    (stakedFtmNum / totalFtmNum) * (maxLockApr * (1 - validatorFee)) * (1 - sftmxFee);
                const totalBaseApr = (maturedFtmNum / totalFtmNum) * (baseApr * (1 - validatorFee)) * (1 - sftmxFee);

                const totalSftmxApr = totalMaxLockApr + totalBaseApr;

                aprs[Object.values(this.tokens)[i].address] = {
                    apr: totalSftmxApr,
                    isIbYield: true,
                };
            }
            return aprs;
        } catch (error) {
            console.error('Failed to fetch sftmx APR:', error);
            return {};
        }
    }
}
