import { env } from '../apps/env';
import { NetworkData } from '../modules/network/network-config-types';

export default <NetworkData>{
    chain: {
        slug: 'sepolia',
        id: 11155111,
        nativeAssetAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        wrappedNativeAssetAddress: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
        prismaId: 'SEPOLIA',
        gqlId: 'SEPOLIA',
    },
    subgraphs: {
        startDate: '2023-05-03',
        cowAmm: 'https://api.studio.thegraph.com/query/75376/balancer-cow-amm-sepolia/version/latest',
        balancer: ['https://api.studio.thegraph.com/query/24660/balancer-sepolia-v2/version/latest'],
        balancerV3: 'https://api.studio.thegraph.com/query/31386/balancer-v3-sepolia-11th/version/latest',
        balancerPoolsV3: 'https://api.studio.thegraph.com/query/31386/balancer-pools-v3-sepolia-11th/version/latest',
        beetsBar: 'https://',
        blocks: `https://api.studio.thegraph.com/query/48427/bleu-sepolia-blocks/version/latest`,
        gauge: `https://api.studio.thegraph.com/query/24660/balancer-gauges-sepolia/version/latest`,
    },
    eth: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        addressFormatted: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        symbol: 'ETH',
        name: 'Ether',
    },
    weth: {
        address: '0x7b79995e5f793a07bc00c21412e50ecae098e7f9',
        addressFormatted: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    },
    coingecko: {
        nativeAssetId: 'ethereum',
        platformId: 'ethereum',
        excludedTokenAddresses: [],
    },
    rpcUrl: env.DRPC_API_KEY
        ? `https://lb.drpc.org/ogrpc?network=sepolia&dkey=${env.DRPC_API_KEY}`
        : 'https://gateway.tenderly.co/public/sepolia',
    rpcMaxBlockRange: 700,
    protocolToken: 'bal',
    bal: {
        address: '0xb19382073c7A0aDdbb56Ac6AF1808Fa49e377B75',
    },
    // veBal: {
    //     address: '0xc128a9954e6c874ea3d62ce62b468ba073093f25',
    //     delegationProxy: '0x81cfae226343b24ba12ec6521db2c79e7aeeb310',
    // },
    balancer: {
        v2: {
            vaultAddress: '0xba12222222228d8ba445958a75a0704d566bf2c8',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.5',
            balancerQueriesAddress: '0xe39b5e3b6d74016b2f6a9673d7d7493b6df549d5',
        },
        v3: {
            vaultAddress: '0xBC582d2628FcD404254a1e12CB714967Ce428915',
            routerAddress: '0x4D2aA7a3CD7F8dA6feF37578A1881cD63Fd3715E',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.1',
        },
    },
    hooks: {
        feeTakingHook: ['0x790ae803b6c0467C6A4cbDc6d6d712DE34CfdB76'],
        exitFeeHook: ['0x2Aa9D4066DAe16ef001765efF2cA8F41Bde0b019'],
        stableSurgeHook: ['0x1adc55adb4caae71abb4c33f606493f4114d2091'],
    },
    multicall: '0x25eef291876194aefad0d60dff89e268b90754bb',
    multicall3: '0xca11bde05977b3631167028862be2a173976ca11',
    avgBlockSpeed: 1,
    ybAprConfig: {},
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
