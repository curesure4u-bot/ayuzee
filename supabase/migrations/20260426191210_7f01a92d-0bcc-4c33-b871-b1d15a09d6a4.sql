-- ============================================================
-- 1. homeopathy_remedies (Materia Medica reference)
-- ============================================================
CREATE TABLE public.homeopathy_remedies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE,
  latin_name TEXT,
  common_name TEXT,
  source_kingdom TEXT,
  source_substance TEXT,
  miasm TEXT[] NOT NULL DEFAULT '{}',
  keynotes TEXT[] NOT NULL DEFAULT '{}',
  mind_summary TEXT NOT NULL DEFAULT '',
  generals TEXT NOT NULL DEFAULT '',
  thermal_state TEXT,
  particulars JSONB NOT NULL DEFAULT '{}'::jsonb,
  modalities_better TEXT[] NOT NULL DEFAULT '{}',
  modalities_worse TEXT[] NOT NULL DEFAULT '{}',
  food_cravings TEXT[] NOT NULL DEFAULT '{}',
  food_aversions TEXT[] NOT NULL DEFAULT '{}',
  relationships JSONB NOT NULL DEFAULT '{}'::jsonb,
  potency_range TEXT,
  clinical_indications TEXT[] NOT NULL DEFAULT '{}',
  doctor_notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_homeopathy_remedies_name ON public.homeopathy_remedies USING gin (name gin_trgm_ops);
CREATE INDEX idx_homeopathy_remedies_abbr ON public.homeopathy_remedies(abbreviation);

ALTER TABLE public.homeopathy_remedies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view active remedies"
  ON public.homeopathy_remedies FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins insert remedies"
  ON public.homeopathy_remedies FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins update remedies"
  ON public.homeopathy_remedies FOR UPDATE TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins delete remedies"
  ON public.homeopathy_remedies FOR DELETE TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER update_homeopathy_remedies_updated_at
  BEFORE UPDATE ON public.homeopathy_remedies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. homeopathy_rubrics (Kent Repertory)
-- ============================================================
CREATE TABLE public.homeopathy_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter TEXT NOT NULL,
  section TEXT,
  rubric TEXT NOT NULL,
  sub_rubric TEXT,
  full_path TEXT NOT NULL,
  remedies JSONB NOT NULL DEFAULT '[]'::jsonb,
  remedy_count INTEGER NOT NULL DEFAULT 0,
  search_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_homeopathy_rubrics_chapter ON public.homeopathy_rubrics(chapter);
CREATE INDEX idx_homeopathy_rubrics_search ON public.homeopathy_rubrics USING gin (search_text gin_trgm_ops);
CREATE INDEX idx_homeopathy_rubrics_path ON public.homeopathy_rubrics USING gin (full_path gin_trgm_ops);

ALTER TABLE public.homeopathy_rubrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view active rubrics"
  ON public.homeopathy_rubrics FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins insert rubrics"
  ON public.homeopathy_rubrics FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins update rubrics"
  ON public.homeopathy_rubrics FOR UPDATE TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins delete rubrics"
  ON public.homeopathy_rubrics FOR DELETE TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER update_homeopathy_rubrics_updated_at
  BEFORE UPDATE ON public.homeopathy_rubrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.homeopathy_rubrics_refresh_search()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.search_text := lower(concat_ws(' ', NEW.chapter, NEW.section, NEW.rubric, NEW.sub_rubric, NEW.full_path));
  RETURN NEW;
END $$;

CREATE TRIGGER trg_homeopathy_rubrics_search
  BEFORE INSERT OR UPDATE ON public.homeopathy_rubrics
  FOR EACH ROW EXECUTE FUNCTION public.homeopathy_rubrics_refresh_search();

