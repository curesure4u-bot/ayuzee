-- Public scores are explicit projections; wallet balances are never public.
CREATE TABLE IF NOT EXISTS ayuzee_private.leaderboard_visibility (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  published boolean NOT NULL DEFAULT false,
  changed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ayuzee_private.leaderboard_visibility ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ayuzee_private.leaderboard_visibility FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON ayuzee_private.leaderboard_visibility TO service_role;
DROP POLICY IF EXISTS leaderboard_trusted_service ON ayuzee_private.leaderboard_visibility;
CREATE POLICY leaderboard_trusted_service ON ayuzee_private.leaderboard_visibility TO service_role USING(true) WITH CHECK(true);

CREATE OR REPLACE FUNCTION public.set_leaderboard_visibility(p_published boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NOT ayuzee_private.rbac_actor() OR p_published IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Sign in to change your own publication preference';
  END IF;
  INSERT INTO ayuzee_private.leaderboard_visibility(user_id,published)
    VALUES(auth.uid(),p_published)
    ON CONFLICT(user_id) DO UPDATE SET published=excluded.published,changed_at=now();
END
$$;
REVOKE ALL ON FUNCTION public.set_leaderboard_visibility(boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_leaderboard_visibility(boolean) TO authenticated;

CREATE OR REPLACE FUNCTION ayuzee_private.rbac_public_leaderboard()
RETURNS TABLE(user_id uuid,role text,total_points integer,total_coins integer,current_rank text,badge_count bigint,login_streak integer,updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT c.user_id,c.role,c.total_points,
    CASE WHEN (ayuzee_private.rbac_actor() AND c.user_id=auth.uid()) OR ayuzee_private.rbac_admin() OR ayuzee_private.rbac_server() THEN c.total_coins ELSE NULL::integer END,
    c.current_rank,(SELECT count(*) FROM public.user_badges b WHERE b.user_id=c.user_id),
    COALESCE((SELECT s.current_streak FROM public.user_streaks s WHERE s.user_id=c.user_id AND s.streak_type='daily_login' LIMIT 1),0),c.updated_at
  FROM public.user_coins c JOIN auth.users u ON u.id=c.user_id AND u.deleted_at IS NULL
  WHERE (ayuzee_private.rbac_actor() AND c.user_id=auth.uid()) OR ayuzee_private.rbac_admin() OR ayuzee_private.rbac_server()
    OR EXISTS(SELECT 1 FROM ayuzee_private.leaderboard_visibility p WHERE p.user_id=c.user_id AND p.published)
  ORDER BY c.total_points DESC
$$;
REVOKE ALL ON FUNCTION ayuzee_private.rbac_public_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ayuzee_private.rbac_public_leaderboard() TO anon,authenticated,service_role;
CREATE OR REPLACE VIEW public.gamification_leaderboard WITH (security_invoker=true) AS
 SELECT * FROM ayuzee_private.rbac_public_leaderboard();

-- Preserve the intended public college aggregate without exposing individual
-- competitor identities or granting public reads on the scores table.
CREATE OR REPLACE FUNCTION ayuzee_private.rbac_college_leaderboard()
RETURNS TABLE(competition_id uuid,college_name text,participants bigint,total_score bigint,avg_score integer,top_score integer,total_correct bigint,total_attempted bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
 SELECT s.competition_id,s.college_name,count(*),sum(s.score),avg(s.score)::integer,max(s.score),sum(s.correct_answers),sum(s.total_questions)
 FROM public.competition_scores s WHERE s.college_name IS NOT NULL
 GROUP BY s.competition_id,s.college_name ORDER BY sum(s.score) DESC
$$;
REVOKE ALL ON FUNCTION ayuzee_private.rbac_college_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ayuzee_private.rbac_college_leaderboard() TO anon,authenticated,service_role;
CREATE OR REPLACE VIEW public.competition_college_leaderboard WITH (security_invoker=true) AS
 SELECT * FROM ayuzee_private.rbac_college_leaderboard();

-- Finance/reception can read branch-level visit counts through this projection
-- without acquiring direct access to clinical notes in hms_op_visits.
CREATE OR REPLACE FUNCTION ayuzee_private.rbac_opd_summary()
RETURNS TABLE(visit_date date,branch text,total_visits bigint,walkins bigint,followups bigint,teleconsults bigint,completed bigint,no_shows bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
 SELECT v.visit_date,v.branch,count(*),count(*) FILTER(WHERE v.mode_visit='Direct'),
  count(*) FILTER(WHERE v.mode_visit='Follow-up'),count(*) FILTER(WHERE v.mode_visit='Teleconsult'),
  count(*) FILTER(WHERE v.status='completed'),count(*) FILTER(WHERE v.status='no_show')
 FROM public.hms_op_visits v
 WHERE ayuzee_private.rbac_server() OR ayuzee_private.rbac_admin() OR ayuzee_private.rbac_location(v.branch,'finance')
  OR ayuzee_private.rbac_location(v.branch,'registration') OR ayuzee_private.rbac_doctor_visit(v.id)
 GROUP BY v.visit_date,v.branch ORDER BY v.visit_date DESC
$$;
REVOKE ALL ON FUNCTION ayuzee_private.rbac_opd_summary() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION ayuzee_private.rbac_opd_summary() TO authenticated,service_role;
CREATE OR REPLACE VIEW public.mis_opd_summary WITH (security_invoker=true) AS
 SELECT * FROM ayuzee_private.rbac_opd_summary();
