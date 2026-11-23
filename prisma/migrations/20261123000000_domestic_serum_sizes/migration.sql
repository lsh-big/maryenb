UPDATE "Product"
SET "koreaSalesNote" = '해외 전용 · 국내 판매 제외',
    "price" = NULL,
    "compareAtPrice" = NULL,
    "storeUrl" = NULL,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" IN ('VNC15', 'ANC5', 'ANC10');

INSERT INTO "Product" (
  "slug", "code", "name", "tagline", "description", "ingredients", "category", "volume",
  "imageUrl", "galleryUrls", "isActive", "updatedAt"
)
SELECT
  p."slug" || '-60ml', p."code" || '-60ML', p."name", p."tagline", p."description",
  p."ingredients", p."category", '60ml',
  images.prefix || '_01.png', ARRAY[images.prefix || '_01.png', images.prefix || '_02.png'],
  p."isActive", CURRENT_TIMESTAMP
FROM "Product" p
JOIN (VALUES
  ('RNT', '/images/product/amazon_RNT_60ml'),
  ('TNA5', '/images/product/amazon_tna5_60ml'),
  ('NTZ20', '/images/product/amazon_NTZ20_60ml')
) AS images(code, prefix) ON images.code = p."code"
ON CONFLICT ("slug") DO NOTHING;
