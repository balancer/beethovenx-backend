import { Address } from 'viem';
import config from '../../../config';
import { chainIdToChain } from '../../network/chain-id-to-chain';
import { getViemClient } from '../../sources/viem-client';
import { syncStakingData } from './sync-staking-data';
import { syncWithdrawalRequests } from './sync-withdrawal-requests';
import { JobsController } from '../../controllers/jobs-controller';

describe('SFTMX syncing service', () => {
    test('sync withdrawal data', async () => {
        const jobsController = JobsController();
        await jobsController.syncSftmxWithdrawalrequests('250');
    }, 50000);

    test('sync staking data via job', async () => {
        const jobsController = JobsController();
        await jobsController.syncSftmxStakingData('250');
    }, 50000000);

    test('sync staking snapshot data via job', async () => {
        const jobsController = JobsController();
        await jobsController.syncSftmxStakingSnapshots('250');
    }, 50000);
});
