-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Flags 6-10: Appointments, Lab, Stock, IPD, Panchakarma
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 6: Appointment Slots & Bookings                                         ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- Doctor available slots (recurring template)
CREATE TABLE IF NOT EXISTS public.hms_doctor_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  doctor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_min INT DEFAULT 15,
  max_patients INT DEFAULT 20,
  consultation_type TEXT DEFAULT 'in_person' CHECK (consultation_type IN ('in_person','teleconsult','both')),
  is_active BOOLEAN DEFAULT true,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_doctor_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage doctor slots" ON public.hms_doctor_slots;
CREATE POLICY "Staff can manage doctor slots" ON public.hms_doctor_slots FOR ALL TO authenticated USING (true);

-- Actual bookings
CREATE TABLE IF NOT EXISTS public.hms_appointment_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.hms_op_patients(id) ON DELETE CASCADE,
  patient_display_id TEXT,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  -- Doctor
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_user_id UUID,
  doctor_name TEXT NOT NULL,
  -- Slot
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  slot_number INT,
  -- Type
  consultation_type TEXT DEFAULT 'in_person' CHECK (consultation_type IN ('in_person','teleconsult','follow_up','emergency')),
  purpose TEXT DEFAULT 'Consultation',
  chief_complaint TEXT,
  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','checked_in','in_consultation','completed','cancelled','no_show','rescheduled')),
  -- Payment
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','waived')),
  payment_mode TEXT,
  -- Booking source
  booked_via TEXT DEFAULT 'reception' CHECK (booked_via IN ('reception','online','phone','whatsapp','app')),
  booked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Notifications
  reminder_sent BOOLEAN DEFAULT false,
  -- Meta
  cancel_reason TEXT,
  notes TEXT,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_appointment_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view bookings" ON public.hms_appointment_bookings;
CREATE POLICY "Staff can view bookings" ON public.hms_appointment_bookings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Staff can insert bookings" ON public.hms_appointment_bookings;
CREATE POLICY "Staff can insert bookings" ON public.hms_appointment_bookings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Staff can update bookings" ON public.hms_appointment_bookings;
CREATE POLICY "Staff can update bookings" ON public.hms_appointment_bookings FOR UPDATE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.hms_appointment_bookings(appointment_date, doctor_name);
CREATE INDEX IF NOT EXISTS idx_bookings_patient ON public.hms_appointment_bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.hms_appointment_bookings(status, appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_doctor_date ON public.hms_appointment_bookings(doctor_name, appointment_date);

-- Check slot availability function
CREATE OR REPLACE FUNCTION check_slot_available(
  p_doctor_name TEXT,
  p_date DATE,
  p_start_time TIME,
  p_branch TEXT DEFAULT 'Main Branch'
) RETURNS BOOLEAN AS $$
DECLARE
  existing_count INT;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM hms_appointment_bookings
  WHERE doctor_name = p_doctor_name
    AND appointment_date = p_date
    AND start_time = p_start_time
    AND status NOT IN ('cancelled', 'rescheduled', 'no_show')
    AND branch = p_branch;
  RETURN existing_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 7: Lab Orders & Results                                                 ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- Lab test master
CREATE TABLE IF NOT EXISTS public.hms_lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_code TEXT NOT NULL UNIQUE,
  test_name TEXT NOT NULL,
  department TEXT DEFAULT 'Pathology',
  sample_type TEXT DEFAULT 'Blood',
  container_type TEXT,
  -- Reference ranges
  normal_range_text TEXT,
  normal_min DECIMAL(10,3),
  normal_max DECIMAL(10,3),
  unit TEXT,
  -- Pricing
  price DECIMAL(10,2) DEFAULT 0,
  -- Config
  tat_hours INT DEFAULT 24,
  is_outsourced BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_lab_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage lab tests" ON public.hms_lab_tests;
CREATE POLICY "Staff can manage lab tests" ON public.hms_lab_tests FOR ALL TO authenticated USING (true);

-- Lab orders (from doctor)
CREATE TABLE IF NOT EXISTS public.hms_lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  visit_id UUID REFERENCES public.hms_op_visits(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES public.hms_op_patients(id) ON DELETE CASCADE,
  patient_display_id TEXT,
  patient_name TEXT NOT NULL,
  -- Doctor
  ordered_by_name TEXT NOT NULL,
  ordered_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Order details
  priority TEXT DEFAULT 'routine' CHECK (priority IN ('routine','urgent','stat')),
  clinical_notes TEXT,
  diagnosis TEXT,
  -- Status
  status TEXT DEFAULT 'ordered' CHECK (status IN ('ordered','sample_collected','processing','completed','cancelled')),
  -- Billing
  total_amount DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  -- Meta
  order_date DATE DEFAULT CURRENT_DATE,
  sample_collected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_lab_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage lab orders" ON public.hms_lab_orders;
CREATE POLICY "Staff can manage lab orders" ON public.hms_lab_orders FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON public.hms_lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON public.hms_lab_orders(status, order_date);
CREATE INDEX IF NOT EXISTS idx_lab_orders_date ON public.hms_lab_orders(order_date DESC);

-- Lab order items (individual tests within an order)
CREATE TABLE IF NOT EXISTS public.hms_lab_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.hms_lab_orders(id) ON DELETE CASCADE,
  test_id UUID REFERENCES public.hms_lab_tests(id) ON DELETE SET NULL,
  test_name TEXT NOT NULL,
  test_code TEXT,
  sample_type TEXT,
  -- Result
  result_value TEXT,
  result_numeric DECIMAL(10,3),
  unit TEXT,
  normal_range TEXT,
  is_abnormal BOOLEAN DEFAULT false,
  is_critical BOOLEAN DEFAULT false,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','collected','processing','resulted','verified','cancelled')),
  resulted_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  -- Meta
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_lab_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage lab items" ON public.hms_lab_order_items;
CREATE POLICY "Staff can manage lab items" ON public.hms_lab_order_items FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_lab_items_order ON public.hms_lab_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_items_status ON public.hms_lab_order_items(status);

-- Auto-generate lab order number
CREATE OR REPLACE FUNCTION generate_lab_order_number()
RETURNS TEXT AS $$
DECLARE
  next_num INT;
  prefix TEXT;
BEGIN
  prefix := 'LAB-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-';
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM LENGTH(prefix) + 1) AS INT)), 0) + 1
  INTO next_num
  FROM hms_lab_orders
  WHERE order_number LIKE prefix || '%';
  RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 8: Stock / Inventory / GRN                                              ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- Products master
