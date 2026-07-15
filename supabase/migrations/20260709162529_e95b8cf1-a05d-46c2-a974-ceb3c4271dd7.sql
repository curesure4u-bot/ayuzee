
-- =========================================================
-- Content Library — Prompt 1
-- =========================================================

-- =========================================================
-- 1. content_categories
-- =========================================================
CREATE TABLE public.content_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en       text NOT NULL,
  name_ta       text NOT NULL,
  slug          text NOT NULL UNIQUE,
  parent_id     uuid REFERENCES public.content_categories(id) ON DELETE SET NULL,
  display_order int  NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.content_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_categories TO authenticated;
GRANT ALL ON public.content_categories TO service_role;

ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are public readable"
  ON public.content_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins manage categories"
  ON public.content_categories FOR ALL
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- =========================================================
-- 2. content_editor_access
-- =========================================================
CREATE TABLE public.content_editor_access (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by  uuid NOT NULL REFERENCES auth.users(id),
  granted_at  timestamptz NOT NULL DEFAULT now(),
  note        text
);

GRANT SELECT, INSERT, DELETE ON public.content_editor_access TO authenticated;
GRANT ALL ON public.content_editor_access TO service_role;

ALTER TABLE public.content_editor_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view editor access"
  ON public.content_editor_access FOR SELECT
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins grant editor access"
  ON public.content_editor_access FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_super(auth.uid()) AND granted_by = auth.uid());

CREATE POLICY "Admins revoke editor access"
  ON public.content_editor_access FOR DELETE
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

-- =========================================================
-- 3. helper — is the caller allowed to edit content?
-- (Created AFTER content_editor_access so the body can reference it.)
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_content_editor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _user_id IS NOT NULL
    AND (
      public.has_role(_user_id, 'admin'::public.app_role)
      OR public.has_role(_user_id, 'super_admin'::public.app_role)
      OR public.has_role(_user_id, 'doctor'::public.app_role)  -- Vaidya
      OR EXISTS (SELECT 1 FROM public.content_editor_access WHERE user_id = _user_id)
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_content_editor(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_content_editor(uuid) TO service_role;

-- =========================================================
-- 4. content_articles
-- =========================================================
CREATE TABLE public.content_articles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  uuid NOT NULL REFERENCES public.content_categories(id) ON DELETE RESTRICT,
  title_en     text NOT NULL,
  title_ta     text NOT NULL,
  body_en      text NOT NULL,
  body_ta      text NOT NULL,
  summary_en   text,
  summary_ta   text,
  tags         text[] NOT NULL DEFAULT '{}',
  source       text NOT NULL DEFAULT 'original'
               CHECK (source IN ('original','forum_migration')),
  status       text NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft','published','archived')),
  author_id    uuid NOT NULL REFERENCES auth.users(id),
  view_count   int  NOT NULL DEFAULT 0,
  slug         text NOT NULL UNIQUE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE INDEX content_articles_category_idx ON public.content_articles(category_id);
CREATE INDEX content_articles_status_idx   ON public.content_articles(status);
CREATE INDEX content_articles_tags_idx     ON public.content_articles USING gin (tags);

GRANT SELECT ON public.content_articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_articles TO authenticated;
GRANT ALL ON public.content_articles TO service_role;

ALTER TABLE public.content_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are public"
  ON public.content_articles FOR SELECT
  USING (
    status = 'published'
    OR public.is_content_editor(auth.uid())
  );

CREATE POLICY "Editors create articles"
  ON public.content_articles FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND public.is_content_editor(auth.uid())
  );

CREATE POLICY "Editors update own; admins update any"
  ON public.content_articles FOR UPDATE
  TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR (public.is_content_editor(auth.uid()) AND author_id = auth.uid())
  )
  WITH CHECK (
    public.is_admin_or_super(auth.uid())
    OR (public.is_content_editor(auth.uid()) AND author_id = auth.uid())
  );

CREATE POLICY "Admins delete articles"
  ON public.content_articles FOR DELETE
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

-- =========================================================
-- 5. content_media
-- =========================================================
CREATE TABLE public.content_media (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id    uuid NOT NULL REFERENCES public.content_articles(id) ON DELETE CASCADE,
  storage_path  text NOT NULL,
  alt_text_en   text,
  alt_text_ta   text,
  display_order int  NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX content_media_article_idx ON public.content_media(article_id);

GRANT SELECT ON public.content_media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_media TO authenticated;
GRANT ALL ON public.content_media TO service_role;

ALTER TABLE public.content_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media follows article visibility"
  ON public.content_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.content_articles a
      WHERE a.id = content_media.article_id
        AND (a.status = 'published' OR public.is_content_editor(auth.uid()))
    )
  );

CREATE POLICY "Media insert follows article edit rights"
  ON public.content_media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.content_articles a
      WHERE a.id = content_media.article_id
        AND (
          public.is_admin_or_super(auth.uid())
          OR (public.is_content_editor(auth.uid()) AND a.author_id = auth.uid())
        )
    )
  );

CREATE POLICY "Media update follows article edit rights"
  ON public.content_media FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.content_articles a
      WHERE a.id = content_media.article_id
        AND (
          public.is_admin_or_super(auth.uid())
          OR (public.is_content_editor(auth.uid()) AND a.author_id = auth.uid())
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.content_articles a
      WHERE a.id = content_media.article_id
        AND (
          public.is_admin_or_super(auth.uid())
          OR (public.is_content_editor(auth.uid()) AND a.author_id = auth.uid())
        )
    )
  );

CREATE POLICY "Media delete follows article edit rights"
  ON public.content_media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.content_articles a
      WHERE a.id = content_media.article_id
        AND (
          public.is_admin_or_super(auth.uid())
          OR (public.is_content_editor(auth.uid()) AND a.author_id = auth.uid())
        )
    )
  );

-- =========================================================
-- 6. Triggers — updated_at + published_at stamping
-- =========================================================
CREATE OR REPLACE FUNCTION public.content_articles_touch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status = 'published'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published')
     AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER content_articles_touch_ins
  BEFORE INSERT ON public.content_articles
  FOR EACH ROW EXECUTE FUNCTION public.content_articles_touch();

CREATE TRIGGER content_articles_touch_upd
  BEFORE UPDATE ON public.content_articles
  FOR EACH ROW EXECUTE FUNCTION public.content_articles_touch();
