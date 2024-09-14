-- CreateEnum
CREATE TYPE "ConfirmationType" AS ENUM ('REGISTRATION', 'PASSWORD');

-- AlterTable
ALTER TABLE "RecoveryCodes" ADD COLUMN     "expirationAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "ConfirmationType";
