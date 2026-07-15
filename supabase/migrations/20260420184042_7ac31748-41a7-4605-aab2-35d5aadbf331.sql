
-- Patient feedback
CREATE TABLE public.patient_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL,
  patient_user_id UUID NOT NULL,
  appointment_id UUID,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient manages own feedback"
  ON public.patient_feedback FOR ALL
  USING (auth.uid() = patient_user_id)
  WITH CHECK (auth.uid() = patient_user_id);

CREATE POLICY "Doctor views feedback for self"
  ON public.patient_feedback FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = patient_feedback.doctor_id AND d.user_id = auth.uid()));

CREATE POLICY "Public feedback visible"
  ON public.patient_feedback FOR SELECT
  USING (is_public = true);

CREATE TRIGGER trg_patient_feedback_updated
  BEFORE UPDATE ON public.patient_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_patient_feedback_doctor ON public.patient_feedback(doctor_id);

-- Add appointment link on orders (for Draft Orders flow)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS appointment_id UUID;
CREATE INDEX IF NOT EXISTS idx_orders_appointment ON public.orders(appointment_id);

-- Doctor read access to their patients' orders
CREATE POLICY "Doctor views orders of own patients"
  ON public.orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE a.user_id = orders.user_id AND d.user_id = auth.uid()
  ));

CREATE POLICY "Doctor views items of own patients orders"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.appointments a ON a.user_id = o.user_id
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE o.id = order_items.order_id AND d.user_id = auth.uid()
  ));
