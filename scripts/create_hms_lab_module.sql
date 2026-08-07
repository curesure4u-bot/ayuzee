-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Lab Module Core Tables
-- Covers: Lab Orders, Order Tests, Results, Dashboard Stats
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 1: LAB ORDERS                                                        ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS hms_lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT UNIQUE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  referred_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_by_name TEXT,
  department TEXT DEFAULT 'BIOCHEMISTRY',
  location TEXT DEFAULT 'all',
  order_type TEXT DEFAULT 'Lab' CHECK (order_type IN ('Lab', 'Misc', 'Radiology', 'AYUSH')),
  priority TEXT DEFAULT 'Routine' CHECK (priority IN ('Routine', 'Urgent', 'STAT')),
  status TEXT DEFAULT 'Ordered' CHECK (status IN (
    'Ordered', 'Sample Collected', 'In Progress', 'Completed',
    'Validated', 'Dispatched', 'Cancelled', 'On Hold', 'Rejected'
  )),
  total_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  payment_mode TEXT,
  payment_status TEXT DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Partial', 'Waived')),
  clinical_notes TEXT,
  special_instructions TEXT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  order_time TEXT,
  sample_collected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  dispatched_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_lab_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view lab orders" ON hms_lab_orders;
CREATE POLICY "Staff can view lab orders"
  ON hms_lab_orders FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage lab orders" ON hms_lab_orders;
