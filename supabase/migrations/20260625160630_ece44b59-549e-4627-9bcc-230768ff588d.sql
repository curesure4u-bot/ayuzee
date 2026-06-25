CREATE OR REPLACE FUNCTION public.hms_increment_suggestion_usage(_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.hms_suggestions SET usage_count = COALESCE(usage_count,0) + 1 WHERE id = _id AND is_active = true;
$$;

REVOKE ALL ON FUNCTION public.hms_increment_suggestion_usage(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hms_increment_suggestion_usage(uuid) TO authenticated;