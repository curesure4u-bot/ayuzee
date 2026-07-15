
-- Public read for files attached to a published article
CREATE POLICY "content-media public read published"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'content-media'
    AND EXISTS (
      SELECT 1
      FROM public.content_media m
      JOIN public.content_articles a ON a.id = m.article_id
      WHERE m.storage_path = storage.objects.name
        AND (a.status = 'published' OR public.is_content_editor(auth.uid()))
    )
  );

-- Editors upload files into <article_id>/... for articles they can edit
CREATE POLICY "content-media editors upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'content-media'
    AND EXISTS (
      SELECT 1
      FROM public.content_articles a
      WHERE a.id::text = split_part(storage.objects.name, '/', 1)
        AND (
          public.is_admin_or_super(auth.uid())
          OR (public.is_content_editor(auth.uid()) AND a.author_id = auth.uid())
        )
    )
  );

CREATE POLICY "content-media editors update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'content-media'
    AND EXISTS (
      SELECT 1
      FROM public.content_articles a
      WHERE a.id::text = split_part(storage.objects.name, '/', 1)
        AND (
          public.is_admin_or_super(auth.uid())
          OR (public.is_content_editor(auth.uid()) AND a.author_id = auth.uid())
        )
    )
  );

CREATE POLICY "content-media editors delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'content-media'
    AND EXISTS (
      SELECT 1
      FROM public.content_articles a
      WHERE a.id::text = split_part(storage.objects.name, '/', 1)
        AND (
          public.is_admin_or_super(auth.uid())
          OR (public.is_content_editor(auth.uid()) AND a.author_id = auth.uid())
        )
    )
  );
