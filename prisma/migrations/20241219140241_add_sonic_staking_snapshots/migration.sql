-- CreateTable
CREATE TABLE "PrismaSonicStakingDataSnapshot" (
    "id" TEXT NOT NULL,
    "sonicStakingId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "totalAssetsPool" TEXT NOT NULL,
    "totalAssetsDelegated" TEXT NOT NULL,
    "totalAssets" TEXT NOT NULL,
    "exchangeRate" TEXT NOT NULL,

    CONSTRAINT "PrismaSonicStakingDataSnapshot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PrismaSonicStakingDataSnapshot" ADD CONSTRAINT "PrismaSonicStakingDataSnapshot_sonicStakingId_fkey" FOREIGN KEY ("sonicStakingId") REFERENCES "PrismaStakedSonicData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
