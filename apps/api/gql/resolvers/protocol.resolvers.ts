import { GqlLatestSyncedBlocks, Resolvers } from '../../../../schema';
import { protocolService } from '../../../../modules/protocol/protocol.service';
import { networkContext } from '../../../../modules/network/network-context.service';
import { headerChain } from '../../../../modules/context/header-chain';

const protocolResolvers: Resolvers = {
    Query: {
        protocolMetricsChain: async (parent, { chain }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new Error('poolGetPool error: Provide "chain" param');
            }
            return protocolService.getMetrics(chain);
        },
        protocolMetricsAggregated: async (parent, { chains }, context) => {
            const currentChain = headerChain();
            if (!chains && currentChain) {
                chains = [currentChain];
            } else if (!chains) {
                throw new Error('tokenGetTokens error: Provide "chains" param');
            }
            return protocolService.getAggregatedMetrics(chains);
        },
        latestSyncedBlocks: async (): Promise<GqlLatestSyncedBlocks> => {
            return protocolService.getLatestSyncedBlocks();
        },
    },
    Mutation: {
        protocolCacheMetrics: async (): Promise<string> => {
            await protocolService.cacheProtocolMetrics(networkContext.chain);
            return 'success';
        },
    },
};

export default protocolResolvers;
