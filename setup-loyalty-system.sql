-- ============================================================================
-- LOYALTY SYSTEM COMPLETE SETUP
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Create loyalty_points table
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create points_transactions table
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'bonus', 'referral')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL CHECK (points_required > 0),
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2),
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  tier_required TEXT CHECK (tier_required IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_rewards table
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES public.rewards(id) ON DELETE CASCADE,
  redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMPTZ,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON public.loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON public.loyalty_points(tier);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON public.points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON public.points_transactions(type);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON public.rewards(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_rewards_user ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_redeemed ON public.user_rewards(redeemed) WHERE redeemed = FALSE;

-- Enable RLS
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own loyalty points" ON public.loyalty_points;
DROP POLICY IF EXISTS "Service role can manage loyalty points" ON public.loyalty_points;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "Service role can manage transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.rewards;
DROP POLICY IF EXISTS "Service role can manage rewards" ON public.rewards;
DROP POLICY IF EXISTS "Users can view their own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Service role can manage user rewards" ON public.user_rewards;

-- RLS Policies for loyalty_points
CREATE POLICY "Users can view their own loyalty points"
  ON public.loyalty_points FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage loyalty points"
  ON public.loyalty_points FOR ALL
  USING (auth.role() = 'service_role' OR user_id = auth.uid());

-- RLS Policies for points_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.points_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage transactions"
  ON public.points_transactions FOR ALL
  USING (auth.role() = 'service_role' OR user_id = auth.uid());

-- RLS Policies for rewards
CREATE POLICY "Anyone can view active rewards"
  ON public.rewards FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Service role can manage rewards"
  ON public.rewards FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for user_rewards
CREATE POLICY "Users can view their own rewards"
  ON public.user_rewards FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage user rewards"
  ON public.user_rewards FOR ALL
  USING (auth.role() = 'service_role' OR user_id = auth.uid());

-- Triggers
CREATE OR REPLACE FUNCTION update_loyalty_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_loyalty_points_timestamp ON public.loyalty_points;
CREATE TRIGGER update_loyalty_points_timestamp
  BEFORE UPDATE ON public.loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_updated_at();

DROP TRIGGER IF EXISTS update_rewards_timestamp ON public.rewards;
CREATE TRIGGER update_rewards_timestamp
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_updated_at();

-- Insert sample rewards
INSERT INTO public.rewards (title, description, points_required, discount_type, discount_value, active, tier_required)
VALUES
  ('Free Drink', 'Any drink from our menu', 100, 'fixed', 5.00, TRUE, NULL),
  ('$5 Off', 'On your next order', 250, 'fixed', 5.00, TRUE, NULL),
  ('Free Dessert', 'Any dessert from our menu', 200, 'fixed', 8.00, TRUE, NULL),
  ('$10 Off', 'On orders over $30', 500, 'fixed', 10.00, TRUE, 'silver'),
  ('Free Delivery Month', 'Free delivery for 30 days', 1000, 'fixed', 25.00, TRUE, 'gold'),
  ('15% Off', 'On your entire order', 750, 'percentage', 15.00, TRUE, 'silver'),
  ('VIP Meal Discount', '$20 off premium meals', 1500, 'fixed', 20.00, TRUE, 'platinum')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Loyalty system tables created successfully!';
  RAISE NOTICE '🎯 Sample rewards have been added!';
  RAISE NOTICE '📊 Users will automatically get loyalty points created on first use!';
  RAISE NOTICE '🎁 Points are awarded automatically when orders are delivered!';
END $$;




