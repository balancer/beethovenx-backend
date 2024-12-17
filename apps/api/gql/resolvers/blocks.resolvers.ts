import { Resolvers } from '../../../../schema';
import { isAdminRoute } from '../../../../modules/auth/auth-context';
import { blocksSubgraphService } from '../../../../modules/subgraphs/blocks-subgraph/blocks-subgraph.service';

const balancerResolvers: Resolvers = {
    Query: {
        blocksGetAverageBlockTime: async (parent, {}, context) => {
            return blocksSubgraphService.getAverageBlockTime();
        },
        blocksGetBlocksPerSecond: async (parent, {}, context) => {
            const avgBlockTime = await blocksSubgraphService.getAverageBlockTime();
            return 1 / avgBlockTime;
        },
        blocksGetBlocksPerDay: async (parent, {}, context) => {
            return blocksSubgraphService.getBlocksPerDay();
        },
        blocksGetBlocksPerYear: async (parent, {}, context) => {
            return blocksSubgraphService.getBlocksPerYear();
        },
    },
    Mutation: {
        cacheAverageBlockTime: async (parent, {}, context) => {
            isAdminRoute(context);

            await blocksSubgraphService.cacheAverageBlockTime();

            return 'success';
        },
    },
};

export default balancerResolvers;
