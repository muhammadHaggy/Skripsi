/*
  Warnings:

  - The primary key for the `box` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `box` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `box_delivery_order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `box_id` on the `box_delivery_order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "box_delivery_order" DROP CONSTRAINT "box_delivery_order_box_id_fkey";

-- AlterTable
ALTER TABLE "box" DROP CONSTRAINT "box_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "box_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "box_delivery_order" DROP CONSTRAINT "box_delivery_order_pkey",
DROP COLUMN "box_id",
ADD COLUMN     "box_id" INTEGER NOT NULL,
ADD CONSTRAINT "box_delivery_order_pkey" PRIMARY KEY ("box_id", "delivery_order_id");

-- AddForeignKey
ALTER TABLE "box_delivery_order" ADD CONSTRAINT "box_delivery_order_box_id_fkey" FOREIGN KEY ("box_id") REFERENCES "box"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
