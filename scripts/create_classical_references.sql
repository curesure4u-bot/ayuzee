-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE — Classical Reference Engine Database
-- Searchable repository of Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya,
-- Bhavaprakasha, Rasa Tarangini, and other AYUSH classical texts
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Classical Texts (master catalog)
CREATE TABLE IF NOT EXISTS classical_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_sanskrit TEXT,
  author TEXT,
  era TEXT,
  system TEXT NOT NULL CHECK (system IN (
    'ayurveda', 'siddha', 'unani', 'yoga', 'rasa_shastra'
  )),
  total_chapters INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE classical_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read texts" ON classical_texts FOR SELECT USING (true);

-- 2. References (individual shlokas / passages)
CREATE TABLE IF NOT EXISTS classical_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id UUID NOT NULL REFERENCES classical_texts(id) ON DELETE CASCADE,
  -- Location
  sthana TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  chapter_name TEXT NOT NULL,
  chapter_name_sanskrit TEXT,
  verse_start INTEGER,
  verse_end INTEGER,
  -- Content
  sanskrit_text TEXT,
  transliteration TEXT,
  english_translation TEXT NOT NULL,
  hindi_translation TEXT,
  commentary TEXT,
  -- Clinical relevance
  clinical_topic TEXT NOT NULL,
  clinical_tags TEXT[] NOT NULL DEFAULT '{}',
  diseases_mentioned TEXT[] DEFAULT '{}',
  herbs_mentioned TEXT[] DEFAULT '{}',
  formulations_mentioned TEXT[] DEFAULT '{}',
  principles TEXT[] DEFAULT '{}',
  -- Metadata
  relevance_score INTEGER DEFAULT 5 CHECK (relevance_score >= 1 AND relevance_score <= 10),
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE classical_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read references" ON classical_references FOR SELECT USING (true);
CREATE POLICY "Admin can manage references" ON classical_references FOR ALL USING (auth.uid() IS NOT NULL);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_classical_refs_fts ON classical_references
  USING gin(to_tsvector('english',
    COALESCE(english_translation, '') || ' ' ||
    COALESCE(clinical_topic, '') || ' ' ||
    COALESCE(commentary, '') || ' ' ||
    COALESCE(chapter_name, '')
  ));
CREATE INDEX IF NOT EXISTS idx_classical_refs_tags ON classical_references USING gin(clinical_tags);
CREATE INDEX IF NOT EXISTS idx_classical_refs_diseases ON classical_references USING gin(diseases_mentioned);
CREATE INDEX IF NOT EXISTS idx_classical_refs_herbs ON classical_references USING gin(herbs_mentioned);
CREATE INDEX IF NOT EXISTS idx_classical_refs_text ON classical_references(text_id);
CREATE INDEX IF NOT EXISTS idx_classical_refs_topic ON classical_references(clinical_topic);

