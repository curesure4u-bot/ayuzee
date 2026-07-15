
CREATE TABLE public.panchakarma_venue_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.panchakarma_venues(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID,
  reviewer_notes TEXT,
  is_active_before BOOLEAN,
  is_active_after BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pk_venue_status_history_venue ON public.panchakarma_venue_status_history(venue_id, created_at DESC);

GRANT SELECT, INSERT ON public.panchakarma_venue_status_history TO authenticated;
GRANT ALL ON public.panchakarma_venue_status_history TO service_role;

ALTER TABLE public.panchakarma_venue_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all venue status history"
  ON public.panchakarma_venue_status_history FOR SELECT
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Venue owners can view their venue status history"
  ON public.panchakarma_venue_status_history FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.panchakarma_venues v
    WHERE v.id = venue_id AND v.owner_admin_id = auth.uid()
  ));

CREATE POLICY "System inserts only via trigger"
  ON public.panchakarma_venue_status_history FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.panchakarma_venues_log_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.panchakarma_venue_status_history(
      venue_id, from_status, to_status, changed_by, reviewer_notes,
      is_active_before, is_active_after
    ) VALUES (
      NEW.id, NULL, COALESCE(NEW.registration_status, 'pending'),
      COALESCE(NEW.reviewed_by, auth.uid()), NEW.reviewer_notes,
      NULL, NEW.is_active
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.registration_status IS DISTINCT FROM OLD.registration_status
       OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      INSERT INTO public.panchakarma_venue_status_history(
        venue_id, from_status, to_status, changed_by, reviewer_notes,
        is_active_before, is_active_after
      ) VALUES (
        NEW.id, OLD.registration_status, NEW.registration_status,
        COALESCE(NEW.reviewed_by, auth.uid()), NEW.reviewer_notes,
        OLD.is_active, NEW.is_active
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.panchakarma_venues_log_status_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_panchakarma_venues_log_status ON public.panchakarma_venues;
CREATE TRIGGER trg_panchakarma_venues_log_status
  AFTER INSERT OR UPDATE ON public.panchakarma_venues
  FOR EACH ROW EXECUTE FUNCTION public.panchakarma_venues_log_status_change();
