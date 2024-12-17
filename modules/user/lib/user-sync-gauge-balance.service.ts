import { UserStakedBalanceService, UserSyncUserBalanceInput } from '../user-types';
import { prisma } from '../../../prisma/prisma-client';
import _ from 'lodash';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import RewardsOnlyGaugeAbi from './abi/RewardsOnlyGauge.json';
import { Multicaller } from '../../web3/multicaller';
import { formatFixed } from '@ethersproject/bignumber';
import { Chain, PrismaPoolStakingType } from '@prisma/client';
import ERC20Abi from '../../web3/abi/ERC20.json';
import { zeroAddress as AddressZero } from 'viem';
import { getEvents } from '../../web3/events';
import { GaugeSubgraphService } from '../../subgraphs/gauge-subgraph/gauge-subgraph.service';
import { BALANCES_SYNC_BLOCKS_MARGIN } from '../../../config';
import { getViemClient } from '../../sources/viem-client';
import config from '../../../config';
import { ethers } from 'ethers';

export class UserSyncGaugeBalanceService implements UserStakedBalanceService {
    constructor() {}

    public async initStakedBalances(stakingTypes: PrismaPoolStakingType[], chain: Chain): Promise<void> {
        if (!stakingTypes.includes('GAUGE')) {
            return;
        }

        const gaugeSubgraphService = new GaugeSubgraphService(config[chain].subgraphs.gauge!);
        const { block } = await gaugeSubgraphService.getMetadata();
        console.log('initStakedBalances: loading subgraph users...');
        const gaugeShares = await gaugeSubgraphService.getAllGaugeShares();
        console.log('initStakedBalances: finished loading subgraph users...');
        console.log('initStakedBalances: loading pools...');
        const pools = await prisma.prismaPool.findMany({
            select: { id: true, address: true },
            where: { chain },
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
                prisma.prismaUserStakedBalance.deleteMany({ where: { staking: { type: 'GAUGE' }, chain } }),
                prisma.prismaUserStakedBalance.createMany({
                    data: filteredGaugeShares.map((share) => {
                        const poolId = poolsMap.get(share.gauge.poolAddress);

                        return {
                            id: `${share.gauge.id}-${share.user.id}`,
                            chain,
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
                    where: { type_chain: { type: 'STAKED', chain } },
                    create: { type: 'STAKED', chain, blockNumber: block.number },
                    update: { blockNumber: block.number },
                }),
            ],
            true,
        );

        console.log('initStakedBalances: finished...');
    }

    public async syncChangedStakedBalances(chain: Chain): Promise<void> {
        const client = getViemClient(chain);

        // we always store the latest synced block
        const status = await prisma.prismaUserBalanceSyncStatus.findUnique({
            where: { type_chain: { type: 'STAKED', chain } },
        });

        if (!status) {
            throw new Error('UserSyncGaugeBalanceService: syncStakedBalances called before initStakedBalances');
        }

        const pools = await prisma.prismaPool.findMany({
            include: { staking: true },
            where: { chain },
        });
        console.log(`user-sync-staked-balances-${chain} got data from db.`);

        const latestBlock = await client.getBlockNumber();
        console.log(`user-sync-staked-balances-${chain} got latest block ${latestBlock}.`);

        // Get gauge addresses
        const gaugeAddresses = (
            await prisma.prismaPoolStakingGauge.findMany({
                select: { gaugeAddress: true },
                where: { chain },
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
        const toBlock = Math.min(startBlock + 5 * config[chain].rpcMaxBlockRange, Number(latestBlock));
        console.log(`user-sync-staked-balances-${chain} block range from ${startBlock} to ${toBlock}`);
        console.log(`user-sync-staked-balances-${chain} getLogs for ${gaugeAddresses.length} gauges.`);

        const events = await getEvents(
            startBlock,
            toBlock,
            gaugeAddresses,
            ['Transfer'],
            config[chain].rpcUrl,
            config[chain].rpcMaxBlockRange,
            ERC20Abi,
        );

        console.log(`user-sync-staked-balances-${chain} getLogs for ${gaugeAddresses.length} gauges done`);

        const balancesToFetch = _.uniqBy(
            events
                .map((event) => [
                    { erc20Address: event.address, userAddress: event.args?.from as string },
                    { erc20Address: event.address, userAddress: event.args?.to as string },
                ])
                .flat(),
            (entry) => entry.erc20Address + entry.userAddress,
        );

        console.log(`user-sync-staked-balances-${chain} got ${balancesToFetch.length} balances to fetch.`);

        if (balancesToFetch.length === 0) {
            await prisma.prismaUserBalanceSyncStatus.update({
                where: { type_chain: { type: 'STAKED', chain } },
                data: { blockNumber: toBlock },
            });

            return;
        }

        const provider = new ethers.providers.JsonRpcProvider({ url: config[chain].rpcUrl, timeout: 60000 });

        const balances = await Multicaller.fetchBalances({
            multicallAddress: config[chain].multicall,
            provider,
            balancesToFetch,
        });

        console.log(`user-sync-staked-balances-${chain} got ${balancesToFetch.length} balances to fetch done.`);

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
                                    chain,
                                },
                            },
                            update: {
                                balance: formatFixed(userBalance.balance, 18),
                                balanceNum: parseFloat(formatFixed(userBalance.balance, 18)),
                            },
                            create: {
                                id: `${userBalance.erc20Address}-${userBalance.userAddress}`,
                                chain,
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
                                chain,
                            },
                        });
                    }),
                prisma.prismaUserBalanceSyncStatus.update({
                    where: {
                        type_chain: {
                            type: 'STAKED',
                            chain,
                        },
                    },
                    data: { blockNumber: toBlock },
                }),
            ],
            true,
        );
    }

    public async syncUserBalance({ userAddress, poolId, chain, poolAddress, staking }: UserSyncUserBalanceInput) {
        const client = getViemClient(staking.chain);
        const balance = (await client.readContract({
            address: staking.address as `0x{string}`,
            abi: RewardsOnlyGaugeAbi,
            functionName: 'balanceOf',
            args: [userAddress],
        })) as bigint;
        const amount = formatFixed(balance, 18);

        if (amount != '0') {
            await prisma.prismaUserStakedBalance.upsert({
                where: { id_chain: { id: `${staking.address}-${userAddress}`, chain } },
                update: {
                    balance: amount,
                    balanceNum: parseFloat(amount),
                },
                create: {
                    id: `${staking.address}-${userAddress}`,
                    chain,
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
                    chain,
                },
            });
        }
    }
}
