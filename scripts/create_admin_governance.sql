-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Super Admin Governance — Audit Log, Roles & Permissions,       ║
-- ║  Doctor Sign-off Queue, Support Tickets                         ║
-- ║  Run this in Supabase SQL Editor                                ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ════════════════════════════════════════════════════════════
-- 1. AUDIT LOG (Who did what, when)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Who
  actor_user_id UUID, -- the user who performed the action
  actor_email TEXT,
  actor_role TEXT, -- super_admin, admin, doctor, therapist, venue, student, patient
  -- What
  action_type TEXT NOT NULL, -- create, update, delete, approve, reject, suspend, login, settings_change
  module TEXT NOT NULL, -- users, doctors, therapists, venues, sessions, orders, finance, settings, etc.
  resource_type TEXT, -- the table/entity affected
  resource_id TEXT, -- ID of the affected record
  -- Details
  description TEXT NOT NULL, -- human-readable: "Approved doctor Dr. Rahul Sharma"
  old_values JSONB, -- previous state (for updates)
  new_values JSONB, -- new state (for updates)
  metadata JSONB DEFAULT '{}'::jsonb, -- any extra context
  -- Context
  ip_address TEXT,
  user_agent TEXT,
  -- Severity
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No RLS — only super admins access this via app-level checks
ALTER TABLE platform_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only super admins read audit log" ON platform_audit_log
  FOR ALL USING (auth.jwt() ->> 'email' IN ('jasirsajidh8@gmail.com', 'curesure4u@gmail.com'));

CREATE INDEX IF NOT EXISTS idx_audit_actor ON platform_audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON platform_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_module ON platform_audit_log(module);
CREATE INDEX IF NOT EXISTS idx_audit_created ON platform_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON platform_audit_log(severity);

-- ════════════════════════════════════════════════════════════
-- 2. ROLES & PERMISSIONS
-- ════════════════════════════════════════════════════════════

-- Available roles in the platform
CREATE TABLE IF NOT EXISTS platform_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL UNIQUE, -- super_admin, regional_admin, content_admin, finance_admin, support_admin, doctor, therapist, venue_manager, student, patient
  display_name TEXT NOT NULL,
  description TEXT,
  is_system_role BOOLEAN NOT NULL DEFAULT FALSE, -- system roles cannot be deleted
  tier_level INTEGER NOT NULL DEFAULT 0, -- 0=basic, 1=elevated, 2=admin, 3=super_admin
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Platform modules/features
CREATE TABLE IF NOT EXISTS platform_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL UNIQUE, -- users, doctors, therapists, venues, appointments, sessions, orders, finance, content, settings, reports, safety, hms
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- governance, operations, content, finance, hms, safety
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Permission matrix: role × module × actions
CREATE TABLE IF NOT EXISTS platform_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES platform_roles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES platform_modules(id) ON DELETE CASCADE,
  -- Permissions
  can_view BOOLEAN NOT NULL DEFAULT FALSE,
  can_create BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  can_approve BOOLEAN NOT NULL DEFAULT FALSE,
  can_export BOOLEAN NOT NULL DEFAULT FALSE,
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role_id, module_id)
);

-- User → Role assignments (supports multiple roles per user)
CREATE TABLE IF NOT EXISTS platform_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES platform_roles(id) ON DELETE CASCADE,
  -- Scope (optional — for regional admins)
  scope_type TEXT, -- null = global, 'city', 'state', 'venue'
  scope_value TEXT, -- e.g., "Kerala", "Chennai", venue_id
  -- Assignment
  assigned_by UUID, -- who granted this role
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ, -- null = permanent
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(user_id, role_id, scope_value)
);

-- RLS for roles/permissions
ALTER TABLE platform_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage roles" ON platform_roles
  FOR ALL USING (auth.jwt() ->> 'email' IN ('jasirsajidh8@gmail.com', 'curesure4u@gmail.com'));
CREATE POLICY "Super admins manage modules" ON platform_modules
  FOR ALL USING (auth.jwt() ->> 'email' IN ('jasirsajidh8@gmail.com', 'curesure4u@gmail.com'));
CREATE POLICY "Super admins manage permissions" ON platform_role_permissions
  FOR ALL USING (auth.jwt() ->> 'email' IN ('jasirsajidh8@gmail.com', 'curesure4u@gmail.com'));
CREATE POLICY "Super admins manage user roles" ON platform_user_roles
  FOR ALL USING (auth.jwt() ->> 'email' IN ('jasirsajidh8@gmail.com', 'curesure4u@gmail.com'));

-- ════════════════════════════════════════════════════════════
-- 3. SEED DEFAULT ROLES & MODULES
-- ════════════════════════════════════════════════════════════

