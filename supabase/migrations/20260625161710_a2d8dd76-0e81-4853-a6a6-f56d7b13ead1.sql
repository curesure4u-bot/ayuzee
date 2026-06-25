
-- ============= RATE PLANS =============
CREATE TABLE IF NOT EXISTS public.hms_rate_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('standard','corporate','insurance','franchise','concessional','vip')),
  description TEXT,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  applicable_to TEXT NOT NULL DEFAULT 'all',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_rate_plans TO authenticated;
GRANT ALL ON public.hms_rate_plans TO service_role;
ALTER TABLE public.hms_rate_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rate_plans_admin_all" ON public.hms_rate_plans;
DROP POLICY IF EXISTS "rate_plans_authn_select" ON public.hms_rate_plans;
CREATE POLICY "rate_plans_admin_all" ON public.hms_rate_plans FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "rate_plans_authn_select" ON public.hms_rate_plans FOR SELECT TO authenticated USING (is_active);

CREATE TABLE IF NOT EXISTS public.hms_rate_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_plan_id UUID NOT NULL REFERENCES public.hms_rate_plans(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('procedure','medicine','package')),
  item_id UUID,
  item_name TEXT NOT NULL,
  custom_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_rate_plan_items TO authenticated;
GRANT ALL ON public.hms_rate_plan_items TO service_role;
ALTER TABLE public.hms_rate_plan_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rate_plan_items_admin_all" ON public.hms_rate_plan_items;
DROP POLICY IF EXISTS "rate_plan_items_authn_select" ON public.hms_rate_plan_items;
CREATE POLICY "rate_plan_items_admin_all" ON public.hms_rate_plan_items FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "rate_plan_items_authn_select" ON public.hms_rate_plan_items FOR SELECT TO authenticated USING (true);

-- ============= TAX SLABS =============
CREATE TABLE IF NOT EXISTS public.hms_tax_slabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_name TEXT NOT NULL,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  tax_type TEXT NOT NULL CHECK (tax_type IN ('gst','igst','cess')),
  applicable_to TEXT NOT NULL CHECK (applicable_to IN ('medicines','services','both')),
  hsn_code_range TEXT,
  is_default_for_services BOOLEAN NOT NULL DEFAULT false,
  is_default_for_medicines BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_tax_slabs TO authenticated;
GRANT ALL ON public.hms_tax_slabs TO service_role;
ALTER TABLE public.hms_tax_slabs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tax_admin_all" ON public.hms_tax_slabs;
DROP POLICY IF EXISTS "tax_authn_select" ON public.hms_tax_slabs;
CREATE POLICY "tax_admin_all" ON public.hms_tax_slabs FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "tax_authn_select" ON public.hms_tax_slabs FOR SELECT TO authenticated USING (is_active);

-- ============= BILLING MASTER =============
CREATE TABLE IF NOT EXISTS public.hms_payment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_type_name TEXT NOT NULL,
  payment_type_code TEXT,
  is_online BOOLEAN NOT NULL DEFAULT false,
  gateway TEXT NOT NULL DEFAULT 'other',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_payment_types TO authenticated;
GRANT ALL ON public.hms_payment_types TO service_role;
ALTER TABLE public.hms_payment_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "paytypes_admin_all" ON public.hms_payment_types;
DROP POLICY IF EXISTS "paytypes_authn_select" ON public.hms_payment_types;
CREATE POLICY "paytypes_admin_all" ON public.hms_payment_types FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "paytypes_authn_select" ON public.hms_payment_types FOR SELECT TO authenticated USING (is_active);

CREATE TABLE IF NOT EXISTS public.hms_discount_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL,
  max_discount_percent NUMERIC NOT NULL DEFAULT 100,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  approval_threshold_percent NUMERIC NOT NULL DEFAULT 20,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_discount_categories TO authenticated;
GRANT ALL ON public.hms_discount_categories TO service_role;
ALTER TABLE public.hms_discount_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "disccat_admin_all" ON public.hms_discount_categories;
DROP POLICY IF EXISTS "disccat_authn_select" ON public.hms_discount_categories;
CREATE POLICY "disccat_admin_all" ON public.hms_discount_categories FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "disccat_authn_select" ON public.hms_discount_categories FOR SELECT TO authenticated USING (is_active);

