import { Resolvers } from '../generated-schema';
import { sorService } from '../../../../modules/sor/sor.service';
import { headerChain } from '../../../../modules/context/header-chain';
import { GraphQLError } from 'graphql';

const balancerSdkResolvers: Resolvers = {
    Query: {
        sorGetSwaps: async (parent, args, context) => {
            const currentChain = headerChain();
            if (!args.chain && currentChain) {
                args.chain = currentChain;
            } else if (!args.chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }

            return sorService.getSorSwaps(args);
        },
        sorGetSwapPaths: async (parent, args, context) => {
            return sorService.getSorSwapPaths(args);
        },
    },
};

export default balancerSdkResolvers;
