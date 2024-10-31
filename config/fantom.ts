import { BigNumber } from 'ethers';
import { env } from '../apps/env';
import { DeploymentEnv, NetworkData } from '../modules/network/network-config-types';

export default <NetworkData>{
    chain: {
        slug: 'fantom',
        id: 250,
        nativeAssetAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        wrappedNativeAssetAddress: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
        prismaId: 'FANTOM',
        gqlId: 'FANTOM',
    },
    subgraphs: {
        startDate: '2021-10-08',
        balancer: [
            `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_FANTOM}/deployments/id/Qme9r1RTFZ6hEZ4ebPSmo3J81FNHhjeNZs5nBaSGTzb2hb`,
        ],
        beetsBar: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_FANTOM}/deployments/id/QmXcxzZioHXV5ts2UcG6gNNEayoaZ9ip7D9JvPS88K2HXe`,
        blocks: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_FANTOM}/subgraphs/id/3drjZDpA9hAuYGA19ttEkhW432mVe2XHy5YarBDVYHbz`,
        masterchef: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_FANTOM}/deployments/id/QmZQJu1rxMEDwzZb5TSqDXjcFiS1DN8BRKCLKRv6ifEBhA`,
        reliquary: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_FANTOM}/deployments/id/QmQB4iZpeX9eYgLUaiBt2HwkobqE3NzVUiupXF6Ha9Nzbk`,
        sftmx: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_FANTOM}/deployments/id/QmaD9zWMc6kQrBVbtjXNjNjbhpGWUHQFQdxABBEaVJqK5s`,
    },
    eth: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        addressFormatted: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        symbol: 'FTM',
        name: 'Fantom',
    },
    weth: {
        address: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
        addressFormatted: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    },
    coingecko: {
        nativeAssetId: 'fantom',
        platformId: 'fantom',
        excludedTokenAddresses: [
            '0x04068da6c83afcfa0e13ba15a6696662335d5b75', // multi usdc
            '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e', // multi usdt
            '0x049d68029688eabf473097a2fc38ef61633a3c7a', // multi dai
            '0x321162cd933e2be498cd2267a90534a804051b11', // multi wbtc
            '0x74b23882a30290451a17c44f4f05243b6b58c76d', // mutli weth
            '0xcfc785741dc0e98ad4c9f6394bb9d43cd1ef5179', // ankrftm
            '0xd67de0e0a0fd7b15dc8348bb9be742f3c5850454', // multi BNB
            '0x1e4f97b9f9f913c46f1632781732927b9019c68b', // multi CRV
            '0x511d35c52a3c244e7b8bd92c0c297755fbd89212', // multi AVAX
            '0x40df1ae6074c35047bff66675488aa2f9f6384f3', // multi matic
            '0x9fb9a33956351cf4fa040f65a13b835a3c8764e3', // multi multi
            '0xddcb3ffd12750b45d32e084887fdf1aabab34239', // multi any
            '0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8', // multi link
            '0x468003b688943977e6130f4f68f23aad939a1040', // multi spell
            '0x10010078a54396f62c96df8532dc2b4847d47ed3', // multi hnd
            '0x6a07a792ab2965c72a5b8088d3a069a7ac3a993b', // multi aave
            '0x95dd59343a893637be1c3228060ee6afbf6f0730', // multi luna
            '0xae75a438b2e0cb8bb01ec1e1e376de11d44477cc', // multi sushi
            '0xddc0385169797937066bbd8ef409b5b3c0dfeb52', // multi wmemo
            '0xb67fa6defce4042070eb1ae1511dcd6dcc6a532e', // multi alusd
            '0xfb98b335551a418cd0737375a2ea0ded62ea213b', // multi mai
            '0x68aa691a8819b07988b18923f712f3f4c8d36346', // multi qi
            '0x29b0da86e484e1c0029b56e817912d778ac0ec69', // multi yfi
            '0xd6070ae98b8069de6b494332d1a1a81b6179d960', // multi bifi
            '0xe2d27f06f63d98b8e11b38b5b08a75d0c8dd62b9', // multi ust
            '0x9879abdea01a879644185341f7af7d8343556b7a', // multi tusd
            '0x3129662808bec728a27ab6a6b9afd3cbaca8a43c', // multi dola
            '0x0615dbba33fe61a31c7ed131bda6655ed76748b1', // multi ankr
            '0xb7c2ddb1ebac1056231ef22c1b0a13988537a274', // new tarot
        ],
    },
    rpcUrl: env.DRPC_API_KEY
        ? `https://lb.drpc.org/ogrpc?network=fantom&dkey=${env.DRPC_API_KEY}`
        : `https://rpc.ankr.com/fantom`,
    rpcMaxBlockRange: 1000,
    protocolToken: 'beets',
    beets: {
        address: '0xf24bcf4d1e507740041c9cfd2dddb29585adce1e',
    },
    sftmx: {
        stakingContractAddress: '0xb458bfc855ab504a8a327720fcef98886065529b',
        sftmxAddress: '0xd7028092c830b5c8fce061af2e593413ebbc1fc1',
    },
    fbeets: {
        address: '0xfcef8a994209d6916eb2c86cdd2afd60aa6f54b1',
        farmId: '22',
        poolId: '0xcde5a11a4acb4ee4c805352cec57e236bdbc3837000200000000000000000019',
        poolAddress: '0xcde5a11a4acb4ee4c805352cec57e236bdbc3837',
    },
    balancer: {
        v2: {
            vaultAddress: '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce',
            defaultSwapFeePercentage: '0.25',
            defaultYieldFeePercentage: '0.25',
            balancerQueriesAddress: '0x1b0a42663df1edea171cd8732d288a81efff6d23',
        },
        v3: {
            vaultAddress: '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce',
            routerAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.25',
            defaultYieldFeePercentage: '0.25',
        },
    },
    multicall: '0x66335d7ad8011f6aa3f48aadcb523b62b38ed961',
    multicall3: '0xca11bde05977b3631167028862be2a173976ca11',
    masterchef: {
        address: '0x8166994d9ebbe5829ec86bd81258149b87facfd3',
        excludedFarmIds: [
            '34', //OHM bonding farm
            '28', //OHM bonding farm
            '9', //old fidellio dueto (non fbeets)
            '98', //reliquary beets streaming farm
        ],
    },
    reliquary: {
        address: '0x1ed6411670c709f4e163854654bd52c74e66d7ec',
        excludedFarmIds: [
            '0', // test with dummy token
            '1', // test with fresh beets pool BPT
        ],
    },
    avgBlockSpeed: 1,
    ybAprConfig: {
        sftmx: {
            tokens: {
                sftmx: {
                    address: '0xd7028092c830b5c8fce061af2e593413ebbc1fc1',
                    ftmStakingAddress: '0xb458bfc855ab504a8a327720fcef98886065529b',
                },
            },
        },
        reaper: {
            subgraphSource: {
                subgraphUrl: 'https://api.thegraph.com/subgraphs/name/byte-masons/multi-strategy-vaults-fantom',
                tokens: {
                    rfwBTC: {
                        address: '0xfa985463b7fa975d06cde703ec72efccf293c605',
                    },
                    rffUSDT: {
                        address: '0xaea55c0e84af6e5ef8c9b7042fb6ab682516214a',
                    },
                    rfWFTM: {
                        address: '0x963ffcd14d471e279245ee1570ad64ca78d8e67e',
                    },
                    rfWETH: {
                        address: '0xc052627bc73117d2cb3569f133419550156bdfa1',
                    },
                    rfDAI: {
                        address: '0x16e4399fa9ba6e58f12bf2d2bc35f8bde8a9a4ab',
                    },
                    rfUSDC: {
                        address: '0xd55c59da5872de866e39b1e3af2065330ea8acd6',
                    },
                    rfUSDCCrypt: {
                        // Not named as Multi-Strategy in the contract, but is multi-strategy
                        address: '0x4455aef4b5d8ffe3436184e8a1ec99607f9a4340',
                    },
                    rfWFTMCrypt: {
                        // Not named Multi-Strategy in the contract, but is multi-strategy
                        address: '0xe4a54b6a175cf3f6d7a5e8ab7544c3e6e364dbf9',
                    },
                    rfWETHCrypt: {
                        // Not named Multi-Strategy in the contract, but is multi-strategy
                        address: '0x152d62dccc2c7c7930c4483cc2a24fefd23c24c2',
                    },
                    rfDAICrypt: {
                        // Not named Multi-Strategy in the contract, but is multi-strategy
                        address: '0x5427f192137405e6a4143d1c3321359bab2dbd87',
                    },
                    rfWBTCCrypt: {
                        // Not named Multi-Strategy in the contract, but is multi-strategy
                        address: '0x660c6ec76bd83f53263681f83cbeb35042dcd1cc',
                    },
                },
            },
            onchainSource: {
                averageAPRAcrossLastNHarvests: 5,
                tokens: {
                    rfGrainSFTMX: {
                        address: '0xab30a4956c7d838234e24f1c3e50082c0607f35f',
                        isSftmX: true,
                    },
                    rfGrainFTM: {
                        address: '0xc5b29d59d0b4717aa0dd8d11597d9fd3a05d86bb',
                    },
                },
            },
        },
        defaultHandlers: {
            ankrETH: {
                tokenAddress: '0x12d8ce035c5de3ce39b1fdd4c1d5a745eaba3b8c',
                sourceUrl: 'https://api.staking.ankr.com/v1alpha/metrics',
                path: 'services.{serviceName == "eth"}.apy',
                isIbYield: true,
            },
            ankrFTM: {
                tokenAddress: '0xcfc785741dc0e98ad4c9f6394bb9d43cd1ef5179',
                sourceUrl: 'https://api.staking.ankr.com/v1alpha/metrics',
                path: 'services.{serviceName == "ftm"}.apy',
                isIbYield: true,
            },
        },
    },
    datastudio: {
        main: {
            user: 'datafeed-service@datastudio-366113.iam.gserviceaccount.com',
            sheetId: '1Ifbfh8njyssWKuLlUvlfXt-r3rnd4gAIP5sSM-lEuBU',
            databaseTabName: 'Database v2',
            compositionTabName: 'Pool Composition v2',
            emissionDataTabName: 'EmissionData',
        },
        canary: {
            user: 'datafeed-service@datastudio-366113.iam.gserviceaccount.com',
            sheetId: '17bYDbQAdMwGevfJ7thiwI8mjYeZppVRi8gD8ER6CtSs',
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
