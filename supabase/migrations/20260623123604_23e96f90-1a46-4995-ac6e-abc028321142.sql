DROP VIEW IF EXISTS public.atmri_sponsored_cases_public;
DROP VIEW IF EXISTS public.atmri_partner_hospitals_public;
DROP VIEW IF EXISTS public.gam_certificates_public;

CREATE VIEW public.atmri_sponsored_cases_public WITH (security_invoker = on) AS
SELECT id, patient_name, patient_age, patient_gender, patient_city, patient_state,
       patient_photo_url, patient_story, condition_name, condition_category,
       treatment_plan, treatment_duration_days, is_urgent,
       treatment_location, total_sessions_planned, sessions_completed,
       status, completion_notes, patient_outcome_photo_url,
       created_at, updated_at
FROM public.atmri_sponsored_cases
WHERE status IN ('approved','in_treatment','completed');
GRANT SELECT ON public.atmri_sponsored_cases_public TO anon, authenticated;

CREATE VIEW public.atmri_partner_hospitals_public WITH (security_invoker = on) AS
SELECT id, hospital_name, hospital_type, address, city, state,
       discount_percent, beds_reserved_for_atmri, is_active, notes, created_at
FROM public.atmri_partner_hospitals
WHERE is_active = true;
GRANT SELECT ON public.atmri_partner_hospitals_public TO anon, authenticated;

CREATE VIEW public.gam_certificates_public WITH (security_invoker = on) AS
SELECT id, recipient_name, role, certificate_type, title, subtitle,
       certificate_no, reference_table, reference_id, issued_at, metadata, created_at
FROM public.gam_certificates;
GRANT SELECT ON public.gam_certificates_public TO anon, authenticated;