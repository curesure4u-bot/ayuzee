-- ═══════════════════════════════════════════════════════════
-- Mentorship & Connect — Students find mentors and exchange guidance
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Mentors (senior students / alumni who offer mentorship)
CREATE TABLE IF NOT EXISTS student_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  college_name TEXT,
  specialization TEXT NOT NULL DEFAULT 'General',
  year_of_study INTEGER,
  bio TEXT,
  subjects TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  max_mentees INTEGER DEFAULT 5,
  current_mentees INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE student_mentors ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view available mentors
CREATE POLICY "Authenticated users can view mentors"
  ON student_mentors FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Users can register as mentor
CREATE POLICY "Users can register as mentor"
  ON student_mentors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Mentors can update their own profile
CREATE POLICY "Mentors can update own profile"
  ON student_mentors FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Mentorship Requests (student requests a mentor)
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES student_mentors(id) ON DELETE CASCADE,
  mentee_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentee_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mentor_id, mentee_user_id)
);

ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

-- Mentees can view their own requests
CREATE POLICY "Mentees can view own requests"
  ON mentorship_requests FOR SELECT
  USING (auth.uid() = mentee_user_id);

-- Mentors can view requests sent to them
CREATE POLICY "Mentors can view incoming requests"
  ON mentorship_requests FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM student_mentors WHERE id = mentor_id)
  );

-- Users can create requests
CREATE POLICY "Users can create mentorship requests"
  ON mentorship_requests FOR INSERT
  WITH CHECK (auth.uid() = mentee_user_id);

-- Mentors can update request status
CREATE POLICY "Mentors can update request status"
  ON mentorship_requests FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM student_mentors WHERE id = mentor_id)
  );

-- 3. Mentorship Messages (between mentor and mentee)
CREATE TABLE IF NOT EXISTS mentorship_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES mentorship_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mentorship_messages ENABLE ROW LEVEL SECURITY;

-- Both parties can view messages
CREATE POLICY "Participants can view messages"
  ON mentorship_messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT mentee_user_id FROM mentorship_requests WHERE id = request_id
      UNION
      SELECT sm.user_id FROM mentorship_requests mr JOIN student_mentors sm ON sm.id = mr.mentor_id WHERE mr.id = request_id
    )
  );

-- Both parties can send messages (only on accepted requests)
CREATE POLICY "Participants can send messages"
  ON mentorship_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM mentorship_requests WHERE id = request_id AND status = 'accepted'
    )
  );

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_student_mentors_available
  ON student_mentors(is_available, specialization);

CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor
  ON mentorship_requests(mentor_id, status);

CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentee
  ON mentorship_requests(mentee_user_id, status);

CREATE INDEX IF NOT EXISTS idx_mentorship_messages_request
  ON mentorship_messages(request_id, created_at ASC);

-- 5. Trigger: increment current_mentees on accept
CREATE OR REPLACE FUNCTION on_mentorship_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    UPDATE student_mentors SET current_mentees = current_mentees + 1, updated_at = NOW()
    WHERE id = NEW.mentor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_mentorship_request_accepted
  AFTER UPDATE ON mentorship_requests
  FOR EACH ROW EXECUTE FUNCTION on_mentorship_accepted();

-- Seed mentors removed (add real mentors through the app UI)

-- Done! Mentorship tables created with sample data.
