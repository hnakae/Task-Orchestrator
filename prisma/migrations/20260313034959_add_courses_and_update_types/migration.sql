/*
  Warnings:

  - The values [GENERAL] on the enum `TaskType` will be removed. If these variants are still used in the database, this will fail.

*/
-- Update existing tasks to use 'ASSIGNMENT' instead of 'GENERAL' before type conversion
UPDATE "tasks" SET "type" = 'ASSIGNMENT' WHERE "type"::text = 'GENERAL';

-- AlterEnum
BEGIN;
CREATE TYPE "TaskType_new" AS ENUM ('ASSIGNMENT', 'MIDTERM', 'FINAL', 'PROJECT', 'REMINDER');
ALTER TABLE "public"."tasks" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "tasks" ALTER COLUMN "type" TYPE "TaskType_new" USING ("type"::text::"TaskType_new");
ALTER TYPE "TaskType" RENAME TO "TaskType_old";
ALTER TYPE "TaskType_new" RENAME TO "TaskType";
DROP TYPE "public"."TaskType_old";
ALTER TABLE "tasks" ALTER COLUMN "type" SET DEFAULT 'ASSIGNMENT';
COMMIT;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "course_id" TEXT,
ALTER COLUMN "type" SET DEFAULT 'ASSIGNMENT';

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rubric" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
