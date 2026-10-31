# DailyKart - Complete Setup Guide

## 🚀 Quick Start

Follow these steps to get DailyKart running on your local machine.

---

## Step 1: Database Setup

### 1.1 Open MySQL Workbench
- Launch MySQL Workbench
- Connect to your local MySQL server (localhost:3306)
- Username: `root`
- Password: `priyanka123`

### 1.2 Create Database
Run this command in MySQL Workbench:
\`\`\`sql
CREATE DATABASE dailykart;
USE dailykart;
\`\`\`

### 1.3 Run SQL Scripts
Execute the following scripts in order:

**Script 1: Cleanup (if needed)**
\`\`\`sql
DROP TABLE IF EXISTS users1;
\`\`\`

**Script 2: Create Tables**
Copy and paste the entire content from `scripts/01-init-database.sql` and execute it.

**Script 3: Insert Sample Data**
Copy and paste the entire content from `scripts/02-seed-data.sql` and execute it.

### 1.4 Verify Database
Run this to verify tables were created:
\`\`\`sql
SHOW TABLES;
SELECT * FROM categories;
SELECT * FROM products;
\`\`\`

You should see:
- 6 tables: users, categories, products, cart_items, orders, order_items
- 3 categories: Fruits, Vegetables, Grains
- 10 sample products

---

## Step 2: Environment Configuration

### 2.1 Create `.env.local` file
In the root directory of the project, create a file named `.env.local` with:

\`\`\`
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=priyanka123
MYSQL_DATABASE=dailykart
\`\`\`

**Important**: This file should be in the root directory (same level as `package.json`)

---

## Step 3: Install Dependencies

### 3.1 Install npm packages
\`\`\`bash
npm install
\`\`\`

This will install all required dependencies including:
- next
- react
- mysql2
- tailwindcss
- shadcn/ui components

---

## Step 4: Run the Application

### 4.1 Start Development Server
\`\`\`bash
npm run dev
\`\`\`

### 4.2 Open in Browser
Visit: `http://localhost:3000`

You should see the DailyKart homepage with:
- Welcome message
- Features section
- Category preview
- Login/Sign Up buttons

---

## Step 5: Test the Application

### 5.1 Create a New Account
1. Click "Sign Up" button
2. Fill in:
   - Full Name: Your name
   - Email: your@email.com
   - Password: any password
   - Account Type: Select "Customer"
3. Click "Sign Up"

### 5.2 You should be redirected to Dashboard
- See welcome message with your name
- See three category cards (Fruits, Vegetables, Grains)
- See "My Cart" and "Logout" buttons

### 5.3 Browse Products
1. Click on "Fruits" category
2. You should see products like Apple, Banana, Oranges, Lychees
3. Each product shows:
   - Product image
   - Product name
   - Description
   - Price (₹)
   - Stock quantity
   - Quantity selector
   - "Add to Cart" button

### 5.4 Add Items to Cart
1. Select quantity (1-5)
2. Click "Add to Cart"
3. You should see success message
4. Click "My Cart" in navigation

### 5.5 View Cart
- See all items added
- See item count
- See price per item
- See total price
- See quantity adjustment buttons (+ / -)
- See "Remove" button for each item
- See order summary with:
  - Subtotal
  - Tax (10%)
  - Delivery charge (₹50)
  - Total amount

### 5.6 Proceed to Checkout
1. Click "Proceed to Checkout"
2. Fill in shipping address:
   - Full Address
   - City
   - Zip Code
   - Phone Number
3. Click "Place Order"

### 5.7 Order Confirmation
- See success message
- See Order ID
- See confirmation email notification
- Options to continue shopping or return to dashboard

---

## Troubleshooting

### Issue: "Failed to connect to database"
**Solution:**
- Ensure MySQL is running
- Check `.env.local` file exists in root directory
- Verify credentials: root / priyanka123
- Verify database name: dailykart

### Issue: "No database selected" error
**Solution:**
- Run `CREATE DATABASE dailykart;` in MySQL Workbench
- Run the SQL scripts to create tables

### Issue: "Table doesn't exist" error
**Solution:**
- Run `scripts/01-init-database.sql` to create tables
- Run `scripts/02-seed-data.sql` to add sample data

### Issue: Login/Signup not working
**Solution:**
- Open browser console (F12)
- Check for error messages
- Verify database connection is working
- Check `.env.local` file

