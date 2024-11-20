import { prisma } from '../../../prisma/prisma-client';
import { getHookReviews } from '../../sources/github/hook-reviews';
import { HookData } from '../../sources/transformers';
import { prismaBulkExecuteOperations } from '../../../prisma/prisma-util';

export const syncHookReviews = async (): Promise<void> => {
    const hookReviews = await getHookReviews();

    const data = hookReviews.map((item) => ({
        chain: item.chain,
        name: item.name,
        hookAddress: item.hookAddress.toLowerCase(),
        description: item.description,
        summary: item.summary,
        reviewFile: item.review,
        warnings: item.warnings.join(','),
    }));

    // Get hook addresses from the database
    const poolsWithHooks = await prisma.prismaPool.findMany({
        where: { hook: { not: {} } },
    });

    const operations = [];

    for (const pool of poolsWithHooks) {
        const filteredData = data.find(
            (item) => pool.chain === item.chain && (pool.hook as HookData).address === item.hookAddress,
        );
        operations.push(
            prisma.prismaPool.update({
                where: { id_chain: { id: pool.id, chain: pool.chain } },
                data: {
                    hook: {
                        ...(pool.hook as HookData),
                        reviewData: filteredData,
                    },
                },
            }),
        );
    }

    await prismaBulkExecuteOperations(operations, false);
};
