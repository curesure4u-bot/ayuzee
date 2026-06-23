
DROP VIEW IF EXISTS public.doctors_public CASCADE;
DROP VIEW IF EXISTS public.therapists_public CASCADE;
DROP VIEW IF EXISTS public.therapy_venues_public CASCADE;
DROP VIEW IF EXISTS public.network_partners_public CASCADE;

DROP POLICY IF EXISTS "Approved doctors visible to authenticated" ON public.doctors;
DROP POLICY IF EXISTS "Authenticated reads verified therapists" ON public.therapists;
DROP POLICY IF EXISTS "Applicant views own application" ON public.network_partners;

CREATE VIEW public.doctors_public AS
SELECT id, full_name, specialization, category, city, clinic_name, experience_years,
       consultation_fee, languages, bio, rating, total_reviews, video_available,
       in_clinic_available, avatar_url, gender, is_approved, is_verified,
       verification_status, profile_completion, public_profile, created_at
FROM public.doctors
WHERE is_approved = true AND public_profile = true AND COALESCE(is_suspended,false) = false;
GRANT SELECT ON public.doctors_public TO anon, authenticated;

CREATE VIEW public.therapists_public AS
SELECT id, full_name, gender, photo_url, years_experience, allowed_therapies,
       is_verified, verification_status, is_available, rating, total_sessions,
       city, state, created_at
FROM public.therapists
WHERE is_verified = true
  AND COALESCE(is_suspended,false) = false
  AND COALESCE(is_banned,false) = false;
GRANT SELECT ON public.therapists_public TO anon, authenticated;

CREATE VIEW public.therapy_venues_public AS
SELECT id, name, type, address_line1, city, state, pincode, lat, lng, latitude, longitude,
       photo_urls, photos, available_therapies, rooms, is_verified, is_active,
       rating, hourly_rate, created_at
FROM public.therapy_venues
WHERE is_verified = true AND is_active = true AND COALESCE(is_suspended,false) = false;
GRANT SELECT ON public.therapy_venues_public TO anon, authenticated;

CREATE VIEW public.network_partners_public AS
SELECT id, partner_type, name, city, state, services, specialities, about,
       image_url, is_approved, rating, created_at
FROM public.network_partners
WHERE is_approved = true;
GRANT SELECT ON public.network_partners_public TO anon, authenticated;

DROP POLICY IF EXISTS "Doctors view feedback on their appointments" ON public.post_consultation_feedback;
CREATE POLICY "Doctors view feedback on their appointments"
  ON public.post_consultation_feedback FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = post_consultation_feedback.doctor_id
      AND d.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Doctors view pre-form for their appointments" ON public.pre_consultation_forms;
CREATE POLICY "Doctors view pre-form for their appointments"
  ON public.pre_consultation_forms FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE a.id = pre_consultation_forms.appointment_id
      AND d.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Service role inserts notification logs" ON public.notification_logs;
CREATE POLICY "Service role inserts notification logs"
  ON public.notification_logs FOR INSERT
  TO service_role
  WITH CHECK (true);
GRANT INSERT, SELECT ON public.notification_logs TO service_role;

DROP POLICY IF EXISTS "Anyone can submit a contact form" ON public.contact_submissions;
CREATE POLICY "Anyone can submit a contact form"
  ON public.contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(COALESCE(name, '')) BETWEEN 2 AND 200
    AND length(COALESCE(email, '')) BETWEEN 3 AND 200
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(COALESCE(message, '')) BETWEEN 5 AND 5000
    AND length(COALESCE(subject, '')) <= 200
  );

ALTER FUNCTION public.get_wallet_balance(uuid) SECURITY INVOKER;
ALTER FUNCTION public.homeo_repertorize(uuid[]) SECURITY INVOKER;
ALTER FUNCTION public.repertorize_case(uuid) SECURITY INVOKER;
