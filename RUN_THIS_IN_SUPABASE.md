# 🔧 Fix Category Reordering - Run This SQL in Supabase

## The Problem
Categories are moving but reverting back because the `sort_order` column doesn't exist in the database yet.

## The Solution
Run the SQL migration to add the column.

---

## 📝 Step-by-Step Instructions:

### 1. Open Supabase SQL Editor
1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### 2. Copy and Paste This SQL:

```sql
-- Add sort_order column to categories table
-- This allows dynamic ordering of categories in the app

DO $$
BEGIN
    -- Add sort_order column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'categories' AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN sort_order INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added "sort_order" column to "categories" table.';
    ELSE
        RAISE NOTICE 'ℹ️ "sort_order" column already exists in "categories" table.';
    END IF;

    -- Update existing categories with incremental sort_order based on name
    UPDATE public.categories
    SET sort_order = subquery.row_num
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY name ASC) as row_num
        FROM public.categories
    ) AS subquery
    WHERE categories.id = subquery.id AND categories.sort_order = 0;

    RAISE NOTICE '✅ Updated existing categories with default sort_order.';

END $$;

-- Create index for faster sorting
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);

-- Verify the changes
SELECT id, name, sort_order, is_active
FROM public.categories
ORDER BY sort_order ASC;

DO $$
BEGIN
    RAISE NOTICE '✅ Category sort order column added successfully.';
    RAISE NOTICE '📝 You can now reorder categories from the admin dashboard.';
END $$;
```

### 3. Run the Query
1. Click the **"Run"** button (or press F5)
2. You should see:
   - ✅ Success messages in the output
   - A table showing your categories with their `sort_order` values

### 4. Test in Admin Dashboard
1. Go to Admin Dashboard → Categories
2. Click **"Reorder Categories"**
3. Click ↑ or ↓ arrows
4. **Categories should now stay in the new position!** 🎉

---

## 🔍 Verify It Worked

After running the SQL, check:
- You see a table with columns: `id`, `name`, `sort_order`, `is_active`
- Each category has a `sort_order` value (0, 1, 2, etc.)
- No errors in the output

## ❓ Troubleshooting

**If you see an error:**
- Make sure you're connected to the right project
- Check that the `categories` table exists
- Try running just the first part (the DO $$ block)

**If categories still revert:**
- Refresh the admin dashboard page
- Check the browser console for errors
- Verify the SQL ran successfully by checking the `categories` table in the Table Editor

---

## ✅ After This Works

Once the SQL is run successfully:
- Categories will stay in the order you set
- The order persists after refreshing
- The app will show categories in your custom order
- No need to run this SQL again (it's safe to run multiple times though)




