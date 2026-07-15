
-- 1. Room checklists
CREATE TABLE public.panchakarma_room_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID,
  checked_by UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  checklist_date DATE NOT NULL DEFAULT CURRENT_DATE,
  items_checked JSONB NOT NULL DEFAULT '{}'::jsonb,
  all_clear BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.panchakarma_room_checklists TO authenticated;
GRANT ALL ON public.panchakarma_room_checklists TO service_role;
ALTER TABLE public.panchakarma_room_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated staff can view room checklists"
  ON public.panchakarma_room_checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Doctors can insert room checklists"
  ON public.panchakarma_room_checklists FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid())
    OR public.is_admin_or_super(auth.uid())
  );
CREATE POLICY "Doctors and admins can update room checklists"
  ON public.panchakarma_room_checklists FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.id = checked_by)
    OR public.is_admin_or_super(auth.uid())
  );
CREATE POLICY "Admins can delete room checklists"
  ON public.panchakarma_room_checklists FOR DELETE TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_pk_room_checklists_updated
  BEFORE UPDATE ON public.panchakarma_room_checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pk_room_checklists_date ON public.panchakarma_room_checklists(checklist_date DESC);
CREATE INDEX idx_pk_room_checklists_room ON public.panchakarma_room_checklists(room_id);

-- 2. Infection control logs
CREATE TABLE public.panchakarma_infection_control_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.panchakarma_sessions(id) ON DELETE CASCADE,
  hand_hygiene BOOLEAN NOT NULL DEFAULT false,
  room_disinfected BOOLEAN NOT NULL DEFAULT false,
  ppe_used BOOLEAN NOT NULL DEFAULT false,
  linen_changed BOOLEAN NOT NULL DEFAULT false,
  bmw_segregated BOOLEAN NOT NULL DEFAULT false,
  logged_by UUID,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.panchakarma_infection_control_logs TO authenticated;
GRANT ALL ON public.panchakarma_infection_control_logs TO service_role;
ALTER TABLE public.panchakarma_infection_control_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated staff can view infection logs"
  ON public.panchakarma_infection_control_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can log infection control"
  ON public.panchakarma_infection_control_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Logger or admin can update infection log"
  ON public.panchakarma_infection_control_logs FOR UPDATE TO authenticated
  USING (logged_by = auth.uid() OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins can delete infection logs"
  ON public.panchakarma_infection_control_logs FOR DELETE TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_pk_infection_logs_updated
  BEFORE UPDATE ON public.panchakarma_infection_control_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pk_infection_logs_session ON public.panchakarma_infection_control_logs(session_id);

-- 3. Adverse events (Vaidyas + admins only)
CREATE TABLE public.panchakarma_adverse_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.panchakarma_sessions(id) ON DELETE SET NULL,
  reported_by UUID,
  severity TEXT NOT NULL CHECK (severity IN ('near_miss','minor','major','critical')),
  description TEXT NOT NULL,
  root_cause TEXT,
  corrective_action TEXT,
  vaidya_notified_at TIMESTAMPTZ,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.panchakarma_adverse_events TO authenticated;
GRANT ALL ON public.panchakarma_adverse_events TO service_role;
ALTER TABLE public.panchakarma_adverse_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vaidyas and admins can view adverse events"
  ON public.panchakarma_adverse_events FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid())
    OR public.is_admin_or_super(auth.uid())
  );
CREATE POLICY "Vaidyas and admins can insert adverse events"
  ON public.panchakarma_adverse_events FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid())
    OR public.is_admin_or_super(auth.uid())
  );
CREATE POLICY "Vaidyas and admins can update adverse events"
  ON public.panchakarma_adverse_events FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid())
    OR public.is_admin_or_super(auth.uid())
  );
CREATE POLICY "Admins can delete adverse events"
  ON public.panchakarma_adverse_events FOR DELETE TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_pk_adverse_events_updated
  BEFORE UPDATE ON public.panchakarma_adverse_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pk_adverse_events_session ON public.panchakarma_adverse_events(session_id);
CREATE INDEX idx_pk_adverse_events_severity ON public.panchakarma_adverse_events(severity);

-- 4. Quality indicators (admin only)
CREATE TABLE public.panchakarma_quality_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  protocol_adherence_pct NUMERIC,
  complication_rate NUMERIC,
  avg_satisfaction_score NUMERIC,
  total_sessions INTEGER,
  total_incidents INTEGER,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.panchakarma_quality_indicators TO authenticated;
GRANT ALL ON public.panchakarma_quality_indicators TO service_role;
ALTER TABLE public.panchakarma_quality_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view quality indicators"
  ON public.panchakarma_quality_indicators FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins can manage quality indicators"
  ON public.panchakarma_quality_indicators FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_pk_quality_updated
  BEFORE UPDATE ON public.panchakarma_quality_indicators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pk_quality_period ON public.panchakarma_quality_indicators(period_start, period_end);
