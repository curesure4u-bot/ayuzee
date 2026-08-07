-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Accounts Module Tables
-- Covers: Expense Entries, Shift Closings / Day-End, Cash Positions,
--         Revenue Aggregation Views
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 1: EXPENSE ENTRIES                                                   ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS hms_expense_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_no TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN (
    'Rent & Utilities', 'Staff Salary', 'Lab Supplies', 'Maintenance',
    'Marketing', 'Transport', 'Professional Fees', 'Office Supplies',
    'Medicine Purchase', 'Equipment', 'Insurance', 'Taxes', 'Other'
  )),
  sub_category TEXT,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  paid_to TEXT NOT NULL,
  payment_mode TEXT NOT NULL DEFAULT 'Cash' CHECK (payment_mode IN (
    'Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card'
  )),
  reference TEXT,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by_name TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  receipt_url TEXT,
  location TEXT DEFAULT 'all',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_expense_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view expenses" ON hms_expense_entries;
CREATE POLICY "Staff can view expenses"
  ON hms_expense_entries FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage expenses" ON hms_expense_entries;
CREATE POLICY "Staff can manage expenses"
  ON hms_expense_entries FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_expense_date ON hms_expense_entries(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expense_category ON hms_expense_entries(category, expense_date);
CREATE INDEX IF NOT EXISTS idx_expense_status ON hms_expense_entries(status) WHERE status = 'Pending';
CREATE INDEX IF NOT EXISTS idx_expense_location ON hms_expense_entries(location, expense_date);

-- Auto-generate voucher number
CREATE OR REPLACE FUNCTION generate_expense_voucher()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.voucher_no IS NULL THEN
    NEW.voucher_no := 'EXP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(
      (SELECT COALESCE(MAX(CAST(SUBSTRING(voucher_no FROM 10) AS INTEGER)), 0) + 1
       FROM hms_expense_entries WHERE voucher_no LIKE 'EXP-' || TO_CHAR(NOW(), 'YYYY') || '-%')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_expense_voucher ON hms_expense_entries;
CREATE TRIGGER trg_expense_voucher
  BEFORE INSERT ON hms_expense_entries
  FOR EACH ROW EXECUTE FUNCTION generate_expense_voucher();

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 2: SHIFT CLOSINGS / DAY-END REPORTS                                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS hms_shift_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift_name TEXT NOT NULL CHECK (shift_name IN ('Morning', 'Evening', 'Night', 'Full Day')),
  cashier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cashier_name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  opening_cash DECIMAL(10,2) DEFAULT 0,
  
  -- Collection breakdown
  cash_count INTEGER DEFAULT 0,
  cash_amount DECIMAL(12,2) DEFAULT 0,
  upi_count INTEGER DEFAULT 0,
  upi_amount DECIMAL(12,2) DEFAULT 0,
  card_count INTEGER DEFAULT 0,
  card_amount DECIMAL(12,2) DEFAULT 0,
  cheque_count INTEGER DEFAULT 0,
  cheque_amount DECIMAL(12,2) DEFAULT 0,
  online_count INTEGER DEFAULT 0,
  online_amount DECIMAL(12,2) DEFAULT 0,
  
  total_collection DECIMAL(12,2) DEFAULT 0,
  refunds DECIMAL(10,2) DEFAULT 0,
  expenses_paid DECIMAL(10,2) DEFAULT 0,
  
  -- Cash reconciliation
  expected_cash DECIMAL(12,2) DEFAULT 0,
  actual_cash DECIMAL(12,2),
  difference DECIMAL(10,2) DEFAULT 0,
  
  -- Denomination (JSON for flexibility)
  denomination JSONB DEFAULT '{}',
  
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed', 'Discrepancy', 'Verified')),
  closed_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(shift_date, shift_name, location)
);

ALTER TABLE hms_shift_closings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view shift closings" ON hms_shift_closings;
CREATE POLICY "Staff can view shift closings"
  ON hms_shift_closings FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage shift closings" ON hms_shift_closings;
CREATE POLICY "Staff can manage shift closings"
  ON hms_shift_closings FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_shift_date ON hms_shift_closings(shift_date DESC);
