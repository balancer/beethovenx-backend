import { stopAnvilForks } from './anvil/anvil-global-setup';

afterAll(async () => {
    await stopAnvilForks();
});
