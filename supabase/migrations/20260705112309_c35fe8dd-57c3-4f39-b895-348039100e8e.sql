CREATE TABLE public.report_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_bucket text NOT NULL,
  source_path text NOT NULL,
  source_ref_table text,
  source_ref_id uuid,
  summary_markdown text NOT NULL,
  key_findings jsonb,
  abnormal_flags jsonb,
  followup_questions jsonb,
  model text,
  tokens_used integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.report_summaries TO authenticated;
GRANT ALL ON public.report_summaries TO service_role;

ALTER TABLE public.report_summaries ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_report_summaries_source ON public.report_summaries(source_bucket, source_path);
CREATE INDEX idx_report_summaries_ref ON public.report_summaries(source_ref_table, source_ref_id);
CREATE INDEX idx_report_summaries_patient ON public.report_summaries(patient_id, created_at DESC);

CREATE POLICY "Creator can view own summaries"
  ON public.report_summaries FOR SELECT TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can insert summaries"
  ON public.report_summaries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Patient can view own summaries"
  ON public.report_summaries FOR SELECT TO authenticated
  USING (patient_id IS NOT NULL AND auth.uid() = patient_id);

CREATE POLICY "Admins can view all summaries"
  ON public.report_summaries FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can delete summaries"
  ON public.report_summaries FOR DELETE TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Doctors can view summaries for their patients"
  ON public.report_summaries FOR SELECT TO authenticated
  USING (
    patient_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.appointments a
      JOIN public.doctors d ON d.id = a.doctor_id
      WHERE a.user_id = report_summaries.patient_id
        AND d.user_id = auth.uid()
    )
  );