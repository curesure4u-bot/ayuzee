DROP POLICY IF EXISTS "Anyone can join treatment kit waitlist" ON public.treatment_kit_waitlist;

CREATE POLICY "Anyone can join treatment kit waitlist with valid details"
ON public.treatment_kit_waitlist
FOR INSERT
WITH CHECK (
  length(trim(email)) BETWEEN 5 AND 255
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND length(trim(kit_name)) BETWEEN 2 AND 120
  AND (user_id IS NULL OR auth.uid() = user_id)
);