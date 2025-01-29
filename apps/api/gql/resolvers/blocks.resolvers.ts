import { Resolvers } from '../generated-schema';
import { chainIdToChain } from '../../../../modules/network/chain-id-to-chain';
import { blockNumbers } from '../../../../modules/block-numbers';
import { GraphQLError } from 'graphql';
import { env } from '../../../env';

const balancerResolvers: Resolvers = {
    Query: {
        blocksGetAverageBlockTime: async (parent, {}, context) => {
            const chainId = context.chainId || env.DEFAULT_CHAIN_ID;
            const chain = chainIdToChain[chainId];

            const service = blockNumbers();
            const blocksPerDay = await service.getBlocksPerDay(chain);
            return 86400 / blocksPerDay;
        },
        blocksGetBlocksPerSecond: async (parent, {}, context) => {
            const chainId = context.chainId || env.DEFAULT_CHAIN_ID;
            const chain = chainIdToChain[chainId];

            const service = blockNumbers();
            const blocksPerDay = await service.getBlocksPerDay(chain);
            return blocksPerDay / 86400;
        },
        blocksGetBlocksPerDay: async (parent, {}, context) => {
            const chainId = context.chainId || env.DEFAULT_CHAIN_ID;
            const chain = chainIdToChain[chainId];

            const service = blockNumbers();
            const blocksPerDay = await service.getBlocksPerDay(chain);
            return blocksPerDay;
        },
        blocksGetBlocksPerYear: async (parent, {}, context) => {
            const chainId = context.chainId || env.DEFAULT_CHAIN_ID;
            const chain = chainIdToChain[chainId];

            const service = blockNumbers();
            const blocksPerDay = await service.getBlocksPerDay(chain);
            return blocksPerDay * 365;
        },
    },
};

export default balancerResolvers;
