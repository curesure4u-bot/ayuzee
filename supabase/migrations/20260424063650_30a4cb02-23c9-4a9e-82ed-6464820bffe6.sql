ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS profile_photo_url text,
ADD COLUMN IF NOT EXISTS rejection_note text;