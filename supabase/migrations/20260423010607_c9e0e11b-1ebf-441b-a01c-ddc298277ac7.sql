-- Treatment systems (top-level groupings like Respiratory, Liver, Lifestyle Disorders, etc.)
CREATE TABLE IF NOT EXISTS public.treatment_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.treatment_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published systems"
  ON public.treatment_systems FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins manage systems"
  ON public.treatment_systems FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_treatment_systems_updated_at
  BEFORE UPDATE ON public.treatment_systems
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Link health_conditions to a system (nullable so existing rows keep working)
ALTER TABLE public.health_conditions
  ADD COLUMN IF NOT EXISTS system_id uuid REFERENCES public.treatment_systems(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_health_conditions_system_id ON public.health_conditions(system_id);

-- Seed the 8 systems shown in the reference
INSERT INTO public.treatment_systems (slug, name, sort_order) VALUES
  ('respiratory-problems', 'Respiratory Problems', 1),
  ('liver-problems', 'Liver Problems', 2),
  ('kidney-problems', 'Kidney Problems', 3),
  ('female-health-issues', 'Female Health Issues', 4),
  ('lifestyle-disorders', 'Lifestyle Disorders', 5),
  ('digestive-issues', 'Digestive Issues', 6),
  ('skin-diseases', 'Skin Diseases', 7),
  ('pain-management', 'Pain Management', 8)
ON CONFLICT (slug) DO NOTHING;