# 📦 BULK IMPORT GUIDE - Mass Import Products

## ✨ Overview

Import hundreds of products into your admin dashboard at once using CSV or JSON files!

---

## 🚀 QUICK START

### Option 1: Using Admin Dashboard (Recommended)

1. **Navigate to**: `http://localhost:3000/products/bulk-import`
2. **Download template**: Click "Download CSV Template" or "Download JSON Template"
3. **Fill template**: Add your products to the template
4. **Upload file**: Select your filled template
5. **Import**: Click "Import Products"

### Option 2: Direct Database Insert

Use the SQL script or Node.js script provided below.

---

## 📄 FILE FORMATS

### CSV Format

```csv
name,description,price,image_url,restaurant_id,category,categories,is_available,is_featured,preparation_time,calories,weight,allergens,dietary_info
Classic Burger,"Juicy beef patty with lettuce, tomato",12.99,https://example.com/burger.jpg,rest-123,Burgers,"Burgers,Main Course",true,false,15,650,250g,"Gluten,Dairy",Contains Meat
Margherita Pizza,"Classic pizza with tomato and mozzarella",14.99,https://example.com/pizza.jpg,rest-123,Pizza,"Pizza,Main Course",true,true,20,800,350g,"Gluten,Dairy",Vegetarian
```

### JSON Format

```json
[
  {
    "name": "Classic Burger",
    "description": "Juicy beef patty with lettuce, tomato, and our special sauce",
    "price": 12.99,
    "image_url": "https://example.com/burger.jpg",
    "restaurant_id": "rest-123",
    "category": "Burgers",
    "categories": ["Burgers", "Main Course"],
    "is_available": true,
    "is_featured": false,
    "preparation_time": 15,
    "calories": 650,
    "weight": "250g",
    "allergens": ["Gluten", "Dairy"],
    "dietary_info": ["Contains Meat"]
  },
  {
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce, mozzarella, and fresh basil",
    "price": 14.99,
    "image_url": "https://example.com/pizza.jpg",
    "restaurant_id": "rest-123",
    "category": "Pizza",
    "categories": ["Pizza", "Main Course"],
    "is_available": true,
    "is_featured": true,
    "preparation_time": 20,
    "calories": 800,
    "weight": "350g",
    "allergens": ["Gluten", "Dairy"],
    "dietary_info": ["Vegetarian"]
  }
]
```

---

## 📋 FIELD REFERENCE

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Product name | "Classic Burger" |
| `price` | number | Price in dollars | 12.99 |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | string | Product description | "Juicy beef patty..." |
| `image_url` | string | Image URL | "https://example.com/image.jpg" |
| `restaurant_id` | string | Restaurant UUID | "abc-123-def-456" |
| `category` | string | Main category | "Burgers" |
| `categories` | array/string | All categories | ["Burgers", "Main"] or "Burgers,Main" |
| `is_available` | boolean | Available for order | true |
| `is_featured` | boolean | Show in featured | false |
| `preparation_time` | number | Minutes to prepare | 15 |
| `calories` | number | Calorie count | 650 |
| `weight` | string | Product weight | "250g" |
| `allergens` | array/string | Allergen list | ["Gluten", "Dairy"] |
| `dietary_info` | array/string | Dietary info | ["Vegetarian"] |

---

## 💡 EXAMPLES

### Example 1: Fast Food Menu

**CSV:**
```csv
name,description,price,category,preparation_time,calories
Cheeseburger,Classic burger with cheese,8.99,Burgers,10,550
French Fries,Crispy golden fries,3.99,Sides,5,350
Milkshake,Thick vanilla shake,4.99,Drinks,3,400
```

### Example 2: Restaurant Menu

**JSON:**
```json
[
  {
    "name": "Grilled Salmon",
    "description": "Atlantic salmon with lemon butter",
    "price": 24.99,
    "restaurant_id": "downtown-bistro-001",
    "category": "Seafood",
    "categories": ["Seafood", "Main Course", "Healthy"],
    "is_available": true,
    "is_featured": true,
    "preparation_time": 25,
    "calories": 450,
    "weight": "300g",
    "allergens": ["Fish"],
    "dietary_info": ["Gluten-Free", "High Protein"]
  },
  {
    "name": "Caesar Salad",
    "description": "Crisp romaine with parmesan and croutons",
    "price": 12.99,
    "restaurant_id": "downtown-bistro-001",
    "category": "Salads",
    "categories": ["Salads", "Starters", "Vegetarian"],
    "is_available": true,
    "preparation_time": 10,
    "calories": 320,
    "allergens": ["Dairy", "Gluten"],
    "dietary_info": ["Vegetarian"]
  }
]
```

