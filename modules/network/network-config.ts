import { fantomNetworkConfig } from './fantom';
import { optimismNetworkConfig } from './optimism';
import { NetworkConfig } from './network-config-types';
import { mainnetNetworkConfig } from './mainnet';
import { arbitrumNetworkConfig } from './arbitrum';
import { polygonNetworkConfig } from './polygon';
import { gnosisNetworkConfig } from './gnosis';
import { zkevmNetworkConfig } from './zkevm';
import { avalancheNetworkConfig } from './avalanche';
import { baseNetworkConfig } from './base';
import { fraxtalNetworkConfig } from './fraxtal';
import { Chain } from '@prisma/client';
import { sepoliaNetworkConfig } from './sepolia';
import { modeNetworkConfig } from './mode';
import { sonicNetworkConfig } from './sonic';

export const AllNetworkConfigs: { [chainId: string]: NetworkConfig } = {
    '250': fantomNetworkConfig,
    '10': optimismNetworkConfig,
    '1': mainnetNetworkConfig,
    '42161': arbitrumNetworkConfig,
    '137': polygonNetworkConfig,
    '100': gnosisNetworkConfig,
    '1101': zkevmNetworkConfig,
    '43114': avalancheNetworkConfig,
    '8453': baseNetworkConfig,
    '11155111': sepoliaNetworkConfig,
    '252': fraxtalNetworkConfig,
    '34443': modeNetworkConfig,
    '146': sonicNetworkConfig,
};

export const AllNetworkConfigsKeyedOnChain: { [chain in Chain]: NetworkConfig } = {
    FANTOM: fantomNetworkConfig,
    OPTIMISM: optimismNetworkConfig,
    MAINNET: mainnetNetworkConfig,
    ARBITRUM: arbitrumNetworkConfig,
    POLYGON: polygonNetworkConfig,
    GNOSIS: gnosisNetworkConfig,
    ZKEVM: zkevmNetworkConfig,
    AVALANCHE: avalancheNetworkConfig,
    BASE: baseNetworkConfig,
    SEPOLIA: sepoliaNetworkConfig,
    FRAXTAL: fraxtalNetworkConfig,
    MODE: modeNetworkConfig,
    SONIC: sonicNetworkConfig,
};

export const BalancerChainIds = ['1', '137', '42161', '100', '1101', '43114', '8453', '11155111', '252', '34443'];
export const BeethovenChainIds = ['250', '10', '146'];
