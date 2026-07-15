ALTER TABLE public.health_conditions
  ADD COLUMN IF NOT EXISTS content_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS related_medicines jsonb NOT NULL DEFAULT '[]'::jsonb;