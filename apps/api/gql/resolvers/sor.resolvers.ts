import { Resolvers } from '../../../../schema';
import { sorService } from '../../../../modules/sor/sor.service';
import { headerChain } from '../../../../modules/context/header-chain';

const balancerSdkResolvers: Resolvers = {
    Query: {
        sorGetSwaps: async (parent, args, context) => {
            const currentChain = headerChain();
            if (!args.chain && currentChain) {
                args.chain = currentChain;
            } else if (!args.chain) {
                throw new Error('sorGetSwaps error: Provide "chain" param');
            }

            return sorService.getSorSwaps(args);
        },
        sorGetSwapPaths: async (parent, args, context) => {
            return sorService.getSorSwapPaths(args);
        },
    },
};

export default balancerSdkResolvers;
