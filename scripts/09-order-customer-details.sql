-- Customer and delivery fields used by the admin Customer Orders view.
-- The app also adds these columns automatically on startup if they are missing.

ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cod';
ALTER TABLE orders ADD COLUMN phone VARCHAR(30) NULL;
ALTER TABLE orders ADD COLUMN delivery_address TEXT NULL;
ALTER TABLE orders ADD COLUMN city VARCHAR(100) NULL;
ALTER TABLE orders ADD COLUMN zip_code VARCHAR(20) NULL;
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN expected_delivery_at DATETIME NULL;

UPDATE orders
SET payment_status = 'paid'
WHERE LOWER(COALESCE(payment_method, 'cod')) = 'online'
  AND (payment_status IS NULL OR payment_status = '' OR payment_status = 'pending');

UPDATE orders
SET payment_status = 'pending'
WHERE LOWER(COALESCE(payment_method, 'cod')) <> 'online'
  AND (payment_status IS NULL OR payment_status = '');

UPDATE orders
SET expected_delivery_at = DATE_ADD(created_at, INTERVAL 1 HOUR)
WHERE expected_delivery_at IS NULL;