-- ============================================================
-- 3. homeopathy_cases (full structured case form)
-- ============================================================
CREATE TABLE public.homeopathy_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  case_number TEXT,
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  patient_phone TEXT,
  patient_occupation TEXT,
  patient_address TEXT,
  -- Case
  chief_complaint TEXT NOT NULL DEFAULT '',
  complaint_duration TEXT,
  complaint_onset TEXT,
  history_present_illness TEXT,
  past_medical_history TEXT,
  family_history TEXT,
  -- Mind / Mentals
  mental_state TEXT,
  emotional_themes TEXT[] NOT NULL DEFAULT '{}',
  fears TEXT[] NOT NULL DEFAULT '{}',
  desires TEXT[] NOT NULL DEFAULT '{}',
  aversions_mind TEXT[] NOT NULL DEFAULT '{}',
  dreams TEXT,
  intellectual_state TEXT,
  -- Generals
  thermal_state TEXT,
  thirst TEXT,
  appetite TEXT,
  food_cravings TEXT[] NOT NULL DEFAULT '{}',
  food_aversions TEXT[] NOT NULL DEFAULT '{}',
  perspiration TEXT,
  sleep TEXT,
  sleep_position TEXT,
  menses TEXT,
  sexual_history TEXT,
  -- Particulars by system
  particulars JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Modalities
  modalities_better TEXT[] NOT NULL DEFAULT '{}',
  modalities_worse TEXT[] NOT NULL DEFAULT '{}',
  -- Miasm
  miasm_assessment TEXT,
  miasm_evidence TEXT,
  -- Life situation
  life_situation TEXT,
  significant_events TEXT,
  -- Workflow
  status TEXT NOT NULL DEFAULT 'active',
  doctor_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_homeopathy_cases_doctor ON public.homeopathy_cases(doctor_user_id);
CREATE INDEX idx_homeopathy_cases_status ON public.homeopathy_cases(status);
CREATE INDEX idx_homeopathy_cases_patient ON public.homeopathy_cases USING gin (patient_name gin_trgm_ops);

ALTER TABLE public.homeopathy_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors view own cases"
  ON public.homeopathy_cases FOR SELECT TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Doctors create own cases"
  ON public.homeopathy_cases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "Doctors update own cases"
  ON public.homeopathy_cases FOR UPDATE TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()))
  WITH CHECK (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Doctors delete own cases"
  ON public.homeopathy_cases FOR DELETE TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));

CREATE TRIGGER update_homeopathy_cases_updated_at
  BEFORE UPDATE ON public.homeopathy_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. case_rubric_selections
-- ============================================================
CREATE TABLE public.case_rubric_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.homeopathy_cases(id) ON DELETE CASCADE,
  rubric_id UUID NOT NULL REFERENCES public.homeopathy_rubrics(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  intensity SMALLINT NOT NULL DEFAULT 1 CHECK (intensity BETWEEN 1 AND 4),
  doctor_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (case_id, rubric_id)
);

CREATE INDEX idx_case_rubric_selections_case ON public.case_rubric_selections(case_id);
CREATE INDEX idx_case_rubric_selections_doctor ON public.case_rubric_selections(doctor_user_id);

ALTER TABLE public.case_rubric_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors view own selections"
  ON public.case_rubric_selections FOR SELECT TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Doctors create own selections"
  ON public.case_rubric_selections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "Doctors update own selections"
  ON public.case_rubric_selections FOR UPDATE TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()))
  WITH CHECK (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Doctors delete own selections"
  ON public.case_rubric_selections FOR DELETE TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));

-- ============================================================
-- 5. repertorisation_results
-- ============================================================
CREATE TABLE public.repertorisation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.homeopathy_cases(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  rubric_ids UUID[] NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_rubrics INTEGER NOT NULL DEFAULT 0,
  top_remedy TEXT,
  doctor_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_repertorisation_results_case ON public.repertorisation_results(case_id);

ALTER TABLE public.repertorisation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors view own results"
  ON public.repertorisation_results FOR SELECT TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Doctors create own results"
  ON public.repertorisation_results FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "Doctors update own results"
  ON public.repertorisation_results FOR UPDATE TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()))
  WITH CHECK (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Doctors delete own results"
  ON public.repertorisation_results FOR DELETE TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));

