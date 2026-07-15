CREATE TABLE IF NOT EXISTS public.treatment_kit_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  kit_name text NOT NULL,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(email, kit_name)
);

ALTER TABLE public.treatment_kit_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join treatment kit waitlist"
ON public.treatment_kit_waitlist
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view treatment kit waitlist"
ON public.treatment_kit_waitlist
FOR SELECT
USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can manage treatment kit waitlist"
ON public.treatment_kit_waitlist
FOR UPDATE
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins can delete treatment kit waitlist"
ON public.treatment_kit_waitlist
FOR DELETE
USING (public.is_admin_or_super(auth.uid()));