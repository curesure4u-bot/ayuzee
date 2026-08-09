-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Module 6: Doctor Finance Toolkit
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- SECTION 1: INCOME & EXPENSE ENTRIES
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_finance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  -- Income categories: clinic_opd, surgery, locum, online_consult, teaching, royalty, other_income
  -- Expense categories: rent, staff_salary, equipment, medicines, insurance, tax, emi, utilities, personal, other_expense
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_finance_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own finance entries"
  ON beyond_finance_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own finance entries"
  ON beyond_finance_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own finance entries"
  ON beyond_finance_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own finance entries"
  ON beyond_finance_entries FOR DELETE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 2: NET WORTH SNAPSHOTS (Monthly)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assets JSONB NOT NULL DEFAULT '{}',
  -- {savings: 500000, investments: 1200000, property: 3000000, gold: 200000, other: 100000}
  liabilities JSONB NOT NULL DEFAULT '{}',
  -- {education_loan: 800000, home_loan: 2500000, car_loan: 300000, credit_card: 50000, other: 0}
  total_assets NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_liabilities NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_worth NUMERIC(14,2) GENERATED ALWAYS AS (total_assets - total_liabilities) STORED,
  month DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

ALTER TABLE beyond_net_worth_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own net worth"
  ON beyond_net_worth_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own net worth"
  ON beyond_net_worth_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own net worth"
  ON beyond_net_worth_snapshots FOR UPDATE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 3: FINANCE GOALS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_finance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN (
    'emergency_fund', 'debt_free', 'investment_target',
    'savings_rate', 'clinic_setup', 'retirement', 'custom'
  )),
  title TEXT NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL,
  current_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_finance_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own finance goals"
  ON beyond_finance_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own finance goals"
  ON beyond_finance_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own finance goals"
  ON beyond_finance_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own finance goals"
  ON beyond_finance_goals FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- DONE! Tables created for:
-- ✅ Finance Entries (income + expense with categories)
-- ✅ Net Worth Snapshots (monthly assets vs liabilities)
-- ✅ Finance Goals (emergency fund, debt-free, targets)
-- ═══════════════════════════════════════════════════════════
