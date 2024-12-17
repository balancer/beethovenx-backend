import { addressesMatch } from '../../web3/addresses';
import { formatFixed } from '@ethersproject/bignumber';
import { zeroAddress as AddressZero } from 'viem';
import _ from 'lodash';
import { prisma } from '../../../prisma/prisma-client';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import { BeetsBarSubgraphService } from '../../subgraphs/beets-bar-subgraph/beets-bar.service';
import { BeetsBarUserFragment } from '../../subgraphs/beets-bar-subgraph/generated/beets-bar-subgraph-types';
import { Multicaller, MulticallUserBalance } from '../../web3/multicaller';
import ERC20Abi from '../../web3/abi/ERC20.json';
import { networkContext } from '../../network/network-context.service';
import { AllNetworkConfigs } from '../../network/network-config';
import { getEvents } from '../../web3/events';
import { CowAmmController, UserBalancesController } from '../../controllers';
import { Prisma } from '@prisma/client';
import { BALANCES_SYNC_BLOCKS_MARGIN } from '../../../config';

export class UserSyncWalletBalanceService {
    beetsBarService?: BeetsBarSubgraphService;

    constructor(private _chainId?: number) {
        if (this.isFantomNetwork) {
            this.beetsBarService = new BeetsBarSubgraphService(
                AllNetworkConfigs['250'].data.subgraphs.beetsBar!,
                this.fbeetsAddress,
            );
        }
    }

    get isFantomNetwork() {
        return String(this.chain) === 'FANTOM';
    }

    get balancerSubgraphService() {
        return AllNetworkConfigs[this.chainId].services.balancerSubgraphService;
    }

    get chainId() {
        return String(this._chainId || networkContext.chainId);
    }

    get chain() {
        return AllNetworkConfigs[this.chainId].data.chain.prismaId;
    }

    get vaultAddress() {
        return AllNetworkConfigs[this.chainId].data.balancer.v2.vaultAddress;
    }

    get fbeetsAddress() {
        return AllNetworkConfigs['250'].data.fbeets!.address;
    }

    get fbeetsPoolId() {
        return AllNetworkConfigs['250'].data.fbeets!.poolId;
    }

    get provider() {
        return AllNetworkConfigs[this.chainId].provider;
    }

    get multicallAddress() {
        return AllNetworkConfigs[this.chainId].data.multicall;
    }

    get rpcMaxBlockRange() {
        return AllNetworkConfigs[this.chainId].data.rpcMaxBlockRange;
    }

    public async initBalancesForPools() {
        console.log('initBalancesForPools: loading balances, pools, block...');
        const { block } = await this.balancerSubgraphService.getMetadata();

        let endBlock = block.number;
        console.log(`Loading balances at block ${endBlock}`);

        if (this.beetsBarService) {
            const { block: beetsBarBlock } = await this.beetsBarService.getMetadata();
            endBlock = Math.min(endBlock, beetsBarBlock.number);
        }

        const shares = await this.balancerSubgraphService.getAllPoolSharesWithBalance(
            [],
            [AddressZero, this.vaultAddress],
        );

        console.log(`Found ${shares.length} shares to sync`);

        let fbeetsHolders: BeetsBarUserFragment[] = [];

        if (this.isFantomNetwork && this.beetsBarService) {
            console.log(`got beetsbar service`);
            fbeetsHolders = await this.beetsBarService.getAllUsers({ where: { fBeets_not: '0' } });
        }

        // Filter shares for the pools not yet in the DB
        const poolIds = await prisma.prismaPool
            .findMany({ select: { id: true }, where: { chain: this.chain } })
            .then((pools) => pools.map((pool) => pool.id));

        console.log(`initBalancesForPools: found ${poolIds.length} pools in the DB`);

        const operations: any[] = [
            prisma.prismaUserWalletBalance.deleteMany({ where: { chain: this.chain } }),
            ...shares
                .filter((share) => share.poolId && poolIds.includes(share.poolId))
                .map((share) => this.getPrismaUpsertForPoolShare(share)),
        ];

        console.log(`initBalancesForPools: performing ${operations.length} db operations...`);

        await prismaBulkExecuteOperations(
            [
                prisma.prismaUser.createMany({
                    data: _.uniq([
                        ...shares.map((share) => share.userAddress),
                        ...fbeetsHolders.map((user) => user.address),
                    ]).map((address) => ({ address })),
                    skipDuplicates: true,
                }),
                ...operations,
                ...fbeetsHolders.map((user) => this.getUserWalletBalanceUpsertForFbeets(user.address, user.fBeets)),
                prisma.prismaUserBalanceSyncStatus.upsert({
                    where: { type_chain: { type: 'WALLET', chain: this.chain } },
                    create: { type: 'WALLET', blockNumber: endBlock, chain: this.chain },
                    update: { blockNumber: Math.min(block.number, endBlock) },
                }),
            ],
            true,
        );
        console.log('initBalancesForPools: finished performing db operations...');

        // Attach CowAMM syncing
        console.log('initBalancesForPools: syncing CowAMM balances...');
        await CowAmmController().syncBalances(this.chain);
        console.log('initBalancesForPools: finished syncing CowAMM balances');

        // Attach V3 syncing
        console.log('initBalancesForPools: syncing V3 balances...');
        await UserBalancesController().syncUserBalancesFromV3Subgraph(this.chain);
        console.log('initBalancesForPools: finished syncing V3 balances');
    }

