import { Resolvers } from '../../../../schema';
import { headerChain } from '../../../../modules/context/header-chain';
import { SanityContentService } from '../../../../modules/content/sanity-content.service';

const contentResolvers: Resolvers = {
    Query: {
        contentGetNewsItems: async (parent, { chain }, context) => {
            const currentChain = headerChain();
            if (!chain && currentChain) {
                chain = currentChain;
            } else if (!chain) {
                throw new Error('contentGetNewsItems error: Provide "chain" param');
            }
            const sanityContent = new SanityContentService();
            return sanityContent.getNewsItems(chain);
        },
    },
};

export default contentResolvers;
