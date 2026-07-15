
CREATE TABLE public.spine_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','ai_drafted','reviewed')),
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  spine_score integer,
  risk_label text,
  has_red_flag boolean NOT NULL DEFAULT false,
  posture_assessment_id uuid REFERENCES public.vaidya_posture_assessments(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.spine_assessments TO authenticated;
GRANT ALL ON public.spine_assessments TO service_role;

ALTER TABLE public.spine_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage spine assessments" ON public.spine_assessments
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Patients view own spine assessments" ON public.spine_assessments
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Patients insert own spine assessments" ON public.spine_assessments
  FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors view assigned spine assessments" ON public.spine_assessments
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.user_id = auth.uid() AND d.id = spine_assessments.doctor_id
  ));

CREATE POLICY "Doctors update assigned spine assessments" ON public.spine_assessments
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.user_id = auth.uid() AND d.id = spine_assessments.doctor_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.user_id = auth.uid() AND d.id = spine_assessments.doctor_id
  ));

CREATE TABLE public.spine_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.spine_assessments(id) ON DELETE CASCADE,
  ai_draft_summary text,
  likely_astg_pattern text,
  vaidya_notes text,
  final_summary text,
  pdf_url text,
  signed_by uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.spine_reports TO authenticated;
GRANT ALL ON public.spine_reports TO service_role;

ALTER TABLE public.spine_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage spine reports" ON public.spine_reports
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Patients view signed spine reports" ON public.spine_reports
  FOR SELECT TO authenticated
  USING (
    signed_at IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.spine_assessments a
      WHERE a.id = spine_reports.assessment_id AND a.patient_id = auth.uid()
    )
  );

CREATE POLICY "Doctors view spine reports for their assessments" ON public.spine_reports
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.spine_assessments a
    JOIN public.doctors d ON d.user_id = auth.uid()
    WHERE a.id = spine_reports.assessment_id
      AND (a.doctor_id = d.id OR (a.doctor_id IS NULL AND a.status = 'submitted'))
  ));

CREATE POLICY "Doctors insert spine reports for their assessments" ON public.spine_reports
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.spine_assessments a
    JOIN public.doctors d ON d.user_id = auth.uid()
    WHERE a.id = spine_reports.assessment_id
      AND (a.doctor_id = d.id OR (a.doctor_id IS NULL AND a.status = 'submitted'))
  ));

CREATE POLICY "Doctors update spine reports for their assessments" ON public.spine_reports
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.spine_assessments a
    JOIN public.doctors d ON d.user_id = auth.uid()
    WHERE a.id = spine_reports.assessment_id AND a.doctor_id = d.id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.spine_assessments a
    JOIN public.doctors d ON d.user_id = auth.uid()
    WHERE a.id = spine_reports.assessment_id AND a.doctor_id = d.id
  ));
