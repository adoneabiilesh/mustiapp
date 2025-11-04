-- GDPR Compliance Features
-- Data export, deletion, consent management

-- Create consent_records table
CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('marketing', 'analytics', 'essential', 'location')),
  granted BOOLEAN NOT NULL,
  consent_text TEXT,
  ip_address TEXT,
  user_agent TEXT,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create data_export_requests table
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  export_url TEXT,
  expires_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create deletion_requests table
CREATE TABLE IF NOT EXISTS public.deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  scheduled_deletion_date TIMESTAMPTZ,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create marketing_preferences table
CREATE TABLE IF NOT EXISTS public.marketing_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_marketing BOOLEAN DEFAULT FALSE,
  sms_marketing BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  promotional_offers BOOLEAN DEFAULT TRUE,
  order_updates BOOLEAN DEFAULT TRUE,
  loyalty_updates BOOLEAN DEFAULT TRUE,
  newsletter BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add GDPR-related fields to users
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login_ip TEXT,
ADD COLUMN IF NOT EXISTS account_deletion_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS account_deletion_date TIMESTAMPTZ;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consent_records_user ON public.consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_type ON public.consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user ON public.data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status ON public.data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user ON public.deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON public.deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);

-- RLS Policies for consent_records
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consent records"
  ON public.consent_records FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create consent records"
  ON public.consent_records FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage consent records"
  ON public.consent_records FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for data_export_requests
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own export requests"
  ON public.data_export_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create export requests"
  ON public.data_export_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage export requests"
  ON public.data_export_requests FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for deletion_requests
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deletion requests"
  ON public.deletion_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create deletion requests"
  ON public.deletion_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel their deletion requests"
  ON public.deletion_requests FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (status = 'cancelled');

CREATE POLICY "Service role can manage deletion requests"
  ON public.deletion_requests FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit log"
  ON public.audit_log FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage audit log"
  ON public.audit_log FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for marketing_preferences
ALTER TABLE public.marketing_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own marketing preferences"
  ON public.marketing_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own marketing preferences"
  ON public.marketing_preferences FOR ALL
  USING (user_id = auth.uid());

-- Function to export user data (returns JSON)
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  export_data JSON;
BEGIN
  SELECT json_build_object(
    'user_profile', (
      SELECT json_build_object(
        'email', email,
        'created_at', created_at,
        'last_sign_in', last_sign_in_at
      )
      FROM auth.users
      WHERE id = target_user_id
    ),
    'orders', (
      SELECT json_agg(o)
      FROM public.orders o
      WHERE o.customer_id = target_user_id
    ),
    'reviews', (
      SELECT json_agg(r)
      FROM public.reviews r
      WHERE r.user_id = target_user_id
    ),
    'loyalty_points', (
      SELECT row_to_json(lp)
      FROM public.loyalty_points lp
      WHERE lp.user_id = target_user_id
    ),
    'favorites', (
      SELECT json_agg(f)
      FROM public.favorites f
      WHERE f.user_id = target_user_id
    ),
    'addresses', (
      SELECT json_agg(a)
      FROM public.user_addresses a
      WHERE a.user_id = target_user_id
    ),
    'consent_records', (
      SELECT json_agg(c)
      FROM public.consent_records c
      WHERE c.user_id = target_user_id
    )
  ) INTO export_data;
  
  RETURN export_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to anonymize user data (soft delete)
CREATE OR REPLACE FUNCTION anonymize_user_data(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Anonymize user profile
  UPDATE auth.users
  SET
    email = 'deleted_' || id || '@anonymized.local',
    raw_user_meta_data = '{}',
    encrypted_password = '',
    phone = NULL,
    deleted_at = NOW()
  WHERE id = target_user_id;
  
  -- Anonymize orders (keep for business records but remove PII)
  UPDATE public.orders
  SET
    customer_name = 'Deleted User',
    customer_phone = NULL,
    delivery_address = json_build_object('street', '[Redacted]', 'city', '[Redacted]')
  WHERE customer_id = target_user_id;
  
  -- Delete reviews (optional - or keep but anonymize)
  UPDATE public.reviews
  SET user_id = NULL
  WHERE user_id = target_user_id;
  
  -- Delete favorites
  DELETE FROM public.favorites WHERE user_id = target_user_id;
  
  -- Delete saved orders
  DELETE FROM public.saved_orders WHERE user_id = target_user_id;
  
  -- Delete support tickets (or anonymize)
  UPDATE public.support_tickets
  SET user_id = NULL
  WHERE user_id = target_user_id;
  
  -- Keep audit log but mark as anonymized
  UPDATE public.audit_log
  SET user_id = NULL
  WHERE user_id = target_user_id;
  
  -- Delete consent records
  DELETE FROM public.consent_records WHERE user_id = target_user_id;
  
  -- Delete marketing preferences
  DELETE FROM public.marketing_preferences WHERE user_id = target_user_id;
  
  -- Log the anonymization
  INSERT INTO public.audit_log (user_id, action, entity_type)
  VALUES (target_user_id, 'user_anonymized', 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can be deleted (respects retention periods)
CREATE OR REPLACE FUNCTION can_delete_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_recent_orders BOOLEAN;
  has_pending_refunds BOOLEAN;
BEGIN
  -- Check for orders in last 30 days
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE customer_id = target_user_id
    AND created_at > NOW() - INTERVAL '30 days'
  ) INTO has_recent_orders;
  
  -- Check for pending refunds
  SELECT EXISTS (
    SELECT 1 FROM public.refunds r
    JOIN public.payments p ON r.payment_id = p.id
    JOIN public.orders o ON p.order_id = o.id
    WHERE o.customer_id = target_user_id
    AND r.status = 'pending'
  ) INTO has_pending_refunds;
  
  RETURN NOT (has_recent_orders OR has_pending_refunds);
END;
$$ LANGUAGE plpgsql;

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_entry()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for sensitive tables (optional)
-- Uncomment to enable auditing
/*
CREATE TRIGGER audit_orders_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_entry();

CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_entry();
*/

-- Function to automatically expire data export URLs
CREATE OR REPLACE FUNCTION expire_export_urls()
RETURNS void AS $$
BEGIN
  UPDATE public.data_export_requests
  SET 
    export_url = NULL,
    status = 'completed'
  WHERE 
    expires_at < NOW()
    AND export_url IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- Run this manually in production or set up a cron job
-- SELECT cron.schedule('expire-exports', '0 * * * *', 'SELECT expire_export_urls()');



