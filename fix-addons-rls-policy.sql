-- Fix RLS policy for addons table to allow admin operations
-- First, drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.addons;

-- Create a more permissive policy that allows authenticated users to perform all operations
CREATE POLICY "Enable all operations for authenticated users" ON public.addons
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Alternative: If the above doesn't work, try this more permissive policy
-- DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.addons;
-- CREATE POLICY "Enable all operations for authenticated users" ON public.addons
--   FOR ALL 
--   USING (true)
--   WITH CHECK (true);

-- If you're still having issues, you can temporarily disable RLS for testing
-- ALTER TABLE public.addons DISABLE ROW LEVEL SECURITY;
-- Then re-enable it after testing:
-- ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
