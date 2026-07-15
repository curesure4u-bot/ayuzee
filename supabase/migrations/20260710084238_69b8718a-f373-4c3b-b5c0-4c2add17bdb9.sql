-- Restore column privileges (needed for admin manage screens)
GRANT SELECT (join_url, recording_url) ON public.webinars TO authenticated;
-- Do NOT grant these columns to anon; base-table access for anon is being removed below.

-- Remove the overly broad public read policy on the base table
DROP POLICY IF EXISTS "Published webinars public" ON public.webinars;

-- Revoke direct base-table read from anon/authenticated (admin policy still applies)
REVOKE SELECT ON public.webinars FROM anon;
-- Keep authenticated SELECT so admin RLS policy can evaluate; RLS restricts to admins.

-- Public-safe view: exposes only marketing metadata for published webinars
CREATE OR REPLACE VIEW public.webinars_public
WITH (security_invoker = off) AS
SELECT
  id,
  title,
  description,
  speaker_name,
  speaker_bio,
  speaker_avatar_url,
  cover_image_url,
  scheduled_at,
  duration_minutes,
  category,
  rsvp_count,
  is_published,
  created_at,
  updated_at
FROM public.webinars
WHERE is_published = true;

GRANT SELECT ON public.webinars_public TO anon, authenticated;