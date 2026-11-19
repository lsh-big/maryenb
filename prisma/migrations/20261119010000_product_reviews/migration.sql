CREATE TABLE "ProductReview" (
    "id" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProductReview_rating_check" CHECK ("rating" BETWEEN 1 AND 5),
    CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ProductReview_productId_ownerId_key" ON "ProductReview"("productId", "ownerId");
CREATE INDEX "ProductReview_productId_createdAt_id_idx" ON "ProductReview"("productId", "createdAt", "id");
CREATE INDEX "ProductReview_orderId_idx" ON "ProductReview"("orderId");

CREATE TABLE "ReviewPhoto" (
    "reviewId" TEXT NOT NULL,
    "image" BYTEA NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    CONSTRAINT "ReviewPhoto_pkey" PRIMARY KEY ("reviewId"),
    CONSTRAINT "ReviewPhoto_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
