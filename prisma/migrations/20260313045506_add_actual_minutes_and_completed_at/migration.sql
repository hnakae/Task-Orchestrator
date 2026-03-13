-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "actual_minutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "completed_at" TIMESTAMP(3);
