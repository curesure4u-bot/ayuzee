
DROP POLICY IF EXISTS diet_plans_patient_all ON public.diet_plans;

CREATE POLICY diet_plans_patient_select_signed
ON public.diet_plans
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.swasthavritta_plans p
    JOIN public.swasthavritta_assessments a ON a.id = p.assessment_id
    WHERE p.id = diet_plans.plan_id
      AND a.patient_id = auth.uid()
      AND p.signed_off = true
  )
);
