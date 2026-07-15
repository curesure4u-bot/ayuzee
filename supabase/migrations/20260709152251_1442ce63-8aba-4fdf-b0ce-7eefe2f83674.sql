
-- 1) Unique constraint on room checklist per day
ALTER TABLE public.panchakarma_room_checklists
  DROP CONSTRAINT IF EXISTS panchakarma_room_checklists_room_date_uniq;
ALTER TABLE public.panchakarma_room_checklists
  ADD CONSTRAINT panchakarma_room_checklists_room_date_uniq UNIQUE (room_id, checklist_date);

-- 2) venue_id on quality indicators
ALTER TABLE public.panchakarma_quality_indicators
  ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES public.panchakarma_venues(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS panchakarma_quality_indicators_venue_idx
  ON public.panchakarma_quality_indicators(venue_id, period_start DESC);

-- 3) Session status guard: cannot move to 'in_progress' without cleared checklist + infection-control log
CREATE OR REPLACE FUNCTION public.panchakarma_sessions_guard_in_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  checklist_ok boolean;
  ic_ok boolean;
  session_date date;
BEGIN
  IF NEW.status IS DISTINCT FROM 'in_progress'
     OR (TG_OP = 'UPDATE' AND OLD.status = 'in_progress') THEN
    RETURN NEW;
  END IF;

  session_date := COALESCE(NEW.scheduled_date, CURRENT_DATE);

  IF NEW.room_id IS NULL THEN
    RAISE EXCEPTION 'Cannot start session: no room assigned'
      USING ERRCODE = '22023', DETAIL = 'rule=room_required';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.panchakarma_room_checklists c
    WHERE c.room_id = NEW.room_id
      AND c.checklist_date = session_date
      AND c.all_clear = true
  ) INTO checklist_ok;

  IF NOT checklist_ok THEN
    RAISE EXCEPTION 'Cannot start session: room % has no cleared checklist for %', NEW.room_id, session_date
      USING ERRCODE = '22023', DETAIL = 'rule=room_checklist_missing';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.panchakarma_infection_control_logs l
    WHERE l.session_id = NEW.id
  ) INTO ic_ok;

  IF NOT ic_ok THEN
    RAISE EXCEPTION 'Cannot start session: infection control log not recorded'
      USING ERRCODE = '22023', DETAIL = 'rule=infection_control_missing';
  END IF;

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.panchakarma_sessions_guard_in_progress() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS panchakarma_sessions_guard_in_progress_trg ON public.panchakarma_sessions;
CREATE TRIGGER panchakarma_sessions_guard_in_progress_trg
  BEFORE UPDATE OF status ON public.panchakarma_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.panchakarma_sessions_guard_in_progress();

-- Helper: does the current user own the venue that hosts this session?
CREATE OR REPLACE FUNCTION public.pk_user_owns_session_venue(_session_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.panchakarma_sessions s
    JOIN public.panchakarma_venues v ON v.id = s.venue_id
    WHERE s.id = _session_id
      AND v.owner_admin_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.pk_user_owns_session_venue(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pk_user_owns_session_venue(uuid) TO authenticated;

-- Helper: is the current user the prescribing Vaidya for this session's course?
CREATE OR REPLACE FUNCTION public.pk_user_is_session_vaidya(_session_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.panchakarma_sessions s
    JOIN public.panchakarma_courses c ON c.id = s.course_id
    JOIN public.doctors d ON d.id = c.prescribing_vaidya_id
    WHERE s.id = _session_id
      AND d.user_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.pk_user_is_session_vaidya(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pk_user_is_session_vaidya(uuid) TO authenticated;

-- 4) RLS rebuild: adverse events (Vaidya + admin only)
ALTER TABLE public.panchakarma_adverse_events ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='panchakarma_adverse_events'
  LOOP EXECUTE format('DROP POLICY %I ON public.panchakarma_adverse_events', p.policyname); END LOOP;
END $$;

CREATE POLICY "Vaidya or admin can view adverse events"
  ON public.panchakarma_adverse_events FOR SELECT TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR public.pk_user_is_session_vaidya(session_id)
  );

CREATE POLICY "Vaidya or admin can insert adverse events"
  ON public.panchakarma_adverse_events FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin_or_super(auth.uid())
    OR public.pk_user_is_session_vaidya(session_id)
  );

CREATE POLICY "Vaidya or admin can update adverse events"
  ON public.panchakarma_adverse_events FOR UPDATE TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR public.pk_user_is_session_vaidya(session_id)
  )
  WITH CHECK (
    public.is_admin_or_super(auth.uid())
    OR public.pk_user_is_session_vaidya(session_id)
  );

CREATE POLICY "Admins delete adverse events"
  ON public.panchakarma_adverse_events FOR DELETE TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

-- 5) RLS rebuild: quality indicators (admin all, venue owner own)
ALTER TABLE public.panchakarma_quality_indicators ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='panchakarma_quality_indicators'
  LOOP EXECUTE format('DROP POLICY %I ON public.panchakarma_quality_indicators', p.policyname); END LOOP;
END $$;

CREATE POLICY "Admin views all quality indicators"
  ON public.panchakarma_quality_indicators FOR SELECT TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.panchakarma_venues v
      WHERE v.id = venue_id AND v.owner_admin_id = auth.uid()
    )
  );

CREATE POLICY "Admin writes quality indicators"
  ON public.panchakarma_quality_indicators FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- 6) RLS rebuild: room checklists (venue owner / Vaidya / admin)
ALTER TABLE public.panchakarma_room_checklists ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='panchakarma_room_checklists'
  LOOP EXECUTE format('DROP POLICY %I ON public.panchakarma_room_checklists', p.policyname); END LOOP;
END $$;

CREATE POLICY "Venue owner or admin view room checklists"
  ON public.panchakarma_room_checklists FOR SELECT TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.panchakarma_rooms r
      JOIN public.panchakarma_venues v ON v.id = r.venue_id
      WHERE r.id = panchakarma_room_checklists.room_id
        AND v.owner_admin_id = auth.uid()
    )
  );

CREATE POLICY "Venue owner or admin write room checklists"
  ON public.panchakarma_room_checklists FOR ALL TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.panchakarma_rooms r
      JOIN public.panchakarma_venues v ON v.id = r.venue_id
      WHERE r.id = panchakarma_room_checklists.room_id
        AND v.owner_admin_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin_or_super(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.panchakarma_rooms r
      JOIN public.panchakarma_venues v ON v.id = r.venue_id
      WHERE r.id = panchakarma_room_checklists.room_id
        AND v.owner_admin_id = auth.uid()
    )
  );

-- 7) RLS rebuild: infection control logs
ALTER TABLE public.panchakarma_infection_control_logs ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='panchakarma_infection_control_logs'
  LOOP EXECUTE format('DROP POLICY %I ON public.panchakarma_infection_control_logs', p.policyname); END LOOP;
END $$;

CREATE POLICY "Venue owner, Vaidya or admin view infection logs"
  ON public.panchakarma_infection_control_logs FOR SELECT TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR public.pk_user_owns_session_venue(session_id)
    OR public.pk_user_is_session_vaidya(session_id)
  );

CREATE POLICY "Venue owner, Vaidya or admin write infection logs"
  ON public.panchakarma_infection_control_logs FOR ALL TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR public.pk_user_owns_session_venue(session_id)
    OR public.pk_user_is_session_vaidya(session_id)
  )
  WITH CHECK (
    public.is_admin_or_super(auth.uid())
    OR public.pk_user_owns_session_venue(session_id)
    OR public.pk_user_is_session_vaidya(session_id)
  );
