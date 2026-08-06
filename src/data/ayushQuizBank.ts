/**
 * AYUSH Student Quiz Bank
 * 100+ MCQs across Ayurveda, Siddha, Unani, Homeopathy, Yoga & Naturopathy
 * Difficulty: easy | medium | hard
 * Used for Daily Quiz, Mock Tests, Inter-College Competitions
 */

export type QuizSubject =
  | "Anatomy (Shareera Rachana)"
  | "Physiology (Shareera Kriya)"
  | "Dravyaguna (Pharmacology)"
  | "Roga Nidana (Pathology)"
  | "Kayachikitsa (Medicine)"
  | "Samhita (Classical Texts)"
  | "Rasashastra (Pharmaceutics)"
  | "Shalya Tantra (Surgery)"
  | "Prasuti & Stree Roga"
  | "Panchakarma"
  | "Swasthavritta (Preventive)"
  | "Homeopathy"
  | "Siddha"
  | "Unani"
  | "Yoga & Naturopathy";

export type Difficulty = "easy" | "medium" | "hard";

export type QuizQuestion = {
  id: number;
  subject: QuizSubject;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0-3
  explanation: string;
  reference?: string;
};

export const QUIZ_SUBJECTS: { value: QuizSubject; label: string; icon: string }[] = [
  { value: "Anatomy (Shareera Rachana)", label: "Shareera Rachana", icon: "🦴" },
  { value: "Physiology (Shareera Kriya)", label: "Shareera Kriya", icon: "🫀" },
  { value: "Dravyaguna (Pharmacology)", label: "Dravyaguna", icon: "🌿" },
  { value: "Roga Nidana (Pathology)", label: "Roga Nidana", icon: "🔬" },
  { value: "Kayachikitsa (Medicine)", label: "Kayachikitsa", icon: "💊" },
  { value: "Samhita (Classical Texts)", label: "Samhita", icon: "📜" },
  { value: "Rasashastra (Pharmaceutics)", label: "Rasashastra", icon: "⚗️" },
  { value: "Shalya Tantra (Surgery)", label: "Shalya Tantra", icon: "🔪" },
  { value: "Prasuti & Stree Roga", label: "Prasuti Tantra", icon: "🤰" },
  { value: "Panchakarma", label: "Panchakarma", icon: "🧘" },
  { value: "Swasthavritta (Preventive)", label: "Swasthavritta", icon: "🛡️" },
  { value: "Homeopathy", label: "Homeopathy", icon: "💧" },
  { value: "Siddha", label: "Siddha", icon: "🪷" },
  { value: "Unani", label: "Unani", icon: "🌙" },
  { value: "Yoga & Naturopathy", label: "Yoga", icon: "🧘‍♀️" },
];

