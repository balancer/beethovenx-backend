import { Resolvers } from '../generated-schema';
import { SftmxController } from '../../../../modules/controllers';

const resolvers: Resolvers = {
    Query: {
        sftmxGetWithdrawalRequests: async (parent, { user }, context) => {
            return SftmxController().getWithdrawalRequests(user);
        },
        sftmxGetStakingData: async (parent, {}, context) => {
            return SftmxController().getStakingData();
        },
        sftmxGetStakingSnapshots: async (parent, { range }, context) => {
            return SftmxController().getStakingSnapshots(range);
        },
    },
};

export default resolvers;
