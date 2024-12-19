import { StakedSonicController } from './sts-controller';
import { protocolService } from '../protocol/protocol.service';
import { poolService } from '../pool/pool.service';
import { initRequestScopedContext, setRequestScopedContextValue } from '../context/request-scoped-context';

describe('sts controller debugging', () => {
    it('sync and get sts data', async () => {
        await StakedSonicController().syncSonicStakingData();
        const staking = await StakedSonicController().getStakingData();

        console.log(staking.exchangeRate);
    }, 5000000);

    it('sync and get sts snapshots', async () => {
        await StakedSonicController().syncSonicStakingSnapshots();
        const staking = await StakedSonicController().getStakingSnapshots('ALL_TIME');

        console.log(staking.length);
    }, 5000000);

    it('sync and get sts apr', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '146');
        await poolService.updatePoolAprs('SONIC');
        let pools = await poolService.getGqlPools({ where: { chainIn: ['SONIC'] } });

        console.log(pools.length);
    }, 5000000);

    it('include sts in protocol tvl', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '146');
        let pools = await protocolService.getMetrics('SONIC');

        console.log(pools);
    }, 5000000);
});
