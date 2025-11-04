-- ============================================================================
-- FIX: Add missing pricing columns to orders table
-- ============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Add columns if they don't exist
DO $$
BEGIN
  -- Add subtotal column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'subtotal'
  ) THEN
    ALTER TABLE orders ADD COLUMN subtotal NUMERIC(10, 2) DEFAULT 0.00;
    RAISE NOTICE '✅ Added subtotal column';
  ELSE
    RAISE NOTICE 'ℹ️ subtotal column already exists';
  END IF;

  -- Add delivery_fee column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'delivery_fee'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_fee NUMERIC(10, 2) DEFAULT 0.00;
    RAISE NOTICE '✅ Added delivery_fee column';
  ELSE
    RAISE NOTICE 'ℹ️ delivery_fee column already exists';
  END IF;

  -- Add tax column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'tax'
  ) THEN
    ALTER TABLE orders ADD COLUMN tax NUMERIC(10, 2) DEFAULT 0.00;
    RAISE NOTICE '✅ Added tax column';
  ELSE
    RAISE NOTICE 'ℹ️ tax column already exists';
  END IF;

  -- Add stripe_payment_intent_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_payment_intent_id TEXT;
    RAISE NOTICE '✅ Added stripe_payment_intent_id column';
  ELSE
    RAISE NOTICE 'ℹ️ stripe_payment_intent_id column already exists';
  END IF;

END $$;

-- Verify columns exist
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('subtotal', 'delivery_fee', 'tax', 'stripe_payment_intent_id')
ORDER BY column_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All order pricing columns added successfully!';
  RAISE NOTICE '📝 You can now place orders with proper pricing breakdown.';
END $$;




