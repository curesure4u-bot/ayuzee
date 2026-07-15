
-- Reference library of essential homeopathy remedies
CREATE TABLE public.essential_homeopathy_drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_no INT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  latin_name TEXT,
  common_name TEXT,
  kingdom TEXT, -- Plant, Mineral, Animal, Nosode, Sarcode, Imponderable
  available_potencies TEXT[] NOT NULL DEFAULT '{}', -- e.g. {'Q','30','200','1M'}
  available_forms TEXT[] NOT NULL DEFAULT '{}', -- e.g. {'Ointment','Oil','Drops'}
  indications TEXT[] DEFAULT '{}',
  keynotes TEXT[] DEFAULT '{}',
  dose TEXT,
  mode_of_administration TEXT,
  precautions TEXT,
  description TEXT,
  reference_text TEXT,
  search_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_essential_homeo_search ON public.essential_homeopathy_drugs USING GIN (search_text gin_trgm_ops);
CREATE INDEX idx_essential_homeo_name ON public.essential_homeopathy_drugs (name);
CREATE INDEX idx_essential_homeo_kingdom ON public.essential_homeopathy_drugs (kingdom);

CREATE TRIGGER essential_homeo_drugs_search_trg
BEFORE INSERT OR UPDATE ON public.essential_homeopathy_drugs
FOR EACH ROW EXECUTE FUNCTION public.essential_drugs_refresh_search();

CREATE TRIGGER essential_homeo_drugs_updated
BEFORE UPDATE ON public.essential_homeopathy_drugs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.essential_homeopathy_drugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view essential homeopathy drugs"
ON public.essential_homeopathy_drugs FOR SELECT USING (true);

CREATE POLICY "Admins manage essential homeopathy drugs"
ON public.essential_homeopathy_drugs FOR ALL TO authenticated
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));

-- Prescription join table
CREATE TABLE public.prescription_homeopathy_drugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES public.vaidya_consultations(id) ON DELETE CASCADE,
  drug_id UUID NOT NULL REFERENCES public.essential_homeopathy_drugs(id) ON DELETE RESTRICT,
  potency TEXT NOT NULL, -- chosen from available_potencies (e.g. "30", "200", "1M", "Q")
  form TEXT, -- "Globules", "Drops", "Ointment"
  dose TEXT, -- e.g. "4 globules", "5 drops in water"
  frequency TEXT, -- e.g. "TDS", "BD", "Single dose"
  repetition TEXT, -- e.g. "Wait 3 weeks before repeating"
  duration_days INT,
  instructions TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prescription_homeo_consultation ON public.prescription_homeopathy_drugs (consultation_id);
CREATE INDEX idx_prescription_homeo_drug ON public.prescription_homeopathy_drugs (drug_id);

CREATE TRIGGER prescription_homeo_drugs_updated
BEFORE UPDATE ON public.prescription_homeopathy_drugs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.prescription_homeopathy_drugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors view their consultation homeo prescriptions"
ON public.prescription_homeopathy_drugs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vaidya_consultations c
    WHERE c.id = consultation_id AND c.doctor_user_id = auth.uid()
  )
  OR public.is_admin_or_super(auth.uid())
);

CREATE POLICY "Doctors manage their consultation homeo prescriptions"
ON public.prescription_homeopathy_drugs FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vaidya_consultations c
    WHERE c.id = consultation_id AND c.doctor_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vaidya_consultations c
    WHERE c.id = consultation_id AND c.doctor_user_id = auth.uid()
  )
);
