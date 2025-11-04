-- ============================================================
-- DIAGNOSTIC: Check if sort_order column exists and is working
-- ============================================================

-- Step 1: Check if the column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- Step 2: Show current categories with their sort_order (if it exists)
SELECT id, name, sort_order, is_active
FROM public.categories
ORDER BY name ASC;

-- Step 3: Check RLS policies on categories table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'categories';

-- ============================================================
-- EXPECTED RESULTS:
-- ============================================================
-- 
-- Step 1: Should show a 'sort_order' column of type 'integer'
-- Step 2: Should show all categories with sort_order values (not NULL)
-- Step 3: Should show RLS policies that allow UPDATE operations
--
-- ============================================================
-- IF sort_order COLUMN IS MISSING, RUN THIS:
-- ============================================================
-- 
-- ALTER TABLE public.categories ADD COLUMN sort_order INTEGER DEFAULT 0;
-- 
-- UPDATE public.categories
-- SET sort_order = subquery.row_num - 1
-- FROM (
--     SELECT id, ROW_NUMBER() OVER (ORDER BY name ASC) as row_num
--     FROM public.categories
-- ) AS subquery
-- WHERE categories.id = subquery.id;
--
-- CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);
--
-- ============================================================




