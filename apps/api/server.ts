import './sentry';
import * as Sentry from '@sentry/node';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import helmet from 'helmet';
import * as http from 'http';
import { env } from '../env';
import { loadRestRoutes } from './rest-routes';
import { corsMiddleware, lowerCaseMiddleware, sessionMiddleware } from './middleware';
import {
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageGraphQLPlayground,
    ApolloServerPluginUsageReporting,
} from 'apollo-server-core';
import { schema } from '../../graphql_schema_generated';
import { resolvers } from './gql/resolvers';
import { resolverContext } from './gql/resolver-context';
import { apolloSentryPlugin } from './sentry';

const configureHelmet = (app: express.Express) => {
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.expectCt());
    app.use(helmet.frameguard());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.originAgentCluster());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter());
};

const configureMiddlewares = (app: express.Express) => {
    app.use(corsMiddleware);
    app.use(sessionMiddleware);
    app.use(lowerCaseMiddleware);
};

const configureApolloServer = async (httpServer: http.Server) => {
    const plugins = [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ApolloServerPluginLandingPageGraphQLPlayground({
            settings: { 'schema.polling.interval': 20000 },
        }),
        apolloSentryPlugin,
    ];

    if (process.env.APOLLO_SCHEMA_REPORTING === 'true') {
        plugins.push(
            ApolloServerPluginUsageReporting({
                sendVariableValues: { all: true },
                sendHeaders: { all: true },
            }),
        );
    }

    const server = new ApolloServer({
        resolvers,
        typeDefs: schema,
        introspection: true,
        plugins,
        context: ({ req }) => resolverContext(req),
    });

    await server.start();
    return server;
};

export const startApiServer = async () => {
    const app = express();

    loadRestRoutes(app);
    Sentry.setupExpressErrorHandler(app);
    configureHelmet(app);
    configureMiddlewares(app);

    const httpServer = http.createServer(app);
    const apolloServer = await configureApolloServer(httpServer);

    apolloServer.applyMiddleware({ app });

    await new Promise<void>((resolve) => httpServer.listen({ port: env.PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${env.PORT}${apolloServer.graphqlPath}`);
};
