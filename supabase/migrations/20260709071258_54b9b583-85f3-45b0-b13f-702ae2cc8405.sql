
ALTER TABLE public.panchakarma_session_feedback
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.panchakarma_feedback_set_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.needs_review := (COALESCE(NEW.symptom_severity, 0) >= 8)
                   OR (NEW.side_effects IS NOT NULL AND length(trim(NEW.side_effects)) > 0);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pk_feedback_set_review ON public.panchakarma_session_feedback;
CREATE TRIGGER pk_feedback_set_review
  BEFORE INSERT OR UPDATE ON public.panchakarma_session_feedback
  FOR EACH ROW EXECUTE FUNCTION public.panchakarma_feedback_set_review();

CREATE UNIQUE INDEX IF NOT EXISTS uniq_pk_feedback_session_patient
  ON public.panchakarma_session_feedback(session_id, patient_id);
