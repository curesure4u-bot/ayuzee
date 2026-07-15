
-- 1. Add stable auth link on homeo_patients
ALTER TABLE public.homeo_patients
  ADD COLUMN IF NOT EXISTS patient_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS homeo_patients_patient_user_id_idx ON public.homeo_patients(patient_user_id);

-- 2. Replace email-based patient policies with auth.uid() binding
DROP POLICY IF EXISTS "Patients view own homeo prescriptions" ON public.homeo_prescriptions;
CREATE POLICY "Patients view own homeo prescriptions"
  ON public.homeo_prescriptions
  FOR SELECT
  TO authenticated
  USING (
    patient_id IN (
      SELECT id FROM public.homeo_patients
      WHERE patient_user_id IS NOT NULL AND patient_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Patient can view recipes attached to their prescription" ON public.prescription_food_recipes;
CREATE POLICY "Patient can view recipes attached to their prescription"
  ON public.prescription_food_recipes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.homeo_patients hp
      WHERE hp.id = prescription_food_recipes.patient_id
        AND hp.patient_user_id IS NOT NULL
        AND hp.patient_user_id = auth.uid()
    )
  );

-- 3. Allow public discovery of approved network partners
DROP POLICY IF EXISTS "Public can view approved partners" ON public.network_partners;
CREATE POLICY "Public can view approved partners"
  ON public.network_partners
  FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

GRANT SELECT ON public.network_partners TO anon;