    public async syncChangedBalancesForAllPools() {
        const latestBlock = await this.provider.getBlockNumber();
        const syncStatus = await prisma.prismaUserBalanceSyncStatus.findUnique({
            where: { type_chain: { type: 'WALLET', chain: this.chain } },
        });
        const response = await prisma.prismaPool.findMany({
            select: { id: true, address: true },
            where: { chain: this.chain },
        });

        const poolAddresses = response.map((item) => item.address);

        if (this.isFantomNetwork) {
            poolAddresses.push(this.fbeetsAddress);
        }

        if (!syncStatus) {
            throw new Error('UserWalletBalanceService: syncBalances called before initBalances');
        }

        const fromBlock = syncStatus.blockNumber - BALANCES_SYNC_BLOCKS_MARGIN;

        // no new blocks have been minted, needed for slow networks
        if (fromBlock > latestBlock) {
            return;
        }

        // Split the range into smaller chunks to avoid RPC limits, setting up to 5 times max block range
        const toBlock = Math.min(fromBlock + 5 * this.rpcMaxBlockRange, latestBlock);
        console.log(`UserWalletBalanceService: syncing balances from ${fromBlock} to ${toBlock}`);
        console.log(`user-sync-wallet-balances-for-all-pools-${this.chainId} getLogs of ${poolAddresses.length} pools`);

        const events = await getEvents(
            fromBlock,
            toBlock,
            poolAddresses,
            ['Transfer'],
            AllNetworkConfigs[this.chainId].data.rpcUrl,
            this.rpcMaxBlockRange,
            ERC20Abi,
        );

        console.log(
            `user-sync-wallet-balances-for-all-pools-${this.chainId} getLogs of ${poolAddresses.length} pools done`,
        );

        const relevantERC20Addresses = poolAddresses;

        if (this.isFantomNetwork) {
            relevantERC20Addresses.push(this.fbeetsAddress);
        }

        const balancesToFetch = _.uniqBy(
            events
                .filter((event) =>
                    //we also need to track fbeets balance
                    relevantERC20Addresses.includes(event.address.toLowerCase()),
                )
                .map((event) => [
                    { erc20Address: event.address, userAddress: event.args?.from as string },
                    { erc20Address: event.address, userAddress: event.args?.to as string },
                ])
                .flat(),
            (entry) => entry.erc20Address + entry.userAddress,
        );

        console.log(
            `user-sync-wallet-balances-for-all-pools-${this.chainId} got ${balancesToFetch.length} balances to fetch.`,
        );

        if (balancesToFetch.length === 0) {
            await prisma.prismaUserBalanceSyncStatus.upsert({
                where: { type_chain: { type: 'WALLET', chain: this.chain } },
                create: { type: 'WALLET', chain: this.chain, blockNumber: toBlock },
                update: { blockNumber: toBlock },
            });

            return;
        }

        const balances = await Multicaller.fetchBalances({
            multicallAddress: this.multicallAddress,
            provider: this.provider,
            balancesToFetch,
        });

        await prismaBulkExecuteOperations(
            [
                //make sure all users exist
                prisma.prismaUser.createMany({
                    data: balances.map((item) => ({ address: item.userAddress })),
                    skipDuplicates: true,
                }),
                //update balances
                ...balances
                    .filter(({ userAddress }) => userAddress !== AddressZero)
                    .map((userBalance) => {
                        if (this.isFantomNetwork && addressesMatch(userBalance.erc20Address, this.fbeetsAddress)) {
                            return this.getUserWalletBalanceUpsertForFbeets(
                                userBalance.userAddress,
                                formatFixed(userBalance.balance, 18),
                            );
                        }
                        const poolId = response.find((item) => item.address === userBalance.erc20Address)?.id;
                        return this.getUserWalletBalanceUpsert(userBalance, poolId!);
                    }),
                prisma.prismaUserBalanceSyncStatus.upsert({
                    where: { type_chain: { type: 'WALLET', chain: this.chain } },
                    create: { type: 'WALLET', chain: this.chain, blockNumber: toBlock },
                    update: { blockNumber: toBlock },
                }),
            ],
            true,
        );

        // Attach CowAMM syncing
        console.log('syncChangedBalancesForAllPools: syncing CowAMM balances...');
        await CowAmmController().syncBalances(this.chain);
        console.log('syncChangedBalancesForAllPools: finished syncing CowAMM balances');

        // Attach V3 syncing
        console.log('syncChangedBalancesForAllPools: syncing V3 balances...');
        await UserBalancesController().syncUserBalancesFromV3Subgraph(this.chain);
        console.log('syncChangedBalancesForAllPools: finished syncing V3 balances');
    }

