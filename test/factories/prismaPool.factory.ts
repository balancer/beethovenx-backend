import { Factory } from 'fishery';
import { PrismaPoolAndHookWithDynamic } from '../../prisma/prisma-types';
import { prismaPoolTokenFactory } from './prismaToken.factory';
import { createRandomAddress } from '../utils';
import { Chain, PrismaPoolType } from '@prisma/client';
import { prismaPoolDynamicDataFactory } from './prismaPoolDynamicData.factory';
import { LiquidityManagement } from '../../modules/sor/types';


class PrismaPoolFactory extends Factory<PrismaPoolAndHookWithDynamic> {
    stable(amp?: string) {
        return this.params({ type: PrismaPoolType.STABLE, typeData: { amp: amp ?? '10' } });
    }
}

export const prismaPoolFactory = PrismaPoolFactory.define(({ params }) => {
    const poolAddress = params.address ?? createRandomAddress();
    const hook = params.hook ?? null;
    const liquidityManagement = params.liquidityManagement ?? {
        disableUnbalancedLiquidity: false,
        enableAddLiquidityCustom: false,
        enableDonation: false,
        enableRemoveLiquidityCustom: false,
    };

    return {
        id: poolAddress,
        address: poolAddress,
        symbol: 'TEST-POOL',
        name: 'test pool',
        type: PrismaPoolType.WEIGHTED,
        decimals: 18,
        swapFeeManager: createRandomAddress(),
        pauseManager: createRandomAddress(),
        poolCreator: createRandomAddress(),
        factory: createRandomAddress(),
        chain: Chain.SEPOLIA,
        version: 1,
        protocolVersion: 3,
        typeData: {},
        categories: [],
        createTime: 1708433018,
        dynamicData: prismaPoolDynamicDataFactory.build({ id: poolAddress, chain: params?.chain || Chain.SEPOLIA }),
        tokens: prismaPoolTokenFactory.buildList(2),
        hookId: null,
        hook: hook,
        liquidityManagement: liquidityManagement,
    };
});
