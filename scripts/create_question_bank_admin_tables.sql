-- ═══════════════════════════════════════════════════════════
-- Question Bank + Student Admin Roles
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Student Admin Roles (promote students to manage content)
CREATE TABLE IF NOT EXISTS student_admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('mega_admin', 'college_admin', 'quiz_master', 'contributor')),
  college_name TEXT,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role)
);

ALTER TABLE student_admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view admin roles" ON student_admin_roles;
CREATE POLICY "Authenticated users can view admin roles"
  ON student_admin_roles FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Super admins can manage roles" ON student_admin_roles;
CREATE POLICY "Super admins can manage roles"
  ON student_admin_roles FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role = 'mega_admin' AND is_active = true)
    OR NOT EXISTS (SELECT 1 FROM student_admin_roles WHERE role = 'mega_admin')
  );

DROP POLICY IF EXISTS "Super admins can update roles" ON student_admin_roles;
CREATE POLICY "Super admins can update roles"
  ON student_admin_roles FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role = 'mega_admin' AND is_active = true)
  );

DROP POLICY IF EXISTS "Super admins can delete roles" ON student_admin_roles;
CREATE POLICY "Super admins can delete roles"
  ON student_admin_roles FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role = 'mega_admin' AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_student_admin_roles_user ON student_admin_roles(user_id, is_active);

-- 2. Question Bank (master repository of all MCQs)
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'General',
  difficulty TEXT NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  reference_text TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_note TEXT,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view approved questions
DROP POLICY IF EXISTS "Authenticated users can view approved questions" ON question_bank;
CREATE POLICY "Authenticated users can view approved questions"
  ON question_bank FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      status = 'approved'
      OR created_by = auth.uid()
      OR auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role IN ('mega_admin', 'quiz_master') AND is_active = true)
    )
  );

-- Contributors can create questions
DROP POLICY IF EXISTS "Contributors can create questions" ON question_bank;
CREATE POLICY "Contributors can create questions"
  ON question_bank FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE is_active = true)
  );

-- Admins and quiz masters can update (approve/reject)
DROP POLICY IF EXISTS "Admins can update questions" ON question_bank;
CREATE POLICY "Admins can update questions"
  ON question_bank FOR UPDATE USING (
    auth.uid() = created_by
    OR auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role IN ('mega_admin', 'quiz_master') AND is_active = true)
  );

-- Only super admins can delete
DROP POLICY IF EXISTS "Super admins can delete questions" ON question_bank;
CREATE POLICY "Super admins can delete questions"
  ON question_bank FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role = 'mega_admin' AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_question_bank_subject ON question_bank(subject, topic, difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_status ON question_bank(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_bank_creator ON question_bank(created_by, status);

-- 3. Content Submissions (for case studies, internships, gigs needing approval)
CREATE TABLE IF NOT EXISTS content_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('case_study', 'internship', 'gig', 'competition', 'blog')),
  title TEXT NOT NULL,
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own submissions" ON content_submissions;
CREATE POLICY "Users can view own submissions"
  ON content_submissions FOR SELECT USING (
    auth.uid() = submitted_by
    OR auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role IN ('mega_admin', 'college_admin') AND is_active = true)
  );

DROP POLICY IF EXISTS "Users can create submissions" ON content_submissions;
CREATE POLICY "Users can create submissions"
  ON content_submissions FOR INSERT WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Admins can update submissions" ON content_submissions;
CREATE POLICY "Admins can update submissions"
  ON content_submissions FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role IN ('mega_admin', 'college_admin') AND is_active = true)
  );

CREATE INDEX IF NOT EXISTS idx_content_submissions_status ON content_submissions(status, content_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_submissions_user ON content_submissions(submitted_by);

-- Done! Question Bank + Admin Roles tables created.
