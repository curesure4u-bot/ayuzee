-- ═══════════════════════════════════════════════════════════════════════════════
-- Create Storage Bucket for Posture Photos
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create the bucket (public so photos can be viewed by doctors)
INSERT INTO storage.buckets (id, name, public)
VALUES ('posture-photos', 'posture-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload posture photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'posture-photos' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to view photos
CREATE POLICY "Authenticated users can view posture photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posture-photos' AND auth.uid() IS NOT NULL);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own posture photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'posture-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
