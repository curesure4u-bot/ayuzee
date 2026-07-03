-- DPDP compliance: consent ledger and account deletion requests

CREATE TABLE public.user_consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  purpose text NOT NULL CHECK (
    purpose IN (
      'terms',
      'privacy',
      'marketing',
      'health_processing',
      'analytics',
      'cookies_essential',
      'cookies_analytics'
    )
  ),
  policy_version text NOT NULL DEFAULT '2026.07',
  granted boolean NOT NULL DEFAULT true,
  granted_at timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_user_consent_user_purpose
  ON public.user_consent_records(user_id, purpose, granted_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX idx_user_consent_email
  ON public.user_consent_records(email, purpose)
  WHERE email IS NOT NULL;

ALTER TABLE public.user_consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own consent"
  ON public.user_consent_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own consent"
  ON public.user_consent_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all consent"
  ON public.user_consent_records FOR SELECT
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Anon marketing consent by email"
  ON public.user_consent_records FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL
    AND email IS NOT NULL
    AND purpose = 'marketing'
    AND granted = true
  );

GRANT INSERT, SELECT ON public.user_consent_records TO authenticated;
GRANT INSERT ON public.user_consent_records TO anon;
GRANT ALL ON public.user_consent_records TO service_role;

CREATE TABLE public.deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_progress', 'completed', 'rejected')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  admin_note text
);

CREATE UNIQUE INDEX idx_deletion_requests_active_user
  ON public.deletion_requests(user_id)
  WHERE status IN ('pending', 'in_progress');

ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create own deletion request"
  ON public.deletion_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own deletion request"
  ON public.deletion_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage deletion requests"
  ON public.deletion_requests FOR ALL
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

GRANT INSERT, SELECT ON public.deletion_requests TO authenticated;
GRANT ALL ON public.deletion_requests TO service_role;

CREATE TRIGGER update_deletion_requests_updated_at
  BEFORE UPDATE ON public.deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS marketing_consent boolean NOT NULL DEFAULT false;

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS consent_version text;

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe with marketing consent"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(email) BETWEEN 5 AND 255
    AND source IN ('footer', 'app_waitlist')
    AND marketing_consent = true
  );

-- Append DPDP Act 2023 notice to privacy policy (admin-editable source of truth)
UPDATE public.company_content
SET body = body || E'\n\n---\n\nDIGITAL PERSONAL DATA PROTECTION ACT, 2023 (DPDP)\n\nAyuzee acts as a Data Fiduciary for personal data collected through this platform. Under the DPDP Act, you have the right to:\n• Access and obtain a summary of your personal data\n• Correct and update inaccurate data\n• Withdraw consent for processing that relies on consent\n• Nominate another individual to exercise your rights in the event of death or incapacity\n• File a grievance with our Grievance Officer (see contact details on this page)\n\nWe process personal data only for specified, lawful purposes and retain it only as long as necessary. For health-related data, we apply enhanced safeguards including encryption, access controls, and row-level security.\n\nChildren under 18: We do not knowingly collect personal data from children without verifiable parental consent.\n\nCross-border transfer: Where data is processed outside India through cloud providers (e.g. Supabase), we ensure contractual safeguards consistent with applicable law.\n\nLast DPDP update: July 2026.'
WHERE slug = 'privacy';
