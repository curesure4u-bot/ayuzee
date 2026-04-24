ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'student';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'venue_owner';

CREATE TABLE IF NOT EXISTS public.student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  college_name text,
  course text CHECK (course IN ('BAMS','BHMS','BUMS','BNYS','BSMS','MD Ayurveda','Other')),
  year_of_study int CHECK (year_of_study BETWEEN 1 AND 6),
  state text,
  city text,
  student_id_url text,
  is_verified boolean DEFAULT false,
  interests text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student own" ON public.student_profiles;
DROP POLICY IF EXISTS "admin all" ON public.student_profiles;

CREATE POLICY "student own"
ON public.student_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin all"
ON public.student_profiles
FOR ALL
TO authenticated
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));

DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER update_student_profiles_updated_at
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('student-docs', 'student-docs', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Students can upload own student docs" ON storage.objects;
DROP POLICY IF EXISTS "Students can view own student docs" ON storage.objects;
DROP POLICY IF EXISTS "Students can update own student docs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view student docs" ON storage.objects;

CREATE POLICY "Students can upload own student docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can view own student docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'student-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can update own student docs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'student-docs' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'student-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view student docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'student-docs' AND public.is_admin_or_super(auth.uid()));