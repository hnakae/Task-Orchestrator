/*
  Warnings:

  - You are about to drop the column `actual_minutes` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "actual_minutes",
ADD COLUMN     "actual_seconds" INTEGER NOT NULL DEFAULT 0;
