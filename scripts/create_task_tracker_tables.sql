-- ============================================================
-- ALL-IN-ONE TASK TRACKER - Complete Database Schema
-- Supports: Doctors, Patients, Students, HMS/Beyond
-- ============================================================

-- 1. SETTINGS TABLE (per-user configuration)
CREATE TABLE IF NOT EXISTS task_tracker_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_context TEXT NOT NULL DEFAULT 'general' CHECK (role_context IN ('doctor','patient','student','hms','general')),
  
  -- Statuses (JSON array of {name, emoji, color})
  statuses JSONB NOT NULL DEFAULT '[
    {"name":"To do","emoji":"🚩","color":"red"},
    {"name":"In progress","emoji":"🔄","color":"blue"},
    {"name":"Hold","emoji":"⏸️","color":"orange"},
    {"name":"To review","emoji":"👁️","color":"purple"},
    {"name":"Started","emoji":"✅","color":"green"},
    {"name":"Overdue","emoji":"⚠️","color":"red"},
    {"name":"Cancelled","emoji":"❌","color":"gray"},
    {"name":"Completed","emoji":"✔️","color":"green"}
  ]'::jsonb,
  
  -- Kanban Categories (ordered array)
  kanban_categories JSONB NOT NULL DEFAULT '["Backlog","To-Do","In Progress","Review","Done"]'::jsonb,
  
  -- People in Charge (array of names)
  people_in_charge JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Working Days (object with day: boolean)
  working_days JSONB NOT NULL DEFAULT '{
    "monday":true,"tuesday":true,"wednesday":true,"thursday":true,"friday":true,
    "saturday":false,"sunday":false
  }'::jsonb,
  
  -- Holidays (array of {date, description})
  holidays JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Theme preference
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light','dark','system')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, role_context)
);

-- 2. VARIABLE TASKS TABLE (one-time tasks with all fields)
CREATE TABLE IF NOT EXISTS task_tracker_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_context TEXT NOT NULL DEFAULT 'general',
  
  -- Core fields
  task_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'To do',
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Very High','High','Medium','Low','Very Low','On Hold')),
  person_in_charge TEXT DEFAULT '',
  
  -- Dates
  start_date DATE,
  due_date DATE,
  
  -- Kanban & Decision Matrix
  kanban_category TEXT DEFAULT 'Backlog',
  importance TEXT NOT NULL DEFAULT 'Not Important' CHECK (importance IN ('Important','Not Important')),
  urgency TEXT NOT NULL DEFAULT 'Not Urgent' CHECK (urgency IN ('Urgent','Not Urgent')),
  
  -- Progress (0-100)
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  
  -- Metadata
  notes TEXT DEFAULT '',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  -- Gantt chart
  gantt_color TEXT DEFAULT '',
  project_name TEXT DEFAULT '',
  
  -- Auto-calculated (stored for query performance)
  decision TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN importance = 'Important' AND urgency = 'Urgent' THEN 'To Do'
      WHEN importance = 'Important' AND urgency = 'Not Urgent' THEN 'To Decide'
      WHEN importance = 'Not Important' AND urgency = 'Urgent' THEN 'To Delegate'
      WHEN importance = 'Not Important' AND urgency = 'Not Urgent' THEN 'To Delete'
    END
  ) STORED,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. RECURRING TASKS TABLE (definitions)
CREATE TABLE IF NOT EXISTS task_tracker_recurring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_context TEXT NOT NULL DEFAULT 'general',
  
  task_name TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'Every Week' CHECK (frequency IN (
    'Daily','Every Week','Every 2 Weeks','Every Month','Every 2 Months',
    'Every 3 Months','Every 4 Weeks','Every 6 Months','Yearly'
  )),
  description TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Very High','High','Medium','Low','Very Low','On Hold')),
  person_in_charge TEXT DEFAULT '',
  importance TEXT NOT NULL DEFAULT 'Not Important' CHECK (importance IN ('Important','Not Important')),
  urgency TEXT NOT NULL DEFAULT 'Not Urgent' CHECK (urgency IN ('Urgent','Not Urgent')),
  
  -- Date range
  first_date DATE NOT NULL,
  end_date DATE,
  
  -- Active flag
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. RECURRING TASKS SCHEDULE (generated occurrences with overrides)
CREATE TABLE IF NOT EXISTS task_tracker_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recurring_task_id UUID NOT NULL REFERENCES task_tracker_recurring(id) ON DELETE CASCADE,
  
  -- Occurrence date
  occurrence_date DATE NOT NULL,
  
  -- Override fields (NULL means use parent value)
  override_priority TEXT,
  override_person TEXT,
  override_description TEXT,
  override_decision TEXT,
  
  -- New date if rescheduled
  new_date DATE,
  
  -- Status
  is_done BOOLEAN NOT NULL DEFAULT false,
  done_at TIMESTAMPTZ,
  
  -- Decision (inherited or overridden)
  decision TEXT DEFAULT 'To Decide',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(recurring_task_id, occurrence_date)
);

