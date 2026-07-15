-- Essential Unani Drugs library
CREATE TABLE public.essential_unani_drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_no INTEGER,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  category_code TEXT,
  indications TEXT[] DEFAULT '{}',
  dose TEXT,
  mode_of_administration TEXT,
  pack_size TEXT,
  precautions TEXT,
  preferred_use TEXT DEFAULT 'Both',
  reference_text TEXT,
  description TEXT,
  search_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_eud_category ON public.essential_unani_drugs(category);
CREATE INDEX idx_eud_search ON public.essential_unani_drugs USING GIN (search_text gin_trgm_ops);
CREATE INDEX idx_eud_indications ON public.essential_unani_drugs USING GIN (indications);

CREATE OR REPLACE FUNCTION public.essential_unani_drugs_refresh_search()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.search_text := lower(concat_ws(' ',
    NEW.name, NEW.category, NEW.reference_text, NEW.dose, NEW.precautions,
    array_to_string(COALESCE(NEW.indications,'{}'),' ')
  ));
  RETURN NEW;
END $$;

CREATE TRIGGER trg_eud_search
BEFORE INSERT OR UPDATE ON public.essential_unani_drugs
FOR EACH ROW EXECUTE FUNCTION public.essential_unani_drugs_refresh_search();

CREATE TRIGGER trg_eud_updated_at
BEFORE UPDATE ON public.essential_unani_drugs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.essential_unani_drugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view unani drugs"
ON public.essential_unani_drugs FOR SELECT USING (true);

CREATE POLICY "Admins manage unani drugs"
ON public.essential_unani_drugs FOR ALL
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));

-- Prescription join table
CREATE TABLE public.prescription_essential_unani_drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.vaidya_consultations(id) ON DELETE CASCADE,
  drug_id UUID NOT NULL REFERENCES public.essential_unani_drugs(id),
  dose_override TEXT,
  frequency TEXT,
  duration TEXT,
  anupana TEXT,
  instructions TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_peud_consultation ON public.prescription_essential_unani_drugs(consultation_id);

ALTER TABLE public.prescription_essential_unani_drugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors manage own unani rx"
ON public.prescription_essential_unani_drugs FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.vaidya_consultations c
  WHERE c.id = consultation_id AND c.doctor_user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.vaidya_consultations c
  WHERE c.id = consultation_id AND c.doctor_user_id = auth.uid()
));

CREATE POLICY "Admins view all unani rx"
ON public.prescription_essential_unani_drugs FOR SELECT
USING (public.is_admin_or_super(auth.uid()));