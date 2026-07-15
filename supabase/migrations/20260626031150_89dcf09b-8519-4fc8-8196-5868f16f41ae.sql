
-- hms_ward_beds: restrict to admin/doctor
DROP POLICY IF EXISTS beds_authn_select ON public.hms_ward_beds;
DROP POLICY IF EXISTS beds_authn_update ON public.hms_ward_beds;

CREATE POLICY beds_staff_select ON public.hms_ward_beds
  FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()) OR public.has_role(auth.uid(), 'doctor'::public.app_role));

CREATE POLICY beds_staff_update ON public.hms_ward_beds
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_super(auth.uid()) OR public.has_role(auth.uid(), 'doctor'::public.app_role))
  WITH CHECK (public.is_admin_or_super(auth.uid()) OR public.has_role(auth.uid(), 'doctor'::public.app_role));

-- gam_user_stats: owner-only direct reads
DROP POLICY IF EXISTS "Stats visible to authenticated (leaderboard)" ON public.gam_user_stats;

CREATE POLICY "Users view own stats" ON public.gam_user_stats
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_or_super(auth.uid()));

-- Safe leaderboard function (no user_id leak)
CREATE OR REPLACE FUNCTION public.gam_get_leaderboard(_limit int DEFAULT 50)
RETURNS TABLE(rank int, display_name text, total_points int, level_number int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (row_number() OVER (ORDER BY s.total_points DESC))::int AS rank,
    COALESCE(NULLIF(split_part(COALESCE(p.full_name,''),' ',1),''), 'Member') AS display_name,
    s.total_points,
    s.level_number
  FROM public.gam_user_stats s
  LEFT JOIN public.profiles p ON p.user_id = s.user_id
  ORDER BY s.total_points DESC
  LIMIT GREATEST(1, LEAST(_limit, 100));
$$;

REVOKE ALL ON FUNCTION public.gam_get_leaderboard(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gam_get_leaderboard(int) TO authenticated;

-- Lock down anon-executable SECURITY DEFINER function
REVOKE EXECUTE ON FUNCTION public.hms_increment_suggestion_usage(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hms_increment_suggestion_usage(uuid) TO authenticated;
