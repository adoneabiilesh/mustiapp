-- Favorites & Quick Reorder System
-- Customer Support System

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  customizations JSONB DEFAULT '{}',
  notes TEXT,
  collection TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, menu_item_id, customizations)
);

-- Create saved_orders table
CREATE TABLE IF NOT EXISTS public.saved_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('order', 'payment', 'technical', 'feedback', 'other')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create support_messages table
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachments TEXT[],
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create faq_articles table
CREATE TABLE IF NOT EXISTS public.faq_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create faq_helpfulness table
CREATE TABLE IF NOT EXISTS public.faq_helpfulness (
  article_id UUID REFERENCES public.faq_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (article_id, user_id)
);

-- Add dietary preferences and allergens to users
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[],
ADD COLUMN IF NOT EXISTS allergens TEXT[],
ADD COLUMN IF NOT EXISTS favorite_cuisines TEXT[];

-- Add search-related fields to menu_items
ALTER TABLE public.menu_items
ADD COLUMN IF NOT EXISTS dietary_info TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS spice_level INTEGER CHECK (spice_level >= 0 AND spice_level <= 5),
ADD COLUMN IF NOT EXISTS preparation_time INTEGER, -- in minutes
ADD COLUMN IF NOT EXISTS calories INTEGER,
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_menu_item ON public.favorites(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_favorites_collection ON public.favorites(collection);
CREATE INDEX IF NOT EXISTS idx_saved_orders_user ON public.saved_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON public.support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_faq_articles_category ON public.faq_articles(category) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_faq_articles_views ON public.faq_articles(views DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_search ON public.menu_items USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_menu_items_price ON public.menu_items(price);
CREATE INDEX IF NOT EXISTS idx_menu_items_rating ON public.menu_items(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_dietary ON public.menu_items USING GIN(dietary_info);
CREATE INDEX IF NOT EXISTS idx_menu_items_allergens ON public.menu_items USING GIN(allergens);

-- RLS Policies for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own favorites"
  ON public.favorites FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for saved_orders
ALTER TABLE public.saved_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved orders"
  ON public.saved_orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own saved orders"
  ON public.saved_orders FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tickets"
  ON public.support_tickets FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Support staff can view all tickets"
  ON public.support_tickets FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'support'
    )
  );

CREATE POLICY "Support staff can manage tickets"
  ON public.support_tickets FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('support', 'admin')
    )
  );

CREATE POLICY "Service role can manage all tickets"
  ON public.support_tickets FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for support_messages
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their tickets"
  ON public.support_messages FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
    ) AND is_internal = FALSE
  );

CREATE POLICY "Users can send messages in their tickets"
  ON public.support_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    ticket_id IN (
      SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Support staff can view all messages"
  ON public.support_messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('support', 'admin')
    )
  );

CREATE POLICY "Support staff can send messages"
  ON public.support_messages FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('support', 'admin')
    )
  );

CREATE POLICY "Service role can manage messages"
  ON public.support_messages FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for faq_articles
ALTER TABLE public.faq_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active FAQ articles"
  ON public.faq_articles FOR SELECT
  USING (active = TRUE);

CREATE POLICY "Service role can manage FAQ articles"
  ON public.faq_articles FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for faq_helpfulness
ALTER TABLE public.faq_helpfulness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can mark FAQ articles as helpful"
  ON public.faq_helpfulness FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their helpfulness votes"
  ON public.faq_helpfulness FOR UPDATE
  USING (user_id = auth.uid());

-- Function to update FAQ helpfulness counts
CREATE OR REPLACE FUNCTION update_faq_helpfulness()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.faq_articles
  SET 
    helpful_count = (
      SELECT COUNT(*) FROM public.faq_helpfulness 
      WHERE article_id = NEW.article_id AND is_helpful = TRUE
    ),
    not_helpful_count = (
      SELECT COUNT(*) FROM public.faq_helpfulness 
      WHERE article_id = NEW.article_id AND is_helpful = FALSE
    )
  WHERE id = NEW.article_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER faq_helpfulness_trigger
  AFTER INSERT OR UPDATE ON public.faq_helpfulness
  FOR EACH ROW
  EXECUTE FUNCTION update_faq_helpfulness();

-- Function to increment FAQ views
CREATE OR REPLACE FUNCTION increment_faq_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.faq_articles
  SET views = views + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_menu_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.dietary_info, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER menu_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_search_vector();

-- Insert sample FAQ articles
INSERT INTO public.faq_articles (category, question, answer, sort_order)
VALUES 
  ('Ordering', 'How do I place an order?', 'Browse our menu, add items to your cart, and proceed to checkout. You can pay with card or cash on delivery.', 1),
  ('Ordering', 'Can I schedule an order for later?', 'Yes! During checkout, you can select a delivery time that works for you.', 2),
  ('Ordering', 'What is the minimum order amount?', 'The minimum order amount is €10. Delivery fee applies for orders under €20.', 3),
  ('Delivery', 'How long does delivery take?', 'Typical delivery time is 30-45 minutes depending on your location and order complexity.', 1),
  ('Delivery', 'Can I track my order?', 'Yes! You can track your order in real-time from the Orders tab. You''ll see the driver''s location once they''re on the way.', 2),
  ('Delivery', 'What are the delivery hours?', 'We deliver from 11 AM to 11 PM, 7 days a week.', 3),
  ('Payment', 'What payment methods do you accept?', 'We accept credit/debit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and cash on delivery.', 1),
  ('Payment', 'Is my payment information secure?', 'Yes! All payments are processed securely through Stripe. We never store your card information.', 2),
  ('Payment', 'Can I get a refund?', 'Yes, if there''s an issue with your order, contact support within 24 hours and we''ll process a refund.', 3),
  ('Account', 'How do I create an account?', 'Tap the Profile tab and select "Sign Up". You''ll need to provide your email and create a password.', 1),
  ('Account', 'I forgot my password. What should I do?', 'On the login screen, tap "Forgot Password" and follow the instructions to reset it.', 2),
  ('Account', 'How do I update my delivery address?', 'Go to Profile → Addresses, and you can add, edit, or remove delivery addresses.', 3),
  ('Loyalty', 'How does the loyalty program work?', 'Earn 1 point for every €1 you spend. Redeem points for discounts and rewards!', 1),
  ('Loyalty', 'What are the different tiers?', 'We have 4 tiers: Bronze (0-499 points), Silver (500-999), Gold (1000-2499), and Platinum (2500+). Each tier unlocks special benefits!', 2),
  ('Loyalty', 'Do my points expire?', 'Points expire after 12 months of inactivity. Keep ordering to keep your points active!', 3)
ON CONFLICT DO NOTHING;

-- Enable real-time for support tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;



