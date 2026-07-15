
-- DOCTORS: remove anon SELECT, expose safe view
DROP POLICY IF EXISTS "Approved doctors visible" ON public.doctors;
CREATE POLICY "Approved doctors visible to authenticated"
  ON public.doctors FOR SELECT TO authenticated
  USING (is_approved = true AND public_profile = true);

CREATE OR REPLACE VIEW public.doctors_public
WITH (security_invoker = true) AS
SELECT id, full_name, specialization, category, city, clinic_name,
       experience_years, consultation_fee, languages, bio, rating, total_reviews,
       video_available, in_clinic_available, avatar_url, gender, registration_number,
       is_approved, public_profile, is_verified, created_at
FROM public.doctors
WHERE is_approved = true AND public_profile = true;
GRANT SELECT ON public.doctors_public TO anon, authenticated;

-- THERAPISTS: drop anon public policy, expose safe view
DROP POLICY IF EXISTS "Approved therapists public" ON public.therapists;

CREATE OR REPLACE VIEW public.therapists_public
WITH (security_invoker = true) AS
SELECT id, full_name, photo_url, city, state, gender, years_experience,
       allowed_therapies, is_verified, verification_status, is_available,
       rating, total_sessions, certificate_number, certifying_body, created_at
FROM public.therapists
WHERE is_verified = true AND verification_status = 'approved';
GRANT SELECT ON public.therapists_public TO anon, authenticated;

-- NETWORK_PARTNERS: drop broad authenticated PII read; expose safe view
DROP POLICY IF EXISTS "Authenticated reads approved partners" ON public.network_partners;

CREATE OR REPLACE VIEW public.network_partners_public
WITH (security_invoker = true) AS
SELECT id, partner_type, name, city, state, pincode, address,
       services, specialities, about, image_url, is_approved, rating, created_at
FROM public.network_partners
WHERE is_approved = true;
GRANT SELECT ON public.network_partners_public TO anon, authenticated;

-- SERVICE_PROVIDERS: drop anon public policy; expose safe view
DROP POLICY IF EXISTS "Approved providers public" ON public.service_providers;

CREATE OR REPLACE VIEW public.service_providers_public
WITH (security_invoker = true) AS
SELECT id, provider_type, business_name, city, state, pincode, address,
       about, logo_url, cover_image_url, is_approved, is_verified,
       rating, total_reviews, created_at
FROM public.service_providers
WHERE is_approved = true;
GRANT SELECT ON public.service_providers_public TO anon, authenticated;

-- DOCTOR_CLINICS: drop anon public policy; expose safe view (no GST/phone/legal entity)
DROP POLICY IF EXISTS "Active clinics public" ON public.doctor_clinics;

CREATE OR REPLACE VIEW public.doctor_clinics_public
WITH (security_invoker = true) AS
SELECT id, doctor_user_id, clinic_name, address_line1, city, state, pincode,
       consultation_fee, timings, services, is_active, about, locality, country,
       cover_image_url, logo_url, intro_video_url, show_legal_entity,
       CASE WHEN show_legal_entity THEN legal_entity_name ELSE NULL END AS legal_entity_name,
       consultation_settings, created_at
FROM public.doctor_clinics
WHERE is_active = true;
GRANT SELECT ON public.doctor_clinics_public TO anon, authenticated;

-- THERAPY_VENUES: drop anon public policies; expose safe view
DROP POLICY IF EXISTS "Public reads verified venues" ON public.therapy_venues;
DROP POLICY IF EXISTS "Verified active venues public" ON public.therapy_venues;

CREATE OR REPLACE VIEW public.therapy_venues_public
WITH (security_invoker = true) AS
SELECT id, name, type, address_line1, city, state, pincode,
       lat, lng, latitude, longitude, photo_urls, photos,
       available_therapies, rooms, is_verified, is_active,
       rating, hourly_rate, created_at
FROM public.therapy_venues
WHERE is_verified = true AND is_active = true AND is_suspended = false;
GRANT SELECT ON public.therapy_venues_public TO anon, authenticated;