CREATE POLICY "Staff can manage lab orders"
  ON hms_lab_orders FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_lab_orders_date ON hms_lab_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON hms_lab_orders(status, order_date);
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON hms_lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_doctor ON hms_lab_orders(referred_by_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_location ON hms_lab_orders(location, order_date);
CREATE INDEX IF NOT EXISTS idx_lab_orders_dept ON hms_lab_orders(department, order_date);

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_lab_order_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_no IS NULL THEN
    NEW.order_no := 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(
      (SELECT COALESCE(MAX(CAST(SUBSTRING(order_no FROM 10) AS INTEGER)), 0) + 1
       FROM hms_lab_orders WHERE order_no LIKE 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-%')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lab_order_no ON hms_lab_orders;
CREATE TRIGGER trg_lab_order_no
  BEFORE INSERT ON hms_lab_orders
  FOR EACH ROW EXECUTE FUNCTION generate_lab_order_no();

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 2: LAB ORDER TESTS (individual tests within an order)                ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS hms_lab_order_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES hms_lab_orders(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_code TEXT,
  test_type TEXT DEFAULT 'Test' CHECK (test_type IN ('Test', 'Profile')),
  department TEXT DEFAULT 'BIOCHEMISTRY',
  sample_type TEXT DEFAULT 'BLOOD',
  barcode_no TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'Ordered' CHECK (status IN (
    'Ordered', 'Sample Collected', 'In Progress', 'Completed',
    'Validated', 'Dispatched', 'Cancelled', 'Rejected'
  )),
  tat_target_minutes INTEGER,
  completed_at TIMESTAMPTZ,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_outsourced BOOLEAN DEFAULT false,
  outsource_lab_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_lab_order_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view order tests" ON hms_lab_order_tests;
CREATE POLICY "Staff can view order tests"
  ON hms_lab_order_tests FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage order tests" ON hms_lab_order_tests;
CREATE POLICY "Staff can manage order tests"
  ON hms_lab_order_tests FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_order_tests_order ON hms_lab_order_tests(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tests_status ON hms_lab_order_tests(status);
CREATE INDEX IF NOT EXISTS idx_order_tests_dept ON hms_lab_order_tests(department);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 3: LAB RESULTS (individual parameter results)                        ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS hms_lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_test_id UUID NOT NULL REFERENCES hms_lab_order_tests(id) ON DELETE CASCADE,
  order_id UUID REFERENCES hms_lab_orders(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  value TEXT,
  unit TEXT,
  method TEXT DEFAULT 'Numeric',
  normal_low DECIMAL(12,4),
  normal_high DECIMAL(12,4),
  normal_text TEXT,
  flag TEXT DEFAULT '' CHECK (flag IN ('', 'Normal', 'Low', 'High', 'Critical Low', 'Critical High')),
  is_abnormal BOOLEAN DEFAULT false,
  is_critical BOOLEAN DEFAULT false,
  previous_value TEXT,
  previous_date TEXT,
  comment TEXT,
  entered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ
);

ALTER TABLE hms_lab_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view lab results" ON hms_lab_results;
CREATE POLICY "Staff can view lab results"
  ON hms_lab_results FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage lab results" ON hms_lab_results;
CREATE POLICY "Staff can manage lab results"
  ON hms_lab_results FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_lab_results_order_test ON hms_lab_results(order_test_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_order ON hms_lab_results(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_critical ON hms_lab_results(is_critical) WHERE is_critical = true;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 4: HELPER FUNCTIONS                                                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- Function: Get lab dashboard stats for today
CREATE OR REPLACE FUNCTION get_lab_dashboard_stats(p_location TEXT DEFAULT 'all')
RETURNS TABLE (
  total_orders_today BIGINT,
  completed_today BIGINT,
  pending_today BIGINT,
  in_progress_today BIGINT,
  cancelled_today BIGINT,
  avg_tat_minutes DECIMAL(6,1),
  critical_alerts BIGINT,
  pending_amount DECIMAL(12,2),
  total_revenue_today DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE o.status IN ('Completed', 'Validated', 'Dispatched'))::BIGINT,
    COUNT(*) FILTER (WHERE o.status IN ('Ordered', 'Sample Collected'))::BIGINT,
    COUNT(*) FILTER (WHERE o.status = 'In Progress')::BIGINT,
    COUNT(*) FILTER (WHERE o.status = 'Cancelled')::BIGINT,
    COALESCE(AVG(EXTRACT(EPOCH FROM (o.completed_at - o.created_at)) / 60)
      FILTER (WHERE o.completed_at IS NOT NULL), 0)::DECIMAL(6,1),
    (SELECT COUNT(*) FROM hms_lab_results r
     JOIN hms_lab_order_tests ot ON r.order_test_id = ot.id
     JOIN hms_lab_orders lo ON ot.order_id = lo.id
     WHERE r.is_critical = true AND lo.order_date = CURRENT_DATE)::BIGINT,
    COALESCE(SUM(o.net_amount - o.paid_amount) FILTER (WHERE o.payment_status IN ('Pending', 'Partial')), 0)::DECIMAL(12,2),
    COALESCE(SUM(o.paid_amount), 0)::DECIMAL(12,2)
  FROM hms_lab_orders o
  WHERE o.order_date = CURRENT_DATE
    AND (p_location = 'all' OR o.location = p_location);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get lab revenue by test for a date range
CREATE OR REPLACE FUNCTION get_lab_revenue_by_test(
  p_from DATE,
  p_to DATE,
  p_location TEXT DEFAULT 'all'
)
RETURNS TABLE (
  test_name TEXT,
  test_count BIGINT,
  revenue DECIMAL(12,2),
  avg_price DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ot.test_name,
    COUNT(*)::BIGINT as test_count,
    SUM(ot.price)::DECIMAL(12,2) as revenue,
    AVG(ot.price)::DECIMAL(10,2) as avg_price
  FROM hms_lab_order_tests ot
  JOIN hms_lab_orders o ON ot.order_id = o.id
  WHERE o.order_date BETWEEN p_from AND p_to
    AND o.status != 'Cancelled'
    AND (p_location = 'all' OR o.location = p_location)
  GROUP BY ot.test_name
  ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get lab revenue by referring doctor
CREATE OR REPLACE FUNCTION get_lab_revenue_by_doctor(
  p_from DATE,
  p_to DATE,
  p_location TEXT DEFAULT 'all'
)
RETURNS TABLE (
  doctor_name TEXT,
  referral_count BIGINT,
  revenue DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(o.referred_by_name, 'Walk-in (Self)')::TEXT as doctor_name,
    COUNT(*)::BIGINT as referral_count,
    SUM(o.net_amount)::DECIMAL(12,2) as revenue
  FROM hms_lab_orders o
  WHERE o.order_date BETWEEN p_from AND p_to
    AND o.status != 'Cancelled'
    AND (p_location = 'all' OR o.location = p_location)
  GROUP BY o.referred_by_name
  ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get lab performance by department
CREATE OR REPLACE FUNCTION get_lab_dept_performance(
  p_from DATE,
  p_to DATE
)
RETURNS TABLE (
  department TEXT,
  test_count BIGINT,
  revenue DECIMAL(12,2),
  avg_tat_minutes DECIMAL(6,1),
  completed_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ot.department,
    COUNT(*)::BIGINT as test_count,
    SUM(ot.price)::DECIMAL(12,2) as revenue,
    COALESCE(AVG(EXTRACT(EPOCH FROM (ot.completed_at - o.created_at)) / 60)
      FILTER (WHERE ot.completed_at IS NOT NULL), 0)::DECIMAL(6,1) as avg_tat_minutes,
    COUNT(*) FILTER (WHERE ot.status IN ('Completed', 'Validated'))::BIGINT
  FROM hms_lab_order_tests ot
  JOIN hms_lab_orders o ON ot.order_id = o.id
  WHERE o.order_date BETWEEN p_from AND p_to
    AND o.status != 'Cancelled'
  GROUP BY ot.department
  ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
