
CREATE OR REPLACE FUNCTION public.panchakarma_courses_validate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  window_end date;
  conflict_count int;
  first_conflict_date date;
  first_conflict_time text;
BEGIN
  -- Basic sanity
  IF NEW.start_date IS NULL THEN
    RAISE EXCEPTION 'panchakarma_courses: start_date is required'
      USING ERRCODE = '22023';
  END IF;

  IF NEW.start_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'panchakarma_courses: start_date % is in the past', NEW.start_date
      USING ERRCODE = '22023';
  END IF;

  IF NEW.planned_sessions IS NULL OR NEW.planned_sessions < 1 OR NEW.planned_sessions > 60 THEN
    RAISE EXCEPTION 'panchakarma_courses: planned_sessions must be between 1 and 60 (got %)', NEW.planned_sessions
      USING ERRCODE = '22023';
  END IF;

  window_end := NEW.start_date + (NEW.planned_sessions - 1);

  -- Only enforce Vaidya double-booking check when a prescribing Vaidya is set.
  IF NEW.prescribing_vaidya_id IS NOT NULL THEN
    SELECT count(*), min(s.scheduled_date), min(s.scheduled_time::text)
      INTO conflict_count, first_conflict_date, first_conflict_time
    FROM public.panchakarma_sessions s
    WHERE s.vaidya_id = NEW.prescribing_vaidya_id
      AND s.scheduled_date BETWEEN NEW.start_date AND window_end
      AND COALESCE(s.status, '') NOT IN ('missed', 'rescheduled', 'cancelled');

    IF conflict_count > 0 THEN
      RAISE EXCEPTION
        'panchakarma_courses: Vaidya has % existing Panchakarma session(s) in the planned window %..% (e.g. % %)',
        conflict_count, NEW.start_date, window_end, first_conflict_date, COALESCE(first_conflict_time, '')
        USING ERRCODE = '23P01';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS panchakarma_courses_validate_trg ON public.panchakarma_courses;
CREATE TRIGGER panchakarma_courses_validate_trg
  BEFORE INSERT OR UPDATE OF start_date, planned_sessions, prescribing_vaidya_id
  ON public.panchakarma_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.panchakarma_courses_validate();
