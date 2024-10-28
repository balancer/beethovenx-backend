import { isSameAddress } from '@balancer-labs/sdk';
import { formatFixed } from '@ethersproject/bignumber';
import { ZERO_ADDRESS } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants';
import { PrismaPoolStakingType } from '@prisma/client';
import { BigNumber, Event } from 'ethers';
import _ from 'lodash';
import { prisma } from '../../../prisma/prisma-client';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import { bn } from '../../big-number/big-number';
import { AmountHumanReadable } from '../../common/global-types';
import ReliquaryAbi from '../../web3/abi/Reliquary.json';
import { getContractAt } from '../../web3/contract';
import { Multicaller } from '../../web3/multicaller';
import { Reliquary } from '../../web3/types/Reliquary';
import { UserStakedBalanceService, UserSyncUserBalanceInput } from '../user-types';
import { networkContext } from '../../network/network-context.service';
import { ReliquarySubgraphService } from '../../subgraphs/reliquary-subgraph/reliquary.service';
import { BALANCES_SYNC_BLOCKS_MARGIN } from '../../../config';

type ReliquaryPosition = {
    amount: BigNumber;
    rewardDebt: BigNumber;
    rewardCredit: BigNumber;
    entry: BigNumber;
    poolId: BigNumber;
    level: BigNumber;
};

type BalanceChangedEvent = Event & {
    args: {
        pid: BigNumber;
        amount: BigNumber;
        to: string;
        relicId: BigNumber;
    };
};

type RelicManagementEvent = Event & {
    args: {
        fromId: BigNumber;
        toId: string;
        amount: BigNumber;
    };
};

type TransferEvent = Event & {
    args: {
        from: string;
        to: string;
        tokenId: BigNumber;
    };
};

export class UserSyncReliquaryFarmBalanceService implements UserStakedBalanceService {
    constructor(private readonly reliquaryAddress: string) {}

    get reliquarySubgraphService() {
        return new ReliquarySubgraphService(networkContext.data.subgraphs.reliquary!);
    }

    public async syncChangedStakedBalances(): Promise<void> {
        const status = await prisma.prismaUserBalanceSyncStatus.findUnique({
            where: { type_chain: { type: 'RELIQUARY', chain: networkContext.chain } },
        });

        if (!status) {
            throw new Error('UserReliquaryFarmBalanceService: syncStakedBalances called before initStakedBalances');
        }

        const pools = await prisma.prismaPool.findMany({
            where: {
                staking: {
                    some: {
                        type: 'RELIQUARY',
                    },
                },
                chain: networkContext.chain,
            },
            include: { staking: true },
        });
        const latestBlock = await networkContext.provider.getBlockNumber();
        const farms = await this.reliquarySubgraphService.getAllFarms({});
        const filteredFarms = farms.filter(
            (farm) => !networkContext.data.reliquary!.excludedFarmIds.includes(farm.pid.toString()),
        );

        // const startBlock = status.blockNumber - BALANCES_SYNC_BLOCKS_MARGIN;
        // const endBlock =
        //     latestBlock - startBlock > networkContext.data.rpcMaxBlockRange
        //         ? startBlock + networkContext.data.rpcMaxBlockRange
        //         : latestBlock;

        const startBlock = 95236540;
        const endBlock = 95236550;

        const amountUpdates = await this.getAmountsForUsersWithBalanceChangesSinceStartBlock(
            this.reliquaryAddress,
            startBlock,
            endBlock,
        );

        // no new blocks have been minted, needed for slow networks
        if (startBlock > endBlock) {
            return;
        }
        const userAddresses = _.uniq(amountUpdates.map((update) => update.userAddress.toLowerCase()));

        const filteredAmountUpdates = amountUpdates.filter(
            (update) =>
                !networkContext.data.reliquary!.excludedFarmIds.includes(update.farmId.toString()) &&
                update.amount !== '0.0',
        );

        await prismaBulkExecuteOperations(
            [
                prisma.prismaUser.createMany({
                    data: userAddresses.map((userAddress) => ({ address: userAddress })),
                    skipDuplicates: true,
                }),
                prisma.prismaUserStakedBalance.deleteMany({
                    where: {
                        staking: { type: 'RELIQUARY' },
                        chain: networkContext.chain,
                        userAddress: { in: userAddresses },
                    },
                }),
                ...filteredAmountUpdates.map((update) => {
                    const userAddress = update.userAddress.toLowerCase();
                    const pool = pools.find((pool) =>
                        pool.staking.some((stake) => stake.id === `reliquary-${update.farmId}`),
                    );
                    const farm = filteredFarms.find((farm) => farm.pid.toString() === update.farmId);

                    return prisma.prismaUserStakedBalance.upsert({
                        where: {
                            id_chain: {
                                id: `reliquary-${update.farmId}-${userAddress}`,
                                chain: networkContext.chain,
                            },
                        },
                        update: {
                            balance: update.amount,
                            balanceNum: parseFloat(update.amount),
                            stakingId: `reliquary-${update.farmId}`,
                        },
                        create: {
                            id: `reliquary-${update.farmId}-${userAddress}`,
                            chain: networkContext.chain,
                            balance: update.amount,
                            balanceNum: parseFloat(update.amount),
                            userAddress: userAddress,
                            poolId: pool!.id,
                            tokenAddress: farm!.poolTokenAddress,
                            stakingId: `reliquary-${update.farmId}`,
                        },
                    });
                }),
                prisma.prismaUserBalanceSyncStatus.update({
                    where: { type_chain: { type: 'RELIQUARY', chain: networkContext.chain } },
                    data: { blockNumber: endBlock },
                }),
            ],
            true,
        );
    }

