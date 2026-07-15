ALTER TABLE public.spine_reports
  ADD COLUMN IF NOT EXISTS dosha_note TEXT,
  ADD COLUMN IF NOT EXISTS recommended_action TEXT;