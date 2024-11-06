import { prisma } from '../../../prisma/prisma-client';
import { getHookReviews } from '../../sources/github/hook-reviews';

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

    const storedHookes = (await prisma.prismaHook.findMany({})).map((hook) => hook.address);

    const filteredData = data.filter((item) => storedHookes.includes(item.hookAddress));

    await prisma.$transaction([
        prisma.prismaHookReviewData.deleteMany(),
        prisma.prismaHookReviewData.createMany({ data: filteredData, skipDuplicates: true }),
    ]);
};
