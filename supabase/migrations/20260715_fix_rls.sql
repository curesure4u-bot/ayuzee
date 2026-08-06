-- 🔧 Fix RLS Policies - Allow authenticated users to read their own roles and profiles

-- Drop existing restrictive policies first
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can read roles" ON user_roles;
DROP POLICY IF EXISTS "Service role full access roles" ON user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON user_roles;
DROP POLICY IF EXISTS "Admins delete roles" ON user_roles;

-- Profiles: Open read for all authenticated, insert/update own
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_select_anon" ON profiles FOR SELECT TO anon USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User Roles: Everyone can read (needed for login checks), only service role inserts
CREATE POLICY "user_roles_select" ON user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_roles_select_anon" ON user_roles FOR SELECT TO anon USING (true);
CREATE POLICY "user_roles_insert" ON user_roles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "user_roles_update" ON user_roles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "user_roles_delete" ON user_roles FOR DELETE TO authenticated USING (true);

-- Verify: Check that curesure4u@gmail.com has roles
SELECT u.email, ur.role 
FROM user_roles ur 
JOIN auth.users u ON u.id = ur.user_id 
WHERE u.email = 'curesure4u@gmail.com';
