-- 1. Extend vaidya_consultations with EMR fields (table may not exist yet — create if missing)
CREATE TABLE IF NOT EXISTS public.vaidya_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_id UUID,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnosis TEXT,
  prescription TEXT,
  follow_up_date DATE,
  fee NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vaidya_consultations
  ADD COLUMN IF NOT EXISTS chief_complaint TEXT,
  ADD COLUMN IF NOT EXISTS history TEXT,
  ADD COLUMN IF NOT EXISTS examination TEXT,
  ADD COLUMN IF NOT EXISTS vitals JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS assessment TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT,
  ADD COLUMN IF NOT EXISTS advice TEXT,
  ADD COLUMN IF NOT EXISTS transcript TEXT,
  ADD COLUMN IF NOT EXISTS audio_url TEXT,
  ADD COLUMN IF NOT EXISTS abha_id TEXT,
  ADD COLUMN IF NOT EXISTS source_language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_model TEXT,
  ADD COLUMN IF NOT EXISTS cds_suggestions JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.vaidya_consultations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Doctor manages own consultations"
    ON public.vaidya_consultations FOR ALL
    USING (auth.uid() = doctor_user_id)
    WITH CHECK (auth.uid() = doctor_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS trg_vc_updated ON public.vaidya_consultations;
CREATE TRIGGER trg_vc_updated BEFORE UPDATE ON public.vaidya_consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. ABHA health records log
CREATE TABLE public.abha_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  consultation_id UUID REFERENCES public.vaidya_consultations(id) ON DELETE CASCADE,
  abha_id TEXT NOT NULL,
  patient_name TEXT,
  fhir_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  push_status TEXT NOT NULL DEFAULT 'pending',
  push_response JSONB DEFAULT '{}'::jsonb,
  pushed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.abha_health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor manages own ABHA records"
  ON public.abha_health_records FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE TRIGGER trg_abha_updated BEFORE UPDATE ON public.abha_health_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Developer API keys
CREATE TABLE public.developer_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  label TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read:patients','read:consultations'],
  last_used_at TIMESTAMPTZ,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.developer_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor manages own api keys"
  ON public.developer_api_keys FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE INDEX idx_dev_api_key_hash ON public.developer_api_keys(key_hash) WHERE revoked = false;

-- 4. Storage bucket for AI scribe audio (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vaidya-emr-audio', 'vaidya-emr-audio', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Doctor reads own EMR audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vaidya-emr-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Doctor uploads own EMR audio"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vaidya-emr-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Doctor deletes own EMR audio"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vaidya-emr-audio' AND auth.uid()::text = (storage.foldername(name))[1]);