-- =========================================================
-- PHASE 2: Certificates, Challenges, Appreciation, Rewards
-- =========================================================

-- ---------- CERTIFICATES ----------
CREATE TABLE public.gam_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recipient_name TEXT NOT NULL,
  role TEXT NOT NULL,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('level_up','badge_milestone','challenge_completion','annual_excellence')),
  title TEXT NOT NULL,
  subtitle TEXT,
  certificate_no TEXT NOT NULL UNIQUE,
  reference_table TEXT,
  reference_id UUID,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gam_certs_user ON public.gam_certificates(user_id);
CREATE INDEX idx_gam_certs_type ON public.gam_certificates(certificate_type);

ALTER TABLE public.gam_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own certificates"
  ON public.gam_certificates FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins manage certificates"
  ON public.gam_certificates FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Public can verify by certificate_no"
  ON public.gam_certificates FOR SELECT
  USING (true);

-- ---------- CHALLENGES ----------
CREATE TABLE public.gam_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  audience_role TEXT NOT NULL DEFAULT 'all',
  target_action TEXT NOT NULL,
  target_count INT NOT NULL DEFAULT 1,
  points_reward INT NOT NULL DEFAULT 0,
  badge_id UUID REFERENCES public.gam_badges(id) ON DELETE SET NULL,
  issues_certificate BOOLEAN NOT NULL DEFAULT false,
  start_date DATE NOT NULL DEFAULT current_date,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  cover_emoji TEXT DEFAULT '🎯',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gam_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view active challenges"
  ON public.gam_challenges FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins manage challenges"
  ON public.gam_challenges FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_gam_challenges_updated
  BEFORE UPDATE ON public.gam_challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- CHALLENGE PARTICIPANTS ----------
CREATE TABLE public.gam_challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.gam_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  progress_count INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  certificate_id UUID REFERENCES public.gam_certificates(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);
CREATE INDEX idx_gam_chprt_user ON public.gam_challenge_participants(user_id);

ALTER TABLE public.gam_challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their participation"
  ON public.gam_challenge_participants FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Users join challenges"
  ON public.gam_challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users leave own challenges"
  ON public.gam_challenge_participants FOR DELETE
  USING (auth.uid() = user_id AND completed_at IS NULL);

CREATE POLICY "Admins manage participants"
  ON public.gam_challenge_participants FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- ---------- APPRECIATION WALL ----------
CREATE TABLE public.gam_appreciation_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_name TEXT,
  role TEXT,
  post_type TEXT NOT NULL CHECK (post_type IN ('badge_earned','level_up','certificate_issued','challenge_completed')),
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '🎉',
  reference_id UUID,
  claps_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gam_apprec_created ON public.gam_appreciation_posts(created_at DESC);

ALTER TABLE public.gam_appreciation_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view appreciation wall"
  ON public.gam_appreciation_posts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins manage appreciation posts"
  ON public.gam_appreciation_posts FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- ---------- APPRECIATION CLAPS ----------
CREATE TABLE public.gam_appreciation_claps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.gam_appreciation_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.gam_appreciation_claps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view claps"
  ON public.gam_appreciation_claps FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users clap"
  ON public.gam_appreciation_claps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users remove own clap"
  ON public.gam_appreciation_claps FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to bump claps count
CREATE OR REPLACE FUNCTION public.gam_bump_claps()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.gam_appreciation_posts SET claps_count = claps_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.gam_appreciation_posts SET claps_count = GREATEST(0, claps_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_gam_claps_bump
  AFTER INSERT OR DELETE ON public.gam_appreciation_claps
  FOR EACH ROW EXECUTE FUNCTION public.gam_bump_claps();

-- ---------- REWARDS CATALOG ----------
CREATE TABLE public.gam_rewards_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('wallet_credit','consultation','course_discount','merchandise','custom')),
  point_cost INT NOT NULL,
  wallet_credit_amount INT,
  image_url TEXT,
  emoji TEXT DEFAULT '🎁',
  audience_role TEXT NOT NULL DEFAULT 'all',
  stock INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gam_rewards_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view rewards catalog"
  ON public.gam_rewards_catalog FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins manage rewards catalog"
  ON public.gam_rewards_catalog FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_gam_rewards_updated
  BEFORE UPDATE ON public.gam_rewards_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- REWARD REDEMPTIONS ----------
