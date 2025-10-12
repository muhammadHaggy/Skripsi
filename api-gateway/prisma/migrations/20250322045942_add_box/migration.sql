-- CreateTable
CREATE TABLE "box" (
    "id" SERIAL NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "pcUrl" TEXT,
    "scanned_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(3),
    "deleted_by" TEXT,

    CONSTRAINT "box_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "box_delivery_order" (
    "box_id" INTEGER NOT NULL,
    "delivery_order_id" INTEGER NOT NULL,

    CONSTRAINT "box_delivery_order_pkey" PRIMARY KEY ("box_id","delivery_order_id")
);

-- AddForeignKey
ALTER TABLE "box_delivery_order" ADD CONSTRAINT "box_delivery_order_delivery_order_id_fkey" FOREIGN KEY ("delivery_order_id") REFERENCES "delivery_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "box_delivery_order" ADD CONSTRAINT "box_delivery_order_box_id_fkey" FOREIGN KEY ("box_id") REFERENCES "box"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
