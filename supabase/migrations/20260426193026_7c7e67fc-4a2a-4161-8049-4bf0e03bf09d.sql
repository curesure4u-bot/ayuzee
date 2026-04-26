-- Allow patients to view their own homeopathy prescriptions and patient record (matched by email)
CREATE POLICY "Patients view own homeo patient record"
ON public.homeo_patients
FOR SELECT
TO authenticated
USING (
  email IS NOT NULL
  AND lower(email) = lower((auth.jwt() ->> 'email'))
);

CREATE POLICY "Patients view own homeo prescriptions"
ON public.homeo_prescriptions
FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM public.homeo_patients
    WHERE email IS NOT NULL
      AND lower(email) = lower((auth.jwt() ->> 'email'))
  )
);