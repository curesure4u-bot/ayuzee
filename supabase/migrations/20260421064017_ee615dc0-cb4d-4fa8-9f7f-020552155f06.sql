
-- ============= FEED =============
CREATE TABLE public.feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar_url TEXT,
  title TEXT,
  body TEXT NOT NULL,
  image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published posts public" ON public.feed_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Author manages own posts" ON public.feed_posts FOR ALL USING (auth.uid() = author_user_id) WITH CHECK (auth.uid() = author_user_id);
CREATE POLICY "Admins manage all posts" ON public.feed_posts FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER feed_posts_updated BEFORE UPDATE ON public.feed_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments public" ON public.feed_comments FOR SELECT USING (true);
CREATE POLICY "User manages own comments" ON public.feed_comments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.feed_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes public read" ON public.feed_likes FOR SELECT USING (true);
CREATE POLICY "User manages own likes" ON public.feed_likes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============= HEALTH BLOGS =============
CREATE TABLE public.health_blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar_url TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  body TEXT NOT NULL,
  cover_image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Wellness',
  tags TEXT[] NOT NULL DEFAULT '{}',
  read_minutes INTEGER NOT NULL DEFAULT 4,
  view_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_blogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published blogs public" ON public.health_blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Author manages own blogs" ON public.health_blogs FOR ALL USING (auth.uid() = author_user_id) WITH CHECK (auth.uid() = author_user_id);
CREATE POLICY "Admins manage all blogs" ON public.health_blogs FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER health_blogs_updated BEFORE UPDATE ON public.health_blogs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= LMS =============
CREATE TABLE public.lms_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'Ayurveda',
  instructor_name TEXT,
  instructor_avatar_url TEXT,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Beginner',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published courses public" ON public.lms_courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage courses" ON public.lms_courses FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER lms_courses_updated BEFORE UPDATE ON public.lms_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.lms_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  video_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 5,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lms_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons public if course published" ON public.lms_lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lms_courses c WHERE c.id = lms_lessons.course_id AND c.is_published = true)
);
CREATE POLICY "Admins manage lessons" ON public.lms_lessons FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.lms_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lms_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE public.lms_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User manages own progress" ON public.lms_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.lms_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lms_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quizzes public if published" ON public.lms_quizzes FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage quizzes" ON public.lms_quizzes FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.lms_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.lms_quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_index INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lms_quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions public if quiz published" ON public.lms_quiz_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lms_quizzes q WHERE q.id = lms_quiz_questions.quiz_id AND q.is_published = true)
);
CREATE POLICY "Admins manage questions" ON public.lms_quiz_questions FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.lms_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.lms_quizzes(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lms_quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User views own attempts" ON public.lms_quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User inserts own attempts" ON public.lms_quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all attempts" ON public.lms_quiz_attempts FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE TABLE public.lms_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  certificate_no TEXT NOT NULL UNIQUE DEFAULT ('AYZ-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);
ALTER TABLE public.lms_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User views own certs" ON public.lms_certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User inserts own certs" ON public.lms_certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all certs" ON public.lms_certificates FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ============= WEBINARS =============
CREATE TABLE public.webinars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  speaker_name TEXT NOT NULL,
  speaker_bio TEXT,
  speaker_avatar_url TEXT,
  cover_image_url TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  join_url TEXT NOT NULL,
  recording_url TEXT,
  category TEXT NOT NULL DEFAULT 'Ayurveda',
  rsvp_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published webinars public" ON public.webinars FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage webinars" ON public.webinars FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER webinars_updated BEFORE UPDATE ON public.webinars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.webinar_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES public.webinars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(webinar_id, user_id)
);
ALTER TABLE public.webinar_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RSVP public read counts" ON public.webinar_rsvps FOR SELECT USING (true);
CREATE POLICY "User manages own rsvp" ON public.webinar_rsvps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============= COUNTERS =============
CREATE OR REPLACE FUNCTION public.bump_feed_counts() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF TG_TABLE_NAME = 'feed_likes' THEN
    IF TG_OP = 'INSERT' THEN UPDATE public.feed_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN UPDATE public.feed_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id; END IF;
  ELSIF TG_TABLE_NAME = 'feed_comments' THEN
    IF TG_OP = 'INSERT' THEN UPDATE public.feed_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN UPDATE public.feed_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id; END IF;
  ELSIF TG_TABLE_NAME = 'webinar_rsvps' THEN
    IF TG_OP = 'INSERT' THEN UPDATE public.webinars SET rsvp_count = rsvp_count + 1 WHERE id = NEW.webinar_id;
    ELSIF TG_OP = 'DELETE' THEN UPDATE public.webinars SET rsvp_count = GREATEST(0, rsvp_count - 1) WHERE id = OLD.webinar_id; END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER trg_feed_likes_count AFTER INSERT OR DELETE ON public.feed_likes FOR EACH ROW EXECUTE FUNCTION public.bump_feed_counts();
CREATE TRIGGER trg_feed_comments_count AFTER INSERT OR DELETE ON public.feed_comments FOR EACH ROW EXECUTE FUNCTION public.bump_feed_counts();
CREATE TRIGGER trg_webinar_rsvp_count AFTER INSERT OR DELETE ON public.webinar_rsvps FOR EACH ROW EXECUTE FUNCTION public.bump_feed_counts();
