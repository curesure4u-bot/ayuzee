-- ============================================================
-- VAIDYA TOOL / HMS + PARTNER NETWORK
-- ============================================================

-- 1. Manually-added patients (walk-ins) for a vaidya
CREATE TABLE public.vaidya_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  age INTEGER,
  gender TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vaidya_patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages own vaidya patients" ON public.vaidya_patients
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);
CREATE TRIGGER trg_vaidya_patients_updated BEFORE UPDATE ON public.vaidya_patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Consultations (visit log per patient)
CREATE TABLE public.vaidya_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_id UUID,                -- references vaidya_patients (nullable if appointment-derived)
  appointment_id UUID,            -- references appointments
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnosis TEXT,
  prescription TEXT,
  follow_up_date DATE,
  fee INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vaidya_consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages consultations" ON public.vaidya_consultations
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);
CREATE TRIGGER trg_vaidya_consultations_updated BEFORE UPDATE ON public.vaidya_consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Vaidya leads (Ayuzee Leads)
CREATE TABLE public.vaidya_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  lead_status TEXT NOT NULL DEFAULT 'new',  -- new, contacted, converted, dropped
  call_type TEXT,                            -- chat, call, online
  source TEXT DEFAULT 'ayuzee',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vaidya_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages leads" ON public.vaidya_leads
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);
CREATE TRIGGER trg_vaidya_leads_updated BEFORE UPDATE ON public.vaidya_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Inventory: stock items
CREATE TABLE public.vaidya_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  medicine_name TEXT NOT NULL,
  brand TEXT,
  batch_no TEXT,
  unit TEXT DEFAULT 'pcs',
  quantity INTEGER NOT NULL DEFAULT 0,
  purchase_price INTEGER NOT NULL DEFAULT 0,
  mrp INTEGER NOT NULL DEFAULT 0,
  expiry_date DATE,
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vaidya_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages inventory" ON public.vaidya_inventory
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);
CREATE TRIGGER trg_vaidya_inventory_updated BEFORE UPDATE ON public.vaidya_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Bills / Invoices
CREATE TABLE public.vaidya_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_id UUID,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  bill_type TEXT NOT NULL DEFAULT 'patient_bill',  -- patient_bill, direct_selling
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  payment_mode TEXT DEFAULT 'cash',
  status TEXT NOT NULL DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vaidya_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages bills" ON public.vaidya_bills
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);
CREATE TRIGGER trg_vaidya_bills_updated BEFORE UPDATE ON public.vaidya_bills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.vaidya_bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES public.vaidya_bills(id) ON DELETE CASCADE,
  inventory_id UUID,
  medicine_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  line_total INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vaidya_bill_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages bill items" ON public.vaidya_bill_items
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.vaidya_bills b WHERE b.id = bill_id AND b.doctor_user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.vaidya_bills b WHERE b.id = bill_id AND b.doctor_user_id = auth.uid())
  );

-- 6. Partner network (therapists / hospitals / clinics / panchakarma theaters)
CREATE TABLE public.network_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_type TEXT NOT NULL,    -- therapist, hospital, clinic, panchakarma_theater
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  city TEXT NOT NULL,
  state TEXT,
  pincode TEXT,
  address TEXT,
  services TEXT[] DEFAULT '{}',
  specialities TEXT[] DEFAULT '{}',
  about TEXT,
  image_url TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC NOT NULL DEFAULT 4.5,
  applied_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.network_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved partners public" ON public.network_partners
  FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can apply as partner" ON public.network_partners
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Applicant views own application" ON public.network_partners
  FOR SELECT TO authenticated USING (auth.uid() = applied_by_user_id);
CREATE POLICY "Admins manage partners" ON public.network_partners
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_network_partners_updated BEFORE UPDATE ON public.network_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Therapy plans (vaidya plans a therapy with a network partner for a patient)
CREATE TABLE public.therapy_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_id UUID,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  partner_id UUID REFERENCES public.network_partners(id),
  therapy_name TEXT NOT NULL,
  planned_date DATE,
  duration_days INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'planned',  -- planned, ongoing, completed, cancelled
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.therapy_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages therapy plans" ON public.therapy_plans
  FOR ALL TO authenticated USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);
CREATE TRIGGER trg_therapy_plans_updated BEFORE UPDATE ON public.therapy_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- SEED ~18 demo network partners across categories & cities
-- ============================================================
INSERT INTO public.network_partners (partner_type, name, contact_person, phone, city, state, pincode, address, services, specialities, about, is_approved, rating) VALUES
('therapist', 'Sandeep Kumar (Panchakarma Therapist)', 'Sandeep Kumar', '+91 98765 11001', 'Delhi', 'Delhi', '110030', 'Saidulajab, New Delhi', ARRAY['Abhyanga','Shirodhara','Swedana'], ARRAY['Panchakarma'], 'Certified Panchakarma therapist with 8+ years experience.', true, 4.8),
('therapist', 'Anjali Nair (Kerala Therapist)', 'Anjali Nair', '+91 98765 11002', 'Kochi', 'Kerala', '682001', 'MG Road, Kochi', ARRAY['Abhyanga','Pizhichil','Njavarakizhi'], ARRAY['Kerala Ayurveda'], 'Specialist in traditional Kerala therapies.', true, 4.9),
('therapist', 'Ravi Sharma', 'Ravi Sharma', '+91 98765 11003', 'Jaipur', 'Rajasthan', '302001', 'C-Scheme, Jaipur', ARRAY['Abhyanga','Udvartana'], ARRAY['Weight management'], 'Expert in udvartana and weight-management therapies.', true, 4.7),
('therapist', 'Meera Pillai', 'Meera Pillai', '+91 98765 11004', 'Bengaluru', 'Karnataka', '560001', 'Indiranagar, Bengaluru', ARRAY['Shirodhara','Nasya','Karna Purana'], ARRAY['Stress & Sleep'], 'Focus on neurological and stress relief therapies.', true, 4.85),

