-- 🔐 Ayuzee User Setup - Profiles, Roles & Super Admin
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Create app_role enum
-- ============================================
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM (
    'admin', 'doctor', 'patient', 'therapist', 'provider',
    'super_admin', 'student', 'venue_owner', 'product_admin',
    'blog_admin', 'content_admin', 'orders_admin', 'accounts_admin',
    'doctor_admin', 'ayush_admin', 'support_admin', 'manufacturer'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. Create profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  gender TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  preferred_languages TEXT[] DEFAULT '{}',
  referral_code TEXT,
  referred_by TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. Create user_roles table
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- ============================================
-- 4. Enable RLS
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access profiles" ON profiles FOR ALL USING (true);

-- User roles: anyone can read, service manages
CREATE POLICY "Anyone can read roles" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Service role full access roles" ON user_roles FOR ALL USING (true);
CREATE POLICY "Admins manage roles" ON user_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins delete roles" ON user_roles FOR DELETE USING (true);

-- ============================================
-- 5. Insert Super Admin profile + ALL roles for curesure4u@gmail.com
-- ============================================
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the user_id from auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'curesure4u@gmail.com' LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User curesure4u@gmail.com not found in auth.users. Please create the user first via Authentication > Users > Add user.';
    RETURN;
  END IF;

  -- Insert profile
  INSERT INTO profiles (user_id, full_name, email, is_active)
  VALUES (v_user_id, 'Dr. Mohamad Saleem', 'curesure4u@gmail.com', true)
  ON CONFLICT (user_id) DO UPDATE SET full_name = 'Dr. Mohamad Saleem', email = 'curesure4u@gmail.com';

  -- Insert ALL roles (super_admin gets access everywhere)
  INSERT INTO user_roles (user_id, role) VALUES
    (v_user_id, 'super_admin'),
    (v_user_id, 'admin'),
    (v_user_id, 'doctor'),
    (v_user_id, 'patient'),
    (v_user_id, 'therapist'),
    (v_user_id, 'provider'),
    (v_user_id, 'student'),
    (v_user_id, 'venue_owner'),
    (v_user_id, 'product_admin'),
    (v_user_id, 'blog_admin'),
    (v_user_id, 'content_admin'),
    (v_user_id, 'orders_admin'),
    (v_user_id, 'accounts_admin'),
    (v_user_id, 'doctor_admin'),
    (v_user_id, 'ayush_admin'),
    (v_user_id, 'support_admin'),
    (v_user_id, 'manufacturer')
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'SUCCESS: curesure4u@gmail.com now has ALL roles including super_admin!';
END $$;
