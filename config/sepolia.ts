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
        balancerV3: 'https://api.studio.thegraph.com/query/75376/balancer-v3-sepolia/version/latest',
        // balancerV3: `https://gateway.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmQf2B21pX5h1pChmSJ3CGLkcTCwNc84XdMawYXxSaJxDR`,
        balancerPoolsV3: 'https://api.studio.thegraph.com/query/75376/balancer-pools-v3-sepolia/version/latest',
        // balancerPoolsV3: `https://gateway.thegraph.com/api/${env.THEGRAPH_API_KEY_BALANCER}/deployments/id/QmPhGhDpaPe8yvmMg95CvNetsLFMr8gSHDB7ZjEj1Wp47q`,
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
            vaultAddress: '0xba1333333333a1ba1108e8412f11850a5c319ba9',
            protocolFeeController: '0xa731c23d7c95436baaae9d52782f966e1ed07cc8',
            routerAddress: '0x0bf61f706105ea44694f2e92986bd01c39930280',
            defaultSwapFeePercentage: '0.5',
            defaultYieldFeePercentage: '0.1',
        },
    },
    hooks: {
        feeTakingHook: ['0x790ae803b6c0467c6a4cbdc6d6d712de34cfdb76'],
        exitFeeHook: ['0x2aa9d4066dae16ef001765eff2ca8f41bde0b019'],
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
