ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_REVIEW';
ALTER TYPE "OrderStatus" ADD VALUE 'REFUND_PENDING';

ALTER TABLE "Order" ADD COLUMN "ownerId" TEXT,
ADD COLUMN "storeId" TEXT,
ADD COLUMN "reservationExpiresAt" TIMESTAMP(3),
ADD COLUMN "nextPaymentCheckAt" TIMESTAMP(3),
ADD COLUMN "inventoryReleasedAt" TIMESTAMP(3),
ADD COLUMN "paymentIssue" TEXT,
ADD COLUMN "carrier" TEXT,
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "shippedAt" TIMESTAMP(3),
ADD COLUMN "refundRequestedAt" TIMESTAMP(3);

CREATE INDEX "Order_ownerId_createdAt_idx" ON "Order"("ownerId", "createdAt");
CREATE INDEX "Order_status_nextPaymentCheckAt_idx" ON "Order"("status", "nextPaymentCheckAt");

CREATE TABLE "PaymentWebhookEvent" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderOperation" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "operatorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderOperation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OrderOperation_orderId_createdAt_idx" ON "OrderOperation"("orderId", "createdAt");
