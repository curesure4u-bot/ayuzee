-- Phase 7: feature flags for incomplete/placeholder features + public read access

GRANT SELECT ON public.feature_flags TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can read feature flags" ON public.feature_flags;
CREATE POLICY "Anyone can read feature flags"
  ON public.feature_flags FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.feature_flags (key, enabled, description) VALUES
  ('atmri_campaigns_enabled', false, 'ATMRI Active Campaigns pages'),
  ('atmri_csr_enabled', false, 'ATMRI CSR Partnerships pages'),
  ('atmri_impact_dashboard_enabled', false, 'ATMRI Impact Dashboard pages'),
  ('atmri_doctor_leaderboard_enabled', false, 'ATMRI Doctor Leaderboard pages'),
  ('symptom_checker_enabled', false, 'Public AI symptom checker'),
  ('nadi_pareeksha_enabled', false, 'Nadi Pareeksha diagnosis card'),
  ('admin_roadmap_enabled', false, 'Admin Super App Roadmap (internal)'),
  ('hms_pharmacy_orders_enabled', false, 'Admin HMS pharmacy orders placeholder'),
  ('hms_ip_admissions_enabled', false, 'Admin HMS IP admissions placeholder'),
  ('vitals_tracking_enabled', false, 'Patient dashboard vitals tracker'),
  ('gamification_portal_enabled', false, 'Gamification portal routes'),
  ('app_waitlist_enabled', false, 'Footer mobile app waitlist strip'),
  ('therapist_schedule_enabled', false, 'Therapist weekly availability scheduler')
ON CONFLICT (key) DO NOTHING;
