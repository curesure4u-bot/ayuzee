-- Add visibility + post_type to feed_posts; allow patient_question posts from any signed-in user
ALTER TABLE public.feed_posts
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'doctor_post';

-- Constrain to known values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'feed_posts_visibility_check') THEN
    ALTER TABLE public.feed_posts ADD CONSTRAINT feed_posts_visibility_check
      CHECK (visibility IN ('doctor', 'public', 'patient'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'feed_posts_type_check') THEN
    ALTER TABLE public.feed_posts ADD CONSTRAINT feed_posts_type_check
      CHECK (post_type IN ('doctor_post', 'public_post', 'patient_question'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS feed_posts_post_type_idx ON public.feed_posts (post_type);
CREATE INDEX IF NOT EXISTS feed_posts_visibility_idx ON public.feed_posts (visibility);

-- Allow any authenticated user to insert a patient_question (existing policy likely restricts to doctors).
-- Drop existing insert policy (if narrowly scoped) then re-create one that allows:
-- - approved doctors to create doctor_post / public_post
-- - any signed-in user to create patient_question
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'public.feed_posts'::regclass AND polcmd = 'a' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.feed_posts', pol.polname);
  END LOOP;
END $$;

CREATE POLICY "Doctors can create doctor/public posts"
ON public.feed_posts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_user_id
  AND (
    (post_type IN ('doctor_post','public_post') AND EXISTS (
      SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.is_approved = true
    ))
    OR post_type = 'patient_question'
  )
);
