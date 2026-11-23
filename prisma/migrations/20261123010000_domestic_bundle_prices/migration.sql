ALTER TABLE "Product" ADD COLUMN "bundlePrices" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[];
ALTER TABLE "OrderItem" ADD COLUMN "lineTotal" DECIMAL(10,0);

UPDATE "Product" p
SET "price" = rates.prices[1],
    "compareAtPrice" = rates.regular,
    "bundlePrices" = rates.prices,
    "updatedAt" = CURRENT_TIMESTAMP
FROM (VALUES
  ('RNT', 16500, ARRAY[13200, 25740, 37120]),
  ('RNT-60ML', 22050, ARRAY[16530, 32190, 46300]),
  ('TNA5', 18900, ARRAY[15120, 29480, 42520]),
  ('TNA5-60ML', 24450, ARRAY[18330, 35690, 51340]),
  ('NTZ20', 18080, ARRAY[14460, 28200, 40680]),
  ('NTZ20-60ML', 23600, ARRAY[17700, 34450, 49560])
) AS rates(code, regular, prices)
WHERE p."code" = rates.code;
