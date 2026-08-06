-- ============================================================
-- AYUZEE JOBS MODULE ENHANCEMENT
-- Adds verification, AI matching, job alerts, saved searches,
-- employer verification, aggregation source tracking, and
-- government job support.
-- ============================================================

-- ============================================================
-- 1. ENHANCE job_listings TABLE (add new columns)
-- ============================================================

-- Source tracking: where the job came from
ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'direct'
    CHECK (source IN ('direct','aggregated','linkedin','ncs','ayush_ministry','state_portal','practo','indiamart'));

ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Employer verification
ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS is_verified_employer BOOLEAN DEFAULT false;

ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS verification_level INT DEFAULT 0
    CHECK (verification_level BETWEEN 0 AND 4);
-- Level 0: Unverified
-- Level 1: Email + Phone verified
-- Level 2: AYUSH registration number verified
-- Level 3: Document uploaded + Admin reviewed
-- Level 4: Trusted Partner (auto-approve)

-- Poster type: who posted this job
ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS poster_type TEXT DEFAULT 'hospital'
    CHECK (poster_type IN ('hospital','clinic','college','pharma','agency','doctor','government','wellness_resort','research_institute'));

-- Department / AYUSH specialization (normalized)
ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS department TEXT;
-- e.g., Kayachikitsa, Shalya Tantra, Panchakarma, Dravyaguna, etc.

-- AI match tags for smart recommendations
ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS ai_match_tags TEXT[] DEFAULT '{}';

-- Government job specific fields
ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS is_government BOOLEAN DEFAULT false;

ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS government_body TEXT;
-- e.g., UPSC, State PSC, CGHS, ECHS, AYUSH Ministry, Municipal Corp

ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS application_deadline DATE;

ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS vacancies INT;

-- Direct hire vs agency flag
ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS is_direct_employer BOOLEAN DEFAULT true;

ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS agency_name TEXT;

-- New indexes for the enhanced columns
CREATE INDEX IF NOT EXISTS idx_job_listings_source ON public.job_listings (source);
CREATE INDEX IF NOT EXISTS idx_job_listings_poster_type ON public.job_listings (poster_type);
CREATE INDEX IF NOT EXISTS idx_job_listings_department ON public.job_listings (department);
CREATE INDEX IF NOT EXISTS idx_job_listings_is_government ON public.job_listings (is_government);
CREATE INDEX IF NOT EXISTS idx_job_listings_verification ON public.job_listings (is_verified_employer, verification_level);
CREATE INDEX IF NOT EXISTS idx_job_listings_ai_tags ON public.job_listings USING GIN (ai_match_tags);


-- ============================================================
-- 2. JOB ALERTS TABLE
-- Users can subscribe to alerts based on filters
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  -- Filter criteria stored as JSONB
  -- Example: {"specialization": "Panchakarma", "state": "Kerala", "job_type": "full_time", "keywords": ["senior", "consultant"]}
  filters JSONB NOT NULL DEFAULT '{}',
  frequency TEXT NOT NULL DEFAULT 'daily'
    CHECK (frequency IN ('instant','daily','weekly')),
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  matched_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own job alerts"
ON public.job_alerts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own job alerts"
ON public.job_alerts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job alerts"
ON public.job_alerts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job alerts"
ON public.job_alerts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all job alerts"
ON public.job_alerts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON public.job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_active ON public.job_alerts(is_active, frequency);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_job_alerts_updated_at ON public.job_alerts;
CREATE TRIGGER update_job_alerts_updated_at
BEFORE UPDATE ON public.job_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- 3. JOB SAVED SEARCHES TABLE
-- Quick access to repeated search filters
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  -- Example: {"job_type":"full_time","specialization":"Kayachikitsa","state":"Maharashtra","keyword":"consultant"}
  result_count INT DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved searches"
ON public.job_saved_searches
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved searches"
ON public.job_saved_searches
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches"
ON public.job_saved_searches
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches"
ON public.job_saved_searches
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_job_saved_searches_user_id ON public.job_saved_searches(user_id);


-- ============================================================
-- 4. EMPLOYER VERIFICATION TABLE
-- Tracks verification documents and status for job posters
-- ============================================================

CREATE TABLE IF NOT EXISTS public.employer_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL
    CHECK (organization_type IN ('hospital','clinic','college','pharma','agency','wellness_resort','research_institute','government')),
  -- Registration details
  registration_number TEXT,  -- AYUSH registration / Clinical Establishment Act number
  registration_authority TEXT,  -- e.g., "NCISM", "State Medical Board", "UGC"
  -- Document uploads (Supabase storage paths)
  registration_certificate_url TEXT,
  trade_license_url TEXT,
  additional_document_url TEXT,
  -- Verification status
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','under_review','verified','rejected','expired')),
  verification_level INT DEFAULT 0 CHECK (verification_level BETWEEN 0 AND 4),
  verified_by UUID,  -- admin who verified
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  -- Contact
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  website_url TEXT,
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employer_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification"
ON public.employer_verifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification request"
ON public.employer_verifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending verification"
ON public.employer_verifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND verification_status = 'pending')
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all verifications"
ON public.employer_verifications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_employer_verifications_user_id ON public.employer_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_verifications_status ON public.employer_verifications(verification_status);


