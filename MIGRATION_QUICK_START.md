# Quick Migration Guide

## 🚨 Issue: Missing `available_addons` Column

The error "Could not find the 'available_addons' column" means the database table is missing the required column for product-specific addon assignment.

## ✅ Quick Fix (2 minutes)

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar

### Step 2: Run These SQL Commands
Copy and paste these commands into the SQL Editor:

```sql
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS available_addons JSONB DEFAULT '[]'::jsonb;
CREATE INDEX IF NOT EXISTS idx_menu_items_available_addons ON public.menu_items USING GIN (available_addons);
UPDATE public.menu_items SET available_addons = '[]'::jsonb WHERE available_addons IS NULL;
```

### Step 3: Click "Run"
Execute the commands by clicking the "Run" button.

### Step 4: Verify
1. Go back to your admin dashboard
2. Navigate to `/migrate` 
3. Click "Check Database Status"
4. You should see "✅ Column exists!"

## 🎯 What This Does

- **Adds Column**: Creates `available_addons` JSONB column to store addon IDs for each product
- **Creates Index**: Improves query performance for addon-related operations  
- **Updates Data**: Sets empty array for all existing products

## 🚀 After Migration

1. **Create Addons**: Go to Addons page and create some addons
2. **Assign to Products**: Edit products and select which addons should be available
3. **Test Feature**: Verify that addon assignment works correctly

## 🔧 Alternative: Use Migration Page

You can also use the built-in migration page:
1. Go to `/migrate` in your admin dashboard
2. Follow the step-by-step instructions
3. Use the "Check Database Status" button to verify

## ❓ Still Having Issues?

1. **Check Console**: Look for JavaScript errors in browser console
2. **Verify Connection**: Ensure Supabase environment variables are correct
3. **Try Again**: Sometimes the column takes a moment to be available

The migration is safe and won't affect existing data!
