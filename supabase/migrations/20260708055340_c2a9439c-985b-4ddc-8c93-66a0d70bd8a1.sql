
-- =========================================================
-- Mala Pareeksha: server-side validation & sanitization
-- =========================================================

-- 1) Sanitizer helpers ------------------------------------------------

CREATE OR REPLACE FUNCTION public.mala_sanitize_text(input text, max_len int DEFAULT 2000)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v text := input;
BEGIN
  IF v IS NULL THEN
    RETURN NULL;
  END IF;
  -- Strip HTML tags
  v := regexp_replace(v, '<[^>]*>', '', 'g');
  -- Strip control characters except tab, newline, carriage return
  v := regexp_replace(v, '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g');
  -- Collapse null bytes explicitly
  v := replace(v, chr(0), '');
  -- Trim
  v := btrim(v);
  IF v = '' THEN
    RETURN NULL;
  END IF;
  IF char_length(v) > max_len THEN
    v := left(v, max_len);
  END IF;
  RETURN v;
END;
$$;

CREATE OR REPLACE FUNCTION public.mala_sanitize_jsonb(input jsonb, max_bytes int DEFAULT 32000)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  txt text;
BEGIN
  IF input IS NULL THEN
    RETURN NULL;
  END IF;
  txt := input::text;
  IF octet_length(txt) > max_bytes THEN
    RAISE EXCEPTION 'JSON payload exceeds % bytes', max_bytes
      USING ERRCODE = 'check_violation';
  END IF;
  -- Strip HTML tags from every string value inside the JSON tree
  txt := regexp_replace(txt, '<[^>]*>', '', 'g');
  -- Strip control chars (keep tab/newline/cr)
  txt := regexp_replace(txt, '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g');
  txt := replace(txt, chr(0), '');
  RETURN txt::jsonb;
EXCEPTION WHEN others THEN
  RAISE EXCEPTION 'Invalid JSON payload' USING ERRCODE = 'check_violation';
END;
$$;

-- 2) BEFORE INSERT/UPDATE trigger -------------------------------------

CREATE OR REPLACE FUNCTION public.mala_pareeksha_sanitize()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.patient_name       := public.mala_sanitize_text(NEW.patient_name, 120);
  NEW.patient_gender     := public.mala_sanitize_text(NEW.patient_gender, 20);
  NEW.patient_ref        := public.mala_sanitize_text(NEW.patient_ref, 60);
  NEW.diagnosis_note     := public.mala_sanitize_text(NEW.diagnosis_note, 2000);
  NEW.diet_advice        := public.mala_sanitize_text(NEW.diet_advice, 2000);
  NEW.lifestyle_advice   := public.mala_sanitize_text(NEW.lifestyle_advice, 2000);
  NEW.medicines          := public.mala_sanitize_text(NEW.medicines, 2000);
  NEW.panchakarma        := public.mala_sanitize_text(NEW.panchakarma, 2000);
  NEW.red_flag_warning   := public.mala_sanitize_text(NEW.red_flag_warning, 500);
  NEW.dosha              := public.mala_sanitize_text(NEW.dosha, 30);
  NEW.agni               := public.mala_sanitize_text(NEW.agni, 30);
  NEW.ama                := public.mala_sanitize_text(NEW.ama, 20);
  NEW.risk_level         := public.mala_sanitize_text(NEW.risk_level, 20);

  NEW.responses := public.mala_sanitize_jsonb(NEW.responses, 32000);
  NEW.analysis  := public.mala_sanitize_jsonb(NEW.analysis, 16000);

  -- Required-field guard
  IF NEW.patient_name IS NULL THEN
    RAISE EXCEPTION 'patient_name is required' USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mala_pareeksha_sanitize ON public.mala_pareeksha_assessments;
CREATE TRIGGER trg_mala_pareeksha_sanitize
BEFORE INSERT OR UPDATE ON public.mala_pareeksha_assessments
FOR EACH ROW EXECUTE FUNCTION public.mala_pareeksha_sanitize();

