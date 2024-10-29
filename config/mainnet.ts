import { BigNumber } from 'ethers';
import { env } from '../apps/env';
import { DeploymentEnv, NetworkData } from '../modules/network/network-config-types';

const underlyingTokens = {
    USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
    wETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    crvUSD: '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e',
    LUSD: '0x5f98805a4e8be255a32880fdec7f6728c6568ba0',
};

export default <NetworkData>{
    chain: {
        slug: 'ethereum',
        id: 1,
        nativeAssetAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        wrappedNativeAssetAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        prismaId: 'MAINNET',
        gqlId: 'MAINNET',
    },
    subgraphs: {
        startDate: '2019-04-20',
        cowAmm: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmQ3c9CTJBZdgy3uTLB929ARZucMUCf6piZBDxSgBKnf6m`,
        balancer: [
            `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmQ5TT2yYBZgoUxsat3bKmNe5Fr9LW9YAtDs8aeuc1BRhj`,
        ],
        beetsBar: 'https://',
        blocks: 'https://api.studio.thegraph.com/query/48427/ethereum-blocks/version/latest',
        gauge: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmdmQBHbBtwD6wNypHbuGKB1uKHpHNVuSHbo9FsvrMhXSn`,
        aura: 'https://data.aura.finance/graphql',
    },
    eth: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        addressFormatted: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        symbol: 'ETH',
        name: 'Ether',
    },
    weth: {
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        addressFormatted: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    coingecko: {
        nativeAssetId: 'ethereum',
        platformId: 'ethereum',
        excludedTokenAddresses: [
            '0x04c154b66cb340f3ae24111cc767e0184ed00cc6', // pxETH, has Coingecko entry but no price
            '0xb45ad160634c528cc3d2926d9807104fa3157305', // sDOLA, has Coingecko entry but no price
        ],
    },
    rpcUrl: env.DRPC_API_KEY
        ? `https://lb.drpc.org/ogrpc?network=ethereum&dkey=${env.DRPC_API_KEY}`
        : 'https://rpc.ankr.com/eth',
    rpcMaxBlockRange: 700,
    protocolToken: 'bal',
    bal: {
        address: '0xba100000625a3754423978a60c9317c58a424e3d',
    },
    veBal: {
        address: '0xc128a9954e6c874ea3d62ce62b468ba073093f25',
        bptAddress: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
        delegationProxy: '0x0000000000000000000000000000000000000000',
    },
    gaugeControllerAddress: '0xc128468b7ce63ea702c1f104d55a2566b13d3abd',
    gaugeControllerHelperAddress: '0x8e5698dc4897dc12243c8642e77b4f21349db97c',
    gyro: {
        config: '0xac89cc9d78bbad7eb3a02601b4d65daa1f908aa6',
    },
    balancer: {
        v2: {
            vaultAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.5',
            tokenAdmin: '0xf302f9f50958c5593770fdf4d4812309ff77414f',
            balancerQueriesAddress: '0xe39b5e3b6d74016b2f6a9673d7d7493b6df549d5',
        },
        v3: {
            vaultAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            routerAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.5',
            tokenAdmin: '0xf302f9f50958c5593770fdf4d4812309ff77414f',
        },
    },
    multicall: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
    multicall3: '0xca11bde05977b3631167028862be2a173976ca11',
    avgBlockSpeed: 10,
    sor: {
        main: {
            url: 'https://uu6cfghhd5lqa7py3nojxkivd40zuugb.lambda-url.ca-central-1.on.aws/',
            maxPools: 8,
            forceRefresh: false,
            gasPrice: BigNumber.from(10),
            swapGas: BigNumber.from('1000000'),
            poolIdsToExclude: [
                '0xbfa413a2ff0f20456d57b643746133f54bfe0cd20000000000000000000004c3',
                '0xdc063deafce952160ec112fa382ac206305657e60000000000000000000004c4', // Linear pools that cause issues with new b-sdk
            ],
        },
        canary: {
            url: 'https://ksa66wlkjbvteijxmflqjehsay0jmekw.lambda-url.eu-central-1.on.aws/',
            maxPools: 8,
            forceRefresh: false,
            gasPrice: BigNumber.from(10),
            swapGas: BigNumber.from('1000000'),
            poolIdsToExclude: [
                '0xbfa413a2ff0f20456d57b643746133f54bfe0cd20000000000000000000004c3',
                '0xdc063deafce952160ec112fa382ac206305657e60000000000000000000004c4', // Linear pools that cause issues with new b-sdk
            ],
        },
    },
    ybAprConfig: {
        aave: {
            v2: {
                subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/subgraphs/id/8wR23o1zkS4gpLqLNU4kG3JHYVucqGyopL5utGxP2q1N`,
                tokens: {
                    USDC: {
                        underlyingAssetAddress: underlyingTokens.USDC,
                        aTokenAddress: '0xbcca60bb61934080951369a648fb03df4f96263c',
                        wrappedTokens: {
                            waUSDC: '0xd093fa4fb80d09bb30817fdcd442d4d02ed3e5de',
                        },
                    },
                    USDT: {
                        underlyingAssetAddress: underlyingTokens.USDT,
                        aTokenAddress: '0x3ed3b47dd13ec9a98b44e6204a523e766b225811',
                        wrappedTokens: {
                            waUSDT: '0xf8fd466f12e236f4c96f7cce6c79eadb819abf58',
                        },
                    },
                    DAI: {
                        underlyingAssetAddress: underlyingTokens.DAI,
                        aTokenAddress: '0x028171bca77440897b824ca71d1c56cac55b68a3',
                        wrappedTokens: {
                            waDAI: '0x02d60b84491589974263d922d9cc7a3152618ef6',
                        },
                    },
                },
            },
            v3: {
                subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/subgraphs/id/Cd2gEDVeqnjBn1hSeqFMitw8Q1iiyV9FYUZkLNRcL87g`,
                tokens: {
                    USDC: {
                        underlyingAssetAddress: underlyingTokens.USDC,
                        aTokenAddress: '0x98c23e9d8f34fefb1b7bd6a91b7ff122f4e16f5c',
                        wrappedTokens: {
                            waUSDC: '0x57d20c946a7a3812a7225b881cdcd8431d23431c',
                            stataEthUSDC: '0x02c2d189b45ce213a40097b62d311cf0dd16ec92',
                        },
                    },
                    USDT: {
                        underlyingAssetAddress: underlyingTokens.USDT,
                        aTokenAddress: '0x23878914efe38d27c4d67ab83ed1b93a74d4086a',
                        wrappedTokens: {
                            waUSDT: '0xa7e0e66f38b8ad8343cff67118c1f33e827d1455',
                            stataEthUSDT: '0x65799b9fd4206cdaa4a1db79254fcbc2fd2ffee6',
                            stataEthUSDT2: '0x862c57d48becb45583aeba3f489696d22466ca1b',
                        },
                    },
                    DAI: {
                        underlyingAssetAddress: underlyingTokens.DAI,
                        aTokenAddress: '0x018008bfb33d285247a21d44e50697654f754e63',
                        wrappedTokens: {
                            waDAI: '0x098256c06ab24f5655c5506a6488781bd711c14b',
                            stataEthDAI: '0xeb708639e8e518b86a916db3685f90216b1c1c67',
                        },
                    },
                    wETH: {
                        underlyingAssetAddress: underlyingTokens.wETH,
                        aTokenAddress: '0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8',
                        wrappedTokens: {
                            waWETH: '0x59463bb67ddd04fe58ed291ba36c26d99a39fbc6',
                            stataEthWETH: '0x03928473f25bb2da6bc880b07ecbadc636822264',
                        },
                    },
                    crvUSD: {
                        underlyingAssetAddress: underlyingTokens.crvUSD,
                        aTokenAddress: '0xb82fa9f31612989525992fcfbb09ab22eff5c85a',
                        wrappedTokens: {
                            stataEthcrvUSD: '0x848107491e029afde0ac543779c7790382f15929',
                        },
                    },
                    LUSD: {
                        underlyingAssetAddress: underlyingTokens.LUSD,
                        aTokenAddress: '0x3fe6a295459fae07df8a0cecc36f37160fe86aa9',
                        wrappedTokens: {
                            stataEthLUSD: '0xdbf5e36569798d1e39ee9d7b1c61a7409a74f23a',
                        },
                    },
                },
            },
        },
        bloom: {
            tokens: {
                tbyFeb1924: {
                    address: '0xc4cafefbc3dfea629c589728d648cb6111db3136',
                    feedAddress: '0xde1f5f2d69339171d679fb84e4562febb71f36e6',
                },
            },
        },
        defillama: [
            {
                defillamaPoolId: '5a9c2073-2190-4002-9654-8c245d1e8534',
                tokenAddress: '0x6dc3ce9c57b20131347fdc9089d740daf6eb34c5',
            },
            {
                defillamaPoolId: '46f3828a-cbf6-419e-8399-a83b905bf556',
                tokenAddress: '0xf073bac22dab7faf4a3dd6c6189a70d54110525c',
            },
        ],
        euler: {
            subgraphUrl: 'https://api.thegraph.com/subgraphs/name/euler-xyz/euler-mainnet',
            tokens: {
                eUSDC: { address: '0xeb91861f8a4e1c12333f42dce8fb0ecdc28da716' },
                eDAI: { address: '0xe025e3ca2be02316033184551d4d3aa22024d9dc' },
                eUSDT: { address: '0x4d19f33948b99800b6113ff3e83bec9b537c85d2' },
                eFRAX: { address: '0x5484451a88a35cd0878a1be177435ca8a0e4054e' },
            },
        },
        gearbox: {
            sourceUrl: 'https://charts-server.fly.dev/api/pools',
            tokens: {
                dDAI: { address: '0x6cfaf95457d7688022fc53e7abe052ef8dfbbdba' },
                dUSDC: { address: '0xc411db5f5eb3f7d552f9b8454b2d74097ccde6e3' },
            },
        },
        idle: {
            sourceUrl: 'https://api.idle.finance/junior-rates/',
            authorizationHeader:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IkFwcDciLCJpYXQiOjE2NzAyMzc1Mjd9.L12KJEt8fW1Cvy3o7Nl4OJ2wtEjzlObaAYJ9aC_CY6M',
            tokens: {
                idleDAI: {
                    address: '0xec9482040e6483b7459cc0db05d51dfa3d3068e1',
                    wrapped4626Address: '0x0c80f31b840c6564e6c5e18f386fad96b63514ca',
                },
                idleUSDC: {
                    address: '0xdc7777c771a6e4b3a82830781bdde4dbc78f320e',
                    wrapped4626Address: '0xc3da79e0de523eef7ac1e4ca9abfe3aac9973133',
                },
                idleUSDT: {
                    address: '0xfa3afc9a194babd56e743fa3b7aa2ccbed3eaaad',
                    wrapped4626Address: '0x544897a3b944fdeb1f94a0ed973ea31a80ae18e1',
                },
            },
        },
        maker: {
            sdai: '0x83f20f44975d03b1b09e64809b757c47f942beea',
        },
        tessera: {
            tokens: {
                sAPE: {
                    tesseraPoolAddress: '0x5954ab967bc958940b7eb73ee84797dc8a2afbb9',
                    tokenAddress: '0x7966c5bae631294d7cffcea5430b78c2f76db6fa',
                },
            },
        },
        tranchess: {
            sourceUrl: 'https://tranchess.com/eth/api/v3/funds',
            tokens: {
                qETH: {
                    address: '0x93ef1ea305d11a9b2a3ebb9bb4fcc34695292e7d',
                    underlyingAssetName: 'WETH',
                },
            },
        },
        stakewise: {
            url: 'https://mainnet-graph.stakewise.io/subgraphs/name/stakewise/stakewise',
            token: '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
        },
        etherfi: '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
        maple: {
            url: 'https://api.maple.finance/v2/graphql',
            token: '0x80ac24aa929eaf5013f6436cda2a7ba190f5cc0b',
        },
        yieldnest: {
            url: 'https://gateway.yieldnest.finance/api/v1/graphql',
            token: '0x09db87a538bd693e9d08544577d5ccfaa6373a48',
        },
        sveth: true,
        teth: true,
        defaultHandlers: {
            uniETH: {
                tokenAddress: '0xf1376bcef0f78459c0ed0ba5ddce976f1ddf51f4',
                sourceUrl: 'https://app.bedrock.technology/unieth/api/v1/e2ls/apy',
                path: 'data.apy',
                scale: 10000,
            },
            vETH: {
                tokenAddress: '0x4bc3263eb5bb2ef7ad9ab6fb68be80e43b43801f',
                sourceUrl: 'https://apy.liebi.com/veth',
                path: 'veth',
            },
            stETH: {
                tokenAddress: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
                sourceUrl: 'https://eth-api.lido.fi/v1/protocol/steth/apr/sma',
                path: 'data.smaApr',
                isIbYield: true,
            },
            pufETH: {
                tokenAddress: '0xd9a442856c234a39a81a089c06451ebaa4306a72',
                sourceUrl: 'https://eth-api.lido.fi/v1/protocol/steth/apr/sma',
                path: 'data.smaApr',
                isIbYield: true,
            },
            wstETH: {
                tokenAddress: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
                sourceUrl: 'https://eth-api.lido.fi/v1/protocol/steth/apr/sma',
                path: 'data.smaApr',
                isIbYield: true,
            },
            cbETH: {
                tokenAddress: '0xbe9895146f7af43049ca1c1ae358b0541ea49704',
                sourceUrl: 'https://api.exchange.coinbase.com/wrapped-assets/CBETH/',
                path: 'apy',
                scale: 1,
                isIbYield: true,
            },
            sfrxETH: {
                tokenAddress: '0xac3e018457b222d93114458476f3e3416abbe38f',
                sourceUrl: 'https://api.frax.finance/v2/frxeth/summary/latest',
                path: 'sfrxethApr',
                isIbYield: true,
            },
            StaFirETH: {
                tokenAddress: '0x9559aaa82d9649c7a7b220e7c461d2e74c9a3593',
                sourceUrl: 'https://drop-api.stafi.io/reth/v1/poolData',
                path: 'data.stakeApr',
                isIbYield: true,
            },
            rETH: {
                tokenAddress: '0xae78736cd615f374d3085123a210448e74fc6393',
                sourceUrl: 'https://api.rocketpool.net/mainnet/reth/apr',
                path: 'yearlyAPR',
                isIbYield: true,
            },
            USDR: {
                tokenAddress: '0xaf0d9d65fc54de245cda37af3d18cbec860a4d4b',
                sourceUrl: 'http://usdr-api.us-east-1.elasticbeanstalk.com/usdr/apy',
                path: 'usdr',
                isIbYield: true,
            },
            swETH: {
                tokenAddress: '0xf951e335afb289353dc249e82926178eac7ded78',
                sourceUrl: 'https://v3.svc.swellnetwork.io/api/tokens/sweth/apr',
                isIbYield: true,
            },
            wjAURA: {
                tokenAddress: '0x198d7387fa97a73f05b8578cdeff8f2a1f34cd1f',
                sourceUrl: 'https://data.jonesdao.io/api/v1/jones/apy-wjaura',
                path: 'wjauraApy',
                isIbYield: true,
            },
            ETHx: {
                tokenAddress: '0xa35b1b31ce002fbf2058d22f30f95d405200a15b',
                sourceUrl: 'https://universe.staderlabs.com/eth/apy',
                path: 'value',
                isIbYield: true,
            },
            usdm: {
                tokenAddress: '0x57f5e098cad7a3d1eed53991d4d66c45c9af7812',
                sourceUrl: 'https://apy.prod.mountainprotocol.com',
                path: 'value',
                isIbYield: true,
                scale: 1,
            },
            ankrETH: {
                tokenAddress: '0xe95a203b1a91a908f9b9ce46459d101078c2c3cb',
                sourceUrl: 'https://api.staking.ankr.com/v1alpha/metrics',
                path: 'services.{serviceName == "eth"}.apy',
                isIbYield: true,
            },
            ezETH: {
                tokenAddress: '0xbf5495efe5db9ce00f80364c8b423567e58d2110',
                sourceUrl: 'https://app.renzoprotocol.com/api/apr',
                path: 'apr',
                isIbYield: true,
            },
            rsETH: {
                tokenAddress: '0xa1290d69c65a6fe4df752f95823fae25cb99e5a7',
                sourceUrl: 'https://universe.kelpdao.xyz/rseth/apy',
                path: 'value',
                isIbYield: true,
            },
            sDOLA: {
                tokenAddress: '0xb45ad160634c528cc3d2926d9807104fa3157305',
                sourceUrl: 'https://www.inverse.finance/api/dola-staking',
                path: 'apr',
                isIbYield: true,
            },
            rswETH: {
                tokenAddress: '0xfae103dc9cf190ed75350761e95403b7b8afa6c0',
                sourceUrl: 'https://v3-lrt.svc.swellnetwork.io/api/tokens/rsweth/apr',
                isIbYield: true,
            },
            sUSDE: {
                tokenAddress: '0x9d39a5de30e57443bff2a8307a4256c8797a3497',
                sourceUrl: 'https://ethena.fi/api/yields/protocol-and-staking-yield',
                path: 'stakingYield.value',
                isIbYield: true,
            },
            saETH: {
                tokenAddress: '0xf1617882a71467534d14eee865922de1395c9e89',
                sourceUrl: 'https://api.aspidanet.com/page_data/?chainId=1',
                path: 'apr',
                isIbYield: true,
            },
            cdcETH: {
                tokenAddress: '0xfe18ae03741a5b84e39c295ac9c856ed7991c38e',
                sourceUrl: 'https://api.crypto.com/pos/v1/public/get-staking-instruments',
                path: 'result.data.{instrument_name == "ETH.staked"}.est_rewards',
                isIbYield: true,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    params: {
                        country_code: 'POL',
                    },
                },
                scale: 1,
            },
            agETH: {
                tokenAddress: '0xe1b4d34e8754600962cd944b535180bd758e6c2e',
                sourceUrl: 'https://universe.kelpdao.xyz/rseth/apy',
                path: 'value',
                isIbYield: true,
            },
            dvstETH: {
                tokenAddress: '0x5e362eb2c0706bd1d134689ec75176018385430b',
                sourceUrl: 'https://eth-api.lido.fi/v1/protocol/steth/apr/sma',
                path: 'data.smaApr',
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
