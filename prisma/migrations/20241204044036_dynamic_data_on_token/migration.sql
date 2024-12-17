ALTER TABLE "PrismaPoolToken"
ADD COLUMN "balance" TEXT,
ADD COLUMN "balanceUSD" DOUBLE PRECISION,
ADD COLUMN "latestFxPrice" DOUBLE PRECISION,
ADD COLUMN "priceRate" TEXT,
ADD COLUMN "weight" TEXT;

UPDATE "PrismaPoolToken" t
SET "balance" = d.balance,
    "balanceUSD" = d."balanceUSD",
    "priceRate" = d."priceRate",
    "weight" = d."weight",
    "latestFxPrice" = d."latestFxPrice"
FROM "PrismaPoolTokenDynamicData" d
WHERE t.id = d.id AND t.chain = d.chain;

ALTER TABLE "PrismaPoolToken"
ALTER COLUMN "balance" SET NOT NULL,
ALTER COLUMN "balanceUSD" SET NOT NULL,
ALTER COLUMN "priceRate" SET NOT NULL;