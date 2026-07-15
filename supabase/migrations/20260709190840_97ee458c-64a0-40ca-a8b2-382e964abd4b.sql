CREATE OR REPLACE FUNCTION public.prevent_patient_appointment_financial_tampering()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role'
     OR public.has_role(auth.uid(), 'admin'::public.app_role)
  THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = OLD.user_id AND (
    NEW.payment_status IS DISTINCT FROM OLD.payment_status OR
    NEW.fee IS DISTINCT FROM OLD.fee OR
    NEW.status IS DISTINCT FROM OLD.status OR
    NEW.razorpay_order_id IS DISTINCT FROM OLD.razorpay_order_id OR
    NEW.razorpay_payment_id IS DISTINCT FROM OLD.razorpay_payment_id
  ) THEN
    RAISE EXCEPTION 'Patients cannot update appointment payment, fee, or status fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_patient_appointment_financial_tampering_trigger ON public.appointments;
CREATE TRIGGER prevent_patient_appointment_financial_tampering_trigger
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.prevent_patient_appointment_financial_tampering();

CREATE OR REPLACE FUNCTION public.prevent_customer_order_financial_tampering()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role'
     OR public.has_role(auth.uid(), 'admin'::public.app_role)
     OR public.has_role(auth.uid(), 'orders_admin'::public.app_role)
  THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = OLD.user_id AND (
    NEW.subtotal IS DISTINCT FROM OLD.subtotal OR
    NEW.shipping IS DISTINCT FROM OLD.shipping OR
    NEW.total IS DISTINCT FROM OLD.total OR
    NEW.payment_status IS DISTINCT FROM OLD.payment_status OR
    NEW.order_status IS DISTINCT FROM OLD.order_status OR
    NEW.razorpay_order_id IS DISTINCT FROM OLD.razorpay_order_id OR
    NEW.razorpay_payment_id IS DISTINCT FROM OLD.razorpay_payment_id OR
    NEW.total_commission IS DISTINCT FROM OLD.total_commission OR
    NEW.doctor_commission IS DISTINCT FROM OLD.doctor_commission OR
    NEW.platform_fee IS DISTINCT FROM OLD.platform_fee OR
    NEW.commission_distributed IS DISTINCT FROM OLD.commission_distributed OR
    NEW.commission_distributed_at IS DISTINCT FROM OLD.commission_distributed_at OR
    NEW.referring_doctor_id IS DISTINCT FROM OLD.referring_doctor_id
  ) THEN
    RAISE EXCEPTION 'Customers cannot update order payment, totals, status, or commission fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_customer_order_financial_tampering_trigger ON public.orders;
CREATE TRIGGER prevent_customer_order_financial_tampering_trigger
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.prevent_customer_order_financial_tampering();

CREATE OR REPLACE FUNCTION public.prevent_customer_therapy_booking_financial_tampering()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role'
     OR public.has_role(auth.uid(), 'admin'::public.app_role)
  THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = OLD.user_id AND (
    NEW.price IS DISTINCT FROM OLD.price OR
    NEW.payment_status IS DISTINCT FROM OLD.payment_status OR
    NEW.status IS DISTINCT FROM OLD.status OR
    NEW.razorpay_order_id IS DISTINCT FROM OLD.razorpay_order_id OR
    NEW.razorpay_payment_id IS DISTINCT FROM OLD.razorpay_payment_id
  ) THEN
    RAISE EXCEPTION 'Customers cannot update therapy booking price, payment, or status fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_customer_therapy_booking_financial_tampering_trigger ON public.therapy_bookings;
CREATE TRIGGER prevent_customer_therapy_booking_financial_tampering_trigger
BEFORE UPDATE ON public.therapy_bookings
FOR EACH ROW
EXECUTE FUNCTION public.prevent_customer_therapy_booking_financial_tampering();