import { PrismaToken } from '@prisma/client';
import { Factory } from 'fishery';
import { createRandomAddress } from '../utils';
import { PrismaPoolTokenWithDynamicData } from '../../prisma/prisma-types';
import { ZERO_ADDRESS } from '@balancer/sdk';

export const prismaPoolTokenFactory = Factory.define<PrismaPoolTokenWithDynamicData>(({ sequence, params }) => {
    const tokenAddress = params?.address || createRandomAddress();
    const poolId = params?.poolId || createRandomAddress();
    const decimals = params?.token?.decimals ?? 18;
    return {
        id: poolId + '-' + tokenAddress,
        address: tokenAddress,
        poolId: poolId,
        chain: 'SEPOLIA',
        index: sequence ? sequence - 1 : 0,
        nestedPoolId: null,
        priceRateProvider: ZERO_ADDRESS,
        exemptFromProtocolYieldFee: false,
        token: prismaTokenFactory.build({ address: tokenAddress, decimals }),
        balance: '10.000000000000000000',
        balanceUSD: 10,
        weight: '0.5',
        priceRate: '1',
        latestFxPrice: null,
        scalingFactor: null,
    };
});

export const prismaTokenFactory = Factory.define<PrismaToken>(() => {
    return {
        address: createRandomAddress(),
        chain: 'SEPOLIA',
        symbol: 'TestToken',
        name: 'testToken',
        description: '',
        decimals: 18,
        logoURI: '',
        websiteUrl: '',
        discordUrl: '',
        telegramUrl: null,
        twitterUsername: null,
        coingeckoTokenId: null,
        priority: 0,
        coingeckoContractAddress: null,
        coingeckoPlatformId: null,
        excludedFromCoingecko: false,
        underlyingTokenAddress: null,
        isBufferAllowed: true,
        unwrapRate: '1',
    };
});
