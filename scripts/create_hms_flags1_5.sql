-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Flags 1-5: Clinical Notes, Prescriptions, Billing
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 1: SOAP / Clinical Notes                                                ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.hms_clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.hms_op_visits(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.hms_op_patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- SOAP Content
  note_type TEXT DEFAULT 'soap' CHECK (note_type IN ('soap', 'ayurveda', 'free_text', 'follow_up')),
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  -- Ayurveda-specific (optional)
  dosha_assessment TEXT,
  prakriti_notes TEXT,
  agni_status TEXT,
  ama_status TEXT,
  -- Meta
  is_signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_clinical_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view clinical notes" ON public.hms_clinical_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert clinical notes" ON public.hms_clinical_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update clinical notes" ON public.hms_clinical_notes FOR UPDATE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient ON public.hms_clinical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_visit ON public.hms_clinical_notes(visit_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_doctor ON public.hms_clinical_notes(doctor_user_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 4: Billing & Payments                                                   ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.hms_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number TEXT NOT NULL UNIQUE,
  visit_id UUID REFERENCES public.hms_op_visits(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES public.hms_op_patients(id) ON DELETE CASCADE,
  patient_display_id TEXT,
  patient_name TEXT NOT NULL,
  -- Bill details
  bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
  bill_type TEXT DEFAULT 'consultation' CHECK (bill_type IN ('consultation','pharmacy','lab','procedure','package','ip','miscellaneous')),
  -- Amounts
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  discount_reason TEXT,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  balance_amount DECIMAL(12,2) DEFAULT 0,
  -- Payment
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','partial','waived','refunded','insurance')),
  payment_mode TEXT CHECK (payment_mode IN ('cash','card','upi','online','cheque','insurance','wallet','credit','split')),
  payment_reference TEXT,
  -- Doctor / Department
  doctor_name TEXT,
  department TEXT,
  -- Rate plan
  rate_plan TEXT DEFAULT 'general',
  -- Meta
  is_cancelled BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  branch TEXT DEFAULT 'Main Branch',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view bills" ON public.hms_bills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert bills" ON public.hms_bills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update bills" ON public.hms_bills FOR UPDATE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_hms_bills_patient ON public.hms_bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_hms_bills_date ON public.hms_bills(bill_date DESC);
CREATE INDEX IF NOT EXISTS idx_hms_bills_status ON public.hms_bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_hms_bills_number ON public.hms_bills(bill_number);

-- Bill line items
CREATE TABLE IF NOT EXISTS public.hms_bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES public.hms_bills(id) ON DELETE CASCADE,
  item_type TEXT DEFAULT 'service' CHECK (item_type IN ('service','medicine','investigation','procedure','consumable','package')),
  item_name TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_pct DECIMAL(5,2) DEFAULT 0,
  tax_pct DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  hsn_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_bill_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage bill items" ON public.hms_bill_items FOR ALL TO authenticated USING (true);

-- Payment receipts (for split payments / multiple receipts per bill)
CREATE TABLE IF NOT EXISTS public.hms_payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT NOT NULL UNIQUE,
  bill_id UUID NOT NULL REFERENCES public.hms_bills(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.hms_op_patients(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash','card','upi','online','cheque','insurance','wallet')),
  payment_reference TEXT,
  received_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  receipt_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_payment_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage receipts" ON public.hms_payment_receipts FOR ALL TO authenticated USING (true);

-- Auto-generate bill number
CREATE OR REPLACE FUNCTION generate_bill_number(p_branch TEXT DEFAULT 'Main Branch')
RETURNS TEXT AS $$
DECLARE
  next_num INT;
  prefix TEXT;
BEGIN
  prefix := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-';
  SELECT COALESCE(MAX(CAST(SUBSTRING(bill_number FROM LENGTH(prefix) + 1) AS INT)), 0) + 1
  INTO next_num
  FROM hms_bills
  WHERE bill_number LIKE prefix || '%';
  RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  next_num INT;
  prefix TEXT;
BEGIN
  prefix := 'RCP-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-';
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM LENGTH(prefix) + 1) AS INT)), 0) + 1
  INTO next_num
  FROM hms_payment_receipts
  WHERE receipt_number LIKE prefix || '%';
  RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 5: Prescriptions (Doctor → Pharmacy flow)                               ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.hms_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.hms_op_visits(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES public.hms_op_patients(id) ON DELETE CASCADE,
  patient_display_id TEXT,
  patient_name TEXT NOT NULL,
  -- Doctor
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  doctor_name TEXT NOT NULL,
  -- Prescription
  diagnosis TEXT,
  icd_code TEXT,
  namaste_code TEXT,
  -- Status flow
  status TEXT DEFAULT 'active' CHECK (status IN ('draft','active','dispensed','partially_dispensed','cancelled','expired')),
  pharmacy_status TEXT DEFAULT 'pending' CHECK (pharmacy_status IN ('pending','in_progress','dispensed','partially_dispensed','cancelled')),
  -- Meta
  is_signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  valid_days INT DEFAULT 30,
  follow_up_date DATE,
  special_instructions TEXT,
  diet_instructions TEXT,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view prescriptions" ON public.hms_prescriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert prescriptions" ON public.hms_prescriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff can update prescriptions" ON public.hms_prescriptions FOR UPDATE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.hms_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_visit ON public.hms_prescriptions(visit_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_pharmacy ON public.hms_prescriptions(pharmacy_status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON public.hms_prescriptions(created_at DESC);

-- Prescription items (medicines)
CREATE TABLE IF NOT EXISTS public.hms_prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES public.hms_prescriptions(id) ON DELETE CASCADE,
  -- Medicine
  medicine_name TEXT NOT NULL,
  generic_name TEXT,
  medicine_type TEXT DEFAULT 'internal' CHECK (medicine_type IN ('internal','external','procedure','investigation')),
  -- Dosage
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  duration_days INT,
  route TEXT DEFAULT 'oral' CHECK (route IN ('oral','topical','nasal','rectal','injectable','inhalation','sublingual','other')),
  timing TEXT,
  -- Ayurveda specific
  anupana TEXT,
  classical_ref TEXT,
  -- Pharmacy
  quantity INT,
  is_dispensed BOOLEAN DEFAULT false,
  dispensed_qty INT DEFAULT 0,
  -- Meta
  instructions TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_prescription_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage prescription items" ON public.hms_prescription_items FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_rx_items_prescription ON public.hms_prescription_items(prescription_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ Enable Realtime for live OPD queue                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_op_visits;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_prescriptions;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_clinical_notes;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;
