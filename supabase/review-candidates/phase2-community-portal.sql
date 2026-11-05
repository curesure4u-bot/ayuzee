-- Phase 2 candidate. LOCAL ONLY: not applied to the hosted database.
-- Requires the three verified Phase 0–1 migrations. Reuses existing feed tables.
BEGIN;
ALTER TABLE public.feed_posts ADD COLUMN community_hidden boolean NOT NULL DEFAULT false;
CREATE TABLE public.community_reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
 reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, reason text NOT NULL CHECK(length(reason) BETWEEN 10 AND 1000),
 decision text CHECK(decision IN ('hide','dismiss')), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(post_id,reporter_id)
);
CREATE TABLE public.community_moderation_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), report_id uuid, post_id uuid, reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 decision text NOT NULL CHECK(decision IN ('hide','dismiss')), reason text NOT NULL CHECK(length(reason) BETWEEN 10 AND 1000), created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_moderation_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_reports,public.community_moderation_log FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.community_reports,public.community_moderation_log TO service_role;
CREATE INDEX community_reports_open ON public.community_reports(created_at,id) WHERE decision IS NULL;
CREATE INDEX community_feed_recent ON public.feed_posts(visibility,created_at DESC,id DESC) WHERE is_published IS TRUE AND community_hidden IS FALSE;

CREATE FUNCTION ayuzee_private.community_doctor() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT ayuzee_private.rbac_actor() AND EXISTS(SELECT 1 FROM public.user_roles r JOIN public.doctors d ON d.user_id=r.user_id
 WHERE r.user_id=auth.uid() AND r.role::text='doctor' AND d.is_approved IS TRUE AND d.is_suspended IS NOT TRUE)
$$;
CREATE FUNCTION ayuzee_private.community_can_read(p_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT ayuzee_private.rbac_actor() AND EXISTS(SELECT 1 FROM public.feed_posts p WHERE p.id=p_id AND p.is_published IS TRUE AND p.community_hidden IS FALSE
 AND (p.visibility='public' OR (p.visibility='doctor' AND ayuzee_private.community_doctor())
 OR EXISTS(SELECT 1 FROM public.user_roles mr WHERE mr.user_id=auth.uid() AND mr.role::text IN ('admin','super_admin','content_admin'))
 OR (p.visibility='patient' AND EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=auth.uid() AND r.role::text='patient'))))
$$;
-- Restrictive fences still apply when legacy permissive policies are present.
CREATE POLICY community_post_fence ON public.feed_posts AS RESTRICTIVE FOR SELECT TO anon,authenticated USING(ayuzee_private.community_can_read(id));
CREATE POLICY community_comment_fence ON public.feed_comments AS RESTRICTIVE FOR SELECT TO anon,authenticated USING(ayuzee_private.community_can_read(post_id));
CREATE POLICY community_like_fence ON public.feed_likes AS RESTRICTIVE FOR SELECT TO anon,authenticated USING(user_id=auth.uid() AND ayuzee_private.community_can_read(post_id));
CREATE POLICY community_vote_fence ON public.feed_poll_votes AS RESTRICTIVE FOR SELECT TO anon,authenticated USING(user_id=auth.uid() AND ayuzee_private.community_can_read(post_id));
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.feed_posts,public.feed_comments,public.feed_likes,public.feed_poll_votes FROM PUBLIC,anon,authenticated;
-- Legacy counters inherit an empty search_path when called by the private API.
-- Qualify their relation and keep them callable only as triggers/trusted service.
CREATE OR REPLACE FUNCTION public.update_feed_like_count() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF TG_OP='INSERT' THEN UPDATE public.feed_posts SET like_count=COALESCE(like_count,0)+1 WHERE id=NEW.post_id; RETURN NEW;
 ELSE UPDATE public.feed_posts SET like_count=GREATEST(COALESCE(like_count,0)-1,0) WHERE id=OLD.post_id; RETURN OLD; END IF;
