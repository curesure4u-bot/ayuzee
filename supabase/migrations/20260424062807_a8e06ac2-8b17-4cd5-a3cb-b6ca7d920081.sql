ALTER TABLE public.job_applications
ADD COLUMN IF NOT EXISTS job_id uuid REFERENCES public.job_listings(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS applicant_name text,
ADD COLUMN IF NOT EXISTS applicant_email text,
ADD COLUMN IF NOT EXISTS applicant_phone text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'job_applications' AND column_name = 'job_listing_id'
  ) THEN
    UPDATE public.job_applications
    SET job_id = job_listing_id
    WHERE job_id IS NULL;
  END IF;
END $$;

ALTER TABLE public.job_applications
DROP CONSTRAINT IF EXISTS job_applications_status_check;

ALTER TABLE public.job_applications
ADD CONSTRAINT job_applications_status_check CHECK (status IN ('applied','viewed','shortlisted','rejected'));

CREATE UNIQUE INDEX IF NOT EXISTS job_applications_user_job_unique
ON public.job_applications(user_id, job_id)
WHERE job_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);

ALTER TABLE public.health_blogs
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'article';

ALTER TABLE public.health_blogs
DROP CONSTRAINT IF EXISTS health_blogs_type_check;

ALTER TABLE public.health_blogs
ADD CONSTRAINT health_blogs_type_check CHECK (type IN ('article','research','case_study','video'));

CREATE TABLE IF NOT EXISTS public.student_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  blog_id uuid NOT NULL REFERENCES public.health_blogs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, blog_id)
);

ALTER TABLE public.student_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their bookmarks"
ON public.student_bookmarks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Students can create their bookmarks"
ON public.student_bookmarks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete their bookmarks"
ON public.student_bookmarks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_student_bookmarks_user_id ON public.student_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_student_bookmarks_blog_id ON public.student_bookmarks(blog_id);