import { prisma } from '../../../prisma/prisma-client';
import { getRateProviderReviews } from '../../sources/github/rate-provider-reviews';

export const syncRateProviderReviews = async (): Promise<void> => {
    const rateProviders = await getRateProviderReviews();

    const data = rateProviders.map((item) => ({
        reviewed: true,
        name: item.name,
        chain: item.chain,
        summary: item.summary,
        tokenAddress: item.asset.toLowerCase(),
        rateProviderAddress: item.rateProviderAddress.toLowerCase(),
        reviewUrl: item.review,
        warnings: item.warnings.join(','),
        upgradableComponents: item.upgradeableComponents.map((component) => ({
            entryPoint: component.entrypoint,
            implementationReviewed: component.implementationReviewed,
        })),
    }));

    await prisma.$transaction([
        prisma.prismaPriceRateProviderData.deleteMany(),
        prisma.prismaPriceRateProviderData.createMany({ data, skipDuplicates: true }),
    ]);
};
