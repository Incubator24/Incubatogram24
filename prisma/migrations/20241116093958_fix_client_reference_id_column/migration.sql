/*
  Warnings:

  - Made the column `clientReferenceId` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "clientReferenceId" SET NOT NULL;