### Issue: Products not showing
**Solution:**
- Verify seed data was inserted: `SELECT * FROM products;`
- Check categories exist: `SELECT * FROM categories;`
- Refresh the page

### Issue: "Cannot add to cart"
**Solution:**
- Ensure you're logged in
- Check browser console for errors
- Verify user ID is stored in localStorage

---

## File Structure

\`\`\`
dailykart/
├── app/
│   ├── page.tsx                    # Home page
│   ├── dashboard/page.tsx          # Dashboard
│   ├── shop/page.tsx              # Shopping page
│   ├── cart/page.tsx              # Cart page
│   ├── billing/page.tsx           # Checkout page
│   ├── order-confirmation/page.tsx # Order success
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── signup/route.ts
│   │   ├── products/route.ts
│   │   ├── categories/route.ts
│   │   ├── cart/route.ts
│   │   └── orders/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── auth-modal.tsx
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── db.ts                      # Database functions
│   ├── auth.ts                    # Auth utilities
│   └── utils.ts
├── scripts/
│   ├── 00-cleanup-database.sql
│   ├── 01-init-database.sql
│   └── 02-seed-data.sql
├── .env.local                     # Environment variables
├── package.json
├── tsconfig.json
├── next.config.mjs
└── README.md
\`\`\`

---

## Database Schema

### users table
\`\`\`
id (INT, Primary Key)
email (VARCHAR, Unique)
password_hash (VARCHAR)
full_name (VARCHAR)
user_type (VARCHAR) - 'admin' or 'user'
is_verified (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
\`\`\`

### categories table
\`\`\`
id (INT, Primary Key)
name (VARCHAR, Unique) - 'Fruits', 'Vegetables', 'Grains'
description (TEXT)
created_at (TIMESTAMP)
\`\`\`

### products table
\`\`\`
id (INT, Primary Key)
name (VARCHAR)
description (TEXT)
price (DECIMAL)
quantity (INT)
category_id (INT, Foreign Key)
image_url (VARCHAR)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
\`\`\`

### cart_items table
\`\`\`
id (INT, Primary Key)
user_id (INT, Foreign Key)
product_id (INT, Foreign Key)
quantity (INT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
\`\`\`

### orders table
\`\`\`
id (INT, Primary Key)
user_id (INT, Foreign Key)
total_amount (DECIMAL)
status (VARCHAR) - 'pending', 'completed', 'cancelled'
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
\`\`\`

### order_items table
\`\`\`
id (INT, Primary Key)
order_id (INT, Foreign Key)
product_id (INT, Foreign Key)
quantity (INT)
price (DECIMAL)
created_at (TIMESTAMP)
\`\`\`

---

## Sample Test Data

After running seed scripts, you have:

### Categories
- Fruits (ID: 1)
- Vegetables (ID: 2)
- Grains (ID: 3)

### Products
**Fruits:**
- Apple - ₹220
- Banana - ₹75
- Oranges - ₹85
- Lychees - ₹165.5

**Vegetables:**
- Potatoes - ₹45
- Brinjal - ₹55.5
- Cabbage - ₹38.5
- Spinach - ₹25

**Grains:**
- Rice - ₹120
- Wheat - ₹80

---

## Features Implemented

✅ User Authentication (Sign Up / Login)
✅ Dashboard with Category Navigation
✅ Product Browsing by Category
✅ Shopping Cart Management
✅ Add/Remove/Update Cart Items
✅ Checkout with Shipping Address
✅ Order Placement
✅ Order Confirmation
✅ Responsive Design
✅ Error Handling
✅ Loading States

---

## Next Steps

After successful setup, you can:

1. **Customize Products** - Add more products via database
2. **Add Admin Panel** - Create admin dashboard for product management
3. **Email Integration** - Send real confirmation emails
4. **Payment Gateway** - Integrate Stripe or Razorpay
5. **User Profiles** - Add user account management
6. **Order History** - Show past orders
7. **Reviews & Ratings** - Add product reviews

---

## Support

If you encounter any issues:
1. Check the Troubleshooting section above
2. Verify all steps were followed correctly
3. Check browser console (F12) for error messages
4. Verify MySQL is running and database exists
5. Check `.env.local` file has correct credentials

---

## License

MIT License - Free to use and modify

Happy Shopping! 🛒
