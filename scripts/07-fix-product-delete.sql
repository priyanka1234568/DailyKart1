-- Fix foreign key constraint to allow product deletion
-- This script updates the order_items table to allow cascading deletes

-- Simply alter the foreign key to add CASCADE
-- Note: We'll need to drop and recreate the constraint

-- First, get the exact constraint name
SELECT CONSTRAINT_NAME 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = 'dailykart' 
AND TABLE_NAME = 'order_items' 
AND CONSTRAINT_TYPE = 'FOREIGN KEY'
AND CONSTRAINT_NAME LIKE '%product%';

-- Then drop it manually (run this command from MySQL):
-- ALTER TABLE order_items DROP FOREIGN KEY [constraint_name];

-- Then add it back with CASCADE:
-- ALTER TABLE order_items 
-- ADD CONSTRAINT order_items_ibfk_2 
-- FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
