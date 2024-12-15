import { Chain } from '@prisma/client';
import arbitrumConfig from './arbitrum';
import avalacheConfig from './avalanche';
import baseConfig from './base';
import fantomConfig from './fantom';
import gnosisConfig from './gnosis';
import mainnetConfig from './mainnet';
import optimismConfig from './optimism';
import polygonConfig from './polygon';
import sepoliaConfig from './sepolia';
import zkevmConfig from './zkevm';
import fraxtalConfig from './fraxtal';
import modeConfig from './mode';
import sonicConfig from './sonic';

export const DAYS_OF_HOURLY_PRICES = 100;
export const BALANCES_SYNC_BLOCKS_MARGIN = 200;

export default {
    [Chain.ARBITRUM]: arbitrumConfig,
    [Chain.AVALANCHE]: avalacheConfig,
    [Chain.BASE]: baseConfig,
    [Chain.FANTOM]: fantomConfig,
    [Chain.GNOSIS]: gnosisConfig,
    [Chain.MAINNET]: mainnetConfig,
    [Chain.OPTIMISM]: optimismConfig,
    [Chain.POLYGON]: polygonConfig,
    [Chain.SEPOLIA]: sepoliaConfig,
    [Chain.ZKEVM]: zkevmConfig,
    [Chain.FRAXTAL]: fraxtalConfig,
    [Chain.MODE]: modeConfig,
    [Chain.SONIC]: sonicConfig,
};
