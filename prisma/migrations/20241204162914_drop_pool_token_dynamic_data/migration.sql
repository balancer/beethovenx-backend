/*
  Warnings:

  - You are about to drop the `PrismaPoolTokenDynamicData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PrismaPoolTokenDynamicData" DROP CONSTRAINT "PrismaPoolTokenDynamicData_poolTokenId_chain_fkey";

-- DropTable
DROP TABLE "PrismaPoolTokenDynamicData";
