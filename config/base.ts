import { env } from '../apps/env';
import { DeploymentEnv, NetworkData } from '../modules/network/network-config-types';

export default <NetworkData>{
    chain: {
        slug: 'base',
        id: 8453,
        nativeAssetAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        wrappedNativeAssetAddress: '0x4200000000000000000000000000000000000006',
        prismaId: 'BASE',
        gqlId: 'BASE',
    },
    subgraphs: {
        startDate: '2023-07-10',
        balancer: [
            `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmRKBwBwPKtFz4mQp5jvH44USVprM4C77Nr4m77UGCbGv9`,
        ],
        beetsBar: '',
        blocks: 'https://api.studio.thegraph.com/query/48427/bleu-base-blocks/version/latest',
        gauge: `https://api.studio.thegraph.com/query/24660/balancer-gauges-base/version/latest`,
        aura: 'https://data.aura.finance/graphql',
    },
    eth: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        addressFormatted: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        symbol: 'ETH',
        name: 'Ether',
    },
    weth: {
        address: '0x4200000000000000000000000000000000000006',
        addressFormatted: '0x4200000000000000000000000000000000000006',
    },
    coingecko: {
        nativeAssetId: 'ethereum',
        platformId: 'base',
        excludedTokenAddresses: [],
    },
    rpcUrl: env.DRPC_API_KEY
        ? `https://lb.drpc.org/ogrpc?network=base&dkey=${env.DRPC_API_KEY}`
        : 'https://base.gateway.tenderly.co/7mM7DbBouY1JjnQd9MMDsd',
    rpcMaxBlockRange: 500,
    protocolToken: 'bal',
    bal: {
        address: '0x4158734d47fc9692176b5085e0f52ee0da5d47f1',
    },
    veBal: {
        address: '0xc128a9954e6c874ea3d62ce62b468ba073093f25',
        bptAddress: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
        delegationProxy: '0xd87f44df0159dc78029ab9ca7d7e57e7249f5acd',
    },
    balancer: {
        v2: {
            vaultAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.5',
            balancerQueriesAddress: '0x300ab2038eac391f26d9f895dc61f8f66a548833',
        },
        v3: {
            vaultAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            routerAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.5',
        },
    },
    ybAprConfig: {
        defaultHandlers: {
            cbETH: {
                tokenAddress: '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22',
                sourceUrl: 'https://api.exchange.coinbase.com/wrapped-assets/CBETH/',
                path: 'apy',
                scale: 1,
                isIbYield: true,
            },
        },
        maker: {
            sdai: '0x99ac4484e8a1dbd6a185380b3a811913ac884d87',
        },
        aave: {
            v3: {
                subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/subgraphs/id/GQFbb95cE6d8mV989mL5figjaGaKCQB3xqYrr1bRyXqF`,
                tokens: {
                    USDC: {
                        underlyingAssetAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
                        aTokenAddress: '0x4e65fe4dba92790696d040ac24aa414708f5c0ab',
                        wrappedTokens: {
                            stataBasUSDC: '0x4ea71a20e655794051d1ee8b6e4a3269b13ccacc',
                        },
                    },
                },
            },
        },
    },
    multicall: '0xca11bde05977b3631167028862be2a173976ca11',
    multicall3: '0xca11bde05977b3631167028862be2a173976ca11',
    avgBlockSpeed: 2,
    monitoring: {
        main: {
            alarmTopicArn: 'arn:aws:sns:ca-central-1:118697801881:api_alarms',
        },
        canary: {
            alarmTopicArn: 'arn:aws:sns:eu-central-1:118697801881:api_alarms',
        },
    },
    datastudio: {
        main: {
            user: 'datafeed-service@datastudio-366113.iam.gserviceaccount.com',
            sheetId: '11anHUEb9snGwvB-errb5HvO8TvoLTRJhkDdD80Gxw1Q',
            databaseTabName: 'Database v2',
            compositionTabName: 'Pool Composition v2',
            emissionDataTabName: 'EmissionData',
        },
        canary: {
            user: 'datafeed-service@datastudio-366113.iam.gserviceaccount.com',
            sheetId: '1HnJOuRQXGy06tNgqjYMzQNIsaCSCC01Yxe_lZhXBDpY',
            databaseTabName: 'Database v2',
            compositionTabName: 'Pool Composition v2',
            emissionDataTabName: 'EmissionData',
        },
    },
};
