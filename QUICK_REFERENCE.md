# DailyKart - Quick Reference

## URLs

| Page | URL | Description |
|------|-----|-------------|
| Home | http://localhost:3000 | Landing page with login/signup |
| Dashboard | http://localhost:3000/dashboard | Main dashboard after login |
| Shop | http://localhost:3000/shop | Browse all products |
| Shop by Category | http://localhost:3000/shop?category=1 | Filter by category |
| Cart | http://localhost:3000/cart | Shopping cart |
| Billing | http://localhost:3000/billing | Checkout page |
| Order Confirmation | http://localhost:3000/order-confirmation | Order success page |

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/signup | Create new account |
| POST | /api/auth/login | Login to account |
| GET | /api/categories | Get all categories |
| GET | /api/products | Get all products |
| GET | /api/products?categoryId=1 | Get products by category |
| GET | /api/cart?userId=1 | Get cart items |
| POST | /api/cart | Add item to cart |
| PUT | /api/cart | Update cart quantity |
| DELETE | /api/cart | Remove from cart |
| POST | /api/orders | Create order |

## Database Commands

\`\`\`sql
-- View all tables
SHOW TABLES;

-- View users
SELECT * FROM users;

-- View products
SELECT * FROM products;

-- View categories
SELECT * FROM categories;

-- View cart items
SELECT * FROM cart_items;

-- View orders
SELECT * FROM orders;

-- Clear all data (WARNING: Deletes everything)
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM users;
\`\`\`

## Environment Variables

\`\`\`
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=priyanka123
MYSQL_DATABASE=dailykart
\`\`\`

## Common Tasks

### Reset Database
\`\`\`sql
DROP DATABASE dailykart;
CREATE DATABASE dailykart;
USE dailykart;
-- Then run 01-init-database.sql and 02-seed-data.sql
\`\`\`

### Add New Product
\`\`\`sql
INSERT INTO products (name, description, price, quantity, category_id, image_url)
VALUES ('Product Name', 'Description', 100.00, 50, 1, '/placeholder.svg');
\`\`\`

### View User Orders
\`\`\`sql
SELECT o.*, u.email FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.email = 'user@example.com';
\`\`\`

### Check Cart Items
\`\`\`sql
SELECT ci.*, p.name, p.price FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = 1;
\`\`\`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| F12 | Open Developer Console |
| Ctrl+Shift+I | Open Inspector |
| Ctrl+Shift+C | Element Inspector |
| Ctrl+Shift+K | Console |

## Testing Checklist

- [ ] Database created and tables exist
- [ ] Sample data inserted
- [ ] .env.local file created with correct credentials
- [ ] npm install completed
- [ ] npm run dev started successfully
- [ ] Home page loads at localhost:3000
- [ ] Can sign up new account
- [ ] Can login with account
- [ ] Dashboard loads after login
- [ ] Can browse products
- [ ] Can add items to cart
- [ ] Can view cart
- [ ] Can proceed to checkout
- [ ] Can place order
- [ ] Order confirmation page shows
- [ ] Can logout

---

Last Updated: 2025-10-26