-- ============================================================
-- 5. AGGREGATED JOBS LOG TABLE
-- Tracks externally sourced jobs and their sync status
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_aggregation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('ncs','ayush_ministry','state_portal','linkedin','practo','indiamart')),
  external_id TEXT,  -- ID from the source portal
  external_url TEXT NOT NULL,
  job_listing_id UUID REFERENCES public.job_listings(id) ON DELETE SET NULL,
  sync_status TEXT NOT NULL DEFAULT 'new'
    CHECK (sync_status IN ('new','imported','skipped','expired','error')),
  raw_data JSONB,  -- original scraped/API data
  error_message TEXT,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source, external_id)
);

ALTER TABLE public.job_aggregation_log ENABLE ROW LEVEL SECURITY;

-- Only admins can see aggregation logs
CREATE POLICY "Admins can manage aggregation logs"
ON public.job_aggregation_log
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_job_aggregation_source ON public.job_aggregation_log(source, sync_status);
CREATE INDEX IF NOT EXISTS idx_job_aggregation_external ON public.job_aggregation_log(source, external_id);


-- ============================================================
-- 6. AI JOB RECOMMENDATIONS TABLE
-- Stores pre-computed AI recommendations per user
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_listing_id UUID NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  match_score NUMERIC(5,2) NOT NULL DEFAULT 0,  -- 0-100 relevance score
  match_reasons TEXT[],  -- e.g., ["specialization_match", "location_match", "experience_fit"]
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_listing_id)
);

ALTER TABLE public.job_ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations"
ON public.job_ai_recommendations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations (dismiss)"
ON public.job_ai_recommendations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert recommendations"
ON public.job_ai_recommendations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage all recommendations"
ON public.job_ai_recommendations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_job_ai_recs_user ON public.job_ai_recommendations(user_id, is_dismissed, match_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_ai_recs_job ON public.job_ai_recommendations(job_listing_id);


-- ============================================================
-- 7. HELPER: AYUSH DEPARTMENTS/SPECIALIZATIONS REFERENCE
-- Standardized list of AYUSH departments for dropdowns
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ayush_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  system TEXT NOT NULL CHECK (system IN ('ayurveda','homeopathy','unani','siddha','naturopathy','yoga')),
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Seed standard AYUSH departments
INSERT INTO public.ayush_departments (name, system, sort_order) VALUES
  ('Kayachikitsa (General Medicine)', 'ayurveda', 1),
  ('Shalya Tantra (Surgery)', 'ayurveda', 2),
  ('Shalakya Tantra (ENT & Ophthalmology)', 'ayurveda', 3),
  ('Prasuti & Stree Roga (OBG)', 'ayurveda', 4),
  ('Kaumarbhritya (Pediatrics)', 'ayurveda', 5),
  ('Panchakarma', 'ayurveda', 6),
  ('Dravyaguna (Pharmacology)', 'ayurveda', 7),
  ('Rasashastra & Bhaishajya Kalpana (Pharmaceutics)', 'ayurveda', 8),
  ('Swasthavritta (Preventive Medicine)', 'ayurveda', 9),
  ('Roga Nidana (Pathology)', 'ayurveda', 10),
  ('Rachana Sharira (Anatomy)', 'ayurveda', 11),
  ('Kriya Sharira (Physiology)', 'ayurveda', 12),
  ('Agad Tantra (Forensic Medicine & Toxicology)', 'ayurveda', 13),
  ('Samhita & Siddhanta', 'ayurveda', 14),
  ('Organon of Medicine', 'homeopathy', 15),
  ('Repertory', 'homeopathy', 16),
  ('Materia Medica', 'homeopathy', 17),
  ('Homeopathic Pharmacy', 'homeopathy', 18),
  ('Practice of Medicine (Homeopathy)', 'homeopathy', 19),
  ('Ilaj Bil Tadbeer (Regimental Therapy)', 'unani', 20),
  ('Ilaj Bil Dawa (Pharmacotherapy)', 'unani', 21),
  ('Ilaj Bil Ghiza (Dietotherapy)', 'unani', 22),
  ('Moalajat (General Medicine - Unani)', 'unani', 23),
  ('Jarahat (Surgery - Unani)', 'unani', 24),
  ('Marundhu Sei Muraigal (Siddha Pharmacy)', 'siddha', 25),
  ('Noi Naadal (Siddha Pathology)', 'siddha', 26),
  ('Sirappu Maruthuvam (Siddha Special Medicine)', 'siddha', 27),
  ('Naturopathy & Drugless Therapy', 'naturopathy', 28),
  ('Yoga Therapy', 'yoga', 29),
  ('Yoga & Rehabilitation', 'yoga', 30)
ON CONFLICT (name) DO NOTHING;

-- Public read access for departments reference
ALTER TABLE public.ayush_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read departments"
ON public.ayush_departments
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage departments"
ON public.ayush_departments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ============================================================
-- DONE! Run this script against your Supabase instance.
-- ============================================================
