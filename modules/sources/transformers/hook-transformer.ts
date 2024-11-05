import { Chain, Prisma } from '@prisma/client';
import { V3JoinedSubgraphPool } from '../subgraphs';
import { zeroAddress } from 'viem';

export const hookTransformer = (
    poolData: V3JoinedSubgraphPool,
    chain: Chain,
): Prisma.PrismaHookCreateInput | undefined => {
    // By default v3 pools have a hook config with the address 0x0
    // We don't want to store this in the database because it's not doing anything
    const hookConfig =
        poolData.hookConfig && poolData.hookConfig.hook.address !== zeroAddress ? poolData.hookConfig : undefined;

    if (!hookConfig) {
        return undefined;
    }

    const { hook, ...hookFlags } = hookConfig;

    return {
        address: hook.address.toLowerCase(),
        chain: chain,
        ...hookFlags,
    };
};
