import { captureException } from '@sentry/node';
import { ApolloServerPlugin } from '@apollo/server';
import { ResolverContext } from '../gql/resolver-context';

export const apolloSentryPlugin: ApolloServerPlugin<ResolverContext> = {
    async requestDidStart({ request }) {
        return {
            // This will send any errors captured by Apollo Server to Sentry
            async didEncounterErrors(ctx) {
                for (const err of ctx.errors) {
                    // Ignore syntax errors
                    if (
                        [
                            'GRAPHQL_PARSE_FAILED',
                            'GRAPHQL_VALIDATION_FAILED',
                            'BAD_USER_INPUT',
                            'ACCOUNT_ADDRESS_REQUIRED',
                            'ACCESS_DENIED',
                            'NOT_FOUND',
                        ].includes(err.extensions?.code as string)
                    ) {
                        continue;
                    }

                    // Ignore specific errors
                    if (err.message && err.message === 'SOR queryBatchSwap failed') {
                        continue;
                    }

                    // Potentially set transaction name to the operation name,
                    // add tags and fingerprint to group errors

                    // Sentry.withScope((scope) => {
                    //     let name = request.operationName;
                    //     if (!name) {
                    //         name = request.query
                    //             ?.substring(
                    //                 request.query?.indexOf('{') + 1,
                    //                 request.query?.indexOf('(') || request.query?.length,
                    //             )
                    //             .replace(/\n/g, '')
                    //             .replace(/\s/g, '');
                    //     }
                    //     scope.setTransactionName(`POST /graphql ${name}`);
                    //     Sentry.captureException(err);
                    // });

                    captureException(err);
                }
            },
            async willSendResponse({}) {},
        };
    },
};
