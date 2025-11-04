-- Advanced Order Tracking System (FIXED VERSION)
-- Real-time GPS tracking, delivery photos, driver communication

-- Create drivers table FIRST
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  vehicle_type TEXT CHECK (vehicle_type IN ('bike', 'scooter', 'car', 'motorcycle')),
  vehicle_number TEXT,
  license_number TEXT,
  license_verified BOOLEAN DEFAULT FALSE,
  background_check_status TEXT DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'approved', 'rejected')),
  current_status TEXT DEFAULT 'offline' CHECK (current_status IN ('offline', 'available', 'busy', 'break')),
  current_lat DECIMAL(10,8),
  current_lng DECIMAL(11,8),
  last_location_update TIMESTAMPTZ,
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_deliveries INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add driver columns to orders table (using conditional logic to avoid errors)
DO $$ 
BEGIN
  -- Add driver_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'driver_id') THEN
    ALTER TABLE public.orders ADD COLUMN driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL;
  END IF;
  
  -- Add driver_rating column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'driver_rating') THEN
    ALTER TABLE public.orders ADD COLUMN driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5);
  END IF;
  
  -- Add driver_tip column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'orders' 
                 AND column_name = 'driver_tip') THEN
    ALTER TABLE public.orders ADD COLUMN driver_tip DECIMAL(10,2) DEFAULT 0.00;
  END IF;
END $$;

-- Create delivery_tracking table
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  current_lat DECIMAL(10,8),
  current_lng DECIMAL(11,8),
  estimated_arrival TIMESTAMPTZ,
  distance_remaining DECIMAL(10,2), -- in kilometers
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'on_the_way', 'arrived', 'delivered')),
  pickup_time TIMESTAMPTZ,
  delivery_time TIMESTAMPTZ,
  route_polyline TEXT, -- Encoded polyline for route display
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create delivery_location_history table (for tracking movement)
CREATE TABLE IF NOT EXISTS public.delivery_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES public.delivery_tracking(id) ON DELETE CASCADE,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  speed DECIMAL(5,2), -- km/h
  heading DECIMAL(5,2), -- degrees
  accuracy DECIMAL(8,2), -- meters
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create delivery_photos table
CREATE TABLE IF NOT EXISTS public.delivery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('pickup', 'delivery', 'issue')),
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_chat table
CREATE TABLE IF NOT EXISTS public.order_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create driver_earnings table
CREATE TABLE IF NOT EXISTS public.driver_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  base_pay DECIMAL(10,2) NOT NULL,
  tips DECIMAL(10,2) DEFAULT 0.00,
  bonus DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create driver_shifts table
