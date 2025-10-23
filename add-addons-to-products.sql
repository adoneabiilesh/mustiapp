-- Add available_addons field to menu_items table
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS available_addons JSONB DEFAULT '[]'::jsonb;

-- Create index for better performance on addon queries
CREATE INDEX IF NOT EXISTS idx_menu_items_available_addons ON public.menu_items USING GIN (available_addons);

-- Update existing products to have empty addons array if null
UPDATE public.menu_items 
SET available_addons = '[]'::jsonb 
WHERE available_addons IS NULL;

-- Example: Assign some addons to existing products (optional)
-- You can customize this based on your products
-- UPDATE public.menu_items 
-- SET available_addons = '["addon-id-1", "addon-id-2"]'::jsonb 
-- WHERE name = 'Your Product Name';