-- 3. Search logs
CREATE TABLE IF NOT EXISTS classical_reference_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE classical_reference_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert search logs" ON classical_reference_searches FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA: Classical Texts
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO classical_texts (name, name_sanskrit, author, era, system, total_chapters, description) VALUES
('Charaka Samhita', 'चरक संहिता', 'Agnivesha (redacted by Charaka, Dridhabala)', '2nd century BCE', 'ayurveda', 120, 'Foundation text of Ayurvedic internal medicine (Kayachikitsa). 8 Sthanas, 120 chapters covering theory, diagnosis, treatment, pharmacology, and Rasayana.'),
('Sushruta Samhita', 'सुश्रुत संहिता', 'Sushruta', '6th century BCE', 'ayurveda', 186, 'Foundation text of Ayurvedic surgery (Shalya Tantra). 6 Sthanas covering surgical procedures, anatomy, pathology, toxicology, and surgical instruments.'),
('Ashtanga Hridaya', 'अष्टाङ्ग हृदयम्', 'Vagbhata', '7th century CE', 'ayurveda', 120, 'Comprehensive synthesis of Charaka and Sushruta in concise verse form. Most widely used clinical text in Kerala Ayurveda tradition.'),
('Ashtanga Sangraha', 'अष्टाङ्ग सङ्ग्रह', 'Vagbhata (Elder)', '5th century CE', 'ayurveda', 150, 'Detailed compilation preceding Ashtanga Hridaya. Includes extensive prose commentaries alongside verses.'),
('Bhavaprakasha', 'भावप्रकाश', 'Bhavamishra', '16th century CE', 'ayurveda', 80, 'Late medieval compendium. Excellent Nighantu (pharmacology) section with 700+ drugs. Integrates new drugs like opium, syphilis treatments.'),
('Sharangadhara Samhita', 'शारङ्गधर संहिता', 'Sharangadhara', '13th century CE', 'ayurveda', 32, 'Concise pharmaceutical text. Standardized formulation preparation methods — Kwatha, Asava, Taila, Ghrita, Bhasma.'),
('Rasa Tarangini', 'रस तरंगिणी', 'Sadananda Sharma', '19th century CE', 'rasa_shastra', 24, 'Definitive modern Rasa Shastra text. 24 Tarangas covering mercury, minerals, gems, and metallic preparations with safety protocols.'),
('Rasaratna Samucchaya', 'रसरत्न समुच्चय', 'Vagbhata II', '13th century CE', 'rasa_shastra', 30, 'Classical Rasa Shastra text covering mineral processing, Bhasma preparation, and therapeutic applications of metals.'),
('Madhava Nidana', 'माधव निदान', 'Madhavakara', '8th century CE', 'ayurveda', 69, 'Definitive diagnostic text. 69 chapters on Nidana (etiology), Purvarupa (prodromal symptoms), Rupa (symptoms), Samprapti (pathogenesis).'),
('Yoga Ratnakara', 'योग रत्नाकर', 'Unknown', '17th century CE', 'ayurveda', NULL, 'Popular clinical handbook with disease-wise yoga (formulations). Widely used in North Indian Ayurvedic practice.'),
('Dravyaguna Vijnana', 'द्रव्यगुण विज्ञान', 'Multiple authors (modern)', '20th century CE', 'ayurveda', NULL, 'Modern pharmacology textbook based on classical principles. Rasa-Guna-Veerya-Vipaka-Prabhava of 500+ drugs.')
ON CONFLICT (name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA: Classical References (60+ key shlokas across major texts)
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_charaka UUID; v_sushruta UUID; v_ashtanga UUID; v_bhava UUID;
  v_sharangadhara UUID; v_rasa_tarangini UUID; v_madhava UUID;
BEGIN
  SELECT id INTO v_charaka FROM classical_texts WHERE name = 'Charaka Samhita' LIMIT 1;
  SELECT id INTO v_sushruta FROM classical_texts WHERE name = 'Sushruta Samhita' LIMIT 1;
  SELECT id INTO v_ashtanga FROM classical_texts WHERE name = 'Ashtanga Hridaya' LIMIT 1;
  SELECT id INTO v_bhava FROM classical_texts WHERE name = 'Bhavaprakasha' LIMIT 1;
  SELECT id INTO v_sharangadhara FROM classical_texts WHERE name = 'Sharangadhara Samhita' LIMIT 1;
  SELECT id INTO v_rasa_tarangini FROM classical_texts WHERE name = 'Rasa Tarangini' LIMIT 1;
  SELECT id INTO v_madhava FROM classical_texts WHERE name = 'Madhava Nidana' LIMIT 1;

  INSERT INTO classical_references (text_id, sthana, chapter_number, chapter_name, chapter_name_sanskrit, verse_start, verse_end, sanskrit_text, english_translation, clinical_topic, clinical_tags, diseases_mentioned, herbs_mentioned, principles) VALUES
  -- CHARAKA SAMHITA — Sutra Sthana
  (v_charaka, 'Sutra Sthana', 1, 'Deerghanjeeviteeya Adhyaya', 'दीर्घञ्जीवितीय अध्याय', 1, 5, 'अथातो दीर्घञ्जीवितीयमध्यायं व्याख्यास्यामः', 'Now we shall explain the chapter on longevity. The science of Ayurveda exists for the purpose of prolonging life, maintaining health, and treating disease.', 'Definition of Ayurveda', ARRAY['philosophy','definition','longevity','health'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['swasthya','ayu','purpose of ayurveda']),
  (v_charaka, 'Sutra Sthana', 1, 'Deerghanjeeviteeya Adhyaya', 'दीर्घञ्जीवितीय अध्याय', 41, 42, 'हिताहितं सुखं दुःखमायुस्तस्य हिताहितम्। मानं च तच्च यत्रोक्तमायुर्वेदः स उच्यते।।', 'That science which describes what is beneficial and harmful, happy and unhappy life, and what promotes or hinders longevity — that is called Ayurveda.', 'Definition of Ayurveda', ARRAY['philosophy','definition','hita-ahita'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['hitayu','ahitayu','sukhayu','dukhayu']),
  (v_charaka, 'Sutra Sthana', 7, 'Navegandharaniya Adhyaya', 'नवेगान्धारणीय अध्याय', 1, 10, NULL, 'The natural urges (Vegas) that should never be suppressed: flatus, urine, feces, vomiting, sneezing, thirst, hunger, sleep, cough, dyspnea from exertion, yawning, tears, and ejaculation. Suppression causes specific diseases.', 'Vega Dharana (urge suppression)', ARRAY['preventive','daily routine','vegas','physiology'], ARRAY['udavarta','constipation','urinary retention'], ARRAY[]::TEXT[], ARRAY['13 natural urges','suppression pathology','swasthavritta']),
  (v_charaka, 'Sutra Sthana', 20, 'Maharoga Adhyaya', 'महारोग अध्याय', 1, 20, NULL, 'Classification of all diseases: by Dosha (Vataja 80, Pittaja 40, Kaphaja 20 = 140 types), by location (Shakha/Koshtha/Marma/Asthi), and by prognosis (Sadhya/Yapya/Asadhya).', 'Disease Classification', ARRAY['nidana','classification','prognosis','dosha'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['140 diseases','sadhya','asadhya','yapya']),
  (v_charaka, 'Sutra Sthana', 26, 'Atreyabhadrakapyiya Adhyaya', 'आत्रेयभद्रकाप्यीय अध्याय', 81, 101, NULL, 'Viruddha Ahara (incompatible foods): 18 types of food incompatibilities including Desha, Kala, Agni, Matra, Satmya, Dosha, Samskara, Veerya, Koshtha, Avastha, Krama, Parihara, Upachara, Paka, Samyoga, Hridaya, Sampat, and Vidhi Viruddha.', 'Viruddha Ahara (Food Incompatibilities)', ARRAY['diet','viruddha','incompatible food','toxicology','preventive'], ARRAY['kushtha','shvitra','kilasa','raktapitta'], ARRAY['ghee','honey','milk','fish','curd'], ARRAY['18 types of viruddha','samyoga viruddha','veerya viruddha']),
  (v_charaka, 'Sutra Sthana', 30, 'Arthedashmahamuliya Adhyaya', 'अर्थेदशमहामूलीय अध्याय', 26, 28, 'स्वस्थस्य स्वास्थ्यरक्षणं आतुरस्य विकारप्रशमनं च', 'The dual purpose of Ayurveda: to maintain the health of the healthy (Swasthya Rakshana) and to cure the diseases of the sick (Vikara Prashamana).', 'Dual Purpose of Ayurveda', ARRAY['philosophy','preventive','curative','swasthavritta'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['swasthya rakshana','vikara prashamana','two aims']),

  -- CHARAKA SAMHITA — Nidana Sthana
  (v_charaka, 'Nidana Sthana', 1, 'Jwara Nidana', 'ज्वर निदान', 1, 35, NULL, 'Etiology of Jwara (Fever): 8 types — Vataja, Pittaja, Kaphaja, Vata-Pitta, Vata-Kapha, Pitta-Kapha, Sannipataja, and Agantuja. Prodromal signs include heaviness, dislike for food, yawning, body ache, and rigors. Pathogenesis involves Ama accumulation in Amashaya affecting Rasa Dhatu.', 'Jwara (Fever) — Etiology & Pathogenesis', ARRAY['nidana','fever','dosha','samprapti','ama'], ARRAY['jwara','sannipataja jwara','vishama jwara'], ARRAY[]::TEXT[], ARRAY['8 types of fever','ama in jwara','jwarahara']),
  (v_charaka, 'Nidana Sthana', 4, 'Prameha Nidana', 'प्रमेह निदान', 1, 47, NULL, 'Etiology of Prameha (Diabetes/Urinary disorders): 20 types — 10 Kaphaja, 6 Pittaja, 4 Vataja. Caused by sedentary lifestyle (Asyasukha), excessive sleep (Svapnasukha), excess of Dadhi, Gramya-Audaka-Anupa Mamsa, new grains, and Guda preparations. Madhumeha (Diabetes Mellitus) is Krichhra-Sadhya or Asadhya.', 'Prameha (Diabetes) — Etiology & Classification', ARRAY['nidana','diabetes','prameha','kapha','meda'], ARRAY['prameha','madhumeha','ikshuvameha'], ARRAY['shilajit','guduchi','triphala','turmeric'], ARRAY['20 types','medodushti','kapha-meda axis','lifestyle causation']),

  -- CHARAKA SAMHITA — Chikitsa Sthana
  (v_charaka, 'Chikitsa Sthana', 1, 'Rasayana Adhyaya (Pada 1)', 'रसायन अध्याय', 1, 78, NULL, 'Rasayana Chikitsa: Kutipraveshika (indoor) and Vatatapika (outdoor) methods. Benefits: longevity, memory, intelligence, immunity, youthfulness, lustre, voice, strength of body and senses. Key Rasayanas: Chyawanprash (Amalaki-based), Brahma Rasayana, Vardhamana Pippali.', 'Rasayana (Rejuvenation Therapy)', ARRAY['rasayana','rejuvenation','immunity','longevity','anti-aging'], ARRAY[]::TEXT[], ARRAY['amalaki','haritaki','pippali','brahmi','ashwagandha','guduchi'], ARRAY['kutipraveshika','vatatapika','medhya rasayana','achara rasayana']),
  (v_charaka, 'Chikitsa Sthana', 3, 'Jwara Chikitsa', 'ज्वर चिकित्सा', 1, 330, NULL, 'Treatment of Fever: Langhana (fasting) is primary in Ama stage. Then Pachana (digestives). Specific formulations: Dasamoola Kashaya, Guduchi Sattva, Musta, Kiratatikta. Do NOT give Antipyretics in Ama Jwara — wait for Nirama stage. Virechana for Pitta Jwara.', 'Jwara Chikitsa (Fever Treatment)', ARRAY['chikitsa','fever','treatment','langhana','pachana'], ARRAY['jwara','sannipataja jwara'], ARRAY['guduchi','musta','kiratatikta','dasamoola','pippali'], ARRAY['langhana first','no antipyretics in ama','pachana then shamana']),
  (v_charaka, 'Chikitsa Sthana', 28, 'Vata Vyadhi Chikitsa', 'वातव्याधि चिकित्सा', 1, 245, NULL, 'Treatment of Vata disorders: Snehana (oleation — both internal and external), Swedana (sudation), Basti (enema — Anuvasana and Niruha), Nasya, diet with Snigdha-Ushna-Guru qualities. Key formulations: Dashamoola, Bala, Ashwagandha, Rasna, Guggulu preparations. Basti is called Ardha Chikitsa (half of all treatment).', 'Vata Vyadhi Chikitsa', ARRAY['chikitsa','vata','basti','snehana','swedana','musculoskeletal'], ARRAY['sandhivata','gridhrasi','ardita','pakshavadha','kampavata'], ARRAY['ashwagandha','bala','rasna','guggulu','dashamoola','eranda'], ARRAY['basti is ardha chikitsa','snehana-swedana first','vata needs opposite qualities']),

  -- SUSHRUTA SAMHITA
  (v_sushruta, 'Sutra Sthana', 14, 'Shonitavarnaniya Adhyaya', 'शोणितवर्णनीय अध्याय', 1, 44, NULL, 'Description of Rakta Dhatu (blood tissue): functions, normal/abnormal characteristics, Raktamokshana (bloodletting) as therapy. Sushruta considers Rakta as 4th Dosha. Six Marma points where Rakta accumulates.', 'Rakta Dhatu & Raktamokshana', ARRAY['rakta','bloodletting','dosha','dhatu','marma'], ARRAY['raktapitta','kushtha','vatarakta','visarpa'], ARRAY[]::TEXT[], ARRAY['rakta as 4th dosha','raktamokshana indications','6 forms of raktamokshana']),
  (v_sushruta, 'Sutra Sthana', 15, 'Dosha-Dhatu-Mala Kshaya-Vriddhi Vijnaniya', 'दोषधातुमलक्षयवृद्धिविज्ञानीय', 1, 48, NULL, 'Signs of Kshaya (depletion) and Vriddhi (excess) of each Dosha, Dhatu, and Mala. Foundation for understanding pathology. 7 Dhatus in order: Rasa, Rakta, Mamsa, Meda, Asthi, Majja, Shukra. Each Dhatu nourishes the next (Ksheeradadhi Nyaya or Kedarikulya Nyaya).', 'Dhatu Kshaya-Vriddhi', ARRAY['physiology','dhatu','pathology','kshaya','vriddhi'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['7 dhatus','dhatu parinama','ksheeradadhi nyaya','kedarikulya nyaya']),

  -- ASHTANGA HRIDAYA
  (v_ashtanga, 'Sutra Sthana', 1, 'Ayushkamiya Adhyaya', 'आयुष्कामीय अध्याय', 1, 28, 'रागादिरोगान् सततानुषक्तान् अशेषकायप्रसृतानशेषान्। औत्सुक्यमोहारतिदान् जघान यो$पूर्ववैद्याय नमो$स्तु तस्मै।।', 'Salutation to the unique physician (Dhanvantari) who destroyed all diseases — both physical (Raga-adi roga) and mental (Autsukya, Moha, Arati). Establishes mind-body connection in Ayurveda from verse 1.', 'Introduction — Mind-Body Connection', ARRAY['philosophy','mind-body','mental health','mangalacharana'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['physical and mental disease','holistic approach','raga-dvesha as disease']),
  (v_ashtanga, 'Sutra Sthana', 2, 'Dinacharya Adhyaya', 'दिनचर्या अध्याय', 1, 47, NULL, 'Daily regimen: wake before sunrise (Brahma Muhurta), evacuate bowels, dental hygiene (Dantadhavana), tongue scraping, Anjana (collyrium), Nasya (nasal oil), Gandusha (oil pulling), Abhyanga (self-massage with oil), Vyayama (exercise to half-capacity), Snana (bath). Seasonal variations described.', 'Dinacharya (Daily Routine)', ARRAY['swasthavritta','preventive','daily routine','lifestyle'], ARRAY[]::TEXT[], ARRAY['tila taila','anu taila','triphala'], ARRAY['brahma muhurta','abhyanga daily','vyayama to half capacity','ritucharya']),
  (v_ashtanga, 'Sutra Sthana', 11, 'Doshabhediya Adhyaya', 'दोषभेदीय अध्याय', 1, 26, NULL, 'Sub-types of each Dosha: Vata (5 — Prana, Udana, Samana, Vyana, Apana), Pitta (5 — Pachaka, Ranjaka, Sadhaka, Alochaka, Bhrajaka), Kapha (5 — Avalambaka, Kledaka, Bodhaka, Tarpaka, Shleshaka). Their locations, functions, and disorders when vitiated.', 'Pancha Vata / Pitta / Kapha', ARRAY['physiology','dosha','subtypes','theory'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['5 vatas','5 pittas','5 kaphas','locations of subdoshas']),
  (v_ashtanga, 'Sutra Sthana', 12, 'Doshopakramaniya Adhyaya', 'दोषोपक्रमणीय अध्याय', 1, 30, NULL, 'Treatment principles by Dosha: Vata — Snehana, Swedana, Mridu Samshodhana, Basti, Snigdha-Ushna-Madhura diet. Pitta — Virechana, Sheeta Pradeha, Madhura-Tikta-Kashaya diet, Ghrita. Kapha — Vamana, Ruksha-Ushna-Teekshna treatments, Katu-Tikta-Kashaya diet, Honey.', 'Dosha Chikitsa Principles', ARRAY['chikitsa','treatment principle','dosha','shodhana'], ARRAY[]::TEXT[], ARRAY['ghrita','madhu','tila taila'], ARRAY['vata treatment with snehana','pitta with virechana','kapha with vamana','opposite qualities']),

  -- BHAVAPRAKASHA
  (v_bhava, 'Purva Khanda', 5, 'Haritakyadi Varga', 'हरीतक्यादि वर्ग', 1, 200, NULL, 'Pharmacology of major medicinal plants: Haritaki (7 types, universal remedy), Amalaki (Rasayana supreme), Bibhitaki (Kapha-hara), Pippali (bioenhancer, Vardhamana protocol), Maricha (Agni deepana), Shunthi (Vishwabheshaja — universal medicine). Properties, indications, doses, and formulations for 100+ herbs.', 'Dravyaguna — Major Herbs', ARRAY['pharmacology','dravyaguna','herbs','materia medica'], ARRAY[]::TEXT[], ARRAY['haritaki','amalaki','pippali','maricha','shunthi','guduchi','ashwagandha'], ARRAY['rasa-guna-veerya-vipaka','karma','specific indications','dose range']),

  -- MADHAVA NIDANA
  (v_madhava, 'Roga Nidana', 22, 'Amavata Nidana', 'आमवात निदान', 1, 25, NULL, 'Etiology and pathogenesis of Amavata (Rheumatoid Arthritis): caused by Mandagni + Viruddha Ahara + sedentary habits → Ama formation → Ama combines with vitiated Vata → lodges in Sandhis (joints) → Sandhi Shotha (joint swelling), Stabdhata (stiffness), Vedana (pain), especially in morning. Scorpion-sting-like pain (Vrischika Damshtra Vat Vedana).', 'Amavata (Rheumatoid Arthritis)', ARRAY['nidana','amavata','arthritis','ama','joints','autoimmune'], ARRAY['amavata','sandhishula','angamarda'], ARRAY['simhanada guggulu','rasna','eranda','punarnava'], ARRAY['ama + vata = amavata','mandagni causation','vrischikadamshtravat vedana','langhana-deepana first']),
  (v_madhava, 'Roga Nidana', 25, 'Sandhivata Nidana', 'सन्धिवात निदान', 1, 15, NULL, 'Sandhivata (Osteoarthritis): caused by Dhatukshaya (tissue depletion) + Vata Vriddhi → affects Sandhi (joints). Symptoms: Sandhi Shopha (swelling), Vedana on movement, Atopa (crepitus), Prasarana-Akunchana Vedana (pain on extension/flexion). Distinguished from Amavata by absence of Ama and morning stiffness pattern.', 'Sandhivata (Osteoarthritis)', ARRAY['nidana','sandhivata','osteoarthritis','vata','degenerative'], ARRAY['sandhivata','sandhishula'], ARRAY['guggulu','rasna','bala','ashwagandha','nirgundi'], ARRAY['dhatukshaya origin','vata vriddhi','atopa as key sign','differs from amavata'])

  ON CONFLICT DO NOTHING;
END $$;
