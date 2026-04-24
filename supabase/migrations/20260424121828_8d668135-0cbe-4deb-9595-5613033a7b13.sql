CREATE TABLE IF NOT EXISTS public.revenue_split_config (
  key TEXT PRIMARY KEY,
  value NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_split_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage revenue split config" ON public.revenue_split_config;
CREATE POLICY "Admins manage revenue split config"
ON public.revenue_split_config
FOR ALL
TO authenticated
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));

DROP TRIGGER IF EXISTS update_revenue_split_config_updated_at ON public.revenue_split_config;
CREATE TRIGGER update_revenue_split_config_updated_at
BEFORE UPDATE ON public.revenue_split_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins manage feature flags"
ON public.feature_flags
FOR ALL
TO authenticated
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));

DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_phone TEXT,
  recipient_name TEXT,
  template_name TEXT,
  message_preview TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage notification logs" ON public.notification_logs;
CREATE POLICY "Admins manage notification logs"
ON public.notification_logs
FOR ALL
TO authenticated
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  type TEXT NOT NULL CHECK (type IN ('doctor', 'therapist', 'venue')),
  recipient_name TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  bank_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage payout requests" ON public.payout_requests;
CREATE POLICY "Admins manage payout requests"
ON public.payout_requests
FOR ALL
TO authenticated
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));

DROP TRIGGER IF EXISTS update_payout_requests_updated_at ON public.payout_requests;
CREATE TRIGGER update_payout_requests_updated_at
BEFORE UPDATE ON public.payout_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.revenue_split_config (key, value) VALUES
  ('therapist_percent', 45),
  ('venue_percent', 25),
  ('doctor_referral_percent', 10),
  ('platform_percent', 20)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.feature_flags (key, enabled, description) VALUES
  ('maintenance_mode', false, 'Show a maintenance banner on the main site'),
  ('allow_guest_checkout', true, 'Allow checkout without login'),
  ('prescription_upload_enabled', true, 'Allow patients to upload prescriptions'),
  ('therapist_gps_tracking_enabled', true, 'Enable therapist GPS tracking for sessions')
ON CONFLICT (key) DO NOTHING;