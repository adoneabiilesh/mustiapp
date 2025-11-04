# 🚨 URGENT: Fix Category Reordering

## The Problem
Categories are moving in the UI but reverting back because the database update is failing.

## Most Likely Cause
The `sort_order` column doesn't exist in your `categories` table yet.

---

# ✅ SOLUTION: Run This in Supabase NOW

## Step 1: Open Supabase SQL Editor
1. Go to: https://app.supabase.com
2. Click your project
3. Click **"SQL Editor"** (left sidebar)
4. Click **"+ New Query"**

## Step 2: Copy & Paste Exactly This:

```sql
-- Check if column exists first
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories';

-- Add the column
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Set initial values for existing categories
UPDATE public.categories
SET sort_order = subquery.row_num - 1
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY name ASC) as row_num
    FROM public.categories
) AS subquery
WHERE categories.id = subquery.id;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);

-- Verify it worked
SELECT id, name, sort_order, is_active
FROM public.categories
ORDER BY sort_order ASC;
```

## Step 3: Run It
- Click **"Run"** or press **Ctrl+Enter** / **Cmd+Enter**
- Wait for success message

## Step 4: Check the Results
You should see:
- First query: List of columns (check if `sort_order` is there)
- Last query: Table showing categories with `sort_order` values (0, 1, 2, 3...)

---

## Step 5: Test in Admin Dashboard

1. **Open the admin dashboard**
2. **Open Browser Console** (F12 or Right-click → Inspect)
3. Go to **Categories** page
4. Click **"Reorder Categories"**
5. Click an **↑** or **↓** arrow
6. **Watch the console** for these messages:
   - 🔄 Updating categories order: [...]
   - ✅ Update results: [...]
   - ✅ Reorder mutation successful

### If You See Errors in Console:
- **❌ Error updating categories order**: The SQL didn't run successfully
- **Failed to update**: Column doesn't exist or permission issue

---

## Alternative: Quick Check in Supabase

Go to **Table Editor** → **categories** table:
1. Look for `sort_order` column
2. If it's NOT there → SQL hasn't been run yet
3. If it IS there but all values are 0 → run the UPDATE part again

---

## Still Not Working?

### Try This Simpler Version:

```sql
-- Just add the column
ALTER TABLE public.categories ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Give each category a unique number
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name ASC) - 1 as new_order
  FROM public.categories
)
UPDATE public.categories c
SET sort_order = n.new_order
FROM numbered n
WHERE c.id = n.id;

-- Show results
SELECT name, sort_order FROM public.categories ORDER BY sort_order;
```

---

## After SQL Runs Successfully:

1. **Refresh** admin dashboard page (hard refresh: Ctrl+Shift+R / Cmd+Shift+R)
2. Go to Categories → Reorder Categories
3. Click arrows
4. Categories should **STAY** in new position
5. Check console for success messages

---

## How to Know It's Working:

✅ **Working:**
- Categories move AND stay in new position
- Console shows: "🔄 Updating categories order"
- Console shows: "✅ Update results"
- Toast notification: "Category order updated successfully"
- Refreshing page keeps the new order

❌ **Not Working:**
- Categories move but snap back
- Console shows: "❌ Error updating categories order"
- Toast shows: "Failed to update order"
- Error about missing column

---

## Debug Checklist:

- [ ] SQL has been run in Supabase
- [ ] `sort_order` column exists in categories table
- [ ] All categories have sort_order values (not null)
- [ ] Browser console is open (F12)
- [ ] Admin dashboard has been refreshed
- [ ] No errors in console when clicking arrows

If ALL checkboxes are checked and it still doesn't work, share the console error message!




