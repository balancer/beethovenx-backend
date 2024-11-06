import { prisma } from '../../prisma/prisma-client';
import { HookData, Resolvers } from '../../schema';

export default {
    Query: {
        hooks: async (_parent, { chain }) => {
            const hooks = await prisma.prismaHook.findMany({
                where: {
                    chain: chain || undefined,
                },
                include: {
                    pools: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

            return hooks.map((hook) => ({
                ...hook,
                dynamicData: (hook.dynamicData && (hook.dynamicData as HookData)) || undefined,
                poolsIds: hook.pools.map((pool) => pool.id),
            }));
        },
    },
} as Resolvers;
