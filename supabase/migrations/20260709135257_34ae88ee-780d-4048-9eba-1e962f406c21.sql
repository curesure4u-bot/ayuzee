
-- =========================================================
-- Reference tables (stubs — extend later as needed)
-- =========================================================

CREATE TABLE public.panchakarma_therapy_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_privileged BOOLEAN NOT NULL DEFAULT false,
  standard_prep_days INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.panchakarma_therapy_types TO authenticated, anon;
GRANT ALL ON public.panchakarma_therapy_types TO service_role;
ALTER TABLE public.panchakarma_therapy_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Therapy types readable by all"
  ON public.panchakarma_therapy_types FOR SELECT USING (true);
CREATE POLICY "Admins manage therapy types"
  ON public.panchakarma_therapy_types FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_pk_therapy_types_updated
  BEFORE UPDATE ON public.panchakarma_therapy_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


CREATE TABLE public.panchakarma_therapist_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  privileged_therapy_type_ids UUID[] NOT NULL DEFAULT '{}',
  credentials_note TEXT,
  verified_by UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (therapist_id)
);
GRANT SELECT ON public.panchakarma_therapist_credentials TO authenticated;
GRANT INSERT, UPDATE ON public.panchakarma_therapist_credentials TO authenticated;
GRANT ALL ON public.panchakarma_therapist_credentials TO service_role;
ALTER TABLE public.panchakarma_therapist_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Credentials readable by authenticated"
  ON public.panchakarma_therapist_credentials FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "Admins manage credentials"
  ON public.panchakarma_therapist_credentials FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Therapist can view own credentials row"
  ON public.panchakarma_therapist_credentials FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.therapists t
                 WHERE t.id = panchakarma_therapist_credentials.therapist_id
                   AND t.user_id = auth.uid()));

CREATE TRIGGER trg_pk_therapist_creds_updated
  BEFORE UPDATE ON public.panchakarma_therapist_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pk_creds_therapist ON public.panchakarma_therapist_credentials(therapist_id);
CREATE INDEX idx_pk_creds_priv_types ON public.panchakarma_therapist_credentials USING GIN (privileged_therapy_type_ids);


CREATE TABLE public.panchakarma_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  vaidya_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  therapy_type_id UUID NOT NULL REFERENCES public.panchakarma_therapy_types(id) ON DELETE RESTRICT,
  consent_text TEXT NOT NULL,
  signed_at TIMESTAMPTZ,
  signature_data TEXT,
  signature_ip TEXT,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.panchakarma_consents TO authenticated;
GRANT ALL ON public.panchakarma_consents TO service_role;
ALTER TABLE public.panchakarma_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient reads own consents"
  ON public.panchakarma_consents FOR SELECT
  USING (patient_id = auth.uid());
CREATE POLICY "Patient signs own consent"
  ON public.panchakarma_consents FOR UPDATE
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Vaidya manages consents they issued"
  ON public.panchakarma_consents FOR ALL
  USING (EXISTS (SELECT 1 FROM public.doctors d
                 WHERE d.id = panchakarma_consents.vaidya_id
                   AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.doctors d
                      WHERE d.id = panchakarma_consents.vaidya_id
                        AND d.user_id = auth.uid()));
CREATE POLICY "Admins manage consents"
  ON public.panchakarma_consents FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_pk_consents_updated
  BEFORE UPDATE ON public.panchakarma_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pk_consents_patient ON public.panchakarma_consents(patient_id);
CREATE INDEX idx_pk_consents_vaidya ON public.panchakarma_consents(vaidya_id);


-- =========================================================
-- panchakarma_courses
-- =========================================================
CREATE TABLE public.panchakarma_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  prescribing_vaidya_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  therapy_type_id UUID NOT NULL REFERENCES public.panchakarma_therapy_types(id) ON DELETE RESTRICT,
  consent_id UUID REFERENCES public.panchakarma_consents(id) ON DELETE SET NULL,
  provisional_diagnosis TEXT,
  start_date DATE,
  planned_sessions INTEGER,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','completed','discontinued')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.panchakarma_courses TO authenticated;
GRANT ALL ON public.panchakarma_courses TO service_role;
ALTER TABLE public.panchakarma_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient reads own courses"
  ON public.panchakarma_courses FOR SELECT
  USING (patient_id = auth.uid());
CREATE POLICY "Vaidya manages own courses"
  ON public.panchakarma_courses FOR ALL
  USING (EXISTS (SELECT 1 FROM public.doctors d
                 WHERE d.id = panchakarma_courses.prescribing_vaidya_id
                   AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.doctors d
                      WHERE d.id = panchakarma_courses.prescribing_vaidya_id
                        AND d.user_id = auth.uid()));
