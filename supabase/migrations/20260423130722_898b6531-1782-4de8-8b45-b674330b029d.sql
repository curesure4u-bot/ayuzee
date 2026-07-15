-- Create private bucket for therapist verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('therapist-docs', 'therapist-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Therapists can upload to a folder named with their own user id
CREATE POLICY "Therapists upload own docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'therapist-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Therapists read own docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'therapist-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Therapists update own docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'therapist-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Therapists delete own docs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'therapist-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can read all therapist docs for verification
CREATE POLICY "Admins read all therapist docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'therapist-docs'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);