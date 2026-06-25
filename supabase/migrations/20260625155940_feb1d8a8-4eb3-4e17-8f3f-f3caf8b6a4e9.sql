
-- =========================================================
-- HMS Tools Ultra — Master Management migration
-- =========================================================

-- 1) Trusted IPs (admin only)
CREATE TABLE IF NOT EXISTS public.hms_trusted_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  branch_id UUID REFERENCES public.hms_branches(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_trusted_ips TO authenticated;
GRANT ALL ON public.hms_trusted_ips TO service_role;
ALTER TABLE public.hms_trusted_ips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage trusted IPs"
  ON public.hms_trusted_ips FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- 2) Labels
CREATE TABLE IF NOT EXISTS public.hms_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_name TEXT NOT NULL,
  label_type TEXT NOT NULL CHECK (label_type IN ('patient_tag','document_tag','order_tag','user_tag')),
  color_hex TEXT NOT NULL DEFAULT '#6B7280',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_labels TO authenticated;
GRANT ALL ON public.hms_labels TO service_role;
ALTER TABLE public.hms_labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read labels" ON public.hms_labels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage labels" ON public.hms_labels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

INSERT INTO public.hms_labels (label_name, label_type, color_hex) VALUES
  ('VIP Patient','patient_tag','#F59E0B'),
  ('High Risk','patient_tag','#EF4444'),
  ('Insurance','patient_tag','#3B82F6'),
  ('Follow-up Due','patient_tag','#F97316'),
  ('Charity/BPL','patient_tag','#8B5CF6'),
  ('NRI Patient','patient_tag','#14B8A6'),
  ('Staff Family','patient_tag','#10B981')
ON CONFLICT DO NOTHING;

-- 3) Packages
CREATE TABLE IF NOT EXISTS public.hms_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name TEXT NOT NULL,
  package_code TEXT UNIQUE NOT NULL,
  ayush_system TEXT,
  description TEXT,
  validity_days INTEGER,
  total_sessions INTEGER,
  package_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  package_price NUMERIC NOT NULL DEFAULT 0,
  regular_price NUMERIC NOT NULL DEFAULT 0,
  savings_amount NUMERIC GENERATED ALWAYS AS (regular_price - package_price) STORED,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_packages TO authenticated;
GRANT ALL ON public.hms_packages TO service_role;
ALTER TABLE public.hms_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read packages" ON public.hms_packages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage packages" ON public.hms_packages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

INSERT INTO public.hms_packages (package_name, package_code, ayush_system, validity_days, total_sessions, package_items, regular_price, package_price) VALUES
  ('Panchakarma 21-Day Rejuvenation','PKG-PK-21','Panchakarma',21,21,
    '[{"name":"Abhyanga","qty":21,"unit_price":800,"total":16800},{"name":"Swedana","qty":21,"unit_price":400,"total":8400},{"name":"Shirodhara","qty":7,"unit_price":1200,"total":8400},{"name":"Vasti","qty":7,"unit_price":900,"total":6300},{"name":"Nasya","qty":7,"unit_price":500,"total":3500},{"name":"Consultation","qty":3,"unit_price":500,"total":1500}]'::jsonb,
    45000, 35000),
  ('Spine Care Program — 14 Sessions','PKG-SP-14','Ayurveda',45,14,
    '[{"name":"Kati Vasti","qty":7,"unit_price":1200,"total":8400},{"name":"Pinda Sweda","qty":7,"unit_price":1100,"total":7700},{"name":"Consultation","qty":2,"unit_price":500,"total":1000},{"name":"Medicines","qty":1,"unit_price":4900,"total":4900}]'::jsonb,
    22000, 16500),
  ('Ayurveda Wellness Annual','PKG-WL-12','Ayurveda',365,12,
    '[{"name":"Monthly consultation","qty":12,"unit_price":700,"total":8400},{"name":"Seasonal Panchakarma","qty":2,"unit_price":10800,"total":21600}]'::jsonb,
    30000, 22000)
ON CONFLICT (package_code) DO NOTHING;

