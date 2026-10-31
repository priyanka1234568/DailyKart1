-- Add payment_method column to orders table
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cod' AFTER status;


