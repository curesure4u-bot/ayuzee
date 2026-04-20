CREATE TABLE IF NOT EXISTS public.company_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read company content" ON public.company_content FOR SELECT USING (true);
CREATE POLICY "Admins manage company content" ON public.company_content FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_company_content_updated BEFORE UPDATE ON public.company_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.company_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name text NOT NULL DEFAULT 'Hinirog Healthtech Private Limited',
  brand_name text NOT NULL DEFAULT 'Ayuzee',
  email text NOT NULL DEFAULT 'info@ayuzee.com',
  support_email text NOT NULL DEFAULT 'support@ayuzee.com',
  grievance_email text NOT NULL DEFAULT 'complaints@ayuzee.com',
  phone text NOT NULL DEFAULT '+91 931-9361-976',
  address text NOT NULL DEFAULT '3rd Floor, ZO Space Private Limited, Plot No. 5, Kh. No. 274, Saidulajab Extn., Westend Marg, New Delhi - 110030',
  hours text NOT NULL DEFAULT 'Monday - Friday (10:00 AM to 7:00 PM)',
  website text NOT NULL DEFAULT 'www.ayuzee.com',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read company info" ON public.company_info FOR SELECT USING (true);
CREATE POLICY "Admins manage company info" ON public.company_info FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_company_info_updated BEFORE UPDATE ON public.company_info
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.company_info DEFAULT VALUES;