-- 4) Departments
CREATE TABLE IF NOT EXISTS public.hms_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_name TEXT NOT NULL,
  department_code TEXT UNIQUE NOT NULL,
  ayush_system TEXT,
  head_doctor_name TEXT,
  floor_or_room TEXT,
  phone_extension TEXT,
  branch_id UUID REFERENCES public.hms_branches(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_departments TO authenticated;
GRANT ALL ON public.hms_departments TO service_role;
ALTER TABLE public.hms_departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read departments" ON public.hms_departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage departments" ON public.hms_departments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

INSERT INTO public.hms_departments (department_name, department_code, ayush_system, sort_order) VALUES
  ('OPD','DEPT-OPD','Multi',10),
  ('Panchakarma Therapy Unit','DEPT-PK','Ayurveda',20),
  ('Yoga & Naturopathy','DEPT-YN','Yoga',30),
  ('Siddha & Unani','DEPT-SU','Siddha',40),
  ('Homeopathy OPD','DEPT-HOM','Homeopathy',50),
  ('Inpatient Ward (IP)','DEPT-IP','Multi',60),
  ('Pharmacy','DEPT-PH','Multi',70),
  ('Reception & Registration','DEPT-REC','Multi',80),
  ('Physiotherapy','DEPT-PHY','Multi',90)
ON CONFLICT (department_code) DO NOTHING;

-- 5) Suggestions
CREATE TABLE IF NOT EXISTS public.hms_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN
    ('chief_complaint','diagnosis','examination','treatment_advice','diet_advice','medicine_name','referral_note')),
  ayush_system TEXT,
  language TEXT NOT NULL DEFAULT 'english',
  suggestion_text TEXT NOT NULL,
  short_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_suggestions TO authenticated;
GRANT ALL ON public.hms_suggestions TO service_role;
ALTER TABLE public.hms_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read suggestions" ON public.hms_suggestions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage suggestions" ON public.hms_suggestions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

INSERT INTO public.hms_suggestions (suggestion_type, short_code, suggestion_text, ayush_system) VALUES
  ('chief_complaint','bkp','Bilateral knee pain with crepitus','Ayurveda'),
  ('chief_complaint','lbp','Low back pain radiating to legs','Ayurveda'),
  ('chief_complaint','hd','Headache with heaviness since morning','Ayurveda'),
  ('chief_complaint','ind','Indigestion and loss of appetite','Ayurveda'),
  ('chief_complaint','sk','Skin eruptions with itching','Ayurveda'),
  ('chief_complaint','jt','Joint pain and stiffness in morning','Ayurveda'),
  ('chief_complaint','vat','Vatham predominant complaints','Siddha'),
  ('chief_complaint','pit','Pitham predominant — burning sensation','Siddha'),
  ('chief_complaint','kab','Kabam — congestion and heaviness','Siddha'),
  ('diagnosis','sv','Sandhivata (Osteoarthritis)','Ayurveda'),
  ('diagnosis','gr','Gridhrasi (Sciatica)','Ayurveda'),
  ('diagnosis','av','Amavata (Rheumatoid Arthritis)','Ayurveda'),
  ('diagnosis','pk','Pakshaghata (Hemiplegia)','Ayurveda'),
  ('diagnosis','ka','Kati Shoola (Lumbar Spondylosis)','Ayurveda'),
  ('diagnosis','vs','Vishwachi (Cervical Spondylosis)','Ayurveda'),
  ('diet_advice','da1','Avoid cold, stale, and processed food','Ayurveda'),
  ('diet_advice','da2','Take warm water and fresh cooked meals','Ayurveda'),
  ('diet_advice','da3','Include more green leafy vegetables','Ayurveda'),
  ('treatment_advice','ta1','Complete 21-day Panchakarma course recommended','Ayurveda'),
  ('treatment_advice','ta2','Yoga and pranayama daily for 30 minutes','Yoga'),
  ('examination','ex1','Tenderness on palpation','Ayurveda'),
  ('examination','ex2','Range of motion restricted','Ayurveda'),
  ('examination','ex3','BP and pulse within normal limits','Ayurveda'),
  ('examination','ex4','Tongue coated, white','Ayurveda'),
  ('examination','ex5','Abdomen soft, non-tender','Ayurveda'),
  ('medicine_name','m1','Yogaraja Guggulu 1-0-1 after food','Ayurveda'),
  ('medicine_name','m2','Maharasnadi Kashayam 15ml-0-15ml','Ayurveda'),
  ('medicine_name','m3','Triphala Choorna 5g at bedtime','Ayurveda'),
  ('medicine_name','m4','Ashwagandha Tablet 1-0-1','Ayurveda'),
  ('medicine_name','m5','Saraswatarishta 15ml twice daily','Ayurveda'),
  ('referral_note','ref1','Refer to Panchakarma unit for 7-day intensive','Ayurveda'),
  ('referral_note','ref2','Refer to Yoga therapy for chronic pain protocol','Yoga'),
  ('referral_note','ref3','Refer to Physiotherapy for rehabilitation','Multi'),
  ('chief_complaint','con','Constipation since 2 weeks','Ayurveda'),
  ('chief_complaint','ins','Insomnia with anxiety','Ayurveda'),
  ('chief_complaint','obs','Obesity with thyroid imbalance','Ayurveda'),
  ('diagnosis','sth','Sthoulya (Obesity)','Ayurveda'),
  ('diagnosis','nid','Nidranasha (Insomnia)','Ayurveda'),
  ('diagnosis','prm','Prameha (Diabetes)','Ayurveda'),
  ('diet_advice','da4','Avoid sweets, refined sugar and fried foods','Ayurveda'),
  ('diet_advice','da5','Sip warm jeera/coriander water through the day','Ayurveda'),
  ('treatment_advice','ta3','Daily abhyanga with medicated oil','Ayurveda')
