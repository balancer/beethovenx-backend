import { EnvType, load } from 'ts-dotenv';
import { resolve } from 'path';

type Env = EnvType<typeof schema>;

export const schema = {
    PORT: Number,
    NODE_ENV: String,
    DEFAULT_CHAIN_ID: String,
    DEPLOYMENT_ENV: String,
    ADMIN_API_KEY: String,
    SANITY_API_TOKEN: String,
    SENTRY_DSN: String,
    SENTRY_AUTH_TOKEN: String,
    SENTRY_TRACES_SAMPLE_RATE: {
        optional: true,
        type: String,
    },
    SENTRY_PROFILES_SAMPLE_RATE: {
        optional: true,
        type: String,
    },
    AWS_REGION: String,
    PROTOCOL: {
        optional: true,
        type: String,
    },
    ALCHEMY_API_KEY: {
        optional: true,
        type: String,
    },
    DRPC_API_KEY: {
        optional: true,
        type: String,
    },
    DRPC_BEETS_API_KEY: {
        optional: true,
        type: String,
    },
    COINGECKO_API_KEY: {
        optional: true,
        type: String,
    },
    THEGRAPH_API_KEY_FANTOM: {
        optional: true,
        type: String,
    },
    THEGRAPH_API_KEY_BALANCER: {
        optional: true,
        type: String,
    },
    SATSUMA_API_KEY: {
        optional: true,
        type: String,
    },
    WORKER_QUEUE_URL: {
        optional: true,
        type: String,
    },
    DATABASE_URL: String,
};

export const env: Env = load(schema, {
    path: resolve(__dirname, `../../.env`),
    overrideProcessEnv: true,
});
