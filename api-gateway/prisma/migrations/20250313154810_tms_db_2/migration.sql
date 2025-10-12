-- AlterTable
ALTER TABLE "shipment" ADD COLUMN     "shipment_cost" INTEGER;

-- CreateTable
CREATE TABLE "truck_cost" (
    "truck_id" INTEGER NOT NULL,
    "cost_id" INTEGER NOT NULL,

    CONSTRAINT "truck_cost_pkey" PRIMARY KEY ("truck_id","cost_id")
);

-- CreateTable
CREATE TABLE "cost" (
    "id" SERIAL NOT NULL,
    "cost_name" TEXT NOT NULL,
    "cost_value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "cost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "truck_cost" ADD CONSTRAINT "truck_cost_cost_id_fkey" FOREIGN KEY ("cost_id") REFERENCES "cost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truck_cost" ADD CONSTRAINT "truck_cost_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "truck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
