-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Flags 31-35: Audit Trail table (only new table needed)
-- The other flags (Role Guard, Validation, Error Boundary, Offline Queue)
-- are pure frontend — no DB changes required.
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.hms_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_table TEXT NOT NULL,
  entity_id TEXT,
  entity_display TEXT,
  details JSONB,
  performed_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  branch TEXT DEFAULT 'Main Branch'
);

ALTER TABLE public.hms_audit_trail ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view audit trail" ON public.hms_audit_trail;
CREATE POLICY "Staff can view audit trail" ON public.hms_audit_trail FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Staff can insert audit trail" ON public.hms_audit_trail;
CREATE POLICY "Staff can insert audit trail" ON public.hms_audit_trail FOR INSERT TO authenticated WITH CHECK (true);
-- NOTE: No UPDATE or DELETE policy — audit trail is immutable

CREATE INDEX IF NOT EXISTS idx_audit_trail_date ON public.hms_audit_trail(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user ON public.hms_audit_trail(user_id, performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_entity ON public.hms_audit_trail(entity_table, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON public.hms_audit_trail(action);
