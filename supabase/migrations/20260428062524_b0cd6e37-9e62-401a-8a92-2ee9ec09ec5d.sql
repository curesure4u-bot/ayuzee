-- Reception queue / token system
CREATE TABLE IF NOT EXISTS public.vaidya_queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  token_no INT NOT NULL,
  token_date DATE NOT NULL DEFAULT CURRENT_DATE,
  patient_name TEXT NOT NULL,
  phone TEXT,
  age INT,
  gender TEXT,
  visit_type TEXT NOT NULL DEFAULT 'walk_in', -- walk_in | appointment | follow_up | emergency
  priority TEXT NOT NULL DEFAULT 'normal', -- normal | urgent | vip
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting | in_consultation | completed | cancelled | no_show
  appointment_id UUID,
  patient_user_id UUID,
  vaidya_patient_id UUID,
  called_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_vaidya_token_per_day
  ON public.vaidya_queue_tokens(doctor_user_id, token_date, token_no);

CREATE INDEX IF NOT EXISTS idx_vaidya_queue_doctor_date
  ON public.vaidya_queue_tokens(doctor_user_id, token_date, status);

ALTER TABLE public.vaidya_queue_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor manages own queue tokens"
  ON public.vaidya_queue_tokens
  FOR ALL
  USING (auth.uid() = doctor_user_id OR auth.uid() = created_by)
  WITH CHECK (auth.uid() = doctor_user_id OR auth.uid() = created_by);

CREATE TRIGGER update_vaidya_queue_tokens_updated_at
  BEFORE UPDATE ON public.vaidya_queue_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.vaidya_queue_tokens;