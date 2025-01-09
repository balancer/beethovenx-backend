import * as Sentry from '@sentry/node';
import { env } from '../env';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { ApolloError } from 'apollo-server-express';
import { ResolverContext } from './gql/resolver-context';

// Ensure to call this before importing any other modules!
export const initApiSentry = () => {
    Sentry.init({
        dsn: env.SENTRY_DSN,
        environment: `api-${env.DEPLOYMENT_ENV}`,
        enabled: env.NODE_ENV === 'production',
        ignoreErrors: [/.*error: Provide.*chain.*param/],
        integrations: [
            Sentry.captureConsoleIntegration({
                levels: ['error', 'warn'],
            }),
        ],

        // Add Tracing by setting tracesSampleRate
        // We recommend adjusting this value in production
        tracesSampleRate: 0,

        // Set sampling rate for profiling
        // This is relative to tracesSampleRate
        profilesSampleRate: 0,

        beforeSend(event, hint) {
            const error = hint.originalException;
            if (error?.toString().includes('Unknown token:')) {
                console.log(`The following error occurred but was not sent to Sentry: ${error}`);
                return null;
            }
            if (
                error?.toString().includes('SOR: invalid swap amount input') &&
                event.request?.headers &&
                event.request.headers['user-agent'].includes('Python')
            ) {
                console.log(`The following error occurred but was not sent to Sentry: ${error}`);
                return null;
            }
            if (error?.toString().includes('No potential swap paths provided')) {
                console.log(`The following error occurred but was not sent to Sentry: ${error}`);
                return null;
            }
            if (error?.toString().includes('Variable "$chains" of required type "[GqlChain!]!" was not provided')) {
                console.log(`The following error occurred but was not sent to Sentry: ${error}`);
                return null;
            }

            return event;
        },
    });
};

// Ref: https://blog.sentry.io/handling-graphql-errors-using-sentry/
export const apolloSentryPlugin: ApolloServerPlugin<ResolverContext> = {
    async requestDidStart({ request, context }) {
        return {
            // This will send any errors captured by Apollo Server to Sentry
            async didEncounterErrors(ctx) {
                for (const err of ctx.errors) {
                    // Only report internal server errors,
                    // all errors extending ApolloError should be user-facing
                    if (err instanceof ApolloError) {
                        continue;
                    }

                    // Ignore specific errors
                    if (err.message === 'SOR queryBatchSwap failed') {
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

                    Sentry.captureException(err);
                }
            },
            async willSendResponse({ context }) {},
        };
    },
};
