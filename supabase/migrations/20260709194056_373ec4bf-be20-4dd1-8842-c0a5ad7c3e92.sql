-- Fix privilege escalation / payment tampering findings.
-- Adds BEFORE UPDATE triggers that prevent non-admin, non-service_role users
-- from mutating sensitive financial, approval, verification, or fulfilment columns.
-- Regular users can still update their own rows, but not the protected fields.

-- ---------- appointments ----------
create or replace function public.prevent_appointments_patient_tamper()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'service_role' or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;

  if old.payment_status is distinct from new.payment_status
     or old.fee is distinct from new.fee
     or old.status is distinct from new.status
     or old.razorpay_order_id is distinct from new.razorpay_order_id
     or old.razorpay_payment_id is distinct from new.razorpay_payment_id then
    raise exception 'Non-admin users cannot modify appointment payment/fee/status fields';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_appointments_patient_tamper() from public;
revoke all on function public.prevent_appointments_patient_tamper() from anon;
grant execute on function public.prevent_appointments_patient_tamper() to authenticated;
grant execute on function public.prevent_appointments_patient_tamper() to service_role;

drop trigger if exists appointments_prevent_patient_tamper on public.appointments;
create trigger appointments_prevent_patient_tamper
before update on public.appointments
for each row
execute function public.prevent_appointments_patient_tamper();

-- ---------- orders ----------
create or replace function public.prevent_orders_customer_tamper()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'service_role' or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;

  if old.payment_status is distinct from new.payment_status
     or old.order_status is distinct from new.order_status
     or old.total is distinct from new.total
     or old.subtotal is distinct from new.subtotal
     or old.shipping is distinct from new.shipping
     or old.total_commission is distinct from new.total_commission
     or old.doctor_commission is distinct from new.doctor_commission
     or old.platform_fee is distinct from new.platform_fee
     or old.commission_distributed is distinct from new.commission_distributed
     or old.commission_distributed_at is distinct from new.commission_distributed_at
     or old.razorpay_order_id is distinct from new.razorpay_order_id
     or old.razorpay_payment_id is distinct from new.razorpay_payment_id
     or old.assigned_supplier_id is distinct from new.assigned_supplier_id
     or old.dispatched_at is distinct from new.dispatched_at
     or old.delivered_at is distinct from new.delivered_at
     or old.delhivery_waybill is distinct from new.delhivery_waybill
     or old.tracking_number is distinct from new.tracking_number
     or old.courier_partner is distinct from new.courier_partner
     or old.shipment_id is distinct from new.shipment_id then
    raise exception 'Customers cannot modify order payment/fulfilment/financial fields';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_orders_customer_tamper() from public;
revoke all on function public.prevent_orders_customer_tamper() from anon;
grant execute on function public.prevent_orders_customer_tamper() to authenticated;
grant execute on function public.prevent_orders_customer_tamper() to service_role;

drop trigger if exists orders_prevent_customer_tamper on public.orders;
create trigger orders_prevent_customer_tamper
before update on public.orders
for each row
execute function public.prevent_orders_customer_tamper();

-- ---------- therapy_bookings ----------
create or replace function public.prevent_therapy_bookings_patient_tamper()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'service_role' or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;

  if old.price is distinct from new.price
     or old.payment_status is distinct from new.payment_status
     or old.razorpay_order_id is distinct from new.razorpay_order_id
     or old.razorpay_payment_id is distinct from new.razorpay_payment_id then
    raise exception 'Non-admin users cannot modify therapy booking price/payment fields';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_therapy_bookings_patient_tamper() from public;
revoke all on function public.prevent_therapy_bookings_patient_tamper() from anon;
grant execute on function public.prevent_therapy_bookings_patient_tamper() to authenticated;
grant execute on function public.prevent_therapy_bookings_patient_tamper() to service_role;

drop trigger if exists therapy_bookings_prevent_patient_tamper on public.therapy_bookings;
create trigger therapy_bookings_prevent_patient_tamper
before update on public.therapy_bookings
for each row
execute function public.prevent_therapy_bookings_patient_tamper();

-- ---------- therapy_sessions ----------
create or replace function public.prevent_therapy_sessions_financial_tamper()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'service_role' or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;

  if old.total_amount is distinct from new.total_amount
     or old.platform_fee is distinct from new.platform_fee
     or old.therapist_earnings is distinct from new.therapist_earnings
     or old.venue_earnings is distinct from new.venue_earnings
     or old.doctor_referral_fee is distinct from new.doctor_referral_fee
     or old.payment_status is distinct from new.payment_status
     or old.razorpay_order_id is distinct from new.razorpay_order_id
     or old.razorpay_payment_id is distinct from new.razorpay_payment_id then
    raise exception 'Non-admin users cannot modify therapy session financial/payment fields';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_therapy_sessions_financial_tamper() from public;
revoke all on function public.prevent_therapy_sessions_financial_tamper() from anon;
grant execute on function public.prevent_therapy_sessions_financial_tamper() to authenticated;
grant execute on function public.prevent_therapy_sessions_financial_tamper() to service_role;

drop trigger if exists therapy_sessions_prevent_financial_tamper on public.therapy_sessions;
create trigger therapy_sessions_prevent_financial_tamper
before update on public.therapy_sessions
for each row
execute function public.prevent_therapy_sessions_financial_tamper();

-- ---------- service_providers ----------
create or replace function public.prevent_service_providers_self_approval()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'service_role' or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;

  if old.is_approved is distinct from new.is_approved
     or old.is_verified is distinct from new.is_verified
     or old.verification_status is distinct from new.verification_status then
    raise exception 'Service providers cannot self-approve or self-verify their listing';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_service_providers_self_approval() from public;
revoke all on function public.prevent_service_providers_self_approval() from anon;
grant execute on function public.prevent_service_providers_self_approval() to authenticated;
grant execute on function public.prevent_service_providers_self_approval() to service_role;

drop trigger if exists service_providers_prevent_self_approval on public.service_providers;
create trigger service_providers_prevent_self_approval
before update on public.service_providers
for each row
execute function public.prevent_service_providers_self_approval();

-- ---------- therapists ----------
create or replace function public.prevent_therapists_self_verification()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'service_role' or public.has_role(auth.uid(), 'admin') then
    return new;
  end if;

  if old.is_verified is distinct from new.is_verified
     or old.verification_status is distinct from new.verification_status then
    raise exception 'Therapists cannot self-verify their credentials';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_therapists_self_verification() from public;
revoke all on function public.prevent_therapists_self_verification() from anon;
grant execute on function public.prevent_therapists_self_verification() to authenticated;
grant execute on function public.prevent_therapists_self_verification() to service_role;

drop trigger if exists therapists_prevent_self_verification on public.therapists;
create trigger therapists_prevent_self_verification
before update on public.therapists
for each row
execute function public.prevent_therapists_self_verification();
