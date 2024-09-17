/*
  Warnings:

  - You are about to drop the `EmailConfirmationUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostImages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecoveryCodes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[emailConfirmationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passwordRecoveryId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "EmailConfirmationUser" DROP CONSTRAINT "EmailConfirmationUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PostImages" DROP CONSTRAINT "PostImages_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PostImages" DROP CONSTRAINT "PostImages_postId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailConfirmationId" INTEGER,
ADD COLUMN     "passwordRecoveryId" INTEGER;

-- DropTable
DROP TABLE "EmailConfirmationUser";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "PostImages";

-- DropTable
DROP TABLE "RecoveryCodes";

-- CreateTable
CREATE TABLE "EmailExpiration" (
    "id" SERIAL NOT NULL,
    "confirmationCode" TEXT NOT NULL,
    "emailExpiration" TEXT NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "EmailExpiration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordRecovery" (
    "id" SERIAL NOT NULL,
    "recoveryCode" TEXT NOT NULL,
    "expirationAt" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PasswordRecovery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Providers" (
    "id" SERIAL NOT NULL,
    "providerId" TEXT NOT NULL,
    "type" "ProviderType" NOT NULL,
    "email" TEXT,
    "userName" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailExpiration_userId_key" ON "EmailExpiration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordRecovery_userId_key" ON "PasswordRecovery"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailConfirmationId_key" ON "User"("emailConfirmationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordRecoveryId_key" ON "User"("passwordRecoveryId");

-- AddForeignKey
ALTER TABLE "EmailExpiration" ADD CONSTRAINT "EmailExpiration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("emailConfirmationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordRecovery" ADD CONSTRAINT "PasswordRecovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("passwordRecoveryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Providers" ADD CONSTRAINT "Providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
