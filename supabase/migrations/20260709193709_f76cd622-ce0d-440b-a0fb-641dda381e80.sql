-- Fix payment/verification tampering findings:
-- appointments_payment_status_tampering
-- doctors_self_approval_escalation
-- orders_payment_status_tampering
--
-- These BEFORE UPDATE triggers allow only admins or service_role to mutate
-- sensitive financial / approval / fulfilment columns. Regular authenticated
-- users (patients, doctors, customers) can still update their own rows, but
-- not the protected columns.

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

-- ---------- doctors ----------
create or replace function public.prevent_doctors_self_approval()
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
     or old.verification_status is distinct from new.verification_status
     or old.commission_rate is distinct from new.commission_rate then
    raise exception 'Doctors cannot self-approve verification or commission status';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_doctors_self_approval() from public;
revoke all on function public.prevent_doctors_self_approval() from anon;
grant execute on function public.prevent_doctors_self_approval() to authenticated;
grant execute on function public.prevent_doctors_self_approval() to service_role;

drop trigger if exists doctors_prevent_self_approval on public.doctors;
create trigger doctors_prevent_self_approval
before update on public.doctors
for each row
execute function public.prevent_doctors_self_approval();

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