-- ============================================================
-- 6. homeopathy_prescriptions
-- ============================================================
CREATE TABLE public.homeopathy_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.homeopathy_cases(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  prescribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  remedy_name TEXT NOT NULL,
  remedy_id UUID REFERENCES public.homeopathy_remedies(id) ON DELETE SET NULL,
  potency TEXT NOT NULL,
  dosage TEXT,
  repetition TEXT,
  duration TEXT,
  instructions TEXT,
  placebo_instructions TEXT,
  follow_up_date DATE,
  outcome TEXT,
  doctor_notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_homeopathy_prescriptions_case ON public.homeopathy_prescriptions(case_id);
CREATE INDEX idx_homeopathy_prescriptions_doctor ON public.homeopathy_prescriptions(doctor_user_id);

ALTER TABLE public.homeopathy_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors view own prescriptions"
  ON public.homeopathy_prescriptions FOR SELECT TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Doctors create own prescriptions"
  ON public.homeopathy_prescriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "Doctors update own prescriptions"
  ON public.homeopathy_prescriptions FOR UPDATE TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()))
  WITH CHECK (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Doctors delete own prescriptions"
  ON public.homeopathy_prescriptions FOR DELETE TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));

CREATE TRIGGER update_homeopathy_prescriptions_updated_at
  BEFORE UPDATE ON public.homeopathy_prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Seed: 10 polychrest remedies with full Materia Medica profiles
-- ============================================================
INSERT INTO public.homeopathy_remedies
  (name, abbreviation, latin_name, common_name, source_kingdom, source_substance, miasm, keynotes, mind_summary, generals, thermal_state, particulars, modalities_better, modalities_worse, food_cravings, food_aversions, relationships, potency_range, clinical_indications)
VALUES
('Aconitum Napellus','Acon','Aconitum napellus','Monkshood','Plant','Aconitum napellus root',ARRAY['Acute miasm'],ARRAY['Sudden violent onset','Fear of death with restlessness','Worse from cold dry wind','Predicts hour of death'],'Acute, sudden, violent states with intense fear and anxiety. Restless, tossing, certain of impending death. Onset after exposure to cold dry wind or shock.','Sudden, violent, acute conditions; great fear and anxiety; physical and mental restlessness.','Hot','{"head":"Bursting headache, hot face","respiratory":"Dry croupy cough, worse at night","fever":"Burning heat, dry skin, intense thirst for cold water","cardiac":"Palpitations with anxiety"}'::jsonb,ARRAY['Open air','Rest','After perspiration'],ARRAY['Cold dry wind','Evening','Lying on affected side','Tobacco smoke'],ARRAY['Cold water','Bitter drinks'],ARRAY['Beer','Wine'],'{"complementary":["Coffea","Sulphur"],"follows_well":["Arnica","Coffea"],"antidotes":["Nux Vomica","Sulphur"]}'::jsonb,'30C–1M (acute)',ARRAY['Acute fevers','Croup','Panic attacks','Acute inflammation','Shock']),

('Belladonna','Bell','Atropa belladonna','Deadly Nightshade','Plant','Atropa belladonna whole plant',ARRAY['Acute psoric'],ARRAY['Sudden violent onset','Red, hot, throbbing','Dilated pupils','Worse touch, jar, light, noise'],'Furious delirium with congestion of the head. Hallucinations of monsters and frightful images. Bites, strikes, desires to escape.','Hot, red, throbbing, congestion to head; sudden, violent onset and disappearance.','Hot','{"head":"Throbbing congestive headache, worse stooping","throat":"Bright red, dry, burning, difficult swallowing","fever":"Burning skin, no thirst, drowsy","sense_organs":"Photophobia, dilated pupils"}'::jsonb,ARRAY['Semi-erect position','Bending head back'],ARRAY['Touch','Jar','Noise','Light','3 pm','Lying down'],ARRAY['Lemons','Lemonade'],ARRAY['Water (during heat)','Meat','Coffee'],'{"complementary":["Calcarea Carb"],"follows_well":["Hepar Sulph","Mercurius"],"antidotes":["Camphor","Coffea","Hyoscyamus"]}'::jsonb,'30C–200C',ARRAY['High fever in children','Acute tonsillitis','Migraine','Sunstroke','Mastitis']),

