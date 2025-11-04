# 🍔 MUSTIPLACE MENU - IMPORT GUIDE

## 📦 What's Included

I've extracted **ALL products** from your menu images:

- **12 Cocktails** (€8-10)
- **13 Spirits/Liqueurs** (€2-4)
- **12 Soft Drinks** (€1.50-3.50)
- **16 Beers** (€2.50-5)
- **6 Draft Beers** (€4.50-6.50)
- **12 Craft Beers** (€5-7)
- **7 Burgers** (€6.50-10)
- **3 Hotdogs** (€5.50-7)
- **5 Fries/Sides** (€6-7)
- **4 Kebabs** (€7-9)

**Total: 90 products ready to import!**

---

## 🚀 METHOD 1: Admin Dashboard (Easiest)

### Step 1: Get Your Restaurant ID

First, find your Mustiplace restaurant ID:

```sql
-- Run this in Supabase SQL Editor
SELECT id, name FROM restaurants WHERE name LIKE '%Musti%';
```

Copy the `id` value (it will look like: `abc123-def456-ghi789`)

### Step 2: Update the CSV File

1. Open `mustiplace-menu-import.csv`
2. Find & Replace: `mustiplace-restaurant-id` → **YOUR ACTUAL RESTAURANT ID**
3. Save the file

### Step 3: Import via Admin Dashboard

1. Go to: `http://localhost:3000/products/bulk-import`
2. Upload `mustiplace-menu-import.csv`
3. Preview the data
4. Click "Import Products"
5. Done! 🎉

**Time: 2 minutes for 90 products!**

---

## 🚀 METHOD 2: Direct SQL Import (Faster)

### Step 1: Get Restaurant ID (same as above)

### Step 2: Run This SQL

