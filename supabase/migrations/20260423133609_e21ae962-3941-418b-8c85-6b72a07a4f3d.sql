-- 1. Therapy venues: geo + availability metadata
ALTER TABLE public.therapy_venues
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS available_therapies text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hourly_rate integer NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2. Therapy sessions: assignment + financials
ALTER TABLE public.therapy_sessions
  ADD COLUMN IF NOT EXISTS venue_id uuid,
  ADD COLUMN IF NOT EXISTS venue_room text,
  ADD COLUMN IF NOT EXISTS scheduled_date date,
  ADD COLUMN IF NOT EXISTS scheduled_start time,
  ADD COLUMN IF NOT EXISTS scheduled_end time,
  ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS total_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS therapist_earnings integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS venue_earnings integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS doctor_referral_fee integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS razorpay_order_id text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
  ADD COLUMN IF NOT EXISTS prescribed_medicines jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Make sure session status has a sane default
DO $$
BEGIN
  ALTER TABLE public.therapy_sessions ALTER COLUMN status SET DEFAULT 'scheduled';
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_therapy_sessions_patient ON public.therapy_sessions(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_therapist_date ON public.therapy_sessions(therapist_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_therapy_venues_therapies ON public.therapy_venues USING GIN(available_therapies);

-- 3. Therapist availability (working hours per weekday)
CREATE TABLE IF NOT EXISTS public.therapist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL DEFAULT '08:00',
  end_time time NOT NULL DEFAULT '18:00',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(therapist_id, weekday)
);

ALTER TABLE public.therapist_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads availability" ON public.therapist_availability;
CREATE POLICY "Public reads availability"
  ON public.therapist_availability FOR SELECT USING (true);

DROP POLICY IF EXISTS "Therapist manages own availability" ON public.therapist_availability;
CREATE POLICY "Therapist manages own availability"
  ON public.therapist_availability FOR ALL
  USING (EXISTS (SELECT 1 FROM public.therapists t WHERE t.id = therapist_availability.therapist_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.therapists t WHERE t.id = therapist_availability.therapist_id AND t.user_id = auth.uid()));

-- 4. RLS: patients can read verified therapists & venues, and update their own assigned session
DROP POLICY IF EXISTS "Public reads verified therapists" ON public.therapists;
CREATE POLICY "Public reads verified therapists"
  ON public.therapists FOR SELECT USING (is_verified = true);

DROP POLICY IF EXISTS "Public reads verified venues" ON public.therapy_venues;
CREATE POLICY "Public reads verified venues"
  ON public.therapy_venues FOR SELECT USING (is_verified = true);

DROP POLICY IF EXISTS "Patient updates own session booking" ON public.therapy_sessions;
CREATE POLICY "Patient updates own session booking"
  ON public.therapy_sessions FOR UPDATE
  USING (auth.uid() = patient_user_id)
  WITH CHECK (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "Patient reads own sessions" ON public.therapy_sessions;
CREATE POLICY "Patient reads own sessions"
  ON public.therapy_sessions FOR SELECT
  USING (auth.uid() = patient_user_id);