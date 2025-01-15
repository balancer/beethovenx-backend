import { Resolvers } from '../generated-schema';
import { StakedSonicController } from '../../../../modules/controllers';

const resolvers: Resolvers = {
    Query: {
        stsGetGqlStakedSonicData: async (parent, {}, context) => {
            return StakedSonicController().getStakingData();
        },
        stsGetStakedSonicSnapshots: async (parent, { range }, context) => {
            return StakedSonicController().getStakingSnapshots(range);
        },
    },
};

export default resolvers;
