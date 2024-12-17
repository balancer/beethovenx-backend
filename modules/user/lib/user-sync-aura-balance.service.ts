import { UserStakedBalanceService, UserSyncUserBalanceInput } from '../user-types';
import { prisma } from '../../../prisma/prisma-client';
import { getContractAt } from '../../web3/contract';
import _ from 'lodash';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import { Multicaller } from '../../web3/multicaller';
import { formatFixed } from '@ethersproject/bignumber';
import { Prisma, PrismaPoolStakingType } from '@prisma/client';
import { networkContext } from '../../network/network-context.service';
import ERC20Abi from '../../web3/abi/ERC20.json';
import { getEvents } from '../../web3/events';
import { AuraSubgraphService } from '../../sources/subgraphs/aura/aura.service';
import { formatEther, hexToBigInt } from 'viem';

export class UserSyncAuraBalanceService implements UserStakedBalanceService {
    get chain() {
        return networkContext.chain;
    }

    get chainId() {
        return networkContext.chainId;
    }

    get provider() {
        return networkContext.provider;
    }

    get rpcUrl() {
        return networkContext.data.rpcUrl;
    }

    get rpcMaxBlockRange() {
        return networkContext.data.rpcMaxBlockRange;
    }

    get multicallAddress() {
        return networkContext.data.multicall;
    }

    get auraSubgraphService() {
        return new AuraSubgraphService(networkContext.data.subgraphs.aura!);
    }

    public async initStakedBalances(stakingTypes: PrismaPoolStakingType[]): Promise<void> {
        if (!stakingTypes.includes('AURA')) {
            return;
        }

        const blockNumber = await this.provider.getBlockNumber();
        const auraGauges = await this.auraSubgraphService.getAllPools([this.chain]);
        const accounts = await this.auraSubgraphService.getAllUsers();

        const pools = await prisma.prismaPool.findMany({
            select: { id: true, address: true, staking: true },
            where: {
                chain: this.chain,
                staking: {
                    some: { aura: { auraPoolAddress: { in: auraGauges.map((auraGauge) => auraGauge.address) } } },
                },
            },
        });

        const operations: any[] = [];
        for (const account of accounts) {
            for (const poolAccount of account.poolAccounts) {
                if (poolAccount.pool.chainId.toString() === this.chainId) {
                    const pool = pools.find((pool) => pool.address === poolAccount.pool.lpToken.address);
                    if (!pool) {
                        continue;
                    }

                    const data = {
                        id: `${poolAccount.pool.address}-${account.id}`,
                        chain: this.chain,
                        balance: formatEther(hexToBigInt(poolAccount.staked)),
                        balanceNum: parseFloat(formatEther(hexToBigInt(poolAccount.staked))),
                        userAddress: account.id,
                        poolId: pool.id,
                        tokenAddress: poolAccount.pool.lpToken.address,
                        stakingId: poolAccount.pool.address,
                    };

                    operations.push(
                        prisma.prismaUserStakedBalance.upsert({
                            where: { id_chain: { id: `${poolAccount.pool.address}-${account.id}`, chain: this.chain } },
                            create: data,
                            update: data,
                        }),
                    );
                }
            }
        }

        await prismaBulkExecuteOperations(
            [
                prisma.prismaUser.createMany({
                    data: accounts.map((account) => ({ address: account.id })),
                    skipDuplicates: true,
                }),
                ...operations,
                prisma.prismaUserBalanceSyncStatus.upsert({
                    where: { type_chain: { type: 'AURA', chain: this.chain } },
                    create: { type: 'AURA', chain: this.chain, blockNumber: blockNumber },
                    update: { blockNumber: blockNumber },
                }),
            ],
            true,
        );
    }

    public async syncChangedStakedBalances(): Promise<void> {
        await this.initStakedBalances(['AURA']);
    }

    public async syncUserBalance({ userAddress, poolId, poolAddress, staking }: UserSyncUserBalanceInput) {
        const contract = getContractAt(staking.address, ERC20Abi);
        const balance = await contract.balanceOf(userAddress);
        const amount = formatFixed(balance, 18);

        await prisma.prismaUserStakedBalance.upsert({
            where: { id_chain: { id: `${staking.address}-${userAddress}`, chain: this.chain } },
            update: {
                balance: amount,
                balanceNum: parseFloat(amount),
            },
            create: {
                id: `${staking.address}-${userAddress}`,
                chain: this.chain,
                balance: amount,
                balanceNum: parseFloat(amount),
                userAddress: userAddress,
                poolId: poolId,
                tokenAddress: poolAddress,
                stakingId: staking.address,
            },
        });
    }
}
