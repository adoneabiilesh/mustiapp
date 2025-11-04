-- Add sort_order column to categories table
-- This allows dynamic ordering of categories in the app

DO $$
BEGIN
    -- Add sort_order column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'categories' AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE public.categories ADD COLUMN sort_order INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added "sort_order" column to "categories" table.';
    ELSE
        RAISE NOTICE 'ℹ️ "sort_order" column already exists in "categories" table.';
    END IF;

    -- Update existing categories with incremental sort_order based on name
    UPDATE public.categories
    SET sort_order = subquery.row_num
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY name ASC) as row_num
        FROM public.categories
    ) AS subquery
    WHERE categories.id = subquery.id AND categories.sort_order = 0;

    RAISE NOTICE '✅ Updated existing categories with default sort_order.';

END $$;

-- Create index for faster sorting
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);

-- Verify the changes
SELECT id, name, sort_order, is_active
FROM public.categories
ORDER BY sort_order ASC;

DO $$
BEGIN
    RAISE NOTICE '✅ Category sort order column added successfully.';
    RAISE NOTICE '📝 You can now reorder categories from the admin dashboard.';
END $$;




