import { initRequestScopedContext, setRequestScopedContextValue } from '../../modules/context/request-scoped-context';
import { networkContext } from '../../modules/network/network-context.service';
import { poolService } from '../../modules/pool/pool.service';
import { prisma } from '../../prisma/prisma-client';
import { ZERO_ADDRESS } from '@balancer/sdk';
import { tokenService } from '../token/token.service';

jest.mock('axios', () => ({
    get: jest.fn().mockResolvedValue({
        data: {
            ['reviewed']: {
                mainnet: {
                    '0xda3e8cd08753a05ed4103af28c69c47e35d6d8da': {
                        name: 'mainnet1',
                        asset: '0x862c57d48becb45583aeba3f489696d22466ca1b',
                        summary: 'safe',
                        review: './asd.md',
                        warnings: [],
                        upgradeableComponents: [],
                    },
                    '0xda3e8cd08753a05ed4103af28c69c47e35d6d8db': {
                        name: 'mainnet1dup',
                        asset: '0x862c57d48becb45583aeba3f489696d22466ca1b',
                        summary: 'safe',
                        review: './asd.md',
                        warnings: [],
                        upgradeableComponents: [],
                    },
                    '0x47b584e4c7c4a030060450ec9e51d52d919b1fcb': {
                        name: 'mainnet2',
                        asset: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
                        summary: 'safe',
                        review: './asd.md',
                        warnings: [],
                        upgradeableComponents: [],
                    },
                },
                base: {
                    '0x3786a6caab433f5dfe56503207df31df87c5b5c1': {
                        name: 'base rateprovider',
                        asset: '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22',
                        summary: 'safe',
                        review: './asd.md',
                        warnings: [],
                        upgradeableComponents: [],
                    },
                },
            },
        },
    }),
}));

describe('sync new reviews', () => {
    it('should add to db from github', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '1');
        await networkContext.config.contentService.syncRateProviderReviews(['MAINNET', 'BASE']);

        const rateProviders = await prisma.prismaPriceRateProviderData.findMany();
        expect(rateProviders.length).toBe(4);
    });

    it('two assets use the same rateprovider', async () => {
        const rateproviders = await prisma.prismaPriceRateProviderData.findMany({
            where: { tokenAddress: '0x862c57d48becb45583aeba3f489696d22466ca1b' },
        });

        expect(rateproviders.length).toBe(2);
    });

    it('should attach rateproviderdata to pool on query', async () => {
        // Query a pool using poolService
        const pool = await poolService.getGqlPool(
            '0x7f2b3b7fbd3226c5be438cde49a519f442ca2eda00020000000000000000067d',
            'MAINNET',
        );

        // Assert that rateproviderdata is attached to the pool
        for (const token of pool.poolTokens) {
            if (token.priceRateProvider && token.priceRateProvider !== ZERO_ADDRESS) {
                expect(token.priceRateProviderData).toBeDefined();
                expect(token.priceRateProviderData!.address).toBe('0xda3e8cd08753a05ed4103af28c69c47e35d6d8da');
            }
        }
    });

    it('should attach rateproviderdata to token on query', async () => {
        initRequestScopedContext();
        setRequestScopedContextValue('chainId', '1');
        const tokens = await tokenService.getTokenDefinitions(['MAINNET']);

        const token = tokens.find((t) => t.address === '0x862c57d48becb45583aeba3f489696d22466ca1b');
        expect(token).toBeDefined();
        expect(token?.rateProviderData).toBeDefined();
        expect(token?.rateProviderData?.address).toBe('0xda3e8cd08753a05ed4103af28c69c47e35d6d8da');
    });
});