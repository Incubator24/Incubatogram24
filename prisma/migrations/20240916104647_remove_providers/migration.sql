/*
  Warnings:

  - You are about to drop the `Providers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Providers" DROP CONSTRAINT "Providers_userId_fkey";

-- DropTable
DROP TABLE "Providers";
