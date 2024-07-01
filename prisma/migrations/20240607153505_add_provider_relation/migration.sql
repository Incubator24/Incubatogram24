/*
  Warnings:

  - You are about to drop the column `emails` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `GithubAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GoogleAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('GOOGLE', 'GITHUB');

-- DropForeignKey
ALTER TABLE "GithubAccount" DROP CONSTRAINT "GithubAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "GoogleAccount" DROP CONSTRAINT "GoogleAccount_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emails";

-- DropTable
DROP TABLE "GithubAccount";

-- DropTable
DROP TABLE "GoogleAccount";

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

-- AddForeignKey
ALTER TABLE "Providers" ADD CONSTRAINT "Providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
