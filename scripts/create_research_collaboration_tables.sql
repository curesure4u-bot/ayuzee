-- ═══════════════════════════════════════════════════════════
-- Research Collaboration — Find co-authors, multi-center studies
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════

-- 1. Research Projects (looking for collaborators)
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

CREATE POLICY "Authenticated users can view projects"
  ON research_projects FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create projects"
  ON research_projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update own projects"
  ON research_projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete own projects"
  ON research_projects FOR DELETE USING (auth.uid() = user_id);

-- 2. Collaboration Requests
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

CREATE POLICY "Requesters can view own requests"
  ON research_collaboration_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Project owners can view requests"
  ON research_collaboration_requests FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM research_projects WHERE id = project_id)
  );

CREATE POLICY "Users can send requests"
  ON research_collaboration_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_research_projects_status ON research_projects(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_collab_requests_project ON research_collaboration_requests(project_id);

-- 4. Trigger
CREATE OR REPLACE FUNCTION increment_research_collaborator_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    UPDATE research_projects SET collaborator_count = collaborator_count + 1 WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_research_collab_accepted
  AFTER UPDATE ON research_collaboration_requests
  FOR EACH ROW EXECUTE FUNCTION increment_research_collaborator_count();

-- Done!
