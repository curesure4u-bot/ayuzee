
CREATE TABLE public.essential_drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_no INTEGER,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  category_code TEXT,
  reference_text TEXT,
  pack_size TEXT,
  indications TEXT[] DEFAULT '{}',
  dose TEXT,
  mode_of_administration TEXT,
  precautions TEXT,
  preferred_use TEXT DEFAULT 'Both',
  description TEXT,
  search_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_essential_drugs_category ON public.essential_drugs(category);
CREATE INDEX idx_essential_drugs_search ON public.essential_drugs USING GIN (search_text gin_trgm_ops);
CREATE INDEX idx_essential_drugs_indications ON public.essential_drugs USING GIN (indications);

CREATE OR REPLACE FUNCTION public.essential_drugs_refresh_search()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.search_text := lower(concat_ws(' ',
    NEW.name, NEW.category, NEW.reference_text, NEW.dose, NEW.precautions,
    array_to_string(COALESCE(NEW.indications,'{}'),' ')
  ));
  RETURN NEW;
END $$;

CREATE TRIGGER trg_essential_drugs_search
BEFORE INSERT OR UPDATE ON public.essential_drugs
FOR EACH ROW EXECUTE FUNCTION public.essential_drugs_refresh_search();

CREATE TRIGGER set_essential_drugs_updated_at
BEFORE UPDATE ON public.essential_drugs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.essential_drugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Essential drugs are publicly readable"
ON public.essential_drugs FOR SELECT USING (true);

CREATE POLICY "Admins can insert essential drugs"
ON public.essential_drugs FOR INSERT
WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can update essential drugs"
ON public.essential_drugs FOR UPDATE
USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can delete essential drugs"
ON public.essential_drugs FOR DELETE
USING (public.is_admin_or_super(auth.uid()));

CREATE TABLE public.prescription_essential_drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.vaidya_consultations(id) ON DELETE CASCADE,
  drug_id UUID NOT NULL REFERENCES public.essential_drugs(id) ON DELETE RESTRICT,
  dose_override TEXT,
  frequency TEXT,
  duration TEXT,
  anupana TEXT,
  instructions TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pres_essential_drugs_consult ON public.prescription_essential_drugs(consultation_id);

ALTER TABLE public.prescription_essential_drugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor on consultation can view prescribed drugs"
ON public.prescription_essential_drugs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.vaidya_consultations c
    WHERE c.id = prescription_essential_drugs.consultation_id
      AND c.doctor_user_id = auth.uid()
  )
  OR public.is_admin_or_super(auth.uid())
);

CREATE POLICY "Doctor on consultation can add prescribed drugs"
ON public.prescription_essential_drugs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vaidya_consultations c
    WHERE c.id = prescription_essential_drugs.consultation_id
      AND c.doctor_user_id = auth.uid()
  )
);

CREATE POLICY "Doctor on consultation can update prescribed drugs"
ON public.prescription_essential_drugs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.vaidya_consultations c
    WHERE c.id = prescription_essential_drugs.consultation_id
      AND c.doctor_user_id = auth.uid()
  )
);

CREATE POLICY "Doctor on consultation can remove prescribed drugs"
ON public.prescription_essential_drugs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.vaidya_consultations c
    WHERE c.id = prescription_essential_drugs.consultation_id
      AND c.doctor_user_id = auth.uid()
  )
);