-- 3) CHECK constraints ------------------------------------------------
-- Use NOT VALID so existing rows are not blocked; validate future writes.

ALTER TABLE public.mala_pareeksha_assessments
  DROP CONSTRAINT IF EXISTS mala_stool_type_range;
ALTER TABLE public.mala_pareeksha_assessments
  ADD CONSTRAINT mala_stool_type_range
  CHECK (stool_type BETWEEN 1 AND 11) NOT VALID;

ALTER TABLE public.mala_pareeksha_assessments
  DROP CONSTRAINT IF EXISTS mala_age_range;
ALTER TABLE public.mala_pareeksha_assessments
  ADD CONSTRAINT mala_age_range
  CHECK (patient_age IS NULL OR (patient_age BETWEEN 0 AND 150)) NOT VALID;

ALTER TABLE public.mala_pareeksha_assessments
  DROP CONSTRAINT IF EXISTS mala_name_length;
ALTER TABLE public.mala_pareeksha_assessments
  ADD CONSTRAINT mala_name_length
  CHECK (patient_name IS NULL OR char_length(patient_name) BETWEEN 1 AND 120) NOT VALID;

ALTER TABLE public.mala_pareeksha_assessments
  DROP CONSTRAINT IF EXISTS mala_gender_enum;
ALTER TABLE public.mala_pareeksha_assessments
  ADD CONSTRAINT mala_gender_enum
  CHECK (patient_gender IS NULL OR patient_gender IN ('Male','Female','Other')) NOT VALID;

ALTER TABLE public.mala_pareeksha_assessments
  DROP CONSTRAINT IF EXISTS mala_ref_length;
ALTER TABLE public.mala_pareeksha_assessments
  ADD CONSTRAINT mala_ref_length
  CHECK (patient_ref IS NULL OR char_length(patient_ref) <= 60) NOT VALID;

ALTER TABLE public.mala_pareeksha_assessments
  DROP CONSTRAINT IF EXISTS mala_dosha_enum;
ALTER TABLE public.mala_pareeksha_assessments
  ADD CONSTRAINT mala_dosha_enum
  CHECK (dosha IS NULL OR dosha IN ('Vata','Pitta','Kapha','Pitta-Kapha','Mixed','Balanced','Unknown')) NOT VALID;

ALTER TABLE public.mala_pareeksha_assessments
  DROP CONSTRAINT IF EXISTS mala_ama_enum;
ALTER TABLE public.mala_pareeksha_assessments
  ADD CONSTRAINT mala_ama_enum
  CHECK (ama IS NULL OR ama IN ('Low','Moderate','High')) NOT VALID;

ALTER TABLE public.mala_pareeksha_assessments
  DROP CONSTRAINT IF EXISTS mala_risk_enum;
ALTER TABLE public.mala_pareeksha_assessments
  ADD CONSTRAINT mala_risk_enum
  CHECK (risk_level IS NULL OR risk_level IN ('normal','observe','attention','urgent')) NOT VALID;

ALTER TABLE public.mala_pareeksha_assessments
  DROP CONSTRAINT IF EXISTS mala_text_field_lengths;
ALTER TABLE public.mala_pareeksha_assessments
  ADD CONSTRAINT mala_text_field_lengths
  CHECK (
    (diagnosis_note   IS NULL OR char_length(diagnosis_note)   <= 2000) AND
    (diet_advice      IS NULL OR char_length(diet_advice)      <= 2000) AND
    (lifestyle_advice IS NULL OR char_length(lifestyle_advice) <= 2000) AND
    (medicines        IS NULL OR char_length(medicines)        <= 2000) AND
    (panchakarma      IS NULL OR char_length(panchakarma)      <= 2000) AND
    (red_flag_warning IS NULL OR char_length(red_flag_warning) <= 500)
  ) NOT VALID;
