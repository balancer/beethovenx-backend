import { UserStakedBalanceService, UserSyncUserBalanceInput } from '../user-types';
import { prisma } from '../../../prisma/prisma-client';
import _ from 'lodash';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import { formatFixed } from '@ethersproject/bignumber';
import { Chain, Prisma, PrismaPoolStakingType } from '@prisma/client';
import ERC20Abi from '../../web3/abi/ERC20.json';
import { AuraSubgraphService } from '../../sources/subgraphs/aura/aura.service';
import { formatEther, hexToBigInt } from 'viem';
import config from '../../../config';
import { getViemClient } from '../../sources/viem-client';

export class UserSyncAuraBalanceService implements UserStakedBalanceService {
    public async initStakedBalances(stakingTypes: PrismaPoolStakingType[], chain: Chain): Promise<void> {
        if (!stakingTypes.includes('AURA')) {
            return;
        }

        const auraSubgraphService = new AuraSubgraphService(config[chain].subgraphs.aura!);
        const viemClient = getViemClient(chain);
        const blockNumber = await viemClient.getBlockNumber();
        const auraGauges = await auraSubgraphService.getAllPools([chain]);
        const accounts = await auraSubgraphService.getAllUsers();

        const pools = await prisma.prismaPool.findMany({
            select: { id: true, address: true, staking: true },
            where: {
                chain: chain,
                staking: {
                    some: { aura: { auraPoolAddress: { in: auraGauges.map((auraGauge) => auraGauge.address) } } },
                },
            },
        });

        const operations: any[] = [];
        for (const account of accounts) {
            for (const poolAccount of account.poolAccounts) {
                if (poolAccount.pool.chainId === config[chain].chain.id) {
                    const pool = pools.find((pool) => pool.address === poolAccount.pool.lpToken.address);
                    if (!pool) {
                        continue;
                    }

                    const data = {
                        id: `${poolAccount.pool.address}-${account.id}`,
                        chain: chain,
                        balance: formatEther(hexToBigInt(poolAccount.staked)),
                        balanceNum: parseFloat(formatEther(hexToBigInt(poolAccount.staked))),
                        userAddress: account.id,
                        poolId: pool.id,
                        tokenAddress: poolAccount.pool.lpToken.address,
                        stakingId: poolAccount.pool.address,
                    };

                    operations.push(
                        prisma.prismaUserStakedBalance.upsert({
                            where: { id_chain: { id: `${poolAccount.pool.address}-${account.id}`, chain: chain } },
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
                    where: { type_chain: { type: 'AURA', chain: chain } },
                    create: { type: 'AURA', chain: chain, blockNumber: Number(blockNumber) },
                    update: { blockNumber: Number(blockNumber) },
                }),
            ],
            true,
        );
    }

    public async syncChangedStakedBalances(chain: Chain): Promise<void> {
        await this.initStakedBalances(['AURA'], chain);
    }

    public async syncUserBalance({ userAddress, poolId, chain, poolAddress, staking }: UserSyncUserBalanceInput) {
        const client = getViemClient(staking.chain);
        const balance = (await client.readContract({
            address: staking.address as `0x{string}`,
            abi: ERC20Abi,
            functionName: 'balanceOf',
            args: [userAddress],
        })) as bigint;
        const amount = formatFixed(balance, 18);

        await prisma.prismaUserStakedBalance.upsert({
            where: { id_chain: { id: `${staking.address}-${userAddress}`, chain: chain } },
            update: {
                balance: amount,
                balanceNum: parseFloat(amount),
            },
            create: {
                id: `${staking.address}-${userAddress}`,
                chain: chain,
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