CREATE TABLE IF NOT EXISTS public.hms_discount_remarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remark_text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_discount_remarks TO authenticated;
GRANT ALL ON public.hms_discount_remarks TO service_role;
ALTER TABLE public.hms_discount_remarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discremarks_admin_all" ON public.hms_discount_remarks;
DROP POLICY IF EXISTS "discremarks_authn_select" ON public.hms_discount_remarks;
CREATE POLICY "discremarks_admin_all" ON public.hms_discount_remarks FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "discremarks_authn_select" ON public.hms_discount_remarks FOR SELECT TO authenticated USING (is_active);

CREATE TABLE IF NOT EXISTS public.hms_expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL,
  category_code TEXT,
  parent_category_id UUID REFERENCES public.hms_expense_categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_expense_categories TO authenticated;
GRANT ALL ON public.hms_expense_categories TO service_role;
ALTER TABLE public.hms_expense_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expcat_admin_all" ON public.hms_expense_categories;
DROP POLICY IF EXISTS "expcat_authn_select" ON public.hms_expense_categories;
CREATE POLICY "expcat_admin_all" ON public.hms_expense_categories FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "expcat_authn_select" ON public.hms_expense_categories FOR SELECT TO authenticated USING (is_active);

CREATE TABLE IF NOT EXISTS public.hms_bill_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  branch_id UUID REFERENCES public.hms_branches(id) ON DELETE SET NULL,
  financial_year_start DATE,
  current_number INTEGER NOT NULL DEFAULT 1,
  reset_on_financial_year BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_bill_series TO authenticated;
GRANT ALL ON public.hms_bill_series TO service_role;
ALTER TABLE public.hms_bill_series ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "billseries_admin_all" ON public.hms_bill_series;
DROP POLICY IF EXISTS "billseries_authn_select" ON public.hms_bill_series;
CREATE POLICY "billseries_admin_all" ON public.hms_bill_series FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "billseries_authn_select" ON public.hms_bill_series FOR SELECT TO authenticated USING (is_active);

-- ============= SETTLEMENT + INSURANCE =============
CREATE TABLE IF NOT EXISTS public.hms_settlement_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  settlement_type TEXT NOT NULL CHECK (settlement_type IN ('insurance_tpa','corporate','franchise')),
  partner_name TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  credit_period_days INTEGER NOT NULL DEFAULT 30,
  settlement_day_of_month INTEGER NOT NULL DEFAULT 5,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_settlement_rules TO authenticated;
GRANT ALL ON public.hms_settlement_rules TO service_role;
ALTER TABLE public.hms_settlement_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settle_admin_all" ON public.hms_settlement_rules;
CREATE POLICY "settle_admin_all" ON public.hms_settlement_rules FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TABLE IF NOT EXISTS public.hms_insurance_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('insurance','tpa','corporate','ngo')),
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  empanelment_date DATE,
  empanelment_no TEXT,
  rate_plan_id UUID REFERENCES public.hms_rate_plans(id) ON DELETE SET NULL,
  credit_limit NUMERIC NOT NULL DEFAULT 0,
  credit_days INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_insurance_partners TO authenticated;
GRANT ALL ON public.hms_insurance_partners TO service_role;
ALTER TABLE public.hms_insurance_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "insurance_admin_all" ON public.hms_insurance_partners;
CREATE POLICY "insurance_admin_all" ON public.hms_insurance_partners FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));

-- ============= WARDS + BEDS =============
CREATE TABLE IF NOT EXISTS public.hms_wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_name TEXT NOT NULL,
  ward_type TEXT NOT NULL CHECK (ward_type IN ('general','private','semi_private','observation','panchakarma_room','yoga_hall','therapy_room')),
  branch_id UUID REFERENCES public.hms_branches(id) ON DELETE SET NULL,
  floor TEXT,
  total_beds INTEGER NOT NULL DEFAULT 0,
  daily_charge NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_wards TO authenticated;
