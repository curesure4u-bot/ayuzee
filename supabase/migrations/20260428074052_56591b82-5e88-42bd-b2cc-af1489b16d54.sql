
-- Posture assessments header
CREATE TABLE public.vaidya_posture_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_id UUID,
  patient_name TEXT NOT NULL,
  patient_age INT,
  patient_gender TEXT,
  patient_phone TEXT,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  head_score INT,
  shoulder_score INT,
  spine_score INT,
  pelvic_score INT,
  knee_score INT,
  overall_index INT,
  risk_level TEXT,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  corrective_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  yoga_recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  ergonomic_advice TEXT,
  doctor_notes TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  follow_up_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  doctor_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posture_assess_doctor ON public.vaidya_posture_assessments(doctor_user_id);
CREATE INDEX idx_posture_assess_patient ON public.vaidya_posture_assessments(patient_id);

ALTER TABLE public.vaidya_posture_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctor view own posture" ON public.vaidya_posture_assessments
  FOR SELECT USING (auth.uid() = doctor_user_id);
CREATE POLICY "doctor insert own posture" ON public.vaidya_posture_assessments
  FOR INSERT WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "doctor update own posture" ON public.vaidya_posture_assessments
  FOR UPDATE USING (auth.uid() = doctor_user_id);
CREATE POLICY "doctor delete own posture" ON public.vaidya_posture_assessments
  FOR DELETE USING (auth.uid() = doctor_user_id);

CREATE TRIGGER trg_posture_assess_updated
  BEFORE UPDATE ON public.vaidya_posture_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Posture images
CREATE TABLE public.vaidya_posture_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.vaidya_posture_assessments(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  view_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  landmarks JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posture_img_assess ON public.vaidya_posture_images(assessment_id);

ALTER TABLE public.vaidya_posture_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctor view own posture imgs" ON public.vaidya_posture_images
  FOR SELECT USING (auth.uid() = doctor_user_id);
CREATE POLICY "doctor insert own posture imgs" ON public.vaidya_posture_images
  FOR INSERT WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "doctor update own posture imgs" ON public.vaidya_posture_images
  FOR UPDATE USING (auth.uid() = doctor_user_id);
CREATE POLICY "doctor delete own posture imgs" ON public.vaidya_posture_images
  FOR DELETE USING (auth.uid() = doctor_user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('posture-images', 'posture-images', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "users view own posture files" ON storage.objects
  FOR SELECT USING (bucket_id = 'posture-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users upload own posture files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'posture-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users update own posture files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'posture-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users delete own posture files" ON storage.objects
  FOR DELETE USING (bucket_id = 'posture-images' AND auth.uid()::text = (storage.foldername(name))[1]);
