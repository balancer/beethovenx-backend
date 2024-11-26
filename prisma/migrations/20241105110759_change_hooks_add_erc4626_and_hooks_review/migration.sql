-- RenameTable
ALTER TABLE "Hook" RENAME TO "PrismaHook";

-- Drop Name column
ALTER TABLE "PrismaHook" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "PrismaHook" RENAME CONSTRAINT "Hook_pkey" TO "PrismaHook_pkey";

-- RenameIndex
ALTER INDEX "Hook_address_chain_key" RENAME TO "PrismaHook_address_chain_key";

-- RenameIndex
ALTER INDEX "Hook_id_idx" RENAME TO "PrismaHook_id_idx";

-- CreateTable
CREATE TABLE "PrismaHookReviewData" (
    "chain" "Chain" NOT NULL,
    "hookAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "reviewFile" TEXT NOT NULL,
    "warnings" TEXT NOT NULL,

    CONSTRAINT "PrismaHookReviewData_pkey" PRIMARY KEY ("chain","hookAddress")
);

-- CreateTable
CREATE TABLE "PrismaErc4626ReviewData" (
    "chain" "Chain" NOT NULL,
    "erc4626Address" TEXT NOT NULL,
    "assetAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "reviewFile" TEXT NOT NULL,
    "warnings" TEXT NOT NULL,

    CONSTRAINT "PrismaErc4626ReviewData_pkey" PRIMARY KEY ("chain","erc4626Address")
);

-- CreateIndex
CREATE INDEX "PrismaHookReviewData_chain_hookAddress_idx" ON "PrismaHookReviewData"("chain", "hookAddress");

-- CreateIndex
CREATE INDEX "PrismaErc4626ReviewData_chain_erc4626Address_idx" ON "PrismaErc4626ReviewData"("chain", "erc4626Address");

-- CreateIndex
CREATE INDEX "PrismaErc4626ReviewData_assetAddress_idx" ON "PrismaErc4626ReviewData"("assetAddress");

-- AddForeignKey
ALTER TABLE "PrismaHookReviewData" ADD CONSTRAINT "PrismaHookReviewData_chain_hookAddress_fkey" FOREIGN KEY ("chain", "hookAddress") REFERENCES "PrismaHook"("chain", "address") ON DELETE CASCADE ON UPDATE CASCADE;
