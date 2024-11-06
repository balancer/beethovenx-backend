import { Factory } from 'fishery';
import { PrismaPoolWithDynamicAndHook } from '../../prisma/prisma-types';
import { prismaPoolTokenFactory } from './prismaToken.factory';
import { createRandomAddress } from '../utils';
import { Chain, PrismaPoolType } from '@prisma/client';
import { prismaPoolDynamicDataFactory } from './prismaPoolDynamicData.factory';

class PrismaPoolFactory extends Factory<PrismaPoolWithDynamicAndHook> {
    stable(amp?: string) {
        return this.params({ type: PrismaPoolType.STABLE, typeData: { amp: amp ?? '10' } });
    }
}

export const prismaPoolFactory = PrismaPoolFactory.define(({ params }) => {
    const poolAddress = params.address ?? createRandomAddress();

    return {
        id: poolAddress,
        address: poolAddress,
        symbol: 'TEST-POOL',
        name: 'test pool',
        type: PrismaPoolType.WEIGHTED,
        decimals: 18,
        owner: createRandomAddress(),
        factory: createRandomAddress(),
        chain: Chain.SEPOLIA,
        version: 1,
        protocolVersion: 3,
        typeData: {},
        categories: [],
        createTime: 1708433018,
        dynamicData: prismaPoolDynamicDataFactory.build({ id: poolAddress, chain: params?.chain || Chain.SEPOLIA }),
        tokens: prismaPoolTokenFactory.buildList(2),
        hook: null,
        hookId: null,
        liquidityManagement: {},
    };
});
