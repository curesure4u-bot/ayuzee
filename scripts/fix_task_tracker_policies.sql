-- ============================================================
-- FIX: Drop existing policies and recreate them
-- Run this if you get "policy already exists" errors
-- ============================================================

-- Drop all existing policies first
DO $$ 
DECLARE
  tbl TEXT;
  pol RECORD;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'task_tracker_settings',
    'task_tracker_tasks', 
    'task_tracker_recurring',
    'task_tracker_schedule',
    'task_tracker_goals',
    'task_tracker_habits',
    'task_tracker_habit_log',
    'task_tracker_journal'
  ])
  LOOP
    FOR pol IN 
      SELECT policyname FROM pg_policies WHERE tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;

-- Drop existing triggers
DROP TRIGGER IF EXISTS trg_task_tracker_settings_updated ON task_tracker_settings;
DROP TRIGGER IF EXISTS trg_task_tracker_tasks_updated ON task_tracker_tasks;
DROP TRIGGER IF EXISTS trg_task_tracker_recurring_updated ON task_tracker_recurring;
DROP TRIGGER IF EXISTS trg_task_tracker_goals_updated ON task_tracker_goals;
DROP TRIGGER IF EXISTS trg_task_tracker_journal_updated ON task_tracker_journal;

-- Recreate the function
CREATE OR REPLACE FUNCTION update_task_tracker_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RECREATE RLS POLICIES
-- ============================================================

-- Settings
CREATE POLICY "Users can view own settings" ON task_tracker_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON task_tracker_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON task_tracker_settings FOR UPDATE USING (auth.uid() = user_id);

-- Tasks
CREATE POLICY "Users can view own tasks" ON task_tracker_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON task_tracker_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON task_tracker_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON task_tracker_tasks FOR DELETE USING (auth.uid() = user_id);

-- Recurring
CREATE POLICY "Users can view own recurring" ON task_tracker_recurring FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recurring" ON task_tracker_recurring FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring" ON task_tracker_recurring FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurring" ON task_tracker_recurring FOR DELETE USING (auth.uid() = user_id);

-- Schedule
CREATE POLICY "Users can view own schedule" ON task_tracker_schedule FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedule" ON task_tracker_schedule FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedule" ON task_tracker_schedule FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedule" ON task_tracker_schedule FOR DELETE USING (auth.uid() = user_id);

-- Goals
CREATE POLICY "Users can view own goals" ON task_tracker_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON task_tracker_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON task_tracker_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON task_tracker_goals FOR DELETE USING (auth.uid() = user_id);

-- Habits
CREATE POLICY "Users can view own habits" ON task_tracker_habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON task_tracker_habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON task_tracker_habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON task_tracker_habits FOR DELETE USING (auth.uid() = user_id);

-- Habit log
CREATE POLICY "Users can view own habit log" ON task_tracker_habit_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit log" ON task_tracker_habit_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit log" ON task_tracker_habit_log FOR DELETE USING (auth.uid() = user_id);

-- Journal
CREATE POLICY "Users can view own journal" ON task_tracker_journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal" ON task_tracker_journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal" ON task_tracker_journal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal" ON task_tracker_journal FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RECREATE TRIGGERS
-- ============================================================
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
