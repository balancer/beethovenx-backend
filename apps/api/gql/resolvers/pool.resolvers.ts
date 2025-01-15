import { poolService } from '../../../../modules/pool/pool.service';
import { GqlChain, Resolvers } from '../../../../schema';
import { isAdminRoute } from '../../../../modules/auth/auth-context';
import { networkContext } from '../../../../modules/network/network-context.service';
import { headerChain } from '../../../../modules/context/header-chain';
import {
    CowAmmController,
    EventsQueryController,
    SnapshotsController,
    PoolController,
    FXPoolsController,
} from '../../../../modules/controllers';
import { chainIdToChain } from '../../../../modules/network/chain-id-to-chain';

const balancerResolvers: Resolvers = {
    Query: {
        poolGetPool: async (parent, { id, chain, userAddress }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new Error('poolGetPool error: Provide "chain" param');
            }
            return poolService.getGqlPool(id, chain, userAddress ? userAddress : undefined);
        },
        poolGetPools: async (parent, args, context) => {
            return poolService.getGqlPools(args);
        },
        poolGetAggregatorPools: async (parent, args, context) => {
            return poolService.getAggregatorPools(args);
        },
        poolGetPoolsCount: async (parent, args, context) => {
            return poolService.getPoolsCount(args);
        },
        // TODO: Deprecate in favor of poolGetEvents
        poolGetSwaps: async (parent, args, context) => {
            const currentChain = headerChain();
            if (!args.where?.chainIn && currentChain) {
                args.where = { ...args.where, chainIn: [currentChain] };
            } else if (!args.where?.chainIn) {
                throw new Error('poolGetSwaps error: Provide "where.chainIn" param');
            }
            return poolService.getPoolSwaps(args);
        },
        // TODO: Deprecate in favor of poolGetEvents
        poolGetBatchSwaps: async (parent, args, context) => {
            const currentChain = headerChain();
            if (!args.where?.chainIn && currentChain) {
                args.where = { ...args.where, chainIn: [currentChain] };
            } else if (!args.where?.chainIn) {
                throw new Error('poolGetBatchSwaps error: Provide "where.chainIn" param');
            }
            return poolService.getPoolBatchSwaps(args);
        },
        // TODO: Deprecate in favor of poolGetEvents
        poolGetJoinExits: async (parent, args, context) => {
            const currentChain = headerChain();
            if (!args.where?.chainIn && currentChain) {
                args.where = { ...args.where, chainIn: [currentChain] };
            } else if (!args.where?.chainIn) {
                throw new Error('poolGetJoinExits error: Provide "where.chainIn" param');
            }
            return poolService.getPoolJoinExits(args);
        },
        poolGetEvents: async (parent, { range, poolId, chain, typeIn, userAddress }) => {
            return EventsQueryController().getEvents({
                first: 1000,
                where: { range, poolIdIn: [poolId], chainIn: [chain], typeIn, userAddress },
            });
        },
        poolEvents: async (parent: any, { first, skip, where }) => {
            return EventsQueryController().getEvents({
                first,
                skip,
                where,
            });
        },
        poolGetFeaturedPoolGroups: async (parent, { chains }, context) => {
            const currentChain = headerChain();
            if (!chains && currentChain) {
                chains = [currentChain];
            } else if (!chains) {
                throw new Error('poolGetFeaturedPoolGroups error: Provide "chains" param');
            }
            return poolService.getFeaturedPoolGroups(chains);
        },
        poolGetFeaturedPools: async (parent, { chains }, context) => {
            return poolService.getFeaturedPools(chains);
        },
        poolGetSnapshots: async (parent, { id, chain, range }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new Error('poolGetSnapshots error: Provide "chain" param');
            }
            const snapshots = await poolService.getSnapshotsForPool(id, chain, range);

            return snapshots.map((snapshot) => ({
                ...snapshot,
                totalLiquidity: `${snapshot.totalLiquidity}`,
                sharePrice: `${snapshot.sharePrice}`,
                volume24h: `${snapshot.volume24h}`,
                fees24h: `${snapshot.fees24h}`,
                surplus24h: `${snapshot.surplus24h}`,
                totalSwapVolume: `${snapshot.totalSwapVolume}`,
                totalSwapFee: `${snapshot.totalSwapFee}`,
                totalSurplus: `${snapshot.totalSurplus}`,
                swapsCount: `${snapshot.swapsCount}`,
                holdersCount: `${snapshot.holdersCount}`,
            }));
        },
    },
    Mutation: {
        poolSyncAllPoolsFromSubgraph: async (parent, {}, context) => {
            isAdminRoute(context);

            const chain = headerChain();

            if (!chain) {
                throw new Error('poolSyncAllPoolsFromSubgraph error: Provide chain header');
            }

            return PoolController().addPoolsV2(chain);
        },
        poolReloadAllPoolAprs: async (parent, { chain }, context) => {
            isAdminRoute(context);

            await poolService.reloadAllPoolAprs(chain);

            return 'success';
        },
        poolReloadStakingForAllPools: async (parent, args, context) => {
            isAdminRoute(context);

            const currentChain = headerChain();
            if (!currentChain) {
                throw new Error('poolReloadStakingForAllPools error: Provide chain header');
            }

            await poolService.reloadStakingForAllPools(args.stakingTypes, currentChain);

            return 'success';
        },
        poolLoadSnapshotsForPools: async (parent, { poolIds, reload }, context) => {
            isAdminRoute(context);

            await SnapshotsController().syncSnapshotForPools(
                poolIds,
                chainIdToChain[networkContext.chainId],
                reload || false,
            );

            return 'success';
        },
        poolUpdateLifetimeValuesForAllPools: async (parent, args, context) => {
            isAdminRoute(context);

            await poolService.updateLifetimeValuesForAllPools();

            return 'success';
        },
        poolLoadOnChainDataForAllPools: async (parent, { chains }, context) => {
            isAdminRoute(context);
            const result: { type: string; chain: GqlChain; success: boolean; error: string | undefined }[] = [];

            for (const chain of chains) {
                try {
                    await PoolController().syncOnchainDataForAllPoolsV2(chain);
                    result.push({ type: 'v2', chain, success: true, error: undefined });
                } catch (e) {
                    result.push({ type: 'v2', chain, success: false, error: `${e}` });
                    console.log(`Could not sync v2 pools for chain ${chain}: ${e}`);
                }
            }
            return result;
        },
        poolReloadPools: async (parent, { chains }, context) => {
            isAdminRoute(context);

            const result: { type: string; chain: GqlChain; success: boolean; error: string | undefined }[] = [];

            for (const chain of chains) {
                try {
                    await PoolController().reloadPoolsV3(chain);
                    result.push({ type: 'v3', chain, success: true, error: undefined });
                } catch (e) {
                    result.push({ type: 'v3', chain, success: false, error: `${e}` });
                    console.log(`Could not reload v3 pools for chain ${chain}: ${e}`);
                }
                try {
                    await CowAmmController().reloadPools(chain);
                    result.push({ type: 'cow', chain, success: true, error: undefined });
                } catch (e) {
                    result.push({ type: 'cow', chain, success: false, error: `${e}` });
                    console.log(`Could not reload COW pools for chain ${chain}: ${e}`);
                }
            }

            return result;
        },
        poolSyncAllCowSnapshots: async (parent, { chains }, context) => {
            isAdminRoute(context);

            const result: { type: string; chain: GqlChain; success: boolean; error: string | undefined }[] = [];

            for (const chain of chains) {
                try {
                    await CowAmmController().syncAllSnapshots(chain);
                    result.push({ type: 'cow', chain, success: true, error: undefined });
                } catch (e) {
                    result.push({ type: 'cow', chain, success: false, error: `${e}` });
                    console.log(`Could not sync cow amm snapshots for chain ${chain}: ${e}`);
                }
            }

            return result;
        },
        poolSyncFxQuoteTokens: async (parent, { chains }, context) => {
            isAdminRoute(context);

            const result: { type: string; chain: GqlChain; success: boolean; error: string | undefined }[] = [];

            for (const chain of chains) {
                try {
                    await FXPoolsController().syncQuoteTokens(chain);
                    result.push({ type: 'fx', chain, success: true, error: undefined });
                } catch (e) {
                    result.push({ type: 'fx', chain, success: false, error: `${e}` });
                    console.log(`Could not sync fx quote tokens for chain ${chain}: ${e}`);
                }
            }

            return result;
        },
    },
};

export default balancerResolvers;
