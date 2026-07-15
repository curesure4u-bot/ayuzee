-- Switch view to security_invoker so it uses the caller's privileges
CREATE OR REPLACE VIEW public.webinars_public
WITH (security_invoker = on) AS
SELECT
  id, title, description, speaker_name, speaker_bio, speaker_avatar_url,
  cover_image_url, scheduled_at, duration_minutes, category, rsvp_count,
  is_published, created_at, updated_at
FROM public.webinars
WHERE is_published = true;

GRANT SELECT ON public.webinars_public TO anon, authenticated;

-- Grant SELECT on SAFE columns only to anon/authenticated on base table
-- (join_url and recording_url intentionally excluded)
GRANT SELECT (
  id, title, description, speaker_name, speaker_bio, speaker_avatar_url,
  cover_image_url, scheduled_at, duration_minutes, category, rsvp_count,
  is_published, created_at, updated_at
) ON public.webinars TO anon, authenticated;

-- Explicitly revoke sensitive columns from anon and authenticated
-- (admins access these via get_webinar_admin RPC or service role)
REVOKE SELECT (join_url, recording_url) ON public.webinars FROM anon;
REVOKE SELECT (join_url, recording_url) ON public.webinars FROM authenticated;

-- Re-add a permissive row policy so anon/authenticated can read published rows
-- through the security_invoker view. Column-level GRANTs still hide join_url/recording_url.
DROP POLICY IF EXISTS "Published webinars public safe" ON public.webinars;
CREATE POLICY "Published webinars public safe"
ON public.webinars
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Admin-only RPC to fetch a full webinar row (including URLs)
CREATE OR REPLACE FUNCTION public.get_webinar_admin(_webinar_id uuid)
RETURNS public.webinars
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.webinars;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  SELECT * INTO _row FROM public.webinars WHERE id = _webinar_id;
  RETURN _row;
END;
$$;

REVOKE ALL ON FUNCTION public.get_webinar_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_webinar_admin(uuid) TO authenticated;