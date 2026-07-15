// Shared ASTG static seed data. This mirrors the astg_* DB schema and is used
// by the reference + detail pages until admin tooling populates the tables.

export type Medicine = {
  dosha?: string;
  name: string;
  formulation?: string;
  dose?: string;
  anupana?: string;
  duration?: string;
  notes?: string;
  isCommon?: boolean;
};

export type TreatmentLevel = {
  level: number;
  label: string;
  facility: string;
  description?: string;
  panchakarma?: string;
  medicines: Medicine[];
};

export type Disease = {
  ch: number;
  key: string;
  name: string;
  modern: string;
  definition?: string;
  nidana?: string;
  lakshana?: string[];
  diagnostic?: string;
  pathya?: string;
  apathya?: string;
  prognosis?: string;
  references?: string;
  levels?: TreatmentLevel[];
  guidelineYear?: number;
};

export type Category = {
  key: string;
  icon: string;
  name: string;
  sanskrit: string;
  modern: string;
  diseases: Disease[];
  guidelineYear?: number;
  sourceNote?: string;
};

// ---------------------------------------------------------------------------
// Protocol bank — one entry per disease keyed by URL slug.
// Content is a working clinical summary drawn from the Ministry of AYUSH
// Ayurvedic Standard Treatment Guidelines (2017 edition).
// ---------------------------------------------------------------------------

const L1 = (facility: string, description: string, medicines: Medicine[], panchakarma?: string): TreatmentLevel =>
  ({ level: 1, label: "Level 1", facility, description, panchakarma, medicines });
const L2 = (facility: string, description: string, medicines: Medicine[], panchakarma?: string): TreatmentLevel =>
  ({ level: 2, label: "Level 2", facility, description, panchakarma, medicines });
const L3 = (facility: string, description: string, medicines: Medicine[], panchakarma?: string): TreatmentLevel =>
  ({ level: 3, label: "Level 3", facility, description, panchakarma, medicines });

