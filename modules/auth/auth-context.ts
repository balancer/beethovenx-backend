import { env } from '../../apps/env';
import { ResolverContext } from '../../apps/api/gql/resolver-context';
import { GraphQLError } from 'graphql';

export function getRequiredAccountAddress(context: ResolverContext) {
    if (!context?.accountAddress) {
        throw new GraphQLError('Account address is required', {
            extensions: {
                code: 'ACCOUNT_ADDRESS_REQUIRED',
            },
        });
    }

    return context.accountAddress;
}

export function isAdminRoute(context: ResolverContext) {
    if (!context?.adminApiKey || context.adminApiKey !== env.ADMIN_API_KEY) {
        throw new GraphQLError('Missing or invalid admin api key', {
            extensions: {
                code: 'ACCESS_DENIED',
            },
        });
    }
}
