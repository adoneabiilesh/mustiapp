# 🚀 BULK IMPORT - QUICK START

## ⚡ Import 100+ Products in Minutes!

---

## 📋 3 SIMPLE STEPS

### Step 1: Get Sample File
Download one of these sample files:
- **`products-sample.csv`** - 15 ready-to-import products
- **`products-sample.json`** - 5 products with full details

Or use the templates in admin dashboard.

### Step 2: Customize Your Data
Replace with your own products:
- Change product names
- Update prices
- Add descriptions
- Set your restaurant_id
- Update image URLs

### Step 3: Import
**Option A - Admin Dashboard** (Easiest):
1. Go to: `http://localhost:3000/products/bulk-import`
2. Upload your file
3. Review preview
4. Click "Import"

**Option B - SQL** (Fastest):
```sql
INSERT INTO menu_items (name, description, price, category, is_available)
VALUES
  ('Burger', 'Classic burger', 12.99, 'Burgers', true),
  ('Pizza', 'Margherita pizza', 14.99, 'Pizza', true),
  ('Salad', 'Caesar salad', 9.99, 'Salads', true);
```

---

## 📄 QUICK FORMATS

### Minimal CSV (Only Required Fields):
```csv
name,price
Burger,12.99
Pizza,14.99
Salad,9.99
```

### Full CSV (All Fields):
```csv
name,description,price,category,is_available,preparation_time
Burger,"Juicy beef burger",12.99,Burgers,true,15
Pizza,"Margherita pizza",14.99,Pizza,true,20
Salad,"Caesar salad",9.99,Salads,true,10
```

### JSON Format:
```json
[
  {
    "name": "Burger",
    "description": "Classic burger",
    "price": 12.99,
    "category": "Burgers",
    "is_available": true,
    "preparation_time": 15
  }
]
```

---

## 🎯 FIELD GUIDE

### REQUIRED (Must Have):
- `name` - Product name
- `price` - Price (number, no symbols)

### RECOMMENDED (Should Have):
- `description` - Product description
- `category` - Main category
- `image_url` - Product image URL
- `is_available` - true/false (default: true)

### OPTIONAL (Nice to Have):
- `restaurant_id` - Your restaurant UUID
- `categories` - Multiple categories
- `is_featured` - Show in featured section
- `preparation_time` - Minutes to prepare
- `calories` - Calorie count
- `weight` - Product weight
- `allergens` - Allergen information
- `dietary_info` - Dietary information

---

## 💡 TIPS

### ✅ DO:
- Start with 5-10 products as a test
- Use valid image URLs (https://)
- Keep prices as numbers (12.99, not $12.99)
- Use true/false for booleans

### ❌ DON'T:
- Mix currency symbols in prices
- Leave required fields empty
- Use local file paths for images
- Import everything at once (batch it!)

---

## 🎨 IMAGE URLS

### Free Stock Photos:
```
https://images.unsplash.com/photo-[ID]
https://source.unsplash.com/800x600/?burger
https://picsum.photos/800/600
```

### Your Own Images:
1. Upload to image hosting (Cloudinary, AWS S3, etc.)
2. Get public URL
3. Use in import file

---

## 🔧 EXAMPLE WORKFLOWS

### Workflow 1: Quick Start (5 min)
1. Download `products-sample.csv`
2. Replace names and prices
3. Upload to admin dashboard
4. Done! ✅

### Workflow 2: Full Menu (15 min)
1. Create Excel spreadsheet
2. Add all products with details
3. Export as CSV
4. Upload and import
5. Done! ✅

### Workflow 3: Multiple Restaurants (30 min)
1. Get restaurant IDs from `/admin/restaurants`
2. Create separate CSV per restaurant
3. Import each file
4. Done! ✅

---

## 📊 REAL EXAMPLES

### Example 1: Pizza Restaurant
```csv
name,description,price,category,preparation_time
Margherita,"Tomato, mozzarella, basil",14.99,Pizza,20
Pepperoni,"Tomato, mozzarella, pepperoni",16.99,Pizza,22
Hawaiian,"Tomato, mozzarella, ham, pineapple",15.99,Pizza,20
Vegetarian,"Tomato, mozzarella, mixed vegetables",15.99,Pizza,25
Four Cheese,"Mozzarella, parmesan, gorgonzola, ricotta",17.99,Pizza,18
```

### Example 2: Fast Food
```csv
name,price,category,calories,preparation_time
Cheeseburger,8.99,Burgers,550,10
Double Burger,12.99,Burgers,820,12
Chicken Burger,9.99,Burgers,480,10
Fries,3.99,Sides,350,5
Onion Rings,4.99,Sides,420,6
Milkshake,4.99,Drinks,400,3
Soda,2.99,Drinks,150,1
```

### Example 3: Healthy Cafe
```json
[
  {
    "name": "Acai Bowl",
    "description": "Acai berries with granola and fresh fruit",
    "price": 11.99,
    "category": "Breakfast",
    "categories": ["Breakfast", "Healthy", "Vegan"],
    "calories": 380,
    "preparation_time": 8,
    "dietary_info": ["Vegan", "Gluten-Free"],
    "is_featured": true
  },
  {
    "name": "Green Smoothie",
    "description": "Spinach, banana, mango, and almond milk",
    "price": 7.99,
    "category": "Drinks",
    "categories": ["Drinks", "Healthy", "Vegan"],
    "calories": 220,
    "preparation_time": 5,
    "dietary_info": ["Vegan", "Dairy-Free"]
  }
]
```

---

## 🚨 TROUBLESHOOTING

### Problem: "Missing required fields"
**Solution:** Make sure every row has `name` and `price`

### Problem: "Invalid price value"
**Solution:** Remove $, €, or text from price column

### Problem: "Foreign key violation"
**Solution:** Use valid `restaurant_id` or leave empty

### Problem: "No products imported"
**Solution:** Check file format and required fields

---

## 📞 QUICK HELP

### Get Restaurant ID:
```sql
SELECT id, name FROM restaurants;
```

### Check Import Success:
```sql
SELECT * FROM menu_items ORDER BY created_at DESC LIMIT 10;
```

### Delete Test Products:
```sql
DELETE FROM menu_items WHERE name LIKE '%TEST%';
```

---

## 🎉 SUCCESS!

After import, your products will:
- ✅ Appear in admin dashboard
- ✅ Show in mobile app menu
- ✅ Be searchable
- ✅ Be filterable by category
- ✅ Sync with selected restaurant

**Time saved: Hours → Minutes!** ⚡

---

## 📁 FILES AVAILABLE

In your project root:
- `products-sample.csv` - 15 sample products
- `products-sample.json` - 5 sample products (detailed)
- `BULK_IMPORT_GUIDE.md` - Complete guide
- `BULK_IMPORT_QUICK_START.md` - This file

In admin dashboard:
- `/products/bulk-import` - Import page
- Templates available for download

---

## 🚀 GET STARTED NOW!

```bash
# 1. Open admin dashboard
cd admin-dashboard
npm run dev

# 2. Navigate to bulk import
http://localhost:3000/products/bulk-import

# 3. Download template
# 4. Fill with products
# 5. Import!
```

**Import 100 products in under 5 minutes!** 🎊

---

**Need more help? Check `BULK_IMPORT_GUIDE.md` for detailed instructions!**


