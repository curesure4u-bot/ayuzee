
CREATE POLICY "Doctors and admins can read consent signatures"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'panchakarma-consents'
    AND (
      EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid())
      OR public.is_admin_or_super(auth.uid())
    )
  );

CREATE POLICY "Doctors and admins can upload consent signatures"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'panchakarma-consents'
    AND (
      EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid())
      OR public.is_admin_or_super(auth.uid())
    )
  );

CREATE POLICY "Admins can delete consent signatures"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'panchakarma-consents'
    AND public.is_admin_or_super(auth.uid())
  );