CREATE TABLE IF NOT EXISTS public.hms_stock_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT UNIQUE,
  product_name TEXT NOT NULL,
  generic_name TEXT,
  manufacturer TEXT,
  category TEXT DEFAULT 'Tablet',
  sub_category TEXT,
  hsn_code TEXT,
  -- Pricing
  mrp DECIMAL(10,2) DEFAULT 0,
  purchase_rate DECIMAL(10,2) DEFAULT 0,
  sale_rate DECIMAL(10,2) DEFAULT 0,
  gst_pct DECIMAL(5,2) DEFAULT 0,
  -- Stock control
  current_stock INT DEFAULT 0,
  reorder_level INT DEFAULT 10,
  min_qty INT DEFAULT 5,
  max_qty INT DEFAULT 500,
  -- Config
  unit TEXT DEFAULT 'Nos',
  rack_location TEXT,
  storage_condition TEXT,
  is_active BOOLEAN DEFAULT true,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_stock_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage products" ON public.hms_stock_products;
CREATE POLICY "Staff can manage products" ON public.hms_stock_products FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_stock_products_name ON public.hms_stock_products(product_name);
CREATE INDEX IF NOT EXISTS idx_stock_products_code ON public.hms_stock_products(product_code);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS public.hms_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  supplier_contact TEXT,
  -- Amounts
  total_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) DEFAULT 0,
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','confirmed','partially_received','fully_received','cancelled')),
  -- Meta
  po_date DATE DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  notes TEXT,
  branch TEXT DEFAULT 'Main Branch',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage POs" ON public.hms_purchase_orders;
CREATE POLICY "Staff can manage POs" ON public.hms_purchase_orders FOR ALL TO authenticated USING (true);