ON CONFLICT DO NOTHING;

-- 6) Custom forms
CREATE TABLE IF NOT EXISTS public.hms_custom_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_name TEXT NOT NULL,
  form_type TEXT NOT NULL CHECK (form_type IN
    ('patient_intake','consent','feedback','discharge_summary','referral')),
  form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_custom_forms TO authenticated;
GRANT ALL ON public.hms_custom_forms TO service_role;
ALTER TABLE public.hms_custom_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read custom forms" ON public.hms_custom_forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage custom forms" ON public.hms_custom_forms FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

INSERT INTO public.hms_custom_forms (form_name, form_type, form_fields) VALUES
  ('New Patient Registration Form','patient_intake',
    '[{"id":"f1","label":"Full Name","field_type":"text","required":true},{"id":"f2","label":"Phone","field_type":"text","required":true},{"id":"f3","label":"DOB","field_type":"date","required":false},{"id":"f4","label":"Gender","field_type":"dropdown","required":true,"options":["Male","Female","Other"]},{"id":"f5","label":"Address","field_type":"textarea","required":false},{"id":"f6","label":"Blood Group","field_type":"dropdown","required":false,"options":["A+","A-","B+","B-","AB+","AB-","O+","O-"]},{"id":"f7","label":"Known Allergies","field_type":"textarea","required":false},{"id":"f8","label":"How did you hear about us","field_type":"text","required":false}]'::jsonb),
  ('Panchakarma Consent Form','consent',
    '[{"id":"f1","label":"Patient Name","field_type":"text","required":true},{"id":"f2","label":"Treatment Plan","field_type":"textarea","required":true},{"id":"f3","label":"I consent to the treatment","field_type":"checkbox","required":true},{"id":"f4","label":"I have disclosed all medical history","field_type":"checkbox","required":true},{"id":"f5","label":"Signature","field_type":"text","required":true}]'::jsonb),
  ('Patient Feedback Form','feedback',
    '[{"id":"f1","label":"Rating","field_type":"radio","required":true,"options":["1","2","3","4","5"]},{"id":"f2","label":"Treatment Satisfaction","field_type":"textarea","required":false},{"id":"f3","label":"Staff Behavior","field_type":"textarea","required":false},{"id":"f4","label":"Cleanliness","field_type":"textarea","required":false},{"id":"f5","label":"Suggestions","field_type":"textarea","required":false}]'::jsonb),
  ('Discharge Summary Form','discharge_summary',
    '[{"id":"f1","label":"Diagnosis","field_type":"textarea","required":true},{"id":"f2","label":"Treatment Given","field_type":"textarea","required":true},{"id":"f3","label":"Medicines at Discharge","field_type":"textarea","required":true},{"id":"f4","label":"Diet Instructions","field_type":"textarea","required":false},{"id":"f5","label":"Follow-up Date","field_type":"date","required":false},{"id":"f6","label":"Doctor Instructions","field_type":"textarea","required":false}]'::jsonb),
  ('Referral Letter','referral',
    '[{"id":"f1","label":"Referred To (Doctor/Hospital)","field_type":"text","required":true},{"id":"f2","label":"Reason","field_type":"textarea","required":true},{"id":"f3","label":"Clinical Summary","field_type":"textarea","required":true},{"id":"f4","label":"Urgency","field_type":"dropdown","required":true,"options":["Routine","Urgent","Emergency"]}]'::jsonb)
ON CONFLICT DO NOTHING;

-- 7) Stores
CREATE TABLE IF NOT EXISTS public.hms_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL,
  store_code TEXT UNIQUE NOT NULL,
  store_type TEXT NOT NULL CHECK (store_type IN
    ('main_pharmacy','branch_pharmacy','dispensary','raw_materials')),
  branch_id UUID REFERENCES public.hms_branches(id) ON DELETE SET NULL,
  incharge_name TEXT,
  phone TEXT,
  address_in_hospital TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_stores TO authenticated;
GRANT ALL ON public.hms_stores TO service_role;
ALTER TABLE public.hms_stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read stores" ON public.hms_stores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage stores" ON public.hms_stores FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

INSERT INTO public.hms_stores (store_name, store_code, store_type) VALUES
  ('Main Pharmacy — Kadayanallur','STORE-01','main_pharmacy'),
  ('OPD Dispensary','STORE-02','dispensary'),
  ('Raw Materials Store','STORE-03','raw_materials'),
  ('Panchakarma Oils & Supplies','STORE-04','raw_materials')
ON CONFLICT (store_code) DO NOTHING;

-- 8) Link inventory to a store (optional)
ALTER TABLE public.vaidya_inventory
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.hms_stores(id) ON DELETE SET NULL;