GRANT ALL ON public.hms_wards TO service_role;
ALTER TABLE public.hms_wards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wards_admin_all" ON public.hms_wards;
DROP POLICY IF EXISTS "wards_authn_select" ON public.hms_wards;
CREATE POLICY "wards_admin_all" ON public.hms_wards FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "wards_authn_select" ON public.hms_wards FOR SELECT TO authenticated USING (is_active);

CREATE TABLE IF NOT EXISTS public.hms_ward_beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID NOT NULL REFERENCES public.hms_wards(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  bed_type TEXT NOT NULL DEFAULT 'general',
  daily_charge_override NUMERIC,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','cleaning','maintenance')),
  current_patient_name TEXT,
  current_patient_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_ward_beds TO authenticated;
GRANT ALL ON public.hms_ward_beds TO service_role;
ALTER TABLE public.hms_ward_beds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "beds_admin_all" ON public.hms_ward_beds;
DROP POLICY IF EXISTS "beds_authn_update" ON public.hms_ward_beds;
DROP POLICY IF EXISTS "beds_authn_select" ON public.hms_ward_beds;
CREATE POLICY "beds_admin_all" ON public.hms_ward_beds FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "beds_authn_update" ON public.hms_ward_beds FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "beds_authn_select" ON public.hms_ward_beds FOR SELECT TO authenticated USING (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_ward_beds;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TABLE public.hms_ward_beds REPLICA IDENTITY FULL;

-- ============= IP ADMISSION =============
CREATE TABLE IF NOT EXISTS public.hms_ip_admission_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_type_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('elective','emergency','day_care','observation')),
  default_ward_type TEXT,
  default_duration_days INTEGER NOT NULL DEFAULT 1,
  requires_deposit BOOLEAN NOT NULL DEFAULT false,
  deposit_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_ip_admission_types TO authenticated;
GRANT ALL ON public.hms_ip_admission_types TO service_role;
ALTER TABLE public.hms_ip_admission_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ipadmtypes_admin_all" ON public.hms_ip_admission_types;
DROP POLICY IF EXISTS "ipadmtypes_authn_select" ON public.hms_ip_admission_types;
CREATE POLICY "ipadmtypes_admin_all" ON public.hms_ip_admission_types FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "ipadmtypes_authn_select" ON public.hms_ip_admission_types FOR SELECT TO authenticated USING (is_active);

CREATE TABLE IF NOT EXISTS public.hms_ip_admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL DEFAULT auth.uid(),
  branch_id UUID REFERENCES public.hms_branches(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.vaidya_patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  ward_id UUID REFERENCES public.hms_wards(id) ON DELETE SET NULL,
  bed_id UUID REFERENCES public.hms_ward_beds(id) ON DELETE SET NULL,
  admission_type_id UUID REFERENCES public.hms_ip_admission_types(id) ON DELETE SET NULL,
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_discharge DATE,
  actual_discharge DATE,
  admitting_doctor_name TEXT,
  treating_doctor_name TEXT,
  admission_reason TEXT,
  diagnosis_at_admission TEXT,
  deposit_collected NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'admitted' CHECK (status IN ('admitted','discharged','transferred','absconded')),
  discharge_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_ip_admissions TO authenticated;
GRANT ALL ON public.hms_ip_admissions TO service_role;
ALTER TABLE public.hms_ip_admissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ipadm_owner_all" ON public.hms_ip_admissions;
CREATE POLICY "ipadm_owner_all" ON public.hms_ip_admissions FOR ALL TO authenticated USING (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid())) WITH CHECK (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid()));

-- ============= AREA MASTER =============
CREATE TABLE IF NOT EXISTS public.hms_service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name TEXT NOT NULL,
  city TEXT,
  district TEXT,
  state TEXT NOT NULL DEFAULT 'Tamil Nadu',
  pincode TEXT,
  zone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_service_areas TO authenticated;
GRANT ALL ON public.hms_service_areas TO service_role;
ALTER TABLE public.hms_service_areas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "areas_admin_all" ON public.hms_service_areas;
DROP POLICY IF EXISTS "areas_authn_select" ON public.hms_service_areas;
CREATE POLICY "areas_admin_all" ON public.hms_service_areas FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "areas_authn_select" ON public.hms_service_areas FOR SELECT TO authenticated USING (is_active);