('Bryonia Alba','Bry','Bryonia alba','White Bryony','Plant','Bryonia alba root',ARRAY['Psoric','Sycotic'],ARRAY['Worse from any motion','Better lying still on painful side','Great thirst for large quantities','Dry mucous membranes','Irritable, wants to be left alone'],'Irritable, morose; wants to go home (when at home). Anxiety about business; talks of business in delirium. Aversion to disturbance.','Dryness everywhere — mucous membranes, skin, joints. Stitching pains worse from least motion.','Hot','{"head":"Bursting frontal headache, worse motion","respiratory":"Dry hacking cough, must hold chest","gi":"Constipation with hard dry stools","joints":"Hot swollen joints, worse motion"}'::jsonb,ARRAY['Lying still','Pressure on painful part','Cool open air','Cold drinks'],ARRAY['Any motion','Warmth','Morning','After eating','Hot weather'],ARRAY['Cold drinks in large quantity','Wine','Coffee'],ARRAY['Food (no appetite)','Warm drinks'],'{"complementary":["Alumina","Rhus Tox (alternates)"],"follows_well":["Rhus Tox","Sulphur"],"antidotes":["Aconite","Camphor","Chamomilla"]}'::jsonb,'30C–200C',ARRAY['Pleurisy','Rheumatism','Influenza','Pneumonia','Constipation']),

('Nux Vomica','Nux-v','Strychnos nux-vomica','Poison Nut','Plant','Strychnos nux-vomica seeds',ARRAY['Psoric','Sycotic'],ARRAY['Irritable, impatient, fault-finding','Hypersensitive to noise, odours, light','Ailments from overwork, alcohol, stimulants','Chilly, oversensitive','Constipation with frequent ineffectual urging'],'The classic type-A executive: ambitious, driven, irritable, impatient. Cannot bear contradiction. Overworks with stimulants then breaks down.','Hypersensitive in every way; chilly; cannot tolerate cold air; spasmodic conditions.','Chilly','{"head":"Headache from overindulgence, occipital","gi":"Sour eructations, constipation, ineffectual urging","sleep":"Wakes 3-4 am, cannot sleep again, drowsy after meals","respiratory":"Dry cough with bursting headache"}'::jsonb,ARRAY['Warm room','Damp wet weather','Strong pressure','Naps','Evening'],ARRAY['Early morning','Cold open air','Mental exertion','After meals','Stimulants','Spices'],ARRAY['Fats','Spicy food','Coffee','Alcohol'],ARRAY['Food (when ill)','Coffee (when sick)'],'{"complementary":["Sulphur","Sepia"],"follows_well":["Sulphur","Bryonia"],"antidotes":["Coffea","Camphor","Cocculus"]}'::jsonb,'30C–1M',ARRAY['Hangover','Indigestion','Hypertension','Insomnia','IBS','Hemorrhoids']),

('Pulsatilla Nigricans','Puls','Pulsatilla pratensis','Wind Flower','Plant','Pulsatilla pratensis whole plant',ARRAY['Psoric','Sycotic'],ARRAY['Mild, yielding, weeping easily','Better in open cool air','Worse in warm stuffy rooms','Changeable symptoms','Thirstless even in fever'],'Soft, mild, yielding, gentle. Weeps easily, easily consoled. Craves company and sympathy. Children clingy and want to be carried.','Changeable in every way — moods, symptoms, location of pains. Thirstless. Better in cool open air.','Warm-blooded but loves cool air','{"gi":"No two stools alike","menses":"Late, scanty, dark, intermittent flow","respiratory":"Loose cough morning, dry at night","ears":"Otitis with thick yellow-green discharge"}'::jsonb,ARRAY['Cool open air','Gentle motion','Cold applications','Consolation','Weeping'],ARRAY['Warm stuffy rooms','Evening','Rich fatty food','Lying on left side','Beginning of motion'],ARRAY['Cold food','Ice cream','Pastries','Sweets'],ARRAY['Fat','Pork','Warm food','Butter'],'{"complementary":["Kali Mur","Silicea"],"follows_well":["Lycopodium","Sepia"],"antidotes":["Chamomilla","Coffea","Nux Vomica"]}'::jsonb,'30C–200C',ARRAY['Otitis media','Menstrual disorders','Conjunctivitis','Varicose veins','Indigestion from fats']),

