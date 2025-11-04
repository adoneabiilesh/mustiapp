-- ============================================================
-- FINAL FIX: Disable or Fix RLS on Categories Table
-- This is preventing updates from saving
-- ============================================================

-- Option 1: Temporarily DISABLE RLS to test (Quick fix)
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Option 2: Or keep RLS enabled but make policies more permissive
-- Uncomment these if you want to keep RLS enabled:

/*
-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.categories;

-- Create new permissive policies
CREATE POLICY "Allow all operations for authenticated users"
ON public.categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
*/

-- Test the fix by manually updating a category
UPDATE public.categories
SET sort_order = 999
WHERE name = 'Burgers';

-- Check if it worked
SELECT name, sort_order 
FROM public.categories 
WHERE name = 'Burgers';

-- If sort_order changed to 999, it's working!
-- Now reset it
UPDATE public.categories
SET sort_order = 4
WHERE name = 'Burgers';

-- Show all categories with their current order
SELECT 
    name, 
    sort_order,
    is_active
FROM public.categories
ORDER BY sort_order ASC;

-- Final message
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ RLS DISABLED ON CATEGORIES TABLE';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Categories table can now be updated freely.';
    RAISE NOTICE 'Refresh your admin dashboard and try reordering again.';
    RAISE NOTICE '';
    RAISE NOTICE 'SECURITY NOTE:';
    RAISE NOTICE 'RLS is now DISABLED. If you need security,';
    RAISE NOTICE 'uncomment Option 2 in the SQL script.';
    RAISE NOTICE '';
END $$;




