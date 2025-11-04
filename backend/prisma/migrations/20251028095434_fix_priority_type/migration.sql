/*
  Warnings:

  - The `priority` column on the `Announcement` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "priority",
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 5;

-- CreateIndex
CREATE INDEX "Announcement_priority_idx" ON "Announcement"("priority");