-- 5. GOALS TABLE (Notion planner addition)
CREATE TABLE IF NOT EXISTS task_tracker_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_context TEXT NOT NULL DEFAULT 'general',
  
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  goal_type TEXT NOT NULL DEFAULT 'monthly' CHECK (goal_type IN ('daily','weekly','monthly','quarterly','yearly')),
  target_date DATE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. HABITS TABLE (daily tracking with streaks)
CREATE TABLE IF NOT EXISTS task_tracker_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_context TEXT NOT NULL DEFAULT 'general',
  
  habit_name TEXT NOT NULL,
  emoji TEXT DEFAULT '✅',
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily','weekdays','weekends','custom')),
  custom_days JSONB DEFAULT '[]'::jsonb, -- e.g. ["monday","wednesday","friday"]
  
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. HABIT COMPLETIONS (daily log)
CREATE TABLE IF NOT EXISTS task_tracker_habit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES task_tracker_habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  
  UNIQUE(habit_id, completed_date)
);

-- 8. JOURNAL (daily notes)
CREATE TABLE IF NOT EXISTS task_tracker_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_context TEXT NOT NULL DEFAULT 'general',
  
  entry_date DATE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  mood TEXT DEFAULT 'neutral' CHECK (mood IN ('great','good','neutral','low','bad')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, entry_date)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_task_tracker_tasks_user ON task_tracker_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_task_tracker_tasks_due ON task_tracker_tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_task_tracker_tasks_status ON task_tracker_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_task_tracker_tasks_kanban ON task_tracker_tasks(user_id, kanban_category);
CREATE INDEX IF NOT EXISTS idx_task_tracker_tasks_decision ON task_tracker_tasks(user_id, decision);
CREATE INDEX IF NOT EXISTS idx_task_tracker_tasks_context ON task_tracker_tasks(user_id, role_context);
CREATE INDEX IF NOT EXISTS idx_task_tracker_recurring_user ON task_tracker_recurring(user_id);
CREATE INDEX IF NOT EXISTS idx_task_tracker_schedule_user ON task_tracker_schedule(user_id, occurrence_date);
CREATE INDEX IF NOT EXISTS idx_task_tracker_schedule_recurring ON task_tracker_schedule(recurring_task_id);
CREATE INDEX IF NOT EXISTS idx_task_tracker_goals_user ON task_tracker_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_task_tracker_habits_user ON task_tracker_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_task_tracker_habit_log_habit ON task_tracker_habit_log(habit_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_task_tracker_journal_user ON task_tracker_journal(user_id, entry_date);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE task_tracker_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tracker_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tracker_recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tracker_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tracker_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tracker_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tracker_habit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tracker_journal ENABLE ROW LEVEL SECURITY;

-- Settings policies
CREATE POLICY "Users can view own settings" ON task_tracker_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON task_tracker_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON task_tracker_settings FOR UPDATE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON task_tracker_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON task_tracker_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON task_tracker_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON task_tracker_tasks FOR DELETE USING (auth.uid() = user_id);

-- Recurring policies
CREATE POLICY "Users can view own recurring" ON task_tracker_recurring FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recurring" ON task_tracker_recurring FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring" ON task_tracker_recurring FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurring" ON task_tracker_recurring FOR DELETE USING (auth.uid() = user_id);

-- Schedule policies
CREATE POLICY "Users can view own schedule" ON task_tracker_schedule FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedule" ON task_tracker_schedule FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedule" ON task_tracker_schedule FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedule" ON task_tracker_schedule FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON task_tracker_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON task_tracker_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON task_tracker_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON task_tracker_goals FOR DELETE USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can view own habits" ON task_tracker_habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON task_tracker_habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON task_tracker_habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON task_tracker_habits FOR DELETE USING (auth.uid() = user_id);

-- Habit log policies
CREATE POLICY "Users can view own habit log" ON task_tracker_habit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit log" ON task_tracker_habit_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit log" ON task_tracker_habit_log FOR DELETE USING (auth.uid() = user_id);

-- Journal policies
CREATE POLICY "Users can view own journal" ON task_tracker_journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal" ON task_tracker_journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal" ON task_tracker_journal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal" ON task_tracker_journal FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_task_tracker_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_task_tracker_settings_updated
  BEFORE UPDATE ON task_tracker_settings
  FOR EACH ROW EXECUTE FUNCTION update_task_tracker_updated_at();

CREATE TRIGGER trg_task_tracker_tasks_updated
  BEFORE UPDATE ON task_tracker_tasks
  FOR EACH ROW EXECUTE FUNCTION update_task_tracker_updated_at();

CREATE TRIGGER trg_task_tracker_recurring_updated
  BEFORE UPDATE ON task_tracker_recurring
  FOR EACH ROW EXECUTE FUNCTION update_task_tracker_updated_at();

CREATE TRIGGER trg_task_tracker_goals_updated
  BEFORE UPDATE ON task_tracker_goals
  FOR EACH ROW EXECUTE FUNCTION update_task_tracker_updated_at();

CREATE TRIGGER trg_task_tracker_journal_updated
  BEFORE UPDATE ON task_tracker_journal
  FOR EACH ROW EXECUTE FUNCTION update_task_tracker_updated_at();
