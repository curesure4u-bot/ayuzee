-- Extend panchakarma_sessions with workflow fields needed for therapist logging,
-- Vaidya post-care approval, and adverse event linkage. Idempotent.

ALTER TABLE public.panchakarma_sessions
  ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.panchakarma_courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS therapist_id uuid,
  ADD COLUMN IF NOT EXISTS pre_procedure_assessment jsonb,
  ADD COLUMN IF NOT EXISTS procedure_log jsonb,
  ADD COLUMN IF NOT EXISTS transfer_note text,
  ADD COLUMN IF NOT EXISTS post_procedure_care_plan text,
  ADD COLUMN IF NOT EXISTS post_care_approved_by uuid,
  ADD COLUMN IF NOT EXISTS post_care_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS adverse_event_flag boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_pk_sessions_status ON public.panchakarma_sessions(status);
CREATE INDEX IF NOT EXISTS idx_pk_sessions_vaidya ON public.panchakarma_sessions(vaidya_id);
CREATE INDEX IF NOT EXISTS idx_pk_sessions_course ON public.panchakarma_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_pk_sessions_adverse ON public.panchakarma_sessions(adverse_event_flag) WHERE adverse_event_flag = true;