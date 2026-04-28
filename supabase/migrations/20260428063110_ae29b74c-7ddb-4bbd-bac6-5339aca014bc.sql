-- Patient files
CREATE TABLE IF NOT EXISTS public.patient_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_user_id UUID,
  vaidya_patient_id UUID,
  file_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_files_doctor
  ON public.patient_files(doctor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_files_patient_user
  ON public.patient_files(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_vaidya
  ON public.patient_files(vaidya_patient_id);

ALTER TABLE public.patient_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor manages own patient files"
  ON public.patient_files
  FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-files', 'patient-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Doctor reads own patient files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'patient-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Doctor uploads own patient files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'patient-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Doctor deletes own patient files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'patient-files' AND auth.uid()::text = (storage.foldername(name))[1]);