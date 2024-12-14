import { Chain } from '@prisma/client';
import { syncErc4626Tokens } from '../actions/token/sync-erc4626-tokens';
import { getViemClient } from '../sources/viem-client';

export function TokenController(tracer?: any) {
    // Setup tracing
    // ...
    return {
        async syncErc4626Tokens(chain: Chain) {
            const viemClient = getViemClient(chain);
            await syncErc4626Tokens(viemClient, chain);
        },
    };
}
