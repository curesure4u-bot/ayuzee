-- Add verification fields to doctors table
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create private storage bucket for doctor documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'doctor-documents',
  'doctor-documents',
  false,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','application/pdf'];

-- Storage RLS: doctors manage their own folder (folder name = doctor.id)
CREATE POLICY "Doctors upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'doctor-documents'
  AND EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.user_id = auth.uid()
      AND d.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Doctors view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'doctor-documents'
  AND EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.user_id = auth.uid()
      AND d.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Doctors update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'doctor-documents'
  AND EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.user_id = auth.uid()
      AND d.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Doctors delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'doctor-documents'
  AND EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.user_id = auth.uid()
      AND d.id::text = (storage.foldername(name))[1]
  )
);

-- Admins can view and manage all documents for verification
CREATE POLICY "Admins view all doctor documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'doctor-documents'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins manage all doctor documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'doctor-documents'
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'doctor-documents'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);