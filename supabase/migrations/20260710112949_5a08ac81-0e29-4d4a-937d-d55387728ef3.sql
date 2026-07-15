
-- =========================================================================
-- ASTG extension: Musculoskeletal Disorders (Ministry of AYUSH / DGHS STG, April 2024)
-- Extends existing astg_* schema; adds fields on astg_diseases and new child tables.
-- =========================================================================

-- 1. Extend astg_diseases with musculoskeletal-STG-style fields (nullable, backward compatible)
ALTER TABLE public.astg_diseases
  ADD COLUMN IF NOT EXISTS name_transliteration text,
  ADD COLUMN IF NOT EXISTS namc_code text,
  ADD COLUMN IF NOT EXISTS namc_subtypes jsonb,               -- [{code:'EC-6.1', label:'Vatika'}, ...]
  ADD COLUMN IF NOT EXISTS icd11_tm2_code text,
  ADD COLUMN IF NOT EXISTS icd11_biomedical_code text,
  ADD COLUMN IF NOT EXISTS case_definition_ayurvedic text,
  ADD COLUMN IF NOT EXISTS case_definition_biomedical text,
  ADD COLUMN IF NOT EXISTS introduction_text text,
  ADD COLUMN IF NOT EXISTS epidemiology_text text,
  ADD COLUMN IF NOT EXISTS clinical_examination_text text,
  ADD COLUMN IF NOT EXISTS investigations_text text,
  ADD COLUMN IF NOT EXISTS differential_diagnosis_text text;

-- 2. Extend astg_treatment_levels with structured management text
ALTER TABLE public.astg_treatment_levels
  ADD COLUMN IF NOT EXISTS facility_description text,
  ADD COLUMN IF NOT EXISTS management_text text;

-- 3. Disease sub-types / causes (e.g. Primary vs Secondary OA)
CREATE TABLE IF NOT EXISTS public.astg_disease_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid NOT NULL REFERENCES public.astg_diseases(id) ON DELETE CASCADE,
  type_label text NOT NULL,          -- e.g. "Primary", "Secondary", "Vatika"
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astg_disease_types TO anon, authenticated;
GRANT ALL ON public.astg_disease_types TO service_role;
ALTER TABLE public.astg_disease_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ASTG disease types readable by all" ON public.astg_disease_types
  FOR SELECT USING (true);
CREATE POLICY "Admins manage ASTG disease types" ON public.astg_disease_types
  FOR ALL USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- 4. Management principles (one row per disease, but table allows multiple for versioning)
CREATE TABLE IF NOT EXISTS public.astg_management_principles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid NOT NULL REFERENCES public.astg_diseases(id) ON DELETE CASCADE,
  red_flag_signs text[] NOT NULL DEFAULT '{}',   -- bypass-AI-interpretation triggers
  classical_treatment_text text,                 -- may contain shloka + source citations
  classical_treatment_citations jsonb,           -- [{source:'Charak Samhita Chi. 28', verse:'75-83'}]
  prevention_text text,
  yoga_exercise_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astg_management_principles TO anon, authenticated;
GRANT ALL ON public.astg_management_principles TO service_role;
ALTER TABLE public.astg_management_principles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ASTG mgmt principles readable by all" ON public.astg_management_principles
  FOR SELECT USING (true);
CREATE POLICY "Admins manage ASTG mgmt principles" ON public.astg_management_principles
  FOR ALL USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- 5. Pathya / Apathya (diet & lifestyle do's and don'ts)