    public async initBalancesForPool(poolId: string) {
        const { block } = await this.balancerSubgraphService.getMetadata();

        const shares = await this.balancerSubgraphService.getAllPoolSharesWithBalance([poolId], [AddressZero]);

        await prismaBulkExecuteOperations(
            [
                prisma.prismaUser.createMany({
                    data: shares.map((share) => ({ address: share.userAddress })),
                    skipDuplicates: true,
                }),
                ...shares.map((share) => this.getPrismaUpsertForPoolShare(share)),
                prisma.prismaUserBalanceSyncStatus.upsert({
                    where: { type_chain: { type: 'WALLET', chain: this.chain } },
                    create: { type: 'WALLET', chain: this.chain, blockNumber: block.number },
                    update: { blockNumber: block.number },
                }),
            ],
            true,
        );
    }

    public async syncUserBalance(userAddress: string, poolId: string, poolAddresses: string) {
        const balancesToFetch = [{ erc20Address: poolAddresses, userAddress }];

        if (this.isFantomNetwork && addressesMatch(this.fbeetsAddress, poolAddresses)) {
            balancesToFetch.push({ erc20Address: this.fbeetsAddress, userAddress });
        }

        const balances = await Multicaller.fetchBalances({
            multicallAddress: this.multicallAddress,
            provider: this.provider,
            balancesToFetch,
        });

        const operations = balances.map((userBalance) => this.getUserWalletBalanceUpsert(userBalance, poolId));

        await Promise.all(operations);
    }

    private getPrismaUpsertForPoolShare(share: Prisma.PrismaUserWalletBalanceCreateManyInput) {
        return prisma.prismaUserWalletBalance.upsert({
            where: { id_chain: { id: `${share.tokenAddress}-${share.userAddress}`, chain: this.chain } },
            create: {
                ...share,
                id: `${share.tokenAddress}-${share.userAddress}`,
                chain: this.chain,
            },
            update: { balance: share.balance, balanceNum: share.balanceNum },
        });
    }

    private getUserWalletBalanceUpsertForFbeets(userAddress: string, balance: string) {
        return prisma.prismaUserWalletBalance.upsert({
            where: { id_chain: { id: `fbeets-${userAddress}`, chain: this.chain } },
            create: {
                id: `fbeets-${userAddress}`,
                chain: this.chain,
                userAddress: userAddress,
                tokenAddress: this.fbeetsAddress,
                balance,
                balanceNum: parseFloat(balance),
                poolId: this.fbeetsPoolId,
            },
            update: { balance: balance, balanceNum: parseFloat(balance), poolId: this.fbeetsPoolId },
        });
    }

    private getUserWalletBalanceUpsert(userBalance: MulticallUserBalance, poolId: string) {
        const { userAddress, balance, erc20Address } = userBalance;

        if (balance.eq(0)) {
            // Using deleteMany, because delete throws when the record does not exist
            return prisma.prismaUserWalletBalance.deleteMany({
                where: { id: `${erc20Address}-${userAddress}`, chain: this.chain },
            });
        } else {
            return prisma.prismaUserWalletBalance.upsert({
                where: { id_chain: { id: `${erc20Address}-${userAddress}`, chain: this.chain } },
                create: {
                    id: `${erc20Address}-${userAddress}`,
                    chain: this.chain,
                    userAddress,
                    poolId,
                    tokenAddress: erc20Address,
                    balance: formatFixed(balance, 18),
                    balanceNum: parseFloat(formatFixed(balance, 18)),
                },
                update: {
                    balance: formatFixed(balance, 18),
                    balanceNum: parseFloat(formatFixed(balance, 18)),
                },
            });
        }
    }
}
