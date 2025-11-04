# Database Migration Guide

## Issue: Missing `available_addons` Column

The error "Could not find the 'available_addons' column of 'menu_items' in the schema cache" occurs because the database table doesn't have the required column for product-specific addon assignment.

## Solution Options

### Option 1: Automatic Migration (Recommended)

1. **Navigate to the Migration Page**:
   - Go to `/migrate` in your admin dashboard
   - Click "Run Migration" button
   - The system will automatically add the required column

### Option 2: Manual SQL Execution

If the automatic migration fails, run these SQL commands in your Supabase dashboard:

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/[your-project]/sql
   - Navigate to SQL Editor

2. **Execute the following SQL commands**:

```sql
-- Add the available_addons column
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS available_addons JSONB DEFAULT '[]'::jsonb;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_available_addons 
ON public.menu_items USING GIN (available_addons);

-- Update existing products to have empty addons array
UPDATE public.menu_items 
SET available_addons = '[]'::jsonb 
WHERE available_addons IS NULL;
```

### Option 3: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Run the migration script
supabase db reset
# or
supabase db push
```

## What This Migration Does

1. **Adds `available_addons` Column**: 
   - Type: JSONB (stores array of addon IDs)
   - Default: Empty array `[]`
   - Allows storing which addons are available for each product

2. **Creates Performance Index**:
   - GIN index for fast JSONB queries
   - Improves performance when filtering products by addons

3. **Updates Existing Data**:
   - Sets empty array for all existing products
   - Ensures no null values in the new column

## Verification

After running the migration, you can verify it worked by:

1. **Check the Column Exists**:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'menu_items' 
   AND column_name = 'available_addons';
   ```

2. **Test the Feature**:
   - Go to Products page
   - Click "Add Product" or "Edit" an existing product
   - You should see the "Available Addons" section
   - You should be able to select/deselect addons

## Troubleshooting

### If Migration Fails

1. **Check Permissions**: Ensure your database user has ALTER TABLE permissions
2. **Check Table Exists**: Verify the `menu_items` table exists
3. **Check Column Already Exists**: The column might already exist with a different name

### If Feature Still Doesn't Work

1. **Clear Browser Cache**: Refresh the page completely
2. **Check Environment Variables**: Ensure Supabase connection is working
3. **Check Console Errors**: Look for any JavaScript errors in browser console

## Next Steps

After successful migration:

1. **Create Addons**: Go to Addons page and create some addons
2. **Assign to Products**: Edit products and select which addons should be available
3. **Test the Feature**: Verify that addon assignment works correctly

## Support

If you continue to have issues:

1. Check the browser console for errors
2. Verify your Supabase connection
3. Ensure all environment variables are set correctly
4. Try the manual SQL approach if automatic migration fails
