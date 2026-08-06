-- ============================================================
-- AYUZEE JOB SEEKER PROFILES
-- Naukri/Indeed-style candidate profiles for AYUSH professionals
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Job Seeker Profiles table
CREATE TABLE IF NOT EXISTS public.job_seeker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Personal
  full_name TEXT NOT NULL,
  headline TEXT,  -- e.g., "BAMS Doctor | Panchakarma Specialist | 5 yrs exp"
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT,

  -- Education
  degree TEXT NOT NULL,  -- BAMS, BHMS, BUMS, BNYS, MD(Ayu), MS(Ayu), etc.
  college TEXT,
  university TEXT,
  graduation_year INT,
  additional_qualifications TEXT[],  -- e.g., ["MD Kayachikitsa", "CYI Yoga", "PGDHA"]

  -- Professional
  department TEXT,  -- Primary specialization from ayush_departments
  skills TEXT[],  -- e.g., ["Panchakarma", "Kshar Sutra", "Marma Therapy", "Shirodhara"]
  experience_years INT DEFAULT 0,
  current_designation TEXT,  -- e.g., "Senior Consultant", "Junior Resident"
  current_organization TEXT,
  registration_number TEXT,  -- Medical council registration
  registration_council TEXT,  -- e.g., "Kerala AYUSH Council", "CCIM"

  -- Preferences
  preferred_job_type TEXT DEFAULT 'full_time',  -- full_time, part_time, visiting, contractual, internship
  preferred_states TEXT[],  -- States willing to work in
  preferred_cities TEXT[],
  expected_salary_min INT,  -- Monthly INR
  expected_salary_max INT,
  willing_to_relocate BOOLEAN DEFAULT false,
  notice_period TEXT DEFAULT 'immediate',  -- immediate, 15_days, 30_days, 60_days, 90_days

  -- Documents
  resume_url TEXT,  -- PDF upload path in Supabase storage
  resume_filename TEXT,
  resume_updated_at TIMESTAMPTZ,

  -- Status
  is_actively_looking BOOLEAN DEFAULT true,
  visibility TEXT DEFAULT 'public',  -- public (employers can find), private (only when applied), hidden
  profile_completeness INT DEFAULT 0,  -- 0-100 percentage

  -- Metadata
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_seeker_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own profile
DROP POLICY IF EXISTS "Users can view their own seeker profile" ON public.job_seeker_profiles;
CREATE POLICY "Users can view their own seeker profile"
ON public.job_seeker_profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own seeker profile" ON public.job_seeker_profiles;
CREATE POLICY "Users can create their own seeker profile"
ON public.job_seeker_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own seeker profile" ON public.job_seeker_profiles;
CREATE POLICY "Users can update their own seeker profile"
ON public.job_seeker_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Employers can view public profiles (for candidate search)
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.job_seeker_profiles;
CREATE POLICY "Public profiles are viewable"
ON public.job_seeker_profiles FOR SELECT TO authenticated
USING (visibility = 'public' AND is_actively_looking = true);

-- Admins full access
DROP POLICY IF EXISTS "Admins can manage all seeker profiles" ON public.job_seeker_profiles;
CREATE POLICY "Admins can manage all seeker profiles"
ON public.job_seeker_profiles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_user ON public.job_seeker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_department ON public.job_seeker_profiles(department);
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_active ON public.job_seeker_profiles(is_actively_looking, visibility);
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_experience ON public.job_seeker_profiles(experience_years);
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_skills ON public.job_seeker_profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_states ON public.job_seeker_profiles USING GIN (preferred_states);


-- 2. Enhance job_applications table to support one-click apply
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS seeker_profile_id UUID REFERENCES public.job_seeker_profiles(id);
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS applicant_name TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS applicant_email TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS applicant_phone TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS employer_notes TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS shortlisted_at TIMESTAMPTZ;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- Also update the status check to include more states
-- (safe: only adds if not already matching)
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;
ALTER TABLE public.job_applications ADD CONSTRAINT job_applications_status_check
  CHECK (status IN ('applied','viewed','shortlisted','interview','hired','rejected','withdrawn'));


-- 3. Profile view tracking (who viewed my profile)
CREATE TABLE IF NOT EXISTS public.job_profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_organization TEXT,
  view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(seeker_user_id, viewer_user_id, view_date)
);

ALTER TABLE public.job_profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Seekers can see who viewed their profile" ON public.job_profile_views;
CREATE POLICY "Seekers can see who viewed their profile"
ON public.job_profile_views FOR SELECT TO authenticated
USING (auth.uid() = seeker_user_id);

DROP POLICY IF EXISTS "Viewers can insert profile views" ON public.job_profile_views;
CREATE POLICY "Viewers can insert profile views"
ON public.job_profile_views FOR INSERT TO authenticated
WITH CHECK (auth.uid() = viewer_user_id);

CREATE INDEX IF NOT EXISTS idx_profile_views_seeker ON public.job_profile_views(seeker_user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON public.job_profile_views(viewer_user_id);


-- ============================================================
-- DONE! Run this in Supabase SQL Editor.
-- ============================================================
