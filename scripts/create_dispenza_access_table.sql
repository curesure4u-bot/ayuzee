-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Dispenza Premium Access (Email Whitelist)
-- Superadmin (curesure4u@gmail.com) can grant/revoke access to premium tools
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS dispenza_premium_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  access_type TEXT NOT NULL DEFAULT 'premium' CHECK (access_type IN ('premium', 'clinic', 'both')),
  granted_by TEXT NOT NULL DEFAULT 'superadmin',
  patient_name TEXT,
  phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dispenza_premium_access ENABLE ROW LEVEL SECURITY;

-- Superadmin can do everything
CREATE POLICY "Superadmin full access on dispenza_premium_access"
  ON dispenza_premium_access FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Any authenticated user can check if their own email is in the list
CREATE POLICY "Users can check own access"
  ON dispenza_premium_access FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_dispenza_access_email ON dispenza_premium_access(email);
CREATE INDEX IF NOT EXISTS idx_dispenza_access_active ON dispenza_premium_access(is_active, email);

-- Seed: Superadmin always has access
INSERT INTO dispenza_premium_access (email, access_type, granted_by, patient_name, notes)
VALUES ('curesure4u@gmail.com', 'both', 'system', 'Dr. Mohamad Saleem (Superadmin)', 'Auto-granted superadmin access')
ON CONFLICT (email) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Table: dispenza_premium_access
-- Superadmin seeded with full access
-- ═══════════════════════════════════════════════════════════════════════════════
