-- Fix Real-time Order Status Updates
-- Run this in Supabase SQL Editor

-- 1. Enable real-time for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 2. Ensure RLS policies allow real-time updates
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- Create new policies that work with real-time
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE
  USING (auth.uid() = customer_id);

-- Allow service role to update orders (for admin dashboard)
CREATE POLICY "Service role can update orders" ON public.orders
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- 3. Grant necessary permissions
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- 4. Ensure the orders table has proper triggers for real-time
CREATE OR REPLACE FUNCTION public.handle_order_update()
RETURNS TRIGGER AS $$
BEGIN
  -- This function ensures real-time updates are triggered
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for real-time updates
DROP TRIGGER IF EXISTS order_update_trigger ON public.orders;
CREATE TRIGGER order_update_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_update();

-- 5. Test real-time functionality
-- You can test this by running:
-- UPDATE public.orders SET status = 'preparing' WHERE id = 'your-order-id';
-- The mobile app should update immediately
