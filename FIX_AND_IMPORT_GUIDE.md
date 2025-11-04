# 🛠️ Fix Errors & Import Products - Step by Step

## 🎯 What We're Fixing

1. **Missing database columns** causing 400 errors
2. **Corrupted node_modules** (already fixed ✅)
3. **Import the 89 products** to Mustiplace restaurant

---

## Step 1: Add Missing Columns to Database ⚡

### Open Supabase SQL Editor

1. Go to your **Supabase Dashboard**
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Run This SQL Script

Copy and paste this entire script and click **Run**:

```sql
-- Add missing columns to menu_items table

ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS preparation_time INTEGER DEFAULT 0;

ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;

ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS category VARCHAR(255);

-- Set defaults for existing records
UPDATE menu_items 
SET is_featured = false 
WHERE is_featured IS NULL;

UPDATE menu_items 
SET is_available = true 
WHERE is_available IS NULL;

UPDATE menu_items 
SET preparation_time = 15 
WHERE preparation_time IS NULL OR preparation_time = 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_featured ON menu_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- Grant permissions
GRANT ALL ON menu_items TO authenticated;
GRANT ALL ON menu_items TO anon;
```

### ✅ You should see: "Success. No rows returned"

---

## Step 2: Clear Metro Cache & Restart 🔄

Stop your Expo server (Ctrl+C in terminal) and run:

```bash
npx expo start --clear
```

This will:
- Clear the Metro bundler cache
- Restart the development server with a clean slate
- Fix all the module resolution errors

---

## Step 3: Import Products 📦

Once your app is running without errors, in a **NEW terminal window**, run:

```bash
node import-mustiplace-menu.js
```

### Expected Output:

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

---

## Step 4: Verify in App 📱

1. Open your app in the browser/emulator
2. Click on **"Select Restaurant"** at the top
3. Choose **"Mustiplace"**
4. You should see **89 products** organized by category:
   - Cocktails (12)
   - Spirits (12)
   - Beer (17)
   - Draft Beer (5)
   - Soft Drinks (16)
   - Burgers (7)
   - Hotdogs (3)
   - Fries/Sides (5)
   - Kebabs (4)
   - Craft Beer (8)

---

## 🔍 Verify in Supabase

1. Go to **Supabase Dashboard** → **Table Editor** → **menu_items**
2. Add filter: `restaurant_id` equals `ccbf921d-5d78-484d-8690-c3a33159f609`
3. Should show **89 rows**

---

## 🆘 Troubleshooting

### If you still see errors:

**"Column does not exist" error:**
- Make sure you ran the SQL script in Step 1
- Refresh your Supabase dashboard and check the `menu_items` table structure

**Module resolution errors:**
- Delete `node_modules` folder completely: `Remove-Item -Recurse -Force node_modules`
- Reinstall: `npm install`
- Clear cache: `npx expo start --clear`

**Import fails:**
- Check your `admin-dashboard/.env.local` file has:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

**Products not showing in app:**
- Make sure you selected the correct restaurant (Mustiplace)
- Refresh the app (press `r` in the Expo terminal)

---

## 🎉 Success Checklist

- ✅ SQL script ran successfully
- ✅ App runs without errors
- ✅ 89 products imported
- ✅ Products visible in app under Mustiplace restaurant
- ✅ Can add products to cart and place orders

---

**Need Help?** Drop an error message and I'll help you fix it!