CREATE TABLE IF NOT EXISTS public.astg_pathya_apathya (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid NOT NULL REFERENCES public.astg_diseases(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('diet','lifestyle','other')),
  item_text text NOT NULL,
  is_recommended boolean NOT NULL,   -- true = pathya, false = apathya
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astg_pathya_apathya TO anon, authenticated;
GRANT ALL ON public.astg_pathya_apathya TO service_role;
ALTER TABLE public.astg_pathya_apathya ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ASTG pathya apathya readable by all" ON public.astg_pathya_apathya
  FOR SELECT USING (true);
CREATE POLICY "Admins manage ASTG pathya apathya" ON public.astg_pathya_apathya
  FOR ALL USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- 6. Formulary entries per disease (separate from AFI/API classical formulary; can join later)
CREATE TABLE IF NOT EXISTS public.astg_formulary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid NOT NULL REFERENCES public.astg_diseases(id) ON DELETE CASCADE,
  drug_name text NOT NULL,
  dosage_form text,                  -- churna, kwatha, taila, guggulu, etc.
  dose text,
  timing text,                       -- e.g. BD after food
  duration text,
  anupana text,                      -- vehicle
  source_reference text,             -- e.g. "AFI Part I, p.123"
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astg_formulary_entries TO anon, authenticated;
GRANT ALL ON public.astg_formulary_entries TO service_role;
ALTER TABLE public.astg_formulary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ASTG formulary readable by all" ON public.astg_formulary_entries
  FOR SELECT USING (true);
CREATE POLICY "Admins manage ASTG formulary" ON public.astg_formulary_entries
  FOR ALL USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- 7. Shared Panchakarma annexure (NOT disease-specific — general lookup)
CREATE TABLE IF NOT EXISTS public.astg_panchakarma_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dosha_type text NOT NULL,          -- Vataja / Pittaja / Kaphaja / Vata-Kaphaja / Shula-pradhana / Nirama
  procedure_type text NOT NULL,      -- Abhyanga / Matra Basti / Janu Basti / Swedana / Upanaha / Vata Anulomana / Lepa
  recommended_options text NOT NULL,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astg_panchakarma_options TO anon, authenticated;
GRANT ALL ON public.astg_panchakarma_options TO service_role;
ALTER TABLE public.astg_panchakarma_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ASTG panchakarma options readable by all" ON public.astg_panchakarma_options
  FOR SELECT USING (true);
CREATE POLICY "Admins manage ASTG panchakarma options" ON public.astg_panchakarma_options
  FOR ALL USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- 8. updated_at triggers (reuse existing helper if present)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SET search_path = public AS $fn$
    BEGIN NEW.updated_at = now(); RETURN NEW; END;
    $fn$;
  END IF;
END $$;

CREATE TRIGGER trg_astg_disease_types_updated BEFORE UPDATE ON public.astg_disease_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_astg_mgmt_principles_updated BEFORE UPDATE ON public.astg_management_principles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_astg_pathya_apathya_updated BEFORE UPDATE ON public.astg_pathya_apathya
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_astg_formulary_updated BEFORE UPDATE ON public.astg_formulary_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_astg_panchakarma_options_updated BEFORE UPDATE ON public.astg_panchakarma_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Indexes
CREATE INDEX IF NOT EXISTS idx_astg_disease_types_disease ON public.astg_disease_types(disease_id);
CREATE INDEX IF NOT EXISTS idx_astg_mgmt_principles_disease ON public.astg_management_principles(disease_id);
CREATE INDEX IF NOT EXISTS idx_astg_pathya_apathya_disease ON public.astg_pathya_apathya(disease_id);
CREATE INDEX IF NOT EXISTS idx_astg_formulary_disease ON public.astg_formulary_entries(disease_id);

-- 10. Insert new "Musculoskeletal Disorders" category positioned directly below Metabolic Disorders.
--     Metabolic Disorders lives at sort_order 5 (Medovaha Srotas). Shift only rows with sort_order >= 6
--     (Metabolic Disorders itself is untouched) to make room, then insert at sort_order 6.
UPDATE public.astg_categories
   SET sort_order = sort_order + 1
 WHERE sort_order >= 6;

INSERT INTO public.astg_categories (name, name_sanskrit, modern_equivalent, icon, sort_order, guideline_year, source_note)
VALUES (
  'Musculoskeletal Disorders',
  'Asthi-Sandhi-Mamsa-gata Vikara',
  'Musculoskeletal',
  '🦴',
  6,
  2024,
  'Ministry of AYUSH / DGHS Ayush Vertical — Standard Treatment Guidelines on Management of Common Musculoskeletal Disorders in Ayurveda, April 2024 (ISBN 978-81-974231-0-9).'
)
ON CONFLICT DO NOTHING;

-- 11. Insert the six musculoskeletal diseases as scaffolding (published=false so admin can enrich).
--     Chapter numbering: 101-106 to avoid colliding with existing chapters.
WITH cat AS (
  SELECT id FROM public.astg_categories WHERE name = 'Musculoskeletal Disorders' LIMIT 1
)
INSERT INTO public.astg_diseases (
  category_id, chapter_number, name, name_transliteration, name_modern,
  namc_code, namc_subtypes, icd11_tm2_code, icd11_biomedical_code,
  is_published, sort_order, guideline_year, source_note
)
SELECT cat.id, ch, name, translit, modern, namc, subtypes::jsonb, tm2, icd11, false, ord, 2024,
       'AYUSH STG on Musculoskeletal Disorders, April 2024 (ISBN 978-81-974231-0-9).'
FROM cat, (VALUES
  (101, 'Sandhigata Vata',                'Sandhigata Vāta',      'Osteoarthritis',       'AAE-16',         NULL,                                                                                                                                                                                                                        'SP12', 'FA00-FA05',      1),
  (102, 'AmaVata',                        'Āmavāta',              'Rheumatoid Arthritis', 'EC-6',           '[{"code":"EC-6.1","label":"Vatika"},{"code":"EC-6.2","label":"Paittika"},{"code":"EC-6.3","label":"Kaphaja"},{"code":"EC-6.4","label":"Ativriddha"}]',                                                                     'SP11', 'FA20',           2),
  (103, 'Greevasthambha / Manyastambha',  'Grīvāstambha / Manyāstambha', 'Cervical Spondylosis', 'AAB-33 / AAB-73', NULL,                                                                                                                                                                                                              'SP45', 'FA80.0-FA80.3',  3),
  (104, 'Katishoola / Katigraha',         'Katiśūla / Katigraha', 'Lumbar Spondylosis',   NULL,             NULL,                                                                                                                                                                                                                        NULL,   NULL,             4),
  (105, 'SamaVata',                       'Sāmavāta',             'Fibromyalgia',         NULL,             NULL,                                                                                                                                                                                                                        NULL,   NULL,             5),
  (106, 'Avabahuka',                      'Avabāhuka',            'Adhesive Capsulitis',  NULL,             NULL,                                                                                                                                                                                                                        NULL,   NULL,             6)
) AS d(ch, name, translit, modern, namc, subtypes, tm2, icd11, ord)
ON CONFLICT DO NOTHING;

-- 12. Scaffold empty management_principles row per new disease (admin fills later)
INSERT INTO public.astg_management_principles (disease_id, red_flag_signs)
SELECT d.id, '{}'::text[]
  FROM public.astg_diseases d
  JOIN public.astg_categories c ON c.id = d.category_id
 WHERE c.name = 'Musculoskeletal Disorders'
   AND NOT EXISTS (SELECT 1 FROM public.astg_management_principles mp WHERE mp.disease_id = d.id);

-- 13. Scaffold Level 1/2/3 rows for each new disease (mirrors book tiers)
INSERT INTO public.astg_treatment_levels (disease_id, level_number, level_label, facility_type, facility_description, description, sort_order)
SELECT d.id, lvl.n, lvl.lbl, lvl.ft, lvl.fd, lvl.fd, lvl.n
  FROM public.astg_diseases d
  JOIN public.astg_categories c ON c.id = d.category_id
 CROSS JOIN (VALUES
    (1, 'Level 1', 'PHC',              'Solo physician / Primary Health Centre — OPD-based Ayurveda care, oral medicines, basic advice.'),
    (2, 'Level 2', 'CHC',              'Community Health Centre / small hospital — day-care Panchakarma, IPD where feasible.'),
    (3, 'Level 3', 'District Hospital','Ayush teaching hospital / District Ayush hospital — full Panchakarma, multi-disciplinary care, referral centre.')
 ) AS lvl(n, lbl, ft, fd)
 WHERE c.name = 'Musculoskeletal Disorders'
   AND NOT EXISTS (
     SELECT 1 FROM public.astg_treatment_levels tl
      WHERE tl.disease_id = d.id AND tl.level_number = lvl.n
   );
