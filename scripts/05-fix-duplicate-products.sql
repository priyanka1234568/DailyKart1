-- Fix duplicate products issue
-- Step 1: Remove duplicate products, keeping only the first occurrence
-- This will delete all duplicate products except the one with the minimum ID

DELETE p1 FROM products p1
INNER JOIN products p2 
WHERE p1.name = p2.name
AND p1.id > p2.id;

-- Step 2: Add UNIQUE constraint to prevent future duplicates
ALTER TABLE products 
ADD CONSTRAINT unique_product_name UNIQUE (name);

