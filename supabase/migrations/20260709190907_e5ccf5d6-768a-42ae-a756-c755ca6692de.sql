REVOKE ALL ON FUNCTION public.prevent_patient_appointment_financial_tampering() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_customer_order_financial_tampering() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_customer_therapy_booking_financial_tampering() FROM PUBLIC, anon, authenticated;