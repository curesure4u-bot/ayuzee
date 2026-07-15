REVOKE EXECUTE ON FUNCTION public.appointments_guard_financial_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.orders_guard_financial_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.therapy_bookings_guard_financial_fields() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.therapy_sessions_guard_financial_fields() FROM PUBLIC, anon, authenticated;