-- GRN (Goods Receipt Note)
CREATE TABLE IF NOT EXISTS public.hms_grn (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_number TEXT NOT NULL UNIQUE,
  po_id UUID REFERENCES public.hms_purchase_orders(id) ON DELETE SET NULL,
  supplier_name TEXT NOT NULL,
  supplier_invoice_no TEXT,
  supplier_invoice_date DATE,
  -- Amounts
  total_amount DECIMAL(12,2) DEFAULT 0,
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','confirmed','cancelled')),
  -- Meta
  grn_date DATE DEFAULT CURRENT_DATE,
  received_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_grn ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage GRN" ON public.hms_grn;
CREATE POLICY "Staff can manage GRN" ON public.hms_grn FOR ALL TO authenticated USING (true);

-- GRN Items (batch-level)
CREATE TABLE IF NOT EXISTS public.hms_grn_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_id UUID NOT NULL REFERENCES public.hms_grn(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.hms_stock_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  -- Batch
  batch_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  -- Quantities
  ordered_qty INT DEFAULT 0,
  received_qty INT NOT NULL,
  free_qty INT DEFAULT 0,
  -- Pricing
  purchase_rate DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2),
  gst_pct DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  -- Meta
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_grn_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage GRN items" ON public.hms_grn_items;
CREATE POLICY "Staff can manage GRN items" ON public.hms_grn_items FOR ALL TO authenticated USING (true);

-- Auto-generate PO/GRN numbers
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TEXT AS $$
DECLARE next_num INT; prefix TEXT;
BEGIN
  prefix := 'PO-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-';
  SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM LENGTH(prefix) + 1) AS INT)), 0) + 1
  INTO next_num FROM hms_purchase_orders WHERE po_number LIKE prefix || '%';
  RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_grn_number()
RETURNS TEXT AS $$
DECLARE next_num INT; prefix TEXT;
BEGIN
  prefix := 'GRN-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-';
  SELECT COALESCE(MAX(CAST(SUBSTRING(grn_number FROM LENGTH(prefix) + 1) AS INT)), 0) + 1
  INTO next_num FROM hms_grn WHERE grn_number LIKE prefix || '%';
  RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 9: IPD Admission & Discharge                                            ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- Wards & Beds
CREATE TABLE IF NOT EXISTS public.hms_wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_name TEXT NOT NULL,
  ward_type TEXT DEFAULT 'General' CHECK (ward_type IN ('General','Semi-Private','Private','ICU','Panchakarma','Paediatric','Maternity','Isolation')),
  floor TEXT,
  total_beds INT DEFAULT 10,
  charge_per_day DECIMAL(10,2) DEFAULT 500,
  is_active BOOLEAN DEFAULT true,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_wards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage wards" ON public.hms_wards;
