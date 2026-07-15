-- 1. TRUST CORPUS TRACKER
CREATE TABLE IF NOT EXISTS public.atmri_trust_corpus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  balance numeric NOT NULL DEFAULT 0,
  total_received numeric DEFAULT 0,
  total_spent numeric DEFAULT 0,
  corpus_amount_allocated numeric DEFAULT 0,
  monthly_case_limit int DEFAULT 3,
  cases_this_month int DEFAULT 0,
  minimum_balance_alert numeric DEFAULT 50000,
  last_updated_by uuid REFERENCES auth.users(id),
  last_updated_at timestamptz DEFAULT now(),
  notes text
);

INSERT INTO public.atmri_trust_corpus (balance, total_received, total_spent)
SELECT 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.atmri_trust_corpus);

-- 2. SPONSORED CASES
CREATE TABLE IF NOT EXISTS public.atmri_sponsored_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_age int,
  patient_gender text CHECK (patient_gender IN ('male','female','other')),
  patient_city text NOT NULL,
  patient_state text NOT NULL,
  patient_phone text,
  patient_photo_url text,
  patient_story text NOT NULL,
  condition_name text NOT NULL,
  condition_category text CHECK (condition_category IN (
    'neurological','orthopaedic','chronic_disease','post_surgery',
    'palliative','paediatric','women_health','other'
  )),
  treatment_plan text NOT NULL,
  treatment_duration_days int,
  is_urgent boolean DEFAULT false,
  assigned_doctor_id uuid REFERENCES public.doctors(id),
  assigned_doctor_user_id uuid REFERENCES auth.users(id),
  doctor_countersigned boolean DEFAULT false,
  doctor_signed_at timestamptz,
  doctor_legal_declaration_accepted boolean DEFAULT false,
  partner_hospital_id uuid,
  partner_venue_id uuid REFERENCES public.therapy_venues(id),
  treatment_location text,
  estimated_cost numeric NOT NULL,
  doctor_fee_waived numeric DEFAULT 0,
  venue_fee_waived numeric DEFAULT 0,
  medicines_cost numeric DEFAULT 0,
  therapy_sessions_cost numeric DEFAULT 0,
  transport_allowance numeric DEFAULT 0,
  corpus_amount_allocated numeric DEFAULT 0,
  corpus_amount_spent numeric DEFAULT 0,
  medicine_order_id uuid REFERENCES public.orders(id),
  medicines_dispatched boolean DEFAULT false,
  medicines_dispatched_at timestamptz,
  total_sessions_planned int DEFAULT 0,
  sessions_completed int DEFAULT 0,
  status text DEFAULT 'submitted' CHECK (status IN (
    'submitted','under_review','doctor_assigned','approved',
    'in_treatment','completed','cancelled'
  )),
  rejection_reason text,
  completion_notes text,
  patient_outcome_photo_url text,
  doctor_completion_note text,
  submitted_by uuid REFERENCES auth.users(id),
  submitted_by_relation text,
  medical_report_urls text[] DEFAULT '{}',
  checkpoint_doctor_signed boolean DEFAULT false,
  checkpoint_documents_verified boolean DEFAULT false,
  checkpoint_video_verified boolean DEFAULT false,
  checkpoint_corpus_allocated boolean DEFAULT false,
  checkpoint_hospital_confirmed boolean DEFAULT false,
  video_call_recording_url text,
  approved_by_1 uuid REFERENCES auth.users(id),
  approved_by_2 uuid REFERENCES auth.users(id),
  approved_at_1 timestamptz,
  approved_at_2 timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. DOCTOR CHARITY PLEDGES
CREATE TABLE IF NOT EXISTS public.doctor_charity_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES public.doctors(id) NOT NULL,
  doctor_user_id uuid REFERENCES auth.users(id),
  pledged_consultations_per_month int DEFAULT 2,
  used_this_month int DEFAULT 0,
  total_consultations_donated int DEFAULT 0,
  total_fee_value_donated numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  pledge_since date DEFAULT CURRENT_DATE,
  pledge_motivation text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(doctor_id)
);

