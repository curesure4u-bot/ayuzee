
-- 1) Fix search_path on our own functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;

-- 2) Revoke EXECUTE from public/anon/authenticated on internal SECURITY DEFINER functions
DO $$
DECLARE
  fn text;
  internal_fns text[] := ARRAY[
    'allocate_corpus_on_approval()',
    'assign_vaidya_bill_no()',
    'bump_feed_counts()',
    'create_ayuzee_wallet()',
    'calculate_order_commission(uuid)',
    'credit_commission_to_wallet(uuid, numeric, uuid, uuid)',
    'delete_email(text, bigint)',
    'enqueue_email(text, jsonb)',
    'gam_award(uuid, text, text, integer, text, text, uuid)',
    'gam_bump_claps()',
    'gam_check_badges(uuid)',
    'gam_issue_certificate(uuid, text, text, text, text, text, uuid, jsonb)',
    'gam_next_cert_no(text)',
    'gam_trg_badge_appreciation()',
    'gam_trg_challenge_progress()',
    'gam_trg_consultation()',
    'gam_trg_homeo_followup()',
    'gam_trg_level_up()',
    'gam_trg_lms_progress()',
    'gam_trg_prakriti()',
    'gam_trg_quiz()',
    'gam_trg_therapy_session()',
    'generate_referral_code()',
    'handle_new_user()',
    'move_to_dlq(text, text, bigint, jsonb)',
    'read_email_batch(text, integer, integer)',
    'recalc_product_rating()',
    'sync_ayuzee_balance()',
    'trigger_credit_referral()'
  ];
BEGIN
  FOREACH fn IN ARRAY internal_fns LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', fn);
  END LOOP;
END $$;

-- Keep RLS helpers / client RPCs callable by authenticated only (no anon)
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_admin_or_super(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_admin_or_super(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.gam_redeem_catalog(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.gam_redeem_catalog(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.gam_redeem_to_wallet(integer) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.gam_redeem_to_wallet(integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_wallet_balance(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_wallet_balance(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.homeo_repertorize(uuid[]) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.homeo_repertorize(uuid[]) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.repertorize_case(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.repertorize_case(uuid) TO authenticated, service_role;

-- 3) Fix the always-true INSERT policy on condition_leads
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.condition_leads;
CREATE POLICY "Anyone can submit a lead"
  ON public.condition_leads
  FOR INSERT
  WITH CHECK (
    status = 'new'
    AND char_length(full_name) BETWEEN 2 AND 120
    AND char_length(phone) BETWEEN 6 AND 20
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- 4) Storage: require auth to LIST public buckets (direct public URLs still work)
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
CREATE POLICY "Avatars listable by authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Clinic media read" ON storage.objects;
CREATE POLICY "Clinic media listable by authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'clinic-media');

DROP POLICY IF EXISTS "yoga_media_public_read" ON storage.objects;
CREATE POLICY "Yoga media listable by authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'yoga-media');
