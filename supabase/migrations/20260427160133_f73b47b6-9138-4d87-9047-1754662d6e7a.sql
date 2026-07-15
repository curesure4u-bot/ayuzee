
REVOKE EXECUTE ON FUNCTION public.gam_award(uuid,text,text,int,text,text,uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.gam_check_badges(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.gam_compute_level(int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.gam_trg_consultation() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.gam_trg_prakriti() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.gam_trg_therapy_session() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.gam_trg_lms_progress() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.gam_trg_quiz() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.gam_trg_homeo_followup() FROM PUBLIC, anon;
