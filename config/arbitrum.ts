import { env } from '../apps/env';
import { DeploymentEnv, NetworkData } from '../modules/network/network-config-types';

export default <NetworkData>{
    chain: {
        slug: 'arbitrum',
        id: 42161,
        nativeAssetAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        wrappedNativeAssetAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        prismaId: 'ARBITRUM',
        gqlId: 'ARBITRUM',
    },
    subgraphs: {
        startDate: '2021-08-23',
        balancer: [
            `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmPbjY6L1NhPjpBv7wDTfG9EPx5FpCuBqeg1XxByzBTLcs`,
        ],
        cowAmm: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmUDGSJXdMzG4ezDzf1LvXVb2igwY6rnaNFLC62ZJZ3Pbv`,
        beetsBar: 'https://',
        blocks: 'https://api.studio.thegraph.com/query/48427/arbitrum-blocks/version/latest',
        gauge: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmT3h6pogdPkxfWsBxKNtpq7kR9fqKaQ9jGxe7fZx7MUVE`,
        aura: 'https://data.aura.finance/graphql',
    },
    eth: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        addressFormatted: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        symbol: 'ETH',
        name: 'Ether',
    },
    weth: {
        address: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        addressFormatted: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    },
    coingecko: {
        nativeAssetId: 'ethereum',
        platformId: 'arbitrum-one',
        excludedTokenAddresses: ['0x6dbf2155b0636cb3fd5359fccefb8a2c02b6cb51'], // plsRDNT, has coingecko entry but no price
    },
    rpcUrl: env.DRPC_API_KEY
        ? `https://lb.drpc.org/ogrpc?network=arbitrum&dkey=${env.DRPC_API_KEY}`
        : 'https://1rpc.io/arb',
    rpcMaxBlockRange: 2000,
    protocolToken: 'bal',
    bal: {
        address: '0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8',
    },
    veBal: {
        address: '0xc128a9954e6c874ea3d62ce62b468ba073093f25',
        bptAddress: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
        delegationProxy: '0x81cfae226343b24ba12ec6521db2c79e7aeeb310',
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
    multicall: '0x80c7dd17b01855a6d2347444a0fcc36136a314de',
    multicall3: '0xca11bde05977b3631167028862be2a173976ca11',
    avgBlockSpeed: 1,
    ybAprConfig: {
        aave: {
            v3: {
                subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/subgraphs/id/DLuE98kEb5pQNXAcKFQGQgfSQ57Xdou4jnVbAEqMfy3B`,
                tokens: {
                    USDC: {
                        underlyingAssetAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
                        aTokenAddress: '0x625e7708f30ca75bfd92586e17077590c60eb4cd',
                        wrappedTokens: {
                            waUSDC: '0xe719aef17468c7e10c0c205be62c990754dff7e5',
                            stataArbUSDC: '0x3a301e7917689b8e8a19498b8a28fc912583490c',
                        },
                    },
                    USDCn: {
                        underlyingAssetAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
                        aTokenAddress: '0x724dc807b04555b71ed48a6896b6f41593b8c637',
                        wrappedTokens: {
                            stataArbUSDCn: '0xbde67e089886ec0e615d6f054bc6f746189a3d56',
                            stataArbUSDCn2: '0x7cfadfd5645b50be87d546f42699d863648251ad',
                        },
                    },
                    USDT: {
                        underlyingAssetAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
                        aTokenAddress: '0x6ab707aca953edaefbc4fd23ba73294241490620',
                        wrappedTokens: {
                            waUSDT: '0x3c7680dfe7f732ca0279c39ff30fe2eafdae49db',
                            stataArbUSDT: '0x8b5541b773dd781852940490b0c3dc1a8cdb6a87',
                            stataArbUSDT2: '0xb165a74407fe1e519d6bcbdec1ed3202b35a4140',
                        },
                    },
                    DAI: {
                        underlyingAssetAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
                        aTokenAddress: '0x82e64f49ed5ec1bc6e43dad4fc8af9bb3a2312ee',
                        wrappedTokens: {
                            waDAI: '0x345a864ac644c82c2d649491c905c71f240700b2',
                            stataArbDAI: '0x426e8778bf7f54b0e4fc703dcca6f26a4e5b71de',
                        },
                    },
                    wETH: {
                        underlyingAssetAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
                        aTokenAddress: '0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8',
                        wrappedTokens: {
                            waWETH: '0x18c100415988bef4354effad1188d1c22041b046',
                            stataArbWETH: '0x18468b6eba332285c6d9bb03fe7fb52e108c4596',
                        },
                    },
                    FRAX: {
                        underlyingAssetAddress: '0x17fc002b466eec40dae837fc4be5c67993ddbd6f',
                        aTokenAddress: '0x38d693ce1df5aadf7bc62595a37d667ad57922e5',
                        wrappedTokens: {
                            stataArbFRAX: '0x89aec2023f89e26dbb7eaa7a98fe3996f9d112a8',
                        },
                    },
                    GHO: {
                        underlyingAssetAddress: '0x7dff72693f6a4149b17e7c6314655f6a9f7c8b33',
                        aTokenAddress: '0xebe517846d0f36eced99c735cbf6131e1feb775d',
                        wrappedTokens: {
                            stataArbGHO: '0xd9fba68d89178e3538e708939332c79efc540179',
                        },
                    },
                },
            },
        },
        defillama: [
            {
                defillamaPoolId: '46f3828a-cbf6-419e-8399-a83b905bf556',
                tokenAddress: '0x5a7a183b6b44dc4ec2e3d2ef43f98c5152b1d76d',
            },
        ],
        reaper: {
            onchainSource: {
                averageAPRAcrossLastNHarvests: 5,
                tokens: {
                    rfGrainDAI: {
                        address: '0x12f256109e744081f633a827be80e06d97ff7447',
                    },
                    rfGrainUSDT: {
                        address: '0x0179bac7493a92ac812730a4c64a0b41b7ea0ecf',
                    },
                    rfGrainUSDC: {
                        address: '0xaeacf641a0342330ec681b57c0a6af0b71d5cbff',
                    },
                },
            },
        },
        stakewise: {
            url: 'https://mainnet-graph.stakewise.io/subgraphs/name/stakewise/stakewise',
            token: '0xf7d4e7273e5015c96728a6b02f31c505ee184603',
        },
        etherfi: '0x35751007a407ca6feffe80b3cb397736d2cf4dbe',
        dforce: {
            token: '0xbc404429558292ee2d769e57d57d6e74bbd2792d',
        },
        defaultHandlers: {
            usdm: {
                tokenAddress: '0x57f5e098cad7a3d1eed53991d4d66c45c9af7812',
                sourceUrl: 'https://apy.prod.mountainprotocol.com',
                path: 'value',
                isIbYield: true,
                scale: 1,
            },
            wstETH: {
                tokenAddress: '0x5979d7b546e38e414f7e9822514be443a4800529',
                sourceUrl: 'https://eth-api.lido.fi/v1/protocol/steth/apr/sma',
                path: 'data.smaApr',
                isIbYield: true,
            },
            rETH: {
                tokenAddress: '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8',
                sourceUrl: 'https://api.rocketpool.net/mainnet/reth/apr',
                path: 'yearlyAPR',
                isIbYield: true,
            },
            cbETH: {
                tokenAddress: '0x1debd73e752beaf79865fd6446b0c970eae7732f',
                sourceUrl: 'https://api.exchange.coinbase.com/wrapped-assets/CBETH/',
                path: 'apy',
                scale: 1,
            },
            sfrxETH: {
                tokenAddress: '0x95ab45875cffdba1e5f451b950bc2e42c0053f39',
                sourceUrl: 'https://api.frax.finance/v2/frxeth/summary/latest',
                path: 'sfrxethApr',
                isIbYield: true,
            },
            sFRAX: {
                tokenAddress: '0xe3b3fe7bca19ca77ad877a5bebab186becfad906',
                sourceUrl: 'https://api.frax.finance/v2/frax/sfrax/summary/history?range=1d',
                path: 'items.0.sfraxApr',
                isIbYield: true,
            },
            ankrETH: {
                tokenAddress: '0xe05a08226c49b636acf99c40da8dc6af83ce5bb3',
                sourceUrl: 'https://api.staking.ankr.com/v1alpha/metrics',
                path: 'services.{serviceName == "eth"}.apy',
                isIbYield: true,
            },
            plsRDNT: {
                tokenAddress: '0x6dbf2155b0636cb3fd5359fccefb8a2c02b6cb51',
                sourceUrl: 'https://www.plutusdao.io/api/getPlsRdntInfo',
                path: 'apr',
                scale: 1,
                isIbYield: true,
            },
            ezETH: {
                tokenAddress: '0x2416092f143378750bb29b79ed961ab195cceea5',
                sourceUrl: 'https://app.renzoprotocol.com/api/apr',
                path: 'apr',
                isIbYield: true,
            },
            sUSDE: {
                tokenAddress: '0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2',
                sourceUrl: 'https://ethena.fi/api/yields/protocol-and-staking-yield',
                path: 'stakingYield.value',
                isIbYield: true,
            },
            jitoSOL: {
                tokenAddress: '0x83e1d2310ade410676b1733d16e89f91822fd5c3',
                sourceUrl: 'https://kobe.mainnet.jito.network/api/v1/stake_pool_stats',
                path: 'apy.0.data',
                scale: 1,
                isIbYield: true,
            },
            woETH: {
                tokenAddress: '0xd8724322f44e5c58d7a815f542036fb17dbbf839',
                sourceUrl: 'https://analytics.ousd.com/api/v2/oeth/apr/trailing',
                path: 'apr',
                isIbYield: true,
            },
            ETHx: {
                tokenAddress: '0xed65c5085a18fa160af0313e60dcc7905e944dc7',
                sourceUrl: 'https://universe.staderlabs.com/eth/apy',
                path: 'value',
                isIbYield: true,
            },
            gUSDC: {
                tokenAddress: '0xd3443ee1e91af28e5fb858fbd0d72a63ba8046e0',
                sourceUrl: 'https://backend-arbitrum.gains.trade/apr',
                path: 'collateralRewards.{symbol == "USDC"}.vaultApr',
                isIbYield: true,
            },
            wUSDL: {
                tokenAddress: '0x7751e2f4b8ae93ef6b79d86419d42fe3295a4559',
                sourceUrl: 'https://usdl-apy.replit.app/usdl_apy',
                path: 'apy',
                isIbYield: true,
            },
        },
    },
    gyro: {
        config: '0x9b683ca24b0e013512e2566b68704dbe9677413c',
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