```sql
-- Replace 'YOUR-RESTAURANT-ID' with actual ID before running!

INSERT INTO menu_items (name, description, price, restaurant_id, category, categories, is_available, is_featured, preparation_time, calories)
VALUES
-- COCKTAILS
('Vodka Lemon', 'Classic vodka cocktail with fresh lemon', 8.00, 'YOUR-RESTAURANT-ID', 'Cocktails', ARRAY['Cocktails', 'Drinks'], true, false, 5, 180),
('Gin Lemon', 'Refreshing gin with lemon', 8.00, 'YOUR-RESTAURANT-ID', 'Cocktails', ARRAY['Cocktails', 'Drinks'], true, false, 5, 170),
('Gin Tonic', 'Classic gin and tonic', 8.00, 'YOUR-RESTAURANT-ID', 'Cocktails', ARRAY['Cocktails', 'Drinks'], true, true, 5, 150),
('Jägerbom', 'Jägermeister bomb cocktail', 8.00, 'YOUR-RESTAURANT-ID', 'Cocktails', ARRAY['Cocktails', 'Drinks'], true, false, 5, 200),
('Cuba Libre', 'Rum with cola and lime', 8.00, 'YOUR-RESTAURANT-ID', 'Cocktails', ARRAY['Cocktails', 'Drinks'], true, false, 5, 190),
('Negroni', 'Classic Italian cocktail with gin', 10.00, 'YOUR-RESTAURANT-ID', 'Cocktails', ARRAY['Cocktails', 'Drinks'], true, true, 5, 200),
('Americano', 'Campari and vermouth cocktail', 8.00, 'YOUR-RESTAURANT-ID', 'Cocktails', ARRAY['Cocktails', 'Drinks'], true, false, 5, 150),
('Boulevardier', 'Whiskey-based Negroni variation', 10.00, 'YOUR-RESTAURANT-ID', 'Cocktails', ARRAY['Cocktails', 'Drinks'], true, false, 5, 220),
('Aperol Spritz', 'Italian aperitif with prosecco', 8.00, 'YOUR-RESTAURANT-ID', 'Cocktails', ARRAY['Cocktails', 'Drinks'], true, true, 5, 130),
('Black Russian', 'Vodka and coffee liqueur', 10.00, 'YOUR-RESTAURANT-ID', 'Cocktails', ARRAY['Cocktails', 'Drinks'], true, false, 5, 250),
('Sex on the Beach', 'Fruity vodka cocktail', 9.00, 'YOUR-RESTAURANT-ID', 'Cocktails', ARRAY['Cocktails', 'Drinks'], true, false, 5, 200),
('Loyola', 'Vodka with strawberry and lemon soda', 8.00, 'YOUR-RESTAURANT-ID', 'Cocktails', ARRAY['Cocktails', 'Drinks'], true, false, 5, 180),

-- BURGERS
('Hamburger', 'Beef burger (240g) with lettuce, ketchup, and mayo', 6.50, 'YOUR-RESTAURANT-ID', 'Burgers', ARRAY['Burgers', 'Main Course'], true, true, 15, 550),
('Cheese Burger', 'Beef burger (240g) with cheddar, lettuce, ketchup, and mayo', 7.00, 'YOUR-RESTAURANT-ID', 'Burgers', ARRAY['Burgers', 'Main Course'], true, true, 15, 620),
('Cheese Bacon Burger', 'Beef burger (240g) with cheddar, bacon, lettuce, ketchup, and mayo', 9.00, 'YOUR-RESTAURANT-ID', 'Burgers', ARRAY['Burgers', 'Main Course'], true, true, 15, 720),
('Onion Burger', 'Beef burger (240g) with cheddar, onions, lettuce, ketchup, and mayo', 9.00, 'YOUR-RESTAURANT-ID', 'Burgers', ARRAY['Burgers', 'Main Course'], true, false, 15, 680),
('Chilli Burger', 'Spicy beef burger (240g) with cheddar, jalapeños, lettuce, ketchup, and mayo', 9.00, 'YOUR-RESTAURANT-ID', 'Burgers', ARRAY['Burgers', 'Main Course'], true, false, 15, 690),
('Egg Bacon Burger', 'Beef burger (240g) with cheddar, bacon, egg, lettuce, ketchup, and mayo', 10.00, 'YOUR-RESTAURANT-ID', 'Burgers', ARRAY['Burgers', 'Main Course'], true, true, 15, 780),
('Crispy Chicken Burger', 'Crispy chicken breast (150g) with lettuce and mayo', 7.00, 'YOUR-RESTAURANT-ID', 'Burgers', ARRAY['Burgers', 'Main Course'], true, false, 15, 520),

-- BEERS
('Peroni 66cl', 'Italian lager beer', 4.50, 'YOUR-RESTAURANT-ID', 'Beer', ARRAY['Beer', 'Drinks'], true, true, 2, 210),
('Heineken 66cl', 'Dutch premium lager', 5.00, 'YOUR-RESTAURANT-ID', 'Beer', ARRAY['Beer', 'Drinks'], true, false, 2, 220),
('Corona 35.5cl', 'Mexican beer with lime', 3.50, 'YOUR-RESTAURANT-ID', 'Beer', ARRAY['Beer', 'Drinks'], true, true, 2, 135),

-- FRIES & SIDES
('Patate Fritte', 'Crispy golden french fries', 6.00, 'YOUR-RESTAURANT-ID', 'Fries', ARRAY['Fries', 'Sides'], true, true, 8, 350),
('Alette di Pollo 5pz', 'Chicken wings (5 pieces)', 7.00, 'YOUR-RESTAURANT-ID', 'Fries', ARRAY['Fries', 'Sides'], true, true, 12, 480),

-- KEBABS
('Kebab Classico', 'Piadina with chicken (150g), onions, lettuce, ketchup, and mayo', 7.00, 'YOUR-RESTAURANT-ID', 'Kebab', ARRAY['Kebab', 'Main Course'], true, true, 12, 520),
('Kebab Formaggio', 'Piadina with chicken (150g), cheddar, onions, lettuce, ketchup, and mayo', 8.00, 'YOUR-RESTAURANT-ID', 'Kebab', ARRAY['Kebab', 'Main Course'], true, false, 12, 580);

-- Run this to verify import
SELECT COUNT(*), category FROM menu_items 
WHERE restaurant_id = 'YOUR-RESTAURANT-ID' 
GROUP BY category;
```

**Note:** The full SQL script with all 90 products is very long. I've shown a sample above. Use the CSV import method for easier handling!

---

## 📊 PRODUCT BREAKDOWN

### Categories Included:

| Category | Count | Price Range |
|----------|-------|-------------|
| **Cocktails** | 12 | €8-10 |
| **Spirits** | 13 | €2-4 |
| **Soft Drinks** | 12 | €1.50-3.50 |
| **Beer** | 16 | €2.50-5 |
| **Draft Beer** | 6 | €4.50-6.50 |
| **Craft Beer** | 12 | €5-7 |
| **Burgers** | 7 | €6.50-10 |
| **Hotdogs** | 3 | €5.50-7 |
| **Fries/Sides** | 5 | €6-7 |
| **Kebab** | 4 | €7-9 |
| **TOTAL** | **90** | €1.50-10 |

---

## ✅ WHAT'S INCLUDED FOR EACH PRODUCT

