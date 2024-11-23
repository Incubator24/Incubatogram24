/*
  Warnings:

  - You are about to drop the column `subscriptionType` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `subscriptionType` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "subscriptionType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "subscriptionType";
