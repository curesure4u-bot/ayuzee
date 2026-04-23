
-- Add contact person and registration doc to therapy_venues
ALTER TABLE public.therapy_venues
  ADD COLUMN IF NOT EXISTS contact_person text,
  ADD COLUMN IF NOT EXISTS registration_doc_url text;

-- Room unavailability table (per-room, per-date blackout)
CREATE TABLE IF NOT EXISTS public.room_unavailability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.therapy_venues(id) ON DELETE CASCADE,
  room_name text NOT NULL,
  unavailable_date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (venue_id, room_name, unavailable_date)
);

ALTER TABLE public.room_unavailability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venue owner manages unavailability"
ON public.room_unavailability
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.therapy_venues v WHERE v.id = room_unavailability.venue_id AND v.owner_user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.therapy_venues v WHERE v.id = room_unavailability.venue_id AND v.owner_user_id = auth.uid()));

CREATE POLICY "Public reads unavailability"
ON public.room_unavailability
FOR SELECT TO anon, authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_room_unavail_venue_date ON public.room_unavailability(venue_id, unavailable_date);

-- Storage bucket for venue documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-docs', 'venue-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: owners read/write their own folder
CREATE POLICY "Venue owners read own docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'venue-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Venue owners upload own docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'venue-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Venue owners update own docs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'venue-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Venue owners delete own docs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'venue-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
