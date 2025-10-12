-- CreateEnum
CREATE TYPE "TruckFirstStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "TruckSecondStatus" AS ENUM ('ON_DELIVERY', 'OUT_OF_STOCK', 'ARCHIVE', 'MAINTENANCE', 'LEGAL');

-- CreateEnum
CREATE TYPE "DeliveryOrderStatus" AS ENUM ('READY', 'RUNNING', 'PENDING', 'DONE', 'IN_CALCULATION');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('READY', 'RUNNING', 'CANCELLED', 'DONE', 'DRAF');

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_allowed_shipment" BOOLEAN NOT NULL DEFAULT false,
    "is_allowed_do" BOOLEAN NOT NULL DEFAULT false,
    "is_allowed_location" BOOLEAN NOT NULL DEFAULT false,
    "is_allowed_truck" BOOLEAN NOT NULL DEFAULT false,
    "is_allowed_user" BOOLEAN NOT NULL DEFAULT false,
    "dc_id" INTEGER,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dc" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3),
    "updated_by" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,

    CONSTRAINT "dc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone_num" VARCHAR(100),
    "email" VARCHAR(100),
    "token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(3),
    "role_id" INTEGER,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3),
    "updated_by" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "npwp" TEXT,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kabupaten_kota" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "desa_kelurahan" TEXT NOT NULL,
    "kode_pos" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3),
    "updated_by" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,
    "is_dc" BOOLEAN NOT NULL DEFAULT false,
    "dist_to_origin" DOUBLE PRECISION DEFAULT 0,
    "dist_to_origin_unit" TEXT,
    "open_hour" TIMESTAMP(3) NOT NULL,
    "close_hour" TIMESTAMP(3) NOT NULL,
    "service_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "service_time_unit" TEXT,
    "dc_id" INTEGER,
    "customer_id" INTEGER,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment" (
    "id" SERIAL NOT NULL,
    "total_dist" DOUBLE PRECISION NOT NULL,
    "total_dist_unit" TEXT NOT NULL,
    "total_time" DOUBLE PRECISION NOT NULL,
    "total_time_unit" TEXT NOT NULL,
    "total_volume" DOUBLE PRECISION NOT NULL,
    "total_time_with_waiting" DOUBLE PRECISION NOT NULL,
    "total_time_with_waiting_unit" TEXT NOT NULL,
    "all_coords" TEXT NOT NULL,
    "shipment_num" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'READY',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3),
    "updated_by" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,
    "atd" TIMESTAMPTZ(3),
    "ata" TIMESTAMPTZ(3),
    "etd" TIMESTAMPTZ(3),
    "eta" TIMESTAMPTZ(3),
    "truck_id" INTEGER,

    CONSTRAINT "shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_location" (
    "shipment_id" INTEGER NOT NULL,
    "location_id" TEXT NOT NULL,
    "queue" INTEGER NOT NULL,
    "eta" TIMESTAMPTZ(3),
    "travel_time" DOUBLE PRECISION NOT NULL,
    "travel_distance" DOUBLE PRECISION NOT NULL,
    "travel_time_unit" TEXT NOT NULL,
    "travel_distance_unit" TEXT NOT NULL,

    CONSTRAINT "shipment_location_pkey" PRIMARY KEY ("shipment_id","location_id")
);

-- CreateTable
CREATE TABLE "delivery_order" (
    "id" SERIAL NOT NULL,
    "so_origin" TEXT NOT NULL,
    "delivery_order_num" TEXT NOT NULL,
    "description" TEXT,
    "volume" DOUBLE PRECISION,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "length" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "quantity" DOUBLE PRECISION,
    "status" "DeliveryOrderStatus" NOT NULL DEFAULT 'READY',
    "eta_target" TIMESTAMP(3) NOT NULL,
    "eta" TIMESTAMPTZ(3),
    "etd" TIMESTAMPTZ(3),
    "atd" TIMESTAMPTZ(3),
    "ata" TIMESTAMPTZ(3),
    "order_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3),
    "updated_by" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,
    "loc_dest_id" TEXT,
    "loc_ori_id" TEXT,
    "truck_id" INTEGER,

    CONSTRAINT "delivery_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_delivery_order" (
    "shipment_id" INTEGER NOT NULL,
    "delivery_order_id" INTEGER NOT NULL,

    CONSTRAINT "shipment_delivery_order_pkey" PRIMARY KEY ("shipment_id","delivery_order_id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "product_category" TEXT NOT NULL,
    "product_type" TEXT NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_line" (
    "delivery_order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit_volume" TEXT NOT NULL,
    "unit_price" TEXT NOT NULL,
    "unit_weight" TEXT NOT NULL,
    "unit_quantity" TEXT NOT NULL,

    CONSTRAINT "product_line_pkey" PRIMARY KEY ("delivery_order_id","product_id")
);

-- CreateTable
CREATE TABLE "truck" (
    "id" SERIAL NOT NULL,
    "plate_number" VARCHAR(100) NOT NULL,
    "first_status" "TruckFirstStatus" NOT NULL DEFAULT 'AVAILABLE',
    "second_status" "TruckSecondStatus",
    "max_individual_capacity_volume" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3),
    "updated_by" TEXT,
    "type_id" INTEGER,
    "dc_id" INTEGER,

    CONSTRAINT "truck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truck_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "truck_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "dc_name_key" ON "dc"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_email_key" ON "user"("username", "email");

-- CreateIndex
CREATE UNIQUE INDEX "customer_name_key" ON "customer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shipment_shipment_num_key" ON "shipment"("shipment_num");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_order_delivery_order_num_key" ON "delivery_order"("delivery_order_num");

-- CreateIndex
CREATE UNIQUE INDEX "product_name_key" ON "product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "truck_plate_number_key" ON "truck"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "truck_type_name_key" ON "truck_type"("name");

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_dc_id_fkey" FOREIGN KEY ("dc_id") REFERENCES "dc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_dc_id_fkey" FOREIGN KEY ("dc_id") REFERENCES "dc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_location" ADD CONSTRAINT "shipment_location_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_location" ADD CONSTRAINT "shipment_location_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_order" ADD CONSTRAINT "delivery_order_loc_dest_id_fkey" FOREIGN KEY ("loc_dest_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_order" ADD CONSTRAINT "delivery_order_loc_ori_id_fkey" FOREIGN KEY ("loc_ori_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_order" ADD CONSTRAINT "delivery_order_truck_id_fkey" FOREIGN KEY ("truck_id") REFERENCES "truck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_delivery_order" ADD CONSTRAINT "shipment_delivery_order_delivery_order_id_fkey" FOREIGN KEY ("delivery_order_id") REFERENCES "delivery_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_delivery_order" ADD CONSTRAINT "shipment_delivery_order_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_line" ADD CONSTRAINT "product_line_delivery_order_id_fkey" FOREIGN KEY ("delivery_order_id") REFERENCES "delivery_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_line" ADD CONSTRAINT "product_line_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truck" ADD CONSTRAINT "truck_dc_id_fkey" FOREIGN KEY ("dc_id") REFERENCES "dc"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "truck" ADD CONSTRAINT "truck_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "truck_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;
