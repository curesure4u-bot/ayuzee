
-- Add guideline_year + source_note to categories and diseases
ALTER TABLE public.astg_categories
  ADD COLUMN IF NOT EXISTS guideline_year INT NOT NULL DEFAULT 2017,
  ADD COLUMN IF NOT EXISTS source_note TEXT;

ALTER TABLE public.astg_diseases
  ADD COLUMN IF NOT EXISTS guideline_year INT NOT NULL DEFAULT 2017,
  ADD COLUMN IF NOT EXISTS source_note TEXT;

-- Backfill: keep all existing categories/diseases as 2017
UPDATE public.astg_categories SET guideline_year = 2017 WHERE guideline_year IS NULL;
UPDATE public.astg_diseases  SET guideline_year = 2017 WHERE guideline_year IS NULL;

-- Insert new Metabolic Disorders (2025) category, idempotent
INSERT INTO public.astg_categories (name, name_sanskrit, modern_equivalent, icon, sort_order, guideline_year, source_note)
SELECT 'Metabolic Disorders', 'Metabolic Disorders', 'Metabolic (2025 STG)', '🧬', 100, 2025,
       'Ministry of AYUSH, Directorate General of Health Services, April 2025'
WHERE NOT EXISTS (
  SELECT 1 FROM public.astg_categories WHERE name = 'Metabolic Disorders' AND guideline_year = 2025
);
