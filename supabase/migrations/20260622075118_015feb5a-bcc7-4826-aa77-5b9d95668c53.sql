
CREATE TABLE public.seo_backlinks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_domain TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_domain TEXT,
  source_title TEXT,
  anchor TEXT,
  target_url TEXT,
  page_ascore INTEGER,
  is_nofollow BOOLEAN NOT NULL DEFAULT false,
  first_seen_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  lost_at TIMESTAMPTZ,
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (target_domain, source_url)
);
CREATE INDEX seo_backlinks_target_status_idx ON public.seo_backlinks(target_domain, status);
CREATE INDEX seo_backlinks_first_detected_idx ON public.seo_backlinks(first_detected_at DESC);
CREATE INDEX seo_backlinks_lost_idx ON public.seo_backlinks(lost_at DESC) WHERE status = 'lost';

GRANT SELECT ON public.seo_backlinks TO authenticated;
GRANT ALL ON public.seo_backlinks TO service_role;
ALTER TABLE public.seo_backlinks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view backlinks" ON public.seo_backlinks FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE TABLE public.seo_backlink_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_domain TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  total_backlinks INTEGER NOT NULL DEFAULT 0,
  referring_domains INTEGER NOT NULL DEFAULT 0,
  follow_count INTEGER NOT NULL DEFAULT 0,
  nofollow_count INTEGER NOT NULL DEFAULT 0,
  new_count INTEGER NOT NULL DEFAULT 0,
  lost_count INTEGER NOT NULL DEFAULT 0,
  authority_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (target_domain, snapshot_date)
);
CREATE INDEX seo_backlink_snapshots_target_date_idx ON public.seo_backlink_snapshots(target_domain, snapshot_date DESC);

GRANT SELECT ON public.seo_backlink_snapshots TO authenticated;
GRANT ALL ON public.seo_backlink_snapshots TO service_role;
ALTER TABLE public.seo_backlink_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view backlink snapshots" ON public.seo_backlink_snapshots FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER seo_backlinks_set_updated_at BEFORE UPDATE ON public.seo_backlinks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
