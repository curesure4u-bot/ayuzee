-- ============================================================
-- TASK TRACKER — Sample Seed Data for All Roles
-- Run AFTER create_task_tracker_tables.sql
-- Replace 'YOUR_USER_ID' with an actual auth.users UUID
-- ============================================================

-- Helper: use a placeholder UUID (replace with real user ID)
-- You can get your user_id from: SELECT id FROM auth.users LIMIT 1;

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the first user (or replace with specific UUID)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No users found. Skipping seed data.';
    RETURN;
  END IF;

  -- ============================================================
  -- DOCTOR TASKS
  -- ============================================================
  INSERT INTO task_tracker_tasks (user_id, role_context, task_name, description, status, priority, person_in_charge, start_date, due_date, kanban_category, importance, urgency, progress, notes) VALUES
  (v_user_id, 'doctor', 'Morning staff briefing', 'Quick 5-min sync with reception & nursing staff', 'In progress', 'High', 'Self', CURRENT_DATE, CURRENT_DATE, 'To-Do', 'Important', 'Urgent', 50, ''),
  (v_user_id, 'doctor', 'Review pending lab results', 'Check and sign off on any pending diagnostic reports', 'To do', 'Very High', 'Self', CURRENT_DATE, CURRENT_DATE + 1, 'To-Do', 'Important', 'Urgent', 0, ''),
  (v_user_id, 'doctor', 'Update patient follow-up list', 'Review patients due for follow-up this week', 'To do', 'Medium', 'Nurse', CURRENT_DATE, CURRENT_DATE + 3, 'In Progress', 'Important', 'Not Urgent', 20, ''),
  (v_user_id, 'doctor', 'CME credit tracking', 'Log continuing medical education activities for this quarter', 'To do', 'Low', 'Self', CURRENT_DATE - 5, CURRENT_DATE + 30, 'Backlog', 'Important', 'Not Urgent', 10, ''),
  (v_user_id, 'doctor', 'Insurance claim submissions', 'Submit pending insurance claims for processed patients', 'In progress', 'High', 'Receptionist', CURRENT_DATE - 2, CURRENT_DATE + 1, 'In Progress', 'Not Important', 'Urgent', 65, ''),
  (v_user_id, 'doctor', 'Clinic inventory check', 'Verify stock levels of common medicines and supplies', 'To do', 'Low', 'Pharmacist', CURRENT_DATE, CURRENT_DATE + 7, 'Backlog', 'Not Important', 'Not Urgent', 0, ''),
  (v_user_id, 'doctor', 'Write health blog post', 'Ayurvedic approach to seasonal allergies', 'In progress', 'Medium', 'Self', CURRENT_DATE - 7, CURRENT_DATE + 5, 'In Progress', 'Not Important', 'Not Urgent', 40, ''),
  (v_user_id, 'doctor', 'End-of-day billing reconciliation', 'Verify all consultations billed correctly', 'Completed', 'Medium', 'Receptionist', CURRENT_DATE - 1, CURRENT_DATE - 1, 'Done', 'Important', 'Urgent', 100, 'All clear');

  -- ============================================================
  -- PATIENT TASKS
  -- ============================================================
  INSERT INTO task_tracker_tasks (user_id, role_context, task_name, description, status, priority, person_in_charge, start_date, due_date, kanban_category, importance, urgency, progress, notes) VALUES
  (v_user_id, 'patient', 'Take morning medications', 'Triphala Churna + Ashwagandha as prescribed', 'To do', 'Very High', 'Self', CURRENT_DATE, CURRENT_DATE, 'To Do', 'Important', 'Urgent', 0, ''),
  (v_user_id, 'patient', 'Drink 8 glasses of water', 'Stay hydrated — warm water preferred', 'In progress', 'High', 'Self', CURRENT_DATE, CURRENT_DATE, 'In Progress', 'Important', 'Not Urgent', 50, '4/8 done'),
  (v_user_id, 'patient', '30 minutes yoga/walking', 'Light exercise as recommended by doctor', 'To do', 'Medium', 'Self', CURRENT_DATE, CURRENT_DATE, 'To Do', 'Important', 'Not Urgent', 0, ''),
  (v_user_id, 'patient', 'Follow pathya diet plan', 'No dairy, spicy food today — kapha pacifying diet', 'In progress', 'High', 'Self', CURRENT_DATE, CURRENT_DATE, 'In Progress', 'Important', 'Urgent', 60, ''),
  (v_user_id, 'patient', 'Track symptoms in diary', 'Note joint stiffness level 1-10 and digestion quality', 'To do', 'Medium', 'Self', CURRENT_DATE, CURRENT_DATE, 'To Do', 'Important', 'Not Urgent', 0, ''),
  (v_user_id, 'patient', 'Schedule next appointment', 'Follow-up with Dr. Saleem in 2 weeks', 'To do', 'Low', 'Self', CURRENT_DATE, CURRENT_DATE + 10, 'Backlog', 'Not Important', 'Not Urgent', 0, ''),
  (v_user_id, 'patient', 'Pick up prescribed medicines', 'Refill Dasamoolarishtam from pharmacy', 'To do', 'High', 'Caregiver', CURRENT_DATE, CURRENT_DATE + 2, 'To Do', 'Not Important', 'Urgent', 0, '');

  -- ============================================================
  -- STUDENT TASKS
  -- ============================================================
  INSERT INTO task_tracker_tasks (user_id, role_context, task_name, description, status, priority, person_in_charge, start_date, due_date, kanban_category, importance, urgency, progress, notes) VALUES
  (v_user_id, 'student', 'Review Dravyaguna lecture notes', 'Chapter 12: Tikta Rasa dravyas and their properties', 'To do', 'High', 'Self', CURRENT_DATE, CURRENT_DATE, 'To-Do', 'Important', 'Urgent', 0, ''),
  (v_user_id, 'student', 'Submit Rasashastra assignment', 'Essay on Parada Shodhana methods — deadline Friday', 'In progress', 'Very High', 'Self', CURRENT_DATE - 3, CURRENT_DATE + 2, 'Studying', 'Important', 'Urgent', 60, ''),
  (v_user_id, 'student', 'Practice case studies (3 cases)', 'Amavata, Pandu, and Kamala case presentations', 'To do', 'Medium', 'Study Group', CURRENT_DATE, CURRENT_DATE + 4, 'To-Do', 'Important', 'Not Urgent', 0, ''),
  (v_user_id, 'student', 'Internship journal entry', 'Document today''s OPD observations under Dr. Sharma', 'To do', 'Medium', 'Self', CURRENT_DATE, CURRENT_DATE, 'To-Do', 'Not Important', 'Urgent', 0, ''),
  (v_user_id, 'student', 'Read Charaka Samhita Ch.5', 'Indriyopakramaniya Adhyaya with commentary', 'To do', 'Low', 'Self', CURRENT_DATE, CURRENT_DATE + 7, 'Backlog', 'Important', 'Not Urgent', 0, ''),
  (v_user_id, 'student', 'Attempt daily quiz on Ayuzee', 'Maintain 7-day streak for bonus coins', 'Completed', 'Low', 'Self', CURRENT_DATE - 1, CURRENT_DATE - 1, 'Submitted', 'Not Important', 'Not Urgent', 100, 'Scored 8/10'),
  (v_user_id, 'student', 'Prepare for viva voce', 'Panchakarma practical viva next Monday', 'In progress', 'Very High', 'Self', CURRENT_DATE - 5, CURRENT_DATE + 3, 'Studying', 'Important', 'Urgent', 35, 'Vamana and Virechana covered');

  -- ============================================================
  -- HMS TASKS
  -- ============================================================
  INSERT INTO task_tracker_tasks (user_id, role_context, task_name, description, status, priority, person_in_charge, start_date, due_date, kanban_category, importance, urgency, progress, notes) VALUES
  (v_user_id, 'hms', 'Daily opening checklist', 'Verify all systems, equipment, and staff readiness', 'Completed', 'Very High', 'Reception', CURRENT_DATE, CURRENT_DATE, 'Done', 'Important', 'Urgent', 100, 'All systems OK'),
  (v_user_id, 'hms', 'Review appointment schedule', 'Check today''s patient load and allocate resources', 'In progress', 'High', 'Admin', CURRENT_DATE, CURRENT_DATE, 'In Progress', 'Important', 'Urgent', 70, '22 appointments today'),
  (v_user_id, 'hms', 'Stock level verification', 'Check pharmacy and consumable stock levels', 'To do', 'Medium', 'Pharmacy', CURRENT_DATE, CURRENT_DATE + 1, 'To-Do', 'Not Important', 'Urgent', 0, ''),
  (v_user_id, 'hms', 'Staff attendance verification', 'Confirm all scheduled staff have reported', 'Completed', 'High', 'HR', CURRENT_DATE, CURRENT_DATE, 'Done', 'Important', 'Urgent', 100, ''),
  (v_user_id, 'hms', 'Patient feedback review', 'Review and respond to yesterday''s feedback', 'To do', 'Medium', 'Admin', CURRENT_DATE, CURRENT_DATE + 1, 'Review', 'Important', 'Not Urgent', 0, '3 new feedback entries'),
  (v_user_id, 'hms', 'Weekly compliance audit', 'Check regulatory documentation is up to date', 'To do', 'High', 'Admin', CURRENT_DATE, CURRENT_DATE + 5, 'Review', 'Important', 'Not Urgent', 0, ''),
  (v_user_id, 'hms', 'Equipment maintenance log', 'Record maintenance issues reported today', 'To do', 'Low', 'Nursing', CURRENT_DATE, CURRENT_DATE + 3, 'Backlog', 'Not Important', 'Not Urgent', 0, ''),
  (v_user_id, 'hms', 'End-of-day security check', 'Verify all areas secured, systems backed up', 'To do', 'Medium', 'Admin', CURRENT_DATE, CURRENT_DATE, 'To-Do', 'Not Important', 'Urgent', 0, '');

  -- ============================================================
  -- RECURRING TASKS (shared examples)
  -- ============================================================
  INSERT INTO task_tracker_recurring (user_id, role_context, task_name, frequency, description, priority, person_in_charge, importance, urgency, first_date, end_date) VALUES
  (v_user_id, 'doctor', 'Weekly team meeting', 'Every Week', 'Monday morning clinic sync', 'High', 'Self', 'Important', 'Not Urgent', CURRENT_DATE - 14, CURRENT_DATE + 90),
  (v_user_id, 'doctor', 'Monthly inventory audit', 'Every Month', 'Full stock count and reorder check', 'Medium', 'Pharmacist', 'Not Important', 'Not Urgent', CURRENT_DATE - 30, NULL),
  (v_user_id, 'patient', 'Take morning medication', 'Daily', 'As prescribed by doctor', 'Very High', 'Self', 'Important', 'Urgent', CURRENT_DATE - 7, NULL),
  (v_user_id, 'patient', 'Weekly exercise goal', 'Every Week', '150 minutes of moderate activity per week', 'Medium', 'Self', 'Important', 'Not Urgent', CURRENT_DATE - 14, NULL),
  (v_user_id, 'student', 'Submit weekly assignment', 'Every Week', 'Friday submission deadline', 'High', 'Self', 'Important', 'Urgent', CURRENT_DATE - 21, CURRENT_DATE + 60),
  (v_user_id, 'student', 'Daily Ayuzee quiz', 'Daily', 'Maintain streak and earn coins', 'Low', 'Self', 'Not Important', 'Not Urgent', CURRENT_DATE - 10, NULL),
  (v_user_id, 'hms', 'Daily opening checklist', 'Daily', 'Systems, equipment, staff readiness', 'Very High', 'Reception', 'Important', 'Urgent', CURRENT_DATE - 30, NULL),
  (v_user_id, 'hms', 'Weekly stock audit', 'Every Week', 'Pharmacy and consumables verification', 'Medium', 'Pharmacy', 'Not Important', 'Urgent', CURRENT_DATE - 14, NULL);

  -- ============================================================
  -- GOALS
  -- ============================================================
  INSERT INTO task_tracker_goals (user_id, role_context, title, description, goal_type, target_date, progress) VALUES
  (v_user_id, 'doctor', 'Complete 50 consultations this month', 'Growth target for the clinic', 'monthly', CURRENT_DATE + 20, 68),
  (v_user_id, 'doctor', 'Publish 4 health blog posts', 'One per week on Ayurvedic wellness', 'monthly', CURRENT_DATE + 25, 50),
  (v_user_id, 'student', 'Score 80%+ in semester exam', 'Target across all subjects', 'quarterly', CURRENT_DATE + 45, 30),
  (v_user_id, 'patient', 'Walk 10000 steps daily for 30 days', 'Build consistent exercise habit', 'monthly', CURRENT_DATE + 25, 40),
  (v_user_id, 'hms', 'Reduce patient wait time to <15min', 'Optimize scheduling and staff allocation', 'quarterly', CURRENT_DATE + 60, 35);

  -- ============================================================
  -- HABITS
  -- ============================================================
  INSERT INTO task_tracker_habits (user_id, role_context, habit_name, emoji, frequency, current_streak, longest_streak) VALUES
  (v_user_id, 'general', 'Morning meditation', '🧘', 'daily', 5, 12),
  (v_user_id, 'general', 'Drink 8 glasses of water', '💧', 'daily', 3, 21),
  (v_user_id, 'general', 'Read 30 minutes', '📖', 'daily', 0, 8),
  (v_user_id, 'general', 'Exercise', '🏃', 'weekdays', 2, 15),
  (v_user_id, 'general', 'Journal entry', '✍️', 'daily', 7, 30);

  RAISE NOTICE 'Seed data inserted successfully for user %', v_user_id;
END $$;
