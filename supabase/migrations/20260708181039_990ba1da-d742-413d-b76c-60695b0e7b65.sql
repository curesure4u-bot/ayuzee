
-- Restrict gut_health_assessments visibility to assigned doctors only (remove unassigned/submitted access)
DROP POLICY IF EXISTS "Doctors view assigned or unassigned submitted gut assessments" ON public.gut_health_assessments;
DROP POLICY IF EXISTS "Doctors update assigned or unassigned submitted gut assessments" ON public.gut_health_assessments;

CREATE POLICY "Doctors view assigned gut assessments"
ON public.gut_health_assessments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.user_id = auth.uid()
      AND d.id = gut_health_assessments.doctor_id
  )
);

CREATE POLICY "Doctors update assigned gut assessments"
ON public.gut_health_assessments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.user_id = auth.uid()
      AND d.id = gut_health_assessments.doctor_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.user_id = auth.uid()
      AND d.id = gut_health_assessments.doctor_id
  )
);

-- Prevent spoofing applied_by_user_id on anonymous partner applications
DROP POLICY IF EXISTS "Public can submit partner application" ON public.network_partners;

CREATE POLICY "Public can submit partner application"
ON public.network_partners
FOR INSERT
WITH CHECK (
  is_approved = false
  AND length(COALESCE(name, '')) BETWEEN 2 AND 200
  AND partner_type = ANY (ARRAY['therapist','hospital','clinic','panchakarma_theater'])
  AND length(COALESCE(city, '')) BETWEEN 2 AND 100
  AND (applied_by_user_id IS NULL OR applied_by_user_id = auth.uid())
);
