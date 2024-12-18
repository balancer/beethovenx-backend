import { Resolvers } from '../../../../schema';
import { StakedSonicController } from '../../../../modules/controllers';

const resolvers: Resolvers = {
    Query: {
        stsGetGqlStakedSonicData: async (parent, {}, context) => {
            return StakedSonicController().getStakingData();
        },
    },
};

export default resolvers;
