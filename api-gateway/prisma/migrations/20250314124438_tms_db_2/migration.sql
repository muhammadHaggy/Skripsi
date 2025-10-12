/*
  Warnings:

  - You are about to drop the column `token` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "token",
ADD COLUMN     "mobile_token" TEXT,
ADD COLUMN     "web_token" TEXT;