const PROTOCOLS: Record<string, Partial<Disease>> = {
  kasa: {
    definition: "Kasa is a Pranavaha Srotas disorder presenting as cough with or without expectoration; correlates with Cough of varied aetiology.",
    nidana: "Sheeta-Ruksha ahara, Dhuma-Rajas sevana, suppression of natural urges, excess talking, cold exposure, viral URTI.",
    lakshana: ["Dry cough (Vataja)", "Yellow/green sputum with burning (Pittaja)", "Thick white sputum, chest heaviness (Kaphaja)", "Hoarseness, chest pain"],
    diagnostic: "Clinical history, CBC/ESR, Chest X-ray, sputum AFB when chronic, PFT if wheeze suspected.",
    pathya: "Ushna jala, Purana shali, Yava, Mudga yusha, Ardraka, Madhu, Draksha, warm environment.",
    apathya: "Sheeta jala, Dadhi at night, Kadali, oily-fried food, cold exposure, dhuma, excess talking.",
    prognosis: "Sukha-sadhya in early stage; Krichra-sadhya when chronic (>8 weeks) or with underlying pathology.",
    references: "AYUSH ASTG 2017 — Chapter 1.",
    levels: [
      L1("PHC / Dispensary", "Shamana with churnas + avaleha; hydration and steam inhalation.", [
        { name: "Sitopaladi Churna", formulation: "Churna", dose: "3-6 g BD", anupana: "Madhu", duration: "4 weeks", isCommon: true },
        { name: "Talisadi Churna", formulation: "Churna", dose: "3 g BD", anupana: "Madhu", duration: "4 weeks", isCommon: true },
        { name: "Vasavaleha", formulation: "Avaleha", dose: "6-12 g BD", anupana: "Ushna jala", duration: "4 weeks" },
        { dosha: "Vataja", name: "Dashamula Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "4 weeks" },
        { dosha: "Kaphaja", name: "Trikatu Churna", formulation: "Churna", dose: "1-3 g BD", anupana: "Madhu", duration: "4 weeks" },
        { dosha: "Pittaja", name: "Drakshasava", formulation: "Asava", dose: "20 ml BD post-meal", anupana: "Equal water", duration: "4 weeks" },
      ]),
      L2("CHC", "Add Rasaushadhi for productive/persistent cough.", [
        { name: "Shringyadi Churna", formulation: "Churna", dose: "3 g BD", anupana: "Madhu", duration: "4 weeks" },
        { name: "Kanakasava", formulation: "Asava", dose: "20 ml BD", anupana: "Equal water", duration: "4 weeks" },
        { name: "Khadiradi Vati", formulation: "Vati", dose: "2 tabs QID", anupana: "Chewing", duration: "4 weeks" },
      ]),
      L3("District Hospital", "Panchakarma for chronic Kapha-pradhana Kasa.", [
        { name: "Chyavanaprasha", formulation: "Avaleha", dose: "10 g OD AM", anupana: "Warm milk", duration: "8 weeks (Rasayana)" },
        { name: "Agastya Haritaki", formulation: "Avaleha", dose: "10 g HS", anupana: "Ushna jala", duration: "4 weeks" },
      ], "Vamana (Kaphaja), Nasya with Anu Taila × 7 days, Dhoomapana with Haridra-Guggulu."),
    ],
  },

  "tamaka-swasa": {
    definition: "Tamaka Swasa is a Vata-Kaphaja disorder marked by recurrent paroxysmal dyspnoea with wheezing, cough and chest tightness; equivalent to Bronchial Asthma.",
    nidana: "Exposure to cold/dust/smoke, Guru-Abhishyandi ahara, Sheeta jala snana, Rajas-Dhuma sevana, allergens, viral infection, exertion, atopy.",
    lakshana: [
      "Shwasa kruchrata (difficulty in breathing)",
      "Ghurghuruka (wheezing)",
      "Kasa with shleshma nishtheevana",
      "Aaseena labhate saukhyam (relief in sitting posture)",
      "Lalata sweda, mukha shosha",
    ],
    diagnostic: "Episodic wheeze + dyspnoea, reversibility on bronchodilator (PEFR ≥12%/200 mL on spirometry), nocturnal cough, atopy history.",
    pathya: "Ushna jala, Yava, Purana shali, Mudga yusha, Patola, Karkati, Draksha, Dadima, Madhu, Ardraka.",
    apathya: "Sheeta jala, Dadhi, Matsya, Masha, Pishtanna, Guru-Abhishyandi ahara, Dhuma, Rajas, Diwaswapna.",
    prognosis: "Sukha-sadhya in early stage; Krichra-sadhya when chronic; Yapya when recurrent with cor pulmonale.",
    references: "AYUSH ASTG 2017 — Chapter 2.",
    levels: [
      L1("PHC / Dispensary", "Symptomatic relief, lifestyle counselling, Shamana therapy.", [
        { name: "Sitopaladi Churna", formulation: "Churna", dose: "3 g BD", anupana: "Madhu", duration: "14 days", isCommon: true },
        { name: "Vasavaleha", formulation: "Avaleha", dose: "10 g BD", anupana: "Ushna jala", duration: "14 days" },
        { name: "Kanakasava", formulation: "Asava", dose: "15 ml BD post-meal", anupana: "Equal water", duration: "14 days" },
      ]),
      L2("CHC", "Add Rasaushadhi for refractory cases.", [
        { dosha: "Vata-Kapha", name: "Shwasa Kuthara Rasa", formulation: "Vati", dose: "125 mg BD", anupana: "Ardraka swarasa + Madhu", duration: "21 days" },
        { name: "Bharangyadi Kashaya", formulation: "Kashaya", dose: "15 ml BD before meals", anupana: "Equal water", duration: "21 days" },
        { name: "Talisadi Churna", formulation: "Churna", dose: "3 g TDS", anupana: "Madhu", duration: "21 days" },
      ], "Vamana in Kapha-pradhana, Virechana in Pitta-anubandha."),
      L3("District / Specialty Hospital", "Specialist Panchakarma + Rasayana for steroid-dependent cases.", [
        { name: "Chyavanaprasha", formulation: "Avaleha", dose: "10 g OD AM", anupana: "Warm milk", duration: "3 months (Rasayana)" },
        { name: "Agastya Haritaki Avaleha", formulation: "Avaleha", dose: "10 g HS", anupana: "Ushna jala", duration: "1 month" },
        { name: "Swasahara Lauha", formulation: "Lauha", dose: "125 mg BD", anupana: "Madhu + Ghrita", duration: "30 days" },
      ], "Vamana → Virechana → Shamana → Rasayana (Chyavanaprasha, Agastya Haritaki)."),
    ],
  },

  amlapitta: {
    definition: "Amlapitta is a Pitta-pradhana Annavaha Srotas disorder with sour-belching, retrosternal burning and dyspepsia; correlates with GERD / Hyperacidity.",
    nidana: "Viruddha-Adhyashana, Vidahi-Amla-Katu-Lavana rasa, alcohol, stress, Ushna-Tikshna ahara, irregular meals, NSAID abuse.",
    lakshana: ["Amlodgara (sour eructation)", "Hrit-Kantha daha (retrosternal burning)", "Utklesha, Chhardi", "Avipaka, Aruchi", "Shirashula, Klama"],
    diagnostic: "Clinical; Upper GI endoscopy if alarm features; H. pylori test in refractory cases.",
    pathya: "Purana shali, Godhuma, Mudga yusha, Yava, Karkati, Nariyala jala, Amalaki, cool water, timely meals.",
    apathya: "Amla-Lavana-Katu rasa, coffee, alcohol, spicy-fried food, curd at night, late-night meals, stress.",
    prognosis: "Sukha-sadhya with regimen; Krichra-sadhya when chronic with erosive changes.",
    references: "AYUSH ASTG 2017 — Chapter 3.",
    levels: [
      L1("PHC", "Deepana-Pachana with Pitta-shamana churnas.", [
        { name: "Avipattikara Churna", formulation: "Churna", dose: "3-6 g HS", anupana: "Ushna jala", duration: "4 weeks", isCommon: true },
        { name: "Kamadudha Rasa", formulation: "Rasa", dose: "250 mg BD", anupana: "Milk", duration: "4 weeks", isCommon: true },
        { name: "Shatavari Churna", formulation: "Churna", dose: "3 g BD", anupana: "Milk", duration: "4 weeks" },
      ]),
      L2("CHC", "Add Rasaushadhi for erosive / persistent disease.", [
        { name: "Sutashekhara Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Madhu", duration: "4 weeks" },
        { name: "Praval Panchamrit", formulation: "Bhasma", dose: "250 mg BD", anupana: "Milk", duration: "4 weeks" },
        { name: "Yashtimadhu Churna", formulation: "Churna", dose: "3 g BD", anupana: "Milk", duration: "4 weeks" },
      ]),
      L3("District Hospital", "Shodhana for chronic Urdhwaga Amlapitta.", [
        { name: "Tiktaka Ghrita", formulation: "Ghrita", dose: "10 g OD AM", anupana: "Ushna jala", duration: "3 weeks" },
      ], "Snehapana → Virechana with Trivrit → Tikta Ksheera Basti."),
    ],
  },

  jalodara: {
    definition: "Jalodara is Kapha-Ambu accumulation in the abdominal cavity; correlates with Ascites secondary to hepatic, cardiac or renal causes.",
    nidana: "Chronic liver disease, alcohol abuse, Viruddha ahara, right heart failure, nephrotic syndrome, Mandagni.",
    lakshana: ["Udara vriddhi with fluctuation", "Shotha of feet", "Alpa mutrata", "Aruchi, Aanaha", "Shvasa on exertion"],
    diagnostic: "USG abdomen (free fluid), LFT, RFT, serum albumin, SAAG on paracentesis, echocardiography as indicated.",
    pathya: "Yava, Kulattha, Mudga yusha, Punarnava, Gokshura, low-salt diet, protein restriction as per cause.",
    apathya: "Lavana, Ambu (excess water), Guru-Snigdha ahara, Divaswapna, alcohol.",
    prognosis: "Krichra-sadhya; Asadhya in decompensated liver disease.",
    references: "AYUSH ASTG 2017 — Chapter 4.",
    levels: [
      L1("PHC", "Mutrala + Deepana; refer for aetiological workup.", [
        { name: "Punarnavadi Mandura", formulation: "Vati", dose: "500 mg BD", anupana: "Takra", duration: "8 weeks", isCommon: true },
        { name: "Arogyavardhini Vati", formulation: "Vati", dose: "2 tabs BD", anupana: "Ushna jala", duration: "8 weeks" },
        { name: "Gokshuradi Guggulu", formulation: "Vati", dose: "2 tabs BD", anupana: "Ushna jala", duration: "8 weeks" },
      ]),
      L2("CHC", "Compound Kashaya + hepatoprotective Rasaushadhi.", [
        { name: "Punarnavashtaka Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "6 weeks" },
        { name: "Chandraprabha Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "6 weeks" },
      ]),
      L3("District Hospital", "Shodhana + specialist referral for tense ascites.", [
        { name: "Trivrit Lehyam", formulation: "Lehyam", dose: "10 g HS", anupana: "Ushna jala", duration: "as per Vega" },
      ], "Niruha Basti with Dashamula Kwatha; Virechana with Trivrit; paracentesis if tense."),
    ],
  },

  amavata: {
    definition: "Amavata is a systemic Vata-Ama Sannipata disorder involving multiple joints; correlates with Rheumatoid Arthritis.",
    nidana: "Viruddha ahara, Mandagni + physical exertion after heavy meals, Snigdha ahara with Vyayama, seasonal factors.",
    lakshana: ["Sandhi shula-shotha (symmetric)", "Morning stiffness >30 min", "Angamarda, Aruchi", "Jwara, Alasya", "Deformity in chronic stage"],
    diagnostic: "RA factor, Anti-CCP, ESR/CRP, hand X-ray for erosions; ACR/EULAR 2010 criteria.",
    pathya: "Yava, Kulattha, Rasona, Nimba, Guduchi, Ardraka, hot water, mild exercise.",
    apathya: "Dadhi, Matsya, Guru-Snigdha ahara, cold exposure, day-sleep, suppression of urges.",
    prognosis: "Krichra-sadhya; early Ama-avastha responds well, deformed stage is Yapya.",
    references: "AYUSH ASTG 2017 — Chapter 5.",
    levels: [
      L1("PHC", "Ama-pachana + Vata-shamana.", [
        { name: "Simhanada Guggulu", formulation: "Vati", dose: "2 tabs BD", anupana: "Ushna jala", duration: "12 weeks", isCommon: true },
        { name: "Rasnasaptaka Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "12 weeks" },
        { name: "Panchakola Churna", formulation: "Churna", dose: "1-3 g BD", anupana: "Ushna jala", duration: "8 weeks" },
      ]),
      L2("CHC", "Rasaushadhi for moderate active disease.", [
        { name: "Amavatari Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Madhu", duration: "8 weeks" },
        { name: "Mahayogaraja Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks" },
      ]),
      L3("District Hospital", "Panchakarma after Ama-pachana.", [
        { name: "Panchatikta Ghrita", formulation: "Ghrita", dose: "Snehapana as per Koshtha", anupana: "Ushna jala", duration: "7-14 days" },
      ], "Valuka Sveda, Vaitarana Basti, Snehapana with Panchatikta Ghrita, Virechana."),
    ],
  },

  jwara: {
    definition: "Jwara is the cardinal Ama-vikara marked by rise of body temperature with body-ache and loss of appetite; includes viral fevers and Dengue.",
    nidana: "Viruddha ahara, Ritu-viparyaya, infection (viral/bacterial/protozoal), Manasika hetu, exposure to vectors.",
    lakshana: ["Santapa (fever)", "Angamarda, Shirashula", "Aruchi, Trishna", "Kampa in Vishama jwara", "Rakta-strava in Dandaka jwara"],
    diagnostic: "CBC, malaria smear/NS1, Dengue NS1/IgM, Widal, urine RE; platelet monitoring in Dengue.",
    pathya: "Ushna jala, Manda-Peya-Vilepi, Mudga yusha, Draksha, Nariyala jala, fluids.",
    apathya: "Guru-Snigdha food, Divaswapna, Vyayama, cold water bath in early phase, alcohol.",
    prognosis: "Sukha-sadhya; Asadhya if Sannipata with organ dysfunction.",
    references: "AYUSH ASTG 2017 — Chapter 6.",
    levels: [
      L1("PHC", "Langhana + Jwaraghna kashaya; ORS.", [
        { name: "Sanjivani Vati", formulation: "Vati", dose: "250 mg TDS", anupana: "Ushna jala", duration: "5-7 days", isCommon: true },
        { name: "Godanti Bhasma", formulation: "Bhasma", dose: "125 mg TDS", anupana: "Madhu", duration: "5-7 days", isCommon: true },
        { name: "Amrutarishta", formulation: "Arishta", dose: "20 ml BD", anupana: "Equal water", duration: "2 weeks" },
      ]),
      L2("CHC", "Add Rasaushadhi for Sannipata; hospitalize Dengue with warning signs.", [
        { name: "Sudarshan Ghana Vati", formulation: "Vati", dose: "2 tabs TDS", anupana: "Ushna jala", duration: "7 days" },
        { name: "Tribhuvana Kirti Rasa", formulation: "Rasa", dose: "125 mg TDS", anupana: "Ardraka + Madhu", duration: "5 days" },
        { name: "Papaya leaf extract", formulation: "Ghana", dose: "10 ml TDS", anupana: "Water", duration: "5 days in Dengue" },
      ]),
      L3("District Hospital", "Managed IV therapy in DHF; Rasayana in convalescence.", [
        { name: "Amruta Satva", formulation: "Satva", dose: "500 mg BD", anupana: "Madhu", duration: "2 weeks" },
      ], "Sheeta pariseka in high-grade Pittaja jwara; Nadi Sveda in Vata-anubandha."),
    ],
  },

  pandu: {
    definition: "Pandu is Pitta-pradhana Rasa-Rakta dushti presenting as pallor, weakness and reduced haemoglobin; correlates with Anaemia.",
    nidana: "Poor diet (Fe/B12/folate deficient), chronic blood loss, worm infestation, chronic disease, pregnancy, Viruddha ahara.",
    lakshana: ["Pandu varna (pallor)", "Daurbalya, Shrama", "Shwasa on exertion", "Aruchi, Bhrama", "Shopha of feet in severe cases"],
    diagnostic: "CBC with peripheral smear, serum ferritin, B12/folate, reticulocyte count, stool for occult blood/ova.",
    pathya: "Loha-varga vegetables (spinach, drumstick), Draksha, Amalaki, Kharjura, Loha-jala, Yava, Godhuma.",
    apathya: "Amla-Lavana excess, Ambu (excess water intake), Kulattha, Divaswapna.",
    prognosis: "Sukha-sadhya when cause is corrected; Krichra-sadhya in chronic disease anaemia.",
    references: "AYUSH ASTG 2017 — Chapter 7.",
    levels: [
      L1("PHC", "Loha kalpa + dietary correction; deworm.", [
        { name: "Punarnavadi Mandura", formulation: "Vati", dose: "500 mg BD", anupana: "Takra", duration: "12 weeks", isCommon: true },
        { name: "Draksharishta", formulation: "Arishta", dose: "20 ml BD", anupana: "Equal water", duration: "12 weeks" },
        { name: "Loha Bhasma", formulation: "Bhasma", dose: "125 mg BD", anupana: "Madhu + Ghrita", duration: "12 weeks" },
      ]),
      L2("CHC", "Compound Loha kalpa for moderate anaemia.", [
        { name: "Navayasa Churna", formulation: "Churna", dose: "3 g BD", anupana: "Madhu", duration: "12 weeks" },
        { name: "Trikatru Churna", formulation: "Churna", dose: "1 g BD", anupana: "Madhu", duration: "8 weeks" },
      ]),
      L3("District Hospital", "Rasayana after Shodhana in severe/chronic disease.", [
        { name: "Dhatri Loha", formulation: "Loha", dose: "125 mg BD", anupana: "Madhu + Ghrita", duration: "8 weeks" },
      ], "Virechana with Trivrit followed by Tikta Ksheera Basti; blood transfusion when Hb <7 g/dL."),
    ],
  },

  ekakushtha: {
    definition: "Ekakushtha is a Kshudra Kushtha with Vata-Kapha dominance; scaly non-itchy plaques on extensor surfaces — correlates with Psoriasis.",
    nidana: "Viruddha ahara, Manasika stress, alcohol, suppression of natural urges, seasonal Kapha aggravation.",
    lakshana: ["Matsya-shakala-upamam (fish-scale like plaques)", "Aswedana", "Mahavastu (large area)", "Kandu (mild)", "Nail pitting"],
    diagnostic: "Clinical; Auspitz sign, Koebner phenomenon; skin biopsy in atypical presentations; PASI scoring.",
    pathya: "Purana shali, Yava, Mudga yusha, Patola, Nimba, Guduchi, Tikta shaka.",
    apathya: "Dadhi, Matsya, Amla-Lavana, Guru ahara, alcohol, stress, Divaswapna.",
    prognosis: "Krichra-sadhya; Yapya with relapses.",
    references: "AYUSH ASTG 2017 — Chapter 8.",
    levels: [
      L1("PHC", "Rakta-shodhaka + local snehana.", [
        { name: "Arogyavardhini Vati", formulation: "Vati", dose: "2 tabs BD", anupana: "Ushna jala", duration: "12 weeks", isCommon: true },
        { name: "Manjishthadi Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "12 weeks" },
        { name: "Panchatikta Ghrita Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "12 weeks" },
      ]),
      L2("CHC", "Rasaushadhi for extensive/refractory plaques.", [
        { name: "Kaishore Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks" },
        { name: "Gandhaka Rasayana", formulation: "Rasa", dose: "500 mg BD", anupana: "Madhu", duration: "8 weeks" },
      ]),
      L3("District Hospital", "Shodhana for chronic disease.", [
        { name: "Mahatikta Ghrita", formulation: "Ghrita", dose: "Snehapana as per Koshtha", anupana: "Ushna jala", duration: "7-10 days" },
      ], "Virechana with Trivrit; Raktamokshana; Snehapana with Mahatikta Ghrita; local Lepa."),
    ],
  },

  kamala: {
    definition: "Kamala is Pitta-Rakta dushti presenting as yellow discolouration of skin, sclera and urine; correlates with Jaundice / Hepatocellular disease.",
    nidana: "Alcohol abuse, hepatotropic viruses, hepatotoxic drugs, biliary obstruction, chronic Amlapitta.",
    lakshana: ["Haridra-varna netra-twak-mutra", "Aruchi, Daurbalya", "Yakrit vriddhi", "Kandu in cholestasis", "Pale/clay stools in obstructive type"],
    diagnostic: "LFT (bilirubin, AST/ALT, ALP), viral hepatitis panel, USG abdomen, PT/INR.",
    pathya: "Punarnava, Bhumyamalaki, Kutki, sugarcane juice, coconut water, buttermilk with cumin, boiled vegetables.",
    apathya: "Alcohol, spicy-fried food, Amla-Lavana excess, Ushna-Tikshna ahara, exertion.",
    prognosis: "Sukha-sadhya in acute viral hepatitis; Krichra/Asadhya in cirrhosis.",
    references: "AYUSH ASTG 2017 — Chapter 9.",
    levels: [
      L1("PHC", "Hepatoprotective churnas + Deepana.", [
        { name: "Arogyavardhini Vati", formulation: "Vati", dose: "2 tabs BD", anupana: "Ushna jala", duration: "8 weeks", isCommon: true },
        { name: "Punarnavashtaka Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "8 weeks" },
        { name: "Kutki Churna", formulation: "Churna", dose: "1-3 g BD", anupana: "Madhu", duration: "6 weeks" },
      ]),
      L2("CHC", "Compound Rasaushadhi + Arishta.", [
        { name: "Bhumyamalaki Churna", formulation: "Churna", dose: "3 g BD", anupana: "Madhu", duration: "8 weeks" },
        { name: "Rohitakarishta", formulation: "Arishta", dose: "20 ml BD", anupana: "Equal water", duration: "8 weeks" },
      ]),
      L3("District Hospital", "Shodhana in Ruddha-patha Kamala.", [
        { name: "Trivrit Lehyam", formulation: "Lehyam", dose: "10 g HS", anupana: "Ushna jala", duration: "as per Vega" },
      ], "Virechana with Trivrit; surgical referral for obstructive jaundice."),
    ],
  },

  hypothyroidism: {
    definition: "Hypothyroidism (Galaganda/Medovaha vikara) is Kapha-Medo dushti with reduced Agni; presents as fatigue, weight gain and cold intolerance.",
    nidana: "Iodine deficiency, autoimmune (Hashimoto), post-thyroidectomy, radiation, sedentary lifestyle, Guru-Snigdha ahara.",
    lakshana: ["Alasya, Tandra", "Weight gain, Sheeta-asahishnuta", "Kesha-patana, Twak rukshata", "Kosht badhata", "Menstrual irregularity, Anaha"],
    diagnostic: "TSH (elevated), free T4 (low), Anti-TPO antibodies; annual monitoring.",
    pathya: "Yava, Kulattha, Rasona, Nimba, warm water, sea-vegetables (iodine), regular exercise.",
    apathya: "Excess Kaphaja ahara, Divaswapna, cold water, goitrogenic raw cruciferous vegetables in excess.",
    prognosis: "Yapya; requires lifelong monitoring; Ayurveda adjuvant to allopathic replacement.",
    references: "AYUSH ASTG 2017 — Chapter 10.",
    levels: [
      L1("PHC", "Medo-kaphahara churna + lifestyle counselling.", [
        { name: "Kanchanara Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "12 weeks", isCommon: true },
        { name: "Varunadi Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "12 weeks" },
      ]),
      L2("CHC", "Add Rasaushadhi for symptomatic control.", [
        { name: "Punarnavadi Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "12 weeks" },
        { name: "Trikatu Churna", formulation: "Churna", dose: "1 g BD", anupana: "Madhu", duration: "8 weeks" },
      ]),
      L3("District Hospital", "Panchakarma for obesity + goitre.", [
        { name: "Chitrakadi Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks" },
      ], "Udwartana with Triphala Churna; Virechana; Nasya with Anu Taila."),
    ],
  },

  madhumeha: {
    definition: "Madhumeha is a Vataja Prameha characterised by passage of sweet (Madhura) urine, equivalent to Diabetes Mellitus.",
    nidana: "Atisampoorana ahara, Diwaswapna, Asyasukha, Avyayama, sedentary lifestyle, excess Madhura-Snigdha-Guru ahara, Bija dosha (genetic).",
    lakshana: [
      "Prabhuta-Avila mutrata (polyuria with turbidity)",
      "Pipasa adhikya (polydipsia)",
      "Kshudha adhikya (polyphagia)",
      "Karapada daha-suptata",
      "Daurbalya, Karshya",
    ],
    diagnostic: "FBS ≥126 mg/dL, PPBS ≥200 mg/dL, HbA1c ≥6.5%, or random ≥200 mg/dL with classical symptoms.",
    pathya: "Yava, Kulattha, Mudga, Karela, Methi, Jambu, Amalaki, walking 30 min/day.",
    apathya: "Guda, Ikshu, Dadhi, Pishtanna, Nava anna, Diwaswapna, Avyayama.",
    prognosis: "Yapya — controllable with sustained regimen; complications if neglected.",
    references: "AYUSH ASTG 2017 — Chapter 11.",
    levels: [
      L1("PHC", "Diet, exercise, single-herb Shamana.", [
        { name: "Nisha Amalaki Churna", formulation: "Churna", dose: "3 g BD", anupana: "Ushna jala", duration: "60 days", isCommon: true },
        { name: "Mehari Churna", formulation: "Churna", dose: "3 g BD before meals", anupana: "Ushna jala", duration: "60 days" },
      ]),
      L2("CHC", "Compound formulations for moderate hyperglycaemia.", [
        { name: "Chandraprabha Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "90 days" },
        { name: "Vasanta Kusumakara Rasa", formulation: "Rasa", dose: "125 mg OD AM", anupana: "Madhu + Ghrita", duration: "30 days" },
        { name: "Asanadi Kashaya", formulation: "Kashaya", dose: "15 ml BD before meals", anupana: "Equal water", duration: "60 days" },
      ]),
      L3("District / Specialty Hospital", "Panchakarma + Rasayana for complications (neuropathy, nephropathy).", [
        { name: "Shilajatu Rasayana", formulation: "Rasayana", dose: "250 mg BD", anupana: "Warm milk", duration: "3 months" },
        { name: "Triphala Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "90 days" },
      ], "Udvartana, Takra Dhara, Virechana with Trivrit, followed by Rasayana."),
    ],
  },

  sthoulya: {
    definition: "Sthoulya is Medo dhatu vriddhi with Kapha-Meda accumulation causing excess adiposity; correlates with Obesity.",
    nidana: "Excess Guru-Madhura-Snigdha ahara, Diwaswapna, Avyayama, Manasika sukha, hereditary factors.",
    lakshana: ["Chala sphik-udara-stana", "Ayathopachaya (undue growth)", "Alpavyayamataa (exercise intolerance)", "Ati-svedana", "Nidra-adhikya"],
    diagnostic: "BMI ≥25 (Asian ≥23); waist circumference; TSH, lipid profile, FBS.",
    pathya: "Yava, Kulattha, Mudga, Trikatu, Madhu, warm water, exercise, small frequent meals.",
    apathya: "Ghrita-Taila, sweets, refined flour, Divaswapna, sedentary lifestyle.",
    prognosis: "Sukha-sadhya with regimen; complications need active management.",
    references: "AYUSH ASTG 2017 — Chapter 12.",
    levels: [
      L1("PHC", "Lekhana churnas + graded exercise.", [
        { name: "Triphala Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "12 weeks", isCommon: true },
        { name: "Medohar Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "12 weeks" },
        { name: "Varunadi Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "12 weeks" },
      ]),
      L2("CHC", "Rasaushadhi + Lekhana Guggulu.", [
        { name: "Navaka Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks" },
        { name: "Trikatu Churna", formulation: "Churna", dose: "1-3 g BD", anupana: "Madhu", duration: "8 weeks" },
      ]),
      L3("District Hospital", "Panchakarma for morbid obesity.", [
        { name: "Vidangadi Lauha", formulation: "Lauha", dose: "125 mg BD", anupana: "Madhu", duration: "8 weeks" },
      ], "Udwartana with Triphala Churna; Virechana; Lekhana Basti."),
    ],
  },

  arsha: {
    definition: "Arsha is Guda-margasrita mamsa-ankura formation causing pain and bleeding; correlates with Haemorrhoids/Piles.",
    nidana: "Chronic constipation, Vishtambhi ahara, prolonged sitting, pregnancy, straining, family history.",
    lakshana: ["Rakta-strava (bright red)", "Vedana at defecation", "Kandu, Daha at anus", "Prolapse of mass in later grades", "Anaemia if chronic"],
    diagnostic: "Digital rectal exam, proctoscopy; grading I-IV; exclude malignancy in bleeding PR.",
    pathya: "Buttermilk with cumin, Yava, Mudga, Punarnava, fibre-rich diet, adequate water, warm sitz bath.",
    apathya: "Katu-Amla-Lavana excess, straining at stool, prolonged sitting, spicy food, alcohol.",
    prognosis: "Grade I-II Sukha-sadhya; Grade III-IV need Kshara-karma or surgery.",
    references: "AYUSH ASTG 2017 — Chapter 13.",
    levels: [
      L1("PHC", "Bowel regulation + local application.", [
        { name: "Arshoghni Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Takra", duration: "6 weeks", isCommon: true },
        { name: "Abhayarishta", formulation: "Arishta", dose: "20 ml BD", anupana: "Equal water", duration: "6 weeks" },
        { name: "Triphala Churna", formulation: "Churna", dose: "3 g HS", anupana: "Ushna jala", duration: "6 weeks" },
      ]),
      L2("CHC", "Rasaushadhi + Jatyadi Taila locally.", [
        { name: "Kankayana Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Takra", duration: "6 weeks" },
        { name: "Jatyadi Taila", formulation: "Taila", dose: "Local application BD", anupana: "-", duration: "4 weeks" },
      ]),
      L3("District Hospital", "Parasurgical procedures.", [
        { name: "Kshara Application", formulation: "Kshara", dose: "as per procedure", anupana: "-", duration: "single sitting" },
      ], "Kshara Karma (chemical cauterization), Agnikarma, or Kshara Sutra for prolapse; surgical excision if indicated."),
    ],
  },

  atisara: {
    definition: "Atisara is Purishavaha srotas dushti with frequent liquid stools; correlates with Diarrhoea (infective / functional).",
    nidana: "Contaminated food/water, Viruddha ahara, Mandagni, stress, viral gastroenteritis, food allergy.",
    lakshana: ["Drava-purisha", "Vedana in abdomen", "Trishna, Daurbalya", "Fever if infective", "Signs of dehydration"],
    diagnostic: "Stool RE/ME, culture in persistent/bloody diarrhoea; electrolytes if severe dehydration.",
    pathya: "ORS, Manda-Peya-Vilepi, Takra with cumin, Dadima juice, Bilva, coconut water.",
    apathya: "Milk (during acute), spicy-oily food, raw vegetables, alcohol, cold water.",
    prognosis: "Sukha-sadhya; Asadhya if with dehydration + electrolyte imbalance untreated.",
    references: "AYUSH ASTG 2017 — Chapter 14.",
    levels: [
      L1("PHC", "Rehydration + Stambhaka drugs.", [
        { name: "Kutajarishta", formulation: "Arishta", dose: "20 ml BD", anupana: "Equal water", duration: "2 weeks", isCommon: true },
        { name: "Kutaja Ghana Vati", formulation: "Vati", dose: "500 mg TDS", anupana: "Takra", duration: "2 weeks" },
        { name: "Bilva Avaleha", formulation: "Avaleha", dose: "6 g BD", anupana: "Ushna jala", duration: "2 weeks" },
      ]),
      L2("CHC", "Add Rasaushadhi for chronic/dysenteric type.", [
        { name: "Pippalyadi Churna", formulation: "Churna", dose: "3 g TDS", anupana: "Ushna jala", duration: "2 weeks" },
        { name: "Karpuradi Churna", formulation: "Churna", dose: "1 g BD", anupana: "Ushna jala", duration: "2 weeks" },
      ]),
      L3("District Hospital", "IV rehydration + Basti for chronic.", [
        { name: "Ahiphenasava", formulation: "Asava", dose: "5-10 ml SOS", anupana: "Water", duration: "acute only" },
      ], "IV rehydration in severe dehydration; Piccha Basti with Yashtimadhu-Yavagu for chronic diarrhoea."),
    ],
  },

  bhagandara: {
    definition: "Bhagandara is a tract-forming lesion around the anus with recurrent purulent discharge; correlates with Fistula-in-Ano.",
    nidana: "Untreated perianal abscess, chronic constipation, Kshata (trauma), tuberculosis, Crohn's disease.",
    lakshana: ["Recurrent perianal discharge", "External opening near anus", "Vedana, Kandu", "Induration along tract", "Fever during exacerbation"],
    diagnostic: "Clinical + probe examination; MRI fistulogram for complex cases; Goodsall's rule.",
    pathya: "Warm sitz bath, fibre-rich diet, adequate hydration, Punarnava, Triphala.",
    apathya: "Spicy food, prolonged sitting, straining, suppression of bowel urge.",
    prognosis: "Krichra-sadhya; recurrent unless Kshara Sutra or surgery done.",
    references: "AYUSH ASTG 2017 — Chapter 15.",
    levels: [
      L1("PHC", "Anti-inflammatory + local hygiene; refer for definitive treatment.", [
        { name: "Triphala Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "4 weeks", isCommon: true },
        { name: "Kaishore Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "4 weeks" },
      ]),
      L2("CHC", "Local application + oral compound formulations.", [
        { name: "Panchavalkala Kwatha", formulation: "Kwatha", dose: "Sitz bath BD", anupana: "-", duration: "6 weeks" },
        { name: "Jatyadi Taila", formulation: "Taila", dose: "Local application", anupana: "-", duration: "6 weeks" },
      ]),
      L3("District Hospital", "Definitive Kshara Sutra therapy.", [
        { name: "Kshara Sutra", formulation: "Sutra", dose: "Weekly ligation", anupana: "-", duration: "as per tract length (avg 6-8 weeks)" },
      ], "Kshara Sutra ligation (Kshara-anushastra karma) — gold standard; surgical fistulectomy in select cases."),
    ],
  },

  krimi: {
    definition: "Krimi refers to intestinal worm infestation causing Ama-related digestive disturbance; correlates with Helminthic infections.",
    nidana: "Poor hygiene, contaminated food/water, walking barefoot in endemic areas, undercooked meat.",
    lakshana: ["Karshya despite adequate diet", "Guda-kandu (perianal itch)", "Aruchi, Abdominal pain", "Malformed stools with worm segments", "Grinding of teeth, anaemia"],
    diagnostic: "Stool for ova/cyst/parasite (three samples), scotch-tape test for pinworm, CBC (eosinophilia).",
    pathya: "Vidanga, Trikatu, Rasona, Kutki, Palasha beeja, hygiene, hand-washing.",
    apathya: "Madhura-Snigdha ahara excess, raw meat, unwashed vegetables.",
    prognosis: "Sukha-sadhya; recurrent unless sanitation improved.",
    references: "AYUSH ASTG 2017 — Chapter 16.",
    levels: [
      L1("PHC", "Krimighna herbs + hygiene counselling.", [
        { name: "Vidangarishta", formulation: "Arishta", dose: "20 ml BD", anupana: "Equal water", duration: "2 weeks", isCommon: true },
        { name: "Krimikuthara Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Madhu", duration: "2 weeks" },
        { name: "Vidanga Churna", formulation: "Churna", dose: "3 g HS", anupana: "Ushna jala", duration: "2 weeks" },
      ]),
      L2("CHC", "Palasha beeja + purgation.", [
        { name: "Palasha Beeja Churna", formulation: "Churna", dose: "3 g HS", anupana: "Ushna jala", duration: "3 days, repeat after 14 days" },
        { name: "Trayanti Churna", formulation: "Churna", dose: "3 g BD", anupana: "Ushna jala", duration: "1 week" },
      ]),
      L3("District Hospital", "Shodhana in heavy/chronic infestation.", [
        { name: "Trivrit Lehyam", formulation: "Lehyam", dose: "10 g HS", anupana: "Ushna jala", duration: "as per Vega" },
      ], "Virechana with Trivrit for expelling worms; deworming of household contacts."),
    ],
  },

  parikartika: {
    definition: "Parikartika is Vata-Pitta dushti of the anal canal presenting as cutting pain during and after defecation; correlates with Anal Fissure.",
    nidana: "Chronic constipation, hard stools, straining, spicy food, post-partum, IBD.",
    lakshana: ["Chedana-vedana (cutting pain) at defecation", "Rakta-strava (bright red streak)", "Sphincter spasm", "Sentinel skin tag in chronic fissure"],
    diagnostic: "Careful anal inspection (avoid PR in acute); chronic fissure has hypertrophied papilla + sentinel tag.",
    pathya: "Warm sitz bath, fibre + water, Triphala, Ghrita internally, avoid straining.",
    apathya: "Spicy-hot food, constipating foods, prolonged sitting on toilet.",
    prognosis: "Acute Sukha-sadhya; chronic Krichra-sadhya, may need surgery.",
    references: "AYUSH ASTG 2017 — Chapter 17.",
    levels: [
      L1("PHC", "Bowel softening + local snehana.", [
        { name: "Triphala Ghrita", formulation: "Ghrita", dose: "Local application BD + sitz bath", anupana: "-", duration: "4 weeks", isCommon: true },
        { name: "Jatyadi Taila", formulation: "Taila", dose: "Local application BD", anupana: "-", duration: "4 weeks" },
        { name: "Avipattikara Churna", formulation: "Churna", dose: "3 g HS", anupana: "Ushna jala", duration: "4 weeks" },
      ]),
      L2("CHC", "Sitz baths + oral compound.", [
        { name: "Panchavalkala Kwatha", formulation: "Kwatha", dose: "Sitz bath BD", anupana: "-", duration: "4 weeks" },
        { name: "Ksheeri Vriksha Kwatha", formulation: "Kwatha", dose: "Local wash BD", anupana: "-", duration: "4 weeks" },
      ]),
      L3("District Hospital", "Matra Basti in chronic fissure; refer for surgery if not healed.", [
        { name: "Yashtimadhu Ghrita", formulation: "Ghrita", dose: "60 ml", anupana: "-", duration: "Matra Basti × 7 days" },
      ], "Matra Basti with Yashtimadhu Ghrita; lateral internal sphincterotomy in refractory chronic fissure."),
    ],
  },

  anidra: {
    definition: "Anidra is Vata-pradhana Manovaha vikara with inability to fall or maintain sleep; correlates with Insomnia.",
    nidana: "Chinta-Shoka-Bhaya, irregular sleep hours, caffeine/alcohol, screen exposure at night, chronic pain, depression.",
    lakshana: ["Nidra alpata (short/poor sleep)", "Daurbalya, Klama", "Shirashula, Bhrama", "Aruchi", "Irritability, poor concentration"],
    diagnostic: "Clinical; sleep diary; screen for depression, thyroid dysfunction, sleep apnoea if indicated.",
    pathya: "Ksheera, Ghrita, Draksha, Kharjura, warm oil massage, Shirodhara, timely dinner, digital detox 1 hr before sleep.",
    apathya: "Coffee/tea after evening, alcohol, late meals, screens at night, day-sleep.",
    prognosis: "Sukha-sadhya; requires lifestyle change.",
    references: "AYUSH ASTG 2017 — Chapter 18.",
    levels: [
      L1("PHC", "Medhya rasayana + sleep hygiene.", [
        { name: "Sarpagandha Ghana Vati", formulation: "Vati", dose: "125 mg HS", anupana: "Milk", duration: "4 weeks", isCommon: true },
        { name: "Ashwagandha Churna", formulation: "Churna", dose: "3 g HS", anupana: "Warm milk", duration: "4 weeks", isCommon: true },
        { name: "Brahmi Vati", formulation: "Vati", dose: "250 mg BD", anupana: "Milk", duration: "4 weeks" },
      ]),
      L2("CHC", "Rasaushadhi + Medhya arishta.", [
        { name: "Manasamitra Vataka", formulation: "Vati", dose: "125 mg BD", anupana: "Milk", duration: "4 weeks" },
        { name: "Saraswatarishta", formulation: "Arishta", dose: "20 ml HS", anupana: "Equal water", duration: "4 weeks" },
      ]),
      L3("District Hospital", "Bahya chikitsa for refractory insomnia.", [
        { name: "Ksheerabala Taila", formulation: "Taila", dose: "Shirodhara + Abhyanga", anupana: "-", duration: "7-14 days" },
      ], "Shirodhara with Ksheerabala Taila; Abhyanga; Padabhyanga at bedtime."),
    ],
  },

  apasmara: {
    definition: "Apasmara is a Manovaha srotas disorder with recurrent transient loss of consciousness and abnormal movements; correlates with Epilepsy.",
    nidana: "Manasika stress, Bija dosha (genetic), head trauma, febrile convulsions in childhood, metabolic derangement.",
    lakshana: ["Sudden loss of consciousness", "Chesta vaikruta (abnormal movements)", "Frothing at mouth", "Tongue bite, urinary incontinence", "Post-ictal confusion"],
    diagnostic: "EEG, MRI brain, serum electrolytes, calcium, glucose; classification of seizure type.",
    pathya: "Medhya rasayana (Brahmi, Shankhapushpi, Vacha), Ghrita, ensure regular sleep + medication compliance.",
    apathya: "Alcohol, sleep deprivation, flashing lights, missing meals, driving until seizure-free.",
    prognosis: "Yapya — long-term control with medication and lifestyle.",
    references: "AYUSH ASTG 2017 — Chapter 19.",
    levels: [
      L1("PHC", "Adjuvant Medhya Rasayana with allopathic AED.", [
        { name: "Vacha Churna", formulation: "Churna", dose: "500 mg BD", anupana: "Madhu", duration: "12 weeks", isCommon: true },
        { name: "Brahmi Vati", formulation: "Vati", dose: "250 mg BD", anupana: "Milk", duration: "12 weeks" },
        { name: "Saraswatarishta", formulation: "Arishta", dose: "20 ml BD", anupana: "Equal water", duration: "12 weeks" },
      ]),
      L2("CHC", "Kalyanaka Ghrita for chronic disease.", [
        { name: "Smruti Sagara Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Madhu", duration: "12 weeks" },
        { name: "Kalyanaka Ghrita", formulation: "Ghrita", dose: "5 g BD", anupana: "Warm milk", duration: "8 weeks" },
      ]),
      L3("District Hospital", "Nasya + Basti under specialist supervision.", [
        { name: "Panchagavya Ghrita", formulation: "Ghrita", dose: "Nasya 6 drops each nostril", anupana: "-", duration: "7 days" },
      ], "Nasya with Panchagavya Ghrita; Basti with Dashamula Kwatha (never in active seizure phase)."),
    ],
  },

  vishada: {
    definition: "Vishada is a Manovaha vikara characterised by persistent low mood, anhedonia and loss of interest; correlates with Depression.",
    nidana: "Chronic stress, grief, hormonal changes, chronic illness, substance abuse, family history.",
    lakshana: ["Vishada (persistent sadness)", "Alasya, loss of interest", "Nidra vikruti (insomnia/hypersomnia)", "Kshudha vikruti", "Suicidal ideation in severe cases"],
    diagnostic: "PHQ-9 or Hamilton Depression Rating Scale; rule out hypothyroidism, B12 deficiency.",
    pathya: "Medhya (Brahmi, Ashwagandha, Jatamansi), warm milk, sunshine, social interaction, exercise, yoga.",
    apathya: "Alcohol, isolation, cannabis, poor sleep hygiene, Ruksha-Sheeta ahara.",
    prognosis: "Sukha-sadhya in mild-moderate; severe/suicidal needs psychiatry referral.",
    references: "AYUSH ASTG 2017 — Chapter 20.",
    levels: [
      L1("PHC", "Medhya rasayana + counselling.", [
        { name: "Ashwagandha Churna", formulation: "Churna", dose: "3-6 g BD", anupana: "Milk", duration: "12 weeks", isCommon: true },
        { name: "Brahmi Vati", formulation: "Vati", dose: "250 mg BD", anupana: "Milk", duration: "12 weeks" },
        { name: "Jatamansi Churna", formulation: "Churna", dose: "1-3 g BD", anupana: "Milk", duration: "12 weeks" },
      ]),
      L2("CHC", "Rasaushadhi + Medhya arishta.", [
        { name: "Manasamitra Vataka", formulation: "Vati", dose: "125 mg BD", anupana: "Milk", duration: "8 weeks" },
        { name: "Saraswatarishta", formulation: "Arishta", dose: "20 ml BD", anupana: "Equal water", duration: "8 weeks" },
      ]),
      L3("District / Psychiatry Referral", "Panchakarma + integrated psychiatric care.", [
        { name: "Brahmi Ghrita", formulation: "Ghrita", dose: "Nasya 6 drops each nostril", anupana: "-", duration: "7 days" },
      ], "Shirodhara with Ksheerabala; Nasya with Brahmi Ghrita; concurrent psychotherapy / SSRI as needed."),
    ],
  },

  ashmari: {
    definition: "Ashmari is Kapha-Mutra dushti forming stone in urinary tract; correlates with Renal / Ureteric Calculi.",
    nidana: "Low fluid intake, high oxalate/purine diet, recurrent UTI, family history, immobilization, hot climate.",
    lakshana: ["Colicky flank pain radiating to groin", "Haematuria", "Vomiting, sweating during colic", "Dysuria if stone in lower ureter", "Fever if infected"],
    diagnostic: "USG KUB, NCCT KUB for gold-standard sizing, urine RE (RBC/crystals), serum creatinine, calcium.",
    pathya: "3-4 L water/day, Barley water, coconut water, Kulattha, Punarnava, Gokshura, weight-bearing exercise.",
    apathya: "Spinach, tomato-seed excess, red meat, sodas, low water intake, high salt.",
    prognosis: "Stone <6 mm — Sukha-sadhya with conservative treatment; larger stones need URS/PCNL.",
    references: "AYUSH ASTG 2017 — Chapter 21.",
    levels: [
      L1("PHC", "Bhedana + Mutrala; increase fluid intake.", [
        { name: "Chandraprabha Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks", isCommon: true },
        { name: "Varunadi Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "8 weeks" },
        { name: "Gokshuradi Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks" },
      ]),
      L2("CHC", "Add compound litholytic formulations.", [
        { name: "Cystone", formulation: "Vati", dose: "2 tabs BD", anupana: "Ushna jala", duration: "8 weeks" },
        { name: "Pashanabheda Churna", formulation: "Churna", dose: "3 g BD", anupana: "Ushna jala", duration: "8 weeks" },
      ]),
      L3("District Hospital", "Uttara Basti + surgical referral for large stones.", [
        { name: "Ksheerabala Taila", formulation: "Taila", dose: "Uttara Basti 20 ml", anupana: "-", duration: "7 days" },
      ], "Uttara Basti; refer for ESWL / URS / PCNL when stone >6 mm or obstruction."),
    ],
  },

  mutraghata: {
    definition: "Mutraghata is Vata-pradhana Mutravaha srotas obstruction with reduced/absent urine flow; correlates with Urinary Retention.",
    nidana: "BPH, stricture urethra, calculi, neurogenic bladder, post-operative, spinal injury.",
    lakshana: ["Alpa/Anavritti of urine", "Basti-shula (suprapubic pain)", "Palpable bladder", "Restlessness", "Overflow incontinence in chronic cases"],
    diagnostic: "Bladder scan/USG (residual volume), serum creatinine, urine RE, cystoscopy in obstructive causes.",
    pathya: "Warm sitz bath, adequate hydration, Punarnava, Gokshura, Varuna, timely voiding.",
    apathya: "Suppression of urge, cold exposure, anticholinergics, alcohol.",
    prognosis: "Sukha-sadhya when cause reversible; Yapya in chronic obstruction.",
    references: "AYUSH ASTG 2017 — Chapter 22.",
    levels: [
      L1("PHC", "Mutrala + Vata-shamana; catheterize if acute retention.", [
        { name: "Gokshuradi Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "4 weeks", isCommon: true },
        { name: "Chandraprabha Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "4 weeks" },
        { name: "Punarnavasava", formulation: "Asava", dose: "20 ml BD", anupana: "Equal water", duration: "4 weeks" },
      ]),
      L2("CHC", "Compound Kashaya.", [
        { name: "Varunadi Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "4 weeks" },
        { name: "Trinapanchamula Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "4 weeks" },
      ]),
      L3("District Hospital", "Uttara Basti + urological referral.", [
        { name: "Ksheerabala Taila", formulation: "Taila", dose: "Uttara Basti 20 ml", anupana: "-", duration: "7 days" },
      ], "Uttara Basti; urgent catheterization + urological referral for definitive treatment."),
    ],
  },

  mutrasthila: {
    definition: "Mutrasthila is Vata-Kapha dushti causing enlargement of the prostate with bladder outlet obstruction; correlates with BPH.",
    nidana: "Ageing (>50 years), androgen-oestrogen imbalance, sedentary lifestyle, family history.",
    lakshana: ["Frequency, urgency, nocturia", "Weak stream, hesitancy", "Incomplete emptying", "Terminal dribbling", "Acute retention as complication"],
    diagnostic: "DRE, IPSS score, serum PSA, USG KUB with residual urine, uroflowmetry.",
    pathya: "Kulattha, Gokshura, Varuna, Punarnava, pumpkin seeds, adequate hydration, timed voiding.",
    apathya: "Alcohol, coffee, cold exposure, spicy food, prolonged sitting, suppression of urge.",
    prognosis: "Yapya; medical management effective; TURP in refractory cases.",
    references: "AYUSH ASTG 2017 — Chapter 23.",
    levels: [
      L1("PHC", "Medical management + lifestyle.", [
        { name: "Chandraprabha Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "12 weeks", isCommon: true },
        { name: "Gokshuradi Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "12 weeks" },
        { name: "Shilajatu Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Milk", duration: "12 weeks" },
      ]),
      L2("CHC", "Compound Kashaya + Kanchanara group.", [
        { name: "Varunadi Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "12 weeks" },
        { name: "Kanchanara Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "12 weeks" },
      ]),
      L3("District Hospital", "Uttara Basti + urological referral.", [
        { name: "Ksheerabala Taila", formulation: "Taila", dose: "Uttara Basti 20 ml", anupana: "-", duration: "7 days" },
      ], "Uttara Basti with Ksheerabala Taila; surgical referral (TURP) if refractory or with complications."),
    ],
  },

  asrigdara: {
    definition: "Asrigdara is Pitta-Rakta dushti with excessive menstrual bleeding; correlates with Menorrhagia / DUB.",
    nidana: "Hormonal imbalance, uterine fibroids, adenomyosis, coagulopathy, IUCD, thyroid disorders.",
    lakshana: ["Ati-artava (heavy flow >80 ml/cycle)", "Prolonged menstruation >7 days", "Passage of clots", "Fatigue, pallor from anaemia", "Dizziness"],
    diagnostic: "CBC, TSH, coagulation profile, pelvic USG, endometrial biopsy if perimenopausal.",
    pathya: "Praval, Ashoka, Lodhra, Nagakesara, iron-rich foods, adequate rest during menses.",
    apathya: "Spicy-hot food, heavy exertion during menses, alcohol, stress.",
    prognosis: "Sukha-sadhya with medical management; Krichra if structural pathology present.",
    references: "AYUSH ASTG 2017 — Chapter 24.",
    levels: [
      L1("PHC", "Rakta-stambhaka + iron supplementation.", [
        { name: "Ashokarishta", formulation: "Arishta", dose: "20 ml BD", anupana: "Equal water", duration: "8 weeks", isCommon: true },
        { name: "Praval Pishti", formulation: "Bhasma", dose: "250 mg BD", anupana: "Madhu", duration: "8 weeks", isCommon: true },
        { name: "Chandraprabha Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks" },
      ]),
      L2("CHC", "Bolabaddha Rasa during menses.", [
        { name: "Bolabaddha Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Madhu", duration: "during menses × 3 cycles" },
        { name: "Pushyanuga Churna", formulation: "Churna", dose: "3 g BD", anupana: "Rice water", duration: "during menses × 3 cycles" },
      ]),
      L3("District Hospital", "Uttara Basti + gynaecology referral.", [
        { name: "Yashtimadhu Ghrita", formulation: "Ghrita", dose: "Uttara Basti 5 ml", anupana: "-", duration: "post-menses × 7 days" },
      ], "Uttara Basti with Yashtimadhu Ghrita; refer for D&C / hysteroscopy if structural cause."),
    ],
  },

  kashtaarthava: {
    definition: "Kashtaarthava is Vata-pradhana Artavavaha vikara with painful menstruation; correlates with Dysmenorrhoea (primary/secondary).",
    nidana: "Cold exposure, stress, endometriosis, adenomyosis, PID, uterine anomaly.",
    lakshana: ["Suprapubic cramping pain during menses", "Backache", "Nausea, vomiting", "Loose stools", "Radiation to thighs"],
    diagnostic: "Clinical; pelvic USG to rule out endometriosis/adenomyosis in secondary type.",
    pathya: "Warm compress, Yavagu, Rasona, Ardraka, Ashoka, Til taila abhyanga on lower abdomen.",
    apathya: "Cold water, cold foods, heavy exertion during menses, stress.",
    prognosis: "Sukha-sadhya in primary; secondary depends on underlying pathology.",
    references: "AYUSH ASTG 2017 — Chapter 25.",
    levels: [
      L1("PHC", "Vata-shamana + Artava-shodhaka.", [
        { name: "Rajahpravartini Vati", formulation: "Vati", dose: "250 mg BD", anupana: "Ushna jala", duration: "3 cycles", isCommon: true },
        { name: "Kumaryasava", formulation: "Asava", dose: "20 ml BD", anupana: "Equal water", duration: "3 cycles" },
        { name: "Ashokarishta", formulation: "Arishta", dose: "20 ml BD", anupana: "Equal water", duration: "3 cycles" },
      ]),
      L2("CHC", "Compound + Dashamula for chronic cases.", [
        { name: "Kanyalohadi Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "3 cycles" },
        { name: "Dashamula Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "3 cycles" },
      ]),
      L3("District Hospital", "Yoga Basti + specialist evaluation.", [
        { name: "Bala Taila", formulation: "Taila", dose: "Uttara Basti 5 ml", anupana: "-", duration: "post-menses × 8 days" },
      ], "Yoga Basti (8 days) or Uttara Basti with Bala Taila; laparoscopy if endometriosis suspected."),
    ],
  },

  shwetapradara: {
    definition: "Shwetapradara is Kapha-Pitta dushti causing white/yellow vaginal discharge; correlates with Leucorrhoea (physiological + pathological).",
    nidana: "Poor genital hygiene, chronic cervicitis, PID, diabetes, iron deficiency, hormonal factors.",
    lakshana: ["Non-bloody vaginal discharge", "Kandu, Daha of yoni", "Foul odour if infective", "Low backache", "Weakness"],
    diagnostic: "Wet mount, whiff test, pH; Pap smear; RBS to rule out diabetes; screen for STI when indicated.",
    pathya: "Yoni prakshalana with Panchavalkala, iron-rich foods, cotton innerwear, good hygiene.",
    apathya: "Sugar excess (Kaphakara), synthetic tight clothing, unprotected intercourse until treated.",
    prognosis: "Sukha-sadhya; recurrence common if hygiene/diet not corrected.",
    references: "AYUSH ASTG 2017 — Chapter 26.",
    levels: [
      L1("PHC", "Stambhaka + Yoni prakshalana.", [
        { name: "Pushyanuga Churna", formulation: "Churna", dose: "3 g BD", anupana: "Rice water", duration: "6 weeks", isCommon: true },
        { name: "Ashokarishta", formulation: "Arishta", dose: "20 ml BD", anupana: "Equal water", duration: "6 weeks" },
        { name: "Chandraprabha Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "6 weeks" },
      ]),
      L2("CHC", "Rasaushadhi + Musali group.", [
        { name: "Praval Pishti", formulation: "Bhasma", dose: "250 mg BD", anupana: "Madhu", duration: "6 weeks" },
        { name: "Musali Khadiradi Kashaya", formulation: "Kashaya", dose: "40 ml BD", anupana: "Empty stomach", duration: "6 weeks" },
      ]),
      L3("District Hospital", "Uttara Basti in chronic PID.", [
        { name: "Panchavalkala Kwatha", formulation: "Kwatha", dose: "Yoni prakshalana OD", anupana: "-", duration: "10 days" },
      ], "Yoni Prakshalana with Panchavalkala; Uttara Basti with Ksheerabala Taila."),
    ],
  },

  avabahuka: {
    definition: "Avabahuka is Vata dushti of Amsa sandhi causing painful restriction of shoulder movements; correlates with Frozen Shoulder / Adhesive Capsulitis.",
    nidana: "Shoulder immobilization, diabetes, cervical spondylosis, trauma, Vata-aggravating regimen.",
    lakshana: ["Amsa shula (shoulder pain)", "Loss of active + passive movements", "Night pain", "Difficulty with overhead activities", "Muscle wasting in chronic phase"],
    diagnostic: "Clinical (external rotation loss); X-ray to rule out arthritis/calcific tendinitis; MRI for capsular thickening.",
    pathya: "Warm oil massage (Mahanarayana Taila), Rasona, Ardraka, warm compress, gentle mobilization exercises.",
    apathya: "Cold exposure, immobility, heavy overhead lifting until pain settles.",
    prognosis: "Krichra-sadhya; recovery over 6-18 months with sustained therapy.",
    references: "AYUSH ASTG 2017 — Chapter 27.",
    levels: [
      L1("PHC", "Snehana-Svedana + Vata-shamana + exercises.", [
        { name: "Yogaraja Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks", isCommon: true },
        { name: "Maharasnadi Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "8 weeks" },
        { name: "Mahanarayana Taila", formulation: "Taila", dose: "Local abhyanga BD", anupana: "-", duration: "8 weeks" },
      ]),
      L2("CHC", "Rasaushadhi for refractory pain.", [
        { name: "Brihat Vata Chintamani Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Madhu + Ghrita", duration: "4 weeks" },
        { name: "Ekangavira Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Ardraka swarasa", duration: "4 weeks" },
      ]),
      L3("District Hospital", "Panchakarma package.", [
        { name: "Bala Ashwagandhadi Taila", formulation: "Taila", dose: "Abhyanga", anupana: "-", duration: "14 days" },
      ], "Abhyanga with Mahanarayana Taila; Nadi Sveda; Nasya with Anu Taila; Greeva Basti."),
    ],
  },

  katigraha: {
    definition: "Katigraha is Vata dushti of Kati pradesha causing stiffness and pain in the lumbosacral region; correlates with Low Back Pain / Lumbago.",
    nidana: "Faulty posture, heavy lifting, prolonged sitting, disc degeneration, spondylosis, spondylolisthesis.",
    lakshana: ["Kati shula (low back pain)", "Stiffness worse in morning", "Restricted flexion/extension", "Radiation to buttocks", "Aggravation by cold/exertion"],
    diagnostic: "Clinical exam, SLR test, X-ray LS spine; MRI in radicular pain or red flags.",
    pathya: "Rasona, Ardraka, warm oil massage, gentle back-strengthening exercise, ergonomic posture.",
    apathya: "Prolonged sitting, heavy lifting with poor form, cold exposure, mattress-related issues.",
    prognosis: "Sukha-sadhya in acute; Krichra-sadhya in chronic degenerative disease.",
    references: "AYUSH ASTG 2017 — Chapter 28.",
    levels: [
      L1("PHC", "Snehana-Svedana + Vata-shamana + exercise.", [
        { name: "Yogaraja Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks", isCommon: true },
        { name: "Rasnasaptaka Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "8 weeks" },
        { name: "Mahanarayana Taila", formulation: "Taila", dose: "Local abhyanga BD", anupana: "-", duration: "8 weeks" },
      ]),
      L2("CHC", "Trayodashanga Guggulu for radicular symptoms.", [
        { name: "Trayodashanga Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks" },
        { name: "Ekangavira Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Ardraka swarasa", duration: "4 weeks" },
      ]),
      L3("District Hospital", "Kati Basti + Basti karma.", [
        { name: "Sahacharadi Taila", formulation: "Taila", dose: "Kati Basti", anupana: "-", duration: "7 days" },
      ], "Kati Basti with Sahacharadi Taila; Anuvasana Basti; Kashaya Basti with Dashamula."),
    ],
  },

  gridhrasi: {
    definition: "Gridhrasi is Vata dushti along the Kandara of lower limb producing radicular pain from back down to foot; correlates with Sciatica.",
    nidana: "Prolapsed intervertebral disc, piriformis syndrome, spondylosis, trauma, ergonomic factors.",
    lakshana: ["Radiating pain from Sphik (buttock) to foot", "Stambha (stiffness)", "Toda, Spurana (pricking, twitching)", "Positive SLR", "Numbness / weakness in dermatomal distribution"],
    diagnostic: "SLR, Bragard's, reflex changes; MRI LS spine to identify disc protrusion / nerve compression.",
    pathya: "Rasona, Ardraka, castor oil (1 tsp with warm milk HS), warm oil abhyanga, gentle stretching.",
    apathya: "Cold exposure, prolonged sitting, heavy lifting with flexion, jerky movements.",
    prognosis: "Sukha-sadhya in early stage; Krichra if with severe disc herniation.",
    references: "AYUSH ASTG 2017 — Chapter 29.",
    levels: [
      L1("PHC", "Vata-shamana + local snehana.", [
        { name: "Trayodashanga Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks", isCommon: true },
        { name: "Rasnadi Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "8 weeks" },
        { name: "Mahanarayana Taila", formulation: "Taila", dose: "Local abhyanga BD", anupana: "-", duration: "8 weeks" },
      ]),
      L2("CHC", "Rasaushadhi + castor oil.", [
        { name: "Vatavidhwansana Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Madhu", duration: "4 weeks" },
        { name: "Eranda Bhrishta Haritaki", formulation: "Vati", dose: "3 g HS", anupana: "Ushna jala", duration: "4 weeks" },
      ]),
      L3("District Hospital", "Kati Basti + Kashaya Basti.", [
        { name: "Sahacharadi Taila", formulation: "Taila", dose: "Kati Basti", anupana: "-", duration: "7 days" },
      ], "Kati Basti; Kashaya Basti with Dashamula; Agnikarma at Kandara marma for chronic cases."),
    ],
  },

  pakshaghata: {
    definition: "Pakshaghata is a Vataja Vata Vyadhi with unilateral loss of motor + sensory function; correlates with Hemiplegia / Stroke.",
    nidana: "Hypertension, atherosclerosis, atrial fibrillation, diabetes, smoking, alcohol, dyslipidaemia, thrombophilia.",
    lakshana: ["Sudden hemiparesis / hemiplegia", "Facial deviation", "Slurred speech, aphasia", "Loss of consciousness in massive stroke", "Sensory loss on one side"],
    diagnostic: "Urgent NCCT / MRI brain, ECG, echo, carotid Doppler, coagulation profile, glucose, lipid panel.",
    pathya: "Snigdha-Ushna ahara, Ashwagandha, Bala, Rasona, controlled BP + sugar, physiotherapy.",
    apathya: "Smoking, alcohol, excess salt, sedentary lifestyle, uncontrolled hypertension.",
    prognosis: "Yapya; recovery depends on early intervention within 4.5 hours; rehabilitation essential.",
    references: "AYUSH ASTG 2017 — Chapter 30.",
    levels: [
      L1("PHC", "Adjuvant Vata-shamana with rehabilitation; refer acute stroke immediately.", [
        { name: "Rasnadi Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "12 weeks", isCommon: true },
        { name: "Maha Vata Vidhwansa Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Madhu", duration: "12 weeks" },
        { name: "Ashwagandharishta", formulation: "Arishta", dose: "20 ml BD", anupana: "Equal water", duration: "12 weeks" },
      ]),
      L2("CHC", "Rasaushadhi + rehabilitation therapy.", [
        { name: "Brihat Vata Chintamani Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Madhu + Ghrita", duration: "8 weeks" },
        { name: "Ekangavira Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Ardraka swarasa", duration: "8 weeks" },
      ]),
      L3("District Hospital", "Full Panchakarma package + physiotherapy.", [
        { name: "Mahamasha Taila", formulation: "Taila", dose: "Abhyanga", anupana: "-", duration: "21 days" },
      ], "Abhyanga with Mahamasha Taila; Sarvanga Sveda; Nasya with Ksheerabala; Yoga/Kala Basti."),
    ],
  },

  "sandhigata-vata": {
    definition: "Sandhigata Vata is Vata dushti of joints producing pain, stiffness and crepitus; correlates with Osteoarthritis.",
    nidana: "Ageing, obesity, previous joint injury, occupational overuse, Vata-aggravating diet, Dhatu Kshaya.",
    lakshana: [
      "Sandhi shula (joint pain worse with activity)",
      "Sandhi stambha (morning stiffness <30 min)",
      "Atopa (crepitus)",
      "Vata-purna dhriti sparsha (joint feels like inflated bag)",
      "Reduced range of motion",
    ],
    diagnostic: "X-ray affected joint (joint space narrowing, osteophytes); ESR normal; RA factor negative; uric acid normal.",
    pathya: "Warm food, Dashamula preparations, castor oil (1 tsp with warm milk at bedtime), sesame seeds, garlic, ginger, gentle walking.",
    apathya: "Cold/dry food, raw vegetables, excess pulses, fasting, overexertion, exposure to cold/wind.",
    prognosis: "Yapya; progressive but symptoms controllable with sustained regimen.",
    references: "AYUSH ASTG 2017 — Chapter 31.",
    levels: [
      L1("PHC", "Snehana + Vata-shamana + weight reduction.", [
        { name: "Yogaraja Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "12 weeks", isCommon: true },
        { name: "Maharasnadi Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "12 weeks", isCommon: true },
        { name: "Rasnasaptaka Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "12 weeks" },
        { name: "Sahacharadi Taila", formulation: "Taila", dose: "Local abhyanga BD", anupana: "-", duration: "12 weeks" },
      ]),
      L2("CHC", "Rasaushadhi for painful flare.", [
        { name: "Brihat Vata Chintamani Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Madhu + Ghrita", duration: "4 weeks" },
        { name: "Ekangavira Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Ardraka swarasa", duration: "4 weeks" },
      ]),
      L3("District Hospital", "Full Panchakarma package.", [
        { name: "Ksheera Bala Taila", formulation: "Taila", dose: "Janu Basti", anupana: "-", duration: "7 days" },
      ], "Abhyanga; Pinda Sveda; Janu Basti (knee OA); Anuvasana + Kashaya Basti with Dashamula, Rasnadi."),
    ],
  },

  vatarakta: {
    definition: "Vatarakta is Vata-Rakta dushti causing recurrent joint pain with redness, most commonly at first MTP; correlates with Gout.",
    nidana: "Purine-rich diet (red meat, seafood, alcohol), obesity, family history, diuretics, renal impairment.",
    lakshana: ["Sudden onset intense joint pain (often night)", "Sandhi ragana (redness) + shopha", "Sparsha-asahyata (extreme tenderness)", "Recurrent flares", "Tophi in chronic disease"],
    diagnostic: "Serum uric acid >7 mg/dL, synovial fluid analysis (MSU crystals), joint X-ray for tophi/erosions.",
    pathya: "Water >3 L/day, cherries, Guduchi, Manjishtha, low-purine diet, weight reduction.",
    apathya: "Red meat, organ meat, seafood, alcohol (esp beer), sweetened beverages, dehydration.",
    prognosis: "Yapya; well-controlled with diet + medication.",
    references: "AYUSH ASTG 2017 — Chapter 32.",
    levels: [
      L1("PHC", "Rakta-shodhaka + Pitta-shamana.", [
        { name: "Kaishore Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks", isCommon: true },
        { name: "Manjishthadi Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "8 weeks" },
        { name: "Amruta Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "8 weeks" },
      ]),
      L2("CHC", "Add Guduchi Satva + Ghrita.", [
        { name: "Guduchi Satva", formulation: "Satva", dose: "500 mg BD", anupana: "Madhu", duration: "8 weeks" },
        { name: "Panchatikta Ghrita", formulation: "Ghrita", dose: "10 g BD", anupana: "Warm milk", duration: "6 weeks" },
      ]),
      L3("District Hospital", "Shodhana + Raktamokshana.", [
        { name: "Trivrit Lehyam", formulation: "Lehyam", dose: "10 g HS", anupana: "Ushna jala", duration: "as per Vega" },
      ], "Virechana with Trivrit; Raktamokshana (Jalauka) at affected joint; Basti with Dashamula in chronic disease."),
    ],
  },

  abhishyanda: {
    definition: "Abhishyanda is a Netra roga with redness, watering and discharge; correlates with Conjunctivitis (viral/bacterial/allergic).",
    nidana: "Contact with infected persons/fomites, allergens (dust, pollen), swimming pools, contact lens misuse.",
    lakshana: ["Netra ragata (redness)", "Ashru srava (watering)", "Kandu, Gharshana", "Purulent discharge (bacterial)", "Photophobia in severe cases"],
    diagnostic: "Clinical; corneal fluorescein staining if pain/photophobia; conjunctival swab in severe cases.",
    pathya: "Cold compress, eye hygiene, Triphala eyewash, adequate rest, dark glasses.",
    apathya: "Rubbing eyes, contact lenses during infection, sharing towels, direct sun exposure.",
    prognosis: "Sukha-sadhya; usually resolves in 7-10 days.",
    references: "AYUSH ASTG 2017 — Chapter 33.",
    levels: [
      L1("PHC", "Netra prakshalana + oral Pitta-shamana.", [
        { name: "Triphala Churna", formulation: "Churna", dose: "3 g HS", anupana: "Ushna jala", duration: "2 weeks", isCommon: true },
        { name: "Triphala Ghrita", formulation: "Ghrita", dose: "Netra Prakshalana BD", anupana: "-", duration: "1 week" },
      ]),
      L2("CHC", "Rasaushadhi + Yashtimadhu wash.", [
        { name: "Saptamrita Loha", formulation: "Loha", dose: "125 mg BD", anupana: "Madhu + Ghrita", duration: "2 weeks" },
        { name: "Yashtimadhu Kwatha", formulation: "Kwatha", dose: "Netra Prakshalana BD", anupana: "-", duration: "1 week" },
      ]),
      L3("District Hospital", "Anjana + Nasya.", [
        { name: "Rasanjana", formulation: "Anjana", dose: "Anjana OD HS", anupana: "-", duration: "5 days" },
      ], "Anjana with Rasanjana (medicated collyrium); Nasya with Anu Taila in chronic cases."),
    ],
  },

  adhimantha: {
    definition: "Adhimantha is a severe Netra roga with intense eye pain, headache and vision disturbance; correlates with Glaucoma (esp. acute-angle closure).",
    nidana: "Family history, ageing, hyperopia, prolonged steroid use, ocular trauma, diabetes.",
    lakshana: ["Severe eye pain radiating to head", "Coloured halos around lights", "Blurred vision", "Nausea/vomiting in acute attack", "Fixed mid-dilated pupil"],
    diagnostic: "IOP measurement (Goldmann), gonioscopy, optic disc + visual field examination; acute closure — urgent referral.",
    pathya: "Triphala, Ghrita, adequate hydration, control BP + diabetes, avoid dim-light activities.",
    apathya: "Prolonged reading in dim light, excessive fluid intake at one go, drugs with anticholinergic effect.",
    prognosis: "Yapya; medical control preserves vision; surgery in refractory cases.",
    references: "AYUSH ASTG 2017 — Chapter 34.",
    levels: [
      L1("PHC", "Refer to ophthalmology; adjuvant Ayurveda.", [
        { name: "Saptamrita Loha", formulation: "Loha", dose: "125 mg BD", anupana: "Madhu + Ghrita", duration: "12 weeks", isCommon: true },
        { name: "Triphala Ghrita", formulation: "Ghrita", dose: "5 g BD", anupana: "Warm milk", duration: "12 weeks" },
      ]),
      L2("CHC", "Compound formulations.", [
        { name: "Chandraprabha Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "12 weeks" },
        { name: "Punarnava Mandura", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "12 weeks" },
      ]),
      L3("District Hospital", "Netra kriyakalpa + specialist follow-up.", [
        { name: "Triphala Ghrita", formulation: "Ghrita", dose: "Netra Tarpana", anupana: "-", duration: "7 days" },
      ], "Netra Tarpana with Triphala Ghrita; Shirodhara; Nasya with Anu Taila; concurrent anti-glaucoma drops."),
    ],
  },

  dantavestaka: {
    definition: "Dantavestaka is Kapha-Rakta dushti of gums with inflammation and bleeding; correlates with Gingivitis / Periodontitis.",
    nidana: "Poor oral hygiene, plaque + calculus, smoking, diabetes, vitamin C deficiency, hormonal changes.",
    lakshana: ["Gum redness + swelling", "Bleeding on brushing", "Halitosis", "Loose teeth in periodontitis", "Pus discharge from periodontal pocket"],
    diagnostic: "Clinical + periodontal probing; dental X-ray for bone loss in periodontitis.",
    pathya: "Warm water rinses, Til taila gandusha, Triphala mouth rinse, vitamin C rich diet.",
    apathya: "Sugar excess, smoking, tobacco chewing, hard toothbrush, skipping brushing.",
    prognosis: "Sukha-sadhya in gingivitis; Krichra when bone loss (periodontitis).",
    references: "AYUSH ASTG 2017 — Chapter 35.",
    levels: [
      L1("PHC", "Oral hygiene + medicated rinse.", [
        { name: "Triphala Churna", formulation: "Churna", dose: "3 g HS", anupana: "Ushna jala", duration: "4 weeks", isCommon: true },
        { name: "Irimedadi Taila", formulation: "Taila", dose: "Gandusha 10 ml BD", anupana: "-", duration: "4 weeks", isCommon: true },
      ]),
      L2("CHC", "Local application + Rasaushadhi.", [
        { name: "Khadiradi Vati", formulation: "Vati", dose: "500 mg QID", anupana: "Chewing", duration: "4 weeks" },
        { name: "Dashana Samskara Churna", formulation: "Churna", dose: "Local application BD", anupana: "-", duration: "4 weeks" },
      ]),
      L3("District Hospital / Dental Referral", "Scaling + Kavala.", [
        { name: "Triphala Kashaya", formulation: "Kashaya", dose: "Kavala Graha BD", anupana: "-", duration: "4 weeks" },
      ], "Kavala Graha with Triphala Kashaya; Gandusha with Til Taila; refer for scaling + root planing."),
    ],
  },

  mukhapaka: {
    definition: "Mukhapaka is Pitta dushti of oral mucosa with painful ulcers; correlates with Aphthous / Recurrent Stomatitis.",
    nidana: "Vitamin B/iron deficiency, stress, spicy food, minor oral trauma, hormonal changes, Behçet's disease.",
    lakshana: ["Round/oval yellow-based ulcers with red halo", "Vedana on eating/speaking", "Multiple sites — lips, tongue, buccal", "Recurrence in cycles", "Fever + malaise in severe cases"],
    diagnostic: "Clinical; CBC, ferritin, B12, folate if recurrent; biopsy if non-healing >2 weeks.",
    pathya: "Cooling foods, coconut water, ghee application, honey + Yashtimadhu locally, adequate hydration.",
    apathya: "Spicy-hot food, citrus fruits, sharp/coarse foods, alcohol, tobacco, stress.",
    prognosis: "Sukha-sadhya; recurrence common — treat underlying deficiency.",
    references: "AYUSH ASTG 2017 — Chapter 36.",
    levels: [
      L1("PHC", "Pitta-shamana + local application.", [
        { name: "Khadiradi Vati", formulation: "Vati", dose: "500 mg QID", anupana: "Chewing", duration: "2 weeks", isCommon: true },
        { name: "Triphala Churna", formulation: "Churna", dose: "Local application BD", anupana: "-", duration: "2 weeks" },
        { name: "Yashtimadhu Churna", formulation: "Churna", dose: "1 g + honey local application", anupana: "-", duration: "2 weeks", isCommon: true },
      ]),
      L2("CHC", "Rasaushadhi for recurrent cases.", [
        { name: "Praval Pishti", formulation: "Bhasma", dose: "250 mg BD", anupana: "Madhu", duration: "2 weeks" },
        { name: "Kamadudha Rasa", formulation: "Rasa", dose: "250 mg BD", anupana: "Milk", duration: "2 weeks" },
      ]),
      L3("District Hospital", "Kavala + specialist workup for deficiency.", [
        { name: "Yashtimadhu Kashaya", formulation: "Kashaya", dose: "Kavala BD", anupana: "-", duration: "2 weeks" },
      ], "Kavala with Yashtimadhu Kashaya; Pratisarana with Triphala; correct nutritional deficiency."),
    ],
  },

  pratishyaya: {
    definition: "Pratishyaya is Kapha-Vata dushti of Nasa producing nasal discharge, obstruction and sneezing; correlates with Allergic Rhinitis / Sinusitis.",
    nidana: "Allergen exposure (dust, pollen, dander), viral URTI, cold exposure, deviated septum, adenoid hypertrophy.",
    lakshana: ["Nasa srava (watery/purulent)", "Nasa avarodha (obstruction)", "Kshavathu (sneezing)", "Shirashula, Ghrana upaghata", "Facial pain over sinuses"],
    diagnostic: "Clinical; anterior rhinoscopy; X-ray/CT paranasal sinuses in chronic sinusitis; allergy testing.",
    pathya: "Warm water, steam inhalation, Trikatu, Ardraka, Tulsi, avoid known allergens, warm environment.",
    apathya: "Cold water, ice cream, curd, dust exposure, cold air-conditioning.",
    prognosis: "Sukha-sadhya in acute; Yapya in allergic type with recurrent episodes.",
    references: "AYUSH ASTG 2017 — Chapter 37.",
    levels: [
      L1("PHC", "Kapha-shamana + Nasya.", [
        { name: "Tribhuvana Kirti Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Ardraka swarasa", duration: "2 weeks", isCommon: true },
        { name: "Sitopaladi Churna", formulation: "Churna", dose: "3 g BD", anupana: "Madhu", duration: "2 weeks" },
        { name: "Laxmivilasa Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Ardraka swarasa", duration: "2 weeks" },
      ]),
      L2("CHC", "Shadbindu Nasya + Kaphaghna vati.", [
        { name: "Shadbindu Taila", formulation: "Taila", dose: "Nasya 2 drops each nostril BD", anupana: "-", duration: "2 weeks" },
        { name: "Vyoshadi Vati", formulation: "Vati", dose: "250 mg QID", anupana: "Chewing", duration: "2 weeks" },
      ]),
      L3("District Hospital", "Panchakarma for chronic disease.", [
        { name: "Anu Taila", formulation: "Taila", dose: "Nasya 6-8 drops each nostril", anupana: "-", duration: "7-14 days" },
      ], "Nasya with Anu Taila; Dhoomapana; Vamana in Kaphaja pradhana type."),
    ],
  },

  shiroroga: {
    definition: "Shiroroga is a group of Tridoshaja head disorders — includes Vataja, Pittaja, Kaphaja Shirashula and Ardhavabhedaka (Migraine).",
    nidana: "Stress, missed meals, sleep deprivation, hormonal changes, cheese/chocolate/alcohol triggers, refractive error.",
    lakshana: ["Shirashula (unilateral or bilateral)", "Photophobia, phonophobia", "Nausea, vomiting", "Aura in classical migraine", "Aggravation by triggers"],
    diagnostic: "Clinical (IHS criteria); MRI brain if red flags (thunderclap onset, focal signs, age >50 new-onset).",
    pathya: "Regular meals, adequate sleep, hydration, Draksha, Kharjura, Shirodhara, avoid identified triggers.",
    apathya: "Skipping meals, sleep deprivation, chocolate/cheese/red wine if triggers, screen fatigue, stress.",
    prognosis: "Yapya; abortive + prophylactic management gives good control.",
    references: "AYUSH ASTG 2017 — Chapter 38.",
    levels: [
      L1("PHC", "Abortive Pitta-shamana + trigger avoidance.", [
        { name: "Godanti Bhasma", formulation: "Bhasma", dose: "125 mg BD", anupana: "Madhu", duration: "4 weeks", isCommon: true },
        { name: "Shirashuladi Vajra Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Madhu", duration: "4 weeks" },
        { name: "Pathyadi Kwatha", formulation: "Kwatha", dose: "40 ml BD", anupana: "Empty stomach", duration: "4 weeks" },
      ]),
      L2("CHC", "Prophylactic Rasaushadhi.", [
        { name: "Sutashekhara Rasa", formulation: "Rasa", dose: "125 mg BD", anupana: "Madhu", duration: "4 weeks" },
        { name: "Kamadudha Rasa", formulation: "Rasa", dose: "250 mg BD", anupana: "Milk", duration: "4 weeks" },
      ]),
      L3("District Hospital", "Bahya chikitsa for refractory migraine.", [
        { name: "Ksheerabala Taila", formulation: "Taila", dose: "Shirodhara", anupana: "-", duration: "7-14 days" },
      ], "Shirodhara with Ksheerabala Taila; Nasya with Anu Taila; Shiro Basti in chronic Vataja Shirashula."),
    ],
  },
};

const d = (
  ch: number,
  name: string,
  modern: string,
): Disease => {
  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return { ch, key, name, modern, ...(PROTOCOLS[key] ?? {}) };
};

export const CATEGORIES: Category[] = [
  {
    key: "pranavaha",
    icon: "🫁",
    name: "Pranavaha Srotas",
    sanskrit: "Pranavaha Srotas",
    modern: "Respiratory System",
    diseases: [
      d(1, "Kasa", "Cough"),
      d(2, "Tamaka Swasa", "Bronchial Asthma"),
    ],
  },
  {
    key: "annavaha",
    icon: "🍽️",
    name: "Annavaha Srotas",
    sanskrit: "Annavaha Srotas",
    modern: "Digestive System",
    diseases: [d(3, "Amlapitta", "Hyperacidity / GERD")],
  },
  {
    key: "udakavaha",
    icon: "💧",
    name: "Udakavaha Srotas",
    sanskrit: "Udakavaha Srotas",
    modern: "Water Channels",
    diseases: [d(4, "Jalodara", "Ascites")],
  },
  {
    key: "rasavaha",
    icon: "🩸",
    name: "Rasavaha Srotas",
    sanskrit: "Rasavaha Srotas",
    modern: "Plasma / Nutrition",
    diseases: [
      d(5, "Amavata", "Rheumatoid Arthritis"),
      d(6, "Jwara", "Fever (incl. Dengue)"),
      d(7, "Pandu", "Anaemia"),
    ],
  },
  {
    key: "raktavaha",
    icon: "🔴",
    name: "Raktavaha Srotas",
    sanskrit: "Raktavaha Srotas",
    modern: "Blood",
    diseases: [
      d(8, "Ekakushtha", "Psoriasis"),
      d(9, "Kamala", "Jaundice / Liver Disease"),
    ],
  },
  {
    key: "medovaha",
    icon: "⚖️",
    name: "Medovaha Srotas",
    sanskrit: "Medovaha Srotas",
    modern: "Metabolic",
    diseases: [
      d(10, "Hypothyroidism", "Hypothyroidism"),
      d(11, "Madhumeha", "Diabetes Mellitus"),
      d(12, "Sthoulya", "Obesity"),
    ],
  },
  {
    key: "purishavaha",
    icon: "🟫",
    name: "Purishavaha Srotas",
    sanskrit: "Purishavaha Srotas",
    modern: "Excretory",
    diseases: [
      d(13, "Arsha", "Haemorrhoids / Piles"),
      d(14, "Atisara", "Diarrhoea"),
      d(15, "Bhagandara", "Fistula-in-Ano"),
      d(16, "Krimi", "Worm Infestation"),
      d(17, "Parikartika", "Fissure-in-Ano"),
    ],
  },
  {
    key: "manovaha",
    icon: "🧠",
    name: "Manovaha Srotas",
    sanskrit: "Manovaha Srotas",
    modern: "Mental Health",
    diseases: [
      d(18, "Anidra", "Insomnia"),
      d(19, "Apasmara", "Epilepsy"),
      d(20, "Vishada", "Depression"),
    ],
  },
  {
    key: "mutravaha",
    icon: "🫘",
    name: "Mutravaha Srotas",
    sanskrit: "Mutravaha Srotas",
    modern: "Urinary",
    diseases: [
      d(21, "Ashmari", "Urinary Calculi / Kidney Stone"),
      d(22, "Mutraghata", "Urinary Retention"),
      d(23, "Mutrasthila", "BPH / Prostate"),
    ],
  },
  {
    key: "artavavaha",
    icon: "🌸",
    name: "Artavavaha Srotas",
    sanskrit: "Artavavaha Srotas",
    modern: "Reproductive",
    diseases: [
      d(24, "Asrigdara", "DUB / Menorrhagia"),
      d(25, "Kashtaarthava", "Dysmenorrhoea"),
      d(26, "Shwetapradara", "Leucorrhoea"),
    ],
  },
  {
    key: "vata-vyadhi",
    icon: "⚡",
    name: "Vata Vyadhi",
    sanskrit: "Vata Vyadhi",
    modern: "Neurological",
    diseases: [
      d(27, "Avabahuka", "Frozen Shoulder"),
      d(28, "Katigraha", "Low Back Pain"),
      d(29, "Gridhrasi", "Sciatica"),
      d(30, "Pakshaghata", "Hemiplegia / Stroke"),
      d(31, "Sandhigata Vata", "Osteoarthritis"),
      d(32, "Vatarakta", "Gout"),
    ],
  },
  {
    key: "netragata",
    icon: "👁️",
    name: "Netragata Roga",
    sanskrit: "Netragata Roga",
    modern: "Eye",
    diseases: [
      d(33, "Abhishyanda", "Conjunctivitis"),
      d(34, "Adhimantha", "Glaucoma"),
    ],
  },
  {
    key: "urdhwa-jatrugata",
    icon: "🦷",
    name: "Urdhwa Jatrugata",
    sanskrit: "Urdhwa Jatrugata",
    modern: "ENT / Head",
    diseases: [
      d(35, "Dantavestaka", "Gingivitis"),
      d(36, "Mukhapaka", "Stomatitis / Mouth Ulcer"),
      d(37, "Pratishyaya", "Rhinitis / Sinusitis"),
      d(38, "Shiroroga", "Headache / Migraine"),
    ],
  },
  {
    key: "metabolic-2025",
    icon: "🧬",
    name: "Metabolic Disorders",
    sanskrit: "Santarpanajanya Vikara",
    modern: "Metabolic (2025 STG)",
    guidelineYear: 2025,
    sourceNote: "Ministry of AYUSH, Directorate General of Health Services, April 2025",
    diseases: [
    {
      ch: 39, key: "madhumeha-2025", name: "Madhumeha", modern: "Diabetes Mellitus", guidelineYear: 2025,
      references: "AYUSH STG Metabolic Disorders 2025 — Chapter 1.",
      definition: "Diabetes Mellitus is a chronic disorder resulting from aberrations in insulin secretion, insulin action, or both. The persistent hyperglycemic state in this condition leads to long term damage, dysfunction, and failure of various organs. Type 2 Diabetes Mellitus (T2DM) accounts for approximately 90-95% of all diabetes cases and arises due to insulin resistance and relative insulin deficiency. Madhumeha is a Vataja Prameha, while Diabetes Mellitus predominantly presents with Kaphaja Prameha characteristics. The end stage of any Prameha, if not managed, leads to the Madhumeha stage.",
      nidana: "Aetiological factors: Sahaja (inherent predisposition), Apatyanimittaja (indulgence in incompatible food habits and unrecommended daily activities), Vikaravighata bhava abhava (destruction of bodily components related to carbohydrate metabolism, including pancreatic cells and related antibodies). Pathogenesis: Avaranajanya Vataprakopaja Madhumeha (obstructive pathogenesis) and Dhatukshayajanya Vataprakopaja Madhumeha (depletion of dhatus). Lifestyle factors: Excess intake of guru (heavy), snigdha (unctuous), amla (sour), and lavana (salty) foods; navannapana (newly harvested grains); nidraasyasukhani (sedentary lifestyle); tyaktavyayama (lack of exercise); chinta (excess mental stress); sanshodhanamakurvatam (not undergoing purificatory therapies).",
      lakshana: ["Prabhuta Mutrata (excessive urination - frequent urination with increased quantity)", "Aavila Mutrata (turbid urine)", "Madhura Mutrata (sweet and whitish urine)", "Mutravaivarnya (altered color in urine)", "Mutradourgandhya (foul-smelling urine)", "Shastapada Pippatikabhischa Sharira Mutrabhisharanam (gathering of ants on or towards excreted urine)", "Mukhatalakanthashosham (dryness of mouth, palate, and throat)", "Pipasa/Trit (increased thirst)", "Karapada daha/Hastapadataladaha (burning sensation in palms/soles)", "Angeshu Paridaha (burning sensation all over the body)", "Karapadyo Suptata (numbness in hands and feet)", "Angeshu Suptata (numbness in body parts)", "Gatranaam Aguruta (feeling of heaviness in the body)", "Nidra, Nidrayancha Sarvakaalam (always feeling sleepy and drowsy)", "Alasyam (laziness)", "Shayyasana Swapna Sukherati (preference for sleeping, resting, and lying down always)", "Shithilangata/Sada (laxity of muscles and body in general)", "Shwasa Dourgandhyam (bad breath/foul smell in inhaled breath)", "Visyansharira Gandham (musty body odor)", "Saveda (excessive sweating)", "Kayachidreshu Upadeham/Talu-gala-jihwa-Danteshu Malotapatti/Dantadinam Maladhyatvam/Hrunetrajihwashravanopadeha (deposition of grime/dirt or coating over throat-palate-tongue and teeth)", "Asyamadhuryam (sweet taste in the mouth)", "Jaribhavah Keshanaam (matted hair)", "Vriddhih Cha Nakhanam (excessive growth of nails)", "Vriddhih Cha Keshanaam (excessive growth of hairs)", "Shitati Pratyatvam (preference for cold temperature and cold things)"],
      diagnostic: "The diagnostic criteria for Diabetes Mellitus (non-pregnant individuals) are: HbA1C ≥ 6.5% OR FPG ≥ 126 mg/dL (fasting for at least 8h) OR Random plasma glucose ≥ 200 mg/dL in an individual with classic symptoms of hyperglycemia or hyperglycemic crisis. In the absence of unequivocal hyperglycemia, diagnosis requires two abnormal test results. For pre-diabetes: IFG: FPG 110 mg/dL to 125 mg/dL OR HbA1c ≥ 5.7%-6.4%. Clinical diagnosis as per Ayurveda is based on prodromal symptoms (purvarupa) and general symptoms (samanya lakshana) of Prameha, particularly excessive and turbid urination.",
      pathya: "Dietary recommendations: Cereals like Yava (Barley), Godhuma (wheat), Purana Shali (old rice), Millets. Pulses like Adhaki (red gram), Kulattha (horse gram), Mudga (green gram), Masura (lentils), Makushtha (moth bean), Chanaka (chickpea). Vegetables, especially bitter and astringent leafy greens like Navapatola (young Tricosanthus dioica), Karevellaka (bitter gourd), Shigru (drumstick), Vrintaaka (brinjal), Methika (fenugreek leaves). Fruits: Jambu (Syzygium cumini), Kapitha (Feronia limonia), Amlaki (Phyllanthus embilica), Bilva (bael), Dadima (pomegranate). Fats and Condiments: Atasi (flaxseed oil), Sarshapa (mustard oil), Haridra (turmeric), Maricha (pepper), Tvak (cinnamon), Lashuna (garlic), Shunthi (ginger), Methika (fenugreek), Dhanyaka (coriander), Jeeraka (cumin). Drink Jambu, Kapitha, Amalaki, or Bilva juice without sweeteners or methi water in the early morning. A balanced diet with high fiber, lean proteins, and limited carbohydrates and fats is essential. Lifestyle recommendations: Regular physical activities like long walks, swimming, hard labor for 30 minutes daily. Yogasanas (Vajrasana, Paschimottasana, Ardhamatsyendrasana, Halasana), Pranayama (Anuloma Viloma, Chandra Bhedana, Surya Bhedana, Bhastrika, Bhramari, Sheetali/Sitkari). Mudras (Linga, Surya, Prana, Apana, Gyana). Shuddhi Kriyas (Kapalbhati, Agnisara Kriya, Vaman Dhauti, Shankhaprakshalana). Meditation. Adequate sleep (6-8 hours at night). Practice Sad vritta, Dinacharya, and Ritucharya.",
      apathya: "Dietary restrictions: Excessive consumption of sweets, fruit salad, sugarcane and its byproducts (jaggery, sugar, honey, dairy foods), high-glycemic index fruits (mango, watermelon, chikoo, dates, jackfruits, custard apples, bananas, grapes), cashew nuts, cold drinks, oily or fried foods containing hydrogenated ghee, overindulgence in meat (especially of wet-land animals), eating food before complete digestion of previous food, and consuming food at improper times and in varied quantities. Lifestyle restrictions: Physical inactivity, avoidance of exercise, laziness, sleeping during the daytime, awakening at night, long duration of sleep, consumption of alcohol, use of tobacco, smoking, excessive use of sugar and its products, suppression of natural urges, and excessive bio-cleansing therapy.",
      prognosis: "Madhumeha, when occurring in lean individuals (krishavan), independently due to genetic causes (Sahaja karana), or associated with complications (upadravas), is considered incurable (Asadhya). It is also incurable when there is Dhatu Kshaya with involvement of deep and vital Dhatus like Majja, Vasa, Oja, and Lasika, and when Vatakara Nidanas (Vata dosha related causes) are present. It is manageable with continuous care (Yapya) if it is of recent origin (nava) and due to improper management of other 19 types of Prameha (Apatyanimittaja).",
      levels: [
        { level: 1, label: "Primary Health Centre (PHC)", facility: "Solo Physician Clinic/Health & Health Clinic/PHC", description: "Initial stages of the disease (purvavastha and vyaktavastha of madhumeha), with mildly raised blood sugar levels and no complications. Patients are either Sthula (obese) or Krisha (lean) with moderate physical strength and blood sugar levels within FBS >110 up to 180 PPBS > 200 up to 280 mg/dL. Management focuses on clinical diagnosis, OPD level management, and lifestyle modification.", panchakarma: "Not specified for this level, focus is on Shamana (palliative therapy).", medicines: [
          { dosha: "Pramehaghna", name: "Nishamalaki Churna", formulation: "Powder", dose: "3-6 gm in three divided doses", anupana: "Lukewarm water", duration: "30 days and can be continued", notes: "Indicated for Prameha." },
          { dosha: "Pramehaghna", name: "Asanadi Kwatha", formulation: "Decoction", dose: "10-15 ml twice a day", anupana: "Lukewarm water", duration: "30 days and can be continued", notes: "Indicated for Prameha." },
          { dosha: "Prameha", name: "Katakakhadiradi Kashayam or Nishakatakadi Kashayam", formulation: "Decoction", dose: "15-30 ml twice a day", anupana: "Lukewarm water", duration: "30 days and can be continued", notes: "Indicated for Prameha." },
          { dosha: "Prameha, Sarvarogahara", name: "Chandraprabha Vati", formulation: "Tablet", dose: "250 mg thrice a day", anupana: "Water", duration: "30 days and can be continued", notes: "Indicated for Prameha and as a general tonic." },
          { dosha: "Sarvarogahara, Hepatotonic", name: "Arogyavardhini Vati", formulation: "Tablet", dose: "1-2 tablets thrice a day", anupana: "Lukewarm water", duration: "30 days", notes: "Acts as a general tonic and hepatoprotective." },
          { dosha: "Prameha, Sarvarogahara", name: "Shilajatu Prayoga", formulation: "Tablet", dose: "250-500 mg", anupana: "Lukewarm water", duration: "30 days", notes: "Indicated for Prameha and as a general tonic." },
          { dosha: "Prameha", name: "Phalatrikadi Kwatha Choorna", formulation: "Decoction", dose: "15-30 ml twice a day", anupana: "Lukewarm water", duration: "30 days and can be continued", notes: "Indicated for Prameha." },
        ] },
        { level: 2, label: "Community Health Centre (CHC)", facility: "CHC/Small hospitals (10-20 bedded hospitals with basic facilities including routine investigations and X-ray)", description: "Management of Vyaktavstha and Bhedavastha of Madhumeha, including cases referred from Level 1, or fresh cases evaluated for complications. This level incorporates Shamana (palliative therapy) and, for eligible patients, Shodhana (bio-purificatory procedures).", panchakarma: "Shodhana Chikitsa (bio-purificatory procedures) may be considered, particularly in Sthula (obese) patients with strong build and Adhika Dosha Bala (more doshas). Internal therapeutic procedures include Vamana (medically induced emesis) with Madanaphala Yoga (15 gms) and vamanopaga like Madhuyashti Phanta or Saindhava Jala for vitiated Kapha and Pitta. Virechana (medically induced purgation) with Virechana Yoga (10 gm) for mildly increased Pitta-Kapha. Nitya Virechana with Triphala Churna (10 gms) at night for 7 days. Basti (medicated enema) with Asthapana Basti (Surasadigana Kashaya with Mahoushadha, Bhadradraru, Musta, Madhu, Saindhava) for Vata dominance. Nasya Karma (nasal medication) with Triphaladi Taila for excessive sleep and lethargy. External therapeutic procedures include Sarvanga Ruksha Udwarthana (rubbing with medicated dry powder) using Triphala Churna or Yava Churna or Kolakulatha Churna for 7 days, especially in obese individuals with Bahuabaddhamedas, to aid weight loss and maintain body stability.", medicines: [
          { dosha: "Prameha", name: "Nishamalaki Churna", formulation: "Powder", dose: "3-6 gm in three divided doses", anupana: "Lukewarm water", duration: "30 days and can be continued", notes: "Administered for palliative management of Prameha." },
          { dosha: "Prameha", name: "Katakakhadiradi Kashayam or Nishakatakadi Kashayam", formulation: "Decoction", dose: "15-30 ml twice a day", anupana: "Lukewarm water", duration: "30 days and can be continued", notes: "Administered for palliative management of Prameha." },
          { dosha: "Prameha, Sarvarogahara", name: "Chandraprabha Vati or Arogyavardhini Vati", formulation: "Tablets", dose: "250 mg thrice a day", anupana: "Water", duration: "30 days and can be continued", notes: "Administered for palliative management of Prameha and as a general tonic." },
          { dosha: "Prameha, Upadrava (complications), Rasayana, Dhatuposhaka", name: "Vasanthakusumakara Rasa or Trivangabhasma", formulation: "Tablet", dose: "125-250 mg twice daily", anupana: "Lukewarm water", duration: "15-30 days", notes: "Herbo-mineral drugs (Rasaushadhi) for Prameha and its complications, with rejuvenating and nourishing properties." },
          { dosha: "Prameha", name: "Darvyadi Ghrita or Triphala Ghrita", formulation: "Ghrita (medicated ghee)", dose: "5-10 ml", anupana: "Lukewarm water", duration: "15-30 days", notes: "Ghrita preparations for Prameha." },
        ] },
        { level: 3, label: "District Hospital", facility: "Ayush hospitals attached with Teaching Institution, District Level/Integrated/State Ayush Hospitals", description: "Management of Bhedavastha and Upadrava, including patients with HbA1c above 9. This level includes advanced panchakarma procedures, single herbs, and compound formulations, alongside comprehensive diagnostic and psychological assessments.", panchakarma: "Full Panchakarma procedures as per applicability. Shodhana Chikitsa (bio-purificatory procedures) to be considered for Sthula (obese) patients with strong build and Adhika Dosha Bala (more doshas). Internal therapeutic procedures include Vamana (medically induced emesis) with Madanaphala Yoga (15 gms) and vamanopaga like Madhuyashti Phanta or Saindhava Jala for vitiated Kapha and Pitta. Virechana (medically induced purgation) with Virechana Yoga (10 gm) for mildly increased Pitta-Kapha. Nitya Virechana with Triphala Churna (10 gms) at night for 7 days. Basti (medicated enema) with Asthapana Basti (Surasadigana Kashaya with Mahoushadha, Bhadradraru, Musta, Madhu, Saindhava) for Vata dominance. Nasya Karma (nasal medication) with Triphaladi Taila for excessive sleep and lethargy. External therapeutic procedures include Sarvanga Ruksha Udwarthana (rubbing with medicated dry powder) using Triphala Churna or Yava Churna or Kolakulatha Churna for 7 days, especially in obese individuals with Bahuabaddhamedas, to aid weight loss and maintain body stability.", medicines: [
          { dosha: "Prameha and its complications", name: "Nyagrodhadi Churna", formulation: "Powder", dose: "3-6 gm", anupana: "Lukewarm water", duration: "15-30 days", notes: "Effective in the management of T2DM and its complications." },
          { dosha: "Prameha, Vrana (ulcers), Rasayana, Balya, Yogavahi", name: "Swarnamakshika Bhasma", formulation: "Tablet", dose: "250 mg", anupana: "Honey", duration: "15-30 days", notes: "Herbo-mineral preparation (Bhasma) with multiple therapeutic properties for Prameha and related conditions." },
          { dosha: "Pramehaghna", name: "Nishamalaki Churna", formulation: "Powder", dose: "3-6 gm in three divided doses", anupana: "Lukewarm water", duration: "30 days and can be continued", notes: "Administered for palliative management of Prameha, as per Levels 1 and 2." },
          { dosha: "Prameha", name: "Katakakhadiradi Kashayam or Nishakatakadi Kashayam", formulation: "Decoction", dose: "15-30 ml twice a day", anupana: "Lukewarm water", duration: "30 days and can be continued", notes: "Administered for palliative management of Prameha, as per Levels 1 and 2." },
          { dosha: "Prameha, Sarvarogahara", name: "Chandraprabha Vati or Arogyavardhini Vati", formulation: "Tablets", dose: "250 mg thrice a day", anupana: "Water", duration: "30 days and can be continued", notes: "Administered for palliative management of Prameha and as a general tonic, as per Levels 1 and 2." },
          { dosha: "Prameha, Upadrava (complications), Rasayana, Dhatuposhaka", name: "Vasanthakusumakara Rasa or Trivangabhasma", formulation: "Tablet", dose: "125-250 mg twice daily", anupana: "Lukewarm water", duration: "15-30 days", notes: "Herbo-mineral drugs (Rasaushadhi) for Prameha and its complications, with rejuvenating and nourishing properties, as per Level 2." },
          { dosha: "Prameha", name: "Darvyadi Ghrita or Triphala Ghrita", formulation: "Ghrita (medicated ghee)", dose: "5-10 ml", anupana: "Lukewarm water", duration: "15-30 days", notes: "Ghrita preparations for Prameha, as per Level 2." },
        ] },
      ],
    },
    {
      ch: 40, key: "medoroga-2025", name: "Medoroga", modern: "Dyslipidemia", guidelineYear: 2025,
      references: "AYUSH STG Metabolic Disorders 2025 — Chapter 2.",
      definition: "Dyslipidemias are disorders of lipoprotein metabolism resulting in high total cholesterol (TC), high low-density lipoprotein cholesterol (LDL-C), high non-high-density lipoprotein cholesterol (non-HDL-C), and high triglycerides.",
      nidana: "Dyslipidemia can be caused by genetic mutations (primary) or by improper lifestyle such as lack of physical activity, unhealthy food habits, alcohol intake, smoking, and certain health conditions like obesity, hypothyroidism, diabetes, CKD, and liver disease (secondary). In Ayurveda, it is considered a result of an imbalance in Kapha dosha, leading to excessive accumulation of Medo Dhatu (fat tissue). It can also be linked to Medovaha Srotas Vidha or Dushti.",
      lakshana: ["Mēdastusarvabhūtānāmudarēṣvasthiṣusthitam (tendency of fat to accumulate in the abdomen and in the bony prominences)", "Daurgandhya (bad odour)", "Kṣuta (voracious appetite)", "Tr̥ṣā (thirst)", "Kṣudraśvāsa (dyspnoea on exertion)", "kasa (cough) (difficulty/hard breathing)", "alpeऽpiceshtitesvasham (dyspnoea on little exertion)", "Snigdhangata (unctuousness of body parts)", "Sthulashophata (non pitting oedema)", "Sāda (exhaustion or tiredness of body)", "Svapna (sleepiness)", "Ayathōpacayōtsāhaḥ (vigour is not in proportion to body bulk)", "Shrama (exhaustion/fatigue)", "Alpachestitha Shrama", "Swasha", "Xanthomas (yellowish fat deposits visible on the skin)", "Arcus senilis (gray or white ring around the eye’s cornea)", "Lipemia retinalis (milky appearance in the retinal vessels with blurred vision)", "Lower limb ischemia", "Angina", "Transient ischemic attacks and strokes", "Non-Alcoholic Fatty liver disease / Metabolic Dysfunction Associated Steatohepatitis(MASH)"],
      diagnostic: "Dyslipidemia is often diagnosed with routine screening tests, primarily by measuring serum lipids through a fasting lipid profile, which includes total cholesterol (TC), triglycerides (TGs), high-density lipoprotein cholesterol (HDL-C), and low-density lipoprotein cholesterol (LDL-C).",
      pathya: "Low calorie diet, wholesome balanced food, diet with low salt & trans-fat, non-saturated fats (mustard oil, groundnut oil, coconut oil, avocados, nuts, lean meats, skinless poultry, low-fat or non-fat dairy products like cow’s ghee and cow’s milk), polyunsaturated fats (fish like salmon, mackerel, sardines), omega-3 fatty acids (flaxseeds, sunflower seeds, chia seeds, walnuts), fiber-rich diet (at least 25-30 grams daily from whole grains, vegetables, fruits, oats, barley, beans, lentils, cowpea, Rajmah, apples, citrus fruits), whole grains (brown rice, red rice, black rice, wheat, quinoa), quality protein intake (soy protein, low fat paneer), early dinner, freshly cooked food. Nitya Sevaniyadravyas include Shashtika Shali, Yava/Barley, Mudga, Saindhava, Amalaki, Honey.",
      apathya: "High calorie diet, ultra-processed food, diet with high salt, sugar & trans-fat, saturated and trans fats (red meat, full-fat dairy products, butter, partially hydrogenated oils, baked goods, snacks, margarines), low fiber processed food diet, soft drinks, fast food, canned soups, salty snacks, alcohol, refined grain (white rice, white flour/Maida), high-cholesterol foods, fatty food, sodium, late night dinner, refrigerated/stale food, dried meat (Vallura), dried vegetables (Shushka Shakha), coagulated/fermented milk (kūrcika), cream cheese (Kilata), pork (sukara), black gram/black lentil (Masha).",
      prognosis: "Dyslipidemias are majority of the times asymptomatic and are accidentally diagnosed on routine blood tests. Few patients with severe or untreated dyslipidemia may present with signs and symptoms related to the complications of dyslipidemia, such as coronary artery disease, peripheral arterial disease, stroke, atherosclerosis and heart failure.",
      levels: [
        { level: 1, label: "PHC", facility: "Solo physician clinic, health clinic, PHC", description: "Optimal standard of treatment where technology and resources are limited. Clinical diagnosis focuses on understanding signs and symptoms and considering the broader clinical context, including family history and risk factors. Diagnosis is primarily based on fasting lipid profile.", panchakarma: "Udvartana (in kaphavruddhi/medovruddhi/obese conditions), Lekhana (therapeutic scrapping in ati kapha and atimeda conditions).", medicines: [
          { dosha: "Kapha", name: "Shunthi Churna", formulation: "Powder", dose: "2-3 gm in 2-3 divided doses", anupana: "Luke warm water", duration: "1-3 months", notes: "Before meal. Agnidipana, Amapachana, Srotoshodhana, Kapha-Medanashaka, Rasa-Raktaprasadana, Virechaka property." },
          { dosha: "Kapha", name: "Vidanga Churna", formulation: "Powder", dose: "5-10 gm in 2-3 divided doses", anupana: "Luke Warm water", duration: "1 month", notes: "Before meal. Agnidipana, Amapachana, Srotoshodhana, Kapha-Medanashaka, Rasa-Raktaprasadana, Virechaka property." },
          { dosha: "Kapha", name: "Haritaki Churna", formulation: "Powder", dose: "3-6 gm in 1-2 divided doses", anupana: "Luke Warm water", duration: "1-3 months", notes: "Before meal or at bed time. Agnidipana, Amapachana, Srotoshodhana, Kapha-Medanashaka, Rasa-Raktaprasadana, Virechaka property." },
          { dosha: "Kapha, Vata", name: "Navaka Guggulu", formulation: "Tablet", dose: "500 mg - 1 gm BD", anupana: "Luke Warm water or Shunthisiddha Jala", duration: "1-3 months", notes: "Agnidipana, Amapachana, Srotoshodhana, Kapha-Medanashaka, Rasa-Raktaprasadana, Virechaka property." },
          { dosha: "Kapha", name: "Triphala Churna", formulation: "Powder", dose: "3-5 gm OD/BD", anupana: "Luke Warm water", duration: "1-3 months", notes: "Agnidipana, Amapachana, Srotoshodhana, Kapha-Medanashaka, Rasa-Raktaprasadana, Virechaka property." },
          { dosha: "Kapha", name: "Trikatu Churna", formulation: "Powder", dose: "1-2 gm BD", anupana: "Luke Warm water", duration: "1-3 months", notes: "Agnidipana, Amapachana, Srotoshodhana, Kapha-Medanashaka, Rasa-Raktaprasadana, Virechaka property." },
          { dosha: "Kapha", name: "Medohar Guggulu", formulation: "Tablet", dose: "500 mg - 1 gm Twice daily", anupana: "Luke Warm water", duration: "1-3 months", notes: "Before meal. Agnidipana, Amapachana, Srotoshodhana, Kapha-Medanashaka, Rasa-Raktaprasadana, Virechaka property." },
          { dosha: "Kapha", name: "Triphala Guggulu", formulation: "Tablet", dose: "1-3 gms in 2-3 divided doses", anupana: "Luke Warm water", duration: "1-3 months", notes: "Agnidipana, Amapachana, Srotoshodhana, Kapha-Medanashaka, Rasa-Raktaprasadana, Virechaka property." },
        ] },
        { level: 2, label: "CHC", facility: "CHC/Small hospitals (10-20 bedded hospitals with basic facilities such as routine, investigation, ECG and 2D Echo)", description: "Clinical diagnosis same as level 1. Cases referred from Level 1, or fresh cases, must be evaluated thoroughly for any complications. Investigations may include high sensitivity C-reactive protein, Apolipoprotein B (ApoB), apolipoprotein A1, Lipoprotein(a), Glycosylated hemoglobin (HbA1c), Fasting blood glucose (FBS), Thyroid stimulating hormone level (TSH), Transaminase (AL T), Serum creatinine, Creatine kinase, Urine analysis, Homocysteine levels, Fundoscopy. Treatment from Level 1 may be continued, or new medications may be considered based on symptoms.", panchakarma: "Udvartana (in kaphavruddhi/medovruddhi/obese conditions), Lekhana (therapeutic scrapping in ati kapha and atimeda conditions).", medicines: [
          { dosha: "Kapha", name: "Shunthi Churna", formulation: "Powder", dose: "2-3 gm in 2-3 divided doses", anupana: "Luke warm water", duration: "1-3 months", notes: "Before meal. Agnidipana, Amapachana, Srotoshodhana, Kapha-Medanashaka, Rasa-Raktaprasadana, Virechaka property." },
          { dosha: "Kapha, Pitta", name: "Arogyavardhini Vati", formulation: "Tablet", dose: "250-500 mg Once/twice daily", anupana: "Warm water or Honey or Adrak Swarasa", duration: "1 month" },
          { dosha: "Vata, Kapha", name: "Lashunadi Vati", formulation: "Tablet", dose: "500 mg BD", anupana: "Warm water or Ark pudina or Ark Ajwain", duration: "1 month" },
          { dosha: "Kapha, Vata", name: "Navaka Guggulu", formulation: "Tablet", dose: "500mg-1 gm BD", anupana: "Luke Warm water or Shunthisiddha Jala", duration: "1-3 months" },
          { dosha: "Kapha", name: "Medohar Guggulu", formulation: "Tablet", dose: "500mg-1 gm Twice daily", anupana: "Luke Warm water", duration: "1-3 months", notes: "Before meal." },
          { dosha: "Kapha", name: "Triphala Guggulu", formulation: "Tablet", dose: "1-3 gms in 2-3 divided doses", anupana: "Luke Warm water", duration: "1-3 months" },
          { dosha: "Kapha", name: "Musta churna", formulation: "powder", dose: "3-6 gm Thrice daily", anupana: "Luke Warm Water", duration: "1-3 months", notes: "Before meal." },
          { dosha: "Kapha", name: "Vrikshamla churna", formulation: "powder", dose: "3-5gm Twice daily", anupana: "Luke Warm Water", duration: "1-3 months", notes: "Before food." },
        ] },
        { level: 3, label: "District Hospital", facility: "Ayush hospital attached to teaching institute, district level/integrated state Ayush hospital, tertiary care hospital, tertiary care allopathic hospital having Ayush facilities. Multiple departments/facilities for diagnosis and interventions, including dieticians and counselling.", description: "Confirm diagnosis and severity. Investigations may include Plasma Leptin, Treadmill Test or Exercise stress Test. Treatment from Levels 1 & 2 may be continued, or new medications may be considered based on symptoms and identified causes.", panchakarma: "Udvartana (in kaphavruddhi/medovruddhi/obese conditions), Lekhaneya Basti, Virechana.", medicines: [
          { dosha: "Vata, Kapha", name: "Vyoshadi Guggulu (A.H)", formulation: "Tablet", dose: "1 gm TID", anupana: "Lukewarm water", duration: "1-3 months", notes: "Associated with ama and vata vikara like pain dominant conditions. A/F (After Food)." },
          { dosha: "Kapha", name: "Ayaskriti", formulation: "Arishta", dose: "20 ml BD", anupana: "Warm water", duration: "1 month", notes: "Vibandha, deepanapachana, medohara, Hridya. A/F (After Food)." },
          { dosha: "Kapha", name: "Sthoulyahara Kashaya (Sahasra Yoga)", formulation: "Kashaya", dose: "15-20ml BD", anupana: "60ml lukewarm water", duration: "1 month", notes: "Medovridhi/Sthoulya. B/F (Before Food)." },
          { dosha: "Kapha, Pitta", name: "Medohara Vidangadi Lauham", formulation: "Tablet", dose: "250-500 mg OD/BD", anupana: "Warm water", duration: "1 month", notes: "Pandu associated with Medovridhi. A/F (After Food)." },
          { dosha: "Kapha, Pitta", name: "Tryushanadi Lauham", formulation: "Tablet", dose: "500-750 mg BD", anupana: "Warm water/honey", duration: "1 month", notes: "Medovridhi with diabetes, skin disease, digestive disorders. A/F (After Food)." },
          { dosha: "Kapha", name: "Asanadi Kashaya", formulation: "Kashaya", dose: "15-20 ml BD", anupana: "60ml lukewarm water", duration: "1 month", notes: "Medovridhi/Sthoulya. B/F (Before Food)." },
        ] },
      ],
    },
    {
      ch: 41, key: "vatarakta-2025", name: "Vatarakta", modern: "Gout", guidelineYear: 2025,
      references: "AYUSH STG Metabolic Disorders 2025 — Chapter 3.",
      definition: "Gout is a chronic disease of deposition of monosodium urate crystals (crystal-induced arthritis), which form in the presence of increased urate concentrations. It is characterized by severe pain, redness, and tenderness in joints due to too much uric acid crystal deposits. Vatarakta is a disorder characterized by chronic joint and body pain along with stiffness, swelling over joints due to vitiated Vata dosha as well as Rakta dhatu.",
      nidana: "Hyperuricemia, genetic factors, dietary factors (meat, seafood, sugar-sweetened soft drinks, foods high in fructose, alcohol especially beer and hard liquor), obesity, hypertriglyceridemia, metabolic syndrome, increased diuretic use, chronic renal disease, recent surgery or trauma, hypertension, diabetes, menopause. Vata and Rakta get aggravated due to their own aggravating factors.",
      lakshana: ["Intense joint pain (affecting large joint of big toe, ankles, knees, elbows, wrists, fingers, peaking within 4-12 hours)", "Lingering discomfort (days to weeks)", "Inflammation and redness (swollen, tender, warm, red joints)", "Limited range of motion (as gout progresses)"],
      diagnostic: "Identification of urate crystals in fluid from an affected joint is the definitive diagnostic test. Clinical diagnosis based on history and physical examination. Supportive investigations: Serum urate concentration, X-ray (low sensitivity, shows soft tissue volume/density, tophi, erosions, Martel’s sign in chronic cases), Ultrasonography (double Contour sign), DECT (visualization of tophi and bone erosion), Synovial fluid examination (MSU crystals), CBC/ESR, Renal function, Fasting lipids, glucose, and thyroid functions, Urinary urate excretion, CRP, RA factor. ACR/EULAR gout classification criteria 2015 for diagnosis (score >= 8).",
      pathya: "Properly cooked and fresh food in appropriate quantity, old cereals (wheat, red rice, barley), pulses (green gram, chickpea, red lentil), fruits (Draksha, ash gourd), vegetables (bitter gourd, elephant-foot yam, pointed gourd), vegetables with less or no oil/ghee, spices (rock salt, black pepper, asafoetida), judicious intake of milk, ghee, and butter (cow/goat), herbs (Kakamachi, Shatavari, Vastuka, Upodika, Tanduliya, Dhatriphala, Shringavera). Internal and external oiling (Snehana) in Vata dominant condition, deep muscular massage (Mardana), Upanaha, Sheeta or Ushna Parisheka, Medicated Poultice (Pradeha), gentle massage (Mridusamvahana), appropriate exercises and adequate rest (sukhashayana). Yoga practices like Pranayama, twisting movements, Vajrasana, Trikonasana, Dhanurasana, Naukasana, Ardha Matsyendrasana, Pavana Muktasana, Surya Namaskara.",
      apathya: "Excessive intake of dried/preserved/frozen foods, refined foods (bakery products from white flour), excessive intake of pulses (black gram, horse gram, white pea), cold beverages (cold drinks, liquor, cold water), excessive intake of radish, flat beans, betel leaf, excessive intake of meat of aquatic/marine animals (Anupa Mamsa), excessive intake of sour and pungent food (Atikatu), excessive intake of curd, curd products, sugarcane juice, incompatible food items (fruits with milk). Suppression of natural urges (hunger, bowel, urine, emotions), daytime sleeping (Diwaswapna), excessive exercise (Vyayama), activities increasing body temperature (Santapa) like sun bath (Aatapa Sevana), and excessive indulgence in sexual intercourse (Maithuna).",
      prognosis: "Gout undergoes four phases: asymptomatic hyperuricemia, acute gouty attack, inter-critical period, and chronic tophaceous gout, which can lead to significant morbidity and functional impairment if untreated. Avastha Bheda: Uttana Vatarakta (superficial tissues, itching, burning, pain, vessel dilatation, throbbing, contraction, cyanosis/red skin, splitting pain, heaviness, numbness), Gambhira Vatarakta (deeper tissues, fixed swelling, indurations, deep pain, black/coppery skin, burning, pricking, throbbing, ulceration), Ubhayashrita Vatarakta (both superficial and deep symptoms, cutting pain, joint disfigurement, lameness, paraplegia, widespread Vata). Dosha Bheda: Vataja, Raktaja, Pittaja, Kaphaja, Dvandvaja, Sannipataja.",
      levels: [
        { level: 1, label: "PHC", facility: "Solo Physician Clinic/Health & Health Clinic/PHC", description: "Optimal standard of treatment in situations where technology and resources are limited. For initial stage with mild symptoms and slightly elevated uric acid.", panchakarma: "None specified for this level.", medicines: [
          { dosha: "Vata Rakta", name: "Guduchi Kwatha", formulation: "Decoction", dose: "60-80 ml in two divided doses", anupana: "Lukewarm Water", duration: "Thrice a day for 2-3 months for aam conditions", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Guduchi Swarasa", formulation: "Swarasa", dose: "10-20 ml", anupana: "None", duration: "Thrice a day for 2-3 months for aam conditions", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Kaishora Guggulu", formulation: "Vati", dose: "1-3 gm in 2-3 divided doses", anupana: "Warm Water", duration: "Twice/Thrice daily for 2-3 weeks", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Amrutadi Guggulu", formulation: "Vati", dose: "500 mg-1 gm in 2-3 divided doses", anupana: "Warm water", duration: "Thrice a day, 2-3 weeks", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Gokshuradi Guggulu", formulation: "Vati", dose: "500 mg-1 gm in 2-3 divided doses", anupana: "Warm water", duration: "Thrice a day, 2-3 weeks", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Punarnava Guggulu", formulation: "Vati", dose: "1-3 gm in 2-3 divided doses", anupana: "Warm Water", duration: "2-3 weeks", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Pinda taila", formulation: "Taila", dose: "Q.S", anupana: "None", duration: "1-2 times daily for 2-3 weeks", notes: "External application" },
          { dosha: "Vata Rakta", name: "Ksheerbala taila", formulation: "Taila", dose: "Q.S", anupana: "None", duration: "1-2 times daily for 2-3 weeks", notes: "External application" },
        ] },
        { level: 2, label: "CHC", facility: "CHC/Small hospitals (10-20 bedded hospitals with basic facilities such as routine, investigation, X-ray)", description: "For cases referred from Level 1 or fresh cases, evaluated thoroughly for complications. Includes investigations beyond clinical diagnosis.", panchakarma: "Koshta Shuddhi: Avipattikara Churna (5-10 gm with warm water at bedtime) or Eranda taila (10-15 ml at bedtime). Other Upakramas: Lepa (Grihadhumadi, Jadamayadi), Parisheka (Dashamoola Ksheera Parisheka, Taila Parisheka in Stambha Akshepa Shula using Sahacharadi, Pindataila, DhanvantaramTaila, Ksheerabala Taila), Abhyanga with suitable oil as per Ama/Nirama Avastha.", medicines: [
          { dosha: "Vata Rakta", name: "Brhatmanjistadi Kwatha", formulation: "Decoction", dose: "60-80 ml in two divided doses", anupana: "None", duration: "Thrice a day for 2-3 weeks", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Simhanada Guggulu", formulation: "Vati", dose: "1-3 gm in 2-3 divided doses", anupana: "Warm water", duration: "2-3 weeks", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Panchtikta Guggulu Ghrita", formulation: "Ghee", dose: "5-10 gm twice daily", anupana: "Milk, warm water", duration: "2-3 weeks", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Sukumara Ghrita", formulation: "Ghee", dose: "10-15 gm twice daily", anupana: "Milk, warm water", duration: "2-3 weeks", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Jivaniya Ghrita", formulation: "Ghee", dose: "10-12 gm twice daily", anupana: "Milk, warm water", duration: "2-3 weeks", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Grihadhumadi Lepa", formulation: "Churna", dose: "Q.S", anupana: "External application", duration: "Once daily for 15 days", notes: "External application" },
          { dosha: "Vata Rakta", name: "Nagaradi Lepa", formulation: "Churna", dose: "Q.S.", anupana: "External application", duration: "Once daily for 15 days", notes: "External application" },
          { dosha: "Vata Rakta", name: "Dashamoola Ksheera Kshira Paka", formulation: "Kshira Paka", dose: "Q.S.", anupana: "External application", duration: "Once daily for 15 days", notes: "External application" },
        ] },
        { level: 3, label: "District Hospital", facility: "Ayush hospitals attached with teaching Institution, District Level/Integrated/State Ayush Hospitals, Allopathic hospitals also having tertiary care facilities either standalone or integrative management facilities.", description: "Includes multiple departments/facilities for diagnosis and interventions, with additional facilities like dieticians, counselling, physiotherapy, and sophisticated procedures. Confirms diagnosis and severity with advanced investigations (MRI, CT scan, DECT, Cystatin C, IVP, chemical analysis of uric acid renal stones).", panchakarma: "Shodhana Chikitsa: Virechana Karma (Deepana pachana with Panchkola churna, Trikatu churna; Snehapana with Saindhavadi taila, Accha Ghrita for up to 7 days; Mrudu Abhyanga & Svedana with Ksirabala Taila, Pinda Taila, Bashpa Sveda; Virechana with Trivruta Avaleha, Abhayadi modaka, Eranda taila; Samsarjana for 3, 5, or 7 days). Rakta Mokshana (Leech therapy on painful and swollen joint for predominant Pitta and Rakta involvement). Basti (Matrabasti with Madhuyasti taila, Brihatsaindhavadi Taila in painful conditions/Amavastha; TiktaKshira Basti for Pitta Rakta involvement, Raktaprasadana, Kledaharana, Rasayana; Yapana Basti in gambhira vatarakta/less response to oral medications, e.g., Guduchyadi Yapana, Madhutailika Basti).", medicines: [
          { dosha: "Vata Rakta", name: "Shilajatu Rasayana", formulation: "Churna", dose: "500 mg – 1 gm", anupana: "Guduchi Kwatha", duration: "Early morning empty stomach for 2-3 months", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Pippali Rasayana", formulation: "Kshirapaka", dose: "3 Pippali in increasing dose up to 33 Pippali and reverse", anupana: "Milk", duration: "Early morning empty stomach for 22 days", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Madhusnuhi Rasayana", formulation: "Avaleha", dose: "6-12 gm", anupana: "Warm water", duration: "Once/twice daily for 1-3 months", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Chyavanaprasha", formulation: "Avaleha", dose: "12-24 gm", anupana: "warm water/ milk", duration: "Morning for 1-3 months", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Dashamulaharitaki Rasayana", formulation: "Avaleha", dose: "5-15 gm", anupana: "warm water/ milk", duration: "Morning for 1-3 months", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Panchkola churna (Virechana Deepana Pachana)", formulation: "Churna", dose: "Q.S", anupana: "None", duration: "As required for Deepana Pachana before Virechana", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Trikatu churna (Virechana Deepana Pachana)", formulation: "Churna", dose: "Q.S", anupana: "None", duration: "As required for Deepana Pachana before Virechana", notes: "Internal medicine" },
          { dosha: "Vata Rakta", name: "Saindhavadi taila (Virechana Snehapana)", formulation: "Taila", dose: "Q.S", anupana: "None", duration: "Up to Samyak snighdha Lakshana, max 7 days", notes: "Internal medicine" },
        ] },
      ],
    },
    {
      ch: 42, key: "yakrit-medoroga-2025", name: "Yakrit Medoroga", modern: "Non-Alcoholic Fatty Liver Disease (NAFLD)", guidelineYear: 2025,
      references: "AYUSH STG Metabolic Disorders 2025 — Chapter 4.",
      definition: "Non-alcoholic fatty liver disease (NAFLD) is a spectrum of chronic liver disease characterized by accumulation of fat in the liver, Non-alcoholic steatohepatitis (NASH), and liver fibrosis unrelated to recent or ongoing significant amount of alcohol intake and due to over-nutrition and its associated metabolic syndrome. It is also referred to as Metabolic-associated Fatty Liver Disease (MAFLD).",
      nidana: "Heavy fat rich diet (Guru and Ati-snigdha), junk food, soft drinks, sedentary lifestyle (Not following Dincharya and Ritucharya), Metabolic syndrome (Obesity, Diabetes Mellitus, Dyslipidaemia), drugs (e.g., Corticosteroids, Aspirin, Tetracycline). Ajirna, Sthaulya, and Prameha (Diabetes Mellitus) act as Nidanarthakara Rogas due to vitiation of Annavaha, Rasavaha, and Medovaha Srotas.",
      lakshana: ["Feeling of heaviness in the abdomen", "Abdominal distension", "Irregular appetite", "Irregular bowel habit", "Body ache", "Excessive belching", "Sour eructation", "Burning sensation in the chest and throat", "Loose stool (due to Ama dosha)", "Fatigue", "Nausea", "Vomiting", "Pruritus", "Ascites", "Memory impairment", "Right upper quadrant discomfort", "Hepatomegaly", "Acanthosis nigricans", "Lipomatosis", "Pandu (anemia)", "Kamala (jaundice)", "Raktapitta (bleeding disorders)"],
      diagnostic: "Diagnosis of NAFLD is often incidental via ultrasonography (USG) for dyspepsia or asymptomatic rise in transaminases. Screening is recommended for patients with type 2 diabetes mellitus, obesity, and metabolic syndrome. Diagnosis involves documenting hepatic steatosis via imaging and excluding secondary causes of hepatic steatosis, including alcoholic hepatic steatosis, hepatitis B and C, and autoimmune hepatitis. Essential investigations include: Liver function tests (mild to moderately elevated serum transaminases, especially ALT, raised alkaline phosphatase, albumin and bilirubin), Serum ferritin and transferrin saturation, clotting time, HbA1c, Fasting Blood glucose, Celiac disease screening, Lipid Profile, HBsAg, Hepatitis C. Ultrasonography grades hepatic steatosis (Grade 1: increased echogenicity; Grade 2: blurring of intravascular structures; Grade 3: deep attenuation of ultrasound signal). Advanced investigations at higher levels include Non-contrast CT scan (Liver attenuation index (LAI) < -10 HU suggestive of moderate to severe macrovesicular steatosis), and MR-PDFF (higher sensitivity). Hepatic fibrosis assessment uses FAST score, APRI score, Fibrosis-4 score (Fib-4), NAFLD fibrosis scores (NFS), BARD score, MRE, and MEFIB.",
      pathya: "Diet as per \"Eight Rules of Eating\" (Prakruti, Karan, Samyoga, Rashi, Desha, Kala, Upyogasamstha, Upabhokta). Include Shali, Shastika, Mudga, which are light and easily digestible. Diet with dry foods, Priyangu (Italian millet) Shyamaka (Sanwa millet), Yava (barley), kodrava (common millet), Mudga (green gram) Kulattha (horse-gram), Adhaki (pigeon pea) mixed with wild snake-gourd and Emblic myrobalan. Madhu udakam as drink. Wines eliminative of fat, flesh and Kapha. Regular intake of barley and wheat and Vyoshadi saktu. Physical activity, avoiding day-sleeping, over-indulgence in lounging and lying in soft beds. Exercise, fasting, smoking, and sudation are beneficial. Daily exercise or eating only after the previous meal has been digested. Yoga: Bhastrika, Kapalabhati, Anuloma-Viloma pranayama; twisting movements; Vajrasana, Trikonasana, Dhanurasana, Naukasana, Ardha Matsyendrasana, Pavana Muktasana, Surya namaskara.",
      apathya: "Food articles with excess unctuous, sweet, heavy and viscous substances, freshly harvested food grains, wines with the flesh of wetland and aquatic animals with cow’s milk and its products and the products of jaggery must be avoided.",
      prognosis: "NAFLD in obese patients has a better prognosis than in non-obese patients, which has a reasonably worse prognosis. Progression to NASH-cirrhosis or NASH associated Hepatocellular Carcinoma is a red flag. Cardiovascular diseases and cancer are common causes of mortality. Patients with NASH have higher liver-related mortality.",
      levels: [
        { level: 1, label: "PHC (shamana only)", facility: "Solo Physician clinic/Community wellness centres/PHC", description: "OPD level management for Grade-I Fatty Liver with symptoms like heaviness of abdomen, constipation, and flatulence. Focuses on Agnidipana, Amapachana, Srotoshodhana, kapha-medanashaka, rasa-raktaprasadana, virechaka and Yakritshothahara treatments.", panchakarma: "None", medicines: [
          { dosha: "Kapha-Meda/Vata", name: "Triphala Churna", formulation: "Churna", dose: "3-5 grams", anupana: "Luke warm water", duration: "15 days", notes: "At Bed time" },
          { dosha: "Kapha-Meda/Vata", name: "Eranda Bhrista Haritaki", formulation: "Churna", dose: "5 grams", anupana: "Luke warm water", duration: "15 days", notes: "At Bed time" },
          { dosha: "Vata/Kapha", name: "Vaiswanar Churna", formulation: "Churna", dose: "1-3 grams", anupana: "Luke warm water", duration: "15 days", notes: "At Bed time" },
          { dosha: "Pitta/Vata", name: "Drakshavaleha", formulation: "Avaleha", dose: "6-12 grams", anupana: "Luke warm water", duration: "15 days", notes: "Twice daily after food" },
          { dosha: "Kapha/Pitta", name: "Phalatrikadi Kashaya", formulation: "Kashaya", dose: "25-50 ml", anupana: "Luke warm water", duration: "15 days", notes: "Morning and evening before/after food" },
          { dosha: "Pitta/Kapha", name: "Arogyavardhini Vati", formulation: "Vati", dose: "250-500 mg", anupana: "Luke warm water", duration: "15 days", notes: "Morning and evening before/after food" },
          { dosha: "Kapha/Vata", name: "Chitrakadi Gutika", formulation: "Gutika", dose: "250-500 mg", anupana: "Luke warm water", duration: "15 days", notes: "Morning and evening after food" },
          { dosha: "Kapha/Vata", name: "Triphala Guggulu", formulation: "Guggulu", dose: "1-3 gram", anupana: "Luke warm water", duration: "15 to 30 days", notes: "Morning and evening Before/food" },
        ] },
        { level: 2, label: "CHC (shamana + basic panchakarma)", facility: "CHC/Small hospitals (10-20 bed hospitals with basic facilities)", description: "In-patient management may be opted if necessary. Continuation of Level 1 treatments and addition of new medicines. Bio-purification procedures like Basti Chikitsa and Nitya Mridu Virechana.", panchakarma: "Basti Chikitsa (Matra Basti with Pippalyadi Anuvasana Taila, Ksheerabala Taila, Dhanwantaram Taila, Panchatikta Guggulu Ghrita; Karma vasti or Kala Vasti or Yoga Vasti with Dasamulakwatha, Eranda Taila). Vatanulomana/Nitya Mridu Virechana with Triphala Churna, Avipattikara Churna, Vaiswanar Churna or Drakshavaleha (5-10 gm daily at night with lukewarm water).", medicines: [
          { dosha: "Pitta/Kapha", name: "Katuki Churna", formulation: "Churna", dose: "3-5 grams", anupana: "Luke warm water", duration: "15 days", notes: "At Bed time" },
          { dosha: "Pitta/Kapha", name: "Trivrit Churna", formulation: "Churna", dose: "2-3 grams", anupana: "Luke warm water", duration: "15 days", notes: "At Bed time" },
          { dosha: "Pitta/Vata", name: "Avipattikar Churna", formulation: "Churna", dose: "3-6 grams", anupana: "Luke warm water", duration: "15 days", notes: "At Bed time" },
          { dosha: "Kapha/Pitta", name: "Eranda Bhrista Haritaki", formulation: "Churna", dose: "5 grams", anupana: "Luke warm water", duration: "15 days", notes: "At Bed time" },
          { dosha: "Pitta/Kapha", name: "Patola Katurohinyadi Kashaya", formulation: "Kashaya", dose: "30ml", anupana: "Luke warm water", duration: "15 days", notes: "Morning and evening after food" },
          { dosha: "Pitta/Kapha", name: "Rohitakarista", formulation: "Arista", dose: "12-24 ml", anupana: "With equal quantity of water", duration: "15 to 30 days", notes: "After Lunch and Dinner" },
          { dosha: "Kapha/Vata", name: "Shankha Vati", formulation: "Vati", dose: "250-500 mg", anupana: "Luke warm water", duration: "15 days", notes: "Morning and evening after food" },
          { dosha: "Kapha/Vata", name: "Agnitundi Vati", formulation: "Vati", dose: "250 mg", anupana: "Luke warm water", duration: "15 days", notes: "Morning and evening after food" },
        ] },
        { level: 3, label: "District Hospital (full panchakarma + advanced care)", facility: "Ayush hospitals attached with teaching institution, District level/State Ayush Hospitals, Tertiary care allopathic hospitals having Ayush facilities", description: "Indoor management may be preferred. Continuation of Level 1 and 2 treatments along with advanced formulations. Full Panchakarma procedures similar to Level 2.", panchakarma: "Same as Level 2: Basti Chikitsa (Matra Basti with Pippalyadi Anuvasana Taila, Ksheerabala Taila, Dhanwantaram Taila, Panchatikta Guggulu Ghrita; Karma vasti or Kala Vasti or Yoga Vasti with Dasamulakwatha, Eranda Taila). Vatanulomana/Nitya Mridu Virechana with Triphala Churna, Avipattikara Churna, Vaiswanar Churna or Drakshavaleha (5-10 gm daily at night with lukewarm water).", medicines: [
          { dosha: "Pitta/Kapha", name: "Patoladi Churna", formulation: "Churna", dose: "1-3 grams", anupana: "Luke warm water", duration: "15 days", notes: "At Bed time" },
          { dosha: "Pitta/Kapha", name: "Dhatri Lauha", formulation: "Lauha", dose: "250-500 mg", anupana: "Luke warm water", duration: "15-30 days", notes: "Twice daily" },
          { dosha: "Kapha/Vata", name: "Dasamula Haritaki Lehya", formulation: "Avaleha", dose: "5-10 grams", anupana: "Luke warm water", duration: "15-30 days", notes: "Twice daily" },
          { dosha: "Kapha/Vata", name: "Chitraka Guda", formulation: "Guda Paka", dose: "5-10 grams", anupana: "Luke warm water", duration: "15-30 days", notes: "Twice daily" },
          { dosha: "Pitta/Kapha", name: "Arogyavardhini Vati", formulation: "Vati", dose: "250-500 mg", anupana: "Luke warm water", duration: "15-30 days", notes: "Morning and evening before/after food" },
          { dosha: "Kapha/Vata", name: "Triphala Guggulu", formulation: "Guggulu", dose: "1-3 gram", anupana: "Luke warm water", duration: "15 to 30 days", notes: "Morning and evening before/food" },
        ] },
      ],
    },
    {
      ch: 43, key: "sthaulya-2025", name: "Sthaulya", modern: "Obesity", guidelineYear: 2025,
      references: "AYUSH STG Metabolic Disorders 2025 — Chapter 5.",
      definition: "Obesity is a chronic complex disease defined by excessive fat deposits that can impair health. In Ayurveda, it is described as Sthoulya, an abnormal and excessive accumulation of Medo Dhatu, often leading to a disfigured appearance, lack of enthusiasm, and pendulous Sphika, Udara, and Stana.",
      nidana: "Aharatmaka Hetu (dietary factors): Atisampurnata (excessive food intake), Adhyashana (frequent eating before digestion), Guru and Snigdha Ahara (heavy and unctuous food), Madhura Rasa Sevana (excessive sweet taste), Gramya Udaka Anupa Mamsa (meat from marshy areas and aquatic animals), Madya Sevana (excessive alcohol consumption). Viharatmaka Hetu (lifestyle factors): Avyayama (lack of exercise), Divaswapna and Atinidra (day sleeping and excessive sleep). Manasika Hetu (psychological factors): Achintana, Harshanitya, Mansonivriti, Saukhyena (lack of concern, constant happiness, mental inactivity, comfort). Anya Hetu (other factors): Beeja Svabhava (genetic predisposition).",
      lakshana: ["Ayushohrasa (Diminution of life span)", "Javoparodha (Lack of enthusiasm)", "KricchaVyavaya (Difficulty in sexual act)", "Daurbalya (General debility)", "Daurgandhya (Foul smelling of body)", "Swedabadha (Distressful sweating)", "Kshudhatimatra (Excessive hunger)", "Pipasatiyoga (Excessive thirst)", "Characteristic pendulous appearance of buttocks, belly and breasts"],
      diagnostic: "Diagnosis of overweight and obesity is made by measuring people’s weight and height and by calculating the body mass index (BMI). BMI categories for adults: Overweight ≥25 kg/m², Obesity I 25-29.9 kg/m², Obesity II ≥30 kg/m². Indian cut-offs for indicators: Waist Circumference (WC) >90 cm (male), >80 cm (female); Waist-Hip Ratio (WHR) >0.9 (male), >0.85 (female); Wrist circumference >16.5 cm (male), >15.7 cm (female); Neck circumference >35.25 cm (male), >34.25 cm (female); Body Fat Percentage >25% (male), >30% (female). Investigations include: CBC/ESR, fasting lipid profile, fasting plasma glucose, fasting insulin levels, serum uric acid, serum FT4 and TSH, HbA1c, 24-hour urine free cortisol, electrolyte panel, ECG, chest X-ray, respiratory function tests, liver function test, USG whole abdomen and pelvis, plasma leptin, insulin resistance tests, hormonal assays.",
      pathya: "Shuka Dhanya (Cereal grain): Purana Shali (old rice), Kodrava, Shyamak, Yava, Laja, Navara, Kangu. Shami Dhanya (Pulses): Mudga, Rajamasha, Kulattha, Chanaka, Masur, Adhaki, Makusthaka. Shaka Varga (Vegetables): Patola, Patrashaka, Shigru, Vruntaka, Vastuka, Trapusha, Vartaka, Evaruka, Ardraka, Mulaka, Surasa. Phala Varga (Fruits): Jambu, Amalaki, Ela, Bibhitaki, Haritaki, Maricha, Pippali, Erand Karkati, Narang, Bilvaphala. Drava Varga: Madhu (honey), Takra (buttermilk), Ushnajala (hot water), Tila & Sarshapa Taila, Medicated Alcoholic preparations. Mamsa Varga: Rohita Matsya (Rohu Fish).",
      apathya: "Ahara (Dietary): Naveen Dhanya (newly harvested rice), Masha (Vigna mungo), Kanda Shaka (Rhizome Vegetable), Madhura Phala (Sweet Fruits), Milk Preparations, Dadhi, Sarpi, Ikshuvikara (Products made from sugar cane), Aanupa, Audaka, Gramya Mamsa Sevana. Lifestyle: Sleeping in daytime, Sedentary lifestyle, lack of exercise, over eating, repeated eating, consuming cold water, excess intake of food, excess intake of sweets, fatty food, fried food, red meat etc.",
      prognosis: "If Sthaulya is left untreated, it can lead to many diseases such as Prameha, Mutrakriccha, Jvara, Ajirna, Atisara, Bhagandara, Arsha, Udara roga, Vatavikara, Kasa and Svasa. Obesity is a major risk factor for non-communicable diseases such as heart disease, stroke, type 2 diabetes, PCOS, and certain cancers. However, with lifestyle modification and treatment, it can be managed effectively.",
      levels: [
        { level: 1, label: "PHC (shamana only)", facility: "Solo Physician Clinic/Health & Health Clinic/PHC", description: "This level focuses on Shamana (palliative) therapy, emphasizing internal medications and dietary/lifestyle modifications. It is suitable for situations with limited technology and resources.", panchakarma: "Not applicable for this level, as it's shamana only.", medicines: [
          { dosha: "Kapha-Meda", name: "Vyoshadi Guggulu", formulation: "Tablet", dose: "1 gm (2 Tablets of 500mg each)", anupana: "Lukewarm water", duration: "1-3 months", notes: "TID (A/F)" },
          { dosha: "Kapha-Meda", name: "Triphala Churna", formulation: "Powder", dose: "3-5gm", anupana: "Warm water", duration: "1-3 months", notes: "BD (A/F)" },
          { dosha: "Kapha-Meda", name: "Ayaskriti", formulation: "Arishta", dose: "20ml", anupana: "Warm water", duration: "1-3 months", notes: "BD (A/F)" },
          { dosha: "Kapha-Meda", name: "Varanadi Kashaya", formulation: "Kashaya", dose: "15ml", anupana: "Lukewarm water", duration: "1-3 months", notes: "BD (B/F)" },
          { dosha: "Kapha-Meda", name: "Navaka Guggulu", formulation: "Tablet", dose: "500 mg-1 gm", anupana: "Warm water", duration: "1-3 months", notes: "BD (A/F)" },
          { dosha: "Kapha-Meda", name: "Kanchanara Guggulu", formulation: "Tablet", dose: "500 mg-1 gm", anupana: "Warm water", duration: "1-3 months", notes: "BD (A/F)" },
          { dosha: "Kapha-Meda", name: "Arogyavardhini vati", formulation: "Tablet", dose: "250-500 mg", anupana: "Warm water", duration: "1-3 months", notes: "Before meal/twice daily, Before food" },
        ] },
        { level: 2, label: "CHC (shamana + basic panchakarma)", facility: "CHC/Small hospitals (10-20 bedded hospitals with basic facilities such as routine, investigation, X-ray, Panchakarma facilities)", description: "This level includes Shamana therapy along with basic Panchakarma procedures like Udwarthana, Lekhaneeya Vasti, Virechana, and Vamana, suitable for facilities with basic panchakarma setup.", panchakarma: "Udwarthana (Triphala choorna, Kola Kulatthadi choorna) followed by Bashpa Sweda. Lekhaneeya Vasti (Madhu, Saindhava, Tila taila, Triphala kwatha, Gomutra, Yava kshara, Tuttha, Kasisa, Hingu Niryasa, Shilajatu). Virechana (Snehapana with Panchtikta Ghrita, Sarvanga Abhyanga with Murchitatilataila, Sarvangabashpasweda with Dashmoolkwath, Virechana with Trivrit Avaleha along with Anupana of Triphalakwath/Draksha Kashaya). Vamana.", medicines: [
          { dosha: "Kapha-Meda", name: "Vyoshadi Guggulu", formulation: "Tablet", dose: "1 gm (2 Tablets of 500mg each)", anupana: "Lukewarm water", duration: "1-3 months", notes: "TID (A/F)" },
          { dosha: "Kapha-Meda", name: "Vidanga Churna", formulation: "Powder", dose: "5-10 gm", anupana: "Warm water", duration: "1-3 months", notes: "BD (A/F)" },
          { dosha: "Kapha-Meda", name: "Lodhrasava", formulation: "Arishta", dose: "12-24 ml", anupana: "Warm water", duration: "1-3 months", notes: "BD (A/F)" },
          { dosha: "Kapha-Meda", name: "Guggulutiktaka Kashaya", formulation: "Kashaya", dose: "15ml", anupana: "Lukewarm water", duration: "1-3 months", notes: "BD (B/F)" },
          { dosha: "Kapha-Meda", name: "Medohara Guggulu", formulation: "Tablet", dose: "500 mg-1 gm", anupana: "Warm water", duration: "1-3 months", notes: "BD (A/F)" },
          { dosha: "Kapha-Meda", name: "Medohara Vidangadi Lauham", formulation: "Tablet", dose: "250-500 mg", anupana: "Warm water", duration: "1-3 months", notes: "BD (A/F)" },
          { dosha: "Kapha-Meda", name: "Loharishta", formulation: "Arishta", dose: "20ml", anupana: "Warm water", duration: "1-3 months", notes: "BD (A/F)" },
        ] },
        { level: 3, label: "District Hospital (full panchakarma + advanced care)", facility: "Ayush hospitals attached with teaching Institution, District Level/Integrated/State Ayush Hospitals", description: "This level offers comprehensive Panchakarma therapies (Shodhana, Purvakarma, Lekhana vasti, Yoga vasti, Kala vasti, Karma vasti) along with Shamana chikitsa, and advanced diagnostic capabilities.", panchakarma: "Shodhana. Poorvakarma: Snigdha Udwartana (Triphala churna with murchitatila taila) for 3-7 days in obesity with dryness; Ruksha Udwartana (Triphala or Kolakulatthadi churna or Godhuma churna). Snehapana with tikta ghrita (Gugguluthiktaka ghrita, Varanadi ghrita, Triphala ghrita) for 3-7 days, followed by Vishrama kala of 1 day (Abhyanga, steam, dadhipathya). Vamana (if Kapha Pradhana) or Virechana (if Pitta dominance) with Trivrut lehya. Lekhana vasti (if Vata dominance) using drugs with lekhana properties: Yoga vasti (8 days), Kala vasti (16 days), Karma vasti (30 days).", medicines: [
          { dosha: "Kapha-Meda", name: "Vyoshadi Guggulu", formulation: "Tablet", dose: "1 gm (2 Tablets of 500mg each)", anupana: "Lukewarm water", duration: "1-3 months", notes: "TID (A/F)" },
          { dosha: "Kapha-Meda", name: "Triphala Churna", formulation: "Powder", dose: "3-5gm", anupana: "Warm water", duration: "1-3 months", notes: "BD (A/F)" },
          { dosha: "Kapha-Meda", name: "Sthoulyahara Kashaya (Sahasra Yoga)", formulation: "Kashaya", dose: "15ml", anupana: "Lukewarm water", duration: "1-3 months", notes: "BD (B/F)" },
          { dosha: "Kapha-Meda", name: "Amritadi guggulu", formulation: "Tablet", dose: "500 mg-1 gm", anupana: "Warm water", duration: "1-3 months", notes: "BD (A/F)" },
          { dosha: "Kapha-Meda", name: "Musta Churna", formulation: "Powder", dose: "3-6 gm", anupana: "Warm water", duration: "1-3 months", notes: "Twice/Thrice daily, before meal" },
          { dosha: "Kapha-Meda", name: "Shilajatu Churna", formulation: "Churna", dose: "500 mg", anupana: "Warm water", duration: "1-3 months", notes: "Before meal/ Twice daily" },
          { dosha: "Kapha-Meda", name: "Brihat Manjisthadi kwat", formulation: "Decoction", dose: "20-40 ml", anupana: "Warm water", duration: "1-3 months", notes: "Twice daily/ Before meal" },
          { dosha: "Kapha-Meda", name: "Triphala Guggulu", formulation: "Tablet", dose: "1-3 gms", anupana: "Warm water", duration: "1-3 months", notes: "Twice daily before meal" },
        ] },
      ],
    },
    ],
  },
];

export function findDisease(categoryKey: string, diseaseKey: string) {
  const category = CATEGORIES.find((c) => c.key === categoryKey);
  if (!category) return null;
  const disease = category.diseases.find((dx) => dx.key === diseaseKey);
  if (!disease) return null;
  return { category, disease };
}
