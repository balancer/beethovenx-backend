import { UserStakedBalanceService, UserSyncUserBalanceInput } from '../user-types';
import { prisma } from '../../../prisma/prisma-client';
import { getContractAt } from '../../web3/contract';
import _ from 'lodash';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import RewardsOnlyGaugeAbi from './abi/RewardsOnlyGauge.json';
import { Multicaller } from '../../web3/multicaller';
import { formatFixed } from '@ethersproject/bignumber';
import { PrismaPoolStakingType } from '@prisma/client';
import { networkContext } from '../../network/network-context.service';
import ERC20Abi from '../../web3/abi/ERC20.json';
import { zeroAddress as AddressZero } from 'viem';
import { getEvents } from '../../web3/events';
import { GaugeSubgraphService } from '../../subgraphs/gauge-subgraph/gauge-subgraph.service';
import { BALANCES_SYNC_BLOCKS_MARGIN } from '../../../config';

export class UserSyncGaugeBalanceService implements UserStakedBalanceService {
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

    get gaugeSubgraphService() {
        return new GaugeSubgraphService(networkContext.data.subgraphs.gauge!);
    }

    public async initStakedBalances(stakingTypes: PrismaPoolStakingType[]): Promise<void> {
        if (!stakingTypes.includes('GAUGE')) {
            return;
        }
        const { block } = await this.gaugeSubgraphService.getMetadata();
        console.log('initStakedBalances: loading subgraph users...');
        const gaugeShares = await this.gaugeSubgraphService.getAllGaugeShares();
        console.log('initStakedBalances: finished loading subgraph users...');
        console.log('initStakedBalances: loading pools...');
        const pools = await prisma.prismaPool.findMany({
            select: { id: true, address: true },
            where: { chain: this.chain },
        });
        // Map the pools address to id
        const poolsMap = new Map(pools.map((pool) => [pool.address, pool.id]));

        const filteredGaugeShares = gaugeShares.filter((share) => {
            const pool = poolsMap.get(share.gauge.poolAddress);
            if (pool) {
                return true;
            }
        });
        console.log('initStakedBalances: finished loading pools...');
        const userAddresses = _.uniq(filteredGaugeShares.map((share) => share.user.id));

        console.log('initStakedBalances: performing db operations...');

        await prismaBulkExecuteOperations(
            [
                prisma.prismaUser.createMany({
                    data: userAddresses.map((userAddress) => ({ address: userAddress })),
                    skipDuplicates: true,
                }),
                prisma.prismaUserStakedBalance.deleteMany({ where: { staking: { type: 'GAUGE' }, chain: this.chain } }),
                prisma.prismaUserStakedBalance.createMany({
                    data: filteredGaugeShares.map((share) => {
                        const poolId = poolsMap.get(share.gauge.poolAddress);

                        return {
                            id: `${share.gauge.id}-${share.user.id}`,
                            chain: this.chain,
                            balance: share.balance,
                            balanceNum: parseFloat(share.balance),
                            userAddress: share.user.id,
                            poolId,
                            tokenAddress: share.gauge.poolAddress,
                            stakingId: share.gauge.id,
                        };
                    }),
                }),
                prisma.prismaUserBalanceSyncStatus.upsert({
                    where: { type_chain: { type: 'STAKED', chain: this.chain } },
                    create: { type: 'STAKED', chain: this.chain, blockNumber: block.number },
                    update: { blockNumber: block.number },
                }),
            ],
            true,
        );

        console.log('initStakedBalances: finished...');
    }

