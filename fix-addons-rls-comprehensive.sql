-- Comprehensive fix for addons RLS policy
-- This will ensure the admin dashboard can create, read, update, and delete addons

-- First, let's check if the table exists and has the right structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'addons' 
ORDER BY ordinal_position;

-- Drop all existing policies on the addons table
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.addons;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.addons;
DROP POLICY IF EXISTS "Allow all operations" ON public.addons;

-- Create a comprehensive policy that allows all operations for authenticated users
CREATE POLICY "addons_all_operations" ON public.addons
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Alternative: If the above doesn't work, try this more permissive approach
-- This allows all operations regardless of authentication
-- DROP POLICY IF EXISTS "addons_all_operations" ON public.addons;
-- CREATE POLICY "addons_allow_all" ON public.addons
--   FOR ALL 
--   USING (true)
--   WITH CHECK (true);

-- If you're still having issues, you can temporarily disable RLS for testing
-- ALTER TABLE public.addons DISABLE ROW LEVEL SECURITY;

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'addons';

-- Test the policy by trying to insert a test record
-- INSERT INTO public.addons (name, description, price, type, is_required, is_active) 
-- VALUES ('Test Addon', 'Test Description', 1.50, 'addon', false, true);
-- DELETE FROM public.addons WHERE name = 'Test Addon';
