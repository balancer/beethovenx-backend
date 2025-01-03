-- DropIndex
DROP INDEX "PrismaPoolSnapshot_protocolVersion_idx";

-- DropIndex
DROP INDEX "PrismaPoolSnapshot_timestamp_idx";

-- CreateIndex
CREATE INDEX "PrismaPoolSnapshot_chain_timestamp_idx" ON "PrismaPoolSnapshot"("chain", "timestamp" DESC);
