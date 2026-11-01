-- Add grocery inventory fields used by Product Management.
-- Existing product rows are preserved.
-- MySQL 5.x does not support ADD COLUMN IF NOT EXISTS, so this script is idempotent via INFORMATION_SCHEMA.
-- The app also adds these columns automatically on first product request.

SET @db := DATABASE();

SET @has_minimum_stock := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'products' AND COLUMN_NAME = 'minimum_stock'
);
SET @sql := IF(
  @has_minimum_stock = 0,
  'ALTER TABLE products ADD COLUMN minimum_stock INT NOT NULL DEFAULT 10 AFTER quantity',
  'SELECT "minimum_stock already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_expiry_date := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'products' AND COLUMN_NAME = 'expiry_date'
);
SET @sql := IF(
  @has_expiry_date = 0,
  'ALTER TABLE products ADD COLUMN expiry_date DATE NULL AFTER minimum_stock',
  'SELECT "expiry_date already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
