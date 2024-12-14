import { Resolvers } from '../../../../schema';
import { beetsService } from '../../../../modules/beets/beets.service';
import { getRequiredAccountAddress, isAdminRoute } from '../../../../modules/auth/auth-context';
import { userService } from '../../../../modules/user/user.service';
import { poolService } from '../../../../modules/pool/pool.service';

const beetsResolvers: Resolvers = {
    Query: {
        beetsGetFbeetsRatio: async (parent, {}, context) => {
            return beetsService.getFbeetsRatio();
        },
        beetsPoolGetReliquaryFarmSnapshots: async (parent, { id, range }, context) => {
            const snapshots = await poolService.getSnapshotsForReliquaryFarm(parseFloat(id), range);

            return snapshots.map((snapshot) => ({
                id: snapshot.id,
                farmId: snapshot.farmId,
                timestamp: snapshot.timestamp,
                relicCount: `${snapshot.relicCount}`,
                userCount: `${snapshot.userCount}`,
                totalBalance: snapshot.totalBalance,
                totalLiquidity: snapshot.totalLiquidity,
                dailyDeposited: snapshot.dailyDeposited,
                dailyWithdrawn: snapshot.dailyWithdrawn,
                levelBalances: snapshot.levelBalances,
                tokenBalances: snapshot.tokenBalances,
            }));
        },
        userGetFbeetsBalance: async (parent, {}, context) => {
            const accountAddress = getRequiredAccountAddress(context);

            const balance = await userService.getUserFbeetsBalance(accountAddress);

            return {
                id: balance.tokenAddress,
                ...balance,
            };
        },
    },
    Mutation: {
        beetsSyncFbeetsRatio: async (parent, {}, context) => {
            isAdminRoute(context);

            await beetsService.syncFbeetsRatio();

            return 'success';
        },
        beetsPoolLoadReliquarySnapshotsForAllFarms: async (parent, args, context) => {
            isAdminRoute(context);

            await poolService.loadReliquarySnapshotsForAllFarms();

            return 'success';
        },
    },
};

export default beetsResolvers;
