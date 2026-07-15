ALTER TABLE public.panchakarma_rooms
ADD COLUMN capacity integer,
ADD COLUMN amenities text[] DEFAULT '{}';