-- Revoke direct column access to sensitive URLs on webinars
REVOKE SELECT (join_url, recording_url) ON public.webinars FROM anon;
REVOKE SELECT (join_url, recording_url) ON public.webinars FROM authenticated;

-- Secure RPC to obtain access links only when authorized
CREATE OR REPLACE FUNCTION public.get_webinar_access(_webinar_id uuid)
RETURNS TABLE(join_url text, recording_url text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _has_rsvp boolean := false;
  _is_past boolean := false;
BEGIN
  IF _uid IS NULL THEN
    RETURN;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.webinar_rsvps
    WHERE webinar_id = _webinar_id AND user_id = _uid
  ) INTO _has_rsvp;

  SELECT (w.scheduled_at + make_interval(mins => COALESCE(w.duration_minutes, 60))) < now()
    INTO _is_past
  FROM public.webinars w WHERE w.id = _webinar_id;

  RETURN QUERY
    SELECT
      CASE WHEN _has_rsvp THEN w.join_url ELSE NULL END AS join_url,
      CASE WHEN _has_rsvp OR _is_past THEN w.recording_url ELSE NULL END AS recording_url
    FROM public.webinars w
    WHERE w.id = _webinar_id
      AND w.is_published = true;
END;
$$;

REVOKE ALL ON FUNCTION public.get_webinar_access(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_webinar_access(uuid) TO authenticated;