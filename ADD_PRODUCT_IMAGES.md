# How to Add Product Images to DailyKart

## ✅ **Current Status:**
The seed data has been updated with real product images from Unsplash!

## 🖼️ **Two Methods to Add Images:**

### **Method 1: Using External Images (Current - Already Done)**

The seed data now uses high-quality images from Unsplash:
- Fruits: Apple, Banana, Oranges, Lychees
- Vegetables: Potatoes, Brinjal, Cabbage, Spinach
- Grains: Rice, Wheat

**Advantages:**
- ✅ No need to store files locally
- ✅ High-quality professional images
- ✅ Automatic loading
- ✅ Already implemented in seed data

### **Method 2: Using Local Images**

If you want to use your own images:

#### **Step 1: Add Your Images**
Place your product images in:
```
public/images/products/
```

Example structure:
```
public/
└── images/
    └── products/
        ├── apple.jpg
        ├── banana.jpg
        ├── orange.jpg
        ├── potato.jpg
        └── rice.jpg
```

#### **Step 2: Update Database**
Run these SQL commands in your MySQL database:

```sql
-- Update with local image paths
UPDATE products SET image_url = '/images/products/apple.jpg' WHERE name = 'Apple';
UPDATE products SET image_url = '/images/products/banana.jpg' WHERE name = 'Banana';
UPDATE products SET image_url = '/images/products/orange.jpg' WHERE name = 'Oranges';
UPDATE products SET image_url = '/images/products/potato.jpg' WHERE name = 'Potatoes';
UPDATE products SET image_url = '/images/products/rice.jpg' WHERE name = 'Rice';
```

## 🚀 **To Apply the Changes:**

### **Option 1: Re-run Seed Data (Recommended)**
If you want to update existing products, run:
```sql
-- Drop existing data and re-run
-- Then execute: scripts/02-seed-data.sql
```

### **Option 2: Update Individual Products**
Run the UPDATE statements from `scripts/04-update-product-images.sql`:
```sql
-- Fruits
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop' WHERE name = 'Apple';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop' WHERE name = 'Banana';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=400&fit=crop' WHERE name = 'Oranges';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop' WHERE name = 'Lychees';

-- Vegetables
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&h=400&fit=crop' WHERE name = 'Potatoes';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1604977049386-2e11299fad47?w=400&h=400&fit=crop' WHERE name = 'Brinjal';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=400&fit=crop' WHERE name = 'Cabbage';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop' WHERE name = 'Spinach';

-- Grains
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=400&fit=crop' WHERE name = 'Rice';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1551334787-21bf12b2db27?w=400&h=400&fit=crop' WHERE name = 'Wheat';
```

## ✅ **What's Already Done:**

1. ✅ Created directory structure: `public/images/products/`
2. ✅ Updated seed data with real product images
3. ✅ Created SQL script to update existing products
4. ✅ All images use Unsplash URLs (high quality, reliable)

## 🎨 **Image Details:**

All images are:
- **Size:** 400x400 pixels
- **Quality:** High resolution
- **Source:** Unsplash (free, high-quality stock photos)
- **Format:** JPG with web optimization

## 🔍 **How Images Are Displayed:**

The application code will automatically:
- Load images from the database `image_url` field
- Display them in product cards
- Fall back to placeholder if image fails to load
- Use responsive sizing

## 📝 **Adding New Products with Images:**

When adding new products via the admin panel or database:

```sql
INSERT INTO products (name, description, price, quantity, category_id, image_url) VALUES
('Mango', 'Fresh organic mango', 150.0, 20, (SELECT id FROM categories WHERE name = 'Fruits'), 'https://images.unsplash.com/photo-...?w=400&h=400&fit=crop');
```

## 🎯 **Quick Test:**

1. Run the seed data or UPDATE statements
2. Refresh your browser (`Ctrl + F5`)
3. Visit the shop page
4. Products should now show real images instead of placeholders!

All product images are now set up and ready to use! 🎉