    public async initStakedBalances(stakingTypes: PrismaPoolStakingType[]): Promise<void> {
        if (!stakingTypes.includes('RELIQUARY')) {
            return;
        }
        const { block } = await this.reliquarySubgraphService.getMetadata();
        console.log('initStakedReliquaryBalances: loading subgraph relics...');
        const relics = await this.reliquarySubgraphService.getAllRelicsWithPaging({});
        const filteredRelics = relics.filter(
            (relic) => !networkContext.data.reliquary?.excludedFarmIds.includes(`${relic.pid}`),
        );
        console.log('initStakedReliquaryBalances: finished loading subgraph relics...');
        console.log('initStakedReliquaryBalances: loading pools...');
        const pools = await prisma.prismaPool.findMany({
            select: { id: true, address: true },
            where: { chain: networkContext.chain },
        });
        console.log('initStakedReliquaryBalances: finished loading pools...');
        // we have to group all relics for the same pool
        const userRelicsByPoolId = _.groupBy(filteredRelics, (relic) => relic.userAddress + relic.pid);

        // we need to make sure all users exist
        const userAddresses = _.uniq(filteredRelics.map((relic) => relic.userAddress.toLowerCase()));

        console.log('initStakedReliquaryBalances: performing db operations...');

        await prismaBulkExecuteOperations(
            [
                prisma.prismaUser.createMany({
                    data: userAddresses.map((userAddress) => ({ address: userAddress })),
                    skipDuplicates: true,
                }),
                prisma.prismaUserStakedBalance.deleteMany({
                    where: { staking: { type: 'RELIQUARY' }, chain: networkContext.chain },
                }),

                prisma.prismaUserStakedBalance.createMany({
                    data: Object.values(userRelicsByPoolId).map((relics) => {
                        const totalBalance = relics.reduce((total, relic) => total + parseFloat(relic.balance), 0);
                        // there has to be at least 1 relic in there
                        const relic = relics[0];
                        const userAddress = relic.userAddress.toLowerCase();
                        const pool = pools.find((pool) => isSameAddress(pool.address, relic.pool.poolTokenAddress));

                        return {
                            id: `reliquary-${relic.pid}-${userAddress}`,
                            chain: networkContext.chain,
                            balance: totalBalance.toString(),
                            balanceNum: totalBalance,
                            userAddress: userAddress,
                            poolId: pool?.id,
                            tokenAddress: relic.pool.poolTokenAddress,
                            stakingId: `reliquary-${relic.pid}`,
                        };
                    }),
                }),
                prisma.prismaUserBalanceSyncStatus.upsert({
                    where: { type_chain: { type: 'RELIQUARY', chain: networkContext.chain } },
                    create: { type: 'RELIQUARY', chain: networkContext.chain, blockNumber: block.number },
                    update: { blockNumber: block.number },
                }),
            ],
            true,
        );

        console.log('initStakedReliquaryBalances: finished...');
    }

    public async syncUserBalance({ userAddress, poolId, poolAddress, staking }: UserSyncUserBalanceInput) {
        if (staking.type !== 'RELIQUARY') {
            return;
        }
        const reliquary: Reliquary = getContractAt(this.reliquaryAddress, ReliquaryAbi);
        const relicPositions = await reliquary.relicPositionsOfOwner(userAddress);

        const positions = relicPositions[1];

        const balance = positions
            .filter((position) => position.poolId.toString() === staking.id.split('-')[1])
            .reduce((total, position) => total.add(position.amount), bn(0));
        const balanceFormatted = formatFixed(balance, 18);

        await prisma.prismaUserStakedBalance.upsert({
            where: {
                id_chain: { id: `reliquary-${staking.id}-${userAddress.toLowerCase()}`, chain: networkContext.chain },
            },
            update: {
                balance: balanceFormatted,
                balanceNum: parseFloat(balanceFormatted),
            },
            create: {
                id: `reliquary-${staking.id}-${userAddress.toLowerCase()}`,
                chain: networkContext.chain,
                balance: balanceFormatted,
                balanceNum: parseFloat(balanceFormatted),
                userAddress: userAddress.toLowerCase(),
                poolId: poolId,
                tokenAddress: poolAddress,
                stakingId: staking.id,
            },
        });
    }

