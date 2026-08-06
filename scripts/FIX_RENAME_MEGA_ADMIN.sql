-- Fix: Rename super_admin to mega_admin in student_admin_roles
-- Run this in Supabase SQL Editor

-- Update the CHECK constraint
ALTER TABLE student_admin_roles DROP CONSTRAINT IF EXISTS student_admin_roles_role_check;
ALTER TABLE student_admin_roles ADD CONSTRAINT student_admin_roles_role_check 
  CHECK (role IN ('mega_admin', 'college_admin', 'quiz_master', 'contributor'));

-- Rename any existing super_admin rows
UPDATE student_admin_roles SET role = 'mega_admin' WHERE role = 'super_admin';

-- Update RLS policies to use mega_admin
DROP POLICY IF EXISTS "Super admins can manage roles" ON student_admin_roles;
CREATE POLICY "Mega admins can manage roles"
  ON student_admin_roles FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role = 'mega_admin' AND is_active = true)
  );

DROP POLICY IF EXISTS "Super admins can update roles" ON student_admin_roles;
CREATE POLICY "Mega admins can update roles"
  ON student_admin_roles FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role = 'mega_admin' AND is_active = true)
  );

DROP POLICY IF EXISTS "Super admins can delete roles" ON student_admin_roles;
CREATE POLICY "Mega admins can delete roles"
  ON student_admin_roles FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role = 'mega_admin' AND is_active = true)
  );

-- Update question_bank policies
DROP POLICY IF EXISTS "Authenticated users can view approved questions" ON question_bank;
CREATE POLICY "Authenticated users can view approved questions"
  ON question_bank FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      status = 'approved'
      OR created_by = auth.uid()
      OR auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role IN ('mega_admin', 'quiz_master') AND is_active = true)
    )
  );

DROP POLICY IF EXISTS "Admins can update questions" ON question_bank;
CREATE POLICY "Admins can update questions"
  ON question_bank FOR UPDATE USING (
    auth.uid() = created_by
    OR auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role IN ('mega_admin', 'quiz_master') AND is_active = true)
  );

DROP POLICY IF EXISTS "Super admins can delete questions" ON question_bank;
DROP POLICY IF EXISTS "Mega admins can delete questions" ON question_bank;
CREATE POLICY "Mega admins can delete questions"
  ON question_bank FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM student_admin_roles WHERE role = 'mega_admin' AND is_active = true)
  );

-- Done! Now only curesure4u@gmail.com can manually add mega_admin role via Supabase dashboard.
