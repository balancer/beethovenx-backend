import { stopAnvilForks } from 'test/anvil/anvil-global-setup';

afterAll(async () => {
    await stopAnvilForks();
});
