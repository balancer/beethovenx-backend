import { Resolvers } from '../generated-schema';
import { headerChain } from '../../../../modules/context/header-chain';
import { SanityContentService } from '../../../../modules/content/sanity-content.service';
import { GraphQLError } from 'graphql';

const contentResolvers: Resolvers = {
    Query: {
        contentGetNewsItems: async (parent, { chain }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new GraphQLError('Provide "chain" param', {
                    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
                });
            }
            const sanityContent = new SanityContentService();
            return sanityContent.getNewsItems(chain);
        },
    },
};

export default contentResolvers;
