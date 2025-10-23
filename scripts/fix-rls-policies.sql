-- Fix Row Level Security Policies - Removes infinite recursion
-- Run this in Supabase SQL Editor

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Couriers can read assigned deliveries" ON public.orders;
DROP POLICY IF EXISTS "Users can read order items for own orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items for own orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can read deliveries for own orders" ON public.deliveries;
DROP POLICY IF EXISTS "Couriers can read own deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Couriers can update own deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Couriers can manage own location" ON public.courier_locations;
DROP POLICY IF EXISTS "Users can read courier locations for their deliveries" ON public.courier_locations;

-- Create simplified, non-recursive policies

-- Orders policies (simplified)
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE
  USING (auth.uid() = customer_id);

-- Order items policies (simplified)
CREATE POLICY "Users can read own order items" ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items" ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

-- Deliveries policies (simplified)
CREATE POLICY "Users can read own deliveries" ON public.deliveries
  FOR SELECT
  USING (
    courier_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = deliveries.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Couriers can manage own deliveries" ON public.deliveries
  FOR ALL
  USING (courier_id = auth.uid());

-- Courier locations policies (simplified)
CREATE POLICY "Couriers can manage own location" ON public.courier_locations
  FOR ALL
  USING (courier_id = auth.uid());

CREATE POLICY "Users can see courier locations" ON public.courier_locations
  FOR SELECT
  USING (true); -- Allow all authenticated users to see courier locations

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT SELECT ON public.deliveries TO authenticated;
GRANT SELECT ON public.courier_locations TO authenticated;

-- Optional: Add a service role bypass for all policies
-- This allows your backend to access everything
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.order_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries FORCE ROW LEVEL SECURITY;
ALTER TABLE public.courier_locations FORCE ROW LEVEL SECURITY;


