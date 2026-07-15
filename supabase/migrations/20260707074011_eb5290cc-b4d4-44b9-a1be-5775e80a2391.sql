
CREATE TABLE public.gut_health_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'submitted',
  ayurveda_responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  clinical_responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  has_red_flag boolean NOT NULL DEFAULT false,
  gut_health_score integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  CONSTRAINT gut_health_assessments_status_chk CHECK (status IN ('submitted','ai_drafted','reviewed'))
);
CREATE INDEX gut_health_assessments_patient_idx ON public.gut_health_assessments(patient_id);
CREATE INDEX gut_health_assessments_doctor_idx ON public.gut_health_assessments(doctor_id);

GRANT SELECT, INSERT, UPDATE ON public.gut_health_assessments TO authenticated;
GRANT ALL ON public.gut_health_assessments TO service_role;

ALTER TABLE public.gut_health_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own gut assessments"
  ON public.gut_health_assessments FOR SELECT TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Patients insert own gut assessments"
  ON public.gut_health_assessments FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors view assigned or unassigned submitted gut assessments"
  ON public.gut_health_assessments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.user_id = auth.uid()
        AND (d.id = gut_health_assessments.doctor_id
             OR (gut_health_assessments.doctor_id IS NULL AND gut_health_assessments.status = 'submitted'))
    )
  );

CREATE POLICY "Doctors update assigned or unassigned submitted gut assessments"
  ON public.gut_health_assessments FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.user_id = auth.uid()
        AND (d.id = gut_health_assessments.doctor_id
             OR (gut_health_assessments.doctor_id IS NULL AND gut_health_assessments.status = 'submitted'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.user_id = auth.uid() AND d.id = gut_health_assessments.doctor_id
    )
  );

CREATE POLICY "Admins manage gut assessments"
  ON public.gut_health_assessments FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));


CREATE TABLE public.gut_health_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.gut_health_assessments(id) ON DELETE CASCADE,
  ai_draft_summary text,
  vaidya_notes text,
  final_summary text,
  pdf_url text,
  signed_by uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX gut_health_reports_assessment_idx ON public.gut_health_reports(assessment_id);

GRANT SELECT, INSERT, UPDATE ON public.gut_health_reports TO authenticated;
GRANT ALL ON public.gut_health_reports TO service_role;

ALTER TABLE public.gut_health_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view signed gut reports"
  ON public.gut_health_reports FOR SELECT TO authenticated
  USING (
    signed_at IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.gut_health_assessments a
      WHERE a.id = gut_health_reports.assessment_id AND a.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors view gut reports for their assessments"
  ON public.gut_health_reports FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.gut_health_assessments a
      JOIN public.doctors d ON d.user_id = auth.uid()
      WHERE a.id = gut_health_reports.assessment_id
        AND (a.doctor_id = d.id OR (a.doctor_id IS NULL AND a.status = 'submitted'))
    )
  );

CREATE POLICY "Doctors insert gut reports for their assessments"
  ON public.gut_health_reports FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gut_health_assessments a
      JOIN public.doctors d ON d.user_id = auth.uid()
      WHERE a.id = gut_health_reports.assessment_id
        AND (a.doctor_id = d.id OR (a.doctor_id IS NULL AND a.status = 'submitted'))
    )
  );

CREATE POLICY "Doctors update gut reports for their assessments"
  ON public.gut_health_reports FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.gut_health_assessments a
      JOIN public.doctors d ON d.user_id = auth.uid()
      WHERE a.id = gut_health_reports.assessment_id AND a.doctor_id = d.id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gut_health_assessments a
      JOIN public.doctors d ON d.user_id = auth.uid()
      WHERE a.id = gut_health_reports.assessment_id AND a.doctor_id = d.id
    )
  );

CREATE POLICY "Admins manage gut reports"
  ON public.gut_health_reports FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
