
-- =====================================================================
-- 1. COURSES: add venue_id + trigger
-- =====================================================================
ALTER TABLE public.panchakarma_courses
  ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES public.panchakarma_venues(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pk_courses_venue ON public.panchakarma_courses(venue_id);
CREATE INDEX IF NOT EXISTS idx_pk_courses_patient ON public.panchakarma_courses(patient_id);
CREATE INDEX IF NOT EXISTS idx_pk_courses_vaidya ON public.panchakarma_courses(prescribing_vaidya_id);

CREATE OR REPLACE FUNCTION public.panchakarma_courses_validate_venue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v record;
BEGIN
  IF NEW.venue_id IS NULL THEN
    RETURN NEW; -- venue is optional at course-level; sessions must supply venue
  END IF;

  SELECT registration_status, is_active, offered_therapy_type_ids
    INTO v
  FROM public.panchakarma_venues
  WHERE id = NEW.venue_id;

  IF v IS NULL THEN
    RAISE EXCEPTION 'Venue % does not exist', NEW.venue_id;
  END IF;

  IF v.registration_status <> 'approved' OR v.is_active = false THEN
    RAISE EXCEPTION 'Venue is not approved and active for Panchakarma courses';
  END IF;

  IF NEW.therapy_type_id IS NOT NULL
     AND (v.offered_therapy_type_ids IS NULL
          OR NOT (NEW.therapy_type_id = ANY(v.offered_therapy_type_ids))) THEN
    RAISE EXCEPTION 'Venue does not offer the selected therapy type';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_pk_courses_validate_venue ON public.panchakarma_courses;
CREATE TRIGGER trg_pk_courses_validate_venue
BEFORE INSERT OR UPDATE OF venue_id, therapy_type_id ON public.panchakarma_courses
FOR EACH ROW EXECUTE FUNCTION public.panchakarma_courses_validate_venue();

-- =====================================================================
-- 2. SESSIONS: add missing columns
-- =====================================================================
ALTER TABLE public.panchakarma_sessions
  ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES public.panchakarma_venues(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES public.panchakarma_rooms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS session_number integer,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS scheduled_duration_minutes integer;

-- Widen status check
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.panchakarma_sessions'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.panchakarma_sessions DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.panchakarma_sessions
  ADD CONSTRAINT panchakarma_sessions_status_check
  CHECK (status IN ('pending_assessment','consented','assigned','in_progress','post_care_pending','completed','flagged'));

ALTER TABLE public.panchakarma_sessions ALTER COLUMN status SET DEFAULT 'pending_assessment';

CREATE INDEX IF NOT EXISTS idx_pk_sessions_course ON public.panchakarma_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_pk_sessions_venue ON public.panchakarma_sessions(venue_id);
CREATE INDEX IF NOT EXISTS idx_pk_sessions_therapist_time ON public.panchakarma_sessions(therapist_id, scheduled_at);

-- =====================================================================
-- 3. SESSIONS: therapist-privilege + overlap triggers
-- =====================================================================
CREATE OR REPLACE FUNCTION public.panchakarma_sessions_validate_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cr record;
  course_ttype uuid;
BEGIN
  IF NEW.status <> 'assigned' THEN
    RETURN NEW;
  END IF;
  IF (TG_OP = 'UPDATE' AND OLD.status = 'assigned' AND OLD.therapist_id IS NOT DISTINCT FROM NEW.therapist_id) THEN
    RETURN NEW;
  END IF;

  IF NEW.therapist_id IS NULL THEN
    RAISE EXCEPTION 'Cannot mark session as assigned without a therapist';
  END IF;

  SELECT therapy_type_id INTO course_ttype
  FROM public.panchakarma_courses WHERE id = NEW.course_id;

  SELECT privileged_therapy_type_ids, health_check_expiry, is_active
    INTO cr
  FROM public.panchakarma_therapist_credentials
  WHERE therapist_id = NEW.therapist_id
  ORDER BY updated_at DESC
  LIMIT 1;

  IF cr IS NULL THEN
    RAISE EXCEPTION 'Therapist has no credentials record';
  END IF;

  IF cr.is_active IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Therapist credentials are inactive';
  END IF;

  IF cr.health_check_expiry IS NULL OR cr.health_check_expiry <= CURRENT_DATE THEN
    RAISE EXCEPTION 'Therapist health check has expired';
  END IF;

  IF course_ttype IS NULL
     OR cr.privileged_therapy_type_ids IS NULL
     OR NOT (course_ttype = ANY(cr.privileged_therapy_type_ids)) THEN
    RAISE EXCEPTION 'Therapist is not privileged for this therapy type';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_pk_sessions_validate_assignment ON public.panchakarma_sessions;
CREATE TRIGGER trg_pk_sessions_validate_assignment
BEFORE INSERT OR UPDATE OF status, therapist_id ON public.panchakarma_sessions
FOR EACH ROW EXECUTE FUNCTION public.panchakarma_sessions_validate_assignment();

-- Overlap prevention (trigger, since btree_gist for uuid may not be enabled)
CREATE OR REPLACE FUNCTION public.panchakarma_sessions_prevent_overlap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_start timestamptz := NEW.scheduled_at;
  new_end   timestamptz;
BEGIN
  IF NEW.therapist_id IS NULL OR NEW.scheduled_at IS NULL OR NEW.scheduled_duration_minutes IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.status IN ('completed') THEN
    RETURN NEW;
  END IF;

  new_end := new_start + make_interval(mins => NEW.scheduled_duration_minutes);

  IF EXISTS (
    SELECT 1 FROM public.panchakarma_sessions s
    WHERE s.therapist_id = NEW.therapist_id
      AND s.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND s.scheduled_at IS NOT NULL
      AND s.scheduled_duration_minutes IS NOT NULL
      AND s.status NOT IN ('completed')
      AND tstzrange(s.scheduled_at, s.scheduled_at + make_interval(mins => s.scheduled_duration_minutes), '[)')
          && tstzrange(new_start, new_end, '[)')
  ) THEN
    RAISE EXCEPTION 'Therapist already has a session overlapping this time window';
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_pk_sessions_prevent_overlap ON public.panchakarma_sessions;
CREATE TRIGGER trg_pk_sessions_prevent_overlap
BEFORE INSERT OR UPDATE OF therapist_id, scheduled_at, scheduled_duration_minutes, status
ON public.panchakarma_sessions
FOR EACH ROW EXECUTE FUNCTION public.panchakarma_sessions_prevent_overlap();

-- =====================================================================
-- 4. RLS on sessions & courses (rebuild)
-- =====================================================================
ALTER TABLE public.panchakarma_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panchakarma_sessions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname, tablename FROM pg_policies
           WHERE schemaname='public' AND tablename IN ('panchakarma_courses','panchakarma_sessions') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

-- Courses
CREATE POLICY "Patient reads own courses" ON public.panchakarma_courses
FOR SELECT TO authenticated USING (patient_id = auth.uid());

CREATE POLICY "Vaidya manages own courses" ON public.panchakarma_courses
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = prescribing_vaidya_id AND d.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = prescribing_vaidya_id AND d.user_id = auth.uid()));