- ✅ Product name (in English/Italian)
- ✅ Description
- ✅ Price (in Euros)
- ✅ Category
- ✅ Multiple categories (for filtering)
- ✅ Availability status (all set to available)
- ✅ Featured flag (popular items marked as featured)
- ✅ Preparation time
- ✅ Estimated calories
- ✅ Image URLs (stock photos - you can update with your own)

---

## 🎯 QUICK IMPORT STEPS

### Fast Track (2 minutes):

```bash
1. Get restaurant ID:
   SELECT id FROM restaurants WHERE name LIKE '%Musti%';

2. Edit CSV file:
   Replace: mustiplace-restaurant-id → YOUR-ACTUAL-ID

3. Import:
   Admin Dashboard → Bulk Import → Upload CSV

4. Done! ✅
```

---

## 🖼️ IMAGES

All products have been assigned stock image URLs. You can:

1. **Keep stock images** (they're high quality food photos)
2. **Update with your own** (via admin dashboard later)
3. **Leave blank** and add photos later

---

## 📱 AFTER IMPORT

### Verify in Mobile App:

1. Open your mobile app
2. Select "Mustiplace" restaurant from slider
3. You should see:
   - 12 cocktails in Cocktails category
   - 7 burgers in Burgers category
   - 16+ beers in Beer category
   - All 90 products available!

### Verify in Admin:

```sql
-- Check total products
SELECT COUNT(*) as total_products 
FROM menu_items 
WHERE restaurant_id = 'YOUR-RESTAURANT-ID';

-- Check by category
SELECT category, COUNT(*) as count 
FROM menu_items 
WHERE restaurant_id = 'YOUR-RESTAURANT-ID' 
GROUP BY category 
ORDER BY count DESC;
```

---

## 💡 CUSTOMIZATION

### Want to modify products?

**Edit the CSV before importing:**

1. Change prices
2. Update descriptions
3. Add/remove items
4. Translate to different language
5. Update images

**Or edit after importing:**

1. Go to Admin Dashboard → Products
2. Click on any product
3. Edit and save

---

## 🎨 FEATURED PRODUCTS

I've marked these as **featured** (will show in featured section):

- Gin Tonic
- Negroni
- Aperol Spritz
- Hamburger
- Cheese Burger
- Cheese Bacon Burger
- Egg Bacon Burger
- Peroni 66cl
- Corona
- Kozel Scura Grande
- Patate Fritte
- Alette di Pollo
- Kebab Classico
- IPA Steam Brew
- Blanche Isaac Baladin
- Rock and Roll APA

You can change featured status anytime!

---

## 🔧 TROUBLESHOOTING

### Issue: "restaurant_id not found"
**Solution:** Make sure you replaced `mustiplace-restaurant-id` with your actual restaurant UUID

### Issue: "Duplicate product names"
**Solution:** Products are already unique. If you have existing products, they'll be added separately.

### Issue: "Import failed"
**Solution:** 
1. Check if restaurant exists
2. Run the RLS policy fix from previous guide
3. Make sure you're signed in to admin

### Issue: "Images not showing"
**Solution:** 
1. Images are stock URLs (they should work)
2. You can update with your own later
3. Or leave blank initially

---

## 📊 EXPECTED RESULT

After import, your Mustiplace restaurant will have:

```
✅ 90 products imported
✅ 10 categories created
✅ All products available
✅ 16 featured products
✅ Prices in Euros (€)
✅ Prep times set
✅ Calories included
✅ Ready to order!
```

---

## 🎉 READY TO IMPORT!

### Choose your method:

**Option 1: CSV Import** (Recommended)
- Easy and visual
- Can preview before importing
- Error handling
- Takes 2 minutes

**Option 2: SQL Import** (For advanced users)
- Very fast
- All products at once
- Requires SQL knowledge
- Takes 30 seconds

---

## 📁 FILES CREATED

- `mustiplace-menu-import.csv` - Ready to import CSV file (90 products)
- `MUSTIPLACE_MENU_IMPORT_GUIDE.md` - This guide

---

## 🚀 START IMPORTING!

```bash
# 1. Find your restaurant ID
Go to Supabase → restaurants table → Copy Mustiplace ID

# 2. Update CSV file
Find & Replace: mustiplace-restaurant-id → YOUR-ID

# 3. Import
Admin Dashboard → Bulk Import → Upload mustiplace-menu-import.csv

# 4. Verify
Mobile App → Select Mustiplace → See all 90 products!
```

**Your complete menu will be live in 2 minutes!** 🎊

---

**Need help? Check the error in browser console or reach out!**


