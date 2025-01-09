-- DropIndex
DROP INDEX "PrismaTokenPrice_chain_idx";

-- DropIndex
DROP INDEX "PrismaTokenPrice_timestamp_idx";

-- DropIndex
DROP INDEX "PrismaTokenPrice_tokenAddress_idx";

-- CreateIndex
CREATE INDEX "PrismaPool_id_chain_idx" ON "PrismaPool"("id", "chain");

-- CreateIndex
CREATE INDEX "PrismaPoolAprItem_poolId_chain_idx" ON "PrismaPoolAprItem"("poolId", "chain");

-- CreateIndex
CREATE INDEX "PrismaPoolExpandedTokens_tokenAddress_chain_idx" ON "PrismaPoolExpandedTokens"("tokenAddress", "chain");

-- CreateIndex
CREATE INDEX "PrismaPoolStaking_poolId_chain_idx" ON "PrismaPoolStaking"("poolId", "chain");

-- CreateIndex
CREATE INDEX "PrismaPoolStakingGaugeReward_gaugeId_chain_idx" ON "PrismaPoolStakingGaugeReward"("gaugeId", "chain");

-- CreateIndex
CREATE INDEX "PrismaPoolStakingMasterChefFarmRewarder_farmId_chain_idx" ON "PrismaPoolStakingMasterChefFarmRewarder"("farmId", "chain");

-- CreateIndex
CREATE INDEX "PrismaPoolStakingReliquaryFarmLevel_farmId_chain_idx" ON "PrismaPoolStakingReliquaryFarmLevel"("farmId", "chain");

-- CreateIndex
CREATE INDEX "PrismaPoolSwap_poolId_chain_idx" ON "PrismaPoolSwap"("poolId", "chain");

-- CreateIndex
CREATE INDEX "PrismaReliquaryFarmSnapshot_farmId_chain_idx" ON "PrismaReliquaryFarmSnapshot"("farmId", "chain");

-- CreateIndex
CREATE INDEX "PrismaReliquaryLevelSnapshot_farmSnapshotId_chain_idx" ON "PrismaReliquaryLevelSnapshot"("farmSnapshotId", "chain");

-- CreateIndex
CREATE INDEX "PrismaReliquaryTokenBalanceSnapshot_farmSnapshotId_chain_idx" ON "PrismaReliquaryTokenBalanceSnapshot"("farmSnapshotId", "chain");

-- CreateIndex
CREATE INDEX "PrismaTokenPrice_timestamp_chain_idx" ON "PrismaTokenPrice"("timestamp", "chain");

-- CreateIndex
CREATE INDEX "PrismaTokenPrice_tokenAddress_chain_idx" ON "PrismaTokenPrice"("tokenAddress", "chain");
