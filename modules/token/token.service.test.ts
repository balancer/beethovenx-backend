import { initRequestScopedContext, setRequestScopedContextValue } from '../context/request-scoped-context';
import { AllNetworkConfigs } from '../network/network-config';
import { tokenService } from './token.service';

describe('Token service', () => {
    test('same token address for in two chains', async () => {
        const address = '0x1509706a6c66ca549ff0cb464de88231ddbe213b';
        const prices = await tokenService.getWhiteListedTokenPrices(['GNOSIS', 'ARBITRUM']);
        const filtered = prices.filter((token) => token.tokenAddress === address);
        expect(filtered.length).toBe(2);
    });

    test('update prices', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '146');

        await tokenService.updateTokenPrices(['SONIC']);
        const prices = await tokenService.getCurrentTokenPrices(['SONIC']);

        console.log(prices.find((price) => price.tokenAddress === '0x541fd749419ca806a8bc7da8ac23d346f2df8b77'));
    }, 500000);

    test('sync tokens from pool tokens', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '146');
        await tokenService.syncTokenContentData('SONIC');
    }, 1000000);

    test('get tokens', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '250');
        const list = await tokenService.getTokenDefinitions(['FANTOM']);
        expect(list.length).toBeGreaterThan(0);
    });
    test('get tokens filter', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '250');
        const list = await tokenService.getTokenDefinitions({
            chains: ['FANTOM'],
            where: { tokensIn: ['0xd7028092c830b5c8fce061af2e593413ebbc1fc1'] },
        });
        console.log(list);
        expect(list.length).toBe(1);
    });
});
