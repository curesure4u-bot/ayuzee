
-- Attach existing guard triggers (functions already exist)
DROP TRIGGER IF EXISTS appointments_guard_financial ON public.appointments;
CREATE TRIGGER appointments_guard_financial
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.appointments_guard_financial_fields();

DROP TRIGGER IF EXISTS therapy_bookings_guard_financial ON public.therapy_bookings;
CREATE TRIGGER therapy_bookings_guard_financial
BEFORE UPDATE ON public.therapy_bookings
FOR EACH ROW EXECUTE FUNCTION public.therapy_bookings_guard_financial_fields();

DROP TRIGGER IF EXISTS therapy_sessions_guard_financial ON public.therapy_sessions;
CREATE TRIGGER therapy_sessions_guard_financial
BEFORE UPDATE ON public.therapy_sessions
FOR EACH ROW EXECUTE FUNCTION public.therapy_sessions_guard_financial_fields();

-- Create orders guard function + trigger
CREATE OR REPLACE FUNCTION public.orders_guard_financial_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.is_admin_or_super(auth.uid()) OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  NEW.payment_status            := OLD.payment_status;
  NEW.order_status              := OLD.order_status;
  NEW.razorpay_order_id         := OLD.razorpay_order_id;
  NEW.razorpay_payment_id       := OLD.razorpay_payment_id;
  NEW.subtotal                  := OLD.subtotal;
  NEW.shipping                  := OLD.shipping;
  NEW.total                     := OLD.total;
  NEW.total_commission          := OLD.total_commission;
  NEW.doctor_commission         := OLD.doctor_commission;
  NEW.platform_fee              := OLD.platform_fee;
  NEW.commission_distributed    := OLD.commission_distributed;
  NEW.commission_distributed_at := OLD.commission_distributed_at;
  NEW.referring_doctor_id       := OLD.referring_doctor_id;
  NEW.assigned_supplier_id      := OLD.assigned_supplier_id;
  NEW.delhivery_waybill         := OLD.delhivery_waybill;
  NEW.tracking_number           := OLD.tracking_number;
  NEW.courier_partner           := OLD.courier_partner;
  NEW.shipment_id               := OLD.shipment_id;
  NEW.dispatched_at             := OLD.dispatched_at;
  NEW.delivered_at              := OLD.delivered_at;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS orders_guard_financial ON public.orders;
CREATE TRIGGER orders_guard_financial
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.orders_guard_financial_fields();
