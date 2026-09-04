/*
  Warnings:

  - A unique constraint covering the columns `[userId,gameId]` on the table `Score` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Score_createdAt_idx";

-- DropIndex
DROP INDEX "Score_userId_gameId_idx";

-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Score_userId_idx" ON "Score"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_userId_gameId_key" ON "Score"("userId", "gameId");
