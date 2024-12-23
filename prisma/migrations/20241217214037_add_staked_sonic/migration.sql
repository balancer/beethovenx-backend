-- CreateTable
CREATE TABLE "PrismaStakedSonicData" (
    "id" TEXT NOT NULL,
    "totalAssets" TEXT NOT NULL,
    "totalAssetsDelegated" TEXT NOT NULL,
    "totalAssetsPool" TEXT NOT NULL,
    "stakingApr" TEXT NOT NULL,
    "exchangeRate" TEXT NOT NULL,

    CONSTRAINT "PrismaStakedSonicData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrismaStakedSonicDelegatedValidator" (
    "validatorId" TEXT NOT NULL,
    "sonicStakingId" TEXT NOT NULL,
    "assetsDelegated" TEXT NOT NULL,

    CONSTRAINT "PrismaStakedSonicDelegatedValidator_pkey" PRIMARY KEY ("validatorId")
);

-- AddForeignKey
ALTER TABLE "PrismaStakedSonicDelegatedValidator" ADD CONSTRAINT "PrismaStakedSonicDelegatedValidator_sonicStakingId_fkey" FOREIGN KEY ("sonicStakingId") REFERENCES "PrismaStakedSonicData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
