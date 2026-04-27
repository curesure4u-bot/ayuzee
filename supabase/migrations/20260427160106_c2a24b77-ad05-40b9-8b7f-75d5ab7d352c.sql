
-- ============================================================
-- AYUZEE GROWTH & APPRECIATION ENGINE — PHASE 1
-- ============================================================

-- 1. LEVELS catalog
CREATE TABLE public.gam_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number int NOT NULL UNIQUE,
  level_name text NOT NULL,
  min_points int NOT NULL,
  max_points int,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gam_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Levels are viewable by everyone"
  ON public.gam_levels FOR SELECT USING (true);
CREATE POLICY "Admins manage levels"
  ON public.gam_levels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.gam_levels (level_number, level_name, min_points, max_points, icon) VALUES
  (1,'Beginner',0,99,'🌱'),
  (2,'Active Learner',100,299,'📘'),
  (3,'Consistent Performer',300,699,'⭐'),
  (4,'Certified Achiever',700,1499,'🎖️'),
  (5,'Ayuzee Champion',1500,2999,'🏆'),
  (6,'Master Contributor',3000,5999,'👑'),
  (7,'Mentor / Ambassador',6000,NULL,'🌟');

-- 2. BADGES catalog
CREATE TABLE public.gam_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT '🏅',
  role text,
  criteria_type text NOT NULL,
  criteria_value int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gam_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are viewable by everyone"
  ON public.gam_badges FOR SELECT USING (true);
CREATE POLICY "Admins manage badges"
  ON public.gam_badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.gam_badges (code,name,description,icon,role,criteria_type,criteria_value) VALUES
  ('first_step','First Step','Earned your first points','👣',NULL,'points',1),
  ('streak_7','7-Day Streak','Active 7 days in a row','🔥',NULL,'streak',7),
  ('streak_21','21-Day Achiever','Active 21 days in a row','💪',NULL,'streak',21),
  ('streak_48','48-Day Champion','Active 48 days in a row','🏆',NULL,'streak',48),
  ('club_100','100 Points Club','Reached 100 points','💯',NULL,'points',100),
  ('club_500','500 Points Club','Reached 500 points','🎖️',NULL,'points',500),
  ('club_1000','1000 Points Club','Reached 1000 points','👑',NULL,'points',1000),
  ('patient_care_hero','Patient Care Hero','Completed 25 consultations','❤️','doctor','action_count:consultation_completed',25),
  ('spine_care_champion','Spine Care Champion','Completed Spine Mobility challenge','🦴',NULL,'challenge',1),
  ('gut_reset_achiever','Gut Reset Achiever','Completed Gut Reset challenge','🌿',NULL,'challenge',1),
  ('yoga_consistency_star','Yoga Consistency Star','30 yoga practices logged','🧘','patient','action_count:yoga_practice',30),
  ('panchakarma_performer','Panchakarma Performer','25 panchakarma sessions','💧','therapist','action_count:therapy_session_completed',25),
  ('case_completion_expert','Case Completion Expert','50 cases completed','📋','doctor','action_count:consultation_completed',50),
  ('followup_master','Follow-up Master','25 follow-ups completed','📞','doctor','action_count:followup_completed',25),
  ('stock_accuracy_star','Stock Accuracy Star','Maintain stock accuracy','📦','medicine_supplier','action_count:stock_updated',20),
  ('admin_excellence','Admin Excellence','Outstanding admin contribution','🛡️','admin','action_count:admin_task',50);

-- 3. POINTS TRANSACTIONS (immutable log)
CREATE TABLE public.gam_points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text,
  action_type text NOT NULL,
  points int NOT NULL,
  description text,
  reference_table text,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_gam_points_user ON public.gam_points_transactions(user_id, created_at DESC);
CREATE INDEX idx_gam_points_action ON public.gam_points_transactions(action_type);
ALTER TABLE public.gam_points_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own points"
  ON public.gam_points_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert points"
  ON public.gam_points_transactions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update points"
  ON public.gam_points_transactions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete points"
  ON public.gam_points_transactions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- 4. USER BADGES
CREATE TABLE public.gam_user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.gam_badges(id) ON DELETE CASCADE,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
CREATE INDEX idx_gam_user_badges_user ON public.gam_user_badges(user_id);
ALTER TABLE public.gam_user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User badges visible to authenticated"
  ON public.gam_user_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage user badges"
  ON public.gam_user_badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 5. USER STATS (cached totals)
