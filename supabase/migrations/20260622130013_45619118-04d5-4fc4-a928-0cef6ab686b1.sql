
-- 1. revenue_split_config: admin-only
DROP POLICY IF EXISTS "Authenticated read split config" ON public.revenue_split_config;

-- 2. atmri_partner_hospitals: replace public-everything with safe view
DROP POLICY IF EXISTS "public_hospitals" ON public.atmri_partner_hospitals;

CREATE OR REPLACE VIEW public.atmri_partner_hospitals_public
WITH (security_invoker = on) AS
SELECT id, hospital_name, hospital_type, address, state, city,
       beds_reserved_for_atmri, discount_percent, is_active, created_at
FROM public.atmri_partner_hospitals
WHERE is_active = true;

GRANT SELECT ON public.atmri_partner_hospitals_public TO anon, authenticated;

-- 3. atmri_sponsored_cases: drop broad authenticated read, add PII-free public view
DROP POLICY IF EXISTS "Authenticated read approved cases" ON public.atmri_sponsored_cases;

CREATE OR REPLACE VIEW public.atmri_sponsored_cases_public
WITH (security_invoker = on) AS
SELECT id, status, medicines_cost, created_at,
       assigned_doctor_user_id, doctor_countersigned
FROM public.atmri_sponsored_cases
WHERE status IN ('approved','in_treatment','completed');

GRANT SELECT ON public.atmri_sponsored_cases_public TO anon, authenticated;

-- 4. gam_certificates: drop blanket public read, add verification view
DROP POLICY IF EXISTS "Public can verify by certificate_no" ON public.gam_certificates;

CREATE OR REPLACE VIEW public.gam_certificates_public
WITH (security_invoker = on) AS
SELECT id, certificate_no, certificate_type, title, subtitle,
       recipient_name, role, issued_at
FROM public.gam_certificates;

GRANT SELECT ON public.gam_certificates_public TO anon, authenticated;