INSERT INTO platform_roles (role_name, display_name, description, is_system_role, tier_level) VALUES
  ('super_admin', 'Super Admin', 'Full platform access — Jasir & Dr. Saleem', true, 3),
  ('regional_admin', 'Regional Admin', 'Manage operations for a specific city/state', false, 2),
  ('content_admin', 'Content Admin', 'Manage blogs, courses, therapies catalog', false, 2),
  ('finance_admin', 'Finance Admin', 'Manage payouts, commissions, revenue reports', false, 2),
  ('support_admin', 'Support Admin', 'Handle support tickets, user issues, safety flags', false, 2),
  ('doctor', 'Doctor', 'Prescribe therapies, manage patients, sign-off sessions', true, 1),
  ('therapist', 'Therapist', 'Execute prescribed therapies, submit notes', true, 0),
  ('venue_manager', 'Venue Manager', 'Manage rooms, bookings, assign shifts', true, 1),
  ('student', 'Student', 'Access learning, quizzes, internships', true, 0),
  ('patient', 'Patient', 'Book appointments, view prescriptions, shop', true, 0)
ON CONFLICT (role_name) DO NOTHING;

INSERT INTO platform_modules (module_key, display_name, description, category, sort_order) VALUES
  ('dashboard', 'Dashboard', 'Admin overview & KPIs', 'governance', 1),
  ('users', 'User Management', 'All users, doctors, therapists, venues, students', 'governance', 2),
  ('roles', 'Roles & Permissions', 'Manage platform roles and access', 'governance', 3),
  ('audit', 'Audit Log', 'View activity trail', 'governance', 4),
  ('appointments', 'Appointments', 'Doctor-patient appointments', 'operations', 10),
  ('therapy_sessions', 'Therapy Sessions', 'Panchakarma and therapy sessions', 'operations', 11),
  ('signoff_queue', 'Doctor Sign-off Queue', 'Pending session approvals', 'operations', 12),
  ('orders', 'Orders & Prescriptions', 'Product and prescription orders', 'operations', 13),
  ('support_tickets', 'Support Tickets', 'All platform support requests', 'operations', 14),
  ('therapies_catalog', 'Therapies Catalog', 'Manage therapy types and protocols', 'content', 20),
  ('learning', 'Learning & Webinars', 'Courses, content, events', 'content', 21),
  ('products', 'Products & Store', 'E-commerce products', 'content', 22),
  ('blogs', 'Blogs & Content', 'Articles, marketing content', 'content', 23),
  ('jobs', 'Jobs Board', 'Job listings and applications', 'content', 24),
  ('commissions', 'Commissions & Payouts', 'Revenue sharing rules', 'finance', 30),
  ('payments', 'Payments & Transactions', 'All financial transactions', 'finance', 31),
  ('reports', 'Reports & Analytics', 'Financial and operational reports', 'finance', 32),
  ('hms', 'HMS Tools', 'Hospital management features', 'hms', 40),
  ('safety', 'Safety & Flags', 'User safety, suspensions, bans', 'safety', 50),
  ('settings', 'Platform Settings', 'Global configuration', 'safety', 51),
  ('notifications', 'Notifications', 'Push and email notifications', 'safety', 52)
ON CONFLICT (module_key) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 4. ADMIN SUPPORT TICKETS VIEW (extends therapist_support_tickets)
--    Plus a generic platform_support_tickets for all user types
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Who submitted
  submitter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submitter_email TEXT,
  submitter_role TEXT NOT NULL, -- doctor, therapist, venue, student, patient
  submitter_name TEXT,
  -- Ticket details
  category TEXT NOT NULL CHECK (category IN ('payment', 'booking', 'technical', 'account', 'safety', 'feedback', 'therapist_issue', 'doctor_issue', 'venue_issue', 'other')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  -- Status & Assignment
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'waiting_on_user', 'resolved', 'closed')),
  assigned_to UUID, -- admin user handling this
  assigned_to_name TEXT,
  -- Resolution
  admin_response TEXT,
  internal_notes TEXT, -- not visible to submitter
  resolution_summary TEXT,
  resolved_at TIMESTAMPTZ,
  -- SLA
  sla_due_at TIMESTAMPTZ, -- auto-set based on priority (urgent=4h, high=12h, medium=24h, low=48h)
  sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage all tickets" ON platform_support_tickets
  FOR ALL USING (auth.jwt() ->> 'email' IN ('jasirsajidh8@gmail.com', 'curesure4u@gmail.com'));
CREATE POLICY "Users view own tickets" ON platform_support_tickets
  FOR SELECT USING (submitter_user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_pst_status ON platform_support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_pst_priority ON platform_support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_pst_submitter ON platform_support_tickets(submitter_user_id);

-- ════════════════════════════════════════════════════════════
-- Done! Governance tables created.
-- ════════════════════════════════════════════════════════════
