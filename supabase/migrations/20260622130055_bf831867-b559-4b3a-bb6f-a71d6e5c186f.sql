
CREATE POLICY "Assigned doctor reads own cases"
ON public.atmri_sponsored_cases
FOR SELECT
TO authenticated
USING (auth.uid() = assigned_doctor_user_id);
