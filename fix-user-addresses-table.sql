-- Check user_addresses table schema
-- Run this to see what columns actually exist:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_addresses' AND table_schema = 'public'
ORDER BY ordinal_position;

-- The user_addresses table appears to only have these columns:
-- user_id, name, address (JSON), type, is_default, created_at, updated_at
-- No individual address columns like street, city, etc. exist

-- If you need to create the table from scratch, use this:
/*
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address JSONB,
  type TEXT DEFAULT 'home',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own addresses" ON public.user_addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON public.user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON public.user_addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON public.user_addresses
  FOR DELETE USING (auth.uid() = user_id);
*/
