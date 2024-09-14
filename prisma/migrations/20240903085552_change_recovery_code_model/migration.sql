/*
  Warnings:

  - You are about to drop the column `type` on the `RecoveryCodes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RecoveryCodes" DROP COLUMN "type";

-- DropEnum
DROP TYPE "ConfirmationType";