export const QUIZ_BANK: QuizQuestion[] = [
// ══════════ SAMHITA (Classical Texts) ══════════
{id:1,subject:"Samhita (Classical Texts)",difficulty:"easy",question:"How many chapters are there in Charaka Samhita?",options:["120","150","100","80"],correctIndex:0,explanation:"Charaka Samhita has 120 chapters (Adhyayas) divided into 8 Sthanas.",reference:"Charaka Samhita"},
{id:2,subject:"Samhita (Classical Texts)",difficulty:"easy",question:"Who is considered the 'Father of Surgery' in Ayurveda?",options:["Charaka","Sushruta","Vagbhata","Kashyapa"],correctIndex:1,explanation:"Sushruta is known as the Father of Surgery. Sushruta Samhita is the earliest text on surgical techniques.",reference:"Sushruta Samhita"},
{id:3,subject:"Samhita (Classical Texts)",difficulty:"medium",question:"Ashtanga Hridaya was written by?",options:["Charaka","Sushruta","Vagbhata","Madhava"],correctIndex:2,explanation:"Ashtanga Hridaya was authored by Vagbhata, a comprehensive compendium of Ayurveda.",reference:"Ashtanga Hridaya"},
{id:4,subject:"Samhita (Classical Texts)",difficulty:"medium",question:"Which Sthana of Charaka Samhita deals with therapeutics?",options:["Sutra Sthana","Chikitsa Sthana","Nidana Sthana","Vimana Sthana"],correctIndex:1,explanation:"Chikitsa Sthana (30 chapters) deals with treatment of various diseases.",reference:"C.S.Ci."},
{id:5,subject:"Samhita (Classical Texts)",difficulty:"hard",question:"The concept of 'Shadvidha Pareeksha' is described in which text?",options:["Charaka Samhita","Sushruta Samhita","Ashtanga Sangraha","Yoga Ratnakara"],correctIndex:1,explanation:"Shadvidha Pareeksha (six methods of examination) is primarily described in Sushruta Samhita.",reference:"S.S.Su."},
{id:6,subject:"Samhita (Classical Texts)",difficulty:"easy",question:"Sahasrayogam belongs to which tradition of Ayurveda?",options:["North Indian","South Indian (Kerala)","Tibetan","Sri Lankan"],correctIndex:1,explanation:"Sahasrayogam is a classical Kerala Ayurveda text containing thousands of formulations.",reference:"Sahasrayogam"},
{id:7,subject:"Samhita (Classical Texts)",difficulty:"medium",question:"Bhaishajya Ratnavali was written by?",options:["Govind Das","Sharangadhara","Bhavamishra","Chakrapanidatta"],correctIndex:0,explanation:"Bhaishajya Ratnavali was authored by Govind Das Sen in the 18th century.",reference:"B.R."},

// ══════════ DRAVYAGUNA (Pharmacology) ══════════
{id:8,subject:"Dravyaguna (Pharmacology)",difficulty:"easy",question:"What is the Rasa (taste) of Haritaki (Terminalia chebula)?",options:["Pancharasa (5 tastes except Lavana)","Madhura only","Tikta only","Kashaya only"],correctIndex:0,explanation:"Haritaki has 5 rasas except Lavana (salt). It is called 'Sarvaroga nivarini'.",reference:"B.P.N. Haritakyadi Varga"},
{id:9,subject:"Dravyaguna (Pharmacology)",difficulty:"easy",question:"Ashwagandha (Withania somnifera) is primarily indicated for?",options:["Balya (strength) & Vataroga","Pitta disorders","Kapha disorders only","Eye diseases"],correctIndex:0,explanation:"Ashwagandha is Balya, Rasayana, and Vatahara. It provides strength and nourishment.",reference:"D.V."},
{id:10,subject:"Dravyaguna (Pharmacology)",difficulty:"medium",question:"Which drug is known as 'Tridosha shamaka' (balances all three doshas)?",options:["Guduchi (Tinospora cordifolia)","Pippali","Marica","Vidanga"],correctIndex:0,explanation:"Guduchi is Tridoshahara and Rasayana. It is called 'Amrita' (nectar).",reference:"B.P.N."},
{id:11,subject:"Dravyaguna (Pharmacology)",difficulty:"medium",question:"The Vipaka (post-digestive effect) of Pippali is?",options:["Madhura","Katu","Amla","Kashaya"],correctIndex:0,explanation:"Despite having Katu Rasa, Pippali has Madhura Vipaka - this is an exception (Prabhava).",reference:"D.V."},
{id:12,subject:"Dravyaguna (Pharmacology)",difficulty:"hard",question:"'Bhringaraja' is the best drug for which condition according to Bhavaprakasha?",options:["Keshya (hair growth)","Netrya (eye health)","Hridya (cardiac)","Medhya (brain)"],correctIndex:0,explanation:"Bhringaraja is considered the best Keshya (hair tonic) and also has hepatoprotective properties.",reference:"B.P.N."},
{id:13,subject:"Dravyaguna (Pharmacology)",difficulty:"easy",question:"Triphala consists of which three drugs?",options:["Haritaki, Bibhitaki, Amalaki","Pippali, Marica, Shunthi","Guduchi, Nimba, Vasa","Tulasi, Haridra, Kumari"],correctIndex:0,explanation:"Triphala = Haritaki + Bibhitaki + Amalaki. It is Tridoshahara and Rasayana.",reference:"Sharangadhara Samhita"},
{id:14,subject:"Dravyaguna (Pharmacology)",difficulty:"medium",question:"Trikatu consists of?",options:["Shunthi, Marica, Pippali","Haritaki, Bibhitaki, Amalaki","Musta, Haridra, Daruharidra","Vasa, Kantakari, Brihati"],correctIndex:0,explanation:"Trikatu (three pungents) = Shunthi (dry ginger) + Marica (black pepper) + Pippali (long pepper).",reference:"A.H.Su."},
// ══════════ ANATOMY (SHAREERA RACHANA) ══════════
{id:15,subject:"Anatomy (Shareera Rachana)",difficulty:"easy",question:"How many Marma points are described in Ayurveda?",options:["107","108","101","99"],correctIndex:0,explanation:"There are 107 Marma points described in Sushruta Samhita.",reference:"S.S.Sha. 6"},
{id:16,subject:"Anatomy (Shareera Rachana)",difficulty:"easy",question:"How many bones (Asthi) are described in Ayurveda?",options:["360","300","206","400"],correctIndex:0,explanation:"Charaka describes 360 Asthi (bones) in the human body.",reference:"C.S.Sha."},
{id:17,subject:"Anatomy (Shareera Rachana)",difficulty:"medium",question:"Hridaya (heart) is the seat of which entities according to Charaka?",options:["Ojas, Manas, Atma","Vata only","Pitta only","Kapha only"],correctIndex:0,explanation:"Hridaya is described as the seat of Ojas, Manas (mind), and Atma (soul).",reference:"C.S.Su. 30"},
{id:18,subject:"Anatomy (Shareera Rachana)",difficulty:"medium",question:"Total number of Srotas (channels) described by Charaka?",options:["13","14","11","16"],correctIndex:0,explanation:"Charaka describes 13 pairs of Srotas. Sushruta mentions 11.",reference:"C.S.Vi. 5"},
{id:19,subject:"Anatomy (Shareera Rachana)",difficulty:"hard",question:"Which Marma is located at the junction of head and neck?",options:["Krikatika","Manya","Sthapani","Shringataka"],correctIndex:0,explanation:"Krikatika Marma is located at the junction of Greeva (neck) and Shira (head). It is a Sandhi Marma.",reference:"S.S.Sha. 6"},

// ══════════ KAYACHIKITSA (Medicine) ══════════
{id:20,subject:"Kayachikitsa (Medicine)",difficulty:"easy",question:"Jwara (fever) is classified into how many types by Charaka?",options:["8","5","13","3"],correctIndex:0,explanation:"Charaka classifies Jwara into 8 types: Vataja, Pittaja, Kaphaja, VP, VK, PK, Sannipata, and Agantuja.",reference:"C.S.Ci. 3"},
{id:21,subject:"Kayachikitsa (Medicine)",difficulty:"easy",question:"The first disease described in Charaka Chikitsa Sthana is?",options:["Rasayana","Jwara","Raktapitta","Gulma"],correctIndex:0,explanation:"The first four chapters of Chikitsa Sthana deal with Rasayana (rejuvenation).",reference:"C.S.Ci. 1-4"},
{id:22,subject:"Kayachikitsa (Medicine)",difficulty:"medium",question:"Prameha (diabetes) has how many types according to Charaka?",options:["20","10","8","13"],correctIndex:0,explanation:"Charaka describes 20 types of Prameha: 4 Vataja, 6 Pittaja, and 10 Kaphaja.",reference:"C.S.Ci. 6"},
{id:23,subject:"Kayachikitsa (Medicine)",difficulty:"medium",question:"'Ama' in Ayurveda refers to?",options:["Undigested/toxic metabolic waste","A type of Dosha","A disease","A treatment"],correctIndex:0,explanation:"Ama is the product of impaired Agni (digestive fire). It is the root cause of many diseases.",reference:"A.H.Su. 13"},
{id:24,subject:"Kayachikitsa (Medicine)",difficulty:"hard",question:"According to Charaka, which is NOT a Nidana (cause) of Jwara?",options:["Excessive exercise after fasting","Abhishyandi food","Suppression of natural urges","Proper Dinacharya"],correctIndex:3,explanation:"Proper Dinacharya (daily routine) prevents disease. The others are all causes of Jwara.",reference:"C.S.Ci. 3"},

// ══════════ PHYSIOLOGY (SHAREERA KRIYA) ══════════
{id:25,subject:"Physiology (Shareera Kriya)",difficulty:"easy",question:"How many types of Agni (digestive fire) are described?",options:["13","7","3","5"],correctIndex:0,explanation:"13 types: 1 Jatharagni + 5 Bhutagni + 7 Dhatvagni.",reference:"C.S.Ci. 15"},
{id:26,subject:"Physiology (Shareera Kriya)",difficulty:"easy",question:"The main seat (Sthana) of Vata Dosha is?",options:["Pakwashaya (colon)","Amashaya (stomach)","Hridaya (heart)","Raktavaha srotas"],correctIndex:0,explanation:"Pakwashaya (large intestine/colon) is the main seat of Vata dosha.",reference:"A.H.Su. 12"},
{id:27,subject:"Physiology (Shareera Kriya)",difficulty:"medium",question:"How many types of Vata are described?",options:["5","3","7","10"],correctIndex:0,explanation:"5 types: Prana, Udana, Vyana, Samana, and Apana Vayu.",reference:"A.H.Su. 12"},
{id:28,subject:"Physiology (Shareera Kriya)",difficulty:"medium",question:"Rasa Dhatu is formed from food in approximately?",options:["6 days (Khale kapota nyaya)","1 day","30 days","12 hours"],correctIndex:0,explanation:"According to Khale Kapota Nyaya, Rasa dhatu forms in about 6 days after food intake.",reference:"C.S.Ci. 15"},
{id:29,subject:"Physiology (Shareera Kriya)",difficulty:"hard",question:"The sequence of Dhatu formation is?",options:["Rasa→Rakta→Mamsa→Meda→Asthi→Majja→Shukra","Rakta→Rasa→Mamsa→Asthi→Meda→Majja→Shukra","Rasa→Mamsa→Rakta→Meda→Asthi→Shukra→Majja","Rasa→Rakta→Meda→Mamsa→Asthi→Majja→Shukra"],correctIndex:0,explanation:"The 7 Dhatus form sequentially: Rasa, Rakta, Mamsa, Meda, Asthi, Majja, Shukra.",reference:"S.S.Su. 14"},

// ══════════ ROGA NIDANA (Pathology) ══════════
{id:30,subject:"Roga Nidana (Pathology)",difficulty:"easy",question:"Nidana Panchaka includes?",options:["Nidana, Purvarupa, Rupa, Upashaya, Samprapti","Nidana, Chikitsa, Prognosis, Diet, Lifestyle","Dosha, Dhatu, Mala, Agni, Srotas","Vata, Pitta, Kapha, Ojas, Tejas"],correctIndex:0,explanation:"Nidana Panchaka (5 diagnostic tools): Nidana (cause), Purvarupa (prodromal), Rupa (symptoms), Upashaya (therapeutic test), Samprapti (pathogenesis).",reference:"Madhava Nidana"},
{id:31,subject:"Roga Nidana (Pathology)",difficulty:"medium",question:"Shat Kriyakala (six stages of disease) was described by?",options:["Sushruta","Charaka","Vagbhata","Madhavakara"],correctIndex:0,explanation:"Sushruta described Shat Kriyakala: Sanchaya, Prakopa, Prasara, Sthana samshraya, Vyakti, Bheda.",reference:"S.S.Su. 21"},
{id:32,subject:"Roga Nidana (Pathology)",difficulty:"hard",question:"In Samprapti, 'Sthana Samshraya' means?",options:["Dosha localization in weak tissue","Dosha accumulation","Dosha spread","Disease manifestation"],correctIndex:0,explanation:"Sthana Samshraya is the 4th Kriyakala where vitiated Doshas localize in a weak Dhatu/organ.",reference:"S.S.Su. 21"},

// ══════════ PANCHAKARMA ══════════
{id:33,subject:"Panchakarma",difficulty:"easy",question:"Panchakarma literally means?",options:["Five procedures","Five doshas","Five medicines","Five diets"],correctIndex:0,explanation:"Pancha = Five, Karma = Procedures. The 5 are: Vamana, Virechana, Nasya, Basti, Raktamokshana.",reference:"A.H.Su. 14"},
{id:34,subject:"Panchakarma",difficulty:"easy",question:"Poorvakarma (preparatory procedures) of Panchakarma includes?",options:["Snehana & Swedana","Vamana & Virechana","Nasya & Basti","All of the above"],correctIndex:0,explanation:"Snehana (oleation) and Swedana (sudation) are the two main Poorvakarma procedures.",reference:"C.S.Si. 1"},
{id:35,subject:"Panchakarma",difficulty:"medium",question:"Vamana (therapeutic emesis) is the best treatment for which Dosha?",options:["Kapha","Vata","Pitta","Rakta"],correctIndex:0,explanation:"Vamana is the prime treatment for Kapha disorders. Virechana for Pitta. Basti for Vata.",reference:"C.S.Si."},
{id:36,subject:"Panchakarma",difficulty:"medium",question:"How many types of Basti are mainly described?",options:["2 (Niruha & Anuvasana)","3","5","1"],correctIndex:0,explanation:"Two main types: Niruha (decoction enema) and Anuvasana (oil enema).",reference:"C.S.Si. 3"},
{id:37,subject:"Panchakarma",difficulty:"hard",question:"Yoga Basti schedule consists of how many Bastis?",options:["8 (3 Anuvasana + 5 Niruha)","5","16","30"],correctIndex:0,explanation:"Yoga Basti = 8 Bastis total: starts with Anuvasana, alternates, ends with Anuvasana (3A + 5N).",reference:"C.S.Si."},

// ══════════ RASASHASTRA ══════════
{id:38,subject:"Rasashastra (Pharmaceutics)",difficulty:"easy",question:"'Rasa' in Rasashastra primarily refers to?",options:["Mercury (Parada)","Taste","Juice","Essence"],correctIndex:0,explanation:"In Rasashastra, Rasa refers to Mercury (Parada), the king of all metals/minerals in Ayurvedic alchemy.",reference:"R.R.S."},
{id:39,subject:"Rasashastra (Pharmaceutics)",difficulty:"medium",question:"Shodhana (purification) of Parada requires how many processes?",options:["8 (Ashtasamskaras)","5","3","18"],correctIndex:3,explanation:"Parada requires 18 Samskaras (processes) for purification and potentiation.",reference:"R.R.S."},
{id:40,subject:"Rasashastra (Pharmaceutics)",difficulty:"medium",question:"Bhasma (calcined ash) should pass which test to confirm proper preparation?",options:["Varitara (floats on water)","Sinks in water","Dissolves in acid","Changes color"],correctIndex:0,explanation:"Varitara (floating on water surface) is a key quality test for properly prepared Bhasma.",reference:"R.T."},

// ══════════ SWASTHAVRITTA (Preventive) ══════════
{id:41,subject:"Swasthavritta (Preventive)",difficulty:"easy",question:"Dinacharya means?",options:["Daily routine","Seasonal routine","Night routine","Weekly routine"],correctIndex:0,explanation:"Dinacharya = Dina (day) + Charya (routine). It includes waking early, brushing, exercise, bath, etc.",reference:"A.H.Su. 2"},
{id:42,subject:"Swasthavritta (Preventive)",difficulty:"easy",question:"Ritucharya means?",options:["Seasonal regimen","Daily regimen","Disease regimen","Drug regimen"],correctIndex:0,explanation:"Ritucharya = Ritu (season) + Charya (regimen). Six seasons have specific dietary/lifestyle guidelines.",reference:"C.S.Su. 6"},
{id:43,subject:"Swasthavritta (Preventive)",difficulty:"medium",question:"According to Ayurveda, how many Vegadharana (natural urges) should NOT be suppressed?",options:["13","7","10","5"],correctIndex:0,explanation:"13 natural urges (Adharaniya Vegas) should never be suppressed: urination, defecation, flatus, vomiting, sneezing, thirst, hunger, sleep, cough, breathing, yawning, tears, semen.",reference:"C.S.Su. 7"},

// ══════════ HOMEOPATHY ══════════
{id:44,subject:"Homeopathy",difficulty:"easy",question:"The founder of Homeopathy is?",options:["Dr. Samuel Hahnemann","Dr. William Boericke","Dr. James Tyler Kent","Dr. Constantine Hering"],correctIndex:0,explanation:"Dr. Samuel Hahnemann (1755-1843) founded Homeopathy in Germany.",reference:"Organon of Medicine"},
{id:45,subject:"Homeopathy",difficulty:"easy",question:"The fundamental principle of Homeopathy is?",options:["Similia Similibus Curentur (Like cures like)","Contraria Contrariis","Vis Medicatrix Naturae","Tolle Causam"],correctIndex:0,explanation:"'Like cures like' — a substance that causes symptoms in a healthy person can cure similar symptoms in a sick person.",reference:"Organon §26"},
{id:46,subject:"Homeopathy",difficulty:"medium",question:"Organon of Medicine has how many editions?",options:["6","5","4","7"],correctIndex:0,explanation:"Hahnemann wrote 6 editions of Organon. The 6th edition was published posthumously in 1921.",reference:"Organon of Medicine"},
{id:47,subject:"Homeopathy",difficulty:"medium",question:"Potentization involves?",options:["Serial dilution + succussion","Only dilution","Only trituration","Boiling"],correctIndex:0,explanation:"Potentization = serial dilution with vigorous shaking (succussion) at each step.",reference:"Organon §269-270"},

// ══════════ SIDDHA ══════════
{id:48,subject:"Siddha",difficulty:"easy",question:"Siddha medicine originated in which region?",options:["Tamil Nadu (South India)","North India","China","Greece"],correctIndex:0,explanation:"Siddha system originated in Tamil Nadu. Agastya is considered the father of Siddha medicine.",reference:"Siddha Fundamentals"},
{id:49,subject:"Siddha",difficulty:"medium",question:"The basic elements in Siddha philosophy are?",options:["Pancha Bhootas (5 elements)","4 elements","7 elements","3 elements"],correctIndex:0,explanation:"Siddha recognizes Pancha Bhootas: Earth (Prithivi), Water (Appu), Fire (Theyu), Air (Vayu), Space (Aakasam).",reference:"Siddha Philosophy"},
{id:50,subject:"Siddha",difficulty:"medium",question:"'Envagai Thervu' in Siddha means?",options:["Eight diagnostic methods","Five treatments","Seven tissues","Six tastes"],correctIndex:0,explanation:"Envagai Thervu = 8 diagnostic methods: Naa, Niram, Mozhi, Vizhi, Sparisam, Malam, Moothiram, Naadi.",reference:"Siddha Diagnostics"},
// ══════════ UNANI ══════════
{id:51,subject:"Unani",difficulty:"easy",question:"Unani medicine was developed by?",options:["Greek physicians (Hippocrates, Galen)","Indian sages","Chinese monks","Egyptian priests"],correctIndex:0,explanation:"Unani (from 'Yunan' = Greece) was developed by Greek physicians and later enriched by Arab/Persian scholars.",reference:"Unani Fundamentals"},
{id:52,subject:"Unani",difficulty:"medium",question:"The four humors (Akhlat) in Unani are?",options:["Dam, Balgham, Safra, Sauda","Vata, Pitta, Kapha, Rakta","Blood, Phlegm, Bile, Lymph","Fire, Water, Earth, Air"],correctIndex:0,explanation:"Four Akhlat: Dam (blood), Balgham (phlegm), Safra (yellow bile), Sauda (black bile).",reference:"Unani Akhlat"},
{id:53,subject:"Unani",difficulty:"medium",question:"Mizaj in Unani medicine refers to?",options:["Temperament","Treatment","Diagnosis","Pulse"],correctIndex:0,explanation:"Mizaj = temperament/constitution of an individual. Similar to Prakriti in Ayurveda.",reference:"Unani Mizaj"},

// ══════════ YOGA & NATUROPATHY ══════════
{id:54,subject:"Yoga & Naturopathy",difficulty:"easy",question:"Patanjali's Yoga Sutras describe Ashtanga Yoga. 'Ashta' means?",options:["Eight","Five","Seven","Four"],correctIndex:0,explanation:"Ashtanga Yoga = 8 limbs: Yama, Niyama, Asana, Pranayama, Pratyahara, Dharana, Dhyana, Samadhi.",reference:"Yoga Sutras 2.29"},
{id:55,subject:"Yoga & Naturopathy",difficulty:"easy",question:"Surya Namaskar has how many steps in one complete round?",options:["12","10","8","24"],correctIndex:0,explanation:"One round of Surya Namaskar consists of 12 postures (asanas).",reference:"Hatha Yoga Pradipika"},
{id:56,subject:"Yoga & Naturopathy",difficulty:"medium",question:"Which Pranayama is known for its cooling effect?",options:["Shitali","Bhastrika","Kapalabhati","Ujjayi"],correctIndex:0,explanation:"Shitali (rolled tongue breathing) has a cooling effect on the body and mind.",reference:"HYP Ch.2"},
{id:57,subject:"Yoga & Naturopathy",difficulty:"medium",question:"The principle of Naturopathy is?",options:["Vis Medicatrix Naturae (Healing power of nature)","Similia Similibus","Contraria Contrariis","Yuktivyapashraya"],correctIndex:0,explanation:"Naturopathy believes in the healing power of nature — the body can heal itself given the right conditions.",reference:"Naturopathy Principles"},

// ══════════ MORE DRAVYAGUNA ══════════
{id:58,subject:"Dravyaguna (Pharmacology)",difficulty:"easy",question:"Neem (Nimba) has which predominant Rasa?",options:["Tikta (Bitter)","Madhura (Sweet)","Amla (Sour)","Lavana (Salty)"],correctIndex:0,explanation:"Nimba is predominantly Tikta (bitter) Rasa. It is Krimighna and Kushthaghna.",reference:"B.P.N."},
{id:59,subject:"Dravyaguna (Pharmacology)",difficulty:"medium",question:"Guggulu (Commiphora mukul) is best for?",options:["Medoroga & Vataroga","Pitta disorders only","Eye diseases","Skin diseases only"],correctIndex:0,explanation:"Guggulu is the best drug for Medoroga (obesity) and Vataroga (neurological disorders).",reference:"A.H.Su."},
{id:60,subject:"Dravyaguna (Pharmacology)",difficulty:"hard",question:"Which Medhya Rasayana drug pair is described by Charaka?",options:["Mandukaparni, Shankhapushpi, Yashtimadhu, Guduchi","Only Brahmi","Only Vacha","Ashwagandha, Shatavari"],correctIndex:0,explanation:"Charaka describes 4 Medhya Rasayanas: Mandukaparni (Centella), Shankhapushpi, Yashtimadhu, Guduchi.",reference:"C.S.Ci. 1/3"},

// ══════════ MORE KAYACHIKITSA ══════════
{id:61,subject:"Kayachikitsa (Medicine)",difficulty:"easy",question:"Amavata (Rheumatism) is primarily a disease of which Dosha?",options:["Vata + Ama","Pitta only","Kapha only","Rakta"],correctIndex:0,explanation:"Amavata occurs due to Ama (toxins) combining with vitiated Vata dosha in the joints.",reference:"Madhava Nidana Amavata"},
{id:62,subject:"Kayachikitsa (Medicine)",difficulty:"medium",question:"Pandu Roga (anemia) treatment includes which key metallic preparation?",options:["Loha (Iron) Bhasma","Swarna (Gold) Bhasma","Rajata (Silver) Bhasma","Tamra (Copper) Bhasma"],correctIndex:0,explanation:"Loha Bhasma is the key drug in Pandu Roga treatment as it provides bioavailable iron.",reference:"B.R. Pandu Cikitsa"},
{id:63,subject:"Kayachikitsa (Medicine)",difficulty:"hard",question:"Kushta (skin diseases) have how many types according to Charaka?",options:["18 (7 Mahakushta + 11 Kshudra)","20","8","5"],correctIndex:0,explanation:"Charaka classifies 18 Kushtas: 7 Mahakushta (major) and 11 Kshudrakushta (minor).",reference:"C.S.Ci. 7"},

// ══════════ SHALYA TANTRA ══════════
{id:64,subject:"Shalya Tantra (Surgery)",difficulty:"easy",question:"Sushruta describes how many Yantra (instruments)?",options:["101","50","20","200"],correctIndex:0,explanation:"Sushruta describes 101 Yantra (blunt instruments) and 20 Shastra (sharp instruments).",reference:"S.S.Su. 7"},
{id:65,subject:"Shalya Tantra (Surgery)",difficulty:"medium",question:"Ashtavidha Shastra Karma (8 surgical procedures) includes?",options:["Chedana, Bhedana, Lekhana, Vyadhana, Eshana, Aharana, Vishravana, Sivana","Only incision and excision","Only 4 procedures","12 procedures"],correctIndex:0,explanation:"Eight surgical procedures: cutting, incising, scraping, puncturing, probing, extracting, draining, suturing.",reference:"S.S.Su. 5"},
{id:66,subject:"Shalya Tantra (Surgery)",difficulty:"hard",question:"Kshara Sutra therapy is primarily used for?",options:["Bhagandara (Fistula in ano)","Fractures","Eye surgery","Cardiac problems"],correctIndex:0,explanation:"Kshara Sutra is an Ayurvedic parasurgical procedure specifically for Bhagandara (anal fistula).",reference:"S.S.Ci. 17"},

// ══════════ PRASUTI TANTRA ══════════
{id:67,subject:"Prasuti & Stree Roga",difficulty:"easy",question:"Normal pregnancy duration according to Ayurveda is?",options:["9 months (Dasha masa = 10 lunar months)","7 months","12 months","6 months"],correctIndex:0,explanation:"Garbha Kala is Dasha Masa (10 lunar months ≈ 9 calendar months).",reference:"C.S.Sha. 4"},
{id:68,subject:"Prasuti & Stree Roga",difficulty:"medium",question:"Month-wise diet for pregnant women (Garbhini Paricharya) starts from?",options:["1st month itself","3rd month","5th month","7th month"],correctIndex:0,explanation:"Garbhini Paricharya (antenatal care) has specific diet guidelines from the 1st month onwards.",reference:"A.H.Sha. 1"},

// ══════════ MORE MIXED ══════════
{id:69,subject:"Samhita (Classical Texts)",difficulty:"easy",question:"Bhavaprakasha Nighantu is primarily a text on?",options:["Dravyaguna (Materia Medica)","Surgery","Anatomy","Philosophy"],correctIndex:0,explanation:"Bhavaprakasha by Bhavamishra (16th century) is a comprehensive Materia Medica text.",reference:"B.P.N."},
{id:70,subject:"Panchakarma",difficulty:"easy",question:"Nasya (nasal administration) is indicated primarily for diseases above?",options:["Urdhwajatrugata (above clavicle)","Below waist","Abdomen","Limbs"],correctIndex:0,explanation:"Nasya is the treatment of choice for diseases above the clavicle (Urdhwajatrugata Rogas).",reference:"A.H.Su. 20"},
{id:71,subject:"Dravyaguna (Pharmacology)",difficulty:"easy",question:"The drug Haridra (Curcuma longa) is commonly known as?",options:["Turmeric","Ginger","Garlic","Cinnamon"],correctIndex:0,explanation:"Haridra = Turmeric. It is anti-inflammatory, antiseptic, and used in Prameha, Kushta, Pandu.",reference:"D.V."},
{id:72,subject:"Kayachikitsa (Medicine)",difficulty:"easy",question:"Chyavanaprasha is classified as?",options:["Rasayana (rejuvenation)","Vajikarana","Vamana medicine","External application"],correctIndex:0,explanation:"Chyavanaprasha is the most famous Rasayana preparation. It improves immunity and longevity.",reference:"C.S.Ci. 1"},
{id:73,subject:"Physiology (Shareera Kriya)",difficulty:"easy",question:"Ojas in Ayurveda represents?",options:["Vital essence / immunity","A type of bone","Digestive fire","Waste product"],correctIndex:0,explanation:"Ojas is the essence of all 7 Dhatus. It represents immunity, vitality, and strength.",reference:"C.S.Su. 17"},
{id:74,subject:"Swasthavritta (Preventive)",difficulty:"easy",question:"Sadvritta in Ayurveda means?",options:["Ethical code of conduct","Six tastes","Six seasons","Six therapies"],correctIndex:0,explanation:"Sadvritta = good conduct. It includes ethical, moral, and social guidelines for healthy living.",reference:"C.S.Su. 8"},
{id:75,subject:"Roga Nidana (Pathology)",difficulty:"easy",question:"Ashtavidha Pariksha includes?",options:["Nadi, Mutra, Mala, Jihva, Shabda, Sparsha, Drik, Akriti","Only pulse","Only urine","Blood test"],correctIndex:0,explanation:"8-fold examination: Pulse, Urine, Stool, Tongue, Voice, Touch, Eyes, General appearance.",reference:"Yoga Ratnakara"},

{id:76,subject:"Dravyaguna (Pharmacology)",difficulty:"easy",question:"Shatavari (Asparagus racemosus) is best indicated for?",options:["Stanya janana (galactagogue) & Vatapittahara","Kaphahara only","External application only","Virechana"],correctIndex:0,explanation:"Shatavari is the best galactagogue (milk promoter) and is Vatapittahara, Balya, Rasayana.",reference:"B.P.N."},
{id:77,subject:"Dravyaguna (Pharmacology)",difficulty:"medium",question:"Which drug has 'Yogavahi' property (enhances action of other drugs)?",options:["Chitraka","Pippali","Guduchi","Haritaki"],correctIndex:1,explanation:"Pippali is Yogavahi — it enhances the bioavailability and action of drugs taken along with it.",reference:"C.S.Su. 25"},
{id:78,subject:"Kayachikitsa (Medicine)",difficulty:"easy",question:"The best treatment for Vataroga according to Charaka is?",options:["Basti (enema)","Vamana","Virechana","Nasya"],correctIndex:0,explanation:"Basti is considered Ardha Chikitsa (half of all treatments) and is the best for Vata disorders.",reference:"C.S.Si. 1"},
{id:79,subject:"Kayachikitsa (Medicine)",difficulty:"medium",question:"Shodhana therapy is contraindicated in?",options:["Bala (children), Vriddha (elderly), Garbhini (pregnant)","Young adults","Athletes","Healthy persons"],correctIndex:0,explanation:"Panchakarma Shodhana is contraindicated in children, elderly, pregnant women, and debilitated persons.",reference:"C.S.Su. 15"},
{id:80,subject:"Anatomy (Shareera Rachana)",difficulty:"medium",question:"Nabhi (umbilicus) is considered the Moola (root) of which Srotas?",options:["All Srotas originate from Nabhi according to some texts","Only Pranavaha","Only Annavaha","Only Raktavaha"],correctIndex:0,explanation:"Nabhi is considered a vital center from which all channels emerge (as per Sushruta's embryology).",reference:"S.S.Sha."},
{id:81,subject:"Physiology (Shareera Kriya)",difficulty:"hard",question:"According to Charaka, Rakta Dhatu is formed from Rasa Dhatu by the action of?",options:["Ranjaka Pitta","Pachaka Pitta","Sadhaka Pitta","Bhrajaka Pitta"],correctIndex:0,explanation:"Ranjaka Pitta (located in liver/spleen) gives color to Rasa, transforming it into Rakta (blood).",reference:"C.S.Ci. 15"},
{id:82,subject:"Samhita (Classical Texts)",difficulty:"medium",question:"Madhava Nidana is primarily a text on?",options:["Diagnosis & Pathology","Treatment","Surgery","Pharmacology"],correctIndex:0,explanation:"Madhava Nidana by Madhavakara (7th century) is the most authoritative text on Nidana (diagnosis/pathology).",reference:"Madhava Nidana"},
{id:83,subject:"Panchakarma",difficulty:"medium",question:"Snehapana (internal oleation) is considered complete when?",options:["Sneha appears in stool (Samyak Snigdha Lakshana)","Patient feels hungry","After 7 days automatically","When oil is vomited"],correctIndex:0,explanation:"Samyak Snigdha Lakshana: oleation is complete when ghee/oil appears in stool, skin becomes soft, and there's aversion to sneha.",reference:"C.S.Si. 1"},
{id:84,subject:"Rasashastra (Pharmaceutics)",difficulty:"easy",question:"Kajjali is prepared from?",options:["Parada (Mercury) + Gandhaka (Sulphur)","Only Mercury","Only Sulphur","Gold + Silver"],correctIndex:0,explanation:"Kajjali = fine black powder of Parada + Gandhaka. It's the base for many Rasa preparations.",reference:"R.R.S."},
{id:85,subject:"Swasthavritta (Preventive)",difficulty:"medium",question:"Brahma Muhurta (ideal waking time) is approximately?",options:["4:00-5:30 AM (96 min before sunrise)","6:00 AM","3:00 AM","7:00 AM"],correctIndex:0,explanation:"Brahma Muhurta is approximately 1.5 hours before sunrise. It's the ideal time for waking, study, and meditation.",reference:"A.H.Su. 2"},
{id:86,subject:"Shalya Tantra (Surgery)",difficulty:"medium",question:"Agnikarma (cauterization) is indicated in which type of conditions?",options:["Vata-Kapha disorders, joint pain, warts","Pitta disorders only","Eye diseases","Pregnancy"],correctIndex:0,explanation:"Agnikarma is mainly for Vata-Kapha disorders: joint pain, sciatica, plantar fasciitis, warts, corns.",reference:"S.S.Su. 12"},
{id:87,subject:"Homeopathy",difficulty:"hard",question:"The concept of 'Vital Force' in Homeopathy corresponds to which concept in Ayurveda?",options:["Prana/Ojas","Dosha","Dhatu","Mala"],correctIndex:0,explanation:"Hahnemann's Vital Force (dynamic, spirit-like) is analogous to Prana/Ojas — the life force maintaining health.",reference:"Organon §9-12"},
{id:88,subject:"Yoga & Naturopathy",difficulty:"easy",question:"How many Niyamas are described in Patanjali's Yoga Sutras?",options:["5","8","3","10"],correctIndex:0,explanation:"5 Niyamas: Shaucha (cleanliness), Santosha (contentment), Tapas (austerity), Swadhyaya (self-study), Ishwara Pranidhana (surrender).",reference:"Yoga Sutras 2.32"},
{id:89,subject:"Siddha",difficulty:"hard",question:"In Siddha medicine, 'Varmam' refers to?",options:["Vital energy points in the body (similar to Marma)","A type of medicine","A diagnostic method","A mineral preparation"],correctIndex:0,explanation:"Varmam points (108 total) are vital energy points in Siddha system, similar to Marma in Ayurveda.",reference:"Siddha Varmam"},
{id:90,subject:"Unani",difficulty:"hard",question:"'Ilaj-bil-Ghiza' in Unani means?",options:["Treatment through diet/food","Treatment through surgery","Treatment through medicine","Treatment through exercise"],correctIndex:0,explanation:"Ilaj-bil-Ghiza = dietotherapy. Unani emphasizes food as medicine before pharmaceutical intervention.",reference:"Unani Therapeutics"},
{id:91,subject:"Dravyaguna (Pharmacology)",difficulty:"hard",question:"Which Rasa (taste) is Agnideepaka (kindles digestive fire)?",options:["Katu (Pungent)","Madhura (Sweet)","Kashaya (Astringent)","Tikta (Bitter)"],correctIndex:0,explanation:"Katu Rasa (pungent) is the best Agnideepaka — it kindles Jatharagni and improves digestion.",reference:"A.H.Su. 10"},
{id:92,subject:"Kayachikitsa (Medicine)",difficulty:"hard",question:"Udara Roga (abdominal diseases) has how many types?",options:["8","5","13","20"],correctIndex:0,explanation:"8 types of Udara: Vatodara, Pittodara, Kaphodara, Sannipatodara, Plihodara, Baddhagudodara, Chidrodara, Jalodara.",reference:"C.S.Ci. 13"},
{id:93,subject:"Roga Nidana (Pathology)",difficulty:"medium",question:"Avarana in pathology means?",options:["Obstruction/covering of one Dosha by another","A type of treatment","A diagnostic method","A complication"],correctIndex:0,explanation:"Avarana = when one Dosha obstructs/covers the pathway of another (e.g., Kapha covers Vata pathway).",reference:"C.S.Ci. 28"},
{id:94,subject:"Prasuti & Stree Roga",difficulty:"medium",question:"Sutika Paricharya (postnatal care) duration is?",options:["1.5 months (45 days)","1 month","3 months","1 week"],correctIndex:0,explanation:"Sutika kala is 1.5 months (45 days). Special diet, rest, and Ayurvedic care is prescribed during this period.",reference:"A.H.Sha. 1"},
{id:95,subject:"Panchakarma",difficulty:"hard",question:"Yapana Basti is a type of?",options:["Basti that can be given daily for life (nutritive enema)","Emergency enema","Oil enema only","Decoction only"],correctIndex:0,explanation:"Yapana Basti is a nutritive enema that sustains life, can be given any time without strict rules. It's both nourishing and detoxifying.",reference:"C.S.Si. 12"},
{id:96,subject:"Samhita (Classical Texts)",difficulty:"hard",question:"The concept of 'Pratyaksha, Anumana, Aptopadesha, Yukti' represents?",options:["Pramanas (means of valid knowledge) in Ayurveda","Types of treatment","Types of drugs","Types of diseases"],correctIndex:0,explanation:"Four Pramanas: Direct perception, Inference, Authoritative testimony, and Rational reasoning — the epistemological foundation of Ayurveda.",reference:"C.S.Su. 11"},
{id:97,subject:"Physiology (Shareera Kriya)",difficulty:"medium",question:"Kapha Dosha is predominantly composed of which Mahabhutas?",options:["Prithvi (Earth) + Jala (Water)","Agni + Vayu","Vayu + Akasha","Jala + Agni"],correctIndex:0,explanation:"Kapha = Prithvi (earth) + Jala (water). Hence it has qualities of heaviness, coldness, unctuousness.",reference:"A.H.Su. 1"},
{id:98,subject:"Anatomy (Shareera Rachana)",difficulty:"hard",question:"Shringataka Marma is located at?",options:["Junction of blood vessels supplying nose, ears, eyes, tongue","Wrist","Ankle","Chest"],correctIndex:0,explanation:"Shringataka is a Sira (vessel) Marma at the junction of vessels supplying the four sense organs above the palate.",reference:"S.S.Sha. 6"},
{id:99,subject:"Dravyaguna (Pharmacology)",difficulty:"easy",question:"Yashtimadhu (Glycyrrhiza glabra) is commonly known as?",options:["Licorice / Mulethi","Turmeric","Neem","Ginger"],correctIndex:0,explanation:"Yashtimadhu = Licorice (Mulethi). It's Madhura Rasa, used in ulcers, cough, voice disorders.",reference:"B.P.N."},
{id:100,subject:"Kayachikitsa (Medicine)",difficulty:"easy",question:"Triphala Guggulu is mainly indicated for?",options:["Arsas (piles), Bhagandara (fistula), inflammatory conditions","Fever only","Eye diseases only","Skin diseases only"],correctIndex:0,explanation:"Triphala Guggulu is indicated for Arsas, Bhagandara, Nadivrana, and inflammatory/infective conditions.",reference:"Sha.Sam. Madhyama Khanda"},
];

