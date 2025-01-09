import { env } from '../apps/env';
import { DeploymentEnv, NetworkData } from '../modules/network/network-config-types';

export default <NetworkData>{
    chain: {
        slug: 'zkevm',
        id: 1101,
        nativeAssetAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        wrappedNativeAssetAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        prismaId: 'ZKEVM',
        gqlId: 'ZKEVM',
    },
    subgraphs: {
        startDate: '2023-05-17',
        balancer: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmVNcphdNjTCaJ4ammPtFzRyD4gmyNBomKcVFZ98RADpS1`,
        blocks: `https://gateway.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/subgraphs/id/EPWJiod7hQ7yy4QhXihL9ssw82NosmRnu8txcf5D9Duo`,
        gauge: `https://api.studio.thegraph.com/query/24660/balancer-gauges-polygon-zk/version/latest`,
        aura: 'https://data.aura.finance/graphql',
    },
    eth: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        addressFormatted: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        symbol: 'ETH',
        name: 'Ether',
    },
    weth: {
        address: '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9',
        addressFormatted: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
    },
    coingecko: {
        nativeAssetId: 'ethereum',
        platformId: 'polygon-zkevm',
        excludedTokenAddresses: [],
    },
    rpcUrl: env.DRPC_API_KEY
        ? `https://lb.drpc.org/ogrpc?network=polygon-zkevm&dkey=${env.DRPC_API_KEY}`
        : 'https://zkevm-rpc.com',
    rpcMaxBlockRange: 2000,
    protocolToken: 'bal',
    bal: {
        address: '0x120ef59b80774f02211563834d8e3b72cb1649d6',
    },
    veBal: {
        address: '0xc128a9954e6c874ea3d62ce62b468ba073093f25',
        bptAddress: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
        delegationProxy: '0xc7e5ed1054a24ef31d827e6f86caa58b3bc168d7',
    },
    balancer: {
        v2: {
            vaultAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.5',
            balancerQueriesAddress: '0x809b79b53f18e9bc08a961ed4678b901ac93213a',
        },
        v3: {
            vaultAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            routerAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.5',
        },
    },
    multicall: '0xca11bde05977b3631167028862be2a173976ca11',
    multicall3: '0xca11bde05977b3631167028862be2a173976ca11',
    masterchef: {
        address: '0x0000000000000000000000000000000000000000',
        excludedFarmIds: [],
    },
    avgBlockSpeed: 1,
    ybAprConfig: {
        ovix: {
            tokens: {
                USDT: {
                    yieldAddress: '0xad41c77d99e282267c1492cdefe528d7d5044253',
                    wrappedAddress: '0x550d3bb1f77f97e4debb45d4f817d7b9f9a1affb',
                },
                USDC: {
                    yieldAddress: '0x68d9baa40394da2e2c1ca05d30bf33f52823ee7b',
                    wrappedAddress: '0x3a6789fc7c05a83cfdff5d2f9428ad9868b4ff85',
                },
            },
        },
        defaultHandlers: {
            wstETH: {
                tokenAddress: '0x5d8cff95d7a57c0bf50b30b43c7cc0d52825d4a9',
                sourceUrl: 'https://eth-api.lido.fi/v1/protocol/steth/apr/sma',
                path: 'data.smaApr',
                isIbYield: true,
            },
            rETH: {
                tokenAddress: '0xb23c20efce6e24acca0cef9b7b7aa196b84ec942',
                sourceUrl: 'https://api.rocketpool.net/mainnet/reth/apr',
                path: 'yearlyAPR',
                isIbYield: true,
            },
            ankrETH: {
                tokenAddress: '0x12d8ce035c5de3ce39b1fdd4c1d5a745eaba3b8c',
                sourceUrl: 'https://api.staking.ankr.com/v1alpha/metrics',
                path: 'services.{serviceName == "eth"}.apy',
                isIbYield: true,
            },
            rsETH: {
                tokenAddress: '0x8c7d118b5c47a5bcbd47cc51789558b98dad17c5',
                sourceUrl: 'https://universe.kelpdao.xyz/rseth/apy',
                path: 'value',
                isIbYield: true,
            },
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
    monitoring: {
        main: {
            alarmTopicArn: 'arn:aws:sns:ca-central-1:118697801881:api_alarms',
        },
        canary: {
            alarmTopicArn: 'arn:aws:sns:eu-central-1:118697801881:api_alarms',
        },
    },
};
