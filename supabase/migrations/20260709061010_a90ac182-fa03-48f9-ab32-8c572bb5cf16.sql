
DROP POLICY IF EXISTS "sw_plans_patient_all" ON public.swasthavritta_plans;

CREATE POLICY "sw_plans_patient_select_signed" ON public.swasthavritta_plans
  FOR SELECT TO authenticated
  USING (
    signed_off = true
    AND EXISTS (
      SELECT 1 FROM public.swasthavritta_assessments a
      WHERE a.id = assessment_id AND a.patient_id = auth.uid()
    )
  );
