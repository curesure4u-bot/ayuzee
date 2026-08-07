-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — MIS Module Tables
-- Covers: Daily Collection Aggregation, EOD Reports, Scheduled Reports,
--         MIS Org Chart & Report Access Control
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 1: DAILY COLLECTION (aggregated billing per user/mode/dept)          ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS mis_daily_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_date DATE NOT NULL,
  location TEXT NOT NULL DEFAULT 'all',
  collected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  collected_by_name TEXT,
  department TEXT NOT NULL DEFAULT 'OPD',
  payment_mode TEXT NOT NULL DEFAULT 'cash' CHECK (payment_mode IN (
    'cash', 'card', 'cheque', 'dd', 'neft', 'credit', 'gpay', 'upi', 'wallet', 'insurance', 'other'
  )),
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  bill_count INTEGER NOT NULL DEFAULT 0,
  discount_total DECIMAL(10,2) DEFAULT 0,
  tax_total DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mis_daily_collection ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "HMS staff can view collection" ON mis_daily_collection;
CREATE POLICY "HMS staff can view collection"
  ON mis_daily_collection FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "HMS staff can insert collection" ON mis_daily_collection;
CREATE POLICY "HMS staff can insert collection"
  ON mis_daily_collection FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "HMS staff can update own collection" ON mis_daily_collection;
CREATE POLICY "HMS staff can update own collection"
  ON mis_daily_collection FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_mis_collection_date ON mis_daily_collection(collection_date DESC);
CREATE INDEX IF NOT EXISTS idx_mis_collection_location ON mis_daily_collection(location, collection_date);
CREATE INDEX IF NOT EXISTS idx_mis_collection_user ON mis_daily_collection(collected_by, collection_date);
CREATE INDEX IF NOT EXISTS idx_mis_collection_dept ON mis_daily_collection(department, collection_date);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 2: EOD REPORTS (end-of-day cash/summary snapshots)                   ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS mis_eod_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  location TEXT NOT NULL DEFAULT 'all',
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Summary numbers
  total_opd_visits INTEGER DEFAULT 0,
  total_ip_admissions INTEGER DEFAULT 0,
  total_ip_discharges INTEGER DEFAULT 0,
  new_patients INTEGER DEFAULT 0,
  repeat_patients INTEGER DEFAULT 0,
  total_appointments INTEGER DEFAULT 0,
  cancelled_appointments INTEGER DEFAULT 0,
  no_show_count INTEGER DEFAULT 0,
  avg_waiting_time_min DECIMAL(5,1) DEFAULT 0,
  
  -- Collection summary
  total_collection DECIMAL(12,2) DEFAULT 0,
  cash_collection DECIMAL(12,2) DEFAULT 0,
  digital_collection DECIMAL(12,2) DEFAULT 0,
  credit_given DECIMAL(12,2) DEFAULT 0,
  credit_recovered DECIMAL(12,2) DEFAULT 0,
  refunds DECIMAL(12,2) DEFAULT 0,
  
  -- Stock summary
  stock_value DECIMAL(14,2) DEFAULT 0,
  items_below_reorder INTEGER DEFAULT 0,
  items_expiring_30d INTEGER DEFAULT 0,
  
  -- Lab summary
  lab_orders_count INTEGER DEFAULT 0,
  lab_completed_count INTEGER DEFAULT 0,
  lab_pending_count INTEGER DEFAULT 0,
  lab_avg_tat_hrs DECIMAL(5,2) DEFAULT 0,
  
  -- Staff
  staff_present INTEGER DEFAULT 0,
  staff_absent INTEGER DEFAULT 0,
  
  -- Metadata
  ai_summary TEXT,
  detailed_json JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'sent')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(report_date, location)
);

ALTER TABLE mis_eod_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "HMS staff can view EOD reports" ON mis_eod_reports;
CREATE POLICY "HMS staff can view EOD reports"
  ON mis_eod_reports FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "HMS staff can create EOD reports" ON mis_eod_reports;
CREATE POLICY "HMS staff can create EOD reports"
  ON mis_eod_reports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "HMS staff can update EOD reports" ON mis_eod_reports;
CREATE POLICY "HMS staff can update EOD reports"
  ON mis_eod_reports FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_eod_reports_date ON mis_eod_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_eod_reports_location ON mis_eod_reports(location, report_date);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 3: SCHEDULED REPORTS (auto-send config for org reporting)            ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS mis_scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  reports JSONB NOT NULL DEFAULT '[]',
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN (
    'daily', 'weekly', 'monthly', 'quarterly'
  )),
  send_time TEXT DEFAULT '21:00',
  day_of_week TEXT,
  day_of_month INTEGER,
  recipients JSONB NOT NULL DEFAULT '[]',
  include_ai_summary BOOLEAN DEFAULT true,
  include_charts BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mis_scheduled_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage scheduled reports" ON mis_scheduled_reports;
