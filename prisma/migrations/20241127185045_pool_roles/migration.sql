/*
 Warnings:
 
 - You are about to drop the column `owner` on the `PrismaPool` table. All the data in the column will be lost.
 - Added the required column `pauseManager` to the `PrismaPool` table without a default value. This is not possible if the table is not empty.
 - Added the required column `poolCreator` to the `PrismaPool` table without a default value. This is not possible if the table is not empty.
 - Added the required column `swapFeeManager` to the `PrismaPool` table without a default value. This is not possible if the table is not empty.
 
 */
-- AlterTable
ALTER TABLE
  "PrismaPool" RENAME COLUMN "owner" TO "swapFeeManager";

ALTER TABLE
  "PrismaPool"
ADD
  COLUMN "pauseManager" TEXT,
ADD
  COLUMN "poolCreator" TEXT;