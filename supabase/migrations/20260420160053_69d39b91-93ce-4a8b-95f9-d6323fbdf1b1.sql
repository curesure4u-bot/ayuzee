-- 1. Roles system (secure, no privilege escalation)
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Link doctors table to auth users (for doctor onboarding)
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS avatar_url TEXT;
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);

-- Doctor self-management policies
CREATE POLICY "Doctors can insert own profile" ON public.doctors
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update own profile" ON public.doctors
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 3. Doctors can view appointments booked with them
CREATE POLICY "Doctors can view their appointments" ON public.appointments
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid()));

CREATE POLICY "Doctors can update their appointments" ON public.appointments
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = appointments.doctor_id AND d.user_id = auth.uid()));

-- 4. Payment columns on appointments & orders
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Allow users to update their own orders (needed for payment confirmation)
CREATE POLICY "Users can update own orders" ON public.orders
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 5. Therapies table (public catalog)
CREATE TABLE public.therapies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.therapies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapies are viewable by everyone" ON public.therapies
FOR SELECT USING (true);

-- 6. Therapy bookings
CREATE TABLE public.therapy_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  therapy_id UUID NOT NULL REFERENCES public.therapies(id),
  therapy_name TEXT NOT NULL,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.therapy_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own therapy bookings" ON public.therapy_bookings
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own therapy bookings" ON public.therapy_bookings
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own therapy bookings" ON public.therapy_bookings
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_therapy_bookings_updated_at
BEFORE UPDATE ON public.therapy_bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Seed therapies
INSERT INTO public.therapies (name, slug, short_description, description, duration_minutes, price, category, benefits, image_url) VALUES
('Panchakarma', 'panchakarma', 'Complete 5-step detoxification & rejuvenation', 'Panchakarma is a classical Ayurvedic cleansing therapy that removes deep-seated toxins and restores balance across body, mind, and spirit through five coordinated procedures.', 90, 4500, 'Detox', ARRAY['Deep detoxification','Immunity boost','Stress relief','Better sleep'], 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'),
('Abhyanga', 'abhyanga', 'Warm herbal oil full-body massage', 'A synchronized full-body massage with medicated warm oils, performed by expert therapists to improve circulation, relax muscles, and nourish the skin.', 60, 1800, 'Massage', ARRAY['Improves circulation','Relieves muscle tension','Nourishes skin','Calms nervous system'], 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'),
('Shirodhara', 'shirodhara', 'Continuous warm oil stream on forehead', 'A deeply meditative therapy where warm medicated oil is poured in a steady stream over the forehead to calm the mind and balance the nervous system.', 45, 2200, 'Mind & Stress', ARRAY['Reduces anxiety','Improves sleep','Mental clarity','Balances nervous system'], 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800'),
('Nasya', 'nasya', 'Nasal herbal therapy for sinus & clarity', 'Administration of medicated oils through the nasal passage to clear sinuses, relieve headaches, and enhance mental clarity.', 30, 1200, 'ENT', ARRAY['Clears sinuses','Relieves migraines','Sharpens senses'], 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800'),
('Udvartana', 'udvartana', 'Herbal powder massage for weight & skin', 'A vigorous herbal powder massage that exfoliates skin, reduces cellulite, and supports healthy weight management.', 60, 2000, 'Weight & Skin', ARRAY['Weight management','Exfoliation','Improves skin tone'], 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800'),
('Kati Basti', 'kati-basti', 'Targeted back pain & spine therapy', 'Warm medicated oil held on the lower back using a dough reservoir to deeply nourish spinal tissues and relieve chronic back pain.', 45, 1500, 'Pain Relief', ARRAY['Relieves back pain','Strengthens spine','Reduces stiffness'], 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800');
