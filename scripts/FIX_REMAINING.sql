-- This script completes the remaining setup that failed due to seed data.
-- Just the parts AFTER the mentorship tables (study_groups onward)

-- ═══ STUDY GROUPS - Triggers ═══
DROP TRIGGER IF EXISTS on_study_group_member_join ON study_group_members;
CREATE TRIGGER on_study_group_member_join
  AFTER INSERT ON study_group_members
  FOR EACH ROW EXECUTE FUNCTION increment_study_group_member_count();

DROP TRIGGER IF EXISTS on_study_group_member_leave ON study_group_members;
CREATE TRIGGER on_study_group_member_leave
  AFTER DELETE ON study_group_members
  FOR EACH ROW EXECUTE FUNCTION decrement_study_group_member_count();

-- ═══ ASK VAIDYA ═══
CREATE TABLE IF NOT EXISTS vaidya_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  is_resolved BOOLEAN DEFAULT false,
  answer_count INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vaidya_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view questions" ON vaidya_questions;
CREATE POLICY "Authenticated users can view questions"
  ON vaidya_questions FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create questions" ON vaidya_questions;
CREATE POLICY "Authenticated users can create questions"
  ON vaidya_questions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can update own questions" ON vaidya_questions;
CREATE POLICY "Authors can update own questions"
  ON vaidya_questions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can delete own questions" ON vaidya_questions;
CREATE POLICY "Authors can delete own questions"
  ON vaidya_questions FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS vaidya_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES vaidya_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vaidya_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view answers" ON vaidya_answers;
CREATE POLICY "Authenticated users can view answers"
  ON vaidya_answers FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create answers" ON vaidya_answers;
CREATE POLICY "Authenticated users can create answers"
  ON vaidya_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can update own answers" ON vaidya_answers;
CREATE POLICY "Authors can update own answers"
  ON vaidya_answers FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can delete own answers" ON vaidya_answers;
CREATE POLICY "Authors can delete own answers"
  ON vaidya_answers FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS vaidya_question_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES vaidya_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

