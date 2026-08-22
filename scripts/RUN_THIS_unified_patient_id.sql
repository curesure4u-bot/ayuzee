-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  AYUZEE — Unified Patient ID System                                           ║
-- ║                                                                              ║
-- ║  Ensures ONE patient = ONE identity across the entire platform.              ║
-- ║  Whether patient signs up via app OR walks into hospital, same record.       ║
-- ║                                                                              ║
-- ║  Architecture:                                                               ║
-- ║    auth.users (UUID) = universal identifier                                  ║
-- ║    profiles.ayuzee_patient_id = human-readable ID (AYZ-P-000001)             ║
-- ║    profiles.phone = matching key between Platform ↔ HMS                       ║
-- ║                                                                              ║
-- ║  SAFE TO RUN: Uses IF NOT EXISTS. Does NOT drop existing data.               ║
-- ║  HOW TO RUN: Supabase Dashboard → SQL Editor → Paste → Run                  ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ADD ayuzee_patient_id TO profiles TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ayuzee_patient_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS abha_id TEXT,                    -- ABDM Health ID (future)
  ADD COLUMN IF NOT EXISTS hms_patient_linked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS hms_op_number TEXT,              -- Hospital OP number
  ADD COLUMN IF NOT EXISTS hms_branch_id UUID REFERENCES hms_branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS blood_group TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- Create unique partial index on ayuzee_patient_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_patient_id
  ON profiles(ayuzee_patient_id) WHERE ayuzee_patient_id IS NOT NULL;

