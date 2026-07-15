
CREATE POLICY "Patients read own clinical reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'clinical-reports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Patients upload own clinical reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'clinical-reports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Patients update own clinical reports"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'clinical-reports'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Doctors read clinical reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'clinical-reports'
  AND (
    public.is_admin_or_super(auth.uid())
    OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid())
  )
);
