
-- 1. Audit log table
CREATE TABLE IF NOT EXISTS public.panchakarma_course_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  action text NOT NULL CHECK (action IN ('insert','update')),
  course_id uuid,
  payload jsonb,
  outcome text NOT NULL CHECK (outcome IN ('success','blocked')),
  failed_rule text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.panchakarma_course_audit_log TO authenticated;
GRANT ALL    ON public.panchakarma_course_audit_log TO service_role;

ALTER TABLE public.panchakarma_course_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Actor or admin can view course audit rows"
  ON public.panchakarma_course_audit_log;
CREATE POLICY "Actor or admin can view course audit rows"
  ON public.panchakarma_course_audit_log
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR actor_user_id = auth.uid()
  );

CREATE INDEX IF NOT EXISTS panchakarma_course_audit_log_actor_idx
  ON public.panchakarma_course_audit_log (actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS panchakarma_course_audit_log_course_idx
  ON public.panchakarma_course_audit_log (course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS panchakarma_course_audit_log_outcome_idx
  ON public.panchakarma_course_audit_log (outcome, created_at DESC);

-- 2. Update the validation trigger to tag each rule with a machine-readable code (DETAIL)
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
  IF NEW.start_date IS NULL THEN
    RAISE EXCEPTION 'panchakarma_courses: start_date is required'
      USING ERRCODE = '22023', DETAIL = 'rule=start_date_missing';
  END IF;

  IF NEW.start_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'panchakarma_courses: start_date % is in the past', NEW.start_date
      USING ERRCODE = '22023', DETAIL = 'rule=start_date_past';
  END IF;

  IF NEW.planned_sessions IS NULL OR NEW.planned_sessions < 1 OR NEW.planned_sessions > 60 THEN
    RAISE EXCEPTION 'panchakarma_courses: planned_sessions must be between 1 and 60 (got %)', NEW.planned_sessions
      USING ERRCODE = '22023', DETAIL = 'rule=planned_sessions_out_of_range';
  END IF;

  window_end := NEW.start_date + (NEW.planned_sessions - 1);

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
        USING ERRCODE = '23P01', DETAIL = 'rule=vaidya_double_booked';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.panchakarma_courses_validate() FROM PUBLIC, anon, authenticated;

-- 3. SECURITY DEFINER logger for blocked attempts (called from the app after catching a trigger error)
CREATE OR REPLACE FUNCTION public.log_panchakarma_course_attempt(
  _action text,
  _course_id uuid,
  _payload jsonb,
  _outcome text,
  _failed_rule text,
  _error_message text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid := auth.uid();
  new_id uuid;
BEGIN
  IF actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF _action NOT IN ('insert','update') THEN
    RAISE EXCEPTION 'invalid action %', _action USING ERRCODE = '22023';
  END IF;
  IF _outcome NOT IN ('success','blocked') THEN
    RAISE EXCEPTION 'invalid outcome %', _outcome USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.panchakarma_course_audit_log
    (actor_user_id, action, course_id, payload, outcome, failed_rule, error_message)
  VALUES
    (actor, _action, _course_id, _payload, _outcome,
     NULLIF(_failed_rule,''), NULLIF(_error_message,''))
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.log_panchakarma_course_attempt(text,uuid,jsonb,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_panchakarma_course_attempt(text,uuid,jsonb,text,text,text) TO authenticated;

-- 4. AFTER trigger: automatically log successful inserts/updates
CREATE OR REPLACE FUNCTION public.panchakarma_courses_log_success()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
BEGIN
  payload := jsonb_build_object(
    'patient_id', NEW.patient_id,
    'prescribing_vaidya_id', NEW.prescribing_vaidya_id,
    'therapy_type_id', NEW.therapy_type_id,
    'venue_id', NEW.venue_id,
    'consent_id', NEW.consent_id,
    'start_date', NEW.start_date,
    'planned_sessions', NEW.planned_sessions,
    'status', NEW.status
  );

  INSERT INTO public.panchakarma_course_audit_log
    (actor_user_id, action, course_id, payload, outcome)
  VALUES
    (auth.uid(),
     CASE WHEN TG_OP = 'INSERT' THEN 'insert' ELSE 'update' END,
     NEW.id, payload, 'success');

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.panchakarma_courses_log_success() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS panchakarma_courses_log_success_trg ON public.panchakarma_courses;
CREATE TRIGGER panchakarma_courses_log_success_trg
  AFTER INSERT OR UPDATE OF start_date, planned_sessions, prescribing_vaidya_id, status
  ON public.panchakarma_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.panchakarma_courses_log_success();
