-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('GENERAL', 'ASSIGNMENT');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "type" "TaskType" NOT NULL DEFAULT 'GENERAL';