CREATE POLICY "Venue owner reads venue courses" ON public.panchakarma_courses
FOR SELECT TO authenticated
USING (venue_id IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.panchakarma_venues v WHERE v.id = venue_id AND v.owner_admin_id = auth.uid()
));

CREATE POLICY "Admins manage courses" ON public.panchakarma_courses
FOR ALL TO authenticated
USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));

-- Sessions
CREATE POLICY "Patient reads own sessions" ON public.panchakarma_sessions
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.panchakarma_courses c
  WHERE c.id = course_id AND c.patient_id = auth.uid()
));

CREATE POLICY "Therapist reads own sessions" ON public.panchakarma_sessions
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.therapists t WHERE t.id = therapist_id AND t.user_id = auth.uid()
));

CREATE POLICY "Therapist updates own sessions" ON public.panchakarma_sessions
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.therapists t WHERE t.id = therapist_id AND t.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.therapists t WHERE t.id = therapist_id AND t.user_id = auth.uid()));

CREATE POLICY "Vaidya manages patient sessions" ON public.panchakarma_sessions
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.panchakarma_courses c
  JOIN public.doctors d ON d.id = c.prescribing_vaidya_id
  WHERE c.id = course_id AND d.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.panchakarma_courses c
  JOIN public.doctors d ON d.id = c.prescribing_vaidya_id
  WHERE c.id = course_id AND d.user_id = auth.uid()
));

CREATE POLICY "Venue owner reads venue sessions" ON public.panchakarma_sessions
FOR SELECT TO authenticated
USING (venue_id IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.panchakarma_venues v WHERE v.id = venue_id AND v.owner_admin_id = auth.uid()
));

CREATE POLICY "Admins manage sessions" ON public.panchakarma_sessions
FOR ALL TO authenticated
USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));

-- =====================================================================
-- 5. Patient-facing and venue-operational views (no clinical jsonb)
-- =====================================================================
DROP VIEW IF EXISTS public.panchakarma_sessions_patient_view;
CREATE VIEW public.panchakarma_sessions_patient_view
WITH (security_invoker = true)
AS
SELECT
  s.id, s.course_id, s.venue_id, s.room_id, s.session_number,
  s.scheduled_at, s.scheduled_duration_minutes, s.therapist_id,
  s.status, s.adverse_event_flag,
  s.post_procedure_care_plan,
  s.created_at, s.updated_at
FROM public.panchakarma_sessions s;

DROP VIEW IF EXISTS public.panchakarma_sessions_venue_ops_view;
CREATE VIEW public.panchakarma_sessions_venue_ops_view
WITH (security_invoker = true)
AS
SELECT
  s.id, s.venue_id, s.room_id, s.session_number,
  s.scheduled_at, s.scheduled_duration_minutes,
  s.therapist_id, s.status, s.adverse_event_flag,
  s.created_at, s.updated_at
FROM public.panchakarma_sessions s;

GRANT SELECT ON public.panchakarma_sessions_patient_view TO authenticated;
GRANT SELECT ON public.panchakarma_sessions_venue_ops_view TO authenticated;
