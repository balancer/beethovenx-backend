import { StakedSonicController } from './sts-controller';
import { AprsController } from './aprs-controller';
import { poolService } from '../pool/pool.service';
import { initRequestScopedContext, setRequestScopedContextValue } from '../context/request-scoped-context';

describe('sts controller debugging', () => {
    it('sync and get sts data', async () => {
        await StakedSonicController().syncSonicStakingData();
        const staking = await StakedSonicController().getStakingData();

        console.log(staking.exchangeRate);
    }, 5000000);

    it('sync and get sts apr', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '146');
        await poolService.updatePoolAprs('SONIC');
        let pools = await poolService.getGqlPools({ where: { chainIn: ['SONIC'] } });

        console.log(pools.length);
    }, 5000000);
});
