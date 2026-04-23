
-- 1. Revenue split config (admin-tunable percentages)
CREATE TABLE public.revenue_split_config (
  key text PRIMARY KEY,
  value numeric NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_split_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads split config"
  ON public.revenue_split_config FOR SELECT USING (true);
CREATE POLICY "Admins manage split config"
  ON public.revenue_split_config FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.revenue_split_config (key, value, description) VALUES
  ('therapist_pct', 65, 'Therapist share of therapy fee (%)'),
  ('venue_pct',     20, 'Venue room share of therapy fee (%)'),
  ('doctor_pct',    10, 'Doctor referral share of therapy fee (%)'),
  ('platform_pct',   5, 'Ayuzee platform share of therapy fee (%)')
ON CONFLICT (key) DO NOTHING;

CREATE TRIGGER update_revenue_split_config_updated_at
  BEFORE UPDATE ON public.revenue_split_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Payout requests (therapists & venues)
CREATE TABLE public.payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('therapist','venue','doctor')),
  requester_user_id uuid NOT NULL,
  therapist_id uuid REFERENCES public.therapists(id) ON DELETE SET NULL,
  venue_id uuid REFERENCES public.therapy_venues(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  notes text,
  admin_note text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requester views own payout"
  ON public.payout_requests FOR SELECT USING (auth.uid() = requester_user_id);
CREATE POLICY "Requester creates own payout"
  ON public.payout_requests FOR INSERT WITH CHECK (auth.uid() = requester_user_id);
CREATE POLICY "Admins manage payouts"
  ON public.payout_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_payout_requests_updated_at
  BEFORE UPDATE ON public.payout_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_payout_requests_status ON public.payout_requests(status, created_at DESC);
CREATE INDEX idx_payout_requests_user   ON public.payout_requests(requester_user_id, created_at DESC);

-- 3. Refund requests (logged when admin cancels a paid session)
CREATE TABLE public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.therapy_sessions(id) ON DELETE SET NULL,
  patient_user_id uuid,
  amount numeric NOT NULL,
  razorpay_payment_id text,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processed','failed','rejected')),
  admin_note text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient views own refund"
  ON public.refund_requests FOR SELECT USING (auth.uid() = patient_user_id);
CREATE POLICY "Admins manage refunds"
  ON public.refund_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_refund_requests_updated_at
  BEFORE UPDATE ON public.refund_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
