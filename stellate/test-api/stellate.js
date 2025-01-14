/**
 * @type {import('stellate').Config}
 */
const config = {
    config: {
        schema: 'https://test-api-v3.balancer.fi/graphql',
        enablePlayground: true,
        queryDepthLimit: 10,
        scopes: {
            CHAIN: 'header:chainid',
            AUTHENTICATED: 'header:accountaddress',
            AUTHENTICATED_CHAIN: 'header:accountaddress|header:chainid',
        },
        rootTypeNames: {
            query: 'Query',
            mutation: 'Mutation',
        },
        rules: [
            {
                types: ['Query'],
                maxAge: 15,
                swr: 30,
                scope: 'CHAIN',
                description: 'Cache everything (default)',
            },
            {
                types: {
                    Query: [
                        'userGetSwaps',
                        'userGetStaking',
                        'userGetPoolBalances',
                        'userGetFbeetsBalance',
                        'userGetPoolJoinExits',
                    ],
                },
                maxAge: 10,
                swr: 15,
                scope: 'AUTHENTICATED_CHAIN',
                description: 'Time critical user queries',
            },
            {
                types: {
                    Query: ['latestSyncedBlocks'],
                },
                maxAge: 2,
                swr: 10,
                scope: 'CHAIN',
                description: 'Time critical block data',
            },
            {
                types: {
                    Query: [
                        'tokenGetTokens',
                        'contentGetNewsItems',
                        'protocolMetricsChain',
                        'poolGetFeaturedPoolGroups',
                        'protocolMetricsAggregated',
                    ],
                },
                maxAge: 60,
                swr: 120,
                scope: 'CHAIN',
                description: 'Mostly static, cache for a long time',
            },
        ],
        name: 'test-api-v3',
        originUrl: 'https://test-api-v3-origin.balancer.fi/graphql',
    },
};

export default config;
