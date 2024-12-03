import { addressesMatch } from '../../web3/addresses';
import { formatFixed } from '@ethersproject/bignumber';
import { zeroAddress as AddressZero } from 'viem';
import _ from 'lodash';
import { prisma } from '../../../prisma/prisma-client';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';
import { BeetsBarSubgraphService } from '../../subgraphs/beets-bar-subgraph/beets-bar.service';
import { Multicaller, MulticallUserBalance } from '../../web3/multicaller';
import { networkContext } from '../../network/network-context.service';
import { AllNetworkConfigs } from '../../network/network-config';
import { Prisma } from '@prisma/client';

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
