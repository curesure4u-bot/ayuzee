-- 1. THERAPISTS
CREATE TABLE public.therapists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  gender text CHECK (gender IN ('male','female','other')),
  photo_url text,
  certificate_url text,
  certificate_number text,
  certifying_body text,
  years_experience int DEFAULT 0,
  allowed_therapies text[] DEFAULT '{}',
  is_verified boolean DEFAULT false,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending','approved','rejected','suspended')),
  rejection_reason text,
  current_location_lat float,
  current_location_lng float,
  last_location_update timestamptz,
  is_available boolean DEFAULT false,
  rating float DEFAULT 0,
  total_sessions int DEFAULT 0,
  city text,
  state text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapist views own row" ON public.therapists
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Therapist inserts own row" ON public.therapists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Therapist updates own row" ON public.therapists
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Approved therapists public" ON public.therapists
  FOR SELECT USING (is_verified = true AND verification_status = 'approved');
CREATE POLICY "Admins manage therapists" ON public.therapists
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON public.therapists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. THERAPY VENUES
CREATE TABLE public.therapy_venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text CHECK (type IN ('hospital','clinic','resort','wellness_center','home_setup')),
  address_line1 text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  lat float,
  lng float,
  phone text,
  email text,
  gstin text,
  photo_urls text[] DEFAULT '{}',
  available_therapies text[] DEFAULT '{}',
  rooms jsonb DEFAULT '[]'::jsonb,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  rating float DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.therapy_venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages own venue" ON public.therapy_venues
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Verified active venues public" ON public.therapy_venues
  FOR SELECT USING (is_verified = true AND is_active = true);
CREATE POLICY "Admins manage venues" ON public.therapy_venues
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_therapy_venues_updated_at
  BEFORE UPDATE ON public.therapy_venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. THERAPY SESSIONS
CREATE TABLE public.therapy_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapy_plan_id uuid REFERENCES public.therapy_plans(id) ON DELETE SET NULL,
  doctor_user_id uuid,
  therapy_code text NOT NULL,
  therapy_name text NOT NULL,
  session_number int DEFAULT 1,
  total_sessions_in_plan int DEFAULT 1,
  patient_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  patient_phone text,
  therapist_id uuid REFERENCES public.therapists(id) ON DELETE SET NULL,
  venue_id uuid REFERENCES public.therapy_venues(id) ON DELETE SET NULL,
  venue_room text,
  scheduled_date date NOT NULL,
  scheduled_start time NOT NULL,
  scheduled_duration_minutes int NOT NULL,
  actual_start_time timestamptz,
  actual_end_time timestamptz,
  actual_duration_minutes int,
  status text DEFAULT 'scheduled' CHECK (status IN (
    'scheduled','therapist_assigned','therapist_en_route',
    'therapist_arrived','in_progress','completed','cancelled','no_show'
  )),
  therapist_checkin_lat float,
  therapist_checkin_lng float,
  therapist_checkout_lat float,
  therapist_checkout_lng float,
  medicines_prescribed jsonb DEFAULT '[]'::jsonb,
  medicines_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  platform_fee numeric DEFAULT 0,
  therapist_earnings numeric DEFAULT 0,
  venue_earnings numeric DEFAULT 0,
  doctor_referral_fee numeric DEFAULT 0,
  payment_status text DEFAULT 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  patient_rating int CHECK (patient_rating BETWEEN 1 AND 5),
  patient_review text,
  therapist_notes text,
  complaint_flag boolean DEFAULT false,
  complaint_detail text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.therapy_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient views own sessions" ON public.therapy_sessions
  FOR SELECT USING (auth.uid() = patient_user_id);
CREATE POLICY "Doctor views own prescribed sessions" ON public.therapy_sessions
  FOR SELECT USING (auth.uid() = doctor_user_id);
CREATE POLICY "Therapist views assigned sessions" ON public.therapy_sessions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.therapists t WHERE t.id = therapy_sessions.therapist_id AND t.user_id = auth.uid()
  ));
CREATE POLICY "Venue owner views venue sessions" ON public.therapy_sessions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.therapy_venues v WHERE v.id = therapy_sessions.venue_id AND v.owner_user_id = auth.uid()
  ));