INSERT INTO public.company_content (slug, title, body) VALUES
('about', 'About Us',
'Ayuzee is a unique concept in the Ayurveda healthcare ecosystem. It was founded in June 2016. We are an impact organization striving to make Ayurveda the first call of treatment for people. Our technology-driven platform provides access to authentic Ayurveda doctors on a global scale. As the world is quickly moving from reactive to proactive healthcare, the demand for holistic healing methods such as Ayurveda is at an all-time high. Our Community-first approach leverages the wide network of practitioners and students to promote health and wellness in the society.

As a true ecosystem builder of Ayurveda, we have encapsulated in our vision the many facets of promoting Ayurveda. We are striving to create a thorough digital connection between the Ayurveda doctors and the patients. We are also collaborating with various experts, seasoned practitioners, and organizations to conduct CMEs (Continual Medical Education), digital webinars and discussion sessions. We have our own ''Ayuzee for Ayurveda Doctors'' App which aims to build an interactive, knowledge-oriented, and robust information sharing platform for the practitioners, academicians, and students.

With technology-based intervention, we curate and empower doctors by working closely with the Ministry of AYUSH, regulators, and research organizations. We encourage doctors to create and publish case studies and research reports so as to bring in evidence-based treatment similar to modern medicine. Community building is encouraged for active engagement amongst doctors. Focus is to implement best practices and deliver quality Ayurveda healthcare.

It is our vision to reach billions of people through our unparalleled commitment of bringing the correct adoption of pure Ayurveda in management and prevention of ailments through technology-led innovation and crucial partnerships.

Ayurveda is a 5,000 years old medicine system. Charak Samhita and Sushruta Samhita are the reference texts. Sushruta was the ancient physician of the Indian Medical System. Ayurveda focuses on holistic wellness along with the prevention and management of diseases in the most natural manner.

Ayurveda takes into account the mind, body and spirit and works accordingly to eliminate the root cause of a disease.

Ayurveda as the most ancient health science in the world is highly effective in curing illnesses and its preventive approach helps you fight even the most complex of diseases. Based on the four great pillars of a ''nirogi'' lifestyle, Ayurveda is all about ''Aahar'' (food), ''Vihar'' (lifestyle), ''Vichar'' (thoughts) and ''Vyavhar'' (actions). Whenever any or all of these elements stop working in harmony, a body faces disease. Ayurveda, as an ancient and natural system of medicine, ensures that all these issues are corrected and you get a disease free body and mind. It provides topical as well as lasting relief for ailments and gives hundreds of ''sutras'' that can be followed to ensure that you remain in your best health. The medicines used for treatment are completely herbal and plant-derived. There is no element of artificial chemicals and thus ayurvedic medicines are very safe for consumption, unlike in modern medicine which can have harmful effects on your body.

Ayurveda is being used as a primary mode of healthcare in many diseases. In case of surgical procedures and restorative medicine, Ayurveda and yoga are being recommended to patients for quicker and better recoveries.'),

('terms', 'Terms of Service',
'Hinirog Healthtech Private Limited (Company / Ayuzee / We / Our / Us) respects an individual''s privacy and is committed to protecting the same. This document describes how we collect, use, disclose and transfer Personal Information through our website www.ayuzee.com and mobile applications.

THIS DOCUMENT IS AN ELECTRONIC RECORD IN TERMS OF INFORMATION TECHNOLOGY ACT, 2000 AND RULES ISSUED THEREUNDER.

PLEASE READ THESE TERMS AND CONDITIONS CAREFULLY. BY ACCESSING WWW.AYUZEE.COM OR ANY MOBILE APPLICATION OR AVAILING ANY PRODUCTS OF HINIROG HEALTHTECH PRIVATE LIMITED YOU AGREE TO BE BOUND BY ALL OF THE TERMS MENTIONED HEREUNDER.

Only persons who can enter into a legally binding contract under the Indian Contract Act, 1872 may use the Website. Minors must transact through their legal guardian. Ayuzee may amend the T&C at any time by uploading a revised version on the Website.

PRODUCTS
Terms of Offer: Ayuzee may change, suspend, or discontinue the availability of any Product at any time without notice. Prices and availability are subject to change.

Customer Solicitation: By placing an order you agree to receive transactional and promotional communications via email, SMS, phone, WhatsApp.

Proprietary Rights: All brand names owned and licensed to Ayuzee are exclusive property of Ayuzee, protected by laws of India.

Tax: You are responsible for any applicable taxes on purchases.

WEBSITE
Account: One user account per person. You are responsible for confidentiality of your password.

Payment: Credit/Debit Cards, Net Banking, Wallets, UPI, QR, PayPal, Ayuzee Money and Cash on Delivery.

Pricing: Prices include GST. Orders under INR 500 incur delivery charges. Orders above INR 500 are delivered free.

Delivery: Usually 5-7 business days. Estimated dates are indicative.

TELE-CONSULTATION
A video consult cannot replace an in-clinic consultation. By accepting telemedicine you agree Ayuzee and its doctors are not liable for diagnostic errors due to sub-optimal technical conditions. Ayuzee does not guarantee appointment confirmation.

DISCLAIMER OF WARRANTIES
The Website and Products are offered "as is" and "as available". Ayuzee makes no warranty of accuracy, reliability, completeness or timeliness.

LIMITATION OF LIABILITY
Ayuzee shall not be liable for any direct, indirect, incidental, special or consequential damages arising from use of the Website or Products.

INDEMNIFICATION
You agree to indemnify and hold harmless Ayuzee, its officers, directors, employees and affiliates from claims arising out of your breach of these terms.

ACCOUNT DELETION
Delete your account from My Profile → Delete Account. Deletion is blocked if there are undelivered orders, pending refunds, outstanding balances or open legal cases.

GENERAL
Governing Law: Laws of India, jurisdiction of courts in Delhi.

Contact: info@ayuzee.com • +91 931-9361-976 • Mon-Fri 10am-7pm.'),

('privacy', 'Privacy Policy',
'Ayuzee respects your privacy and is committed to protecting your personal information. This policy explains how we collect, use, disclose and transfer your data through our website and applications.

Information We Collect: Name, contact details, email, phone number, address, payment information, medical history (where shared for consultations), and usage data.

How We Use Your Information: To process orders, deliver products, provide tele-consultation services, improve our offerings, send transactional and marketing communications, and comply with legal obligations.

Data Sharing: We do not sell your personal information. We may share data with delivery partners, payment processors, and authorised doctors strictly for fulfilling your requested services.

Data Security: We implement industry-standard security measures including encryption, access controls and secure servers.

Cookies: We use cookies to improve your browsing experience and analyse usage patterns.

Your Rights: You may access, update or request deletion of your personal information by emailing info@ayuzee.com.

For full policy details, please write to privacy@ayuzee.com.'),

('cancellation', 'Cancellation Policy',
'Order Cancellation: You may cancel an order before it is dispatched from My Orders. Once dispatched, cancellation is not possible.

Tele-Consultation Cancellation: Appointments may be cancelled or rescheduled at least 2 hours before the slot for a full refund. Cancellations within 2 hours are non-refundable.

Therapy Booking Cancellation: Bookings cancelled 24 hours in advance are eligible for a full refund. Within 24 hours, a 50% cancellation fee applies.

Refunds for cancelled orders are processed within 7-10 business days to the original payment method.'),

('refunds', 'Refunds & Returns Policy',
'Returns: Sealed and unopened products may be returned within 7 days of delivery if damaged, defective, or incorrect. Initiate returns from My Orders.

Non-Returnable Items: Opened medicines, refrigerated items, and personal care products cannot be returned for hygiene reasons.

Refund Timeline: Refunds are processed within 7-10 business days after the returned item is received and inspected.

Ayuzee Money Adjustments: Any Ayuzee Money credited as cashback on the original order will be reversed proportionally to the refund amount.

For return support, contact info@ayuzee.com.'),

('contact', 'Contact Us',
'Customer Service Desk
Email: info@ayuzee.com
Phone: +91 931-9361-976
Hours: Monday - Friday (10:00 AM to 7:00 PM)

Grievance Officer
Address: 3rd Floor, ZO Space Private Limited, Plot No. 5, Kh. No. 274, Saidulajab Extn., Westend Marg, New Delhi - 110030
Email: complaints@ayuzee.com
Hours: Monday - Friday (10:00 AM to 7:00 PM)

Registered Entity: Hinirog Healthtech Private Limited');