    private async getAmountsForUsersWithBalanceChangesSinceStartBlock(
        reliquaryAddress: string,
        startBlock: number,
        endBlock: number,
    ): Promise<{ farmId: string; userAddress: string; amount: AmountHumanReadable }[]> {
        const reliquaryContract: Reliquary = getContractAt(reliquaryAddress, ReliquaryAbi);

        const events = await reliquaryContract.queryFilter({ address: reliquaryAddress }, startBlock, endBlock);
        const balanceChangedEvents = events.filter(
            (event) =>
                event.topics.length > 0 &&
                [
                    //deposit topic
                    '0x9a2a1e97e6d641080089aafc36750cfdef4c79f8b3ace6fa4c384fa2f0476959',
                    //withdraw topic
                    '0x191a58d19a6a9b76e2e91bdc04ecbe7553dc094a5ad7af78175a0d9f884e264a',
                    //emergency withdraw topic
                    '0x6aaee64d11e8979fa392cd6388058c820f43709933f6a297e6e1005dddca62d6',
                ].includes(event.topics[0]),
        ) as BalanceChangedEvent[];
        const relicManagementEvents = events.filter(
            (event) =>
                event.topics.length > 0 &&
                [
                    //split topic is not needed, we find the affected user in the transfer events
                    // '0xcf0974dfd867840133a0d4b02f1672f24017796fb8892d1e0d587692e4da90ab',
                    //merge topic is not needed, we find the affected user in the transfer events
                    // '0x285dbc28e663286c77e3cd79d1cf1525744b4dfe015f41295fe5ae2858880bdf',
                    //shift topic needs to be inspected since we only now sender and the two relic ids, could be different receiving user
                    '0xda2a03409498a5fe8db3da030754afa618bc2228c0517ec5fa8c9b052979e9ea',
                ].includes(event.event!),
        ) as RelicManagementEvent[];
        const transferEvents = events.filter((event) => event.event === 'Transfer') as TransferEvent[];

        const multicall = new Multicaller(networkContext.data.multicall, networkContext.provider, ReliquaryAbi);

        // for the transfer events, we know which users are affected
        let affectedUsers = transferEvents.flatMap((event) => [event.args.from, event.args.to]);

        // for the other events, we need to find the owners of the affected relicIds
        const affectedRelicIds = [
            ...balanceChangedEvents.map((event) => parseInt(event.topics[3], 16)),
            ...relicManagementEvents.flatMap((event) => [parseInt(event.topics[1], 16), parseInt(event.topics[2], 16)]), //from relicId and to relicId
        ];
        //can already filter out relics we know that got burned
        const burnedRelics = transferEvents
            .filter((event) => event.args.to === ZERO_ADDRESS)
            .map((event) => event.args.tokenId.toString());
        const filteredAffectedRelicIds = affectedRelicIds.filter((relicId) => !burnedRelics.includes(`${relicId}`));

        // can't use multicall since relics could be burned in the meantime and ownerOf call reverts for burned relics
        const relicOwners: string[] = [];
        for (const relicId of filteredAffectedRelicIds) {
            try {
                const owner = await reliquaryContract.ownerOf(relicId);
                relicOwners.push(owner);
            } catch (e) {
                console.log(`Could not get owner of relic. Skipping.`);
            }
        }
        affectedUsers = _.uniq([...affectedUsers, ...relicOwners]).filter(
            (address) => !isSameAddress(ZERO_ADDRESS, address),
        );

        affectedUsers.forEach((userAddress) => {
            multicall.call(userAddress, reliquaryAddress, 'relicPositionsOfOwner', [userAddress]);
        });

        // we get a tuple with an array of relicIds and the corresponding positions array
        const updatedPositions: { [userAddress: string]: [BigNumber[], ReliquaryPosition[]] } =
            await multicall.execute();
        // for each user we have to sum up all balances of a specific farm, so we key on user + farmId
        const userFarmBalances: {
            [userFarm: string]: { userAddress: string; farmId: string; amount: BigNumber };
        } = {};

        // we only care for the user address and all positions, we can ignore the relicIds array
        Object.entries(updatedPositions).forEach(([userAddress, [relicIds, positions]]) => {
            if (positions.length === 0) {
                userFarmBalances[userAddress] = {
                    userAddress,
                    farmId: '0',
                    amount: BigNumber.from(0),
                };
            }
            positions.forEach((position) => {
                const key = `${userAddress}-${position.poolId}`;
                if (key in userFarmBalances) {
                    userFarmBalances[key].amount = userFarmBalances[key].amount.add(position.amount);
                } else {
                    userFarmBalances[key] = {
                        userAddress,
                        farmId: position.poolId.toString(),
                        amount: position.amount,
                    };
                }
            });
        });
        return Object.values(userFarmBalances).map((userFarmBalance) => ({
            ...userFarmBalance,
            amount: formatFixed(userFarmBalance.amount, 18),
        }));
    }
}
