import { UserPoolBalance } from '../user-types';
import { prisma } from '../../../prisma/prisma-client';
import _ from 'lodash';
import { parseUnits } from 'ethers/lib/utils';
import { formatFixed } from '@ethersproject/bignumber';
import { Chain, PrismaPoolStaking } from '@prisma/client';
import { networkContext } from '../../network/network-context.service';

export class UserBalanceService {
    constructor() {}

    public async getUserPoolBalances(address: string, chains: Chain[]): Promise<UserPoolBalance[]> {
        // this seems to cause heavy load
        // const user = await prisma.prismaUser.findUnique({
        //     where: { address: address.toLowerCase() },
        //     include: {
        //         walletBalances: {
        //             where: { chain: { in: chains }, poolId: { not: null }, balanceNum: { gt: 0 } },
        //         },
        //         stakedBalances: {
        //             where: { chain: { in: chains }, poolId: { not: null }, balanceNum: { gt: 0 } },
        //         },
        //     },
        // });

        const userWalletBalances = await prisma.prismaUserWalletBalance.findMany({
            where: {
                userAddress: address.toLowerCase(),
                chain: { in: chains },
            },
        });

        const userStakedBalances = await prisma.prismaUserStakedBalance.findMany({
            where: {
                userAddress: address.toLowerCase(),
                chain: { in: chains },
            },
        });

        const nonZeroUserWalletBalances = userWalletBalances.filter(
            (balance) => balance.balanceNum > 0 && balance.poolId !== null,
        );
        const nonZeroUserStakedBalances = userStakedBalances.filter(
            (balance) => balance.balanceNum > 0 && balance.poolId !== null,
        );

        if (nonZeroUserWalletBalances.length === 0 && nonZeroUserStakedBalances.length === 0) {
            return [];
        }

        const poolIds = _.uniq([
            ...nonZeroUserWalletBalances.map((balance) => balance.poolId),
            ...nonZeroUserStakedBalances.map((balance) => balance.poolId),
        ]) as string[];

        return poolIds.map((poolId) => {
            const walletBalance = nonZeroUserWalletBalances.find((balance) => balance.poolId === poolId);
            const stakedBalance = nonZeroUserStakedBalances.find((balance) => balance.poolId === poolId);
            let stakedStr = stakedBalance?.balance || '0';
            let walletStr = walletBalance?.balance || '0';
            // Handle dust amounts with scienific notation
            if (stakedStr.includes('e') && Number(stakedStr) < 1) {
                stakedStr = Number(stakedStr)
                    .toFixed(18)
                    .replace(/(?:\.0+|(\.\d*?)0+)$/, '$1'); // trims trailing zeros
            }
            if (walletStr.includes('e') && Number(walletStr) < 1) {
                walletStr = Number(walletStr)
                    .toFixed(18)
                    .replace(/(?:\.0+|(\.\d*?)0+)$/, '$1'); // trims trailing zeros
            }
            const stakedNum = parseUnits(stakedStr, 18);
            const walletNum = parseUnits(walletStr, 18);
            const totalBalance = stakedNum.add(walletNum);

            return {
                poolId,
                tokenAddress: stakedBalance?.tokenAddress || walletBalance?.tokenAddress || '',
                totalBalance: formatFixed(totalBalance, 18),
                stakedBalance: stakedBalance?.balance || '0',
                walletBalance: walletBalance?.balance || '0',
                // the prisma query above ensures that one of these balances exists
                chain: (stakedBalance?.chain || walletBalance?.chain)!,
            };
        });
    }

    public async getUserFbeetsBalance(address: string): Promise<Omit<UserPoolBalance, 'poolId'>> {
        const fbeetsAddress = networkContext.data.fbeets?.address || '';

        const userWalletBalances = await prisma.prismaUserWalletBalance.findMany({
            where: { userAddress: address.toLowerCase(), chain: networkContext.chain, tokenAddress: fbeetsAddress },
        });

        const userStakedBalances = await prisma.prismaUserStakedBalance.findMany({
            where: { userAddress: address.toLowerCase(), chain: networkContext.chain, tokenAddress: fbeetsAddress },
        });

        // this seems to cause heavy load
        // const user = await prisma.prismaUser.findUnique({
        //     where: { address: address.toLowerCase() },
        //     include: {
        //         walletBalances: { where: { chain: networkContext.chain, tokenAddress: fbeetsAddress } },
        //         stakedBalances: { where: { chain: networkContext.chain, tokenAddress: fbeetsAddress } },
        //     },
        // });

        const stakedBalance = userWalletBalances[0];
        const walletBalance = userStakedBalances[0];
        const stakedNum = parseUnits(stakedBalance?.balance || '0', 18);
        const walletNum = parseUnits(walletBalance?.balance || '0', 18);

        return {
            tokenAddress: fbeetsAddress,
            totalBalance: formatFixed(stakedNum.add(walletNum), 18),
            stakedBalance: stakedBalance?.balance || '0',
            walletBalance: walletBalance?.balance || '0',
            chain: networkContext.chain,
        };
    }

    public async getUserStaking(address: string, chains: Chain[]): Promise<PrismaPoolStaking[]> {
        const user = await prisma.prismaUser.findUnique({
            where: { address },
            include: {
                stakedBalances: {
                    where: { chain: { in: chains }, balanceNum: { gt: 0 } },
                    include: {
                        staking: {
                            include: {
                                farm: {
                                    include: {
                                        rewarders: true,
                                    },
                                },
                                gauge: {
                                    include: {
                                        rewards: true,
                                    },
                                },
                                reliquary: true,
                            },
                        },
                    },
                },
            },
        });

        return (user?.stakedBalances || [])
            .filter((stakedBalance) => stakedBalance.staking)
            .map((stakedBalance) => stakedBalance.staking);
    }
}
