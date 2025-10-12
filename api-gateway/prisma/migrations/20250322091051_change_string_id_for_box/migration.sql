/*
  Warnings:

  - The primary key for the `box` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `box_delivery_order` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "box_delivery_order" DROP CONSTRAINT "box_delivery_order_box_id_fkey";

-- AlterTable
ALTER TABLE "box" DROP CONSTRAINT "box_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "box_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "box_id_seq";

-- AlterTable
ALTER TABLE "box_delivery_order" DROP CONSTRAINT "box_delivery_order_pkey",
ALTER COLUMN "box_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "box_delivery_order_pkey" PRIMARY KEY ("box_id", "delivery_order_id");

-- AddForeignKey
ALTER TABLE "box_delivery_order" ADD CONSTRAINT "box_delivery_order_box_id_fkey" FOREIGN KEY ("box_id") REFERENCES "box"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
