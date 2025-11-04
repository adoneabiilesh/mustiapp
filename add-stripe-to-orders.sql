-- Add Stripe payment intent ID to orders table
-- This links each order to its Stripe payment for proper tracking and reconciliation

DO $$
BEGIN
    -- Add stripe_payment_intent_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'stripe_payment_intent_id'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN stripe_payment_intent_id TEXT;
        
        RAISE NOTICE '✅ Added "stripe_payment_intent_id" column to "orders" table.';
    ELSE
        RAISE NOTICE 'ℹ️ "stripe_payment_intent_id" column already exists.';
    END IF;

    -- Add index for faster lookups
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'orders'
        AND indexname = 'idx_orders_stripe_payment_intent_id'
    ) THEN
        CREATE INDEX idx_orders_stripe_payment_intent_id 
        ON public.orders(stripe_payment_intent_id);
        
        RAISE NOTICE '✅ Created index on "stripe_payment_intent_id".';
    ELSE
        RAISE NOTICE 'ℹ️ Index already exists.';
    END IF;

    -- Add stripe_customer_id to users table for recurring customers
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN stripe_customer_id TEXT UNIQUE;
        
        RAISE NOTICE '✅ Added "stripe_customer_id" column to "users" table.';
    ELSE
        RAISE NOTICE 'ℹ️ "stripe_customer_id" column already exists.';
    END IF;

END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' 
AND column_name = 'stripe_payment_intent_id';

SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
AND column_name = 'stripe_customer_id';

DO $$
BEGIN
    RAISE NOTICE '✅ Stripe integration columns added successfully.';
    RAISE NOTICE '📝 You can now process real payments with Stripe.';
END $$;