CREATE POLICY "Staff can manage wards" ON public.hms_wards FOR ALL TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.hms_beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID NOT NULL REFERENCES public.hms_wards(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available','occupied','reserved','maintenance','cleaning')),
  current_patient_id UUID REFERENCES public.hms_op_patients(id) ON DELETE SET NULL,
  current_admission_id UUID,
  amenities TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_beds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage beds" ON public.hms_beds;
CREATE POLICY "Staff can manage beds" ON public.hms_beds FOR ALL TO authenticated USING (true);

-- IP Admissions
CREATE TABLE IF NOT EXISTS public.hms_ip_admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_number TEXT NOT NULL UNIQUE,
  patient_id UUID NOT NULL REFERENCES public.hms_op_patients(id) ON DELETE CASCADE,
  patient_display_id TEXT,
  patient_name TEXT NOT NULL,
  -- Ward & Bed
  ward_id UUID REFERENCES public.hms_wards(id) ON DELETE SET NULL,
  bed_id UUID REFERENCES public.hms_beds(id) ON DELETE SET NULL,
  ward_name TEXT,
  bed_number TEXT,
  -- Admission
  admission_date TIMESTAMPTZ DEFAULT now(),
  expected_discharge DATE,
  admitting_doctor TEXT NOT NULL,
  admitting_doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  department TEXT,
  diagnosis TEXT,
  reason_for_admission TEXT,
  -- Discharge
  discharge_date TIMESTAMPTZ,
  discharge_type TEXT CHECK (discharge_type IN ('normal','LAMA','DAMA','transfer','death','absconded')),
  discharge_summary TEXT,
  -- Billing
  advance_amount DECIMAL(12,2) DEFAULT 0,
  total_bill DECIMAL(12,2) DEFAULT 0,
  bill_status TEXT DEFAULT 'running' CHECK (bill_status IN ('running','finalized','paid','partial','insurance')),
  -- Status
  status TEXT DEFAULT 'admitted' CHECK (status IN ('admitted','discharged','transferred','deceased')),
  -- Meta
  branch TEXT DEFAULT 'Main Branch',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_ip_admissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage admissions" ON public.hms_ip_admissions;
CREATE POLICY "Staff can manage admissions" ON public.hms_ip_admissions FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_ip_admissions_patient ON public.hms_ip_admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_ip_admissions_status ON public.hms_ip_admissions(status);
CREATE INDEX IF NOT EXISTS idx_ip_admissions_date ON public.hms_ip_admissions(admission_date DESC);

-- Auto-generate IP number
CREATE OR REPLACE FUNCTION generate_ip_number()
RETURNS TEXT AS $$
DECLARE next_num INT; prefix TEXT;
BEGIN
  prefix := 'IP-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-';
  SELECT COALESCE(MAX(CAST(SUBSTRING(ip_number FROM LENGTH(prefix) + 1) AS INT)), 0) + 1
  INTO next_num FROM hms_ip_admissions WHERE ip_number LIKE prefix || '%';
  RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 10: Panchakarma Session Recording                                       ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- PK Packages (treatment bundles)
CREATE TABLE IF NOT EXISTS public.hms_pk_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name TEXT NOT NULL,
  duration_days INT NOT NULL,
  total_sessions INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  therapies JSONB DEFAULT '[]',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_pk_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage PK packages" ON public.hms_pk_packages;
CREATE POLICY "Staff can manage PK packages" ON public.hms_pk_packages FOR ALL TO authenticated USING (true);

-- Patient PK enrollment (patient assigned to a package)
CREATE TABLE IF NOT EXISTS public.hms_pk_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.hms_op_patients(id) ON DELETE CASCADE,
  patient_display_id TEXT,
  patient_name TEXT NOT NULL,
  package_id UUID REFERENCES public.hms_pk_packages(id) ON DELETE SET NULL,
  package_name TEXT NOT NULL,
  -- Doctor
  prescribing_doctor TEXT NOT NULL,
  -- Schedule
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  total_sessions INT NOT NULL,
  completed_sessions INT DEFAULT 0,
  -- Outcome
  pain_score_before INT,
  pain_score_after INT,
  odi_before INT,
  odi_after INT,
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','paused','cancelled')),
  -- Billing
  total_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  -- Meta
  notes TEXT,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_pk_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage PK enrollments" ON public.hms_pk_enrollments;
CREATE POLICY "Staff can manage PK enrollments" ON public.hms_pk_enrollments FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_pk_enrollments_patient ON public.hms_pk_enrollments(patient_id);
CREATE INDEX IF NOT EXISTS idx_pk_enrollments_status ON public.hms_pk_enrollments(status);

-- Individual PK sessions (one row per therapy session)
CREATE TABLE IF NOT EXISTS public.hms_pk_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.hms_pk_enrollments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.hms_op_patients(id) ON DELETE CASCADE,
  -- Session details
  session_number INT NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  therapy_name TEXT NOT NULL,
  therapy_type TEXT DEFAULT 'external' CHECK (therapy_type IN ('external','internal','procedure','poorvakarma','pradhana','paschath')),
  -- Time
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_min INT,
  -- Therapist
  therapist_name TEXT,
  therapist_id UUID,
  room TEXT,
  -- Materials
  oil_used TEXT,
  oil_quantity_ml INT,
  herbs_used TEXT,
  materials_notes TEXT,
  -- Clinical
  pain_before INT CHECK (pain_before BETWEEN 0 AND 10),
  pain_after INT CHECK (pain_after BETWEEN 0 AND 10),
  bp_before TEXT,
  bp_after TEXT,
  patient_response TEXT,
  observations TEXT,
  adverse_reactions TEXT,
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','completed','cancelled','no_show')),
  -- Meta
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_pk_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage PK sessions" ON public.hms_pk_sessions;
CREATE POLICY "Staff can manage PK sessions" ON public.hms_pk_sessions FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_pk_sessions_enrollment ON public.hms_pk_sessions(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_pk_sessions_patient ON public.hms_pk_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_pk_sessions_date ON public.hms_pk_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_pk_sessions_status ON public.hms_pk_sessions(status, session_date);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ Enable Realtime for live updates                                             ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_appointment_bookings;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_lab_orders;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_pk_sessions;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_ip_admissions;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;
