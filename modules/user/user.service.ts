import { Chain, PrismaPoolStaking, PrismaPoolStakingType } from '@prisma/client';
import { prisma } from '../../prisma/prisma-client';
import { GqlPoolJoinExit, GqlPoolSwap } from '../../schema';
import { PoolSwapService } from '../pool/lib/pool-swap.service';
import { tokenService } from '../token/token.service';
import { UserBalanceService } from './lib/user-balance.service';
import { UserSyncWalletBalanceService } from './lib/user-sync-wallet-balance.service';
import { UserPoolBalance, UserStakedBalanceService } from './user-types';
import { networkContext } from '../network/network-context.service';

export class UserService {
    constructor(
        private readonly userBalanceService: UserBalanceService,
        private readonly walletSyncService: UserSyncWalletBalanceService,
        private readonly poolSwapService: PoolSwapService,
    ) {}

    private get stakedSyncServices(): UserStakedBalanceService[] {
        return networkContext.config.userStakedBalanceServices;
    }

    public async getUserPoolBalances(address: string, chains: Chain[]): Promise<UserPoolBalance[]> {
        return this.userBalanceService.getUserPoolBalances(address, chains);
    }

    public async getUserPoolInvestments(
        address: string,
        poolId: string,
        chain: Chain,
        first?: number,
        skip?: number,
    ): Promise<GqlPoolJoinExit[]> {
        return this.poolSwapService.getUserJoinExitsForPool(address, poolId, chain, first, skip);
    }

    public async getUserSwaps(
        address: string,
        poolId: string,
        chain: Chain,
        first?: number,
        skip?: number,
    ): Promise<GqlPoolSwap[]> {
        return this.poolSwapService.getUserSwapsForPool(address, poolId, chain, first, skip);
    }

    public async getUserFbeetsBalance(address: string): Promise<Omit<UserPoolBalance, 'poolId'>> {
        return this.userBalanceService.getUserFbeetsBalance(address);
    }

    public async getUserStaking(address: string, chains: Chain[]): Promise<PrismaPoolStaking[]> {
        return this.userBalanceService.getUserStaking(address, chains);
    }

    public async initWalletBalancesForAllPools() {
        await this.walletSyncService.initBalancesForPools();
    }

    public async initWalletBalancesForPool(poolId: string) {
        await this.walletSyncService.initBalancesForPool(poolId);
    }

    public async syncChangedWalletBalancesForAllPools() {
        await this.walletSyncService.syncChangedBalancesForAllPools();
    }

    public async initStakedBalances(stakingTypes: PrismaPoolStakingType[], chain: Chain) {
        await Promise.all(this.stakedSyncServices.map((service) => service.initStakedBalances(stakingTypes, chain)));
    }

    public async syncChangedStakedBalances(chain: Chain) {
        await Promise.all(this.stakedSyncServices.map((service) => service.syncChangedStakedBalances(chain)));
    }

    public async syncUserBalanceAllPools(userAddress: string) {
        const allBalances = await this.userBalanceService.getUserPoolBalances(userAddress, [networkContext.chain]);
        for (const userPoolBalance of allBalances) {
            await this.syncUserBalance(userAddress, userPoolBalance.poolId);
        }
    }

    public async syncUserBalance(userAddress: string, poolId: string) {
        const pool = await prisma.prismaPool.findUniqueOrThrow({
            where: { id_chain: { id: poolId, chain: networkContext.chain } },
            include: { staking: true },
        });

        // we make sure the user exists
        await prisma.prismaUser.upsert({
            where: { address: userAddress },
            update: {},
            create: { address: userAddress },
        });

        await this.walletSyncService.syncUserBalance(userAddress, pool.id, pool.address);

        for (const stake of pool.staking) {
            await Promise.all(
                this.stakedSyncServices.map((service) =>
                    service.syncUserBalance({
                        userAddress,
                        poolId: pool.id,
                        chain: pool.chain,
                        poolAddress: pool.address,
                        staking: stake,
                    }),
                ),
            );
        }
    }
}

export const userService = new UserService(
    new UserBalanceService(),
    new UserSyncWalletBalanceService(),
    new PoolSwapService(tokenService),
);
