-- AlterTable
ALTER TABLE "PrismaPoolSnapshot" ADD COLUMN     "dailyProtocolSwapFees" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "dailyProtocolYieldFees" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "dailySurpluses" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "dailySwapFees" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "dailyVolumes" TEXT[] DEFAULT ARRAY[]::TEXT[];
