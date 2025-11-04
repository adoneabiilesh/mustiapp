-- Loyalty Program (FIXED VERSION)
-- Uses user_profiles instead of auth.users

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE,
  dietary_restrictions TEXT[],
  allergens TEXT[],
  favorite_cuisines TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  points_awarded INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral ON public.user_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON public.loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON public.loyalty_points(tier);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON public.points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON public.points_transactions(type);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON public.rewards(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_rewards_user ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_redeemed ON public.user_rewards(redeemed) WHERE redeemed = FALSE;
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON public.referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);

-- RLS Policies for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- RLS Policies for loyalty_points
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loyalty points"
  ON public.loyalty_points FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage loyalty points"
  ON public.loyalty_points FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for points_transactions
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.points_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage transactions"
  ON public.points_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for rewards
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rewards"
  ON public.rewards FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Service role can manage rewards"
  ON public.rewards FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for user_rewards
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards"
  ON public.user_rewards FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own rewards"
  ON public.user_rewards FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage user rewards"
  ON public.user_rewards FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (referrer_id = auth.uid() OR referee_id = auth.uid());

CREATE POLICY "Service role can manage referrals"
  ON public.referrals FOR ALL
  USING (auth.role() = 'service_role');

-- Function to calculate tier based on total earned points
CREATE OR REPLACE FUNCTION calculate_tier(total_earned INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF total_earned >= 2500 THEN
    RETURN 'platinum';
  ELSIF total_earned >= 1000 THEN
    RETURN 'gold';
  ELSIF total_earned >= 500 THEN
    RETURN 'silver';
  ELSE
    RETURN 'bronze';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to award points for order
CREATE OR REPLACE FUNCTION award_points_for_order()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER;
  user_loyalty RECORD;
BEGIN
  -- Only award points for delivered orders
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Calculate points (1 point per euro)
    points_to_award := FLOOR(NEW.total_amount);
    
    -- Get or create loyalty record
    INSERT INTO public.loyalty_points (user_id, points, total_earned)
    VALUES (NEW.customer_id, points_to_award, points_to_award)
    ON CONFLICT (user_id) DO UPDATE
    SET 
      points = public.loyalty_points.points + points_to_award,
      total_earned = public.loyalty_points.total_earned + points_to_award,
      tier = calculate_tier(public.loyalty_points.total_earned + points_to_award),
      updated_at = NOW()
    RETURNING * INTO user_loyalty;
    
    -- Record transaction
    INSERT INTO public.points_transactions (user_id, order_id, points, type, description)
    VALUES (
      NEW.customer_id,
      NEW.id,
      points_to_award,
      'earned',
      'Points earned from order #' || SUBSTRING(NEW.id::TEXT, 1, 8)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER award_points_trigger
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION award_points_for_order();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  done BOOLEAN := FALSE;
BEGIN
  WHILE NOT done LOOP
    -- Generate random 8-character code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if it already exists
    IF NOT EXISTS (SELECT 1 FROM public.referrals WHERE referral_code = code) THEN
      done := TRUE;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Insert some default rewards
INSERT INTO public.rewards (title, description, points_required, discount_type, discount_value, active)
VALUES 
  ('€5 Off', 'Get €5 off your next order', 100, 'fixed', 5.00, TRUE),
  ('€10 Off', 'Get €10 off your next order', 200, 'fixed', 10.00, TRUE),
  ('10% Off', 'Get 10% off your entire order', 150, 'percentage', 10.00, TRUE),
  ('15% Off', 'Get 15% off your entire order', 300, 'percentage', 15.00, TRUE),
  ('Free Delivery', 'Free delivery on your next order', 50, 'fixed', 3.99, TRUE)
ON CONFLICT DO NOTHING;



