-- ---------- appointments ----------
DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
CREATE POLICY "Users can update own appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Doctors can update their appointments" ON public.appointments;
CREATE POLICY "Doctors can update their appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid())
);

CREATE OR REPLACE FUNCTION public.appointments_guard_financial_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_admin_or_super(auth.uid()) OR auth.uid() IS NULL THEN RETURN NEW; END IF;
  NEW.payment_status      := OLD.payment_status;
  NEW.razorpay_order_id   := OLD.razorpay_order_id;
  NEW.razorpay_payment_id := OLD.razorpay_payment_id;
  NEW.fee                 := OLD.fee;
  NEW.status              := OLD.status;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS appointments_guard_financial_fields ON public.appointments;
CREATE TRIGGER appointments_guard_financial_fields
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.appointments_guard_financial_fields();

-- ---------- orders ----------
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
CREATE POLICY "Users can update own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.orders_guard_financial_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_admin_or_super(auth.uid()) OR auth.uid() IS NULL THEN RETURN NEW; END IF;
  NEW.order_status               := OLD.order_status;
  NEW.payment_status             := OLD.payment_status;
  NEW.razorpay_payment_id        := OLD.razorpay_payment_id;
  NEW.razorpay_order_id          := OLD.razorpay_order_id;
  NEW.delivered_at               := OLD.delivered_at;
  NEW.dispatched_at              := OLD.dispatched_at;
  NEW.commission_distributed     := OLD.commission_distributed;
  NEW.commission_distributed_at  := OLD.commission_distributed_at;
  NEW.doctor_commission          := OLD.doctor_commission;
  NEW.total_commission           := OLD.total_commission;
  NEW.platform_fee               := OLD.platform_fee;
  NEW.total                      := OLD.total;
  NEW.subtotal                   := OLD.subtotal;
  NEW.shipping                   := OLD.shipping;
  NEW.referring_doctor_id        := OLD.referring_doctor_id;
  NEW.assigned_supplier_id       := OLD.assigned_supplier_id;
  NEW.tracking_number            := OLD.tracking_number;
  NEW.delhivery_waybill          := OLD.delhivery_waybill;
  NEW.shipment_id                := OLD.shipment_id;
  NEW.courier_partner            := OLD.courier_partner;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS orders_guard_financial_fields ON public.orders;
CREATE TRIGGER orders_guard_financial_fields
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_guard_financial_fields();

-- ---------- therapy_bookings ----------
DROP POLICY IF EXISTS "Users can update own therapy bookings" ON public.therapy_bookings;
CREATE POLICY "Users can update own therapy bookings"
ON public.therapy_bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.therapy_bookings_guard_financial_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_admin_or_super(auth.uid()) OR auth.uid() IS NULL THEN RETURN NEW; END IF;
  NEW.payment_status      := OLD.payment_status;
  NEW.status              := OLD.status;
  NEW.price               := OLD.price;
  NEW.razorpay_order_id   := OLD.razorpay_order_id;
  NEW.razorpay_payment_id := OLD.razorpay_payment_id;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS therapy_bookings_guard_financial_fields ON public.therapy_bookings;
CREATE TRIGGER therapy_bookings_guard_financial_fields
BEFORE UPDATE ON public.therapy_bookings
FOR EACH ROW EXECUTE FUNCTION public.therapy_bookings_guard_financial_fields();

-- ---------- therapy_sessions ----------
DROP POLICY IF EXISTS "Patient updates own session" ON public.therapy_sessions;
CREATE POLICY "Patient updates own session"
ON public.therapy_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = patient_user_id)
WITH CHECK (auth.uid() = patient_user_id);

DROP POLICY IF EXISTS "Doctor updates own session" ON public.therapy_sessions;
CREATE POLICY "Doctor updates own session"
ON public.therapy_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = doctor_user_id)
WITH CHECK (auth.uid() = doctor_user_id);

DROP POLICY IF EXISTS "Therapist updates assigned session" ON public.therapy_sessions;
CREATE POLICY "Therapist updates assigned session"
ON public.therapy_sessions
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.therapists t WHERE t.id = therapy_sessions.therapist_id AND t.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.therapists t WHERE t.id = therapy_sessions.therapist_id AND t.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Venue owner updates venue session" ON public.therapy_sessions;
CREATE POLICY "Venue owner updates venue session"
ON public.therapy_sessions
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.therapy_venues v WHERE v.id = therapy_sessions.venue_id AND v.owner_user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.therapy_venues v WHERE v.id = therapy_sessions.venue_id AND v.owner_user_id = auth.uid())
);

CREATE OR REPLACE FUNCTION public.therapy_sessions_guard_financial_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_admin_or_super(auth.uid()) OR auth.uid() IS NULL THEN RETURN NEW; END IF;
  NEW.payment_status       := OLD.payment_status;
  NEW.platform_fee         := OLD.platform_fee;
  NEW.therapist_earnings   := OLD.therapist_earnings;
  NEW.venue_earnings       := OLD.venue_earnings;
  NEW.doctor_referral_fee  := OLD.doctor_referral_fee;
  NEW.total_amount         := OLD.total_amount;
  NEW.razorpay_order_id    := OLD.razorpay_order_id;
  NEW.razorpay_payment_id  := OLD.razorpay_payment_id;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS therapy_sessions_guard_financial_fields ON public.therapy_sessions;
CREATE TRIGGER therapy_sessions_guard_financial_fields
BEFORE UPDATE ON public.therapy_sessions
FOR EACH ROW EXECUTE FUNCTION public.therapy_sessions_guard_financial_fields();

-- ---------- job_listings ----------
DROP POLICY IF EXISTS "Users can update own unapproved job posts" ON public.job_listings;
CREATE POLICY "Users can update own unapproved job posts"
ON public.job_listings
FOR UPDATE
TO authenticated
USING (auth.uid() = posted_by AND is_approved = false)
WITH CHECK (auth.uid() = posted_by AND is_approved = false);
