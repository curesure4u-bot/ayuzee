-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — New Module Tables (Radiology, Teleconsult, Online Booking, Feedback)
-- Run this in Supabase SQL Editor
-- These tables support the hooks: useRadiology, useTeleconsult, useOnlineBooking, useFeedback
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. RADIOLOGY ORDERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_radiology_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  uhid TEXT,
  investigation TEXT NOT NULL,
  modality TEXT NOT NULL DEFAULT 'X-Ray',
  ordered_by TEXT,
  ordered_date DATE DEFAULT CURRENT_DATE,
  scheduled_time TEXT,
  priority TEXT DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'emergency')),
  status TEXT DEFAULT 'ordered' CHECK (status IN ('ordered', 'scheduled', 'in-progress', 'completed', 'reported')),
  clinical_indication TEXT,
  report TEXT,
  reported_by TEXT,
  reported_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_radiology_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view radiology orders" ON hms_radiology_orders;
CREATE POLICY "Staff can view radiology orders" ON hms_radiology_orders
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage radiology orders" ON hms_radiology_orders;
CREATE POLICY "Staff can manage radiology orders" ON hms_radiology_orders
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TELECONSULT SESSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_teleconsult_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  phone TEXT,
  doctor_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration TEXT,
  consult_type TEXT DEFAULT 'New Consultation',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'waiting', 'active', 'completed', 'no_show')),
  payment_status TEXT,
  notes TEXT,
  prescription TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  recording_url TEXT,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_teleconsult_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view teleconsult" ON hms_teleconsult_sessions;
CREATE POLICY "Staff can view teleconsult" ON hms_teleconsult_sessions
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage teleconsult" ON hms_teleconsult_sessions;
CREATE POLICY "Staff can manage teleconsult" ON hms_teleconsult_sessions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ONLINE BOOKINGS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_online_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  phone TEXT,
  doctor_name TEXT,
  department TEXT,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  booking_type TEXT DEFAULT 'New Visit',
  payment_status TEXT DEFAULT 'Pending',
  payment_amount NUMERIC(10,2),
  payment_method TEXT,
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('confirmed', 'pending_payment', 'cancelled', 'completed', 'no_show')),
  source TEXT DEFAULT 'website',
  notes TEXT,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_online_bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view online bookings" ON hms_online_bookings;
CREATE POLICY "Staff can view online bookings" ON hms_online_bookings
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage online bookings" ON hms_online_bookings;
CREATE POLICY "Staff can manage online bookings" ON hms_online_bookings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. PATIENT FEEDBACK & NPS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_patient_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_id UUID,
  doctor_name TEXT,
  date DATE DEFAULT CURRENT_DATE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  comment TEXT,
  sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  category TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved')),
  google_review BOOLEAN DEFAULT false,
  department TEXT,
  visit_type TEXT,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_patient_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view feedback" ON hms_patient_feedback;
