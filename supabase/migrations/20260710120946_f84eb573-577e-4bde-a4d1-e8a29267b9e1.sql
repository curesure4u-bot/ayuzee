ALTER TABLE public.spine_reports
  ADD COLUMN IF NOT EXISTS astg_disease_id uuid REFERENCES public.astg_diseases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS astg_red_flag_matched text,
  ADD COLUMN IF NOT EXISTS astg_red_flag_source text,
  ADD COLUMN IF NOT EXISTS interpretation_bypassed boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_spine_reports_astg_disease ON public.spine_reports(astg_disease_id);