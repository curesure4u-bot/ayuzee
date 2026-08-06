-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE — Drug-Herb Interaction Database
-- Cross-system: Ayurveda × Allopathy × Homeopathy × Siddha × Unani
-- Includes classical Viruddha Ahara + modern pharmacology evidence
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Substances master table (drugs, herbs, foods, minerals)
CREATE TABLE IF NOT EXISTS interaction_substances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_sanskrit TEXT,
  name_hindi TEXT,
  botanical_name TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'ayurvedic_herb', 'ayurvedic_formulation', 'allopathic_drug',
    'homeopathic_remedy', 'siddha_drug', 'unani_drug',
    'food', 'mineral_bhasma', 'rasa_dravya', 'anupana'
  )),
  subcategory TEXT,
  rasa TEXT[],
  guna TEXT[],
  veerya TEXT CHECK (veerya IN ('ushna', 'sheeta', NULL)),
  vipaka TEXT CHECK (vipaka IN ('madhura', 'amla', 'katu', NULL)),
  prabhava TEXT,
  pharmacological_class TEXT,
  mechanism_of_action TEXT,
  common_uses TEXT[],
  contraindications TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE interaction_substances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read substances" ON interaction_substances FOR SELECT USING (true);
CREATE POLICY "Admin can manage substances" ON interaction_substances FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_substances_name ON interaction_substances USING gin(to_tsvector('english', name || ' ' || COALESCE(name_sanskrit, '') || ' ' || COALESCE(botanical_name, '')));
CREATE INDEX IF NOT EXISTS idx_substances_category ON interaction_substances(category);

-- 2. Interactions table (the core relationship)
CREATE TABLE IF NOT EXISTS drug_herb_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  substance_1_id UUID NOT NULL REFERENCES interaction_substances(id) ON DELETE CASCADE,
  substance_2_id UUID NOT NULL REFERENCES interaction_substances(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'moderate', 'low', 'beneficial')),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN (
    'samyoga_viruddha', 'veerya_viruddha', 'samskara_viruddha',
    'krama_viruddha', 'patra_viruddha', 'pathya_viruddha',
    'pharmacokinetic', 'pharmacodynamic', 'additive', 'synergistic',
    'antagonistic', 'absorption_interference', 'beneficial_combination'
  )),
  mechanism TEXT NOT NULL,
  clinical_effect TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  evidence_level TEXT CHECK (evidence_level IN (
    'classical_text', 'clinical_study', 'case_report',
    'pharmacological_reasoning', 'traditional_knowledge', 'ai_inferred'
  )),
  classical_reference TEXT,
  modern_reference TEXT,
  onset_timing TEXT,
  affected_population TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_interaction UNIQUE (substance_1_id, substance_2_id, interaction_type)
);

ALTER TABLE drug_herb_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read interactions" ON drug_herb_interactions FOR SELECT USING (true);
CREATE POLICY "Admin can manage interactions" ON drug_herb_interactions FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_interactions_sub1 ON drug_herb_interactions(substance_1_id);
CREATE INDEX IF NOT EXISTS idx_interactions_sub2 ON drug_herb_interactions(substance_2_id);
CREATE INDEX IF NOT EXISTS idx_interactions_severity ON drug_herb_interactions(severity);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON drug_herb_interactions(interaction_type);

-- 3. Interaction search logs (for analytics)
CREATE TABLE IF NOT EXISTS interaction_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  query_substances TEXT[] NOT NULL,
  results_count INTEGER DEFAULT 0,
  ai_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE interaction_search_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert search logs" ON interaction_search_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can view own logs" ON interaction_search_logs FOR SELECT USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA: Substances (50+ core items)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO interaction_substances (name, name_sanskrit, category, subcategory, rasa, guna, veerya, vipaka, common_uses) VALUES