END $$;
CREATE OR REPLACE FUNCTION public.update_feed_comment_count() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF TG_OP='INSERT' THEN UPDATE public.feed_posts SET comment_count=COALESCE(comment_count,0)+1 WHERE id=NEW.post_id; RETURN NEW;
 ELSE UPDATE public.feed_posts SET comment_count=GREATEST(COALESCE(comment_count,0)-1,0) WHERE id=OLD.post_id; RETURN OLD; END IF;
END $$;
REVOKE ALL ON FUNCTION public.update_feed_like_count(),public.update_feed_comment_count() FROM PUBLIC,anon,authenticated;
-- Notification content is server-owned; recipients may change only read/dismiss state.
CREATE POLICY community_notification_recipient ON public.unified_notifications AS RESTRICTIVE FOR ALL TO anon,authenticated
 USING(ayuzee_private.rbac_actor() AND user_id=auth.uid()) WITH CHECK(ayuzee_private.rbac_actor() AND user_id=auth.uid());
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.unified_notifications FROM PUBLIC,anon,authenticated;
GRANT UPDATE(is_read,read_at,is_dismissed) ON public.unified_notifications TO authenticated;
DO $$ BEGIN
 IF to_regprocedure('public.create_notification(uuid,text,text,text,text,text,text,text)') IS NOT NULL THEN
  REVOKE ALL ON FUNCTION public.create_notification(uuid,text,text,text,text,text,text,text) FROM PUBLIC,anon,authenticated;
 END IF;