---

## 🛠️ ALTERNATIVE METHODS

### Method 1: SQL Script

Create a file `import-products.sql`:

```sql
-- Import products directly via SQL

INSERT INTO menu_items (name, description, price, restaurant_id, category, categories, is_available, is_featured, preparation_time, calories)
VALUES
  ('Classic Burger', 'Juicy beef patty with lettuce and tomato', 12.99, 'your-restaurant-id', 'Burgers', ARRAY['Burgers', 'Main Course'], true, false, 15, 650),
  ('Margherita Pizza', 'Classic pizza with tomato and mozzarella', 14.99, 'your-restaurant-id', 'Pizza', ARRAY['Pizza', 'Main Course'], true, true, 20, 800),
  ('Caesar Salad', 'Crisp romaine with parmesan dressing', 9.99, 'your-restaurant-id', 'Salads', ARRAY['Salads', 'Starters'], true, false, 10, 320);

-- Check results
SELECT * FROM menu_items ORDER BY created_at DESC LIMIT 10;
```

**Run it:**
```bash
# In Supabase SQL Editor, paste and execute
```

### Method 2: Node.js Script

Create a file `import-products.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const Papa = require('papaparse');

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_KEY'
);

async function importFromCSV(filePath) {
  const csv = fs.readFileSync(filePath, 'utf8');
  
  Papa.parse(csv, {
    header: true,
    complete: async (results) => {
      const products = results.data.filter(row => row.name);
      
      console.log(`Importing ${products.length} products...`);
      
      for (const product of products) {
        const { error } = await supabase
          .from('menu_items')
          .insert({
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price),
            image_url: product.image_url || '',
            restaurant_id: product.restaurant_id || null,
            category: product.category || 'Other',
            categories: product.categories ? product.categories.split(',') : [],
            is_available: product.is_available === 'true',
            is_featured: product.is_featured === 'true',
            preparation_time: parseInt(product.preparation_time) || 15,
            calories: parseInt(product.calories) || null,
            weight: product.weight || null,
            allergens: product.allergens ? product.allergens.split(',') : [],
            dietary_info: product.dietary_info ? product.dietary_info.split(',') : [],
          });
          
        if (error) {
          console.error(`Failed to import ${product.name}:`, error.message);
        } else {
          console.log(`✓ Imported ${product.name}`);
        }
      }
      
      console.log('Import complete!');
    }
  });
}

// Usage
importFromCSV('./products.csv');
```

**Run it:**
```bash
node import-products.js
```

### Method 3: Excel/Google Sheets

1. **Create spreadsheet** with columns matching the fields above
2. **Fill in your products**
3. **Export as CSV**
4. **Upload via admin dashboard**

---

## 🎯 BEST PRACTICES

### 1. Prepare Your Data

**Do:**
- ✅ Use consistent formatting
- ✅ Include required fields (name, price)
- ✅ Use valid URLs for images
- ✅ Use correct restaurant IDs
- ✅ Test with a small batch first (5-10 items)

**Don't:**
- ❌ Leave required fields empty
- ❌ Use special characters in names
- ❌ Mix currency symbols in prices
- ❌ Use invalid URLs

### 2. Image URLs

**Good:**
```
https://yoursite.com/images/burger.jpg
https://cdn.example.com/pizza.png
https://s3.amazonaws.com/bucket/image.jpg
```

**Bad:**
```
C:\Users\Desktop\image.jpg  ❌ (Local path)
burger.jpg  ❌ (Relative path)
http://localhost/image.jpg  ❌ (Local server)
```

### 3. Categories

**Single category (CSV):**
```
Burgers,Main Course,Popular
```

**Multiple categories (JSON):**
```json
["Burgers", "Main Course", "Popular"]
```

