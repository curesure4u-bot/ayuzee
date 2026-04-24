CREATE TABLE public.job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by UUID,
  organization_name TEXT NOT NULL,
  organization_type TEXT CHECK (organization_type IN ('hospital','clinic','resort','pharma','college','research')),
  job_title TEXT NOT NULL,
  specialization TEXT,
  location_city TEXT,
  location_state TEXT,
  job_type TEXT CHECK (job_type IN ('full_time','part_time','contractual','visiting','internship')),
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

CREATE INDEX idx_job_listings_public ON public.job_listings (is_active, is_approved, expires_at, created_at DESC);
CREATE INDEX idx_job_listings_posted_by ON public.job_listings (posted_by);

CREATE POLICY "Public can view approved active jobs"
ON public.job_listings
FOR SELECT
USING (is_active = true AND is_approved = true AND (expires_at IS NULL OR expires_at > CURRENT_DATE));

CREATE POLICY "Users can create own job posts"
ON public.job_listings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = posted_by AND is_approved = false);

CREATE POLICY "Users can view own job posts"
ON public.job_listings
FOR SELECT
TO authenticated
USING (auth.uid() = posted_by);

CREATE POLICY "Users can update own unapproved job posts"
ON public.job_listings
FOR UPDATE
TO authenticated
USING (auth.uid() = posted_by AND is_approved = false)
WITH CHECK (auth.uid() = posted_by AND is_approved = false);

CREATE POLICY "Admins manage all job posts"
ON public.job_listings
FOR ALL
TO authenticated
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));