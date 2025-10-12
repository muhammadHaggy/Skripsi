/*
  Warnings:

  - You are about to drop the column `height` on the `delivery_order` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `delivery_order` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `delivery_order` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `delivery_order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "box" ALTER COLUMN "volume" DROP NOT NULL,
ALTER COLUMN "height" SET DEFAULT 0.0,
ALTER COLUMN "width" SET DEFAULT 0.0,
ALTER COLUMN "length" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "delivery_order" DROP COLUMN "height",
DROP COLUMN "length",
DROP COLUMN "volume",
DROP COLUMN "width";
