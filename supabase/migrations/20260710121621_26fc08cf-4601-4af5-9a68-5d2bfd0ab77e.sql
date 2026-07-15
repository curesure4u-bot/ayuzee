CREATE TABLE IF NOT EXISTS public.namaste_icd_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  astg_disease_id uuid REFERENCES public.astg_diseases(id) ON DELETE SET NULL,
  sanskrit_name text,
  transliteration text,
  english_name text NOT NULL,
  source_document text,
  needs_verification boolean NOT NULL DEFAULT false,
  verification_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.namaste_icd_conditions TO anon, authenticated;
GRANT ALL ON public.namaste_icd_conditions TO service_role;
ALTER TABLE public.namaste_icd_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "namaste_icd_conditions readable by all"
  ON public.namaste_icd_conditions FOR SELECT USING (true);
CREATE POLICY "Admins manage namaste_icd_conditions"
  ON public.namaste_icd_conditions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.namaste_icd_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_id uuid NOT NULL REFERENCES public.namaste_icd_conditions(id) ON DELETE CASCADE,
  code_system text NOT NULL CHECK (code_system IN ('NAMC','ICD11_TM2','ICD11_BIO')),
  code text NOT NULL,
  label text,
  is_parent boolean NOT NULL DEFAULT false,
  parent_code text,
  sort_order int NOT NULL DEFAULT 0,
  source_document text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.namaste_icd_codes TO anon, authenticated;
GRANT ALL ON public.namaste_icd_codes TO service_role;
ALTER TABLE public.namaste_icd_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "namaste_icd_codes readable by all"
  ON public.namaste_icd_codes FOR SELECT USING (true);
CREATE POLICY "Admins manage namaste_icd_codes"
  ON public.namaste_icd_codes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_namaste_icd_codes_condition ON public.namaste_icd_codes(condition_id);
CREATE INDEX IF NOT EXISTS idx_namaste_icd_codes_lookup ON public.namaste_icd_codes(code_system, code);
CREATE INDEX IF NOT EXISTS idx_namaste_icd_conditions_needs_ver ON public.namaste_icd_conditions(needs_verification);

CREATE TRIGGER trg_namaste_icd_conditions_updated
  BEFORE UPDATE ON public.namaste_icd_conditions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();