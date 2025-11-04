-- ============================================================
-- FINAL FIX: Add sort_order column and enable category reordering
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- Step 1: Add the sort_order column (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'categories' AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN sort_order INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added sort_order column to categories table';
    ELSE
        RAISE NOTICE 'ℹ️ sort_order column already exists';
    END IF;
END $$;

-- Step 2: Set initial sort_order values for all categories (alphabetically)
UPDATE public.categories
SET sort_order = subquery.row_num - 1
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY name ASC) as row_num
    FROM public.categories
) AS subquery
WHERE categories.id = subquery.id;

-- Step 3: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);

-- Step 4: Ensure RLS policies allow updates
-- Check if authenticated users can update categories
DO $$
BEGIN
    -- Drop existing update policy if it exists
    DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;
    
    -- Create new update policy
    CREATE POLICY "Authenticated users can update categories"
    ON public.categories
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
    
    RAISE NOTICE '✅ RLS policy for UPDATE created';
END $$;

-- Step 5: Verify everything worked
DO $$
DECLARE
    col_exists BOOLEAN;
    category_count INTEGER;
    categories_with_order INTEGER;
BEGIN
    -- Check if column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'categories' AND column_name = 'sort_order'
    ) INTO col_exists;
    
    IF col_exists THEN
        RAISE NOTICE '✅ sort_order column exists';
        
        -- Count total categories
        SELECT COUNT(*) INTO category_count FROM public.categories;
        RAISE NOTICE 'ℹ️ Total categories: %', category_count;
        
        -- Count categories with sort_order set
        SELECT COUNT(*) INTO categories_with_order 
        FROM public.categories 
        WHERE sort_order IS NOT NULL;
        RAISE NOTICE 'ℹ️ Categories with sort_order: %', categories_with_order;
        
        IF category_count = categories_with_order THEN
            RAISE NOTICE '✅ All categories have sort_order values';
        ELSE
            RAISE WARNING '⚠️ Some categories missing sort_order values';
        END IF;
    ELSE
        RAISE WARNING '❌ sort_order column was not created!';
    END IF;
END $$;

-- Step 6: Show final result
SELECT 
    id, 
    name, 
    sort_order, 
    is_active,
    created_at
FROM public.categories
ORDER BY sort_order ASC, name ASC;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '====================================';
    RAISE NOTICE '✅ CATEGORY ORDERING SETUP COMPLETE';
    RAISE NOTICE '====================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Check the table above to see current order';
    RAISE NOTICE '2. Refresh your admin dashboard';
    RAISE NOTICE '3. Try reordering categories';
    RAISE NOTICE '4. Refresh the page - order should persist';
    RAISE NOTICE '5. Check mobile app - should show same order';
    RAISE NOTICE '';
END $$;




