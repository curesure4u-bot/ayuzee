
ALTER TABLE public.panchakarma_sessions
  ADD COLUMN IF NOT EXISTS precautions_read_at TIMESTAMPTZ;

CREATE POLICY "pk_sessions_patient_mark_read" ON public.panchakarma_sessions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.panchakarma_course_bookings b
            WHERE b.id = booking_id AND b.patient_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.panchakarma_course_bookings b
            WHERE b.id = booking_id AND b.patient_id = auth.uid())
  );
