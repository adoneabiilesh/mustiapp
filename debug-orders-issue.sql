-- Debug Orders Issue
-- Run this in Supabase SQL Editor to check what's happening

-- 1. Check if orders table exists and has data
SELECT COUNT(*) as total_orders FROM orders;

-- 2. See all orders with customer info
SELECT 
  id,
  customer_id,
  customer_name,
  customer_email,
  status,
  total,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if there's a mismatch in customer_id field
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name LIKE '%customer%';

-- 4. Check users table to see user IDs
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check if any orders exist for specific users
SELECT 
  u.email,
  COUNT(o.id) as order_count
FROM auth.users u
LEFT JOIN orders o ON o.customer_id = u.id
GROUP BY u.email
ORDER BY order_count DESC;

-- 6. Check RLS policies on orders table
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
WHERE tablename = 'orders';

-- 7. See if there are orders with NULL customer_id
SELECT COUNT(*) as orders_with_null_customer_id
FROM orders
WHERE customer_id IS NULL;

-- 8. Check order_items to see if they exist
SELECT COUNT(*) as total_order_items FROM order_items;

-- 9. Sample of order with all relations (same as app query)
SELECT 
  o.*,
  json_agg(
    json_build_object(
      'id', oi.id,
      'quantity', oi.quantity,
      'menu_item', (
        SELECT json_build_object('name', name, 'price', price)
        FROM menu_items
        WHERE id = oi.menu_item_id
      )
    )
  ) as items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id
LIMIT 1;




