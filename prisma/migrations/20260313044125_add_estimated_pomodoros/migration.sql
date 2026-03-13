/*
  Warnings:

  - The `type` column on the `tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "estimated_pomodoros" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'HOMEWORK';

-- DropEnum
DROP TYPE "TaskType";