CREATE INDEX IF NOT EXISTS idx_shift_cashier ON hms_shift_closings(cashier_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_shift_status ON hms_shift_closings(status) WHERE status IN ('Open', 'Discrepancy');

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 3: CASH POSITIONS (Bank accounts, cash drawers, FDs)                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS hms_cash_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN (
    'bank', 'cash', 'fd', 'digital', 'petty_cash'
  )),
  bank_name TEXT,
  account_number TEXT,
  balance DECIMAL(14,2) NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_cash_positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view cash positions" ON hms_cash_positions;
CREATE POLICY "Staff can view cash positions"
  ON hms_cash_positions FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage cash positions" ON hms_cash_positions;
CREATE POLICY "Staff can manage cash positions"
  ON hms_cash_positions FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_cash_positions_type ON hms_cash_positions(account_type);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 4: HELPER FUNCTIONS                                                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- Function: Get expense summary by category for a date range
CREATE OR REPLACE FUNCTION get_expense_summary(
  p_from DATE,
  p_to DATE,
  p_location TEXT DEFAULT 'all'
)
RETURNS TABLE (
  category TEXT,
  total_amount DECIMAL(12,2),
  entry_count BIGINT,
  percentage DECIMAL(5,2)
) AS $$
DECLARE
  v_grand_total DECIMAL(12,2);
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_grand_total
  FROM hms_expense_entries
  WHERE expense_date BETWEEN p_from AND p_to
    AND status = 'Approved'
    AND (p_location = 'all' OR location = p_location);

  RETURN QUERY
  SELECT
    e.category,
    SUM(e.amount)::DECIMAL(12,2) as total_amount,
    COUNT(*)::BIGINT as entry_count,
    CASE WHEN v_grand_total > 0
      THEN ROUND((SUM(e.amount) * 100.0 / v_grand_total), 2)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END as percentage
  FROM hms_expense_entries e
  WHERE e.expense_date BETWEEN p_from AND p_to
    AND e.status = 'Approved'
    AND (p_location = 'all' OR e.location = p_location)
  GROUP BY e.category
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get today's accounts summary (revenue + expenses + net)
CREATE OR REPLACE FUNCTION get_accounts_daily_summary(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  total_collection DECIMAL(12,2),
  cash_collection DECIMAL(12,2),
  digital_collection DECIMAL(12,2),
  total_expenses DECIMAL(12,2),
  net_position DECIMAL(12,2),
  receipt_count BIGINT,
  expense_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT SUM(amount) FROM mis_daily_collection WHERE collection_date = p_date), 0)::DECIMAL(12,2),
    COALESCE((SELECT SUM(amount) FROM mis_daily_collection WHERE collection_date = p_date AND payment_mode = 'cash'), 0)::DECIMAL(12,2),
    COALESCE((SELECT SUM(amount) FROM mis_daily_collection WHERE collection_date = p_date AND payment_mode IN ('gpay', 'upi', 'card', 'neft')), 0)::DECIMAL(12,2),
    COALESCE((SELECT SUM(amount) FROM hms_expense_entries WHERE expense_date = p_date AND status = 'Approved'), 0)::DECIMAL(12,2),
    COALESCE((SELECT SUM(amount) FROM mis_daily_collection WHERE collection_date = p_date), 0)::DECIMAL(12,2) -
      COALESCE((SELECT SUM(amount) FROM hms_expense_entries WHERE expense_date = p_date AND status = 'Approved'), 0)::DECIMAL(12,2),
    COALESCE((SELECT COUNT(*) FROM mis_daily_collection WHERE collection_date = p_date), 0)::BIGINT,
    COALESCE((SELECT COUNT(*) FROM hms_expense_entries WHERE expense_date = p_date AND status = 'Approved'), 0)::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 5: SEED DATA — Default Cash Positions                                ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO hms_cash_positions (account_name, account_type, bank_name, balance)
VALUES
  ('Main Current A/C', 'bank', 'SBI', 485000),
  ('Savings A/C', 'bank', 'HDFC', 320000),
  ('Cash in Hand (Drawer)', 'cash', NULL, 18200),
  ('Petty Cash', 'petty_cash', NULL, 3800),
  ('Fixed Deposit', 'fd', 'SBI', 500000),
  ('Digital Wallet (GPay Business)', 'digital', NULL, 12500)
ON CONFLICT DO NOTHING;
