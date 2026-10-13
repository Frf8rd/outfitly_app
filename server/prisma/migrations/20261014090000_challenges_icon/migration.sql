-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN "icon" TEXT NOT NULL DEFAULT 'trophy-outline';

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_title_startsAt_key" ON "Challenge"("title", "startsAt");