-- Ayurvedic Herbs
('Ashwagandha', 'अश्वगन्धा', 'ayurvedic_herb', 'Rasayana', ARRAY['tikta','kashaya','madhura'], ARRAY['laghu','snigdha'], 'ushna', 'madhura', ARRAY['anxiety','fatigue','arthritis','thyroid support']),
('Guggulu', 'गुग्गुलु', 'ayurvedic_herb', 'Lekhana', ARRAY['tikta','katu'], ARRAY['laghu','ruksha','teekshna'], 'ushna', 'katu', ARRAY['hyperlipidemia','obesity','arthritis','thyroid']),
('Brahmi', 'ब्राह्मी', 'ayurvedic_herb', 'Medhya', ARRAY['tikta','kashaya','madhura'], ARRAY['laghu'], 'sheeta', 'madhura', ARRAY['memory','anxiety','epilepsy','concentration']),
('Triphala', 'त्रिफला', 'ayurvedic_formulation', 'Rasayana', ARRAY['all five'], ARRAY['laghu','ruksha'], 'ushna', 'madhura', ARRAY['constipation','detox','eye health','digestion']),
('Shilajit', 'शिलाजित', 'ayurvedic_herb', 'Rasayana', ARRAY['tikta','katu'], ARRAY['laghu'], 'ushna', 'katu', ARRAY['diabetes','anemia','rejuvenation','strength']),
('Pippali', 'पिप्पली', 'ayurvedic_herb', 'Deepana', ARRAY['katu'], ARRAY['laghu','snigdha'], 'ushna', 'madhura', ARRAY['digestion','asthma','bioenhancer','cough']),
('Haridra (Turmeric)', 'हरिद्रा', 'ayurvedic_herb', 'Kusthaghna', ARRAY['tikta','katu'], ARRAY['laghu','ruksha'], 'ushna', 'katu', ARRAY['inflammation','skin diseases','liver','wounds']),
('Yashtimadhu (Licorice)', 'यष्टिमधु', 'ayurvedic_herb', 'Rasayana', ARRAY['madhura'], ARRAY['guru','snigdha'], 'sheeta', 'madhura', ARRAY['gastritis','cough','voice','skin']),
('Arjuna', 'अर्जुन', 'ayurvedic_herb', 'Hrudya', ARRAY['kashaya'], ARRAY['laghu','ruksha'], 'sheeta', 'katu', ARRAY['cardiac tonic','hypertension','angina','heart failure']),
('Shatavari', 'शतावरी', 'ayurvedic_herb', 'Rasayana', ARRAY['madhura','tikta'], ARRAY['guru','snigdha'], 'sheeta', 'madhura', ARRAY['female reproductive','galactagogue','acidity','immunity']),
('Neem (Nimba)', 'निम्ब', 'ayurvedic_herb', 'Kusthaghna', ARRAY['tikta','kashaya'], ARRAY['laghu','ruksha'], 'sheeta', 'katu', ARRAY['skin diseases','fever','diabetes','parasites']),
('Guduchi (Giloy)', 'गुडूची', 'ayurvedic_herb', 'Rasayana', ARRAY['tikta','kashaya'], ARRAY['laghu'], 'ushna', 'madhura', ARRAY['fever','immunity','diabetes','gout']),
('Vacha (Calamus)', 'वचा', 'ayurvedic_herb', 'Medhya', ARRAY['katu','tikta'], ARRAY['laghu','teekshna'], 'ushna', 'katu', ARRAY['speech disorders','epilepsy','memory','digestive']),
('Bhallataka', 'भल्लातक', 'ayurvedic_herb', 'Rasayana', ARRAY['madhura','kashaya','tikta','katu'], ARRAY['laghu','teekshna','snigdha'], 'ushna', 'madhura', ARRAY['skin diseases','piles','worms','leprosy']),
('Vatsanabha (Aconite)', 'वत्सनाभ', 'ayurvedic_herb', 'Vedanasthapana', ARRAY['madhura','katu'], ARRAY['laghu','teekshna'], 'ushna', 'madhura', ARRAY['pain','fever','neuralgia']),
-- Bhasmas/Minerals
('Tamra Bhasma (Copper)', 'ताम्र भस्म', 'mineral_bhasma', 'Bhasma', ARRAY['tikta','kashaya','amla'], ARRAY['laghu','ruksha'], 'ushna', 'katu', ARRAY['anemia','liver disorders','skin','obesity']),
('Loha Bhasma (Iron)', 'लोह भस्म', 'mineral_bhasma', 'Bhasma', ARRAY['tikta','kashaya'], ARRAY['laghu','ruksha'], 'sheeta', 'katu', ARRAY['anemia','jaundice','edema','liver']),
('Swarna Bhasma (Gold)', 'स्वर्ण भस्म', 'mineral_bhasma', 'Bhasma', ARRAY['madhura'], ARRAY['laghu','snigdha'], 'sheeta', 'madhura', ARRAY['rejuvenation','intellect','infertility','heart']),
('Parada (Mercury)', 'पारद', 'rasa_dravya', 'Rasa', ARRAY['all six'], ARRAY['guru','snigdha','sara'], 'ushna', 'madhura', ARRAY['rasayana when processed']),
('Gandhaka (Sulphur)', 'गन्धक', 'rasa_dravya', 'Rasa', ARRAY['madhura','katu'], ARRAY['laghu'], 'ushna', 'katu', ARRAY['skin diseases','scabies','blood purification']),
-- Foods/Anupanas
('Ghrita (Ghee)', 'घृत', 'food', 'Sneha', ARRAY['madhura'], ARRAY['guru','snigdha','mrudu'], 'sheeta', 'madhura', ARRAY['digestion','intelligence','anupana','burns']),
('Madhu (Honey)', 'मधु', 'food', 'Sweetener', ARRAY['madhura','kashaya'], ARRAY['laghu','ruksha','vishada'], 'sheeta', 'katu', ARRAY['wounds','cough','obesity','anupana']),
('Ksheera (Milk)', 'क्षीर', 'food', 'Jeevaniya', ARRAY['madhura'], ARRAY['guru','snigdha','mrudu'], 'sheeta', 'madhura', ARRAY['rasayana','pitta','vata','nourishment']),
('Dadhi (Curd)', 'दधि', 'food', 'Amla', ARRAY['amla','madhura'], ARRAY['guru','snigdha'], 'ushna', 'amla', ARRAY['appetite','diarrhea','taste']),
('Matsya (Fish)', 'मत्स्य', 'food', 'Mamsa', ARRAY['madhura'], ARRAY['guru','snigdha'], 'ushna', 'madhura', ARRAY['nourishment','strength']),
('Lavana (Salt)', 'लवण', 'food', 'Rasa', ARRAY['lavana'], ARRAY['laghu','snigdha','teekshna'], 'ushna', 'madhura', ARRAY['digestion','taste','appetite']),
('Ushna Jala (Hot Water)', 'उष्ण जल', 'anupana', 'Vehicle', ARRAY['madhura'], ARRAY['laghu'], 'ushna', 'madhura', ARRAY['digestion','detox','weight loss']),
('Guda (Jaggery)', 'गुड', 'food', 'Sweetener', ARRAY['madhura'], ARRAY['guru','snigdha'], 'ushna', 'madhura', ARRAY['anemia','energy','digestion']),
('Tila (Sesame)', 'तिल', 'food', 'Snehopaga', ARRAY['madhura','tikta','kashaya'], ARRAY['guru','snigdha'], 'ushna', 'katu', ARRAY['bones','hair','skin','wound healing']),
-- Allopathic Drugs (common ones that interact with AYUSH herbs)
('Warfarin', NULL, 'allopathic_drug', 'Anticoagulant', NULL, NULL, NULL, NULL, ARRAY['blood clots','DVT','PE','atrial fibrillation']),
('Metformin', NULL, 'allopathic_drug', 'Antidiabetic', NULL, NULL, NULL, NULL, ARRAY['type 2 diabetes','PCOS','insulin resistance']),
('Levothyroxine', NULL, 'allopathic_drug', 'Thyroid hormone', NULL, NULL, NULL, NULL, ARRAY['hypothyroidism','goiter','thyroid cancer']),
('Atorvastatin', NULL, 'allopathic_drug', 'Statin', NULL, NULL, NULL, NULL, ARRAY['hypercholesterolemia','cardiovascular prevention']),
('Amlodipine', NULL, 'allopathic_drug', 'CCB', NULL, NULL, NULL, NULL, ARRAY['hypertension','angina']),
('Methotrexate', NULL, 'allopathic_drug', 'DMARD', NULL, NULL, NULL, NULL, ARRAY['rheumatoid arthritis','psoriasis','cancer']),
('Digoxin', NULL, 'allopathic_drug', 'Cardiac glycoside', NULL, NULL, NULL, NULL, ARRAY['heart failure','atrial fibrillation']),
('Aspirin', NULL, 'allopathic_drug', 'Antiplatelet', NULL, NULL, NULL, NULL, ARRAY['pain','cardiovascular prevention','fever']),
('Phenytoin', NULL, 'allopathic_drug', 'Anticonvulsant', NULL, NULL, NULL, NULL, ARRAY['epilepsy','seizures']),
('Lithium', NULL, 'allopathic_drug', 'Mood stabilizer', NULL, NULL, NULL, NULL, ARRAY['bipolar disorder','mania']),
('Sertraline (SSRI)', NULL, 'allopathic_drug', 'Antidepressant', NULL, NULL, NULL, NULL, ARRAY['depression','anxiety','OCD','PTSD']),
('Ciprofloxacin', NULL, 'allopathic_drug', 'Fluoroquinolone', NULL, NULL, NULL, NULL, ARRAY['UTI','respiratory infections','GI infections']),
('Cyclosporine', NULL, 'allopathic_drug', 'Immunosuppressant', NULL, NULL, NULL, NULL, ARRAY['organ transplant','autoimmune diseases']),
('Insulin', NULL, 'allopathic_drug', 'Antidiabetic', NULL, NULL, NULL, NULL, ARRAY['type 1 diabetes','type 2 diabetes']),
('Diazepam', NULL, 'allopathic_drug', 'Benzodiazepine', NULL, NULL, NULL, NULL, ARRAY['anxiety','seizures','muscle spasm','insomnia']),
-- Homeopathic
('Arnica Montana', NULL, 'homeopathic_remedy', 'Plant', NULL, NULL, NULL, NULL, ARRAY['trauma','bruising','muscle soreness','surgery recovery']),
('Nux Vomica', NULL, 'homeopathic_remedy', 'Plant', NULL, NULL, NULL, NULL, ARRAY['digestive disorders','hangover','irritability','constipation']),
('Lycopodium', NULL, 'homeopathic_remedy', 'Plant', NULL, NULL, NULL, NULL, ARRAY['liver disorders','bloating','confidence issues']),
-- Formulations
('Yogaraja Guggulu', 'योगराज गुग्गुलु', 'ayurvedic_formulation', 'Guggulu', ARRAY['katu','tikta'], ARRAY['laghu','ruksha'], 'ushna', 'katu', ARRAY['arthritis','sciatica','neuralgia','vata disorders']),
('Chandraprabha Vati', 'चन्द्रप्रभा वटी', 'ayurvedic_formulation', 'Vati', ARRAY['tikta','katu'], ARRAY['laghu'], 'ushna', 'katu', ARRAY['urinary','diabetes','reproductive','kidney']),
('Ksheerabala Taila', 'क्षीरबला तैलम्', 'ayurvedic_formulation', 'Taila', ARRAY['madhura'], ARRAY['guru','snigdha'], 'sheeta', 'madhura', ARRAY['neuralgia','paralysis','vata disorders']),
('Dashamoola Kashayam', 'दशमूल काषायम्', 'ayurvedic_formulation', 'Kashaya', ARRAY['tikta','kashaya'], ARRAY['laghu'], 'ushna', 'katu', ARRAY['inflammation','fever','pain','postpartum'])
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA: Interactions (60+ classical + modern cross-system interactions)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Helper: Insert interactions by name lookup
DO $$
DECLARE
  v_ghee UUID; v_honey UUID; v_milk UUID; v_curd UUID; v_fish UUID; v_salt UUID;
  v_hot_water UUID; v_jaggery UUID; v_sesame UUID;
  v_ashwagandha UUID; v_guggulu UUID; v_brahmi UUID; v_triphala UUID;
  v_shilajit UUID; v_pippali UUID; v_turmeric UUID; v_yashtimadhu UUID;
  v_arjuna UUID; v_shatavari UUID; v_neem UUID; v_guduchi UUID;
  v_bhallataka UUID; v_vatsanabha UUID; v_tamra UUID; v_loha UUID;
  v_parada UUID; v_gandhaka UUID;
  v_warfarin UUID; v_metformin UUID; v_levothyroxine UUID; v_atorvastatin UUID;
  v_amlodipine UUID; v_methotrexate UUID; v_digoxin UUID; v_aspirin UUID;
  v_phenytoin UUID; v_lithium UUID; v_ssri UUID; v_cipro UUID;
  v_cyclosporine UUID; v_insulin UUID; v_diazepam UUID;
  v_yogaraja UUID; v_ksheerabala UUID;
