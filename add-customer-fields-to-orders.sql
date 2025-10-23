-- Add customer name and phone number fields to orders table

-- Add customer_name column
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Add phone_number column  
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Update existing orders with default values if needed
UPDATE public.orders 
SET customer_name = 'Customer' 
WHERE customer_name IS NULL;

UPDATE public.orders 
SET phone_number = 'N/A' 
WHERE phone_number IS NULL;

-- Make the columns NOT NULL if you want to enforce them
-- ALTER TABLE public.orders ALTER COLUMN customer_name SET NOT NULL;
-- ALTER TABLE public.orders ALTER COLUMN phone_number SET NOT NULL;
