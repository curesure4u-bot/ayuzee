
-- Prompt 1: food_items master table
CREATE TABLE public.food_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_local text,
  category text,
  rasa text[] DEFAULT '{}',
  guna text[] DEFAULT '{}',
  virya text,
  vipaka text,
  dosha_effect_vata integer DEFAULT 0 CHECK (dosha_effect_vata BETWEEN -2 AND 2),
  dosha_effect_pitta integer DEFAULT 0 CHECK (dosha_effect_pitta BETWEEN -2 AND 2),
  dosha_effect_kapha integer DEFAULT 0 CHECK (dosha_effect_kapha BETWEEN -2 AND 2),
  calories_per_100g numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  source text DEFAULT 'manual',
  verified_by uuid REFERENCES public.profiles(id),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_food_items_name ON public.food_items USING gin (to_tsvector('simple', name));
CREATE INDEX idx_food_items_category ON public.food_items(category);

GRANT SELECT ON public.food_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.food_items TO authenticated;
GRANT ALL ON public.food_items TO service_role;

ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "food_items readable by all"
  ON public.food_items FOR SELECT
  USING (true);

CREATE POLICY "food_items insert by admin or vaidya"
  ON public.food_items FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'doctor')
  );

CREATE POLICY "food_items update by admin or vaidya"
  ON public.food_items FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'doctor')
  );

CREATE POLICY "food_items delete by admin"
  ON public.food_items FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE TRIGGER trg_food_items_updated_at
  BEFORE UPDATE ON public.food_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prompt 2: diet_charts + diet_chart_items
CREATE TABLE public.diet_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vaidya_id uuid NOT NULL REFERENCES public.profiles(id),
  title text NOT NULL,
  prakriti text,
  vikriti_notes text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_diet_charts_patient ON public.diet_charts(patient_id);
CREATE INDEX idx_diet_charts_vaidya ON public.diet_charts(vaidya_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.diet_charts TO authenticated;
GRANT ALL ON public.diet_charts TO service_role;

ALTER TABLE public.diet_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diet_charts vaidya manage own"
  ON public.diet_charts FOR ALL
  TO authenticated
  USING (vaidya_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (vaidya_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "diet_charts patient read own"
  ON public.diet_charts FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE TRIGGER trg_diet_charts_updated_at
  BEFORE UPDATE ON public.diet_charts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.diet_chart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_chart_id uuid NOT NULL REFERENCES public.diet_charts(id) ON DELETE CASCADE,
  food_item_id uuid NOT NULL REFERENCES public.food_items(id),
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  day_number integer NOT NULL DEFAULT 1,
  quantity numeric,
  unit text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_diet_chart_items_chart ON public.diet_chart_items(diet_chart_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.diet_chart_items TO authenticated;
GRANT ALL ON public.diet_chart_items TO service_role;

ALTER TABLE public.diet_chart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diet_chart_items vaidya manage"
  ON public.diet_chart_items FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.diet_charts c WHERE c.id = diet_chart_id
      AND (c.vaidya_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.diet_charts c WHERE c.id = diet_chart_id
      AND (c.vaidya_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')))
  );

CREATE POLICY "diet_chart_items patient read"
  ON public.diet_chart_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.diet_charts c WHERE c.id = diet_chart_id AND c.patient_id = auth.uid())
  );