('panchakarma_theater', 'Atharva Panchakarma Centre', 'Dr. Vinod', '+91 98765 22001', 'Delhi', 'Delhi', '110030', 'Saidulajab Extn., New Delhi', ARRAY['Vamana','Virechana','Basti','Nasya','Raktamokshana'], ARRAY['Full Panchakarma'], 'Dedicated 6-bed Panchakarma theatre with trained therapists.', true, 4.8),
('panchakarma_theater', 'Kerala Vaidyashala', 'Dr. Krishnan', '+91 98765 22002', 'Kochi', 'Kerala', '682001', 'Marine Drive, Kochi', ARRAY['Pizhichil','Njavarakizhi','Shirodhara','Basti'], ARRAY['Authentic Kerala Panchakarma'], 'Authentic Kerala Panchakarma in a tranquil setting.', true, 4.9),
('panchakarma_theater', 'AyurSoul Wellness', 'Dr. Asha', '+91 98765 22003', 'Pune', 'Maharashtra', '411001', 'Koregaon Park, Pune', ARRAY['Abhyanga','Shirodhara','Basti','Swedana'], ARRAY['Detox & Rejuvenation'], 'Modern facility with traditional protocols.', true, 4.7),
('panchakarma_theater', 'Himalayan Panchakarma', 'Dr. Bhatt', '+91 98765 22004', 'Rishikesh', 'Uttarakhand', '249201', 'Tapovan, Rishikesh', ARRAY['Vamana','Virechana','Basti','Nasya'], ARRAY['Yoga + Panchakarma'], 'Riverside facility combining yoga and Panchakarma.', true, 4.85),

('hospital', 'AyuLife Multi-speciality Ayurveda Hospital', 'Admin', '+91 98765 33001', 'Delhi', 'Delhi', '110001', 'Connaught Place, Delhi', ARRAY['IPD','OPD','Panchakarma','Surgery (Kshara Sutra)'], ARRAY['Multi-speciality'], '50-bed multi-speciality Ayurveda hospital.', true, 4.6),
('hospital', 'Arogya Ayurveda Hospital', 'Admin', '+91 98765 33002', 'Hyderabad', 'Telangana', '500001', 'Banjara Hills, Hyderabad', ARRAY['IPD','OPD','Panchakarma','Diagnostics'], ARRAY['Cardiology','Gastro'], 'NABH accredited Ayurveda hospital.', true, 4.7),
('hospital', 'Vaidya Ratnam Hospital', 'Admin', '+91 98765 33003', 'Thrissur', 'Kerala', '680001', 'Ollur, Thrissur', ARRAY['IPD','Panchakarma','Pharmacy','Research'], ARRAY['Classical Ayurveda'], 'Heritage Ayurveda hospital with in-house pharmacy.', true, 4.8),

('clinic', 'Suvarna Ayurveda Clinic', 'Dr. Prakash', '+91 98765 44001', 'Mumbai', 'Maharashtra', '400001', 'Andheri West, Mumbai', ARRAY['OPD','Consultation','Pharmacy'], ARRAY['General','Skin'], 'Neighborhood Ayurveda clinic with in-house pharmacy.', true, 4.6),
('clinic', 'Prakriti Ayurveda Clinic', 'Dr. Reena', '+91 98765 44002', 'Bengaluru', 'Karnataka', '560001', 'Jayanagar, Bengaluru', ARRAY['OPD','Consultation','Therapy room'], ARRAY['Women Health','Pediatrics'], 'Family Ayurveda clinic, women & child focus.', true, 4.7),
('clinic', 'Sanjeevani Clinic', 'Dr. Manoj', '+91 98765 44003', 'Lucknow', 'Uttar Pradesh', '226001', 'Hazratganj, Lucknow', ARRAY['OPD','Consultation','Basti room'], ARRAY['Joint pain','Spine'], 'Specialised in marma & joint care.', true, 4.65),
('clinic', 'Dhanvantari Ayur Clinic', 'Dr. Suma', '+91 98765 44004', 'Chennai', 'Tamil Nadu', '600001', 'T Nagar, Chennai', ARRAY['OPD','Consultation','Online'], ARRAY['Skin','Hair'], 'Skin & hair specialist clinic.', true, 4.55),

('therapist', 'Pradeep Iyer', 'Pradeep Iyer', '+91 98765 11005', 'Mumbai', 'Maharashtra', '400001', 'Andheri East, Mumbai', ARRAY['Abhyanga','Swedana','Shirodhara'], ARRAY['Sports & Recovery'], 'Therapist with sports-injury rehab experience.', true, 4.7),
('panchakarma_theater', 'Nirvana Panchakarma', 'Dr. Geeta', '+91 98765 22005', 'Goa', 'Goa', '403001', 'Anjuna, Goa', ARRAY['Abhyanga','Shirodhara','Basti','Yoga'], ARRAY['Wellness retreat'], 'Beachside Panchakarma retreat.', true, 4.8),
('hospital', 'Patanjali Ayurveda Hospital', 'Admin', '+91 98765 33004', 'Haridwar', 'Uttarakhand', '249401', 'Bahadrabad, Haridwar', ARRAY['IPD','OPD','Panchakarma','Yoga'], ARRAY['Multi-speciality'], 'Large Ayurveda + Yoga hospital.', true, 4.5);
