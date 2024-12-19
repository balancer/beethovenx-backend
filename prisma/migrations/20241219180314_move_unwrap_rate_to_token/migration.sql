/*
  Warnings:

  - You are about to drop the column `unwrapRate` on the `PrismaPoolToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PrismaPoolToken" DROP COLUMN "unwrapRate";

-- AlterTable
ALTER TABLE "PrismaToken" ADD COLUMN     "unwrapRate" TEXT NOT NULL DEFAULT '1000000000000000000';