CREATE TABLE IF NOT EXISTS public.driver_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  total_deliveries INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  distance_traveled DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(current_status) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_drivers_location ON public.drivers(current_lat, current_lng) WHERE current_status = 'available';
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order ON public.delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_driver ON public.delivery_tracking(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_status ON public.delivery_tracking(status);
CREATE INDEX IF NOT EXISTS idx_delivery_location_history_delivery ON public.delivery_location_history(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_photos_order ON public.delivery_photos(order_id);
CREATE INDEX IF NOT EXISTS idx_order_chat_order ON public.order_chat(order_id);
CREATE INDEX IF NOT EXISTS idx_order_chat_created ON public.order_chat(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_driver ON public.driver_earnings(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_paid ON public.driver_earnings(paid) WHERE paid = FALSE;
CREATE INDEX IF NOT EXISTS idx_driver_shifts_driver ON public.driver_shifts(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON public.orders(driver_id);

-- RLS Policies for drivers
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their own profile"
  ON public.drivers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Drivers can update their own profile"
  ON public.drivers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage drivers"
  ON public.drivers FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for delivery_tracking
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their order tracking"
  ON public.delivery_tracking FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can view their assigned deliveries"
  ON public.delivery_tracking FOR SELECT
  USING (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can update their assigned deliveries"
  ON public.delivery_tracking FOR UPDATE
  USING (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage delivery tracking"
  ON public.delivery_tracking FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for delivery_location_history
ALTER TABLE public.delivery_location_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view location history for their orders"
  ON public.delivery_location_history FOR SELECT
  USING (
    delivery_id IN (
      SELECT id FROM public.delivery_tracking dt
      JOIN public.orders o ON dt.order_id = o.id
      WHERE o.customer_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage location history"
  ON public.delivery_location_history FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for delivery_photos
ALTER TABLE public.delivery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view photos for their orders"
  ON public.delivery_photos FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can upload photos"
  ON public.delivery_photos FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND
    uploaded_by IN (SELECT user_id FROM public.drivers)
  );

CREATE POLICY "Service role can manage delivery photos"
  ON public.delivery_photos FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for order_chat
ALTER TABLE public.order_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat for their orders"
  ON public.order_chat FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = auth.uid()
    ) OR
    sender_id = auth.uid()
  );

CREATE POLICY "Users can send messages in their order chats"
  ON public.order_chat FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    (
      order_id IN (
        SELECT id FROM public.orders WHERE customer_id = auth.uid()
      ) OR
      sender_id IN (
        SELECT d.user_id FROM public.drivers d
        JOIN public.delivery_tracking dt ON d.id = dt.driver_id
        WHERE dt.order_id = order_chat.order_id
      )
    )
  );

CREATE POLICY "Service role can manage order chat"
  ON public.order_chat FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for driver_earnings
ALTER TABLE public.driver_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their own earnings"
  ON public.driver_earnings FOR SELECT
  USING (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage driver earnings"
  ON public.driver_earnings FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for driver_shifts
ALTER TABLE public.driver_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their own shifts"
  ON public.driver_shifts FOR SELECT
  USING (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can manage their own shifts"
  ON public.driver_shifts FOR INSERT
  WITH CHECK (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can update their own shifts"
  ON public.driver_shifts FOR UPDATE
  USING (
    driver_id IN (
      SELECT id FROM public.drivers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage driver shifts"
  ON public.driver_shifts FOR ALL
  USING (auth.role() = 'service_role');

-- Function to calculate ETA based on distance
CREATE OR REPLACE FUNCTION calculate_eta(distance_km DECIMAL)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  -- Assume average speed of 30 km/h in city
  -- Add 5 minutes buffer time
  RETURN NOW() + (distance_km / 30.0 * INTERVAL '1 hour') + INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Function to update driver statistics
CREATE OR REPLACE FUNCTION update_driver_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    UPDATE public.drivers
    SET 
      total_deliveries = total_deliveries + 1,
      updated_at = NOW()
    WHERE id = NEW.driver_id;
    
    -- Record earnings
    INSERT INTO public.driver_earnings (driver_id, order_id, base_pay, tips, total)
    SELECT 
      NEW.driver_id,
      NEW.order_id,
      5.00, -- base pay per delivery
      COALESCE(o.driver_tip, 0.00),
      5.00 + COALESCE(o.driver_tip, 0.00)
    FROM public.orders o
    WHERE o.id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER driver_stats_update_trigger
  AFTER INSERT OR UPDATE ON public.delivery_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_stats();

-- Function to update driver rating
CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.driver_rating IS NOT NULL AND (OLD.driver_rating IS NULL OR OLD.driver_rating != NEW.driver_rating) THEN
    UPDATE public.drivers
    SET rating = (
      SELECT COALESCE(AVG(driver_rating), 5.00)
      FROM public.orders
      WHERE driver_id = NEW.driver_id AND driver_rating IS NOT NULL
    )
    WHERE id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER driver_rating_update_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (NEW.driver_rating IS NOT NULL)
  EXECUTE FUNCTION update_driver_rating();

-- Enable real-time for tracking tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_location_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_chat;



