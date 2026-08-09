-- ═══════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — Life Planner Module
-- (Today's List, Todo, Goals/Milestones, Vision-Mission, Discipline Checklist)
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- SECTION 1: TODAY'S LIST (auto-resets daily)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_today_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_today_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own today tasks" ON beyond_today_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create today tasks" ON beyond_today_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update today tasks" ON beyond_today_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete today tasks" ON beyond_today_tasks FOR DELETE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 2: TODO LIST (persistent, with status)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  priority INTEGER NOT NULL DEFAULT 0,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own todos" ON beyond_todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create todos" ON beyond_todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update todos" ON beyond_todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete todos" ON beyond_todos FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- SECTION 3: GOALS & MILESTONES
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  timeframe TEXT NOT NULL DEFAULT 'monthly' CHECK (timeframe IN ('monthly', 'quarterly', '3_years')),
  category TEXT DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  target_date DATE,
  progress_pct INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goals" ON beyond_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create goals" ON beyond_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update goals" ON beyond_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete goals" ON beyond_goals FOR DELETE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 4: VISION & MISSION
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_vision_mission (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vision TEXT,
  mission TEXT,
  core_values TEXT[] DEFAULT '{}',
  life_purpose TEXT,
  five_year_picture TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE beyond_vision_mission ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own vision" ON beyond_vision_mission FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create vision" ON beyond_vision_mission FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update vision" ON beyond_vision_mission FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- SECTION 5: DISCIPLINE CHECKLIST
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_discipline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  what_to_measure TEXT NOT NULL,
  day_of_week TEXT NOT NULL DEFAULT 'everyday' CHECK (day_of_week IN (
    'everyday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  )),
  time_of_day TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_discipline_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own discipline items" ON beyond_discipline_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create discipline items" ON beyond_discipline_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update discipline items" ON beyond_discipline_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete discipline items" ON beyond_discipline_items FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS beyond_discipline_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES beyond_discipline_items(id) ON DELETE CASCADE,
  is_done BOOLEAN NOT NULL DEFAULT true,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id, date)
);

ALTER TABLE beyond_discipline_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own discipline logs" ON beyond_discipline_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create discipline logs" ON beyond_discipline_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete discipline logs" ON beyond_discipline_logs FOR DELETE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════
-- SECTION 6: 101 CHALLENGES (user-defined, with difficulty)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_101_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_101_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own 101 challenges" ON beyond_101_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create 101 challenges" ON beyond_101_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update 101 challenges" ON beyond_101_challenges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete 101 challenges" ON beyond_101_challenges FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- SECTION 7: COMPETENCY TRACKER (Skills + Habits)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS beyond_competency_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 10),
  target_level INTEGER NOT NULL DEFAULT 5 CHECK (target_level BETWEEN 1 AND 10),
  category TEXT DEFAULT 'professional',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beyond_competency_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own skills" ON beyond_competency_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create skills" ON beyond_competency_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update skills" ON beyond_competency_skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete skills" ON beyond_competency_skills FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- DONE! Tables created for:
-- ✅ Today's Tasks (daily auto-reset concept)
-- ✅ Todo List (persistent with status)
-- ✅ Goals & Milestones (monthly/quarterly/3-year)
-- ✅ Vision & Mission (single row per user)
-- ✅ Discipline Checklist (items + daily logs)
-- ✅ 101 Challenges (user-defined, difficulty-rated)
-- ✅ Competency Skills (current vs target level)
-- ═══════════════════════════════════════════════════════════