('Sulphur','Sulph','Sulphur','Brimstone','Mineral','Sublimated sulphur',ARRAY['Psoric (chief)'],ARRAY['Burning sensations everywhere','Hot vertex, burning soles at night','Aversion to bathing','Untidy, philosophical "ragged philosopher"','Worse standing, warmth of bed','Early morning diarrhoea (5 am)'],'The selfish philosopher; theorising, lazy, untidy. Critical of others, dissatisfied. Children dislike washing.','Burning, redness, offensiveness; orifices red; hot patient who throws off covers; aggravation from warmth.','Hot','{"skin":"Itching, burning, worse warmth of bed; eruptions","head":"Hot vertex, congestive headaches","gi":"Early morning diarrhoea drives out of bed","feet":"Burning soles, must put out of bed at night"}'::jsonb,ARRAY['Open air','Dry warm weather','Lying on right side'],ARRAY['Warmth of bed','Bathing','Standing','11 am (hunger sinking)','Suppressed eruptions'],ARRAY['Sweets','Spicy food','Alcohol','Fats'],ARRAY['Eggs','Meat','Milk'],'{"complementary":["Aconite","Nux Vomica","Psorinum"],"follows_well":["Calcarea Carb","Lycopodium"],"antidotes":["Camphor","Pulsatilla","Mercurius"]}'::jsonb,'30C–10M',ARRAY['Chronic skin disease','Eczema','Hemorrhoids','Chronic diarrhoea','Constitutional miasmatic prescribing']),

('Calcarea Carbonica','Calc','Calcarea carbonica','Carbonate of Lime','Mineral','Middle layer of oyster shell',ARRAY['Psoric','Sycotic'],ARRAY['Fat, fair, flabby, perspiring','Sour perspiration on head at night','Worse cold damp; chilly','Slow development in children','Fear of poverty, of insanity','Craves eggs and indigestible things'],'Anxious, slow, methodical, fearful. Anxiety about future, money, health. Children obstinate, slow, stubborn. Mental work fatigues quickly.','Tendency to obesity; sweating on head during sleep; chilly; sour perspiration; chronic plodding constitution.','Chilly','{"head":"Profuse sweat on head at night, wets pillow","glands":"Enlarged tonsils, glands","menses":"Early, profuse, prolonged","skeletal":"Slow dentition, slow walking, curvature"}'::jsonb,ARRAY['Dry weather','Lying on painful side'],ARRAY['Cold damp weather','Exertion (mental and physical)','Ascending','Standing','Full moon'],ARRAY['Eggs','Indigestible things (chalk, dirt)','Sweets','Cold drinks'],ARRAY['Hot food','Slimy things','Coffee','Milk'],'{"complementary":["Belladonna","Lycopodium","Rhus Tox"],"follows_well":["Pulsatilla","Sulphur"],"antidotes":["Camphor","Sulphur","Nitric Acid"]}'::jsonb,'30C–1M',ARRAY['Constitutional in children','Glandular swellings','Chronic fatigue','Bone conditions','Polyps']),

('Lycopodium Clavatum','Lyc','Lycopodium clavatum','Club Moss','Plant','Lycopodium clavatum spores',ARRAY['Psoric','Sycotic'],ARRAY['Cowardly inwardly, bold outwardly','Lack of self-confidence, fear of failure','Worse 4–8 pm','Right-sided complaints','Right to left direction','Bloating, flatulence, full after few mouthfuls','Craves sweets and warm drinks'],'Lacks self-confidence yet is dictatorial at home; cowardly with the strong, dominating with the weak. Anticipatory anxiety. Anxious about reputation.','Right-sided complaints; right to left progression; aggravation 4–8 pm; flatulence; warm drinks improve.','Chilly (likes warm drinks, cool air on head)','{"gi":"Bloating immediately after eating, full quickly","liver":"Liver complaints, dyspepsia","urinary":"Red sand in urine, child cries before urinating","male":"Impotence with great desire","respiratory":"Pneumonia right lower lobe, fan-like nostrils"}'::jsonb,ARRAY['Warm drinks','Open air','Motion','After midnight','Loosening clothes'],ARRAY['4–8 pm','Cold drinks','Tight clothing','Pressure of clothes','Right side','Oysters'],ARRAY['Sweets','Warm drinks','Hot food'],ARRAY['Onions','Cabbage','Cold food','Oysters'],'{"complementary":["Iodum","Chelidonium"],"follows_well":["Calcarea Carb","Sulphur"],"antidotes":["Camphor","Pulsatilla","Causticum"]}'::jsonb,'30C–10M',ARRAY['Dyspepsia','Liver complaints','Right-sided pneumonia','Performance anxiety','BPH']),

