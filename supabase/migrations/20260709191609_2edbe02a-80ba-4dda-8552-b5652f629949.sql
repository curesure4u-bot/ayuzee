
create or replace function public.prevent_patient_therapy_session_financial_tamper()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() <> old.patient_user_id then
    return new;
  end if;
  if public.has_role(auth.uid(), 'admin'::app_role) then
    return new;
  end if;

  if new.payment_status is distinct from old.payment_status
     or new.total_amount is distinct from old.total_amount
     or new.therapist_earnings is distinct from old.therapist_earnings
     or new.venue_earnings is distinct from old.venue_earnings
     or new.doctor_referral_fee is distinct from old.doctor_referral_fee
     or new.patient_user_id is distinct from old.patient_user_id
     or new.doctor_user_id is distinct from old.doctor_user_id
     or new.therapist_id is distinct from old.therapist_id
     or new.venue_id is distinct from old.venue_id then
    raise exception 'Patients cannot modify financial or assignment fields on therapy_sessions';
  end if;

  return new;
end;
$$;

revoke execute on function public.prevent_patient_therapy_session_financial_tamper() from public;
revoke execute on function public.prevent_patient_therapy_session_financial_tamper() from anon;
revoke execute on function public.prevent_patient_therapy_session_financial_tamper() from authenticated;

drop trigger if exists trg_prevent_patient_therapy_session_financial_tamper on public.therapy_sessions;
create trigger trg_prevent_patient_therapy_session_financial_tamper
before update on public.therapy_sessions
for each row execute function public.prevent_patient_therapy_session_financial_tamper();
