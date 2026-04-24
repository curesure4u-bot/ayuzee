DROP POLICY IF EXISTS "Students can claim own student role" ON public.user_roles;

CREATE POLICY "Students can claim own student role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'student'::public.app_role);