### 4. Boolean Values

**CSV format:**
```csv
true, false, TRUE, FALSE, 1, 0
```

**JSON format:**
```json
true, false
```

---

## ⚠️ COMMON ERRORS

### Error 1: Missing Required Fields

**Error:** `Missing required fields for: [product name]`

**Solution:** Make sure every row has `name` and `price`

### Error 2: Invalid Price

**Error:** `Invalid price value`

**Solution:** Use numbers only (no $, €, or text)
- ✅ Correct: `12.99`
- ❌ Wrong: `$12.99` or `12.99 USD`

### Error 3: Invalid Restaurant ID

**Error:** `Foreign key violation`

**Solution:** Use valid restaurant ID or leave empty
```
Get restaurant ID from: /admin/restaurants
Or leave blank to skip restaurant assignment
```

### Error 4: Invalid Boolean

**Error:** `Invalid boolean value`

**Solution:** Use true/false, 1/0, or TRUE/FALSE

---

## 📊 IMPORT LIMITS

| File Type | Max Size | Max Rows | Recommended |
|-----------|----------|----------|-------------|
| CSV | 5 MB | 10,000 | 100-500 |
| JSON | 10 MB | 5,000 | 50-200 |

**Tips:**
- Break large imports into smaller batches
- Import 100-500 items at a time
- Monitor progress in console
- Check for errors after each batch

---

## 🔍 VALIDATION

Products are validated before import:

**Checks:**
- ✅ Required fields present
- ✅ Price is a valid number
- ✅ Restaurant ID exists (if provided)
- ✅ Categories are valid
- ✅ Boolean values are correct
- ✅ Preparation time is positive

---

## 🎉 SAMPLE FILES

### Sample 1: Simple Menu (10 items)

```csv
name,description,price,category
Burger,Classic beef burger,9.99,Burgers
Pizza,Margherita pizza,12.99,Pizza
Pasta,Spaghetti carbonara,11.99,Pasta
Salad,Caesar salad,8.99,Salads
Soup,Tomato soup,6.99,Soups
Sandwich,Club sandwich,10.99,Sandwiches
Fries,French fries,4.99,Sides
Shake,Vanilla milkshake,5.99,Drinks
Coffee,Espresso,3.99,Drinks
Cake,Chocolate cake,7.99,Desserts
```

### Sample 2: Full Details (5 items)

```json
[
  {
    "name": "Gourmet Burger",
    "description": "Premium Angus beef with truffle aioli",
    "price": 16.99,
    "restaurant_id": "rest-001",
    "category": "Burgers",
    "categories": ["Burgers", "Premium", "Main Course"],
    "is_available": true,
    "is_featured": true,
    "preparation_time": 18,
    "calories": 720,
    "weight": "300g",
    "allergens": ["Gluten", "Dairy", "Eggs"],
    "dietary_info": ["Contains Meat", "High Protein"],
    "image_url": "https://example.com/gourmet-burger.jpg"
  }
]
```

---

## 🚀 QUICK IMPORT STEPS

1. **Download template** from admin dashboard
2. **Fill with your products** (Excel/Google Sheets)
3. **Export as CSV**
4. **Upload to admin dashboard**
5. **Review preview**
6. **Click Import**
7. **Check results**
8. **View products** in menu

**Time to import 100 products: ~2 minutes!** ⚡

---

## 📞 SUPPORT

**Need help?**
- Check the preview before importing
- Start with a small test batch (5-10 items)
- Verify required fields are filled
- Check the import results for errors
- Review error messages for solutions

---

## 🎊 BENEFITS

**Before:** Adding products one by one
- ⏱️ ~5 minutes per product
- 😫 100 products = 8+ hours
- 🐛 More prone to errors

**After:** Bulk import
- ⚡ ~100 products in 2 minutes
- 🎯 Consistent formatting
- ✅ Validation before import
- 📊 Clear error reporting

**Save hours of manual work!** 🚀

---

## 📁 FILES TO DOWNLOAD

Create these sample files:
- `products-template.csv` - Basic template
- `products-template.json` - JSON template
- `sample-menu.csv` - Example menu
- `import-products.js` - Node.js script

**All available in the admin dashboard!**


