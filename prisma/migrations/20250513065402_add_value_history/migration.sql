/*
  Warnings:

  - Added the required column `newValue` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousValue` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "newValue" JSONB NOT NULL,
ADD COLUMN     "previousValue" JSONB NOT NULL;
