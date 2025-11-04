# 🚀 Quick Import Guide - Mustiplace Menu

## ⚡ Quick Steps

### 1️⃣ Update Database (Run in Supabase SQL Editor)

Copy and paste this into your **Supabase SQL Editor** and click **Run**:

```sql
-- Add missing columns to menu_items table
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS preparation_time INTEGER DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category VARCHAR(255);

-- Set defaults for existing records
UPDATE menu_items SET is_featured = false WHERE is_featured IS NULL;
UPDATE menu_items SET is_available = true WHERE is_available IS NULL;
UPDATE menu_items SET preparation_time = 15 WHERE preparation_time IS NULL OR preparation_time = 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_featured ON menu_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- Grant permissions
GRANT ALL ON menu_items TO authenticated;
GRANT ALL ON menu_items TO anon;
```

### 2️⃣ Run Import Script (In Terminal)

After the SQL runs successfully, execute:

```bash
node import-mustiplace-menu.js
```

### 3️⃣ Expected Output

```
🚀 Starting Mustiplace menu import...
📊 Found 89 products to import

✅ [1/89] Imported: Vodka Lemon
✅ [2/89] Imported: Gin Lemon
✅ [3/89] Imported: Gin Tonic
... (continues for all 89 products)

============================================================
📊 IMPORT SUMMARY
============================================================
✅ Successfully imported: 89 products
❌ Failed: 0 products
============================================================

✨ Import process completed!
```

## 📋 What Gets Imported

- **89 total products** for Mustiplace restaurant
- Categories: Cocktails, Spirits, Beer, Soft Drinks, Burgers, Kebabs, Fries, Craft Beer, Draft Beer
- Each product includes: name, description, price, image, preparation time, calories
- Featured products marked for recommendations
- All products available and ready for ordering

## 🔍 Verify Import

1. Open Supabase → **Table Editor** → **menu_items**
2. Add filter: `restaurant_id` = `ccbf921d-5d78-484d-8690-c3a33159f609`
3. Should see 89 products

## 🎉 Done!

Your Mustiplace restaurant menu is now fully loaded and ready to use in the app!

---

**Restaurant ID**: `ccbf921d-5d78-484d-8690-c3a33159f609`


