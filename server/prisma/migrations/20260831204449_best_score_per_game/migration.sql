-- DropIndex
DROP INDEX "Score_userId_idx";

-- CreateIndex
CREATE INDEX "Score_userId_gameId_idx" ON "Score"("userId", "gameId");