-- ============= PATIENT CONFIG STUBS =============
CREATE TABLE IF NOT EXISTS public.hms_patient_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_patient_sources TO authenticated;
GRANT ALL ON public.hms_patient_sources TO service_role;
ALTER TABLE public.hms_patient_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "psources_admin_all" ON public.hms_patient_sources;
DROP POLICY IF EXISTS "psources_authn_select" ON public.hms_patient_sources;
CREATE POLICY "psources_admin_all" ON public.hms_patient_sources FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "psources_authn_select" ON public.hms_patient_sources FOR SELECT TO authenticated USING (is_active);

CREATE TABLE IF NOT EXISTS public.hms_membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  description TEXT,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  validity_days INTEGER NOT NULL DEFAULT 365,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_membership_plans TO authenticated;
GRANT ALL ON public.hms_membership_plans TO service_role;
ALTER TABLE public.hms_membership_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "memplans_admin_all" ON public.hms_membership_plans;
DROP POLICY IF EXISTS "memplans_authn_select" ON public.hms_membership_plans;
CREATE POLICY "memplans_admin_all" ON public.hms_membership_plans FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "memplans_authn_select" ON public.hms_membership_plans FOR SELECT TO authenticated USING (is_active);

-- ============= EXTEND vaidya_bills + vaidya_patients =============
ALTER TABLE public.vaidya_bills
  ADD COLUMN IF NOT EXISTS rate_plan_id UUID REFERENCES public.hms_rate_plans(id),
  ADD COLUMN IF NOT EXISTS discount_category_id UUID REFERENCES public.hms_discount_categories(id),
  ADD COLUMN IF NOT EXISTS bill_series_id UUID REFERENCES public.hms_bill_series(id),
  ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS currency_amount NUMERIC;

ALTER TABLE public.vaidya_patients
  ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES public.hms_patient_sources(id),
  ADD COLUMN IF NOT EXISTS id_proof_type TEXT,
  ADD COLUMN IF NOT EXISTS id_proof_number TEXT,
  ADD COLUMN IF NOT EXISTS membership_plan_id UUID REFERENCES public.hms_membership_plans(id),
  ADD COLUMN IF NOT EXISTS patient_labels UUID[] DEFAULT '{}';

-- ============= MIS DATA TABLES =============
CREATE TABLE IF NOT EXISTS public.vaidya_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL DEFAULT auth.uid(),
  patient_name TEXT, phone TEXT, reminder_type TEXT,
  reminder_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message TEXT, status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vaidya_reminders TO authenticated;
GRANT ALL ON public.vaidya_reminders TO service_role;
ALTER TABLE public.vaidya_reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vreminders_owner_all" ON public.vaidya_reminders;
CREATE POLICY "vreminders_owner_all" ON public.vaidya_reminders FOR ALL TO authenticated USING (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid())) WITH CHECK (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid()));

CREATE TABLE IF NOT EXISTS public.vaidya_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL DEFAULT auth.uid(),
  branch_id UUID REFERENCES public.hms_branches(id) ON DELETE SET NULL,
  asset_name TEXT NOT NULL, category TEXT,
  purchase_date DATE, purchase_price NUMERIC, vendor TEXT,
  warranty_until DATE, condition TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vaidya_assets TO authenticated;
GRANT ALL ON public.vaidya_assets TO service_role;
ALTER TABLE public.vaidya_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vassets_owner_all" ON public.vaidya_assets;
CREATE POLICY "vassets_owner_all" ON public.vaidya_assets FOR ALL TO authenticated USING (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid())) WITH CHECK (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid()));

CREATE TABLE IF NOT EXISTS public.vaidya_staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL DEFAULT auth.uid(),
  branch_id UUID REFERENCES public.hms_branches(id) ON DELETE SET NULL,
  staff_name TEXT NOT NULL, staff_role TEXT,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIME, check_out_time TIME,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','half_day','leave')),
  notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vaidya_staff_attendance TO authenticated;
