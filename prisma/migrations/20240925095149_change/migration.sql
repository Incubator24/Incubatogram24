/*
  Warnings:

  - You are about to drop the column `emailConfirmationId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordRecoveryId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Providers` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `emailExpiration` on the `EmailExpiration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `expirationAt` on the `PasswordRecovery` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "EmailExpiration" DROP CONSTRAINT "EmailExpiration_userId_fkey";

-- DropForeignKey
ALTER TABLE "PasswordRecovery" DROP CONSTRAINT "PasswordRecovery_userId_fkey";

-- DropForeignKey
ALTER TABLE "Providers" DROP CONSTRAINT "Providers_userId_fkey";

-- DropIndex
DROP INDEX "User_emailConfirmationId_key";

-- DropIndex
DROP INDEX "User_passwordRecoveryId_key";

-- AlterTable
ALTER TABLE "EmailExpiration" DROP COLUMN "emailExpiration",
ADD COLUMN     "emailExpiration" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PasswordRecovery" DROP COLUMN "expirationAt",
ADD COLUMN     "expirationAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailConfirmationId",
DROP COLUMN "passwordRecoveryId",
ADD COLUMN     "githubEmail" TEXT,
ADD COLUMN     "githubId" TEXT,
ADD COLUMN     "googleEmail" TEXT,
ADD COLUMN     "googleId" TEXT;

-- DropTable
DROP TABLE "Providers";

-- AddForeignKey
ALTER TABLE "EmailExpiration" ADD CONSTRAINT "EmailExpiration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordRecovery" ADD CONSTRAINT "PasswordRecovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