('Natrum Muriaticum','Nat-m','Natrium chloratum','Common Salt','Mineral','Sodium chloride',ARRAY['Psoric','Syphilitic'],ARRAY['Silent grief, dwells on past wrongs','Consolation aggravates','Craves salt','Sun headache 10 am','Cold sores on lips','Worse seashore, sun, mental exertion','Hangnails, dry mucous membranes'],'Reserved, introverted, holds grief silently. Cannot weep in presence of others. Hates being consoled. Dwells on disagreeable past events. Loves solitude.','Emaciation despite eating well, especially neck. Dry mucous membranes alternating with watery discharges. Salt craving.','Chilly but worse from sun and heat','{"head":"Hammering headache after sunrise, better sleep","skin":"Dry, oily T-zone, herpes labialis","menses":"Irregular, with sadness, headache","mind":"Weeps when alone, worse from sympathy"}'::jsonb,ARRAY['Open air','Cold bathing','Lying on right side','Skipping meals','Sweating','Tight clothing'],ARRAY['10 am','Sun and heat','Mental exertion','Consolation','Seashore','Talking'],ARRAY['Salt','Bread','Bitter food','Fish'],ARRAY['Bread','Fats','Slimy food','Coffee'],'{"complementary":["Apis","Sepia","Ignatia"],"follows_well":["Ignatia","Sepia"],"antidotes":["Arsenicum","Camphor","Nitric Spirit"]}'::jsonb,'200C–10M (rarely below 200)',ARRAY['Chronic grief','Migraines','Anaemia','Eczema','Infertility from emotional cause']),

('Phosphorus','Phos','Phosphorus','Yellow Phosphorus','Mineral','Yellow phosphorus',ARRAY['Psoric','Tubercular'],ARRAY['Tall, slender, sympathetic, communicative','Fear of being alone, of thunderstorms, of dark','Burning pains','Bleeds easily, bright red blood','Craves cold drinks, ice cream','Vomits as soon as warm in stomach','Ailments from grief, fright'],'Open, sympathetic, intuitive, easily influenced. Loves company; cannot bear being alone, especially in twilight. Many fears that vanish when consoled.','Tall, lean, narrow-chested constitution. Bleeding tendency. Burning pains. Quick to perceive but easily exhausted.','Chilly but craves cold','{"respiratory":"Pneumonia (left lower lobe), tightness","gi":"Vomits cold water as soon as warm in stomach","mind":"Many fears, better consolation, company","bleeding":"Bright red blood, easily; epistaxis"}'::jsonb,ARRAY['Eating','Sleep','Cold food','Rubbing','Open air','Company'],ARRAY['Lying on left side','Twilight','Warm food and drinks','Thunderstorms','Mental exertion','Touch'],ARRAY['Cold drinks','Ice cream','Salt','Spicy food','Refreshing things'],ARRAY['Warm food','Boiled milk','Sweets (when ill)','Fish'],'{"complementary":["Arsenicum","Lycopodium","Carbo Veg"],"follows_well":["Calcarea Carb","Sulphur"],"antidotes":["Nux Vomica","Coffea","Camphor"]}'::jsonb,'30C–10M',ARRAY['Pneumonia','Bleeding disorders','Hepatitis','Anxiety with fear of being alone','Hoarseness']);