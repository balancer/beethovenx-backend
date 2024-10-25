import { env } from '../apps/env';
import { DeploymentEnv, NetworkData } from '../modules/network/network-config-types';

export default <NetworkData>{
    chain: {
        slug: 'gnosis',
        id: 100,
        nativeAssetAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        wrappedNativeAssetAddress: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
        prismaId: 'GNOSIS',
        gqlId: 'GNOSIS',
    },
    subgraphs: {
        startDate: '2021-08-23',
        balancer: [
            `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmXXSKeLh14DnJgR1ncHhAHciqacfRshcHKXasAGy7LP4Y`,
        ],
        beetsBar: 'https://',
        blocks: 'https://api.studio.thegraph.com/query/48427/gnosis-blocks/version/latest',
        gauge: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/Qme9hQY1NZ8ReVDSSQb893s2fGpeLkgfwXd3YU5rndACaP`,
        aura: 'https://data.aura.finance/graphql',
        cowAmm: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/Qmb9jmxb2EVWHk7NryKCAbsq2WAZaCV4CmnZne59EbADeh`,
    },
    eth: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        addressFormatted: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        symbol: 'xDAI',
        name: 'xDAI',
    },
    weth: {
        address: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
        addressFormatted: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    },
    coingecko: {
        nativeAssetId: 'xdai',
        platformId: 'xdai',
        excludedTokenAddresses: [],
    },
    rpcUrl: env.DRPC_API_KEY
        ? `https://lb.drpc.org/ogrpc?network=gnosis&dkey=${env.DRPC_API_KEY}`
        : 'https://gnosis.drpc.org',
    rpcMaxBlockRange: 2000,
    protocolToken: 'bal',
    bal: {
        address: '0x7ef541e2a22058048904fe5744f9c7e4c57af717',
    },
    veBal: {
        address: '0xc128a9954e6c874ea3d62ce62b468ba073093f25',
        bptAddress: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
        delegationProxy: '0x7a2535f5fb47b8e44c02ef5d9990588313fe8f05',
    },
    balancer: {
        v2: {
            vaultAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.5',
            balancerQueriesAddress: '0x0f3e0c4218b7b0108a3643cfe9d3ec0d4f57c54e',
        },
        v3: {
            vaultAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            routerAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.5',
        },
    },
    multicall: '0xbb6fab6b627947dae0a75808250d8b2652952cb5',
    multicall3: '0xca11bde05977b3631167028862be2a173976ca11',
    avgBlockSpeed: 1,
    ybAprConfig: {
        stakewise: {
            url: 'https://gnosis-graph.stakewise.io/subgraphs/name/stakewise/stakewise',
            token: '0xf490c80aae5f2616d3e3bda2483e30c4cb21d1a0',
        },
        defaultHandlers: {
            wstETH: {
                tokenAddress: '0x6c76971f98945ae98dd7d4dfca8711ebea946ea6',
                sourceUrl: 'https://eth-api.lido.fi/v1/protocol/steth/apr/sma',
                path: 'data.smaApr',
                isIbYield: true,
            },
            rETH: {
                tokenAddress: '0xc791240d1f2def5938e2031364ff4ed887133c3d',
                sourceUrl: 'https://api.rocketpool.net/mainnet/reth/apr',
                path: 'yearlyAPR',
                isIbYield: true,
            },
        },
        aave: {
            v3: {
                subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/subgraphs/id/HtcDaL8L8iZ2KQNNS44EBVmLruzxuNAz1RkBYdui1QUT`,
                tokens: {
                    USDC: {
                        underlyingAssetAddress: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
                        aTokenAddress: '0xc6b7aca6de8a6044e0e32d0c841a89244a10d284',
                        wrappedTokens: {
                            stataGnoUSDC: '0x270ba1f35d8b87510d24f693fccc0da02e6e4eeb',
                        },
                    },
                    USDCn: {
                        underlyingAssetAddress: '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0',
                        aTokenAddress: '0xc0333cb85b59a788d8c7cae5e1fd6e229a3e5a65',
                        wrappedTokens: {
                            stataGnoUSDCe: '0xf0e7ec247b918311afa054e0aedb99d74c31b809',
                        },
                    },
                },
            },
        },
    },
    gyro: {
        config: '0x00a2a9bbd352ab46274433faa9fec35fe3abb4a8',
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
