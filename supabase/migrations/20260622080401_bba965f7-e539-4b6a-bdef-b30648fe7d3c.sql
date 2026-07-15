
DROP POLICY IF EXISTS "RSVP public read counts" ON public.webinar_rsvps;
CREATE POLICY "Users read own RSVPs" ON public.webinar_rsvps FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all RSVPs" ON public.webinar_rsvps FOR SELECT TO authenticated USING (public.is_admin_or_super(auth.uid()));

DROP POLICY IF EXISTS "Public reads split config" ON public.revenue_split_config;
CREATE POLICY "Authenticated read split config" ON public.revenue_split_config FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "public_read_cases" ON public.atmri_sponsored_cases;
CREATE POLICY "Authenticated read approved cases" ON public.atmri_sponsored_cases FOR SELECT TO authenticated
  USING (status IN ('approved','in_treatment','completed'));

DROP POLICY IF EXISTS "Public reads verified therapists" ON public.therapists;
CREATE POLICY "Authenticated reads verified therapists" ON public.therapists FOR SELECT TO authenticated USING (is_verified = true);

DROP POLICY IF EXISTS "Approved partners public" ON public.network_partners;
CREATE POLICY "Authenticated reads approved partners" ON public.network_partners FOR SELECT TO authenticated USING (is_approved = true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.vaidya_queue_tokens;
EXCEPTION WHEN OTHERS THEN NULL; END $$;
