-- One-time initial stock setup requested for the six catalog products.
UPDATE "Product"
SET "stock" = 100, "storeUrl" = NULL, "koreaSalesNote" = NULL,
    "price" = CASE "code"
      WHEN 'ANC5' THEN 15700
      WHEN 'ANC10' THEN 16900
      ELSE "price"
    END,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" IN ('VNC15', 'ANC5', 'ANC10', 'RNT', 'TNA5', 'NTZ20');