CREATE POLICY "Staff can view feedback" ON hms_patient_feedback
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage feedback" ON hms_patient_feedback;
CREATE POLICY "Staff can manage feedback" ON hms_patient_feedback
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SHIFT ROSTER
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_shift_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_name TEXT NOT NULL,
  staff_id UUID,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  week_start DATE NOT NULL,
  mon TEXT DEFAULT 'O',
  tue TEXT DEFAULT 'O',
  wed TEXT DEFAULT 'O',
  thu TEXT DEFAULT 'O',
  fri TEXT DEFAULT 'O',
  sat TEXT DEFAULT 'O',
  sun TEXT DEFAULT 'O',
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_shift_roster ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view roster" ON hms_shift_roster;
CREATE POLICY "Staff can view roster" ON hms_shift_roster
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage roster" ON hms_shift_roster;
CREATE POLICY "Staff can manage roster" ON hms_shift_roster
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. MAINTENANCE JOBS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_maintenance_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_no TEXT UNIQUE,
  title TEXT NOT NULL,
  department TEXT,
  location_detail TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  reported_by TEXT,
  assigned_to TEXT,
  reported_date TIMESTAMPTZ DEFAULT NOW(),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'overdue')),
  job_type TEXT DEFAULT 'corrective' CHECK (job_type IN ('corrective', 'preventive', 'periodic')),
  notes TEXT,
  cost NUMERIC(10,2),
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_maintenance_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view maintenance" ON hms_maintenance_jobs;
CREATE POLICY "Staff can view maintenance" ON hms_maintenance_jobs
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage maintenance" ON hms_maintenance_jobs;
CREATE POLICY "Staff can manage maintenance" ON hms_maintenance_jobs
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════════════════════════════
-- INDEXES for performance
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_radiology_status ON hms_radiology_orders(status);
CREATE INDEX IF NOT EXISTS idx_radiology_date ON hms_radiology_orders(ordered_date DESC);
CREATE INDEX IF NOT EXISTS idx_teleconsult_scheduled ON hms_teleconsult_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_teleconsult_status ON hms_teleconsult_sessions(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON hms_online_bookings(date DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON hms_online_bookings(status);
CREATE INDEX IF NOT EXISTS idx_feedback_date ON hms_patient_feedback(date DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON hms_patient_feedback(status);
CREATE INDEX IF NOT EXISTS idx_roster_week ON hms_shift_roster(week_start);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON hms_maintenance_jobs(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_due ON hms_maintenance_jobs(due_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. APPOINTMENTS (supports usePatientAppointments hook)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT,
  patient_name TEXT NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  doctor_name TEXT,
  department TEXT,
  purpose TEXT DEFAULT 'Consultation',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  booked_by TEXT,
  notes TEXT,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view appointments" ON hms_appointments;
CREATE POLICY "Staff can view appointments" ON hms_appointments
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage appointments" ON hms_appointments;
CREATE POLICY "Staff can manage appointments" ON hms_appointments
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON hms_appointments(date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON hms_appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON hms_appointments(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. AMBULANCE VEHICLES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_ambulance_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number TEXT NOT NULL UNIQUE,
  vehicle_type TEXT DEFAULT 'Basic Life Support',
  driver_name TEXT,
  driver_phone TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'on_trip', 'maintenance')),
  current_location TEXT DEFAULT 'Hospital Parking',
  is_active BOOLEAN DEFAULT true,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_ambulance_vehicles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view ambulance vehicles" ON hms_ambulance_vehicles;
CREATE POLICY "Staff can view ambulance vehicles" ON hms_ambulance_vehicles
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage ambulance vehicles" ON hms_ambulance_vehicles;
CREATE POLICY "Staff can manage ambulance vehicles" ON hms_ambulance_vehicles
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. AMBULANCE TRIPS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_ambulance_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_number TEXT NOT NULL,
  patient_name TEXT,
  pickup_location TEXT NOT NULL,
  destination TEXT DEFAULT 'Ayuzee Main Hospital',
  urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('emergency', 'urgent', 'routine', 'scheduled')),
  status TEXT DEFAULT 'dispatched' CHECK (status IN ('dispatched', 'arrived', 'returning', 'completed')),
  dispatch_time TIMESTAMPTZ DEFAULT NOW(),
  arrival_time TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  driver_name TEXT,
  notes TEXT,
  km_reading NUMERIC(8,1),
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_ambulance_trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view ambulance trips" ON hms_ambulance_trips;
CREATE POLICY "Staff can view ambulance trips" ON hms_ambulance_trips
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage ambulance trips" ON hms_ambulance_trips;
CREATE POLICY "Staff can manage ambulance trips" ON hms_ambulance_trips
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. DIET KITCHEN ORDERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_diet_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_id UUID,
  ward TEXT,
  bed TEXT,
  diet_type TEXT NOT NULL,
  meal TEXT NOT NULL CHECK (meal IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  meal_time TEXT,
  special_instructions TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered')),
  order_date DATE DEFAULT CURRENT_DATE,
  delivered_at TIMESTAMPTZ,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_diet_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view diet orders" ON hms_diet_orders;
CREATE POLICY "Staff can view diet orders" ON hms_diet_orders
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage diet orders" ON hms_diet_orders;
CREATE POLICY "Staff can manage diet orders" ON hms_diet_orders
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. REFERRALS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  referred_by TEXT NOT NULL,
  referrer_type TEXT DEFAULT 'External Doctor' CHECK (referrer_type IN ('External Doctor', 'Patient Referral', 'Internal Doctor', 'Corporate/Partner', 'Digital')),
  referred_to TEXT,
  department TEXT,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'consulted', 'converted', 'lost')),
  commission NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view referrals" ON hms_referrals;
CREATE POLICY "Staff can view referrals" ON hms_referrals
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage referrals" ON hms_referrals;
CREATE POLICY "Staff can manage referrals" ON hms_referrals
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. LOYALTY MEMBERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_loyalty_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  patient_name TEXT NOT NULL,
  tier TEXT DEFAULT 'silver' CHECK (tier IN ('silver', 'gold', 'platinum')),
  points INTEGER DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  visits INTEGER DEFAULT 0,
  join_date DATE DEFAULT CURRENT_DATE,
  next_reward TEXT,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_loyalty_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view loyalty" ON hms_loyalty_members;
CREATE POLICY "Staff can view loyalty" ON hms_loyalty_members
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage loyalty" ON hms_loyalty_members;
CREATE POLICY "Staff can manage loyalty" ON hms_loyalty_members
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. INSURANCE CLAIMS (NOTE: Table may already exist from create_hms_insurance_nursing.sql)
--     Uses columns: policy_no, submitted_date, claim_type (not policy_number, claim_date)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_id UUID,
  insurer TEXT NOT NULL,
  policy_no TEXT NOT NULL,
  claim_type TEXT DEFAULT 'cashless' CHECK (claim_type IN ('cashless', 'reimbursement')),
  claim_amount NUMERIC(12,2) NOT NULL,
  approved_amount NUMERIC(12,2) DEFAULT 0,
  submitted_date DATE,
  approved_date DATE,
  settled_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'settled', 'appealed')),
  rejection_reason TEXT,
  admission_id UUID,
  notes TEXT,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_insurance_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view insurance" ON hms_insurance_claims;
CREATE POLICY "Staff can view insurance" ON hms_insurance_claims
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage insurance" ON hms_insurance_claims;
CREATE POLICY "Staff can manage insurance" ON hms_insurance_claims
  FOR ALL USING (auth.uid() IS NOT NULL);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_ambulance_status ON hms_ambulance_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_ambulance_trips_date ON hms_ambulance_trips(dispatch_time DESC);
CREATE INDEX IF NOT EXISTS idx_diet_orders_date ON hms_diet_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_diet_orders_status ON hms_diet_orders(status);
CREATE INDEX IF NOT EXISTS idx_referrals_date ON hms_referrals(date DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON hms_referrals(status);
CREATE INDEX IF NOT EXISTS idx_loyalty_tier ON hms_loyalty_members(tier);
CREATE INDEX IF NOT EXISTS idx_insurance_status ON hms_insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_date ON hms_insurance_claims(submitted_date DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. BLOOD BANK STOCK
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_blood_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  component TEXT DEFAULT 'Whole Blood',
  units INTEGER DEFAULT 0,
  expiry_date DATE,
  bag_number TEXT,
  donor_id UUID,
  collected_date DATE DEFAULT CURRENT_DATE,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_blood_stock ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view blood stock" ON hms_blood_stock;
CREATE POLICY "Staff can view blood stock" ON hms_blood_stock
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage blood stock" ON hms_blood_stock;
CREATE POLICY "Staff can manage blood stock" ON hms_blood_stock
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. BLOOD BANK REQUESTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_id UUID,
  blood_group TEXT NOT NULL,
  component TEXT DEFAULT 'Whole Blood',
  units INTEGER DEFAULT 1,
  requested_by TEXT,
  date DATE DEFAULT CURRENT_DATE,
  urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cross_matched', 'issued', 'rejected', 'cancelled')),
  cross_match_result TEXT,
  issued_at TIMESTAMPTZ,
  notes TEXT,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_blood_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view blood requests" ON hms_blood_requests;
CREATE POLICY "Staff can view blood requests" ON hms_blood_requests
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage blood requests" ON hms_blood_requests;
CREATE POLICY "Staff can manage blood requests" ON hms_blood_requests
  FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. MARKETING CAMPAIGNS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel TEXT DEFAULT 'WhatsApp',
  audience TEXT,
  sent_count INTEGER DEFAULT 0,
  open_rate NUMERIC(5,2) DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('active', 'scheduled', 'completed', 'paused')),
  revenue NUMERIC(12,2) DEFAULT 0,
  budget NUMERIC(10,2),
  notes TEXT,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_marketing_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view campaigns" ON hms_marketing_campaigns;
CREATE POLICY "Staff can view campaigns" ON hms_marketing_campaigns
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage campaigns" ON hms_marketing_campaigns;
CREATE POLICY "Staff can manage campaigns" ON hms_marketing_campaigns
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_blood_stock_group ON hms_blood_stock(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON hms_blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON hms_marketing_campaigns(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. INDENT MANAGEMENT
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_indents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indent_no TEXT UNIQUE,
  department TEXT NOT NULL,
  raised_by TEXT,
  date DATE DEFAULT CURRENT_DATE,
  items_count INTEGER DEFAULT 0,
  urgency TEXT DEFAULT 'Normal' CHECK (urgency IN ('Normal', 'Urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'fulfilled', 'rejected')),
  approved_by TEXT,
  fulfilled_at TIMESTAMPTZ,
  notes TEXT,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_indents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view indents" ON hms_indents;
CREATE POLICY "Staff can view indents" ON hms_indents FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage indents" ON hms_indents;
CREATE POLICY "Staff can manage indents" ON hms_indents FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 18. QUEUE TOKENS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_no TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  patient_id UUID,
  doctor_name TEXT,
  department TEXT,
  queue_date DATE DEFAULT CURRENT_DATE,
  scheduled_time TEXT,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'serving', 'completed', 'skipped')),
  estimated_wait TEXT,
  called_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_queue_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view queue" ON hms_queue_tokens;
CREATE POLICY "Staff can view queue" ON hms_queue_tokens FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage queue" ON hms_queue_tokens;
CREATE POLICY "Staff can manage queue" ON hms_queue_tokens FOR ALL USING (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 19. ACCESS CONTROL ROLES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hms_access_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL UNIQUE,
  description TEXT,
  users_count INTEGER DEFAULT 0,
  permissions JSONB DEFAULT '[]',
  is_system BOOLEAN DEFAULT false,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_access_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view roles" ON hms_access_roles;
CREATE POLICY "Staff can view roles" ON hms_access_roles FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage roles" ON hms_access_roles;
CREATE POLICY "Staff can manage roles" ON hms_access_roles FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_indents_status ON hms_indents(status);
CREATE INDEX IF NOT EXISTS idx_indents_date ON hms_indents(date DESC);
CREATE INDEX IF NOT EXISTS idx_queue_date ON hms_queue_tokens(queue_date, status);
