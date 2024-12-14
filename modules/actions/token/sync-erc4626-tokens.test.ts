import { getViemClient } from '../../sources/viem-client';
import { syncErc4626Tokens } from './sync-erc4626-tokens';

describe('tokens debug', () => {
    it('sync erc4626 tokens', async () => {
        const viemClient = getViemClient('MAINNET');
        await syncErc4626Tokens(viemClient, 'MAINNET');
    }, 5000000);
});