GRANT ALL ON public.vaidya_staff_attendance TO service_role;
ALTER TABLE public.vaidya_staff_attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vatt_owner_all" ON public.vaidya_staff_attendance;
CREATE POLICY "vatt_owner_all" ON public.vaidya_staff_attendance FOR ALL TO authenticated USING (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid())) WITH CHECK (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid()));

CREATE TABLE IF NOT EXISTS public.vaidya_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL DEFAULT auth.uid(),
  title TEXT NOT NULL, assigned_to_name TEXT, due_date DATE,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vaidya_tasks TO authenticated;
GRANT ALL ON public.vaidya_tasks TO service_role;
ALTER TABLE public.vaidya_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vtasks_owner_all" ON public.vaidya_tasks;
CREATE POLICY "vtasks_owner_all" ON public.vaidya_tasks FOR ALL TO authenticated USING (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid())) WITH CHECK (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid()));

CREATE TABLE IF NOT EXISTS public.vaidya_vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL DEFAULT auth.uid(),
  patient_name TEXT, phone TEXT, vaccine_name TEXT NOT NULL,
  dose_number INTEGER NOT NULL DEFAULT 1,
  vaccination_date DATE, next_due_date DATE,
  batch_no TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vaidya_vaccinations TO authenticated;
GRANT ALL ON public.vaidya_vaccinations TO service_role;
ALTER TABLE public.vaidya_vaccinations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vvacc_owner_all" ON public.vaidya_vaccinations;
CREATE POLICY "vvacc_owner_all" ON public.vaidya_vaccinations FOR ALL TO authenticated USING (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid())) WITH CHECK (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid()));

CREATE TABLE IF NOT EXISTS public.vaidya_whatsapp_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL DEFAULT auth.uid(),
  patient_phone TEXT, message_preview TEXT, template_name TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vaidya_whatsapp_log TO authenticated;
GRANT ALL ON public.vaidya_whatsapp_log TO service_role;
ALTER TABLE public.vaidya_whatsapp_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vwa_owner_all" ON public.vaidya_whatsapp_log;
CREATE POLICY "vwa_owner_all" ON public.vaidya_whatsapp_log FOR ALL TO authenticated USING (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid())) WITH CHECK (doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid()));

-- ============= SEEDS =============
INSERT INTO public.hms_rate_plans (plan_name, plan_type, description, discount_percent, applicable_to, is_default)
SELECT * FROM (VALUES
  ('Standard','standard','Default rate for all walk-in patients',0::numeric,'all',true),
  ('Corporate','corporate','For empanelled B2B company employees',10::numeric,'all',false),
  ('Insurance/TPA','insurance','Insurance/TPA approved patients with custom item prices',0::numeric,'all',false),
  ('Franchise','franchise','For franchisee centers',15::numeric,'procedures',false),
  ('Concessional/BPL','concessional','For BPL/economically weak patients',40::numeric,'consultations',false)
) AS v(plan_name,plan_type,description,discount_percent,applicable_to,is_default)
WHERE NOT EXISTS (SELECT 1 FROM public.hms_rate_plans WHERE plan_name = v.plan_name);

INSERT INTO public.hms_tax_slabs (tax_name, tax_rate, tax_type, applicable_to, is_default_for_services, is_default_for_medicines)
SELECT * FROM (VALUES
  ('Healthcare Services — Exempt',0::numeric,'gst','services',true,false),
  ('Ayurvedic Medicines (patent)',12::numeric,'gst','medicines',false,false),
  ('Herbal Formulations (unbranded)',0::numeric,'gst','medicines',false,true),
  ('Medical Devices/Equipment',12::numeric,'gst','both',false,false),
  ('Yoga & Wellness Services',0::numeric,'gst','services',false,false)
) AS v(tax_name,tax_rate,tax_type,applicable_to,is_default_for_services,is_default_for_medicines)
WHERE NOT EXISTS (SELECT 1 FROM public.hms_tax_slabs WHERE tax_name = v.tax_name);

