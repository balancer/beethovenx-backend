import { Resolvers } from '../../../../schema';
import { userService } from '../../../../modules/user/user.service';
import { getRequiredAccountAddress, isAdminRoute } from '../../../../modules/auth/auth-context';
import { tokenService } from '../../../../modules/token/token.service';
import { headerChain } from '../../../../modules/context/header-chain';
import { UserBalancesController } from '../../../../modules/controllers';
import { GraphQLError } from 'graphql';

const resolvers: Resolvers = {
    Query: {
        userGetPoolBalances: async (parent, { chains, address }, context) => {
            const currentChain = headerChain();
            if (!chains && currentChain) {
                chains = [currentChain];
            } else if (!chains) {
                throw new GraphQLError('Provide "chains" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            const accountAddress = address || getRequiredAccountAddress(context);
            const tokenPrices = await tokenService.getTokenPricesForChains(chains);
            const balances = await userService.getUserPoolBalances(accountAddress, chains);

            return balances.map((balance) => ({
                ...balance,
                tokenPrice: tokenService.getPriceForToken(
                    tokenPrices[balance.chain] || [],
                    balance.tokenAddress,
                    balance.chain,
                ),
            }));
        },
        // TODO: Deprecate in favor of poolGetEvents
        userGetPoolJoinExits: async (parent, { first, skip, poolId, chain, address }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            const accountAddress = address || getRequiredAccountAddress(context);

            return userService.getUserPoolInvestments(accountAddress, poolId, chain, first, skip);
        },
        // TODO: Deprecate in favor of poolGetEvents
        userGetSwaps: async (parent, { first, skip, poolId, chain, address }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            const accountAddress = address || getRequiredAccountAddress(context);
            return userService.getUserSwaps(accountAddress, poolId, chain, first, skip);
        },
        userGetStaking: async (parent, { chains, address }, context) => {
            const currentChain = headerChain();
            if (!chains && currentChain) {
                chains = [currentChain];
            } else if (!chains) {
                throw new GraphQLError('Provide "chains" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            const accountAddress = address || getRequiredAccountAddress(context);

            return userService.getUserStaking(accountAddress, chains);
        },
    },
    Mutation: {
        userSyncChangedWalletBalancesForAllPools: async (parent, {}, context) => {
            isAdminRoute(context);

            const chain = headerChain();
            if (!chain) {
                throw new GraphQLError('Provide "chainId" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }

            await UserBalancesController().syncBalances(chain);

            return 'success';
        },
        userInitWalletBalancesForAllPools: async (parent, { chain }, context) => {
            isAdminRoute(context);

            if (!chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }

            await UserBalancesController().syncBalances(chain);

            return 'success';
        },
        userInitWalletBalancesForPool: async (parent, { poolId }, context) => {
            isAdminRoute(context);

            await userService.initWalletBalancesForPool(poolId);

            return 'success';
        },
        userInitStakedBalances: async (parent, { stakingTypes }, context) => {
            isAdminRoute(context);
            const chain = headerChain() || 'MAINNET';

            await userService.initStakedBalances(stakingTypes, chain);

            return 'success';
        },
        userSyncChangedStakedBalances: async (parent, {}, context) => {
            isAdminRoute(context);
            const chain = headerChain() || 'MAINNET';

            await userService.syncChangedStakedBalances(chain);

            return 'success';
        },
        userSyncBalance: async (parent, { poolId }, context) => {
            const accountAddress = getRequiredAccountAddress(context);

            await userService.syncUserBalance(accountAddress, poolId);

            return 'success';
        },
        userSyncBalanceAllPools: async (parent, {}, context) => {
            isAdminRoute(context);

            const accountAddress = getRequiredAccountAddress(context);

            await userService.syncUserBalanceAllPools(accountAddress);

            return 'success';
        },
    },
};

export default resolvers;
