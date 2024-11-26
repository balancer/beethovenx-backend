import { initRequestScopedContext, setRequestScopedContextValue } from '../context/request-scoped-context';
import { CowAmmController } from '../controllers/cow-amm-controller';
import { poolService } from '../pool/pool.service';
import { userService } from './user.service';

describe('user debugging', () => {
    it('sync reliquary balances', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '250');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // const reliquaryUserService = new UserSyncReliquaryFarmBalanceService(networkContext.s.reliquary!.address);
        // await poolService.syncStakingForPools(['AVALANCHE']);
        await userService.syncChangedStakedBalances();
    }, 5000000);

    it('sync wallet balances', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '1');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // const reliquaryUserService = new UserSyncReliquaryFarmBalanceService(networkContext.s.reliquary!.address);
        // await poolService.syncStakingForPools(['AVALANCHE']);
        // await CowAmmController().reloadPools('1');
        await userService.syncChangedWalletBalancesForAllPools();
    }, 5000000);

    it('sync user balances', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '250');
        //only do once before starting to debug
        // await poolService.syncAllPoolsFromSubgraph();
        // const reliquaryUserService = new UserSyncReliquaryFarmBalanceService(networkContext.s.reliquary!.address);
        // await poolService.syncStakingForPools(['GNOSIS']);
        await userService.syncUserBalance(
            '0xc09252451831d0c436e11debff4558c66437ab7f',
            '0x9e4341acef4147196e99d648c5e43b3fc9d026780002000000000000000005ec',
        );
    }, 5000000);
});
