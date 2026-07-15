CREATE POLICY "Guests can upload prescription files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'prescriptions' AND auth.uid() IS NULL AND (storage.foldername(name))[1] = 'guest');