CREATE POLICY "Patient creates own session" ON public.therapy_sessions
  FOR INSERT WITH CHECK (auth.uid() = patient_user_id);
CREATE POLICY "Doctor creates session" ON public.therapy_sessions
  FOR INSERT WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "Patient updates own session" ON public.therapy_sessions
  FOR UPDATE USING (auth.uid() = patient_user_id);
CREATE POLICY "Doctor updates own session" ON public.therapy_sessions
  FOR UPDATE USING (auth.uid() = doctor_user_id);
CREATE POLICY "Therapist updates assigned session" ON public.therapy_sessions
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.therapists t WHERE t.id = therapy_sessions.therapist_id AND t.user_id = auth.uid()
  ));
CREATE POLICY "Venue owner updates venue session" ON public.therapy_sessions
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.therapy_venues v WHERE v.id = therapy_sessions.venue_id AND v.owner_user_id = auth.uid()
  ));
CREATE POLICY "Admins manage sessions" ON public.therapy_sessions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_therapy_sessions_updated_at
  BEFORE UPDATE ON public.therapy_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. THERAPIST LOCATION PINGS
CREATE TABLE public.therapist_location_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid REFERENCES public.therapists(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.therapy_sessions(id) ON DELETE CASCADE,
  lat float NOT NULL,
  lng float NOT NULL,
  pinged_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.therapist_location_pings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapist inserts own pings" ON public.therapist_location_pings
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.therapists t WHERE t.id = therapist_location_pings.therapist_id AND t.user_id = auth.uid()
  ));
CREATE POLICY "Therapist views own pings" ON public.therapist_location_pings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.therapists t WHERE t.id = therapist_location_pings.therapist_id AND t.user_id = auth.uid()
  ));
CREATE POLICY "Patient views pings for active session" ON public.therapist_location_pings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.therapy_sessions s
    WHERE s.id = therapist_location_pings.session_id
      AND s.patient_user_id = auth.uid()
      AND s.status IN ('therapist_assigned','therapist_en_route','therapist_arrived','in_progress')
  ));
CREATE POLICY "Doctor views pings for active session" ON public.therapist_location_pings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.therapy_sessions s
    WHERE s.id = therapist_location_pings.session_id
      AND s.doctor_user_id = auth.uid()
      AND s.status IN ('therapist_assigned','therapist_en_route','therapist_arrived','in_progress')
  ));
CREATE POLICY "Admins view all pings" ON public.therapist_location_pings
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX idx_pings_session ON public.therapist_location_pings(session_id, pinged_at DESC);
CREATE INDEX idx_pings_therapist ON public.therapist_location_pings(therapist_id, pinged_at DESC);

-- 5. VENUE REVENUE LOGS
CREATE TABLE public.venue_revenue_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES public.therapy_venues(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.therapy_sessions(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  type text CHECK (type IN ('room_charge','platform_deduction','net_payout')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.venue_revenue_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venue owner views own revenue" ON public.venue_revenue_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.therapy_venues v WHERE v.id = venue_revenue_logs.venue_id AND v.owner_user_id = auth.uid()
  ));
CREATE POLICY "Admins manage revenue logs" ON public.venue_revenue_logs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 6. THERAPIST SAFETY FLAGS
CREATE TABLE public.therapist_safety_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid REFERENCES public.therapists(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.therapy_sessions(id) ON DELETE SET NULL,
  flagged_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  severity text CHECK (severity IN ('warning','suspension','permanent_ban')),
  resolved boolean DEFAULT false,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.therapist_safety_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users insert flags" ON public.therapist_safety_flags
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = flagged_by);
CREATE POLICY "Admins manage safety flags" ON public.therapist_safety_flags
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX idx_sessions_patient ON public.therapy_sessions(patient_user_id, scheduled_date DESC);
CREATE INDEX idx_sessions_therapist ON public.therapy_sessions(therapist_id, scheduled_date DESC);
CREATE INDEX idx_sessions_doctor ON public.therapy_sessions(doctor_user_id, scheduled_date DESC);
CREATE INDEX idx_sessions_venue ON public.therapy_sessions(venue_id, scheduled_date DESC);
CREATE INDEX idx_therapists_location ON public.therapists(current_location_lat, current_location_lng) WHERE is_available = true;