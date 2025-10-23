-- Add dietary restriction boolean columns to menu_items table

-- Add dietary restriction columns
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT false;

ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS is_vegan BOOLEAN DEFAULT false;

ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS is_gluten_free BOOLEAN DEFAULT false;

ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS is_spicy BOOLEAN DEFAULT false;

-- Update existing menu items with default values
UPDATE public.menu_items 
SET is_vegetarian = false 
WHERE is_vegetarian IS NULL;

UPDATE public.menu_items 
SET is_vegan = false 
WHERE is_vegan IS NULL;

UPDATE public.menu_items 
SET is_gluten_free = false 
WHERE is_gluten_free IS NULL;

UPDATE public.menu_items 
SET is_spicy = false 
WHERE is_spicy IS NULL;

-- Optional: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_items_vegetarian ON public.menu_items(is_vegetarian);
CREATE INDEX IF NOT EXISTS idx_menu_items_vegan ON public.menu_items(is_vegan);
CREATE INDEX IF NOT EXISTS idx_menu_items_gluten_free ON public.menu_items(is_gluten_free);
CREATE INDEX IF NOT EXISTS idx_menu_items_spicy ON public.menu_items(is_spicy);

-- Optional: Create a composite index for filtering by multiple dietary restrictions
CREATE INDEX IF NOT EXISTS idx_menu_items_dietary ON public.menu_items(is_vegetarian, is_vegan, is_gluten_free, is_spicy);
