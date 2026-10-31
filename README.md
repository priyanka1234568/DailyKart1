# DailyKart - E-Commerce Grocery Store

A complete e-commerce application built with Next.js and MySQL for buying fresh groceries online.

## Features

✅ **User Authentication**
- Sign up and login for customers and admins
- Password hashing for security
- Session management with localStorage

✅ **Dashboard**
- Welcome page after login
- Three category shortcuts (Fruits, Vegetables, Grains)
- Quick navigation to shop

✅ **Shopping**
- Browse products by category
- View product details (price, stock, description)
- Add items to cart with quantity selection
- Category filtering

✅ **Cart Management**
- View all items in cart
- Update quantities (+ / - buttons)
- Remove items from cart
- Real-time total calculation
- Order summary with tax and delivery charges

✅ **Checkout & Billing**
- Shipping address form
- Order summary
- Final total calculation (Subtotal + 10% Tax + ₹50 Delivery)
- Place order functionality

✅ **Order Confirmation**
- Order success page
- Order ID display
- Confirmation email notification
- Continue shopping or return to dashboard

## Database Setup

### Prerequisites
- MySQL Server running locally
- MySQL Workbench or any MySQL client

### Step 1: Create Database
\`\`\`sql
CREATE DATABASE dailykart;
USE dailykart;
\`\`\`

### Step 2: Run SQL Scripts
Execute the following scripts in order:

1. **00-cleanup-database.sql** - Drops any incorrect tables
2. **01-init-database.sql** - Creates all tables
3. **02-seed-data.sql** - Inserts sample data

### Database Tables
- **users** - User accounts (customers and admins)
- **categories** - Product categories (Fruits, Vegetables, Grains)
- **products** - Product listings with prices and stock
- **cart_items** - Shopping cart items per user
- **orders** - Order records
- **order_items** - Items in each order

## Environment Setup

### 1. Create `.env.local` file
\`\`\`
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=priyanka123
MYSQL_DATABASE=dailykart
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` in your browser.

## User Flow

### For Customers:
1. **Home Page** → Click "Sign Up" or "Login"
2. **Sign Up** → Create account as "Customer"
3. **Dashboard** → View three categories
4. **Shop** → Browse products, add to cart
5. **Cart** → Review items, adjust quantities
6. **Billing** → Enter shipping address
7. **Order Confirmation** → Order placed successfully

### For Admins:
1. **Home Page** → Click "Sign Up"
2. **Sign Up** → Create account as "Admin"
3. **Admin Dashboard** → Manage products (add, edit, delete)

## Sample Credentials

After running the seed script, you can use:
- **Email**: test@example.com
- **Password**: password123

Or create your own account during signup.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `GET /api/products?categoryId=1` - Get products by category
- `GET /api/categories` - Get all categories

### Cart
- `GET /api/cart?userId=1` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart item quantity
- `DELETE /api/cart` - Remove item from cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[orderId]` - Get order details

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check credentials in `.env.local`
- Verify database name is "dailykart"

### Login/Signup Not Working
- Check browser console (F12) for error messages
- Verify database tables are created
- Check `.env.local` file is in root directory

### Products Not Loading
- Ensure seed data script was executed
- Check database has categories and products
- Verify user is logged in

## Project Structure

\`\`\`
app/
├── page.tsx                 # Home page
├── dashboard/page.tsx       # Dashboard after login
├── shop/page.tsx           # Shopping page
├── cart/page.tsx           # Shopping cart
├── billing/page.tsx        # Checkout page
├── order-confirmation/     # Order success page
└── api/
    ├── auth/               # Authentication routes
    ├── products/           # Product routes
    ├── cart/               # Cart routes
    └── orders/             # Order routes

components/
├── auth-modal.tsx          # Login/Signup modal
└── ui/                     # UI components

lib/
├── db.ts                   # Database utilities
└── auth.ts                 # Authentication utilities

scripts/
├── 00-cleanup-database.sql # Cleanup script
├── 01-init-database.sql    # Database initialization
└── 02-seed-data.sql        # Sample data
\`\`\`

## Technologies Used

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: MySQL
- **Authentication**: Password hashing with crypto
- **State Management**: localStorage, React hooks

## License

MIT License - Feel free to use this project for learning and development.
\`\`\`

```tsx file="" isHidden