INSERT INTO public.hms_payment_types (payment_type_name, payment_type_code, is_online, gateway, sort_order)
SELECT * FROM (VALUES
  ('Cash','CASH',false,'other',1),('UPI','UPI',true,'other',2),('Card (POS)','CARD',false,'other',3),
  ('NEFT/RTGS','NEFT',true,'other',4),('Cheque','CHEQUE',false,'other',5),
  ('Insurance/TPA','INSURANCE',false,'other',6),('Wallet','WALLET',true,'other',7),
  ('Complimentary','COMP',false,'other',8),('Franchise Credit','FRANCHISE',false,'other',9)
) AS v(payment_type_name,payment_type_code,is_online,gateway,sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.hms_payment_types WHERE payment_type_name = v.payment_type_name);

INSERT INTO public.hms_discount_categories (category_name, max_discount_percent, requires_approval, approval_threshold_percent)
SELECT * FROM (VALUES
  ('Staff Discount',50::numeric,true,20::numeric),('VIP Discount',30::numeric,true,20::numeric),
  ('Senior Citizen',15::numeric,false,20::numeric),('BPL/Charity',100::numeric,true,20::numeric),
  ('Referral Discount',10::numeric,false,20::numeric),('Package Discount',25::numeric,false,20::numeric),
  ('Festival Offer',20::numeric,false,20::numeric)
) AS v(category_name,max_discount_percent,requires_approval,approval_threshold_percent)
WHERE NOT EXISTS (SELECT 1 FROM public.hms_discount_categories WHERE category_name = v.category_name);

INSERT INTO public.hms_discount_remarks (remark_text)
SELECT v FROM unnest(ARRAY['Loyalty patient','Staff family member','Doctor referral','Financial hardship','Package deal','Festival offer','Management approval']) AS v
WHERE NOT EXISTS (SELECT 1 FROM public.hms_discount_remarks WHERE remark_text = v);

DO $$
DECLARE p1 UUID; p2 UUID; p3 UUID; p4 UUID; p5 UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.hms_expense_categories WHERE category_name='Operational' AND parent_category_id IS NULL) THEN
    INSERT INTO public.hms_expense_categories (category_name,category_code) VALUES ('Operational','OP') RETURNING id INTO p1;
    INSERT INTO public.hms_expense_categories (category_name,parent_category_id) VALUES ('Rent',p1),('Electricity',p1),('Water',p1),('Internet',p1);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.hms_expense_categories WHERE category_name='Staff' AND parent_category_id IS NULL) THEN
    INSERT INTO public.hms_expense_categories (category_name,category_code) VALUES ('Staff','ST') RETURNING id INTO p2;
    INSERT INTO public.hms_expense_categories (category_name,parent_category_id) VALUES ('Salary',p2),('Incentive',p2),('PF',p2),('ESI',p2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.hms_expense_categories WHERE category_name='Medical' AND parent_category_id IS NULL) THEN
    INSERT INTO public.hms_expense_categories (category_name,category_code) VALUES ('Medical','MD') RETURNING id INTO p3;
    INSERT INTO public.hms_expense_categories (category_name,parent_category_id) VALUES ('Medicine Purchase',p3),('Equipment',p3),('Consumables',p3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.hms_expense_categories WHERE category_name='Marketing' AND parent_category_id IS NULL) THEN
    INSERT INTO public.hms_expense_categories (category_name,category_code) VALUES ('Marketing','MK') RETURNING id INTO p4;
    INSERT INTO public.hms_expense_categories (category_name,parent_category_id) VALUES ('Digital',p4),('Print',p4),('Events',p4);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.hms_expense_categories WHERE category_name='Others' AND parent_category_id IS NULL) THEN
    INSERT INTO public.hms_expense_categories (category_name,category_code) VALUES ('Others','OT') RETURNING id INTO p5;
    INSERT INTO public.hms_expense_categories (category_name,parent_category_id) VALUES ('Travel',p5),('Pantry',p5),('Miscellaneous',p5);
  END IF;
END $$;

