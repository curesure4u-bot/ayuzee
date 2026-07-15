
CREATE TABLE IF NOT EXISTS public.hms_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('prescription','discharge_summary','referral_letter','fitness_certificate','sick_leave','consent_form','ip_admission_form','lab_request')),
  ayush_system TEXT DEFAULT 'all',
  content_html TEXT DEFAULT '',
  placeholders_list JSONB DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'english' CHECK (language IN ('english','tamil','both')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_document_templates TO authenticated;
GRANT ALL ON public.hms_document_templates TO service_role;
ALTER TABLE public.hms_document_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage doc templates" ON public.hms_document_templates;
CREATE POLICY "admin manage doc templates" ON public.hms_document_templates FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
DROP POLICY IF EXISTS "auth read doc templates" ON public.hms_document_templates;
CREATE POLICY "auth read doc templates" ON public.hms_document_templates FOR SELECT TO authenticated USING (is_active = true);

CREATE TABLE IF NOT EXISTS public.hms_whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_code TEXT UNIQUE NOT NULL,
  trigger_event TEXT CHECK (trigger_event IN ('appointment_confirmed','appointment_reminder','bill_generated','prescription_ready','follow_up_due','discharge_summary','birthday_wish','token_called','medicine_dispatch','hms_access_activated','custom')),
  message_template TEXT NOT NULL,
  variables_list JSONB DEFAULT '[]'::jsonb,
  language TEXT DEFAULT 'english',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_whatsapp_templates TO authenticated;
GRANT ALL ON public.hms_whatsapp_templates TO service_role;
ALTER TABLE public.hms_whatsapp_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage wa templates" ON public.hms_whatsapp_templates;
CREATE POLICY "admin manage wa templates" ON public.hms_whatsapp_templates FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
DROP POLICY IF EXISTS "auth read wa templates" ON public.hms_whatsapp_templates;
CREATE POLICY "auth read wa templates" ON public.hms_whatsapp_templates FOR SELECT TO authenticated USING (is_active = true);

CREATE TABLE IF NOT EXISTS public.hms_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  template_code TEXT UNIQUE NOT NULL,
  trigger_event TEXT,
  subject_line TEXT,
  body_html TEXT,
  recipient_type TEXT,
  cc_emails TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_email_templates TO authenticated;
GRANT ALL ON public.hms_email_templates TO service_role;
ALTER TABLE public.hms_email_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage email templates" ON public.hms_email_templates;
CREATE POLICY "admin manage email templates" ON public.hms_email_templates FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TABLE IF NOT EXISTS public.hms_report_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.hms_branches(id) ON DELETE CASCADE,
  recipient_emails TEXT[] DEFAULT '{}',
  report_types JSONB DEFAULT '[]'::jsonb,
  send_time TIME DEFAULT '21:00:00',
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_report_configs TO authenticated;
GRANT ALL ON public.hms_report_configs TO service_role;
ALTER TABLE public.hms_report_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage report configs" ON public.hms_report_configs;
CREATE POLICY "admin manage report configs" ON public.hms_report_configs FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TABLE IF NOT EXISTS public.hms_report_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.hms_branches(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status TEXT,
  recipient_emails TEXT[] DEFAULT '{}',
  error_msg TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_report_logs TO authenticated;
GRANT ALL ON public.hms_report_logs TO service_role;
ALTER TABLE public.hms_report_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage report logs" ON public.hms_report_logs;
CREATE POLICY "admin manage report logs" ON public.hms_report_logs FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TABLE IF NOT EXISTS public.hms_token_display_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.hms_branches(id) ON DELETE CASCADE UNIQUE,
  display_title TEXT DEFAULT 'HMS Tools Ultra',
  clinic_logo_url TEXT,
  clinic_name_display TEXT DEFAULT 'Ayuzee Clinic',
  background_color TEXT DEFAULT '#065f46',
  text_color TEXT DEFAULT '#ffffff',
  accent_color TEXT DEFAULT '#34d399',
  show_waiting_count BOOLEAN DEFAULT true,
  show_doctor_name BOOLEAN DEFAULT true,
  announcement_text TEXT DEFAULT 'Welcome to HMS Tools Ultra | Powered by Ayuzee',
  font_size_token TEXT DEFAULT 'xxlarge',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_token_display_config TO authenticated;
GRANT SELECT ON public.hms_token_display_config TO anon;
GRANT ALL ON public.hms_token_display_config TO service_role;
ALTER TABLE public.hms_token_display_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage token display" ON public.hms_token_display_config;
CREATE POLICY "admin manage token display" ON public.hms_token_display_config FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
DROP POLICY IF EXISTS "public read token display" ON public.hms_token_display_config;
CREATE POLICY "public read token display" ON public.hms_token_display_config FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE TABLE IF NOT EXISTS public.hms_currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_name TEXT NOT NULL,
  currency_code TEXT UNIQUE NOT NULL,
  symbol TEXT,
  exchange_rate_to_inr NUMERIC DEFAULT 1,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_currencies TO authenticated;
GRANT ALL ON public.hms_currencies TO service_role;
ALTER TABLE public.hms_currencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage currencies" ON public.hms_currencies;
CREATE POLICY "admin manage currencies" ON public.hms_currencies FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
DROP POLICY IF EXISTS "auth read currencies" ON public.hms_currencies;
CREATE POLICY "auth read currencies" ON public.hms_currencies FOR SELECT TO authenticated USING (is_active = true);

CREATE TABLE IF NOT EXISTS public.hms_id_proof_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hms_id_proof_types TO authenticated;
GRANT ALL ON public.hms_id_proof_types TO service_role;
ALTER TABLE public.hms_id_proof_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin manage id proofs" ON public.hms_id_proof_types;
CREATE POLICY "admin manage id proofs" ON public.hms_id_proof_types FOR ALL TO authenticated USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
DROP POLICY IF EXISTS "auth read id proofs" ON public.hms_id_proof_types;
CREATE POLICY "auth read id proofs" ON public.hms_id_proof_types FOR SELECT TO authenticated USING (is_active = true);

INSERT INTO public.hms_currencies (currency_name, currency_code, symbol, exchange_rate_to_inr, is_default)
VALUES ('Indian Rupee','INR','₹',1,true),('US Dollar','USD','$',83.5,false),('UAE Dirham','AED','د.إ',22.7,false),('Saudi Riyal','SAR','﷼',22.2,false)
ON CONFLICT (currency_code) DO NOTHING;

INSERT INTO public.hms_id_proof_types (proof_name, sort_order) VALUES
('Aadhaar Card',1),('PAN Card',2),('Passport',3),('Voter ID',4),('Driving License',5),('AYUSH Health Card',6),('Insurance Card',7);

INSERT INTO public.hms_whatsapp_templates (template_name, template_code, trigger_event, message_template, variables_list) VALUES
('Appointment Confirmed','appointment_confirmed','appointment_confirmed','Dear {{patient_name}}, your appointment with {{doctor_name}} is confirmed for {{date}} at {{time}}. Token No: {{token_no}}. 📍 {{clinic_address}}
— HMS Tools Ultra | Ayuzee','["patient_name","doctor_name","date","time","token_no","clinic_address"]'),
('Token Called','token_called','token_called','Dear {{patient_name}}, your Token No. {{token_no}} is now being called. Please proceed to the consultation room.
— HMS Tools Ultra | Ayuzee','["patient_name","token_no"]'),
('Bill Generated','bill_generated','bill_generated','Dear {{patient_name}}, your bill of ₹{{amount}} (Bill No: {{bill_no}}) has been generated. Payment Mode: {{payment_mode}}. Thank you!
— HMS Tools Ultra | Ayuzee','["patient_name","amount","bill_no","payment_mode"]'),
('Prescription Ready','prescription_ready','prescription_ready','Dear {{patient_name}}, your prescription from Dr. {{doctor_name}} is ready. It has been sent to Ayuzee Pharmacy for medicine delivery.
— HMS Tools Ultra | Ayuzee','["patient_name","doctor_name"]'),
('Follow-up Due','follow_up_due','follow_up_due','Dear {{patient_name}}, your follow-up with Dr. {{doctor_name}} is scheduled for {{date}}. Please call {{phone}} to confirm or reschedule.
— HMS Tools Ultra | Ayuzee','["patient_name","doctor_name","date","phone"]'),
('Discharge Summary','discharge_summary','discharge_summary','Dear {{patient_name}}, you have been successfully discharged on {{date}}. Your discharge summary is ready. Please follow the diet and medicine instructions given. Next follow-up: {{next_visit}}
— HMS Tools Ultra | Ayuzee','["patient_name","date","next_visit"]'),
('Birthday Wish','birthday_wish','birthday_wish','Happy Birthday {{patient_name}}! 🎂🌿 Wishing you excellent health and wellness. From your care team at HMS Tools Ultra | Ayuzee','["patient_name"]'),
('Medicine Dispatch','medicine_dispatch','medicine_dispatch','Dear {{patient_name}}, your medicines have been dispatched from Ayuzee Central Pharmacy. Tracking No: {{tracking_no}} Expected Delivery: {{delivery_date}}
— HMS Tools Ultra | Ayuzee','["patient_name","tracking_no","delivery_date"]')
ON CONFLICT (template_code) DO NOTHING;

INSERT INTO public.hms_document_templates (template_name, template_type, content_html, is_default) VALUES
('Ayurveda Prescription','prescription','<div style="font-family:serif;padding:20px"><h2 style="text-align:center;color:#065f46">HMS Tools Ultra | Powered by Ayuzee</h2><p><strong>Dr. {{doctor_name}}</strong> | Reg No: {{reg_no}}</p><hr/><p>Patient: <strong>{{patient_name}}</strong>, {{age}}/{{gender}}</p><p>Date: {{date}} | Mobile: {{mobile}}</p><h3>Diagnosis</h3><p>{{diagnosis}}</p><h3>Medicines</h3><p>{{medicines}}</p><p><em>Follow-up: {{next_visit}}</em></p><p>{{clinic_name}} | {{clinic_address}}</p></div>',true),
('Panchakarma Discharge Summary','discharge_summary','<div style="font-family:serif;padding:20px"><h2 style="text-align:center;color:#065f46">HMS Tools Ultra | Discharge Summary</h2><p>Patient: <strong>{{patient_name}}</strong>, {{age}}/{{gender}}</p><p>Admission: {{admission_date}} | Discharge: {{discharge_date}}</p><h3>Diagnosis</h3><p>{{diagnosis}}</p><h3>Treatment Summary</h3><p>{{treatment_summary}}</p><h3>Medicines</h3><p>{{medicines}}</p><h3>Follow-up</h3><p>{{next_visit}}</p><p>Dr. {{doctor_name}} | {{clinic_name}}</p></div>',true),
('Referral Letter','referral_letter','<div style="font-family:serif;padding:20px"><h2>HMS Tools Ultra | Ayuzee</h2><p>Date: {{date}}</p><p>To Dr. / Hospital Name,</p><p>Referring patient <strong>{{patient_name}}</strong>, {{age}}/{{gender}}, for further evaluation.</p><p>Clinical: {{diagnosis}}</p><p>Dr. {{doctor_name}} | Reg No: {{reg_no}}</p></div>',true),
('Fitness Certificate','fitness_certificate','<div style="font-family:serif;padding:30px"><h2 style="text-align:center">HMS Tools Ultra | Ayuzee</h2><h3 style="text-align:center">FITNESS CERTIFICATE</h3><p>This is to certify that <strong>{{patient_name}}</strong> aged {{age}} years has been examined on {{date}} and is found fit for normal duties.</p><p style="text-align:right">Dr. {{doctor_name}}<br/>Reg No: {{reg_no}}</p></div>',true),
('Medical Leave Certificate','sick_leave','<div style="font-family:serif;padding:30px"><h2 style="text-align:center">HMS Tools Ultra | Ayuzee</h2><h3 style="text-align:center">MEDICAL LEAVE CERTIFICATE</h3><p>This is to certify that <strong>{{patient_name}}</strong> is advised rest for ___ days from {{date}} due to {{diagnosis}}.</p><p style="text-align:right">Dr. {{doctor_name}}<br/>Reg No: {{reg_no}}</p></div>',true),
('Panchakarma Consent Form','consent_form','<div style="font-family:serif;padding:20px"><h2 style="text-align:center">HMS Tools Ultra | Consent Form</h2><p>Patient: <strong>{{patient_name}}</strong>, {{age}}/{{gender}}</p><p>Planned Treatment: {{treatment_summary}}</p><p>I, <strong>{{patient_name}}</strong>, hereby give my informed consent for the above treatment after risks and benefits explained.</p><p>Signature: ____________________ Date: {{date}}</p></div>',true),
('Lab Request Form','lab_request','<div style="font-family:serif;padding:20px"><h2 style="text-align:center">HMS Tools Ultra | Lab Request</h2><p>Patient: <strong>{{patient_name}}</strong>, {{age}}/{{gender}}</p><p>Date: {{date}}</p><p>Tests Required: __________________________________</p><p>Clinical Notes: {{diagnosis}}</p><p>Dr. {{doctor_name}} | Reg No: {{reg_no}}</p></div>',true);

INSERT INTO public.hms_token_display_config (branch_id, clinic_name_display)
SELECT id, COALESCE(branch_name,'Ayuzee Clinic') FROM public.hms_branches
ON CONFLICT (branch_id) DO NOTHING;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.vaidya_queue_tokens;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;