CREATE TABLE public.gam_reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reward_id UUID REFERENCES public.gam_rewards_catalog(id) ON DELETE SET NULL,
  reward_title TEXT NOT NULL,
  points_spent INT NOT NULL,
  reward_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','fulfilled','cancelled')),
  fulfilled_by UUID,
  fulfilled_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gam_redempt_user ON public.gam_reward_redemptions(user_id);

ALTER TABLE public.gam_reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their redemptions"
  ON public.gam_reward_redemptions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins manage redemptions"
  ON public.gam_reward_redemptions FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- ---------- SETTINGS ----------
CREATE TABLE public.gam_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  points_to_rupee_ratio NUMERIC NOT NULL DEFAULT 10,  -- 10 points = 1 rupee
  min_redeem_points INT NOT NULL DEFAULT 100,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.gam_settings (id) VALUES (1);

ALTER TABLE public.gam_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view settings"
  ON public.gam_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins update settings"
  ON public.gam_settings FOR UPDATE
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- =========================================================
-- HELPER: generate certificate number
-- =========================================================
CREATE OR REPLACE FUNCTION public.gam_next_cert_no(_type TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  prefix TEXT;
  yr TEXT := to_char(now(), 'YYYY');
  serial INT;
BEGIN
  prefix := CASE _type
    WHEN 'level_up' THEN 'AYZ-LV'
    WHEN 'badge_milestone' THEN 'AYZ-BD'
    WHEN 'challenge_completion' THEN 'AYZ-CH'
    WHEN 'annual_excellence' THEN 'AYZ-EX'
    ELSE 'AYZ' END;
  SELECT COUNT(*) + 1 INTO serial FROM public.gam_certificates WHERE certificate_type = _type;
  RETURN prefix || '-' || yr || '-' || lpad(serial::text, 5, '0');
END $$;

-- =========================================================
-- ISSUE CERTIFICATE FUNCTION
-- =========================================================
CREATE OR REPLACE FUNCTION public.gam_issue_certificate(
  _user_id UUID, _role TEXT, _type TEXT, _title TEXT, _subtitle TEXT,
  _ref_table TEXT, _ref_id UUID, _metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cert_id UUID;
  uname TEXT;
BEGIN
  IF _user_id IS NULL THEN RETURN NULL; END IF;

  -- Idempotency
  IF _ref_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.gam_certificates
    WHERE user_id = _user_id AND certificate_type = _type AND reference_id = _ref_id
  ) THEN
    SELECT id INTO cert_id FROM public.gam_certificates
      WHERE user_id = _user_id AND certificate_type = _type AND reference_id = _ref_id LIMIT 1;
    RETURN cert_id;
  END IF;

  SELECT COALESCE(full_name, 'Ayuzee Member') INTO uname FROM public.profiles WHERE user_id = _user_id;

  INSERT INTO public.gam_certificates(user_id, recipient_name, role, certificate_type, title, subtitle, certificate_no, reference_table, reference_id, metadata)
  VALUES (_user_id, COALESCE(uname,'Ayuzee Member'), _role, _type, _title, _subtitle, public.gam_next_cert_no(_type), _ref_table, _ref_id, _metadata)
  RETURNING id INTO cert_id;

  -- Auto-post to appreciation wall
  INSERT INTO public.gam_appreciation_posts(user_id, user_name, role, post_type, title, description, emoji, reference_id)
  VALUES (_user_id, uname, _role, 'certificate_issued',
    uname || ' earned a certificate: ' || _title,
    _subtitle, '📜', cert_id);

  RETURN cert_id;
END $$;

-- =========================================================
-- AUTO-POST appreciation when badge earned
-- =========================================================
CREATE OR REPLACE FUNCTION public.gam_trg_badge_appreciation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uname TEXT;
  brow record;
BEGIN
  SELECT COALESCE(full_name,'Ayuzee Member') INTO uname FROM public.profiles WHERE user_id = NEW.user_id;
  SELECT * INTO brow FROM public.gam_badges WHERE id = NEW.badge_id;
  IF brow IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.gam_appreciation_posts(user_id, user_name, role, post_type, title, description, emoji, reference_id)
  VALUES (NEW.user_id, uname, NULL, 'badge_earned',
    uname || ' earned the "' || brow.name || '" badge',
    brow.description, COALESCE(brow.icon,'🏅'), NEW.badge_id);

  -- Issue badge milestone certificate for tier >= 3 (gold/platinum)
  IF brow.tier IS NOT NULL AND brow.tier >= 3 THEN
    PERFORM public.gam_issue_certificate(
      NEW.user_id, NULL, 'badge_milestone',
      'Badge of Excellence: ' || brow.name,
      brow.description,
      'gam_badges', NEW.badge_id, '{}'::jsonb
    );
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_gam_badge_appreciation
  AFTER INSERT ON public.gam_user_badges
  FOR EACH ROW EXECUTE FUNCTION public.gam_trg_badge_appreciation();

-- =========================================================
-- AUTO-POST + CERT on level up
-- =========================================================
CREATE OR REPLACE FUNCTION public.gam_trg_level_up()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uname TEXT;
  lvl record;
BEGIN
  IF NEW.level_number IS NULL OR (OLD.level_number IS NOT NULL AND NEW.level_number <= OLD.level_number) THEN
    RETURN NEW;
  END IF;
  SELECT COALESCE(full_name,'Ayuzee Member') INTO uname FROM public.profiles WHERE user_id = NEW.user_id;
  SELECT * INTO lvl FROM public.gam_levels WHERE level_number = NEW.level_number;
  IF lvl IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.gam_appreciation_posts(user_id, user_name, role, post_type, title, description, emoji, reference_id)
  VALUES (NEW.user_id, uname, NULL, 'level_up',
    uname || ' reached level ' || NEW.level_number || ' — ' || lvl.name,
    'Total points: ' || NEW.total_points, COALESCE(lvl.icon,'⭐'), NEW.user_id);

  -- Issue level-up certificate
  PERFORM public.gam_issue_certificate(
    NEW.user_id, NULL, 'level_up',
    'Level ' || NEW.level_number || ': ' || lvl.name,
    'For reaching ' || NEW.total_points || ' points on Ayuzee',
    'gam_levels', NULL,
    jsonb_build_object('level_number', NEW.level_number, 'level_name', lvl.name)
  );
  RETURN NEW;
END $$;

CREATE TRIGGER trg_gam_level_up
  AFTER UPDATE OF level_number ON public.gam_user_stats
  FOR EACH ROW EXECUTE FUNCTION public.gam_trg_level_up();

-- =========================================================
-- CHALLENGE PROGRESS: bump from points transactions
-- =========================================================
CREATE OR REPLACE FUNCTION public.gam_trg_challenge_progress()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cp record;
  ch record;
  cert_id UUID;
  uname TEXT;
BEGIN
  FOR cp IN
    SELECT p.* FROM public.gam_challenge_participants p
    JOIN public.gam_challenges c ON c.id = p.challenge_id
    WHERE p.user_id = NEW.user_id
      AND p.completed_at IS NULL
      AND c.is_active = true
      AND c.target_action = NEW.action_type
      AND current_date BETWEEN c.start_date AND c.end_date
  LOOP
    SELECT * INTO ch FROM public.gam_challenges WHERE id = cp.challenge_id;
    UPDATE public.gam_challenge_participants
      SET progress_count = progress_count + 1
      WHERE id = cp.id;

    IF (cp.progress_count + 1) >= ch.target_count THEN
      UPDATE public.gam_challenge_participants
        SET completed_at = now() WHERE id = cp.id;

      -- award points
      IF ch.points_reward > 0 THEN
        PERFORM public.gam_award(NEW.user_id, NEW.role, 'challenge_completed', ch.points_reward,
          'Challenge completed: ' || ch.title, 'gam_challenges', ch.id);
      END IF;

      -- award badge
      IF ch.badge_id IS NOT NULL THEN
        INSERT INTO public.gam_user_badges(user_id, badge_id) VALUES (NEW.user_id, ch.badge_id)
        ON CONFLICT DO NOTHING;
      END IF;

      -- issue certificate
      IF ch.issues_certificate THEN
        cert_id := public.gam_issue_certificate(
          NEW.user_id, NEW.role, 'challenge_completion',
          'Challenge Completed: ' || ch.title,
          ch.description,
          'gam_challenges', ch.id, '{}'::jsonb);
        UPDATE public.gam_challenge_participants SET certificate_id = cert_id WHERE id = cp.id;
      END IF;

      -- appreciation post
      SELECT COALESCE(full_name,'Ayuzee Member') INTO uname FROM public.profiles WHERE user_id = NEW.user_id;
      INSERT INTO public.gam_appreciation_posts(user_id, user_name, role, post_type, title, description, emoji, reference_id)
      VALUES (NEW.user_id, uname, NEW.role, 'challenge_completed',
        uname || ' completed the "' || ch.title || '" challenge',
        ch.description, COALESCE(ch.cover_emoji,'🎯'), ch.id);
    END IF;
  END LOOP;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_gam_challenge_progress
  AFTER INSERT ON public.gam_points_transactions
  FOR EACH ROW EXECUTE FUNCTION public.gam_trg_challenge_progress();

-- =========================================================
-- REDEEM POINTS — wallet credit
-- =========================================================
CREATE OR REPLACE FUNCTION public.gam_redeem_to_wallet(_points INT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  st record;
  setg record;
  rupees INT;
  wid UUID;
  red_id UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _points IS NULL OR _points <= 0 THEN RAISE EXCEPTION 'Invalid points'; END IF;

  SELECT * INTO setg FROM public.gam_settings WHERE id = 1;
  IF _points < setg.min_redeem_points THEN
    RAISE EXCEPTION 'Minimum % points required to redeem', setg.min_redeem_points;
  END IF;

  SELECT * INTO st FROM public.gam_user_stats WHERE user_id = uid;
  IF st IS NULL OR st.total_points < _points THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  rupees := floor(_points::numeric / setg.points_to_rupee_ratio)::INT;
  IF rupees <= 0 THEN RAISE EXCEPTION 'Points too low to convert'; END IF;

  -- Deduct points by inserting a negative transaction
  INSERT INTO public.gam_points_transactions(user_id, role, action_type, points, description)
  VALUES (uid, NULL, 'wallet_redemption', -_points, 'Redeemed for ₹' || rupees || ' Ayuzee wallet credit');

  UPDATE public.gam_user_stats SET total_points = total_points - _points, updated_at = now()
    WHERE user_id = uid;

  -- Credit wallet
  SELECT id INTO wid FROM public.ayuzee_wallets WHERE user_id = uid;
  IF wid IS NULL THEN
    INSERT INTO public.ayuzee_wallets(user_id) VALUES (uid) RETURNING id INTO wid;
  END IF;
  INSERT INTO public.ayuzee_wallet_transactions(wallet_id, type, amount, description, source)
  VALUES (wid, 'credit', rupees, 'Gamification points redemption', 'gamification');

  -- Log redemption
  INSERT INTO public.gam_reward_redemptions(user_id, reward_title, points_spent, reward_type, status, fulfilled_at)
  VALUES (uid, '₹' || rupees || ' Wallet Credit', _points, 'wallet_credit', 'fulfilled', now())
  RETURNING id INTO red_id;

  RETURN jsonb_build_object('redemption_id', red_id, 'rupees', rupees, 'points_spent', _points);
END $$;

-- =========================================================
-- REDEEM CATALOG REWARD
-- =========================================================
CREATE OR REPLACE FUNCTION public.gam_redeem_catalog(_reward_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  rw record;
  st record;
  red_id UUID;
  wid UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO rw FROM public.gam_rewards_catalog WHERE id = _reward_id AND is_active = true;
  IF rw IS NULL THEN RAISE EXCEPTION 'Reward not available'; END IF;
  IF rw.stock IS NOT NULL AND rw.stock <= 0 THEN RAISE EXCEPTION 'Out of stock'; END IF;

  SELECT * INTO st FROM public.gam_user_stats WHERE user_id = uid;
  IF st IS NULL OR st.total_points < rw.point_cost THEN RAISE EXCEPTION 'Insufficient points'; END IF;

  -- Deduct points
  INSERT INTO public.gam_points_transactions(user_id, role, action_type, points, description)
  VALUES (uid, NULL, 'reward_redemption', -rw.point_cost, 'Redeemed: ' || rw.title);
  UPDATE public.gam_user_stats SET total_points = total_points - rw.point_cost, updated_at = now()
    WHERE user_id = uid;

  IF rw.stock IS NOT NULL THEN
    UPDATE public.gam_rewards_catalog SET stock = stock - 1 WHERE id = rw.id;
  END IF;

  -- Wallet credit auto-fulfill
  IF rw.reward_type = 'wallet_credit' AND rw.wallet_credit_amount IS NOT NULL THEN
    SELECT id INTO wid FROM public.ayuzee_wallets WHERE user_id = uid;
    IF wid IS NULL THEN INSERT INTO public.ayuzee_wallets(user_id) VALUES (uid) RETURNING id INTO wid; END IF;
    INSERT INTO public.ayuzee_wallet_transactions(wallet_id, type, amount, description, source)
    VALUES (wid, 'credit', rw.wallet_credit_amount, 'Reward: ' || rw.title, 'gamification');

    INSERT INTO public.gam_reward_redemptions(user_id, reward_id, reward_title, points_spent, reward_type, status, fulfilled_at)
    VALUES (uid, rw.id, rw.title, rw.point_cost, rw.reward_type, 'fulfilled', now())
    RETURNING id INTO red_id;
  ELSE
    INSERT INTO public.gam_reward_redemptions(user_id, reward_id, reward_title, points_spent, reward_type, status)
    VALUES (uid, rw.id, rw.title, rw.point_cost, rw.reward_type, 'pending')
    RETURNING id INTO red_id;
  END IF;

  RETURN red_id;
END $$;

-- =========================================================
-- SEED rewards catalog
-- =========================================================
INSERT INTO public.gam_rewards_catalog (title, description, reward_type, point_cost, wallet_credit_amount, emoji, audience_role, sort_order) VALUES
  ('₹50 Wallet Credit', 'Add ₹50 to your Ayuzee wallet instantly', 'wallet_credit', 500, 50, '💰', 'all', 1),
  ('₹100 Wallet Credit', 'Add ₹100 to your Ayuzee wallet instantly', 'wallet_credit', 1000, 100, '💰', 'all', 2),
  ('₹250 Wallet Credit', 'Add ₹250 to your Ayuzee wallet instantly', 'wallet_credit', 2500, 250, '💎', 'all', 3),
  ('Free Online Consultation', 'Redeem a free 15-min AYUSH consultation', 'consultation', 1500, NULL, '🩺', 'patient', 4),
  ('20% Course Discount', 'One-time 20% off any Learning Hub course', 'course_discount', 800, NULL, '🎓', 'student', 5),
  ('Ayuzee Branded T-Shirt', 'Limited-edition Ayuzee branded merchandise (shipping included)', 'merchandise', 5000, NULL, '👕', 'all', 6);

-- =========================================================
-- SEED challenges
-- =========================================================
INSERT INTO public.gam_challenges (title, description, audience_role, target_action, target_count, points_reward, issues_certificate, start_date, end_date, cover_emoji) VALUES
  ('10 Consultations This Month', 'Complete 10 patient consultations to earn bonus points and a certificate', 'doctor', 'consultation_completed', 10, 100, true, current_date, current_date + 30, '🩺'),
  ('Learn 5 Lessons in 7 Days', 'Complete 5 LMS lessons within a week', 'student', 'lesson_completed', 5, 50, false, current_date, current_date + 7, '📚'),
  ('Pass 3 Quizzes', 'Pass 3 quizzes this month with flying colors', 'student', 'quiz_passed', 3, 75, true, current_date, current_date + 30, '🧠'),
  ('15 Therapy Sessions', 'Complete 15 therapy sessions this month', 'therapist', 'therapy_session_completed', 15, 150, true, current_date, current_date + 30, '🧘'),
  ('Complete Your Prakriti Assessment', 'Discover your Ayurvedic constitution', 'patient', 'assessment_completed', 1, 25, false, current_date, current_date + 60, '🌿');