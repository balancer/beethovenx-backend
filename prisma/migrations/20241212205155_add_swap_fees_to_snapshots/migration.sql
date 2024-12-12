-- AlterTable
ALTER TABLE "PrismaPoolSnapshot" ADD COLUMN     "totalSwapFees" TEXT[] DEFAULT ARRAY[]::TEXT[];
