
-- =========================================================
-- AI Prescription Draft + Approval audit tables
-- =========================================================

CREATE TABLE public.ai_prescription_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_record_table TEXT,
  patient_record_id UUID,
  consultation_id UUID,
  ayush_system TEXT NOT NULL CHECK (ayush_system IN ('ayurveda','homeopathy','unani','siddha','yoga','general')),
  input_diagnosis TEXT NOT NULL,
  input_history_summary TEXT,
  input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_response_raw TEXT NOT NULL,
  ai_response_structured JSONB NOT NULL DEFAULT '[]'::jsonb,
  model TEXT,
  tokens_used JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','discarded')),
  approved_prescription_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_rx_drafts_doctor ON public.ai_prescription_drafts(doctor_user_id, created_at DESC);
CREATE INDEX idx_ai_rx_drafts_patient_user ON public.ai_prescription_drafts(patient_user_id) WHERE patient_user_id IS NOT NULL;
CREATE INDEX idx_ai_rx_drafts_patient_record ON public.ai_prescription_drafts(patient_record_table, patient_record_id) WHERE patient_record_id IS NOT NULL;
CREATE INDEX idx_ai_rx_drafts_consultation ON public.ai_prescription_drafts(consultation_id) WHERE consultation_id IS NOT NULL;

-- Immutability: no UPDATE/DELETE for authenticated
GRANT SELECT, INSERT ON public.ai_prescription_drafts TO authenticated;
GRANT ALL ON public.ai_prescription_drafts TO service_role;

ALTER TABLE public.ai_prescription_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor can insert own draft"
  ON public.ai_prescription_drafts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE POLICY "Doctor can read own drafts"
  ON public.ai_prescription_drafts FOR SELECT TO authenticated
  USING (auth.uid() = doctor_user_id);

CREATE POLICY "Patient can read approved drafts about them"
  ON public.ai_prescription_drafts FOR SELECT TO authenticated
  USING (patient_user_id = auth.uid() AND status = 'approved');

CREATE POLICY "Admins read all drafts"
  ON public.ai_prescription_drafts FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

-- =========================================================

CREATE TABLE public.ai_prescription_approved (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES public.ai_prescription_drafts(id) ON DELETE RESTRICT,
  supersedes_id UUID REFERENCES public.ai_prescription_approved(id) ON DELETE SET NULL,
  doctor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name_snapshot TEXT NOT NULL,
  patient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_record_table TEXT,
  patient_record_id UUID,
  consultation_id UUID,
  ayush_system TEXT NOT NULL,
  final_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  final_notes TEXT,
  diff_from_draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  approved_by_checkbox BOOLEAN NOT NULL,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  signature_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT must_be_explicitly_approved CHECK (approved_by_checkbox = true)
);

CREATE INDEX idx_ai_rx_approved_doctor ON public.ai_prescription_approved(doctor_user_id, approved_at DESC);
CREATE INDEX idx_ai_rx_approved_patient_user ON public.ai_prescription_approved(patient_user_id) WHERE patient_user_id IS NOT NULL;
CREATE INDEX idx_ai_rx_approved_patient_record ON public.ai_prescription_approved(patient_record_table, patient_record_id) WHERE patient_record_id IS NOT NULL;
CREATE INDEX idx_ai_rx_approved_draft ON public.ai_prescription_approved(draft_id);

GRANT SELECT, INSERT ON public.ai_prescription_approved TO authenticated;
GRANT ALL ON public.ai_prescription_approved TO service_role;

ALTER TABLE public.ai_prescription_approved ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor can approve own draft"
  ON public.ai_prescription_approved FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = doctor_user_id
    AND approved_by_checkbox = true
    AND EXISTS (
      SELECT 1 FROM public.ai_prescription_drafts d
      WHERE d.id = draft_id AND d.doctor_user_id = auth.uid()
    )
  );

CREATE POLICY "Doctor can read own approved"
  ON public.ai_prescription_approved FOR SELECT TO authenticated
  USING (auth.uid() = doctor_user_id);

CREATE POLICY "Patient can read own approved"
  ON public.ai_prescription_approved FOR SELECT TO authenticated
  USING (patient_user_id = auth.uid());

CREATE POLICY "Admins read all approved"
  ON public.ai_prescription_approved FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

-- =========================================================
-- Link back-reference: mark draft as approved when approval row is inserted
-- =========================================================

CREATE OR REPLACE FUNCTION public.ai_rx_mark_draft_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ai_prescription_drafts
    SET status = 'approved',
        approved_prescription_id = NEW.id
    WHERE id = NEW.draft_id;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_ai_rx_mark_draft_approved
AFTER INSERT ON public.ai_prescription_approved
FOR EACH ROW EXECUTE FUNCTION public.ai_rx_mark_draft_approved();
