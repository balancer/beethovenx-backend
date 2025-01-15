import { GqlLatestSyncedBlocks, Resolvers } from '../generated-schema';
import { protocolService } from '../../../../modules/protocol/protocol.service';
import { networkContext } from '../../../../modules/network/network-context.service';
import { headerChain } from '../../../../modules/context/header-chain';
import { GraphQLError } from 'graphql';

const protocolResolvers: Resolvers = {
    Query: {
        protocolMetricsChain: async (parent, { chain }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            return protocolService.getMetrics(chain);
        },
        protocolMetricsAggregated: async (parent, { chains }, context) => {
            const currentChain = headerChain();
            if (!chains && currentChain) {
                chains = [currentChain];
            } else if (!chains) {
                throw new GraphQLError('Provide "chains" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
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
