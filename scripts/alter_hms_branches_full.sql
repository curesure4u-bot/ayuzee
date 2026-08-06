-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Extend hms_branches with full registration fields
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.hms_branches
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS gstin TEXT,
  ADD COLUMN IF NOT EXISTS ayush_license_no TEXT,
  ADD COLUMN IF NOT EXISTS opening_hours TEXT DEFAULT '9:00 AM - 6:00 PM',
  ADD COLUMN IF NOT EXISTS opened_on DATE,
  ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS op_prefix TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS whatsapp_no TEXT,
  -- Franchise fields
  ADD COLUMN IF NOT EXISTS franchise_plan TEXT CHECK (franchise_plan IN ('silver','gold','platinum',NULL)),
  ADD COLUMN IF NOT EXISTS franchise_payment_type TEXT CHECK (franchise_payment_type IN ('revenue_share','fixed_fee','monthly','hybrid',NULL)),
  ADD COLUMN IF NOT EXISTS franchise_revenue_share_pct DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS franchise_agreement_start DATE,
  ADD COLUMN IF NOT EXISTS franchise_agreement_end DATE,
  ADD COLUMN IF NOT EXISTS franchise_owner_name TEXT,
  ADD COLUMN IF NOT EXISTS franchise_owner_phone TEXT,
  ADD COLUMN IF NOT EXISTS franchise_owner_email TEXT,
  -- Operations
  ADD COLUMN IF NOT EXISTS daily_op_capacity INT DEFAULT 50,
  ADD COLUMN IF NOT EXISTS panchakarma_rooms INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_pharmacy BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_lab BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_ipd BOOLEAN DEFAULT false;

-- Allow authenticated users to INSERT (for branch registration)
GRANT INSERT, UPDATE ON public.hms_branches TO authenticated;
