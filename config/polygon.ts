import { env } from '../apps/env';
import { DeploymentEnv, NetworkData } from '../modules/network/network-config-types';

export default <NetworkData>{
    chain: {
        slug: 'polygon',
        id: 137,
        nativeAssetAddress: '0x0000000000000000000000000000000000001010',
        wrappedNativeAssetAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        prismaId: 'POLYGON',
        gqlId: 'POLYGON',
    },
    subgraphs: {
        startDate: '2021-06-16',
        balancer: [
            `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmUqS6BAVQgvstEsVrxuwsu1DwQdfAdj3Q6gz2j3DbUYQ9`,
        ],
        beetsBar: 'https://',
        blocks: 'https://api.studio.thegraph.com/query/48427/polygon-blocks/version/latest',
        gauge: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmewSgLJf9TZt8trr61dECJhEGGyHxKFWbNQ3AnNZAdYyU`,
        aura: 'https://data.aura.finance/graphql',
    },
    eth: {
        address: '0x0000000000000000000000000000000000001010',
        addressFormatted: '0x0000000000000000000000000000000000001010',
        symbol: 'POL',
        name: 'Polygon Token',
    },
    weth: {
        address: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        addressFormatted: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    },
    coingecko: {
        nativeAssetId: 'matic',
        platformId: 'polygon-pos',
        excludedTokenAddresses: [],
    },
    rpcUrl: env.DRPC_API_KEY
        ? `https://lb.drpc.org/ogrpc?network=polygon&dkey=${env.DRPC_API_KEY}`
        : 'https://1rpc.io/matic',
    rpcMaxBlockRange: 2000,
    protocolToken: 'bal',
    bal: {
        address: '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3',
    },
    veBal: {
        address: '0xc128a9954e6c874ea3d62ce62b468ba073093f25',
        bptAddress: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
        delegationProxy: '0x0f08eef2c785aa5e7539684af04755dec1347b7c',
    },
    gyro: {
        config: '0xfdc2e9e03f515804744a40d0f8d25c16e93fbe67',
    },
    balancer: {
        v2: {
            vaultAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.5',
            balancerQueriesAddress: '0xe39b5e3b6d74016b2f6a9673d7d7493b6df549d5',
        },
        v3: {
            vaultAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            routerAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.5',
        },
    },
    multicall: '0x275617327c958bd06b5d6b871e7f491d76113dd8',
    multicall3: '0xca11bde05977b3631167028862be2a173976ca11',
    avgBlockSpeed: 1,
    ybAprConfig: {
        aave: {
            v2: {
                subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/subgraphs/id/H1Et77RZh3XEf27vkAmJyzgCME2RSFLtDS2f4PPW6CGp`,
                tokens: {
                    USDC: {
                        underlyingAssetAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
                        aTokenAddress: '0x1a13f4ca1d028320a707d99520abfefca3998b7f',
                        wrappedTokens: {
                            waUSDC: '0x221836a597948dce8f3568e044ff123108acc42a',
                        },
                    },
                    USDT: {
                        underlyingAssetAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
                        aTokenAddress: '0x60d55f02a771d515e077c9c2403a1ef324885cec',
                        wrappedTokens: {
                            waUSDT: '0x19c60a251e525fa88cd6f3768416a8024e98fc19',
                        },
                    },
                    DAI: {
                        underlyingAssetAddress: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
                        aTokenAddress: '0x27f8d03b3a2196956ed754badc28d73be8830a6e',
                        wrappedTokens: {
                            waDAI: '0xee029120c72b0607344f35b17cdd90025e647b00',
                        },
                    },
                },
            },
            v3: {
                subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/subgraphs/id/Co2URyXjnxaw8WqxKyVHdirq9Ahhm5vcTs4dMedAq211`,
                tokens: {
                    USDCn: {
                        underlyingAssetAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
                        aTokenAddress: '0xa4d94019934d8333ef880abffbf2fdd611c762bd',
                        wrappedTokens: {
                            stataPolUSDCn: '0x2dca80061632f3f87c9ca28364d1d0c30cd79a19',
                        },
                    },
                    USDC: {
                        underlyingAssetAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
                        aTokenAddress: '0x625e7708f30ca75bfd92586e17077590c60eb4cd',
                        wrappedTokens: {
                            waUSDC: '0xac69e38ed4298490906a3f8d84aefe883f3e86b5',
                            stataPolUSDC: '0xc04296aa4534f5a3bab2d948705bc89317b2f1ed',
                        },
                    },
                    USDT: {
                        underlyingAssetAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
                        aTokenAddress: '0x6ab707aca953edaefbc4fd23ba73294241490620',
                        wrappedTokens: {
                            stataPolUSDT: '0x31f5ac91804a4c0b54c0243789df5208993235a1',
                            stataPolUSDT2: '0x87a1fdc4c726c459f597282be639a045062c0e46',
                        },
                    },
                    DAI: {
                        underlyingAssetAddress: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
                        aTokenAddress: '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee',
                        wrappedTokens: {
                            waDAI: '0xdb6df721a6e7fdb97363079b01f107860ac156f9',
                            stataPolDAI: '0xfcf5d4b313e06bb3628eb4fe73320e94039dc4b7',
                        },
                    },
                    wETH: {
                        underlyingAssetAddress: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
                        aTokenAddress: '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8',
                        wrappedTokens: {
                            waWETH: '0xa5bbf0f46b9dc8a43147862ba35c8134eb45f1f5',
                            stataPolWETH: '0xd08b78b11df105d2861568959fca28e30c91cf68',
                        },
                    },
                    wMATIC: {
                        underlyingAssetAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
                        aTokenAddress: '0x6d80113e533a2c0fe82eabd35f1875dcea89ea97',
                        wrappedTokens: {
                            waWMATIC: '0x0d6135b2cfbae3b1c58368a93b855fa54fa5aae1',
                            stataPolWMATIC: '0x6f3913333f2d4b7b01d17bedbce1e4c758b94465',
                        },
                    },
                },
            },
        },
        tetu: {
            sourceUrl: 'https://api.tetu.io/api/v1/reader/compoundAPRs?network=MATIC',
            tokens: {
                tUSDC: { address: '0x113f3d54c31ebc71510fd664c8303b34fbc2b355' },
                tUSDT: { address: '0x236975da9f0761e9cf3c2b0f705d705e22829886' },
                tDAI: { address: '0xace2ac58e1e5a7bfe274916c4d82914d490ed4a5' },
                tetuStQI: { address: '0x4cd44ced63d9a6fef595f6ad3f7ced13fceac768' },
            },
        },
        defaultHandlers: {
            wstETH: {
                tokenAddress: '0x03b54a6e9a984069379fae1a4fc4dbae93b3bccd',
                sourceUrl: 'https://eth-api.lido.fi/v1/protocol/steth/apr/sma',
                path: 'data.smaApr',
                isIbYield: true,
            },
            stMATIC: {
                tokenAddress: '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4',
                sourceUrl: 'https://polygon.lido.fi/api/stats',
                path: 'apr',
                isIbYield: true,
            },
            MATICX: {
                tokenAddress: '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
                sourceUrl: 'https://universe.staderlabs.com/polygon/apy',
                path: 'value',
                isIbYield: true,
            },
            wbETH: {
                tokenAddress: '0xa2e3356610840701bdf5611a53974510ae27e2e1',
                sourceUrl:
                    'https://www.binance.com/bapi/earn/v1/public/pos/cftoken/project/rewardRateList?projectId=BETH',
                path: 'data.0.rewardRate',
                isIbYield: true,
            },
            truMATIC: {
                tokenAddress: '0xf33687811f3ad0cd6b48dd4b39f9f977bd7165a2',
                sourceUrl: 'https://api.trufin.io/staker/apy?staker=MATIC',
                path: 'apy',
                scale: 100,
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
