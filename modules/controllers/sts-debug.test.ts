import { StakedSonicController } from './sts-controller';

describe('sts controller debugging', () => {
    it('sync and get sts data', async () => {
        await StakedSonicController().syncSonicStakingData();
        const staking = await StakedSonicController().getStakingData();

        console.log(staking.exchangeRate);
    }, 5000000);
});
