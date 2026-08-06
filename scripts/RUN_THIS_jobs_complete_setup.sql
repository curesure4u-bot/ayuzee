-- ============================================================
-- AYUZEE JOBS MODULE — COMPLETE SETUP
-- Run this SINGLE script in Supabase SQL Editor.
-- It creates the base tables (if not existing) then applies
-- all enhancements safely.
-- ============================================================


-- ============================================================
-- PART 0: PREREQUISITES — Functions needed by RLS policies
-- (Safe to re-run — uses CREATE OR REPLACE)
-- ============================================================

-- Ensure app_role enum exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM (
    'admin', 'doctor', 'patient', 'therapist', 'provider',
    'super_admin', 'student', 'venue_owner', 'product_admin',
    'blog_admin', 'content_admin', 'orders_admin', 'accounts_admin',
    'doctor_admin', 'ayush_admin', 'support_admin', 'manufacturer'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ensure user_roles table exists
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- has_role function (used throughout the app)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- is_admin_or_super function
CREATE OR REPLACE FUNCTION public.is_admin_or_super(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::public.app_role, 'super_admin'::public.app_role)
  )
$$;

-- update_updated_at_column trigger function (used for auto-updating timestamps)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ============================================================
-- PART A: BASE TABLES (safe to re-run — uses IF NOT EXISTS)
-- ============================================================

-- 1. job_listings base table
CREATE TABLE IF NOT EXISTS public.job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by UUID,
  organization_name TEXT NOT NULL,
  organization_type TEXT,
  job_title TEXT NOT NULL,
  specialization TEXT,
  location_city TEXT,
  location_state TEXT,
  job_type TEXT,
  experience_years_min INT DEFAULT 0,
  salary_min NUMERIC,
  salary_max NUMERIC,
  description TEXT,
  requirements TEXT,
  apply_email TEXT,
  apply_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  expires_at DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_job_listings_public ON public.job_listings (is_active, is_approved, expires_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_listings_posted_by ON public.job_listings (posted_by);

-- RLS policies (safe: drops then recreates)
DROP POLICY IF EXISTS "Public can view approved active jobs" ON public.job_listings;
CREATE POLICY "Public can view approved active jobs"
ON public.job_listings
FOR SELECT
USING (is_active = true AND is_approved = true AND (expires_at IS NULL OR expires_at > CURRENT_DATE));

DROP POLICY IF EXISTS "Users can create own job posts" ON public.job_listings;
CREATE POLICY "Users can create own job posts"
ON public.job_listings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = posted_by AND is_approved = false);

DROP POLICY IF EXISTS "Users can view own job posts" ON public.job_listings;
CREATE POLICY "Users can view own job posts"
ON public.job_listings
FOR SELECT
TO authenticated
USING (auth.uid() = posted_by);

DROP POLICY IF EXISTS "Users can update own unapproved job posts" ON public.job_listings;
CREATE POLICY "Users can update own unapproved job posts"
ON public.job_listings
FOR UPDATE
TO authenticated
USING (auth.uid() = posted_by AND is_approved = false)
WITH CHECK (auth.uid() = posted_by AND is_approved = false);

DROP POLICY IF EXISTS "Admins manage all job posts" ON public.job_listings;
CREATE POLICY "Admins manage all job posts"
ON public.job_listings
FOR ALL
TO authenticated
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));


-- 2. job_applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_listing_id UUID NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied','shortlisted','rejected','hired')),
  cover_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_listing_id)
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own job applications" ON public.job_applications;
CREATE POLICY "Students can view their own job applications"
ON public.job_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can create their own job applications" ON public.job_applications;
CREATE POLICY "Students can create their own job applications"
ON public.job_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students can update their own job applications" ON public.job_applications;
CREATE POLICY "Students can update their own job applications"
ON public.job_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all job applications" ON public.job_applications;
CREATE POLICY "Admins can manage all job applications"
ON public.job_applications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_listing_id ON public.job_applications(job_listing_id);


-- ============================================================
-- PART B: ENHANCED COLUMNS ON job_listings
-- ============================================================

-- Source tracking
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'direct';
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Employer verification
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS is_verified_employer BOOLEAN DEFAULT false;
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS verification_level INT DEFAULT 0;

-- Poster type
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS poster_type TEXT DEFAULT 'hospital';

-- Department (AYUSH specialization)
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS department TEXT;

-- AI match tags
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS ai_match_tags TEXT[] DEFAULT '{}';

-- Government job fields
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS is_government BOOLEAN DEFAULT false;
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS government_body TEXT;
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS application_deadline DATE;
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS vacancies INT;

-- Direct hire vs agency
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS is_direct_employer BOOLEAN DEFAULT true;
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS agency_name TEXT;

