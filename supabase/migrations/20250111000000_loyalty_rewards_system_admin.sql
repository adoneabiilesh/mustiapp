-- ============================================================================
-- COMPREHENSIVE LOYALTY REWARDS SYSTEM WITH ADMIN SUPPORT
-- ============================================================================

-- Ensure loyalty_points table exists with all fields
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

-- Ensure points_transactions table exists
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'bonus', 'referral', 'admin_adjustment')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced rewards table with more fields for admin management
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL CHECK (points_required > 0),
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'free_item')),
  discount_value DECIMAL(10,2),
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  tier_required TEXT CHECK (tier_required IN ('bronze', 'silver', 'gold', 'platinum')),
  max_redemptions INTEGER, -- Limit on how many times this reward can be redeemed
  current_redemptions INTEGER DEFAULT 0, -- Track current redemptions
  expiry_date TIMESTAMPTZ, -- Optional expiry date for reward availability
  display_order INTEGER DEFAULT 0, -- Order for display in admin and app
  created_by UUID REFERENCES auth.users(id), -- Admin who created this
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User rewards table
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

-- Loyalty system settings table (for admin to configure the system)
CREATE TABLE IF NOT EXISTS public.loyalty_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default loyalty system settings
INSERT INTO public.loyalty_settings (setting_key, setting_value, description) VALUES
  ('points_per_euro', '1', 'Points earned per euro spent'),
  ('bronze_multiplier', '1.0', 'Points multiplier for bronze tier'),
  ('silver_multiplier', '1.5', 'Points multiplier for silver tier'),
  ('gold_multiplier', '2.0', 'Points multiplier for gold tier'),
  ('platinum_multiplier', '3.0', 'Points multiplier for platinum tier'),
  ('points_expiry_days', '365', 'Number of days before points expire'),
  ('tier_thresholds', '{"bronze": 0, "silver": 500, "gold": 1500, "platinum": 4000}', 'Points required for each tier'),
  ('referral_points', '100', 'Points awarded for successful referral'),
  ('birthday_bonus', '50', 'Points awarded on birthday'),
  ('first_order_bonus', '50', 'Points awarded for first order')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON public.loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON public.loyalty_points(tier);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON public.points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON public.points_transactions(type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created ON public.points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON public.rewards(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_rewards_tier ON public.rewards(tier_required);
CREATE INDEX IF NOT EXISTS idx_rewards_points ON public.rewards(points_required);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_redeemed ON public.user_rewards(redeemed) WHERE redeemed = FALSE;
-- Index for expires_at (without WHERE clause since NOW() is not IMMUTABLE)
-- For filtering expired rewards, use: WHERE expires_at > NOW() OR expires_at IS NULL in queries
CREATE INDEX IF NOT EXISTS idx_user_rewards_expires ON public.user_rewards(expires_at);

-- Enable RLS
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own loyalty points" ON public.loyalty_points;
DROP POLICY IF EXISTS "Service role can manage loyalty points" ON public.loyalty_points;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "Service role can manage transactions" ON public.points_transactions;
DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.rewards;
DROP POLICY IF EXISTS "Service role can manage rewards" ON public.rewards;
DROP POLICY IF EXISTS "Users can view their own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Service role can manage user rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Service role can manage loyalty settings" ON public.loyalty_settings;

-- RLS Policies for loyalty_points
CREATE POLICY "Users can view their own loyalty points"
  ON public.loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage loyalty points"
  ON public.loyalty_points FOR ALL
  USING (auth.jwt()->>'role' = 'service_role' OR EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid() AND role = 'admin' AND is_active = TRUE
  ));

-- RLS Policies for points_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.points_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage transactions"
  ON public.points_transactions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role' OR EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid() AND role = 'admin' AND is_active = TRUE
  ));

-- RLS Policies for rewards
CREATE POLICY "Anyone can view active rewards"
  ON public.rewards FOR SELECT
  USING (active = TRUE OR auth.jwt()->>'role' = 'service_role' OR EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid() AND role = 'admin' AND is_active = TRUE
  ));

CREATE POLICY "Service role can manage rewards"
  ON public.rewards FOR ALL
  USING (auth.jwt()->>'role' = 'service_role' OR EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid() AND role = 'admin' AND is_active = TRUE
  ));

-- RLS Policies for user_rewards
CREATE POLICY "Users can view their own rewards"
  ON public.user_rewards FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role' OR EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid() AND role = 'admin' AND is_active = TRUE
  ));

CREATE POLICY "Service role can manage user rewards"
  ON public.user_rewards FOR ALL
  USING (auth.jwt()->>'role' = 'service_role' OR EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid() AND role = 'admin' AND is_active = TRUE
  ));

-- RLS Policies for loyalty_settings
CREATE POLICY "Service role can manage loyalty settings"
  ON public.loyalty_settings FOR ALL
  USING (auth.jwt()->>'role' = 'service_role' OR EXISTS (
    SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid() AND role = 'admin' AND is_active = TRUE
  ));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_loyalty_points_updated_at
  BEFORE UPDATE ON public.loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_settings_updated_at
  BEFORE UPDATE ON public.loyalty_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment reward redemptions counter
CREATE OR REPLACE FUNCTION increment_reward_redemptions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.rewards
  SET current_redemptions = current_redemptions + 1
  WHERE id = NEW.reward_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment redemptions
CREATE TRIGGER increment_reward_redemptions_trigger
  AFTER INSERT ON public.user_rewards
  FOR EACH ROW
  EXECUTE FUNCTION increment_reward_redemptions();

