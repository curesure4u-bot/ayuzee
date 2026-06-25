
CREATE TABLE IF NOT EXISTS public.astg_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  disease_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.astg_audit_log TO authenticated;
GRANT ALL ON public.astg_audit_log TO service_role;
ALTER TABLE public.astg_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read astg audit"
  ON public.astg_audit_log FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins can write astg audit"
  ON public.astg_audit_log FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_super(auth.uid()) AND actor_id = auth.uid());