END $$;
-- Private implementation is privileged only to aggregate without exposing voter
-- identities, derive authorship, enforce atomic actions and record moderation.
-- Every branch validates the real actor, canonical workspace and parent audience.
CREATE FUNCTION ayuzee_private.community_portal(p_action text,p_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
 u uuid:=auth.uid(); w text:=p_payload->>'workspace'; v jsonb; v_post public.feed_posts; v_comment public.feed_comments; v_report public.community_reports;
 is_doc boolean; is_patient boolean; is_mod boolean; a text; k text; v_title text; v_body text; opts jsonb;
 target uuid; option_no integer; n integer; page_no integer; q text; result jsonb;
BEGIN
 IF NOT ayuzee_private.rbac_actor() OR w IS NULL OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=u AND role::text=w) THEN
  RAISE EXCEPTION 'Community access denied' USING ERRCODE='42501';
 END IF;
 is_doc:=w='doctor' AND ayuzee_private.community_doctor(); is_patient:=w='patient';
 is_mod:=w IN ('admin','super_admin','content_admin');
 SELECT jsonb_build_object('id',u,'name',COALESCE(NULLIF(full_name,''),'Community member'),'workspace',w,'doctor',is_doc,'patient',is_patient,'moderator',is_mod)
 INTO v FROM public.profiles WHERE user_id=u;
 v:=COALESCE(v,jsonb_build_object('id',u,'name','Community member','workspace',w,'doctor',is_doc,'patient',is_patient,'moderator',is_mod));
 IF p_action='feed' THEN
  a:=COALESCE(p_payload->>'audience','public'); k:=COALESCE(p_payload->>'kind','all'); q:=left(COALESCE(p_payload->>'query',''),100);
  page_no:=COALESCE((p_payload->>'page')::integer,1);
  IF page_no NOT BETWEEN 1 AND 1000 OR a NOT IN ('public','doctor','patient') OR k NOT IN ('all','discussion','question','poll') THEN RAISE EXCEPTION 'Invalid filters' USING ERRCODE='22023'; END IF;
  IF (a='doctor' AND NOT is_doc) OR (a='patient' AND NOT is_patient) THEN RAISE EXCEPTION 'Audience unavailable' USING ERRCODE='42501'; END IF;
  WITH selected AS (
   SELECT p.* FROM public.feed_posts p WHERE ayuzee_private.community_can_read(p.id)
    AND (p.visibility='public' OR (p.visibility='doctor' AND is_doc) OR (p.visibility='patient' AND is_patient) OR is_mod)
    AND CASE WHEN p_payload->>'id' IS NOT NULL THEN p.id=(p_payload->>'id')::uuid ELSE
     p.visibility=a AND (k='all' OR p.post_type=CASE k WHEN 'discussion' THEN 'public_post' WHEN 'question' THEN 'patient_question' ELSE k END)
     AND (NOT COALESCE((p_payload->>'mine')::boolean,false) OR p.author_user_id=u)
     AND (q='' OR position(lower(q) in lower(COALESCE(p.title,'')||' '||p.body))>0) END
   ORDER BY CASE WHEN p_payload->>'sort'='discussed' THEN (SELECT count(*) FROM public.feed_comments fc WHERE fc.post_id=p.id) END DESC,
   p.created_at DESC,p.id DESC OFFSET (page_no-1)*12 LIMIT 13
  ), projected AS (
   SELECT jsonb_build_object('id',p.id,'authorId',p.author_user_id,'authorName',p.author_name,'title',COALESCE(p.title,''),'body',p.body,
    'kind',CASE p.post_type WHEN 'patient_question' THEN 'question' WHEN 'poll' THEN 'poll' ELSE 'discussion' END,'audience',p.visibility,
    'createdAt',p.created_at,'editedAt',CASE WHEN p.updated_at>p.created_at THEN p.updated_at ELSE NULL END,
    'likeCount',(SELECT count(*) FROM public.feed_likes l WHERE l.post_id=p.id),
    'commentCount',(SELECT count(*) FROM public.feed_comments fc WHERE fc.post_id=p.id),
    'liked',EXISTS(SELECT 1 FROM public.feed_likes l WHERE l.post_id=p.id AND l.user_id=u),'mine',p.author_user_id=u,
    'poll',CASE WHEN p.post_type='poll' THEN jsonb_build_object('options',(
     SELECT jsonb_agg(jsonb_build_object('text',o.value->>'text','votes',(SELECT count(*) FROM public.feed_poll_votes pv WHERE pv.post_id=p.id AND pv.option_index=o.ordinality-1)) ORDER BY o.ordinality)
     FROM jsonb_array_elements(p.poll_options) WITH ORDINALITY o),
     'selected',(SELECT option_index FROM public.feed_poll_votes pv WHERE pv.post_id=p.id AND pv.user_id=u),'closesAt',p.poll_expires_at) ELSE NULL END) AS item,
    row_number() OVER(ORDER BY CASE WHEN p_payload->>'sort'='discussed' THEN (SELECT count(*) FROM public.feed_comments fc WHERE fc.post_id=p.id) END DESC,p.created_at DESC,p.id DESC) AS row_no FROM selected p
  ) SELECT jsonb_build_object('viewer',v,'posts',COALESCE(jsonb_agg(item ORDER BY row_no) FILTER(WHERE row_no<=12),'[]'::jsonb),'hasMore',count(*)>12) INTO result FROM projected;
  RETURN result;
 END IF;
 IF p_action IN ('notifications','notification') THEN
  IF p_action='notification' THEN
   IF COALESCE(p_payload->>'decision','') NOT IN ('read','dismiss','read_all') THEN RAISE EXCEPTION 'Invalid notification action' USING ERRCODE='22023'; END IF;
   UPDATE public.unified_notifications SET is_read=CASE WHEN p_payload->>'decision' IN ('read','read_all') THEN true ELSE is_read END,
    read_at=CASE WHEN p_payload->>'decision' IN ('read','read_all') THEN now() ELSE read_at END,
    is_dismissed=CASE WHEN p_payload->>'decision'='dismiss' THEN true ELSE is_dismissed END
   WHERE user_id=u AND source_module='beyond' AND source_url LIKE '/feed/%'
    AND (p_payload->>'decision'='read_all' OR id=(p_payload->>'id')::uuid);
   RETURN '{}'::jsonb;
  END IF;
  SELECT jsonb_build_object('notifications',COALESCE(jsonb_agg(item ORDER BY created_at DESC,id DESC),'[]'::jsonb)) INTO result FROM (
   SELECT id,created_at,jsonb_build_object('id',id,'title',title,'message',message,'isRead',is_read,'createdAt',created_at,
    'postId',CASE WHEN source_id ~ '^[0-9a-fA-F-]{36}$' AND EXISTS(SELECT 1 FROM public.feed_posts p WHERE p.id::text=source_id AND ayuzee_private.community_can_read(p.id)
     AND (p.visibility='public' OR (p.visibility='doctor' AND is_doc) OR (p.visibility='patient' AND is_patient))) THEN source_id ELSE NULL END) AS item
   FROM public.unified_notifications WHERE user_id=u AND source_module='beyond' AND source_url LIKE '/feed/%' AND NOT is_dismissed AND (expires_at IS NULL OR expires_at>now())
   ORDER BY created_at DESC,id DESC LIMIT 50
  ) notes;
  RETURN result;
 END IF;
 IF p_action IN ('reports','moderate') THEN
  IF NOT is_mod THEN RAISE EXCEPTION 'Moderation denied' USING ERRCODE='42501'; END IF;
  IF p_action='reports' THEN
   SELECT jsonb_build_object('reports',COALESCE(jsonb_agg(item ORDER BY created_at,id),'[]'::jsonb)) INTO result FROM (
    SELECT r.id,r.created_at,jsonb_build_object('id',r.id,'postId',r.post_id,'title',COALESCE(p.title,''),'reason',r.reason,'createdAt',r.created_at) item
    FROM public.community_reports r JOIN public.feed_posts p ON p.id=r.post_id WHERE r.decision IS NULL ORDER BY r.created_at,r.id LIMIT 50
   ) reports; RETURN result;
  END IF;
  v_body:=trim(p_payload->>'reason');
  IF length(v_body) NOT BETWEEN 10 AND 1000 OR v_body IS NULL OR COALESCE(p_payload->>'decision','') NOT IN ('hide','dismiss') THEN RAISE EXCEPTION 'Invalid review' USING ERRCODE='22023'; END IF;
  SELECT * INTO v_report FROM public.community_reports WHERE id=(p_payload->>'id')::uuid AND decision IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Report unavailable' USING ERRCODE='42501'; END IF;
  UPDATE public.community_reports SET decision=p_payload->>'decision' WHERE id=v_report.id;
  IF p_payload->>'decision'='hide' THEN UPDATE public.feed_posts SET community_hidden=true WHERE id=v_report.post_id; END IF;
  INSERT INTO public.community_moderation_log(report_id,post_id,reviewer_id,decision,reason) VALUES(v_report.id,v_report.post_id,u,p_payload->>'decision',v_body);
  RETURN '{}'::jsonb;
 END IF;
 IF p_action='save' THEN
  a:=p_payload->>'audience'; k:=p_payload->>'kind'; v_title:=trim(p_payload->>'title'); v_body:=trim(p_payload->>'body'); opts:=COALESCE(p_payload->'options','[]'::jsonb);
  IF a IS NULL OR a NOT IN ('public','doctor','patient') OR k IS NULL OR k NOT IN ('discussion','question','poll') OR v_title IS NULL OR v_body IS NULL OR length(v_title) NOT BETWEEN 3 AND 160 OR length(v_body) NOT BETWEEN 10 AND 4000 THEN RAISE EXCEPTION 'Invalid post' USING ERRCODE='22023'; END IF;
  IF (a='doctor' AND NOT is_doc) OR (a='patient' AND NOT is_patient) THEN RAISE EXCEPTION 'Audience denied' USING ERRCODE='42501'; END IF;
  IF k='poll' THEN
   IF jsonb_typeof(opts)<>'array' OR jsonb_array_length(opts) NOT BETWEEN 2 AND 6 THEN RAISE EXCEPTION 'Invalid poll' USING ERRCODE='22023'; END IF;
   IF EXISTS(SELECT 1 FROM jsonb_array_elements(opts) o WHERE jsonb_typeof(o)<>'string' OR length(trim(o#>>'{}')) NOT BETWEEN 1 AND 120)
    OR (SELECT count(DISTINCT lower(trim(o#>>'{}'))) FROM jsonb_array_elements(opts) o)<>jsonb_array_length(opts) THEN RAISE EXCEPTION 'Invalid poll choices' USING ERRCODE='22023'; END IF;
  END IF;
  IF p_payload->>'id' IS NULL THEN
   SELECT jsonb_agg(jsonb_build_object('text',trim(o#>>'{}'),'votes',0)) INTO opts FROM jsonb_array_elements(opts) o;
   INSERT INTO public.feed_posts(author_user_id,author_name,title,body,post_type,visibility,poll_options,poll_expires_at,created_at,updated_at)
   VALUES(u,v->>'name',v_title,v_body,CASE k WHEN 'question' THEN 'patient_question' WHEN 'discussion' THEN 'public_post' ELSE k END,a,
    CASE WHEN k='poll' THEN opts ELSE NULL END,CASE WHEN k='poll' THEN now()+interval '7 days' ELSE NULL END,now(),now()) RETURNING id INTO target;
  ELSE
   SELECT * INTO v_post FROM public.feed_posts WHERE id=(p_payload->>'id')::uuid FOR UPDATE;
   IF NOT FOUND OR v_post.author_user_id<>u OR v_post.community_hidden OR NOT ayuzee_private.community_can_read(v_post.id) THEN RAISE EXCEPTION 'Post unavailable' USING ERRCODE='42501'; END IF;
   IF v_post.visibility<>a OR v_post.post_type<>(CASE k WHEN 'question' THEN 'patient_question' WHEN 'discussion' THEN 'public_post' ELSE k END)
    OR (k='poll' AND (SELECT jsonb_agg(o->>'text') FROM jsonb_array_elements(v_post.poll_options) o)<>opts) THEN RAISE EXCEPTION 'Audience and poll choices are immutable' USING ERRCODE='22023'; END IF;
   UPDATE public.feed_posts SET title=v_title,body=v_body,updated_at=now() WHERE id=v_post.id; target:=v_post.id;
  END IF;
  RETURN jsonb_build_object('id',target);
 END IF;
 IF p_action='delete_comment' THEN
  SELECT * INTO v_comment FROM public.feed_comments WHERE id=(p_payload->>'id')::uuid FOR UPDATE;
  IF NOT FOUND OR v_comment.user_id<>u OR NOT ayuzee_private.community_can_read(v_comment.post_id) OR NOT EXISTS(SELECT 1 FROM public.feed_posts cp WHERE cp.id=v_comment.post_id AND (cp.visibility='public' OR (cp.visibility='doctor' AND is_doc) OR (cp.visibility='patient' AND is_patient))) THEN RAISE EXCEPTION 'Comment unavailable' USING ERRCODE='42501'; END IF;
  DELETE FROM public.feed_comments WHERE id=v_comment.id; RETURN '{}'::jsonb;
 END IF;
 target:=(p_payload->>'id')::uuid;
 SELECT * INTO v_post FROM public.feed_posts WHERE id=target FOR UPDATE;
 IF NOT FOUND OR NOT ayuzee_private.community_can_read(target) OR NOT (v_post.visibility='public' OR (v_post.visibility='doctor' AND is_doc) OR (v_post.visibility='patient' AND is_patient) OR (is_mod AND p_action='comments')) THEN RAISE EXCEPTION 'Post unavailable' USING ERRCODE='42501'; END IF;
 IF p_action='comments' THEN
  SELECT jsonb_build_object('comments',COALESCE(jsonb_agg(item ORDER BY created_at,id),'[]'::jsonb)) INTO result FROM (
   SELECT id,created_at,jsonb_build_object('id',id,'authorName',author_name,'body',body,'createdAt',created_at,'mine',user_id=u) item
   FROM public.feed_comments WHERE post_id=target ORDER BY created_at,id LIMIT 50
  ) comments; RETURN result;
 ELSIF p_action='delete' THEN
  IF v_post.author_user_id<>u THEN RAISE EXCEPTION 'Not your post' USING ERRCODE='42501'; END IF;
  DELETE FROM public.feed_posts WHERE id=target;
 ELSIF p_action='like' THEN
  IF p_payload->>'liked' NOT IN ('true','false') OR p_payload->>'liked' IS NULL THEN RAISE EXCEPTION 'Invalid like' USING ERRCODE='22023'; END IF;
  IF (p_payload->>'liked')::boolean THEN INSERT INTO public.feed_likes(post_id,user_id) VALUES(target,u) ON CONFLICT(post_id,user_id) DO NOTHING;
  ELSE DELETE FROM public.feed_likes WHERE post_id=target AND user_id=u; END IF;
 ELSIF p_action='comment' THEN
  v_body:=trim(p_payload->>'body'); IF v_body IS NULL OR length(v_body) NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Invalid comment' USING ERRCODE='22023'; END IF;
  INSERT INTO public.feed_comments(post_id,user_id,author_name,body) VALUES(target,u,v->>'name',v_body);
  IF v_post.author_user_id<>u THEN INSERT INTO public.unified_notifications(user_id,title,message,type,source_module,source_id,source_url)
   VALUES(v_post.author_user_id,'New reply to your conversation','A community member replied. Open the conversation to read it.','message_received','beyond',target::text,'/feed/'||target::text); END IF;
 ELSIF p_action='vote' THEN
  option_no:=(p_payload->>'option')::integer;
  IF v_post.post_type<>'poll' OR v_post.poll_expires_at IS NULL OR v_post.poll_expires_at<=now() OR option_no IS NULL OR option_no<0 OR option_no>=jsonb_array_length(v_post.poll_options) THEN RAISE EXCEPTION 'Invalid or closed poll' USING ERRCODE='22023'; END IF;
  INSERT INTO public.feed_poll_votes(post_id,user_id,option_index) VALUES(target,u,option_no) ON CONFLICT(post_id,user_id) DO UPDATE SET option_index=excluded.option_index;
 ELSIF p_action='report' THEN
  v_body:=trim(p_payload->>'reason'); IF v_body IS NULL OR length(v_body) NOT BETWEEN 10 AND 1000 THEN RAISE EXCEPTION 'Invalid report' USING ERRCODE='22023'; END IF;
  IF v_post.author_user_id=u THEN RAISE EXCEPTION 'Cannot report your own post' USING ERRCODE='22023'; END IF;
  INSERT INTO public.community_reports(post_id,reporter_id,reason) VALUES(target,u,v_body) ON CONFLICT(post_id,reporter_id) DO NOTHING;
 ELSE RAISE EXCEPTION 'Unknown community action' USING ERRCODE='22023';
 END IF;
 RETURN '{}'::jsonb;
END $$;
CREATE FUNCTION public.community_portal(p_action text,p_payload jsonb DEFAULT '{}'::jsonb) RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT ayuzee_private.community_portal(p_action,p_payload) $$;
REVOKE ALL ON FUNCTION ayuzee_private.community_doctor(),ayuzee_private.community_can_read(uuid),ayuzee_private.community_portal(text,jsonb),public.community_portal(text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION ayuzee_private.community_doctor(),ayuzee_private.community_can_read(uuid),ayuzee_private.community_portal(text,jsonb),public.community_portal(text,jsonb) TO authenticated,service_role;
COMMIT;
