import { env } from '../apps/env';
import { NetworkData } from '../modules/network/network-config-types';

export default <NetworkData>{
    chain: {
        slug: 'sonic',
        id: 146,
        nativeAssetAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        wrappedNativeAssetAddress: '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38',
        prismaId: 'SONIC',
        gqlId: 'SONIC',
    },
    subgraphs: {
        startDate: '2024-12-12',
        balancer: [
            `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_FANTOM}/deployments/id/Qmbt2NyWBL8WKV5EuBDbByUEUETfhUBVpsLpptFbnwEyrK`,
        ],
        blocks: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_FANTOM}/deployments/id/QmZYZcSMaGY2rrq8YFP9avicWf2GM8R2vpB2Xuap1WhipT`,
        gauge: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_FANTOM}/deployments/id/QmSRNzwTmLu55ZxxyxYULS5T1Kar7upz1jzL5FsMzLpB2e`,
        reliquary: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_FANTOM}/deployments/id/QmUM8aU6H3gFx6JL65GQV5baPPjczU9hUb6VRiDQ1jEp3B`,
        sts: `https://gateway-arbitrum.network.thegraph.com/api/${env.THEGRAPH_API_KEY_FANTOM}/deployments/id/Qmf7YfRPHCaSf6jeNbu8HUAWQ9Wba5ovk4HEPNaA8NTbvW`,
    },
    eth: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        addressFormatted: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        symbol: 'S',
        name: 'Sonic',
    },
    weth: {
        address: '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38',
        addressFormatted: '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38',
    },
    coingecko: {
        nativeAssetId: 'sonic',
        platformId: 'sonic-mainnet',
        excludedTokenAddresses: [],
    },
    rpcUrl: `https://lb.drpc.org/ogrpc?network=sonic&dkey=${env.DRPC_BEETS_API_KEY}`,
    rpcMaxBlockRange: 2000,
    protocolToken: 'beets',
    beets: {
        address: '0x2d0e0814e62d80056181f5cd932274405966e4f0',
    },
    bal: {
        address: '0x0000000000000000000000000000000000000000',
    },
    sts: {
        address: '0xe5da20f15420ad15de0fa650600afc998bbe3955',
        baseAprUrl: 'https://apr.soniclabs.com/current',
        validatorFee: 0.15,
    },
    balancer: {
        v2: {
            vaultAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.25',
            defaultYieldFeePercentage: '0.25',
            balancerQueriesAddress: '0x4b29db997ec0efdfef13baee2a2d7783bcf67f17',
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
    reliquary: {
        address: '0x973670ce19594f857a7cd85ee834c7a74a941684',
        excludedFarmIds: [],
    },
    avgBlockSpeed: 1,
    ybAprConfig: {
        sts: {
            token: '0xe5da20f15420ad15de0fa650600afc998bbe3955',
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