// ══════════ HELPER FUNCTIONS ══════════

/** Get 5 random questions for daily quiz */
export function getDailyQuiz(count = 5): QuizQuestion[] {
  const shuffled = [...QUIZ_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Get questions by subject */
export function getBySubject(subject: QuizSubject, count = 10): QuizQuestion[] {
  const filtered = QUIZ_BANK.filter(q => q.subject === subject);
  return filtered.sort(() => Math.random() - 0.5).slice(0, count);
}

/** Get questions by difficulty */
export function getByDifficulty(difficulty: Difficulty, count = 10): QuizQuestion[] {
  return QUIZ_BANK.filter(q => q.difficulty === difficulty).sort(() => Math.random() - 0.5).slice(0, count);
}

/** XP/Coins reward per question */
export const REWARDS = {
  correctAnswer: { xp: 10, coins: 5 },
  perfectQuiz: { xp: 50, coins: 25 },  // all 5 correct
  dailyStreak: { xp: 20, coins: 10 },  // bonus for daily streak
  difficultyBonus: { easy: 1, medium: 1.5, hard: 2 }, // multiplier
};

/** Student Level thresholds */
export const LEVELS = [
  { level: 1, title: "Vidyarthi (Student)", xpRequired: 0 },
  { level: 2, title: "Shishya (Disciple)", xpRequired: 100 },
  { level: 3, title: "Adhyeta (Scholar)", xpRequired: 300 },
  { level: 4, title: "Chikitsak (Healer)", xpRequired: 600 },
  { level: 5, title: "Vaidya (Physician)", xpRequired: 1000 },
  { level: 6, title: "Acharya (Master)", xpRequired: 2000 },
  { level: 7, title: "Rishi (Sage)", xpRequired: 5000 },
];

export function getLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) return LEVELS[i];
  }
  return LEVELS[0];
}