    public async syncChangedStakedBalances(): Promise<void> {
        // we always store the latest synced block
        const status = await prisma.prismaUserBalanceSyncStatus.findUnique({
            where: { type_chain: { type: 'STAKED', chain: this.chain } },
        });

        if (!status) {
            throw new Error('UserSyncGaugeBalanceService: syncStakedBalances called before initStakedBalances');
        }

        const pools = await prisma.prismaPool.findMany({
            include: { staking: true },
            where: { chain: this.chain },
        });
        console.log(`user-sync-staked-balances-${this.chainId} got data from db.`);

        const latestBlock = await this.provider.getBlockNumber();
        console.log(`user-sync-staked-balances-${this.chainId} got latest block ${latestBlock}.`);

        // Get gauge addresses
        const gaugeAddresses = (
            await prisma.prismaPoolStakingGauge.findMany({
                select: { gaugeAddress: true },
                where: { chain: this.chain },
            })
        ).map((gauge) => gauge.gaugeAddress);

        // we sync at most 10k blocks at a time
        const startBlock = status.blockNumber - BALANCES_SYNC_BLOCKS_MARGIN;

        // no new blocks have been minted, needed for slow networks
        if (startBlock > latestBlock) {
            return;
        }

        /*
            we need to figure out which users have a changed balance on any gauge contract and update their balance,
            therefore we check all transfer events since the last synced block
         */

        // Split the range into smaller chunks to avoid RPC limits, setting up to 5 times max block range
        const toBlock = Math.min(startBlock + 5 * this.rpcMaxBlockRange, latestBlock);
        console.log(`user-sync-staked-balances-${this.chainId} block range from ${startBlock} to ${toBlock}`);
        console.log(`user-sync-staked-balances-${this.chainId} getLogs for ${gaugeAddresses.length} gauges.`);

        const events = await getEvents(
            startBlock,
            toBlock,
            gaugeAddresses,
            ['Transfer'],
            this.rpcUrl,
            this.rpcMaxBlockRange,
            ERC20Abi,
        );

        console.log(`user-sync-staked-balances-${this.chainId} getLogs for ${gaugeAddresses.length} gauges done`);

        const balancesToFetch = _.uniqBy(
            events
                .map((event) => [
                    { erc20Address: event.address, userAddress: event.args?.from as string },
                    { erc20Address: event.address, userAddress: event.args?.to as string },
                ])
                .flat(),
            (entry) => entry.erc20Address + entry.userAddress,
        );

        console.log(`user-sync-staked-balances-${this.chainId} got ${balancesToFetch.length} balances to fetch.`);

        if (balancesToFetch.length === 0) {
            await prisma.prismaUserBalanceSyncStatus.update({
                where: { type_chain: { type: 'STAKED', chain: this.chain } },
                data: { blockNumber: toBlock },
            });

            return;
        }

        const balances = await Multicaller.fetchBalances({
            multicallAddress: this.multicallAddress,
            provider: this.provider,
            balancesToFetch,
        });

        console.log(`user-sync-staked-balances-${this.chainId} got ${balancesToFetch.length} balances to fetch done.`);

        await prismaBulkExecuteOperations(
            [
                prisma.prismaUser.createMany({
                    data: _.uniq(balances.map((balance) => balance.userAddress)).map((address) => ({ address })),
                    skipDuplicates: true,
                }),
                ...balances
                    .filter(({ userAddress }) => userAddress !== AddressZero)
                    .filter(({ balance }) => balance.gt(0))
                    .map((userBalance) => {
                        const pool = pools.find((pool) =>
                            pool.staking.some((stake) => stake.id === userBalance.erc20Address),
                        );

                        return prisma.prismaUserStakedBalance.upsert({
                            where: {
                                id_chain: {
                                    id: `${userBalance.erc20Address}-${userBalance.userAddress}`,
                                    chain: this.chain,
                                },
                            },
                            update: {
                                balance: formatFixed(userBalance.balance, 18),
                                balanceNum: parseFloat(formatFixed(userBalance.balance, 18)),
                            },
                            create: {
                                id: `${userBalance.erc20Address}-${userBalance.userAddress}`,
                                chain: this.chain,
                                balance: formatFixed(userBalance.balance, 18),
                                balanceNum: parseFloat(formatFixed(userBalance.balance, 18)),
                                userAddress: userBalance.userAddress,
                                poolId: pool?.id,
                                tokenAddress: pool!.address,
                                stakingId: userBalance.erc20Address,
                            },
                        });
                    }),
                ...balances
                    .filter(({ userAddress }) => userAddress !== AddressZero)
                    .filter(({ balance }) => balance.eq(0))
                    .map((userBalance) => {
                        return prisma.prismaUserStakedBalance.deleteMany({
                            where: {
                                id: `${userBalance.erc20Address}-${userBalance.userAddress}`,
                                chain: this.chain,
                            },
                        });
                    }),
                prisma.prismaUserBalanceSyncStatus.update({
                    where: {
                        type_chain: {
                            type: 'STAKED',
                            chain: this.chain,
                        },
                    },
                    data: { blockNumber: toBlock },
                }),
            ],
            true,
        );
    }

    public async syncUserBalance({ userAddress, poolId, poolAddress, staking }: UserSyncUserBalanceInput) {
        const contract = getContractAt(staking.address, RewardsOnlyGaugeAbi);
        const balance = await contract.balanceOf(userAddress);
        const amount = formatFixed(balance, 18);

        if (amount != '0') {
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
        } else {
            await prisma.prismaUserStakedBalance.deleteMany({
                where: {
                    id: `${staking.address}-${userAddress}`,
                    chain: this.chain,
                },
            });
        }
    }
}
