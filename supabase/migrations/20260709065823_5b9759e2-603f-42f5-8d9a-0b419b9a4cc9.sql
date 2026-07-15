
-- 1. panchakarma_course_templates
CREATE TABLE public.panchakarma_course_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  therapy_type TEXT NOT NULL,
  total_days INT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.panchakarma_course_templates TO authenticated;
GRANT ALL ON public.panchakarma_course_templates TO service_role;
ALTER TABLE public.panchakarma_course_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pk_templates_read_auth" ON public.panchakarma_course_templates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "pk_templates_admin_all" ON public.panchakarma_course_templates
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- 2. panchakarma_template_stages
CREATE TABLE public.panchakarma_template_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.panchakarma_course_templates(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  day_offset INT NOT NULL DEFAULT 0,
  duration_minutes INT,
  requires_room_type TEXT,
  pre_procedure_instructions TEXT,
  post_procedure_instructions TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.panchakarma_template_stages TO authenticated;
GRANT ALL ON public.panchakarma_template_stages TO service_role;
ALTER TABLE public.panchakarma_template_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pk_stages_read_auth" ON public.panchakarma_template_stages
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "pk_stages_admin_all" ON public.panchakarma_template_stages
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE INDEX idx_pk_stages_template ON public.panchakarma_template_stages(template_id, sort_order);

-- 3. panchakarma_course_bookings
CREATE TABLE public.panchakarma_course_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  vaidya_id UUID NOT NULL,
  template_id UUID NOT NULL REFERENCES public.panchakarma_course_templates(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.panchakarma_course_bookings TO authenticated;
GRANT ALL ON public.panchakarma_course_bookings TO service_role;
ALTER TABLE public.panchakarma_course_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pk_bookings_patient_select" ON public.panchakarma_course_bookings
  FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "pk_bookings_patient_insert" ON public.panchakarma_course_bookings
  FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "pk_bookings_vaidya_all" ON public.panchakarma_course_bookings
  FOR ALL TO authenticated
  USING (vaidya_id = auth.uid())
  WITH CHECK (vaidya_id = auth.uid());
CREATE POLICY "pk_bookings_admin_all" ON public.panchakarma_course_bookings
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE INDEX idx_pk_bookings_patient ON public.panchakarma_course_bookings(patient_id);
CREATE INDEX idx_pk_bookings_vaidya ON public.panchakarma_course_bookings(vaidya_id);
CREATE INDEX idx_pk_bookings_start_date ON public.panchakarma_course_bookings(start_date);

-- 4. panchakarma_sessions
CREATE TABLE public.panchakarma_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.panchakarma_course_bookings(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.panchakarma_template_stages(id) ON DELETE RESTRICT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  vaidya_id UUID NOT NULL,
  room_resource TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  completion_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.panchakarma_sessions TO authenticated;
GRANT ALL ON public.panchakarma_sessions TO service_role;
ALTER TABLE public.panchakarma_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pk_sessions_patient_select" ON public.panchakarma_sessions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.panchakarma_course_bookings b
            WHERE b.id = booking_id AND b.patient_id = auth.uid())
  );
CREATE POLICY "pk_sessions_vaidya_all" ON public.panchakarma_sessions
  FOR ALL TO authenticated
  USING (vaidya_id = auth.uid())
  WITH CHECK (vaidya_id = auth.uid());
CREATE POLICY "pk_sessions_admin_all" ON public.panchakarma_sessions
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE INDEX idx_pk_sessions_booking ON public.panchakarma_sessions(booking_id);
CREATE INDEX idx_pk_sessions_vaidya ON public.panchakarma_sessions(vaidya_id);
CREATE INDEX idx_pk_sessions_date ON public.panchakarma_sessions(scheduled_date);

-- 5. panchakarma_session_feedback
CREATE TABLE public.panchakarma_session_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.panchakarma_sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  symptom_severity INT CHECK (symptom_severity BETWEEN 1 AND 10),
  improvement_notes TEXT,
  side_effects TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.panchakarma_session_feedback TO authenticated;
GRANT ALL ON public.panchakarma_session_feedback TO service_role;
ALTER TABLE public.panchakarma_session_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pk_feedback_patient_select" ON public.panchakarma_session_feedback
  FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "pk_feedback_patient_insert" ON public.panchakarma_session_feedback
  FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "pk_feedback_patient_update" ON public.panchakarma_session_feedback
  FOR UPDATE TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "pk_feedback_vaidya_select" ON public.panchakarma_session_feedback
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.panchakarma_sessions s
            WHERE s.id = session_id AND s.vaidya_id = auth.uid())
  );
CREATE POLICY "pk_feedback_admin_all" ON public.panchakarma_session_feedback
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE INDEX idx_pk_feedback_session ON public.panchakarma_session_feedback(session_id);
CREATE INDEX idx_pk_feedback_patient ON public.panchakarma_session_feedback(patient_id);

-- updated_at triggers
CREATE TRIGGER pk_templates_updated BEFORE UPDATE ON public.panchakarma_course_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pk_stages_updated BEFORE UPDATE ON public.panchakarma_template_stages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pk_bookings_updated BEFORE UPDATE ON public.panchakarma_course_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER pk_sessions_updated BEFORE UPDATE ON public.panchakarma_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
