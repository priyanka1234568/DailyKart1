-- Clean existing products and reseed with correct data
DELETE FROM cart_items;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;

-- Now run 02-seed-data.sql to populate fresh data