-- 4. PARTNER HOSPITALS
CREATE TABLE IF NOT EXISTS public.atmri_partner_hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_name text NOT NULL,
  hospital_type text CHECK (hospital_type IN (
    'ayurveda','panchakarma','integrative','naturopathy','homeopathy','multi'
  )),
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  contact_name text,
  contact_phone text,
  contact_email text,
  mou_document_url text,
  mou_signed_date date,
  mou_expiry_date date,
  discount_percent numeric DEFAULT 0,
  beds_reserved_for_atmri int DEFAULT 0,
  is_active boolean DEFAULT true,
  venue_id uuid REFERENCES public.therapy_venues(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 5. CASE UPDATES
CREATE TABLE IF NOT EXISTS public.atmri_case_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.atmri_sponsored_cases(id) ON DELETE CASCADE,
  update_type text CHECK (update_type IN (
    'doctor_assigned','treatment_started','session_completed',
    'medicine_dispatched','milestone','completed','thank_you'
  )),
  update_text text NOT NULL,
  photo_urls text[] DEFAULT '{}',
  posted_by uuid REFERENCES auth.users(id),
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 6. DOCTOR SIGNATURE LOG
CREATE TABLE IF NOT EXISTS public.atmri_doctor_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.atmri_sponsored_cases(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.doctors(id),
  doctor_user_id uuid REFERENCES auth.users(id),
  legal_declaration text NOT NULL,
  signed_at timestamptz DEFAULT now(),
  doctor_registration_number text,
  UNIQUE(case_id, doctor_id)
);

-- RLS
ALTER TABLE public.atmri_trust_corpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atmri_sponsored_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_charity_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atmri_partner_hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atmri_case_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atmri_doctor_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_corpus" ON public.atmri_trust_corpus FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "public_read_cases" ON public.atmri_sponsored_cases FOR SELECT
  USING (status IN ('approved','in_treatment','completed'));
CREATE POLICY "submitter_own" ON public.atmri_sponsored_cases FOR SELECT
  USING (auth.uid() = submitted_by);
CREATE POLICY "admin_all_cases" ON public.atmri_sponsored_cases FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "doctor_own_pledge" ON public.doctor_charity_pledges FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "admin_pledges" ON public.doctor_charity_pledges FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "public_hospitals" ON public.atmri_partner_hospitals FOR SELECT
  USING (is_active = true);
CREATE POLICY "admin_hospitals" ON public.atmri_partner_hospitals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "public_updates" ON public.atmri_case_updates FOR SELECT
  USING (is_public = true);
CREATE POLICY "admin_updates" ON public.atmri_case_updates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "doctor_own_sig" ON public.atmri_doctor_signatures FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "admin_sigs" ON public.atmri_doctor_signatures FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER atmri_cases_updated_at BEFORE UPDATE ON public.atmri_sponsored_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER atmri_pledges_updated_at BEFORE UPDATE ON public.doctor_charity_pledges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Corpus allocation trigger
CREATE OR REPLACE FUNCTION public.allocate_corpus_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    UPDATE public.atmri_trust_corpus
    SET corpus_amount_allocated = COALESCE(corpus_amount_allocated, 0) + COALESCE(NEW.corpus_amount_allocated, 0),
        cases_this_month = cases_this_month + 1,
        last_updated_at = now()
    WHERE id = (SELECT id FROM public.atmri_trust_corpus LIMIT 1);
  END IF;

  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    UPDATE public.atmri_trust_corpus
    SET total_spent = total_spent + COALESCE(NEW.corpus_amount_spent, 0),
        balance = balance - COALESCE(NEW.corpus_amount_spent, 0),
        last_updated_at = now()
    WHERE id = (SELECT id FROM public.atmri_trust_corpus LIMIT 1);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER corpus_allocation_trigger
  AFTER UPDATE ON public.atmri_sponsored_cases
  FOR EACH ROW EXECUTE FUNCTION public.allocate_corpus_on_approval();

-- Seed sample cases
INSERT INTO public.atmri_sponsored_cases (
  patient_name, patient_age, patient_gender, patient_city, patient_state,
  patient_story, condition_name, condition_category, treatment_plan,
  treatment_duration_days, is_urgent, estimated_cost, doctor_fee_waived,
  medicines_cost, therapy_sessions_cost, corpus_amount_allocated, status
) VALUES
('Murugan S.', 52, 'male', 'Tirunelveli', 'Tamil Nadu',
 'Murugan, a daily-wage farmer, suffered a stroke 8 months ago leaving him with right-side hemiplegia. His family of 5 depends on his wife''s ₹4,000/month income. ATMRI Trust is sponsoring his 28-day Panchakarma treatment entirely.',
 'Hemiplegia (Post-Stroke)', 'neurological',
 '28-day Pizhichil + Navarakizhi + Basti chikitsa + 3-month medicine course',
 28, true, 85000, 15000, 18000, 42000, 85000, 'in_treatment'),
('Priya M.', 8, 'female', 'Coimbatore', 'Tamil Nadu',
 'Priya has mild spastic diplegia (cerebral palsy). Age 5-10 is the crucial window. ATMRI Trust is funding her 21-day residential treatment. Her parents are daily-wage labourers.',
 'Cerebral Palsy (Spastic Diplegia)', 'paediatric',
 '21-day residential Panchakarma + 6-month Ayurvedic medicine course',
 21, true, 95000, 12000, 22000, 48000, 95000, 'approved'),
('Savitha D.', 42, 'female', 'Madurai', 'Tamil Nadu',
 'Savitha, a domestic worker, has severe rheumatoid arthritis. She cannot afford the sustained Ayurvedic treatment she needs. ATMRI Trust is covering her 45-day treatment plan.',
 'Rheumatoid Arthritis', 'orthopaedic',
 '45-day Kati Basti + Greeva Basti + Ashtavargam Kashayam + Rasayana medicines',
 45, false, 62000, 10000, 15000, 28000, 62000, 'approved'),
('Rajan K.', 67, 'male', 'Chennai', 'Tamil Nadu',
 'Rajan, retired, has Parkinson''s disease. His pension barely covers rent. ATMRI Trust sponsors monthly Shirodhara + Basti sessions and medicines for 6 months.',
 'Parkinson''s Disease', 'neurological',
 'Monthly Shirodhara (4 sessions) + Basti chikitsa + Mucuna + Brahmi for 6 months',
 180, false, 72000, 18000, 20000, 24000, 72000, 'in_treatment'),
('Karthik B.', 16, 'male', 'Salem', 'Tamil Nadu',
 'Karthik, a class 10 student, suffered a spine injury in a school accident. His family cannot afford surgery or sustained treatment. ATMRI Trust is funding non-surgical Ayurvedic rehabilitation.',
 'Spine Injury (L3-L4)', 'orthopaedic',
 '30-day Kati Basti + Matra Basti + Mahanarayana Taila Abhyanga + physiotherapy integration',
 30, true, 55000, 8000, 12000, 28000, 55000, 'submitted');