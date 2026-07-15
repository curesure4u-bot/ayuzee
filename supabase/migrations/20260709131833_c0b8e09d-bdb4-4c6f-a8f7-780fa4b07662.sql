-- Tighten anonymous INSERT on condition_leads to reduce PII harvesting/spam surface
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.condition_leads;

CREATE POLICY "Anyone can submit a lead"
ON public.condition_leads
FOR INSERT
TO public
WITH CHECK (
  status = 'new'
  AND char_length(full_name) BETWEEN 2 AND 120
  AND full_name ~ '^[A-Za-z][A-Za-z .''\-]{1,119}$'
  AND char_length(phone) BETWEEN 6 AND 20
  AND phone ~ '^[0-9+\-\s]{6,20}$'
  AND (email IS NULL OR (char_length(email) <= 255 AND email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'))
  AND (notes IS NULL OR char_length(notes) <= 500)
  AND (package_label IS NULL OR char_length(package_label) <= 200)
  AND (condition_slug IS NULL OR char_length(condition_slug) <= 120)
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- Rate limit: block more than 3 anonymous leads from the same phone in 10 minutes
CREATE OR REPLACE FUNCTION public.condition_leads_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count int;
BEGIN
  IF NEW.user_id IS NULL THEN
    SELECT count(*) INTO recent_count
    FROM public.condition_leads
    WHERE phone = NEW.phone
      AND created_at > now() - interval '10 minutes';
    IF recent_count >= 3 THEN
      RAISE EXCEPTION 'Too many requests. Please try again later.' USING ERRCODE = '22023';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_condition_leads_rate_limit ON public.condition_leads;
CREATE TRIGGER trg_condition_leads_rate_limit
BEFORE INSERT ON public.condition_leads
FOR EACH ROW EXECUTE FUNCTION public.condition_leads_rate_limit();