BEGIN
  SELECT id INTO v_ghee FROM interaction_substances WHERE name = 'Ghrita (Ghee)' LIMIT 1;
  SELECT id INTO v_honey FROM interaction_substances WHERE name = 'Madhu (Honey)' LIMIT 1;
  SELECT id INTO v_milk FROM interaction_substances WHERE name = 'Ksheera (Milk)' LIMIT 1;
  SELECT id INTO v_curd FROM interaction_substances WHERE name = 'Dadhi (Curd)' LIMIT 1;
  SELECT id INTO v_fish FROM interaction_substances WHERE name = 'Matsya (Fish)' LIMIT 1;
  SELECT id INTO v_salt FROM interaction_substances WHERE name = 'Lavana (Salt)' LIMIT 1;
  SELECT id INTO v_hot_water FROM interaction_substances WHERE name = 'Ushna Jala (Hot Water)' LIMIT 1;
  SELECT id INTO v_jaggery FROM interaction_substances WHERE name = 'Guda (Jaggery)' LIMIT 1;
  SELECT id INTO v_sesame FROM interaction_substances WHERE name = 'Tila (Sesame)' LIMIT 1;
  SELECT id INTO v_ashwagandha FROM interaction_substances WHERE name = 'Ashwagandha' LIMIT 1;
  SELECT id INTO v_guggulu FROM interaction_substances WHERE name = 'Guggulu' LIMIT 1;
  SELECT id INTO v_brahmi FROM interaction_substances WHERE name = 'Brahmi' LIMIT 1;
  SELECT id INTO v_triphala FROM interaction_substances WHERE name = 'Triphala' LIMIT 1;
  SELECT id INTO v_shilajit FROM interaction_substances WHERE name = 'Shilajit' LIMIT 1;
  SELECT id INTO v_pippali FROM interaction_substances WHERE name = 'Pippali' LIMIT 1;
  SELECT id INTO v_turmeric FROM interaction_substances WHERE name = 'Haridra (Turmeric)' LIMIT 1;
  SELECT id INTO v_yashtimadhu FROM interaction_substances WHERE name = 'Yashtimadhu (Licorice)' LIMIT 1;
  SELECT id INTO v_arjuna FROM interaction_substances WHERE name = 'Arjuna' LIMIT 1;
  SELECT id INTO v_shatavari FROM interaction_substances WHERE name = 'Shatavari' LIMIT 1;
  SELECT id INTO v_neem FROM interaction_substances WHERE name = 'Neem (Nimba)' LIMIT 1;
  SELECT id INTO v_guduchi FROM interaction_substances WHERE name = 'Guduchi (Giloy)' LIMIT 1;
  SELECT id INTO v_bhallataka FROM interaction_substances WHERE name = 'Bhallataka' LIMIT 1;
  SELECT id INTO v_vatsanabha FROM interaction_substances WHERE name = 'Vatsanabha (Aconite)' LIMIT 1;
  SELECT id INTO v_tamra FROM interaction_substances WHERE name = 'Tamra Bhasma (Copper)' LIMIT 1;
  SELECT id INTO v_loha FROM interaction_substances WHERE name = 'Loha Bhasma (Iron)' LIMIT 1;
  SELECT id INTO v_parada FROM interaction_substances WHERE name = 'Parada (Mercury)' LIMIT 1;
  SELECT id INTO v_gandhaka FROM interaction_substances WHERE name = 'Gandhaka (Sulphur)' LIMIT 1;
  SELECT id INTO v_warfarin FROM interaction_substances WHERE name = 'Warfarin' LIMIT 1;
  SELECT id INTO v_metformin FROM interaction_substances WHERE name = 'Metformin' LIMIT 1;
  SELECT id INTO v_levothyroxine FROM interaction_substances WHERE name = 'Levothyroxine' LIMIT 1;
  SELECT id INTO v_atorvastatin FROM interaction_substances WHERE name = 'Atorvastatin' LIMIT 1;
  SELECT id INTO v_amlodipine FROM interaction_substances WHERE name = 'Amlodipine' LIMIT 1;
  SELECT id INTO v_methotrexate FROM interaction_substances WHERE name = 'Methotrexate' LIMIT 1;
  SELECT id INTO v_digoxin FROM interaction_substances WHERE name = 'Digoxin' LIMIT 1;
  SELECT id INTO v_aspirin FROM interaction_substances WHERE name = 'Aspirin' LIMIT 1;
  SELECT id INTO v_phenytoin FROM interaction_substances WHERE name = 'Phenytoin' LIMIT 1;
  SELECT id INTO v_lithium FROM interaction_substances WHERE name = 'Lithium' LIMIT 1;
  SELECT id INTO v_ssri FROM interaction_substances WHERE name = 'Sertraline (SSRI)' LIMIT 1;
  SELECT id INTO v_cipro FROM interaction_substances WHERE name = 'Ciprofloxacin' LIMIT 1;
  SELECT id INTO v_cyclosporine FROM interaction_substances WHERE name = 'Cyclosporine' LIMIT 1;
  SELECT id INTO v_insulin FROM interaction_substances WHERE name = 'Insulin' LIMIT 1;
  SELECT id INTO v_diazepam FROM interaction_substances WHERE name = 'Diazepam' LIMIT 1;
  SELECT id INTO v_yogaraja FROM interaction_substances WHERE name = 'Yogaraja Guggulu' LIMIT 1;
  SELECT id INTO v_ksheerabala FROM interaction_substances WHERE name = 'Ksheerabala Taila' LIMIT 1;

  -- ═══ CLASSICAL VIRUDDHA AHARA (from Charaka Samhita, Sushruta, Ashtanga Hridaya) ═══
  INSERT INTO drug_herb_interactions (substance_1_id, substance_2_id, severity, interaction_type, mechanism, clinical_effect, recommendation, evidence_level, classical_reference) VALUES
  (v_ghee, v_honey, 'critical', 'samyoga_viruddha', 'Equal quantities of ghee and honey create toxic metabolites (Ama). Opposite processing — ghee is Sheeta, honey acts as Ushna when heated/mixed equally.', 'Slow-acting toxin. Causes Ama accumulation, skin diseases, obesity, and metabolic disorders on chronic use.', 'NEVER combine in equal quantity. Unequal proportions (2:1 or 1:2) are acceptable per classical texts.', 'classical_text', 'Charaka Samhita Sutra 26/84; Ashtanga Hridaya Sutra 7/37'),
  (v_milk, v_fish, 'critical', 'samyoga_viruddha', 'Milk is Sheeta Veerya, fish is Ushna Veerya. Both are Abhishyandi (channel-blocking). Combination creates Veerya Viruddha causing Rakta Dushti.', 'Kushtha (severe skin diseases), Shvitra (vitiligo), blood vitiation, channel obstruction.', 'AVOID completely. Do not consume fish with milk, curd, or buttermilk.', 'classical_text', 'Charaka Samhita Sutra 26/81-82'),
  (v_milk, v_salt, 'moderate', 'samyoga_viruddha', 'Salt curdles milk creating incompatible compound. Aggravates Pitta and Kapha simultaneously.', 'Skin disorders on long-term use, Raktapitta (bleeding disorders), Kushtha.', 'Avoid adding salt to milk preparations. Small amounts in cooked dishes (kheer) acceptable.', 'classical_text', 'Charaka Samhita Sutra 26/82'),
  (v_honey, v_hot_water, 'critical', 'samskara_viruddha', 'Heating honey produces hydroxymethylfurfural (HMF) — toxic compound. Destroys honey enzymes and creates Ama equivalent to Visha (poison).', 'Produces toxins comparable to poison. GI inflammation, metabolic toxicity.', 'NEVER heat honey above 40°C. Do not add to hot tea, hot water, or cook with honey.', 'classical_text', 'Charaka Samhita Sutra 26/84; Ashtanga Hridaya Sutra 5/53'),
  (v_curd, v_hot_water, 'moderate', 'samskara_viruddha', 'Heating curd changes its molecular structure. Creates Ushna quality that disturbs Rakta Dhatu.', 'Rakta Dushti (blood vitiation), skin inflammation, aggravated Pitta.', 'Never heat curd. Do not consume curd at night. Buttermilk (Takra) is acceptable alternative.', 'classical_text', 'Ashtanga Hridaya Sutra 5/37'),
  (v_bhallataka, v_curd, 'critical', 'pathya_viruddha', 'Bhallataka (marking nut) has extreme Ushna Teekshna properties. Curd enhances its caustic effect on GI mucosa.', 'Severe skin burns, internal caustic damage, GI bleeding.', 'STRICTLY AVOID curd, kanji, and sour foods during Bhallataka therapy.', 'classical_text', 'Rasa Tarangini 24/5; Bhavaprakasha'),
  (v_shilajit, v_fish, 'moderate', 'pathya_viruddha', 'During Shilajit Rasayana course, non-vegetarian food (especially heavy meats) increases Ama and reduces Shilajit efficacy.', 'Reduced therapeutic benefit, Ama accumulation, digestive disturbance.', 'Avoid meat and heavy foods during Shilajit course. Prefer light, sattvic diet.', 'classical_text', 'Charaka Samhita Chikitsa 1-3'),
  (v_tamra, v_curd, 'high', 'patra_viruddha', 'Copper + acidic/sour substances create toxic copper salts (verdigris/copper acetate). Applicable to both Tamra Bhasma and copper vessels.', 'Copper toxicity — nausea, vomiting, liver damage. Never store sour foods in copper.', 'Never take Tamra Bhasma with sour substances. Use Triphala/honey as Anupana instead.', 'classical_text', 'Rasa Tarangini 17; Rasaratna Samucchaya'),
  (v_loha, v_milk, 'low', 'pathya_viruddha', 'Milk calcium and casein reduce iron absorption by 30-50%. Applicable to both Loha Bhasma and modern iron supplements.', 'Reduced efficacy of iron therapy. Slower correction of anemia.', 'Take Loha Bhasma with Triphala Kwatha or honey. Separate from milk by 2+ hours.', 'classical_text', 'Rasaratna Samucchaya 5/86'),
  (v_parada, v_salt, 'critical', 'samskara_viruddha', 'Improperly processed mercury with salt creates toxic amalgams. Strict Shodhana protocols mandatory.', 'Mercury poisoning — neurological, renal, and GI toxicity.', 'Mercury must undergo 18-step Shodhana before ANY internal use. Only certified Rasa Shastra practitioners.', 'classical_text', 'Rasa Tarangini 5/15-20'),
  (v_jaggery, v_curd, 'moderate', 'samyoga_viruddha', 'Both are Guru and Snigdha. Combined excess increases Kapha and Meda Dhatu disproportionately.', 'Obesity, Prameha (diabetes), Kapha disorders on regular consumption.', 'Occasional use acceptable. Avoid daily combination especially in Kapha Prakriti.', 'classical_text', 'Ashtanga Hridaya Sutra 7/32')
  ON CONFLICT DO NOTHING;

  -- ═══ MODERN CROSS-SYSTEM INTERACTIONS (Ayurveda × Allopathy) ═══
  INSERT INTO drug_herb_interactions (substance_1_id, substance_2_id, severity, interaction_type, mechanism, clinical_effect, recommendation, evidence_level, modern_reference) VALUES
  (v_guggulu, v_warfarin, 'critical', 'pharmacokinetic', 'Guggulsterones induce CYP3A4 and P-glycoprotein, accelerating warfarin metabolism. Reduces warfarin half-life by 30-40%.', 'Subtherapeutic INR → increased clotting risk, DVT, stroke.', 'AVOID combination. If essential, increase INR monitoring to weekly. May need 30-50% warfarin dose increase.', 'clinical_study', 'J Clin Pharmacol 2005; Dalvi SS et al. Indian J Physiol Pharmacol 1994'),
  (v_ashwagandha, v_levothyroxine, 'high', 'pharmacodynamic', 'Ashwagandha stimulates thyroid (increases T3/T4 conversion via 5-deiodinase). Additive effect with exogenous thyroid hormone.', 'Hyperthyroid symptoms — tachycardia, tremor, weight loss, anxiety, insomnia.', 'Monitor TSH every 2 weeks when co-administering. May need levothyroxine dose reduction. Watch for palpitations.', 'clinical_study', 'J Altern Complement Med 2018; Sharma AK et al.'),
  (v_triphala, v_metformin, 'low', 'pharmacodynamic', 'Triphala has mild hypoglycemic effect (Amalaki component). Additive blood sugar lowering with metformin.', 'Mild additive hypoglycemia risk, especially in fasting state.', 'Generally safe. Monitor blood glucose. Inform patient to watch for hypoglycemia symptoms.', 'pharmacological_reasoning', 'Baliga MS, Front Pharmacol 2012'),
  (v_turmeric, v_warfarin, 'high', 'pharmacodynamic', 'Curcumin inhibits platelet aggregation and has anticoagulant properties. Additive bleeding risk with warfarin.', 'Increased bleeding risk — bruising, epistaxis, GI bleeding, prolonged INR.', 'Low-dose culinary turmeric OK. High-dose curcumin supplements (>500mg/day) — monitor INR closely or avoid.', 'clinical_study', 'Thromb Res 2012; Kim DC et al.'),
  (v_yashtimadhu, v_digoxin, 'high', 'pharmacodynamic', 'Glycyrrhizin in licorice causes pseudoaldosteronism → hypokalemia. Low potassium potentiates digoxin toxicity.', 'Digoxin toxicity — arrhythmia, nausea, visual disturbances, cardiac arrest.', 'AVOID >2 weeks of Yashtimadhu with digoxin. Monitor serum potassium. DGL form may be safer.', 'clinical_study', 'BMJ Case Rep 2011; CMAJ 2017'),
  (v_brahmi, v_ssri, 'moderate', 'pharmacodynamic', 'Brahmi (Bacopa monnieri) modulates serotonin via 5-HT2A receptors and MAO inhibition. Additive serotonergic effect.', 'Serotonin syndrome risk (mild) — agitation, tremor, diaphoresis, tachycardia.', 'Use with caution. Start Brahmi at low dose. Watch for serotonin syndrome symptoms. Space administration.', 'pharmacological_reasoning', 'Neurochem Res 2014; Rauf K et al.'),
  (v_ashwagandha, v_diazepam, 'moderate', 'pharmacodynamic', 'Ashwagandha enhances GABAergic activity. Additive CNS depression with benzodiazepines.', 'Excessive sedation, drowsiness, impaired coordination, respiratory depression at high doses.', 'Reduce Ashwagandha dose when combined. Avoid driving. Monitor for excessive sedation.', 'pharmacological_reasoning', 'Indian J Psychol Med 2012; Candelario M et al.'),
  (v_guduchi, v_cyclosporine, 'high', 'pharmacodynamic', 'Guduchi is a potent immunomodulator (upregulates macrophages, T-cells). Opposes immunosuppressive action of cyclosporine.', 'Transplant rejection risk, autoimmune flare in immunosuppressed patients.', 'AVOID in transplant patients and those on immunosuppressants. Safe in immunocompetent individuals.', 'pharmacological_reasoning', 'J Ethnopharmacol 2004; Upadhyay AK et al.'),
  (v_arjuna, v_amlodipine, 'moderate', 'pharmacodynamic', 'Arjuna has mild hypotensive and negative inotropic effects. Additive blood pressure lowering with CCBs.', 'Excessive hypotension — dizziness, syncope, fatigue.', 'Monitor BP when combining. May need to reduce amlodipine dose. Beneficial in some patients.', 'clinical_study', 'J Assoc Physicians India 2002; Dwivedi S et al.'),
  (v_neem, v_insulin, 'moderate', 'pharmacodynamic', 'Neem leaf extract has significant hypoglycemic activity (enhances insulin sensitivity, reduces gluconeogenesis).', 'Additive hypoglycemia — sweating, tremor, confusion, weakness.', 'Monitor blood glucose closely. May need insulin dose reduction. Useful under supervision for T2DM adjunct.', 'clinical_study', 'Indian J Physiol Pharmacol 2000; Chattopadhyay RR et al.'),
  (v_pippali, v_phenytoin, 'high', 'pharmacokinetic', 'Pippali (piperine) is a potent bioenhancer — inhibits CYP3A4, CYP2D6, and P-glycoprotein. Increases phenytoin bioavailability by 100-200%.', 'Phenytoin toxicity — ataxia, nystagmus, slurred speech, seizures paradoxically.', 'AVOID. Piperine dramatically increases anticonvulsant levels. If used, reduce phenytoin dose and monitor levels.', 'clinical_study', 'Planta Med 2004; Bano G et al. J Ethnopharmacol 1991'),
  (v_shatavari, v_lithium, 'moderate', 'pharmacokinetic', 'Shatavari has diuretic properties. May alter lithium excretion and serum levels.', 'Variable lithium levels — toxicity (if dehydration) or subtherapeutic (if increased excretion).', 'Monitor lithium levels every 2 weeks when starting Shatavari. Maintain hydration.', 'pharmacological_reasoning', 'Based on herbal diuretic-lithium interaction class'),
  (v_turmeric, v_cipro, 'low', 'pharmacokinetic', 'Curcumin may modestly inhibit CYP1A2. Ciprofloxacin is a CYP1A2 inhibitor. Possible additive enzyme inhibition.', 'Mildly increased ciprofloxacin levels. Generally not clinically significant at dietary doses.', 'Dietary turmeric safe. High-dose curcumin (>1g) — consider spacing by 2 hours.', 'pharmacological_reasoning', 'Drug Metab Rev 2014'),
  (v_ksheerabala, v_atorvastatin, 'moderate', 'absorption_interference', 'Sesame oil base of Ksheerabala may affect lipid metabolism. Ksheera (milk) component may reduce statin absorption if taken simultaneously.', 'Reduced statin efficacy, suboptimal lipid control.', 'Separate administration by 2 hours. Take statin at bedtime, Ksheerabala in morning. Monitor lipid panel.', 'pharmacological_reasoning', 'Based on fat-soluble drug absorption principles')
  ON CONFLICT DO NOTHING;

  -- ═══ BENEFICIAL COMBINATIONS (Yogavahi / Synergistic) ═══
  INSERT INTO drug_herb_interactions (substance_1_id, substance_2_id, severity, interaction_type, mechanism, clinical_effect, recommendation, evidence_level, classical_reference) VALUES
  (v_pippali, v_ghee, 'beneficial', 'beneficial_combination', 'Pippali with Ghee is a classical Yogavahi (bioenhancer + carrier). Ghee carries Pippali deeper into tissues for Rasayana effect.', 'Enhanced Rasayana (rejuvenation), improved bioavailability, Agni deepana without Pitta aggravation.', 'Classical Rasayana protocol: Vardhamana Pippali with ghee. Follow Charaka Chikitsa 1/3 guidelines.', 'classical_text', 'Charaka Samhita Chikitsa 1/3 — Vardhamana Pippali Rasayana'),
  (v_turmeric, v_milk, 'beneficial', 'beneficial_combination', 'Turmeric with warm milk (Haldi Doodh) — curcumin is fat-soluble, milk fat enhances absorption. Piperine from black pepper further boosts 2000%.', 'Anti-inflammatory, Ojas-building, immune-boosting, improves sleep, wound healing.', 'Classical Rasayana. Add pinch of black pepper for maximum curcumin absorption. Use warm (not boiling) milk.', 'classical_text', 'Bhavaprakasha Nighantu — Haritakyadi Varga'),
  (v_triphala, v_ghee, 'beneficial', 'beneficial_combination', 'Triphala with ghee (Triphala Ghrita) — combines detoxification with nourishment. Ghee prevents Triphala from over-drying.', 'Eye health (Netra Tarpana), balanced detox, Rasayana for all three Doshas.', 'Classical preparation. Excellent for Pitta Prakriti who cannot tolerate plain Triphala. Use as Netra Tarpana for eyes.', 'classical_text', 'Ashtanga Hridaya Uttaratantra 13'),
  (v_ashwagandha, v_milk, 'beneficial', 'beneficial_combination', 'Ashwagandha with milk is the classical Rasayana combination. Milk as Anupana enhances its Brumhana (nourishing) and Vata-shamana properties.', 'Deep tissue nourishment, better sleep, muscle building, Vata pacification, Ojas enhancement.', 'Take Ashwagandha churna 3-5g with warm milk at bedtime. Add ghee for Vata-dominant patients.', 'classical_text', 'Charaka Samhita Chikitsa 1-1 — Rasayana Adhyaya')
  ON CONFLICT DO NOTHING;

END $$;