CREATE POLICY "Admins manage courses"
  ON public.panchakarma_courses FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_pk_courses_updated
  BEFORE UPDATE ON public.panchakarma_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pk_courses_patient ON public.panchakarma_courses(patient_id);
CREATE INDEX idx_pk_courses_vaidya ON public.panchakarma_courses(prescribing_vaidya_id);
CREATE INDEX idx_pk_courses_therapy ON public.panchakarma_courses(therapy_type_id);


-- =========================================================
-- panchakarma_procedure_sessions
-- (named distinctly to avoid conflict with existing panchakarma_sessions)
-- =========================================================
CREATE TABLE public.panchakarma_procedure_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.panchakarma_courses(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  scheduled_at TIMESTAMPTZ,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  room_id UUID,
  status TEXT NOT NULL DEFAULT 'pending_assessment'
    CHECK (status IN ('pending_assessment','consented','assigned','in_progress','post_care_pending','completed','flagged')),
  pre_procedure_assessment JSONB,
  procedure_log JSONB,
  transfer_note TEXT,
  post_procedure_care_plan TEXT,
  post_care_approved_by UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  post_care_approved_at TIMESTAMPTZ,
  adverse_event_flag BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, session_number)
);
GRANT SELECT, INSERT, UPDATE ON public.panchakarma_procedure_sessions TO authenticated;
GRANT ALL ON public.panchakarma_procedure_sessions TO service_role;
ALTER TABLE public.panchakarma_procedure_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient reads own procedure sessions"
  ON public.panchakarma_procedure_sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.panchakarma_courses c
                 WHERE c.id = panchakarma_procedure_sessions.course_id
                   AND c.patient_id = auth.uid()));
CREATE POLICY "Assigned therapist reads own sessions"
  ON public.panchakarma_procedure_sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.therapists t
                 WHERE t.id = panchakarma_procedure_sessions.therapist_id
                   AND t.user_id = auth.uid()));
CREATE POLICY "Assigned therapist updates own sessions"
  ON public.panchakarma_procedure_sessions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.therapists t
                 WHERE t.id = panchakarma_procedure_sessions.therapist_id
                   AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.therapists t
                      WHERE t.id = panchakarma_procedure_sessions.therapist_id
                        AND t.user_id = auth.uid()));
CREATE POLICY "Vaidya manages sessions of own courses"
  ON public.panchakarma_procedure_sessions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.panchakarma_courses c
                 JOIN public.doctors d ON d.id = c.prescribing_vaidya_id
                 WHERE c.id = panchakarma_procedure_sessions.course_id
                   AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.panchakarma_courses c
                      JOIN public.doctors d ON d.id = c.prescribing_vaidya_id
                      WHERE c.id = panchakarma_procedure_sessions.course_id
                        AND d.user_id = auth.uid()));
CREATE POLICY "Admins manage procedure sessions"
  ON public.panchakarma_procedure_sessions FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_pk_proc_sessions_updated
  BEFORE UPDATE ON public.panchakarma_procedure_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pk_psessions_course ON public.panchakarma_procedure_sessions(course_id);
CREATE INDEX idx_pk_psessions_therapist ON public.panchakarma_procedure_sessions(therapist_id);
CREATE INDEX idx_pk_psessions_status ON public.panchakarma_procedure_sessions(status);


-- =========================================================
-- Guardrail trigger: therapist must be credentialed for the
-- course's therapy type before a session can move to 'assigned'.
-- =========================================================
CREATE OR REPLACE FUNCTION public.enforce_pk_therapist_credential()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_therapy_type UUID;
  v_ok BOOLEAN;
BEGIN
  IF NEW.status <> 'assigned' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'assigned'
     AND OLD.therapist_id IS NOT DISTINCT FROM NEW.therapist_id THEN
    RETURN NEW;
  END IF;

  IF NEW.therapist_id IS NULL THEN
    RAISE EXCEPTION 'Cannot mark session as assigned without a therapist_id';
  END IF;

  SELECT therapy_type_id INTO v_therapy_type
  FROM public.panchakarma_courses
  WHERE id = NEW.course_id;

  IF v_therapy_type IS NULL THEN
    RAISE EXCEPTION 'Course % has no therapy_type_id', NEW.course_id;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.panchakarma_therapist_credentials c
    WHERE c.therapist_id = NEW.therapist_id
      AND v_therapy_type = ANY(c.privileged_therapy_type_ids)
  ) INTO v_ok;

  IF NOT v_ok THEN
    RAISE EXCEPTION 'Therapist % is not credentialed for therapy type %',
      NEW.therapist_id, v_therapy_type
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pk_enforce_credential
  BEFORE INSERT OR UPDATE OF status, therapist_id
  ON public.panchakarma_procedure_sessions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_pk_therapist_credential();
