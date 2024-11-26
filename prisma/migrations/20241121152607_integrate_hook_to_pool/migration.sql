/*
  Warnings:

  - You are about to drop the column `hookId` on the `PrismaPool` table. All the data in the column will be lost.
  - You are about to drop the `PrismaHook` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrismaHookReviewData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PrismaHookReviewData" DROP CONSTRAINT "PrismaHookReviewData_chain_hookAddress_fkey";

-- DropForeignKey
ALTER TABLE "PrismaPool" DROP CONSTRAINT "PrismaPool_hookId_fkey";

-- AlterTable
ALTER TABLE "PrismaPool" DROP COLUMN "hookId",
ADD COLUMN     "hook" JSONB;

-- DropTable
DROP TABLE "PrismaHook";

-- DropTable
DROP TABLE "PrismaHookReviewData";
