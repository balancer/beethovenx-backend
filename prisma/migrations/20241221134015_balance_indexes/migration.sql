-- CreateIndex
CREATE INDEX "PrismaUserStakedBalance_poolId_chain_idx" ON "PrismaUserStakedBalance"("poolId", "chain");

-- CreateIndex
CREATE INDEX "PrismaUserStakedBalance_stakingId_chain_idx" ON "PrismaUserStakedBalance"("stakingId", "chain");

-- CreateIndex
CREATE INDEX "PrismaUserWalletBalance_poolId_chain_idx" ON "PrismaUserWalletBalance"("poolId", "chain");