DO $$
DECLARE b RECORD; idx INT := 1; pfx TEXT;
BEGIN
  FOR b IN SELECT id, branch_name FROM public.hms_branches ORDER BY created_at LOOP
    pfx := 'ALSH-' || lpad(idx::text,2,'0');
    INSERT INTO public.hms_bill_series (series_name, prefix, branch_id, financial_year_start)
    SELECT 'Series ' || pfx, pfx, b.id, DATE '2025-04-01'
    WHERE NOT EXISTS (SELECT 1 FROM public.hms_bill_series WHERE prefix = pfx);
    idx := idx + 1;
  END LOOP;
END $$;

DO $$
DECLARE w1 UUID; w2 UUID; w3 UUID; i INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.hms_wards WHERE ward_name='General Ward') THEN
    INSERT INTO public.hms_wards (ward_name, ward_type, total_beds, daily_charge) VALUES ('General Ward','general',8,500) RETURNING id INTO w1;
    FOR i IN 1..8 LOOP
      INSERT INTO public.hms_ward_beds (ward_id, bed_number) VALUES (w1, 'G-' || lpad(i::text,2,'0'));
    END LOOP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.hms_wards WHERE ward_name='Semi-Private Room') THEN
    INSERT INTO public.hms_wards (ward_name, ward_type, total_beds, daily_charge) VALUES ('Semi-Private Room','semi_private',4,1000) RETURNING id INTO w2;
    FOR i IN 1..4 LOOP
      INSERT INTO public.hms_ward_beds (ward_id, bed_number) VALUES (w2, 'SP-' || lpad(i::text,2,'0'));
    END LOOP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.hms_wards WHERE ward_name='Panchakarma Suite') THEN
    INSERT INTO public.hms_wards (ward_name, ward_type, total_beds, daily_charge) VALUES ('Panchakarma Suite','panchakarma_room',3,1500) RETURNING id INTO w3;
    FOR i IN 1..3 LOOP
      INSERT INTO public.hms_ward_beds (ward_id, bed_number) VALUES (w3, 'PK-' || lpad(i::text,2,'0'));
    END LOOP;
  END IF;
END $$;

INSERT INTO public.hms_ip_admission_types (admission_type_name, category, default_ward_type, default_duration_days, requires_deposit, deposit_amount)
SELECT * FROM (VALUES
  ('Panchakarma Admission','elective','panchakarma_room',21,true,5000::numeric),
  ('General Treatment','elective','general',7,true,2000::numeric),
  ('Emergency Observation','emergency','general',2,false,0::numeric),
  ('Day Care Procedure','day_care','general',1,false,0::numeric)
) AS v(admission_type_name,category,default_ward_type,default_duration_days,requires_deposit,deposit_amount)
WHERE NOT EXISTS (SELECT 1 FROM public.hms_ip_admission_types WHERE admission_type_name = v.admission_type_name);

INSERT INTO public.hms_service_areas (area_name, district, zone)
SELECT * FROM (VALUES
  ('Tenkasi','Tenkasi','Tenkasi Zone'),('Kadayanallur','Tenkasi','Tenkasi Zone'),('Courtallam','Tenkasi','Tenkasi Zone'),('Sankarankovil','Tenkasi','Tenkasi Zone'),
  ('Tirunelveli','Tirunelveli','Tirunelveli Zone'),('Palayamkottai','Tirunelveli','Tirunelveli Zone'),('Nanguneri','Tirunelveli','Tirunelveli Zone'),
  ('Tuticorin','Tuticorin','Tuticorin Zone'),('Kovilpatti','Tuticorin','Tuticorin Zone'),
  ('Virudhunagar','Virudhunagar','Virudhunagar Zone'),('Rajapalayam','Virudhunagar','Virudhunagar Zone'),('Sivakasi','Virudhunagar','Virudhunagar Zone'),
  ('Madurai','Madurai','Madurai Zone'),('Dindigul','Dindigul','Madurai Zone'),
  ('Nagercoil','Kanyakumari','Kanyakumari Zone'),('Thuckalay','Kanyakumari','Kanyakumari Zone'),
  ('Chennai','Chennai','Chennai Zone'),('Tambaram','Chennai','Chennai Zone'),('Chrompet','Chennai','Chennai Zone')
) AS v(area_name,district,zone)
WHERE NOT EXISTS (SELECT 1 FROM public.hms_service_areas WHERE area_name = v.area_name AND zone = v.zone);
