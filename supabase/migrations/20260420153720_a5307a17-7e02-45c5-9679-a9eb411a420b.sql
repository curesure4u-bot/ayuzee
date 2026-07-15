-- Doctors directory (public read, no inserts from client)
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  clinic_name TEXT,
  experience_years INT NOT NULL DEFAULT 0,
  consultation_fee INT NOT NULL DEFAULT 0,
  languages TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.8,
  total_reviews INT NOT NULL DEFAULT 0,
  video_available BOOLEAN NOT NULL DEFAULT true,
  in_clinic_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors are viewable by everyone"
  ON public.doctors FOR SELECT
  USING (true);

CREATE INDEX idx_doctors_category ON public.doctors(category);
CREATE INDEX idx_doctors_city ON public.doctors(city);

-- Appointments
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('video','in_clinic')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  fee INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_appointments_user ON public.appointments(user_id);
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id);

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed doctors
INSERT INTO public.doctors (full_name, specialization, category, city, clinic_name, experience_years, consultation_fee, languages, bio, rating, total_reviews) VALUES
('Dr. Anjali Sharma', 'Spine & Joint Care', 'Ayurveda', 'New Delhi', 'Sukha Ayurveda Clinic', 12, 499, ARRAY['English','Hindi'], 'Specialist in classical Ayurvedic treatments for chronic back and joint pain. BAMS, MD (Ayu).', 4.9, 312),
('Dr. Ravi Menon', 'Panchakarma & Detox', 'Ayurveda', 'Kochi', 'Vaidya Wellness Center', 18, 699, ARRAY['English','Malayalam'], 'Kerala-trained Panchakarma expert with two decades of clinical experience.', 4.8, 478),
('Dr. Priya Iyer', 'Gynaecology & Womens Health', 'Ayurveda', 'Bengaluru', 'Stree Care Ayurveda', 10, 599, ARRAY['English','Tamil','Kannada'], 'Holistic care for PCOS, menstrual disorders, and prenatal wellness.', 4.9, 256),
('Dr. Karan Joshi', 'Naturopathy & Yoga', 'Naturopathy', 'Pune', 'Prakriti Naturopathy', 8, 399, ARRAY['English','Hindi','Marathi'], 'Lifestyle medicine, yoga therapy, and dietary counseling.', 4.7, 189),
('Dr. Meera Pillai', 'Skin & Hair Care', 'Ayurveda', 'Chennai', 'Triveni Ayur Skin', 14, 549, ARRAY['English','Tamil'], 'Ayurvedic dermatology — eczema, psoriasis, hair fall, and rejuvenation.', 4.8, 221),
('Dr. Sandeep Rao', 'Digestive & Liver Care', 'Ayurveda', 'Hyderabad', 'Agni Ayurveda', 15, 599, ARRAY['English','Telugu','Hindi'], 'IBS, acidity, fatty liver — restoring digestive fire (agni) the classical way.', 4.9, 367),
('Dr. Lakshmi Gopal', 'Homeopathy', 'Homeopathy', 'Mumbai', 'Sanjeevani Homeo', 11, 349, ARRAY['English','Hindi','Marathi'], 'Gentle, individualized homeopathic care for chronic conditions.', 4.7, 142),
('Dr. Aman Verma', 'Stress & Sleep', 'Yoga', 'Rishikesh', 'Shanti Yoga Therapy', 9, 449, ARRAY['English','Hindi'], 'Yoga therapy for anxiety, insomnia, and burnout recovery.', 4.8, 198);