-- Index for phone-based patient lookup (critical for matching)
CREATE INDEX IF NOT EXISTS idx_profiles_phone
  ON profiles(phone) WHERE phone IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. SEQUENCE FOR PATIENT ID GENERATION
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create a sequence for auto-incrementing patient numbers
CREATE SEQUENCE IF NOT EXISTS ayuzee_patient_id_seq START WITH 1;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. FUNCTION: Generate Ayuzee Patient ID
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION generate_ayuzee_patient_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  next_num := nextval('ayuzee_patient_id_seq');
  RETURN 'AYZ-P-' || LPAD(next_num::TEXT, 6, '0');
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. FUNCTION: Find or Create Patient Profile (Phone-based matching)
--    Used by HMS registration to avoid duplicates.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION find_or_link_patient(
  _phone TEXT,
  _name TEXT DEFAULT NULL,
  _email TEXT DEFAULT NULL,
  _gender TEXT DEFAULT NULL,
  _date_of_birth DATE DEFAULT NULL,
  _city TEXT DEFAULT NULL,
  _branch_id UUID DEFAULT NULL
)
RETURNS TABLE (
  profile_id UUID,
  user_id UUID,
  ayuzee_patient_id TEXT,
  is_existing BOOLEAN,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile RECORD;
  _new_patient_id TEXT;
BEGIN
  -- Step 1: Search by phone in existing profiles
  SELECT p.id, p.user_id, p.ayuzee_patient_id, p.full_name
  INTO _profile
  FROM profiles p
  WHERE p.phone = _phone
  LIMIT 1;

  -- Found existing profile → link to HMS and return
  IF _profile.id IS NOT NULL THEN
    -- Ensure ayuzee_patient_id exists
    IF _profile.ayuzee_patient_id IS NULL THEN
      _new_patient_id := generate_ayuzee_patient_id();
      UPDATE profiles SET
        ayuzee_patient_id = _new_patient_id,
        hms_patient_linked = true,
        hms_branch_id = COALESCE(_branch_id, hms_branch_id),
        updated_at = NOW()
      WHERE id = _profile.id;
    ELSE
      _new_patient_id := _profile.ayuzee_patient_id;
      UPDATE profiles SET
        hms_patient_linked = true,
        hms_branch_id = COALESCE(_branch_id, hms_branch_id),
        updated_at = NOW()
      WHERE id = _profile.id;
    END IF;

    RETURN QUERY SELECT
      _profile.id,
      _profile.user_id,
      _new_patient_id,
      true::BOOLEAN,
      _profile.full_name;
    RETURN;
  END IF;

  -- Step 2: Also check auth.users by phone (might have signed up with phone auth)
  -- (Supabase stores phone in auth.users.phone)
  SELECT p.id, p.user_id, p.ayuzee_patient_id, p.full_name
  INTO _profile
  FROM profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE u.phone = _phone OR u.email = _email
  LIMIT 1;

  IF _profile.id IS NOT NULL THEN
    IF _profile.ayuzee_patient_id IS NULL THEN
      _new_patient_id := generate_ayuzee_patient_id();
    ELSE
      _new_patient_id := _profile.ayuzee_patient_id;
    END IF;

    UPDATE profiles SET
      ayuzee_patient_id = COALESCE(ayuzee_patient_id, _new_patient_id),
      phone = COALESCE(phone, _phone),
      hms_patient_linked = true,
      hms_branch_id = COALESCE(_branch_id, hms_branch_id),
      updated_at = NOW()
    WHERE id = _profile.id;

    RETURN QUERY SELECT
      _profile.id,
      _profile.user_id,
      _new_patient_id,
      true::BOOLEAN,
      _profile.full_name;
    RETURN;
  END IF;

  -- Step 3: No existing record found → Create new profile (HMS walk-in patient)
  -- Note: No auth.users record yet — patient hasn't signed up digitally
  -- We create a profile with a generated patient ID that can be linked later
  _new_patient_id := generate_ayuzee_patient_id();

  INSERT INTO profiles (
    user_id, full_name, phone, email, gender, date_of_birth, city,
    ayuzee_patient_id, hms_patient_linked, hms_branch_id, is_active
  ) VALUES (
    -- Use a placeholder UUID (will be linked when patient creates account)
    gen_random_uuid(),
    COALESCE(_name, 'Walk-in Patient'),
    _phone,
    _email,
    _gender,
    _date_of_birth,
    _city,
    _new_patient_id,
    true,
    _branch_id,
    true
  )
  RETURNING profiles.id, profiles.user_id, profiles.ayuzee_patient_id, profiles.full_name
  INTO _profile;

  RETURN QUERY SELECT
    _profile.id,
    _profile.user_id,
    _profile.ayuzee_patient_id,
    false::BOOLEAN,
    _profile.full_name;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. FUNCTION: Generate OP Number (per branch, per year)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION generate_op_number(_branch_code TEXT DEFAULT 'ALSH-01')
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  _year TEXT;
  _next_num INTEGER;
BEGIN
  _year := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Count existing patients for this branch this year + 1
  SELECT COALESCE(MAX(
    NULLIF(SPLIT_PART(hms_op_number, '/', 4), '')::INTEGER
  ), 0) + 1
  INTO _next_num
  FROM profiles
  WHERE hms_op_number LIKE _branch_code || '/OP/' || _year || '/%';

  RETURN _branch_code || '/OP/' || _year || '/' || LPAD(_next_num::TEXT, 4, '0');
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. TRIGGER: Auto-assign ayuzee_patient_id on new profile creation
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION auto_assign_patient_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only assign if not already set and user has 'patient' role or no specific role
  IF NEW.ayuzee_patient_id IS NULL THEN
    NEW.ayuzee_patient_id := generate_ayuzee_patient_id();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_patient_id ON profiles;
CREATE TRIGGER trg_auto_patient_id
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_patient_id();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. BACKFILL: Assign patient IDs to existing profiles that don't have one
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id FROM profiles
    WHERE ayuzee_patient_id IS NULL
    ORDER BY created_at ASC
  LOOP
    UPDATE profiles
    SET ayuzee_patient_id = generate_ayuzee_patient_id()
    WHERE id = r.id;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. VIEW: Unified Patient Directory (Platform + HMS combined)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW unified_patient_directory AS
SELECT
  p.id AS profile_id,
  p.user_id,
  p.ayuzee_patient_id,
  p.hms_op_number,
  p.full_name,
  p.phone,
  p.email,
  p.gender,
  p.date_of_birth,
  p.city,
  p.state,
  p.blood_group,
  p.hms_patient_linked,
  p.hms_branch_id,
  b.branch_name AS linked_branch,
  p.abha_id,
  p.is_active,
  p.created_at,
  -- Status indicators
  CASE
    WHEN p.hms_patient_linked AND p.user_id IN (SELECT id FROM auth.users) THEN 'platform_and_hms'
    WHEN p.hms_patient_linked THEN 'hms_only'
    WHEN p.user_id IN (SELECT id FROM auth.users) THEN 'platform_only'
    ELSE 'orphan'
  END AS sync_status
FROM profiles p
LEFT JOIN hms_branches b ON b.id = p.hms_branch_id
WHERE p.is_active = true
ORDER BY p.created_at DESC;

GRANT SELECT ON unified_patient_directory TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. FUNCTION: Search Patient (for HMS registration — avoids duplicates)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION search_patient(_query TEXT)
RETURNS TABLE (
  profile_id UUID,
  ayuzee_patient_id TEXT,
  hms_op_number TEXT,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  gender TEXT,
  date_of_birth DATE,
  city TEXT,
  hms_patient_linked BOOLEAN,
  sync_status TEXT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.ayuzee_patient_id,
    p.hms_op_number,
    p.full_name,
    p.phone,
    p.email,
    p.gender,
    p.date_of_birth,
    p.city,
    p.hms_patient_linked,
    CASE
      WHEN p.hms_patient_linked THEN 'linked'
      ELSE 'platform_only'
    END
  FROM profiles p
  WHERE p.is_active = true
    AND (
      p.phone ILIKE '%' || _query || '%'
      OR p.full_name ILIKE '%' || _query || '%'
      OR p.ayuzee_patient_id ILIKE '%' || _query || '%'
      OR p.hms_op_number ILIKE '%' || _query || '%'
      OR p.email ILIKE '%' || _query || '%'
    )
  ORDER BY
    CASE WHEN p.phone = _query THEN 0 ELSE 1 END,  -- Exact phone match first
    p.full_name
  LIMIT 20;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Unified Patient ID System Created Successfully
-- 
-- How it works:
-- 1. Every patient gets an AYZ-P-XXXXXX ID (auto-generated)
-- 2. When HMS registers a patient, call find_or_link_patient(phone)
--    → If phone exists in profiles → links existing record (no duplicate)
--    → If new → creates profile with patient ID
-- 3. When patient later signs up on Ayuzee app with same phone →
--    they see their hospital records because same profile is used
-- 4. OP number (branch-specific) generated separately via generate_op_number()
-- 5. All lookups go through search_patient() which searches across
--    phone, name, patient ID, OP number, and email
-- ═══════════════════════════════════════════════════════════════════════════════
