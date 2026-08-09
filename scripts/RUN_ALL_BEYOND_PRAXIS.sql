-- ═══════════════════════════════════════════════════════════════════════════
-- BEYOND.PRAXIS — MASTER DEPLOYMENT SCRIPT
-- Run this ONCE in Supabase SQL Editor to set up ALL Beyond.Praxis tables
-- 
-- This combines all module scripts in the correct order:
-- 1. Core (Profiles, Wheel, Gamification)
-- 2. Time Management
-- 3. Book Library
-- 4. Leadership Lab
-- 5. Wellness Hub
-- 6. Finance Toolkit
-- 7. Guided Pathways
-- 8. Reflection Journal
-- 9. Habit Tracker
--
-- Run each section separately if you get timeout errors on large scripts.
-- ═══════════════════════════════════════════════════════════════════════════

-- Run these SQL files in order in Supabase SQL Editor:
--
-- 1. scripts/create_beyond_praxis_tables.sql       (Core + Gamification)
-- 2. scripts/create_beyond_time_management.sql     (Time Management)
-- 3. scripts/create_beyond_book_library.sql        (Book Library + 30 books)
-- 4. scripts/create_beyond_leadership_lab.sql      (Leadership + 12 scenarios)
-- 5. scripts/create_beyond_wellness_hub.sql        (Wellness Hub)
-- 6. scripts/create_beyond_finance_toolkit.sql     (Finance Toolkit)
-- 7. scripts/create_beyond_guided_pathways.sql     (Pathways + 30 lessons)
-- 8. scripts/create_beyond_journal.sql             (Reflection Journal)
-- 9. scripts/create_beyond_habits.sql              (Habit Tracker)
--
-- TOTAL: ~35 tables, 24 badges, 12 challenges, 30 books, 12 scenarios,
--        30 pathway lessons, 4 time templates

-- ═══════════════════════════════════════════════════════════════════════════
-- QUICK VERIFICATION QUERY (run after all scripts)
-- ═══════════════════════════════════════════════════════════════════════════

-- Uncomment and run this to verify all tables exist:
/*
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'beyond_%'
ORDER BY table_name;
*/

-- Expected tables (35):
-- beyond_badges_catalog
-- beyond_books
-- beyond_breathing_sessions
-- beyond_burnout_assessments
-- beyond_challenges
-- beyond_coin_balance
-- beyond_coin_transactions
-- beyond_energy_logs
-- beyond_finance_entries
-- beyond_finance_goals
-- beyond_gratitude_entries
-- beyond_habit_logs
-- beyond_habits
-- beyond_journal_entries
-- beyond_leadership_assessments
-- beyond_leadership_progress
-- beyond_leadership_scenarios
-- beyond_leaderboard_weekly
-- beyond_lesson_completions
-- beyond_mood_logs
-- beyond_net_worth_snapshots
-- beyond_notifications
-- beyond_pathway_enrollments
-- beyond_pathway_lessons
-- beyond_pathways
-- beyond_pomodoro_sessions
-- beyond_profiles
-- beyond_reading_logs
-- beyond_sleep_logs
-- beyond_streaks
-- beyond_time_logs
-- beyond_time_templates
-- beyond_time_weekly_plans
-- beyond_user_badges
-- beyond_user_challenges
-- beyond_user_xp
-- beyond_wheel_assessments
-- beyond_wheel_goals
-- beyond_xp_transactions
