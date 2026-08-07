-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Marketing / CRM Module Tables
-- Covers: Leads, Follow-ups
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hms_marketing_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  category TEXT DEFAULT 'General Inquiry',
  purpose TEXT,
  due_date DATE,
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Interested', 'Converted', 'Lost')),
  assigned_to TEXT,
  source TEXT DEFAULT 'Walk-in',
  notes TEXT,
  location TEXT DEFAULT 'all',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_marketing_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view leads" ON hms_marketing_leads;
CREATE POLICY "Staff can view leads" ON hms_marketing_leads FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage leads" ON hms_marketing_leads;
CREATE POLICY "Staff can manage leads" ON hms_marketing_leads FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_leads_status ON hms_marketing_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_due ON hms_marketing_leads(due_date);

CREATE TABLE IF NOT EXISTS hms_marketing_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES hms_marketing_leads(id) ON DELETE CASCADE,
  lead_name TEXT NOT NULL,
  contact TEXT,
  scheduled_date DATE NOT NULL,
  followup_type TEXT DEFAULT 'Call' CHECK (followup_type IN ('Call', 'Visit', 'WhatsApp', 'Email', 'SMS')),
  notes TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Done', 'Rescheduled', 'Missed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_marketing_followups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view followups" ON hms_marketing_followups;
CREATE POLICY "Staff can view followups" ON hms_marketing_followups FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage followups" ON hms_marketing_followups;
CREATE POLICY "Staff can manage followups" ON hms_marketing_followups FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_followups_date ON hms_marketing_followups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_followups_status ON hms_marketing_followups(status) WHERE status = 'Pending';

-- Seed
INSERT INTO hms_marketing_leads (name, contact, category, purpose, due_date, status, assigned_to, source, notes)
VALUES
  ('Anitha Krishnan', '+91-9876543210', 'Panchakarma Inquiry', '14-day Panchakarma for knee pain', '2026-08-10', 'Contacted', 'Vignesh', 'Walk-in', 'Wants pricing details'),
  ('Suresh Babu', '+91-8765432109', 'Corporate Wellness', 'Corporate tie-up for 50 employees', '2026-08-12', 'Interested', 'Marketing Agent', 'Website', 'Follow-up scheduled'),
  ('Meera Nair', '+91-7654321098', 'Teleconsult Lead', 'International patient - Dubai', '2026-08-15', 'New', 'Vignesh', 'Google Ads', 'Wants video consult with Dr. Arun'),
  ('Rajesh Pillai', '+91-9988776655', 'Treatment Package', 'Weight loss program', '2026-08-08', 'Contacted', 'Bhavani', 'Referral', 'Referred by existing patient'),
  ('Kavitha Devi', '+91-8877665544', 'Insurance Inquiry', 'Ayush insurance coverage', '2026-08-09', 'New', 'Cashier', 'Phone Call', '')
ON CONFLICT DO NOTHING;
