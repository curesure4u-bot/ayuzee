-- ============================================================
-- DIGITAL BUSINESS REGISTER (DBR) — Database Schema
-- Tracks business documents, licenses, registrations, compliance
-- ============================================================

CREATE TABLE IF NOT EXISTS business_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Document info
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN (
    'license', 'registration', 'insurance', 'tax', 'agreement',
    'certificate', 'permit', 'bank', 'property', 'other'
  )),

  -- Registration/reference numbers
  reference_number TEXT DEFAULT '',
  issuing_authority TEXT DEFAULT '',

  -- Dates
  issue_date DATE,
  expiry_date DATE,
  renewal_date DATE,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'renewal_due', 'cancelled')),

  -- File attachments (URLs)
  file_url TEXT DEFAULT '',
  google_sheet_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',

  -- Metadata
  reminder_days_before INTEGER DEFAULT 30, -- days before expiry to remind
  is_critical BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_register_user ON business_register(user_id);
CREATE INDEX IF NOT EXISTS idx_business_register_category ON business_register(user_id, category);
CREATE INDEX IF NOT EXISTS idx_business_register_expiry ON business_register(user_id, expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_business_register_status ON business_register(user_id, status);

-- RLS
ALTER TABLE business_register ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own register" ON business_register FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own register" ON business_register FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own register" ON business_register FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own register" ON business_register FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER trg_business_register_updated
  BEFORE UPDATE ON business_register
  FOR EACH ROW EXECUTE FUNCTION update_task_tracker_updated_at();
