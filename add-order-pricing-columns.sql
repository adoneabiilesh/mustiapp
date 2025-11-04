-- Add pricing breakdown columns to orders table
-- Run this in Supabase SQL Editor

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax DECIMAL(10,2) DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN orders.subtotal IS 'Order subtotal before fees and tax';
COMMENT ON COLUMN orders.delivery_fee IS 'Delivery fee charged';
COMMENT ON COLUMN orders.tax IS 'Tax amount';

-- Update existing orders to calculate breakdown from total (if any exist)
UPDATE orders 
SET 
  subtotal = total * 0.84,
  delivery_fee = 2.99,
  tax = total * 0.10
WHERE subtotal IS NULL;




