import { prisma } from '../../../prisma/prisma-client';
import { getErc4626Reviews } from '../../sources/github/erc4626-reviews';

export const syncErc4626Reviews = async (): Promise<void> => {
    const erc4626Reviews = await getErc4626Reviews();

    const data = erc4626Reviews.map((item) => ({
        chain: item.chain,
        erc4626Address: item.erc4626Address.toLowerCase(),
        name: item.name,
        assetAddress: item.asset.toLowerCase(),
        summary: item.summary,
        reviewFile: item.review,
        warnings: item.warnings.join(','),
    }));

    await prisma.$transaction([
        prisma.prismaErc4626ReviewData.deleteMany(),
        prisma.prismaErc4626ReviewData.createMany({ data, skipDuplicates: true }),
    ]);
};
