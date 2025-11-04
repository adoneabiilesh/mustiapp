-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT[], -- Array of image URLs
  helpful_count INTEGER DEFAULT 0,
  admin_response TEXT,
  admin_response_at TIMESTAMPTZ,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create review_helpfulness table
CREATE TABLE IF NOT EXISTS public.review_helpfulness (
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (review_id, user_id)
);

-- Add rating columns to menu_items
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_order ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_menu_item ON public.reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_review_helpfulness_review ON public.review_helpfulness(review_id);

-- RLS Policies for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can create reviews for their orders"
  ON public.reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    order_id IN (
      SELECT id FROM public.orders 
      WHERE customer_id = auth.uid() AND status = 'delivered'
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all reviews"
  ON public.reviews FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for review_helpfulness
ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can mark reviews as helpful"
  ON public.review_helpfulness FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their helpfulness votes"
  ON public.review_helpfulness FOR UPDATE
  USING (user_id = auth.uid());

-- Function to update review helpfulness count
CREATE OR REPLACE FUNCTION update_review_helpfulness_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.reviews
  SET helpful_count = (
    SELECT COUNT(*) 
    FROM public.review_helpfulness 
    WHERE review_id = NEW.review_id AND is_helpful = TRUE
  )
  WHERE id = NEW.review_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_helpfulness_update_trigger
  AFTER INSERT OR UPDATE ON public.review_helpfulness
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpfulness_count();

-- Function to update menu item ratings
CREATE OR REPLACE FUNCTION update_menu_item_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.menu_items
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE menu_item_id = NEW.menu_item_id AND status = 'approved'
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE menu_item_id = NEW.menu_item_id AND status = 'approved'
    )
  WHERE id = NEW.menu_item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER menu_item_rating_update_trigger
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  WHEN (NEW.menu_item_id IS NOT NULL)
  EXECUTE FUNCTION update_menu_item_rating();



