-- 1. panchakarma_venues
CREATE TABLE public.panchakarma_venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  license_number text,
  license_expiry date,
  registration_status text NOT NULL DEFAULT 'pending'
    CHECK (registration_status IN ('pending','approved','suspended','rejected')),
  owner_admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  offered_therapy_type_ids uuid[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.panchakarma_venues TO authenticated;
GRANT ALL ON public.panchakarma_venues TO service_role;

ALTER TABLE public.panchakarma_venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins view own venue; others see approved active"
  ON public.panchakarma_venues FOR SELECT TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR owner_admin_id = auth.uid()
    OR (registration_status = 'approved' AND is_active = true)
  );

CREATE POLICY "Admins can insert venues"
  ON public.panchakarma_venues FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin_or_super(auth.uid())
    OR owner_admin_id = auth.uid()
  );

CREATE POLICY "Owners and admins update venues"
  ON public.panchakarma_venues FOR UPDATE TO authenticated
  USING (public.is_admin_or_super(auth.uid()) OR owner_admin_id = auth.uid())
  WITH CHECK (public.is_admin_or_super(auth.uid()) OR owner_admin_id = auth.uid());

CREATE POLICY "Admins delete venues"
  ON public.panchakarma_venues FOR DELETE TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE INDEX idx_pk_venues_owner ON public.panchakarma_venues(owner_admin_id);
CREATE INDEX idx_pk_venues_status ON public.panchakarma_venues(registration_status, is_active);

CREATE TRIGGER update_pk_venues_updated_at
  BEFORE UPDATE ON public.panchakarma_venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. panchakarma_rooms
CREATE TABLE public.panchakarma_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.panchakarma_venues(id) ON DELETE CASCADE,
  room_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.panchakarma_rooms TO authenticated;
GRANT ALL ON public.panchakarma_rooms TO service_role;

ALTER TABLE public.panchakarma_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View rooms of accessible venues"
  ON public.panchakarma_rooms FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.panchakarma_venues v
      WHERE v.id = panchakarma_rooms.venue_id
        AND (
          public.is_admin_or_super(auth.uid())
          OR v.owner_admin_id = auth.uid()
          OR (v.registration_status = 'approved' AND v.is_active = true AND panchakarma_rooms.is_active = true)
        )
    )
  );

CREATE POLICY "Owners and admins insert rooms"
  ON public.panchakarma_rooms FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.panchakarma_venues v
      WHERE v.id = panchakarma_rooms.venue_id
        AND (public.is_admin_or_super(auth.uid()) OR v.owner_admin_id = auth.uid())
    )
  );

CREATE POLICY "Owners and admins update rooms"
  ON public.panchakarma_rooms FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.panchakarma_venues v
      WHERE v.id = panchakarma_rooms.venue_id
        AND (public.is_admin_or_super(auth.uid()) OR v.owner_admin_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.panchakarma_venues v
      WHERE v.id = panchakarma_rooms.venue_id
        AND (public.is_admin_or_super(auth.uid()) OR v.owner_admin_id = auth.uid())
    )
  );

CREATE POLICY "Owners and admins delete rooms"
  ON public.panchakarma_rooms FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.panchakarma_venues v
      WHERE v.id = panchakarma_rooms.venue_id
        AND (public.is_admin_or_super(auth.uid()) OR v.owner_admin_id = auth.uid())
    )
  );

CREATE INDEX idx_pk_rooms_venue ON public.panchakarma_rooms(venue_id);

CREATE TRIGGER update_pk_rooms_updated_at
  BEFORE UPDATE ON public.panchakarma_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();