CREATE POLICY "Owner can manage scheduled reports"
  ON mis_scheduled_reports FOR ALL
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "HMS staff can view scheduled reports" ON mis_scheduled_reports;
CREATE POLICY "HMS staff can view scheduled reports"
  ON mis_scheduled_reports FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_owner ON mis_scheduled_reports(owner_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next ON mis_scheduled_reports(next_send_at) WHERE is_active = true;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 4: ORG CHART / REPORT ACCESS (who can see which MIS reports)         ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS mis_org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'General',
  reports_to UUID REFERENCES mis_org_members(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  report_access JSONB DEFAULT '[]',
  org_level INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mis_org_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "HMS staff can view org members" ON mis_org_members;
CREATE POLICY "HMS staff can view org members"
  ON mis_org_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "HMS admins can manage org members" ON mis_org_members;
CREATE POLICY "HMS admins can manage org members"
  ON mis_org_members FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON mis_org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_reports_to ON mis_org_members(reports_to);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 5: HELPER VIEWS (for quick MIS dashboard queries)                    ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- View: Today's collection by user
CREATE OR REPLACE VIEW mis_today_collection_by_user AS
SELECT 
  collected_by_name,
  payment_mode,
  SUM(amount) as total_amount,
  SUM(bill_count) as total_bills
FROM mis_daily_collection
WHERE collection_date = CURRENT_DATE
GROUP BY collected_by_name, payment_mode
ORDER BY collected_by_name, payment_mode;

-- View: Collection by department for a given date
CREATE OR REPLACE VIEW mis_today_collection_by_dept AS
SELECT 
  department,
  SUM(amount) as total_amount,
  SUM(bill_count) as total_bills,
  ROUND(SUM(amount) * 100.0 / NULLIF((SELECT SUM(amount) FROM mis_daily_collection WHERE collection_date = CURRENT_DATE), 0), 1) as pct
FROM mis_daily_collection
WHERE collection_date = CURRENT_DATE
GROUP BY department
ORDER BY total_amount DESC;

-- View: Hourly collection today (from created_at timestamp)
CREATE OR REPLACE VIEW mis_today_hourly_collection AS
SELECT 
  EXTRACT(HOUR FROM created_at) as hour,
  SUM(amount) as total_amount
FROM mis_daily_collection
WHERE collection_date = CURRENT_DATE
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 6: FUNCTIONS (aggregation helpers)                                   ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- Function: Generate EOD report from daily collection data
CREATE OR REPLACE FUNCTION generate_eod_report(p_date DATE, p_location TEXT DEFAULT 'all')
RETURNS UUID AS $$
DECLARE
  report_id UUID;
  v_total_collection DECIMAL(12,2);
  v_cash DECIMAL(12,2);
  v_digital DECIMAL(12,2);
  v_credit DECIMAL(12,2);
BEGIN
  -- Calculate totals
  SELECT 
    COALESCE(SUM(amount), 0),
    COALESCE(SUM(CASE WHEN payment_mode = 'cash' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN payment_mode IN ('gpay', 'upi', 'card', 'neft') THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN payment_mode = 'credit' THEN amount ELSE 0 END), 0)
  INTO v_total_collection, v_cash, v_digital, v_credit
  FROM mis_daily_collection
  WHERE collection_date = p_date
    AND (p_location = 'all' OR location = p_location);

  -- Upsert EOD report
  INSERT INTO mis_eod_reports (report_date, location, total_collection, cash_collection, digital_collection, credit_given, generated_by)
  VALUES (p_date, p_location, v_total_collection, v_cash, v_digital, v_credit, auth.uid())
  ON CONFLICT (report_date, location)
  DO UPDATE SET 
    total_collection = EXCLUDED.total_collection,
    cash_collection = EXCLUDED.cash_collection,
    digital_collection = EXCLUDED.digital_collection,
    credit_given = EXCLUDED.credit_given,
    updated_at = NOW()
  RETURNING id INTO report_id;

  RETURN report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get collection summary for a date range
CREATE OR REPLACE FUNCTION get_mis_collection_summary(
  p_from DATE,
  p_to DATE,
  p_location TEXT DEFAULT 'all'
)
RETURNS TABLE (
  collection_date DATE,
  total_amount DECIMAL(12,2),
  cash_amount DECIMAL(12,2),
  card_amount DECIMAL(12,2),
  upi_amount DECIMAL(12,2),
  credit_amount DECIMAL(12,2),
  bill_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.collection_date,
    SUM(dc.amount)::DECIMAL(12,2) as total_amount,
    SUM(CASE WHEN dc.payment_mode = 'cash' THEN dc.amount ELSE 0 END)::DECIMAL(12,2),
    SUM(CASE WHEN dc.payment_mode = 'card' THEN dc.amount ELSE 0 END)::DECIMAL(12,2),
    SUM(CASE WHEN dc.payment_mode IN ('gpay', 'upi') THEN dc.amount ELSE 0 END)::DECIMAL(12,2),
    SUM(CASE WHEN dc.payment_mode = 'credit' THEN dc.amount ELSE 0 END)::DECIMAL(12,2),
    SUM(dc.bill_count)::BIGINT
  FROM mis_daily_collection dc
  WHERE dc.collection_date BETWEEN p_from AND p_to
    AND (p_location = 'all' OR dc.location = p_location)
  GROUP BY dc.collection_date
  ORDER BY dc.collection_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get appointments summary for MIS operational view
CREATE OR REPLACE FUNCTION get_mis_appointment_summary(
  p_from DATE,
  p_to DATE
)
RETURNS TABLE (
  doctor_id TEXT,
  doctor_name TEXT,
  total_visits BIGINT,
  completed BIGINT,
  cancelled BIGINT,
  no_show BIGINT,
  total_fee DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.doctor_id::TEXT,
    COALESCE(d.full_name, 'Unknown')::TEXT as doctor_name,
    COUNT(*)::BIGINT as total_visits,
    COUNT(*) FILTER (WHERE a.status = 'completed')::BIGINT,
    COUNT(*) FILTER (WHERE a.status = 'cancelled')::BIGINT,
    COUNT(*) FILTER (WHERE a.status = 'no_show')::BIGINT,
    COALESCE(SUM(a.fee), 0)::DECIMAL(12,2)
  FROM appointments a
  LEFT JOIN doctors d ON d.id = a.doctor_id
  WHERE a.appointment_date::DATE BETWEEN p_from AND p_to
  GROUP BY a.doctor_id, d.full_name
  ORDER BY total_visits DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