CREATE TABLE public.gam_user_stats (
  user_id uuid PRIMARY KEY,
  total_points int NOT NULL DEFAULT 0,
  level_number int NOT NULL DEFAULT 1,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_activity_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gam_user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stats visible to authenticated (leaderboard)"
  ON public.gam_user_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage stats"
  ON public.gam_user_stats FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- POINTS ENGINE FUNCTIONS
-- ============================================================

-- Compute level number from points
CREATE OR REPLACE FUNCTION public.gam_compute_level(_points int)
RETURNS int LANGUAGE sql STABLE SET search_path=public AS $$
  SELECT COALESCE((
    SELECT level_number FROM public.gam_levels
    WHERE _points >= min_points AND (max_points IS NULL OR _points <= max_points)
    ORDER BY level_number DESC LIMIT 1
  ), 1);
$$;

-- Award badges based on user's current state
CREATE OR REPLACE FUNCTION public.gam_check_badges(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  s record;
  b record;
  cnt int;
  parts text[];
BEGIN
  SELECT * INTO s FROM public.gam_user_stats WHERE user_id = _user_id;
  IF s IS NULL THEN RETURN; END IF;

  FOR b IN SELECT * FROM public.gam_badges LOOP
    IF EXISTS (SELECT 1 FROM public.gam_user_badges WHERE user_id=_user_id AND badge_id=b.id) THEN
      CONTINUE;
    END IF;

    IF b.criteria_type = 'points' AND s.total_points >= b.criteria_value THEN
      INSERT INTO public.gam_user_badges(user_id,badge_id) VALUES (_user_id,b.id) ON CONFLICT DO NOTHING;
    ELSIF b.criteria_type = 'streak' AND s.current_streak >= b.criteria_value THEN
      INSERT INTO public.gam_user_badges(user_id,badge_id) VALUES (_user_id,b.id) ON CONFLICT DO NOTHING;
    ELSIF b.criteria_type LIKE 'action_count:%' THEN
      parts := string_to_array(b.criteria_type, ':');
      SELECT count(*) INTO cnt FROM public.gam_points_transactions
        WHERE user_id=_user_id AND action_type=parts[2];
      IF cnt >= b.criteria_value THEN
        INSERT INTO public.gam_user_badges(user_id,badge_id) VALUES (_user_id,b.id) ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;
END $$;

-- Core: award points (called by triggers)
CREATE OR REPLACE FUNCTION public.gam_award(_user_id uuid, _role text, _action text, _points int, _desc text, _ref_table text, _ref_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  today date := current_date;
  new_total int;
  new_streak int;
BEGIN
  IF _user_id IS NULL OR _points IS NULL OR _points = 0 THEN RETURN; END IF;

  -- Idempotency: skip duplicate (action + reference)
  IF _ref_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.gam_points_transactions
    WHERE user_id=_user_id AND action_type=_action AND reference_id=_ref_id
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.gam_points_transactions(user_id,role,action_type,points,description,reference_table,reference_id)
  VALUES (_user_id,_role,_action,_points,_desc,_ref_table,_ref_id);

  -- Upsert stats
  INSERT INTO public.gam_user_stats(user_id,total_points,level_number,current_streak,longest_streak,last_activity_date)
  VALUES (_user_id,_points,public.gam_compute_level(_points),1,1,today)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = public.gam_user_stats.total_points + EXCLUDED.total_points,
    current_streak = CASE
      WHEN public.gam_user_stats.last_activity_date = today THEN public.gam_user_stats.current_streak
      WHEN public.gam_user_stats.last_activity_date = today - 1 THEN public.gam_user_stats.current_streak + 1
      ELSE 1
    END,
    longest_streak = GREATEST(public.gam_user_stats.longest_streak,
      CASE
        WHEN public.gam_user_stats.last_activity_date = today THEN public.gam_user_stats.current_streak
        WHEN public.gam_user_stats.last_activity_date = today - 1 THEN public.gam_user_stats.current_streak + 1
        ELSE 1
      END),
    last_activity_date = today,
    updated_at = now();

  UPDATE public.gam_user_stats
    SET level_number = public.gam_compute_level(total_points)
    WHERE user_id = _user_id;

  PERFORM public.gam_check_badges(_user_id);
END $$;

-- ============================================================
-- TRIGGERS ON EXISTING TABLES
-- ============================================================

-- Vaidya consultation: award doctor when notes added (treated as completed)
CREATE OR REPLACE FUNCTION public.gam_trg_consultation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.doctor_user_id IS NOT NULL THEN
    PERFORM public.gam_award(NEW.doctor_user_id,'doctor','consultation_completed',20,
      'Consultation completed','vaidya_consultations',NEW.id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER gam_consultation_award
  AFTER INSERT ON public.vaidya_consultations
  FOR EACH ROW EXECUTE FUNCTION public.gam_trg_consultation();

-- Prakriti assessment: award patient + assessor
CREATE OR REPLACE FUNCTION public.gam_trg_prakriti()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.status = 'completed' AND (TG_OP='INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    IF NEW.patient_user_id IS NOT NULL THEN
      PERFORM public.gam_award(NEW.patient_user_id,'patient','assessment_completed',15,
        'Prakriti assessment completed','prakriti_assessments',NEW.id);
    END IF;
    IF NEW.assessor_user_id IS NOT NULL AND NEW.assessor_user_id <> COALESCE(NEW.patient_user_id,'00000000-0000-0000-0000-000000000000'::uuid) THEN
      PERFORM public.gam_award(NEW.assessor_user_id,'doctor','assessment_reviewed',10,
        'Prakriti assessment reviewed','prakriti_assessments',NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER gam_prakriti_award
  AFTER INSERT OR UPDATE OF status ON public.prakriti_assessments
  FOR EACH ROW EXECUTE FUNCTION public.gam_trg_prakriti();

-- Therapy session completed
CREATE OR REPLACE FUNCTION public.gam_trg_therapy_session()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.status = 'completed' AND (TG_OP='INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    IF NEW.therapist_id IS NOT NULL THEN
      PERFORM public.gam_award(NEW.therapist_id,'therapist','therapy_session_completed',25,
        'Therapy session completed','therapy_sessions',NEW.id);
    END IF;
    IF NEW.patient_user_id IS NOT NULL THEN
      PERFORM public.gam_award(NEW.patient_user_id,'patient','therapy_attended',10,
        'Therapy session attended','therapy_sessions',NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER gam_therapy_session_award
  AFTER INSERT OR UPDATE OF status ON public.therapy_sessions
  FOR EACH ROW EXECUTE FUNCTION public.gam_trg_therapy_session();

-- LMS lesson progress completed
CREATE OR REPLACE FUNCTION public.gam_trg_lms_progress()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND (TG_OP='INSERT' OR OLD.completed_at IS NULL) THEN
    PERFORM public.gam_award(NEW.user_id,'student','lesson_completed',5,
      'Lesson completed','lms_progress',NEW.id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER gam_lms_progress_award
  AFTER INSERT OR UPDATE OF completed_at ON public.lms_progress
  FOR EACH ROW EXECUTE FUNCTION public.gam_trg_lms_progress();

-- LMS quiz passed
CREATE OR REPLACE FUNCTION public.gam_trg_quiz()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.passed = true AND (TG_OP='INSERT' OR OLD.passed IS DISTINCT FROM true) THEN
    PERFORM public.gam_award(NEW.user_id,'student','quiz_passed',15,
      'Quiz passed','lms_quiz_attempts',NEW.id);
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER gam_quiz_award
  AFTER INSERT OR UPDATE OF passed ON public.lms_quiz_attempts
  FOR EACH ROW EXECUTE FUNCTION public.gam_trg_quiz();

-- Homeo follow-up
CREATE OR REPLACE FUNCTION public.gam_trg_homeo_followup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE doc uuid;
BEGIN
  SELECT doctor_user_id INTO doc FROM public.homeo_cases WHERE id = NEW.case_id;
  IF doc IS NOT NULL THEN
    PERFORM public.gam_award(doc,'doctor','followup_completed',10,
      'Follow-up completed','homeo_followups',NEW.id);
  END IF;
  RETURN NEW;
END $$;

-- Only attach if homeo_followups has case_id and homeo_cases has doctor_user_id
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='homeo_followups' AND column_name='case_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='homeo_cases' AND column_name='doctor_user_id') THEN
    EXECUTE 'CREATE TRIGGER gam_homeo_followup_award AFTER INSERT ON public.homeo_followups FOR EACH ROW EXECUTE FUNCTION public.gam_trg_homeo_followup()';
  END IF;
END $do$;