-- New indexes
CREATE INDEX IF NOT EXISTS idx_job_listings_source ON public.job_listings (source);
CREATE INDEX IF NOT EXISTS idx_job_listings_poster_type ON public.job_listings (poster_type);
CREATE INDEX IF NOT EXISTS idx_job_listings_department ON public.job_listings (department);
CREATE INDEX IF NOT EXISTS idx_job_listings_is_government ON public.job_listings (is_government);
CREATE INDEX IF NOT EXISTS idx_job_listings_verification ON public.job_listings (is_verified_employer, verification_level);
CREATE INDEX IF NOT EXISTS idx_job_listings_ai_tags ON public.job_listings USING GIN (ai_match_tags);


-- ============================================================
-- PART C: JOB ALERTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  frequency TEXT NOT NULL DEFAULT 'daily',
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  matched_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own job alerts" ON public.job_alerts;
CREATE POLICY "Users can view their own job alerts"
ON public.job_alerts FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own job alerts" ON public.job_alerts;
CREATE POLICY "Users can create their own job alerts"
ON public.job_alerts FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own job alerts" ON public.job_alerts;
CREATE POLICY "Users can update their own job alerts"
ON public.job_alerts FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own job alerts" ON public.job_alerts;
CREATE POLICY "Users can delete their own job alerts"
ON public.job_alerts FOR DELETE TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all job alerts" ON public.job_alerts;
CREATE POLICY "Admins can manage all job alerts"
ON public.job_alerts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON public.job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_active ON public.job_alerts(is_active, frequency);


-- ============================================================
-- PART D: JOB SAVED SEARCHES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  result_count INT DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_saved_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved searches" ON public.job_saved_searches;
CREATE POLICY "Users can view their own saved searches"
ON public.job_saved_searches FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own saved searches" ON public.job_saved_searches;
CREATE POLICY "Users can create their own saved searches"
ON public.job_saved_searches FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own saved searches" ON public.job_saved_searches;
CREATE POLICY "Users can update their own saved searches"
ON public.job_saved_searches FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved searches" ON public.job_saved_searches;
CREATE POLICY "Users can delete their own saved searches"
ON public.job_saved_searches FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_job_saved_searches_user_id ON public.job_saved_searches(user_id);


-- ============================================================
-- PART E: EMPLOYER VERIFICATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.employer_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  registration_number TEXT,
  registration_authority TEXT,
  registration_certificate_url TEXT,
  trade_license_url TEXT,
  additional_document_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_level INT DEFAULT 0,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.employer_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own verification" ON public.employer_verifications;
CREATE POLICY "Users can view their own verification"
ON public.employer_verifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own verification request" ON public.employer_verifications;
CREATE POLICY "Users can create their own verification request"
ON public.employer_verifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their pending verification" ON public.employer_verifications;
CREATE POLICY "Users can update their pending verification"
ON public.employer_verifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND verification_status = 'pending')
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all verifications" ON public.employer_verifications;
CREATE POLICY "Admins can manage all verifications"
ON public.employer_verifications FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_employer_verifications_user_id ON public.employer_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_verifications_status ON public.employer_verifications(verification_status);


-- ============================================================
-- PART F: AGGREGATION LOG TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_aggregation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  external_id TEXT,
  external_url TEXT NOT NULL,
  job_listing_id UUID REFERENCES public.job_listings(id) ON DELETE SET NULL,
  sync_status TEXT NOT NULL DEFAULT 'new',
  raw_data JSONB,
  error_message TEXT,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source, external_id)
);

ALTER TABLE public.job_aggregation_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage aggregation logs" ON public.job_aggregation_log;
CREATE POLICY "Admins can manage aggregation logs"
ON public.job_aggregation_log FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_job_aggregation_source ON public.job_aggregation_log(source, sync_status);
CREATE INDEX IF NOT EXISTS idx_job_aggregation_external ON public.job_aggregation_log(source, external_id);


-- ============================================================
-- PART G: AI JOB RECOMMENDATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.job_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_listing_id UUID NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  match_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  match_reasons TEXT[],
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_listing_id)
);

ALTER TABLE public.job_ai_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own recommendations" ON public.job_ai_recommendations;
CREATE POLICY "Users can view their own recommendations"
ON public.job_ai_recommendations FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own recommendations" ON public.job_ai_recommendations;
CREATE POLICY "Users can update their own recommendations"
ON public.job_ai_recommendations FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert recommendations" ON public.job_ai_recommendations;
CREATE POLICY "System can insert recommendations"
ON public.job_ai_recommendations FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage all recommendations" ON public.job_ai_recommendations;
CREATE POLICY "Admins can manage all recommendations"
ON public.job_ai_recommendations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_job_ai_recs_user ON public.job_ai_recommendations(user_id, is_dismissed, match_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_ai_recs_job ON public.job_ai_recommendations(job_listing_id);


-- ============================================================
-- PART H: AYUSH DEPARTMENTS REFERENCE TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ayush_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  system TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE public.ayush_departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read departments" ON public.ayush_departments;
CREATE POLICY "Anyone can read departments"
ON public.ayush_departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage departments" ON public.ayush_departments;
CREATE POLICY "Admins can manage departments"
ON public.ayush_departments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed departments
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


-- ============================================================
-- DONE! All tables created and enhanced successfully.
-- ============================================================