ALTER TABLE vaidya_question_upvotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view upvotes" ON vaidya_question_upvotes;
CREATE POLICY "Users can view upvotes" ON vaidya_question_upvotes FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can upvote" ON vaidya_question_upvotes;
CREATE POLICY "Users can upvote" ON vaidya_question_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove upvote" ON vaidya_question_upvotes;
CREATE POLICY "Users can remove upvote" ON vaidya_question_upvotes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_vaidya_questions_subject ON vaidya_questions(subject, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vaidya_questions_resolved ON vaidya_questions(is_resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vaidya_answers_question ON vaidya_answers(question_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_vaidya_upvotes_question ON vaidya_question_upvotes(question_id);

CREATE OR REPLACE FUNCTION increment_vaidya_answer_count() RETURNS TRIGGER AS $$
BEGIN UPDATE vaidya_questions SET answer_count = answer_count + 1, updated_at = NOW() WHERE id = NEW.question_id; RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vaidya_answer_created ON vaidya_answers;
CREATE TRIGGER on_vaidya_answer_created AFTER INSERT ON vaidya_answers FOR EACH ROW EXECUTE FUNCTION increment_vaidya_answer_count();

CREATE OR REPLACE FUNCTION increment_vaidya_question_upvotes() RETURNS TRIGGER AS $$
BEGIN UPDATE vaidya_questions SET upvotes = upvotes + 1 WHERE id = NEW.question_id; RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vaidya_question_upvoted ON vaidya_question_upvotes;
CREATE TRIGGER on_vaidya_question_upvoted AFTER INSERT ON vaidya_question_upvotes FOR EACH ROW EXECUTE FUNCTION increment_vaidya_question_upvotes();

CREATE OR REPLACE FUNCTION decrement_vaidya_question_upvotes() RETURNS TRIGGER AS $$
BEGIN UPDATE vaidya_questions SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.question_id; RETURN OLD; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_vaidya_question_unupvoted ON vaidya_question_upvotes;
CREATE TRIGGER on_vaidya_question_unupvoted AFTER DELETE ON vaidya_question_upvotes FOR EACH ROW EXECUTE FUNCTION decrement_vaidya_question_upvotes();

-- ═══ INTERNSHIP JOURNAL ═══
CREATE TABLE IF NOT EXISTS internship_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  posting_date DATE NOT NULL DEFAULT CURRENT_DATE,
  department TEXT NOT NULL,
  hospital_name TEXT,
  supervisor_name TEXT,
  cases_seen INTEGER DEFAULT 0,
  procedures_performed TEXT[] DEFAULT '{}',
  diagnosis_observed TEXT[] DEFAULT '{}',
  learnings TEXT NOT NULL,
  challenges TEXT,
  supervisor_feedback TEXT,
  hours_spent NUMERIC(4,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE internship_journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own journal entries" ON internship_journal_entries;
CREATE POLICY "Users can view own journal entries" ON internship_journal_entries FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own entries" ON internship_journal_entries;
CREATE POLICY "Users can create own entries" ON internship_journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own entries" ON internship_journal_entries;
CREATE POLICY "Users can update own entries" ON internship_journal_entries FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own entries" ON internship_journal_entries;
CREATE POLICY "Users can delete own entries" ON internship_journal_entries FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_internship_journal_user_date ON internship_journal_entries(user_id, posting_date DESC);
CREATE INDEX IF NOT EXISTS idx_internship_journal_department ON internship_journal_entries(user_id, department);

-- ═══ INTERNSHIP MARKETPLACE ═══
CREATE TABLE IF NOT EXISTS internship_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  location TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'General',
  description TEXT NOT NULL,
  requirements TEXT,
  duration_weeks INTEGER DEFAULT 4,
  stipend TEXT,
  spots_available INTEGER DEFAULT 1,
  application_deadline DATE,
  is_active BOOLEAN DEFAULT true,
  application_count INTEGER DEFAULT 0,
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE internship_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view active listings" ON internship_listings;
CREATE POLICY "Authenticated users can view active listings" ON internship_listings FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

DROP POLICY IF EXISTS "Authenticated users can create listings" ON internship_listings;
CREATE POLICY "Authenticated users can create listings" ON internship_listings FOR INSERT WITH CHECK (auth.uid() = posted_by);

DROP POLICY IF EXISTS "Posters can update own listings" ON internship_listings;
CREATE POLICY "Posters can update own listings" ON internship_listings FOR UPDATE USING (auth.uid() = posted_by);

CREATE TABLE IF NOT EXISTS internship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES internship_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'accepted', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, user_id)
);

ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own applications" ON internship_applications;
CREATE POLICY "Users can view own applications" ON internship_applications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can apply" ON internship_applications;
CREATE POLICY "Users can apply" ON internship_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_internship_listings_active ON internship_listings(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_internship_applications_user ON internship_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_internship_applications_listing ON internship_applications(listing_id);

CREATE OR REPLACE FUNCTION increment_internship_application_count() RETURNS TRIGGER AS $$
BEGIN UPDATE internship_listings SET application_count = application_count + 1 WHERE id = NEW.listing_id; RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_internship_application ON internship_applications;
CREATE TRIGGER on_internship_application AFTER INSERT ON internship_applications FOR EACH ROW EXECUTE FUNCTION increment_internship_application_count();

INSERT INTO internship_listings (title, hospital_name, location, department, description, requirements, duration_weeks, stipend, spots_available, application_deadline, posted_by) VALUES
('Panchakarma Clinical Internship', 'SDM Ayurveda Hospital', 'Udupi, Karnataka', 'Panchakarma', 'Hands-on training in Panchakarma procedures.', 'BAMS 3rd year or above.', 8, '5000/month', 5, (CURRENT_DATE + INTERVAL '30 days')::DATE, NULL),
('Kayachikitsa OPD Posting', 'Govt. Ayurveda Hospital', 'Thiruvananthapuram, Kerala', 'Kayachikitsa', 'OPD exposure in general medicine.', 'BAMS students in internship phase.', 4, 'Unpaid', 10, (CURRENT_DATE + INTERVAL '45 days')::DATE, NULL),
('Research Internship - Clinical Trials', 'AIIA, New Delhi', 'New Delhi', 'Research', 'Assist in ongoing AYUSH clinical trials.', 'MD/MS scholars or final year BAMS.', 12, '15000/month', 3, (CURRENT_DATE + INTERVAL '60 days')::DATE, NULL)
ON CONFLICT DO NOTHING;

-- ═══ RESEARCH COLLABORATION ═══
CREATE TABLE IF NOT EXISTS research_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  research_area TEXT NOT NULL DEFAULT 'General',
  looking_for TEXT NOT NULL,
  skills_needed TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
  collaborator_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view projects" ON research_projects;
CREATE POLICY "Authenticated users can view projects" ON research_projects FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create projects" ON research_projects;
CREATE POLICY "Users can create projects" ON research_projects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can update own projects" ON research_projects;
CREATE POLICY "Authors can update own projects" ON research_projects FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can delete own projects" ON research_projects;
CREATE POLICY "Authors can delete own projects" ON research_projects FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS research_collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE research_collaboration_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Requesters can view own requests" ON research_collaboration_requests;
CREATE POLICY "Requesters can view own requests" ON research_collaboration_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Project owners can view requests" ON research_collaboration_requests;
CREATE POLICY "Project owners can view requests" ON research_collaboration_requests FOR SELECT USING (auth.uid() IN (SELECT user_id FROM research_projects WHERE id = project_id));

DROP POLICY IF EXISTS "Users can send requests" ON research_collaboration_requests;
CREATE POLICY "Users can send requests" ON research_collaboration_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_research_projects_status ON research_projects(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_collab_requests_project ON research_collaboration_requests(project_id);

CREATE OR REPLACE FUNCTION increment_research_collaborator_count() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    UPDATE research_projects SET collaborator_count = collaborator_count + 1 WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_research_collab_accepted ON research_collaboration_requests;
CREATE TRIGGER on_research_collab_accepted AFTER UPDATE ON research_collaboration_requests FOR EACH ROW EXECUTE FUNCTION increment_research_collaborator_count();

-- ═══ STARTUP INCUBATOR ═══
CREATE TABLE IF NOT EXISTS startup_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'HealthTech' CHECK (category IN ('HealthTech', 'EdTech', 'Wellness', 'E-Commerce', 'SaaS', 'Social Impact', 'Other')),
  stage TEXT NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea', 'prototype', 'mvp', 'launched')),
  looking_for TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE startup_ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view ideas" ON startup_ideas;
CREATE POLICY "Authenticated users can view ideas" ON startup_ideas FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create ideas" ON startup_ideas;
CREATE POLICY "Users can create ideas" ON startup_ideas FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can update own ideas" ON startup_ideas;
CREATE POLICY "Authors can update own ideas" ON startup_ideas FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can delete own ideas" ON startup_ideas;
CREATE POLICY "Authors can delete own ideas" ON startup_ideas FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS startup_idea_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES startup_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

ALTER TABLE startup_idea_upvotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view upvotes" ON startup_idea_upvotes;
CREATE POLICY "Users can view upvotes" ON startup_idea_upvotes FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can upvote" ON startup_idea_upvotes;
CREATE POLICY "Users can upvote" ON startup_idea_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove upvote" ON startup_idea_upvotes;
CREATE POLICY "Users can remove upvote" ON startup_idea_upvotes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_startup_ideas_category ON startup_ideas(category, upvotes DESC);

CREATE OR REPLACE FUNCTION increment_startup_upvotes() RETURNS TRIGGER AS $$
BEGIN UPDATE startup_ideas SET upvotes = upvotes + 1 WHERE id = NEW.idea_id; RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_startup_upvoted ON startup_idea_upvotes;
CREATE TRIGGER on_startup_upvoted AFTER INSERT ON startup_idea_upvotes FOR EACH ROW EXECUTE FUNCTION increment_startup_upvotes();

CREATE OR REPLACE FUNCTION decrement_startup_upvotes() RETURNS TRIGGER AS $$
BEGIN UPDATE startup_ideas SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.idea_id; RETURN OLD; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_startup_unupvoted ON startup_idea_upvotes;
CREATE TRIGGER on_startup_unupvoted AFTER DELETE ON startup_idea_upvotes FOR EACH ROW EXECUTE FUNCTION decrement_startup_upvotes();

-- ═══ FREELANCE GIGS ═══
CREATE TABLE IF NOT EXISTS freelance_gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Content Writing' CHECK (category IN ('Content Writing', 'Social Media', 'Clinic Management', 'Research Assistant', 'Translation', 'Graphic Design', 'Video Editing', 'Other')),
  budget TEXT,
  duration TEXT,
  skills_required TEXT[] DEFAULT '{}',
  is_remote BOOLEAN DEFAULT true,
  location TEXT,
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  poster_name TEXT,
  is_active BOOLEAN DEFAULT true,
  application_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE freelance_gigs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view active gigs" ON freelance_gigs;
CREATE POLICY "Authenticated users can view active gigs" ON freelance_gigs FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

DROP POLICY IF EXISTS "Users can post gigs" ON freelance_gigs;
CREATE POLICY "Users can post gigs" ON freelance_gigs FOR INSERT WITH CHECK (auth.uid() = posted_by);

DROP POLICY IF EXISTS "Posters can update" ON freelance_gigs;
CREATE POLICY "Posters can update" ON freelance_gigs FOR UPDATE USING (auth.uid() = posted_by);

CREATE TABLE IF NOT EXISTS freelance_gig_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES freelance_gigs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'hired', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gig_id, user_id)
);

ALTER TABLE freelance_gig_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own applications" ON freelance_gig_applications;
CREATE POLICY "Users can view own applications" ON freelance_gig_applications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can apply" ON freelance_gig_applications;
CREATE POLICY "Users can apply" ON freelance_gig_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_freelance_gigs_active ON freelance_gigs(is_active, category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_freelance_gig_apps_user ON freelance_gig_applications(user_id);

CREATE OR REPLACE FUNCTION increment_gig_application_count() RETURNS TRIGGER AS $$
BEGIN UPDATE freelance_gigs SET application_count = application_count + 1 WHERE id = NEW.gig_id; RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_gig_application ON freelance_gig_applications;
CREATE TRIGGER on_gig_application AFTER INSERT ON freelance_gig_applications FOR EACH ROW EXECUTE FUNCTION increment_gig_application_count();

INSERT INTO freelance_gigs (title, description, category, budget, duration, skills_required, is_remote, poster_name, posted_by) VALUES
('Ayurveda Blog Writer Needed', 'Write 4 SEO-optimized blog articles per month.', 'Content Writing', '3000/month', 'Ongoing', ARRAY['Ayurveda knowledge', 'SEO writing', 'English'], true, 'Dr. Ananya Clinic', NULL),
('Social Media Manager for Ayush Clinic', 'Manage Instagram and Facebook pages.', 'Social Media', '5000/month', '3 months', ARRAY['Canva', 'Instagram Reels', 'Content planning'], true, 'Vedic Wellness Center', NULL),
('Research Assistant - Literature Review', 'Help compile a systematic review on Panchakarma.', 'Research Assistant', '8000 (one-time)', '2 weeks', ARRAY['PubMed search', 'Academic writing'], true, 'BHU Research Lab', NULL)
ON CONFLICT DO NOTHING;

-- ═══ ALL DONE! ═══
