import { useState, useMemo } from "react";
import { BookOpen, Search, Bookmark, BookmarkCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface ClassicalReference {
  id: string;
  source: "charaka" | "sushruta" | "ashtanga_hridaya";
  section: string;
  category: string;
  title_sanskrit: string;
  title_english: string;
  verse_number: string;
  content_sanskrit: string;
  content_english: string;
  keywords: string[];
  clinical_relevance: string;
}

const REFERENCES_DB: ClassicalReference[] = [
  {
    id: "cs-1",
    source: "charaka",
    section: "Sutrasthana Ch.5",
    category: "Diet (Ahara)",
    title_sanskrit: "Dinacharya",
    title_english: "Daily Routine",
    verse_number: "5.13-15",
    content_sanskrit: "Braahme muhurte uttishtet swastho rakshartham ayushah",
    content_english: "One should wake up during Brahma Muhurta (before sunrise) to protect health and longevity. This includes practices like teeth cleaning, oil pulling, exercise, and bathing.",
    keywords: ["dinacharya", "daily routine", "brahma muhurta", "prevention", "lifestyle"],
    clinical_relevance: "Foundation of preventive medicine. Circadian rhythm alignment improves metabolic health, cortisol regulation, and immune function."
  },
  {
    id: "cs-2",
    source: "charaka",
    section: "Sutrasthana Ch.6",
    category: "Diet (Ahara)",
    title_sanskrit: "Ritucharya",
    title_english: "Seasonal Regime",
    verse_number: "6.3-8",
    content_sanskrit: "Adana-kale tu maadhurya snigdha-sheeta-guna-anvitam",
    content_english: "During Adana Kala (northern solstice), foods with sweet, unctuous, and cold qualities are recommended as the sun depletes body strength progressively.",
    keywords: ["ritucharya", "seasonal", "seasons", "adaptation", "diet"],
    clinical_relevance: "Seasonal dietary modifications prevent seasonal affective disorders, allergies, and metabolic disruptions. Aligns with chronobiology."
  },
  {
    id: "cs-3",
    source: "charaka",
    section: "Sutrasthana Ch.1",
    category: "Diagnostics (Nidana)",
    title_sanskrit: "Tridosha Siddhanta",
    title_english: "Theory of Three Doshas",
    verse_number: "1.57-61",
    content_sanskrit: "Vayu-pitta-kaphash-cheti trayo doshaa samaasatah",
    content_english: "Vata, Pitta, and Kapha are the three doshas in brief. In balanced state they sustain the body; when imbalanced they afflict and destroy it.",
    keywords: ["tridosha", "vata", "pitta", "kapha", "dosha", "balance", "homeostasis"],
    clinical_relevance: "Fundamental to personalized medicine. Maps to autonomic nervous system (Vata), metabolic/endocrine (Pitta), and structural/immune (Kapha) systems."
  },
  {
    id: "cs-4",
    source: "charaka",
    section: "Vimanasthana Ch.8",
    category: "Diagnostics (Nidana)",
    title_sanskrit: "Prakriti Pariksha",
    title_english: "Constitutional Assessment",
    verse_number: "8.95-100",
    content_sanskrit: "Shukra-shonita samyoge yo bhavati balavan tatha",
    content_english: "The dosha which is dominant at the time of conception determines the Prakriti (constitution) of an individual. This remains unchanged throughout life.",
    keywords: ["prakriti", "constitution", "assessment", "diagnosis", "genetics", "phenotype"],
    clinical_relevance: "Genomic constitution concept. Prakriti correlates with pharmacogenomic profiles and disease susceptibility patterns."
  },
  {
    id: "cs-5",
    source: "charaka",
    section: "Chikitsasthana Ch.15",
    category: "Diagnostics (Nidana)",
    title_sanskrit: "Agni Pareeksha",
    title_english: "Assessment of Digestive Fire",
    verse_number: "15.3-7",
    content_sanskrit: "Sama-tikshna-manda-vishama agni chaturvidha smritah",
    content_english: "Agni (digestive fire) is of four types: Sama (balanced), Tikshna (sharp/hyperactive), Manda (slow/hypoactive), and Vishama (irregular). All diseases arise from impaired Agni.",
    keywords: ["agni", "digestion", "metabolism", "digestive fire", "mandagni", "tikshagni"],
    clinical_relevance: "Maps to digestive enzyme activity and metabolic rate. Guides dietary modifications and enzyme supplementation strategies."
  },
  {
    id: "cs-6",
    source: "charaka",
    section: "Vimanasthana Ch.2",
    category: "Diagnostics (Nidana)",
    title_sanskrit: "Ama Lakshana",
    title_english: "Signs of Toxin Accumulation",
    verse_number: "2.8-12",
    content_sanskrit: "Srotorodho balabhransha gaurava anilamudhata",
    content_english: "Ama (metabolic toxins) manifests as channel obstruction, loss of strength, heaviness, disturbed Vata, lethargy, indigestion, excessive salivation, and loss of appetite.",
    keywords: ["ama", "toxins", "srotorodha", "obstruction", "detox", "purification"],
    clinical_relevance: "Correlates with systemic inflammation, endotoxemia, and metabolic syndrome markers. CRP and ESR elevation parallels."
  },
  {
    id: "cs-7",
    source: "charaka",
    section: "Chikitsasthana Ch.3",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Jwara Chikitsa",
    title_english: "Treatment of Fever",
    verse_number: "3.68-75",
    content_sanskrit: "Langhana svedana kale cha yojayed vamana-adinam",
    content_english: "In fever management, initial fasting (Langhana) followed by sudation and then emesis/purgation is recommended. Different types of fever require specific interventions based on dosha involvement.",
    keywords: ["jwara", "fever", "pyrexia", "langhana", "fasting", "treatment"],
    clinical_relevance: "Fasting during fever reduces metabolic load. Matches modern understanding of autophagy activation and immune modulation during therapeutic fasting."
  },
  {
    id: "cs-8",
    source: "charaka",
    section: "Chikitsasthana Ch.8",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Rajayakshma Chikitsa",
    title_english: "Treatment of Consumptive Disease",
    verse_number: "8.35-42",
    content_sanskrit: "Brimhana-ahara vihaarena balya rasayanena cha",
    content_english: "Rajayakshma (tuberculosis/wasting) is treated with nourishing diet, strengthening regimen, Rasayana therapy, and specific formulations like Chyawanprash and meat soups.",
    keywords: ["rajayakshma", "tuberculosis", "wasting", "nutrition", "rasayana", "immunity"],
    clinical_relevance: "Nutritional rehabilitation and immunomodulation remain key in TB management. Rasayana herbs show immunostimulant properties in research."
  },
  {
    id: "cs-9",
    source: "charaka",
    section: "Chikitsasthana Ch.7",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Kushtha Chikitsa",
    title_english: "Treatment of Skin Diseases",
    verse_number: "7.14-22",
    content_sanskrit: "Shodhana shamana lepas cha kushtha-ghna rasayanani cha",
    content_english: "Skin diseases are managed through Shodhana (purification), Shamana (pacification), external applications (Lepa), and specific Rasayana. Blood purification is essential.",
    keywords: ["kushtha", "skin", "dermatology", "lepa", "rakta shodhana", "psoriasis", "eczema"],
    clinical_relevance: "Gut-skin axis concept. Blood purification herbs (Manjishtha, Neem) show anti-inflammatory and antimicrobial activity in dermatological conditions."
  },
  {
    id: "cs-10",
    source: "charaka",
    section: "Chikitsasthana Ch.6",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Prameha Chikitsa",
    title_english: "Treatment of Diabetes",
    verse_number: "6.15-25",
    content_sanskrit: "Vyayama karshana-apatarpana chikitsa prameha-hara",
    content_english: "Diabetes management involves exercise, weight reduction, depletion therapy for obese patients, and nourishing therapy for lean diabetics. Twenty types of Prameha are described based on dosha.",
    keywords: ["prameha", "diabetes", "madhumeha", "sugar", "glucose", "metabolism", "obesity"],
    clinical_relevance: "Distinguishes Type 1 (lean/Vata) vs Type 2 (obese/Kapha) diabetes centuries before modern classification. Exercise prescription mirrors current guidelines."
  },
  {
    id: "cs-11",
    source: "charaka",
    section: "Chikitsasthana Ch.9",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Unmada Chikitsa",
    title_english: "Treatment of Mental Disorders",
    verse_number: "9.5-12",
    content_sanskrit: "Daiva-vyapashraya yukti-vyapashraya sattvavajaya cha",
    content_english: "Mental disorders are treated through three approaches: spiritual therapy (Daivavyapashraya), rational therapy (Yuktivyapashraya), and psychotherapy (Sattvavajaya/mind control).",
    keywords: ["unmada", "mental", "psychiatry", "psychotherapy", "sattvavajaya", "meditation"],
    clinical_relevance: "Biopsychosocial model of psychiatry. Sattvavajaya parallels CBT and mindfulness-based interventions. Holistic approach to mental health."
  },
  {
    id: "cs-12",
    source: "charaka",
    section: "Chikitsasthana Ch.29",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Vatarakta Chikitsa",
    title_english: "Treatment of Gout",
    verse_number: "29.18-26",
    content_sanskrit: "Raktamokshana virechana lepas cha vatarakta-hara",
    content_english: "Vatarakta (gout) is treated with bloodletting, purgation, external applications of cooling pastes, and avoidance of Vata-Pitta aggravating foods.",
    keywords: ["vatarakta", "gout", "uric acid", "arthritis", "raktamokshana", "bloodletting"],
    clinical_relevance: "Dietary management and anti-inflammatory approaches remain primary gout treatment. Bloodletting concept parallels phlebotomy for polycythemia."
  },
  {
    id: "cs-13",
    source: "charaka",
    section: "Kalpasthana Ch.1",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Vamana Dravya Kalpa",
    title_english: "Emetic Drug Preparations",
    verse_number: "1.4-14",
    content_sanskrit: "Madanaphala-pippali-vacha-nimba-kutaja-adayah",
    content_english: "Primary emetic drugs include Madanaphala (Randia dumetorum), Pippali, Vacha, Nimba, and Kutaja. Madanaphala is considered the best due to predictable action and safety.",
    keywords: ["vamana", "emesis", "panchakarma", "purification", "madanaphala", "detox"],
    clinical_relevance: "Therapeutic emesis for upper GI toxin elimination. Madanaphala compounds show documented emetic activity with controlled dosing."
  },
  {
    id: "cs-14",
    source: "charaka",
    section: "Kalpasthana Ch.7",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Virechana Dravya Kalpa",
    title_english: "Purgative Drug Preparations",
    verse_number: "7.5-12",
    content_sanskrit: "Trivrit-danti-snuhi-tilvaka-aragvadha-adayah",
    content_english: "Main purgative drugs include Trivrit (Operculina turpethum), Danti, Snuhi, Tilvaka, and Aragvadha (Cassia fistula). Trivrit is safest and most commonly used.",
    keywords: ["virechana", "purgation", "panchakarma", "trivrit", "laxative", "detox"],
    clinical_relevance: "Therapeutic purgation for hepatobiliary detox. Modern research validates hepatoprotective action of Aragvadha and bile flow stimulation."
  },
  {
    id: "cs-15",
    source: "charaka",
    section: "Sutrasthana Ch.25",
    category: "Herbs (Dravya)",
    title_sanskrit: "Dravyaguna Sangraha",
    title_english: "Classification of Medicinal Substances",
    verse_number: "25.36-40",
    content_sanskrit: "Dashemani dashaemani iti panchashad mahakashaayah",
    content_english: "Fifty Mahakashaya groups of ten herbs each are described for specific therapeutic actions: Jivaniya (vitality), Brimhaniya (nourishing), Lekhaniya (scraping), etc.",
    keywords: ["dravyaguna", "herbs", "pharmacology", "mahakashaya", "classification", "materia medica"],
    clinical_relevance: "Systematic pharmacological classification. Each group targets specific pathological mechanisms, enabling evidence-based herb selection."
  },
  {
    id: "cs-16",
    source: "charaka",
    section: "Sutrasthana Ch.4",
    category: "Herbs (Dravya)",
    title_sanskrit: "Shadvirechana Shatashritiya",
    title_english: "Six Hundred Purgative Formulations",
    verse_number: "4.6-15",
    content_sanskrit: "Rasa-vipaka-virya-prabhava gunah dravyasya karmahetunam",
    content_english: "The therapeutic action of drugs depends on Rasa (taste), Vipaka (post-digestive effect), Virya (potency), Prabhava (specific action), and Guna (qualities).",
    keywords: ["rasa", "vipaka", "virya", "prabhava", "pharmacology", "drug action"],
    clinical_relevance: "Pharmacokinetic-pharmacodynamic framework. Rasa/Vipaka relates to absorption, Virya to bioactivity, Prabhava to unique molecular mechanisms."
  },
  {
    id: "cs-17",
    source: "charaka",
    section: "Sharira Sthana Ch.3",
    category: "Anatomy (Shareera)",
    title_sanskrit: "Khuddika Garbhavakranti",
    title_english: "Embryology & Development",
    verse_number: "3.3-8",
    content_sanskrit: "Matrija pitrija atmaja satmyaja rasaja cha bhavah",
    content_english: "The body is formed from maternal, paternal, soul, habitual, and nutritional factors. Month-by-month fetal development is described with specific organ formation timelines.",
    keywords: ["embryology", "garbha", "development", "pregnancy", "fetus", "genetics"],
    clinical_relevance: "Prenatal care concepts. Recognition of genetic (Matrija/Pitrija) and environmental (Satmyaja/Rasaja) factors in fetal development."
  },
  {
    id: "cs-18",
    source: "charaka",
    section: "Sharira Sthana Ch.7",
    category: "Anatomy (Shareera)",
    title_sanskrit: "Srotas Vichaya",
    title_english: "Body Channels System",
    verse_number: "7.4-10",
    content_sanskrit: "Trayodasha srotamsi purushasya bhavanti",
    content_english: "Thirteen channel systems (Srotas) transport nutrients and wastes: Pranavaha (respiratory), Annavaha (digestive), Udakavaha (water), Rasavaha (lymph/plasma), and nine others.",
    keywords: ["srotas", "channels", "transport", "circulation", "anatomy", "physiology"],
    clinical_relevance: "Maps to organ systems and transport mechanisms. Srotodushti (channel dysfunction) concept parallels vascular, lymphatic, and organ-specific pathology."
  },
  {
    id: "cs-19",
    source: "charaka",
    section: "Nidanasthana Ch.1",
    category: "Diagnostics (Nidana)",
    title_sanskrit: "Jwara Nidana",
    title_english: "Etiology of Fever",
    verse_number: "1.3-10",
    content_sanskrit: "Tatra jwara-karanam doshaah prakupitah",
    content_english: "Eight types of fever are described based on single, dual, and tri-dosha involvement plus exogenous causes. Fever is considered the king of diseases affecting body, mind, and senses.",
    keywords: ["jwara", "fever", "nidana", "etiology", "diagnosis", "classification"],
    clinical_relevance: "Systematic fever classification by etiology. Differentiating infectious vs inflammatory vs metabolic fever remains clinically relevant."
  },
  {
    id: "cs-20",
    source: "charaka",
    section: "Chikitsasthana Ch.1",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Rasayana Adhyaya",
    title_english: "Rejuvenation Therapy",
    verse_number: "1.7-16",
    content_sanskrit: "Deergham ayuh smritim medham arogyam tarunam vayah",
    content_english: "Rasayana promotes longevity, memory, intelligence, health, youthfulness, complexion, voice, and strength. Two methods: Kutipraveshika (indoor) and Vatatapika (outdoor).",
    keywords: ["rasayana", "rejuvenation", "anti-aging", "longevity", "immunity", "adaptogen"],
    clinical_relevance: "Adaptogenic and immunomodulatory therapy. Ashwagandha, Guduchi, Amalaki show documented anti-aging, neuroprotective, and immune-enhancing effects."
  },
  {
    id: "ss-1",
    source: "sushruta",
    section: "Sutrasthana Ch.5",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Agropaharaniya",
    title_english: "Surgical Instruments",
    verse_number: "5.3-12",
    content_sanskrit: "Shastra-yantra visheshena chhedya-bhedyadi karma cha",
    content_english: "101 Yantra (blunt instruments) and 20 Shastra (sharp instruments) are described including forceps, speculums, scalpels, scissors, needles, and cauteries for eight surgical operations.",
    keywords: ["shastra", "yantra", "instruments", "surgery", "surgical", "tools"],
    clinical_relevance: "Ancient surgical instrument design. Many instruments parallel modern surgical tools. Demonstrates advanced understanding of surgical principles."
  },
  {
    id: "ss-2",
    source: "sushruta",
    section: "Sutrasthana Ch.25",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Ashtavidha Shastrakarma",
    title_english: "Eight Surgical Procedures",
    verse_number: "25.3-6",
    content_sanskrit: "Chhedya bhedya lekhya vedhya eshaniya aharya visravya sivya",
    content_english: "Eight types of surgical operations: Excision (Chedya), Incision (Bhedya), Scraping (Lekhya), Puncturing (Vedhya), Probing (Eshaniya), Extraction (Aharya), Draining (Visravya), and Suturing (Sivya).",
    keywords: ["surgery", "operations", "excision", "incision", "suturing", "procedures"],
    clinical_relevance: "Complete surgical procedure classification still relevant. Forms basis of general surgical principles taught worldwide."
  },
  {
    id: "ss-3",
    source: "sushruta",
    section: "Sharira Sthana Ch.6",
    category: "Anatomy (Shareera)",
    title_sanskrit: "Marma Vijnana",
    title_english: "Vital Points (Marma)",
    verse_number: "6.3-16",
    content_sanskrit: "Marmaani naamaani dvyasheetih pranayatanani",
    content_english: "107 Marma points are described as vital anatomical junctions where muscles, vessels, ligaments, bones, and joints meet. Injury to Sadyah-pranahara marmas causes immediate death.",
    keywords: ["marma", "vital points", "anatomy", "acupressure", "surgery", "injury"],
    clinical_relevance: "Anatomical danger zones for surgeons. Knowledge essential for safe surgical approaches. Marma therapy parallels acupressure/trigger point concepts."
  },
  {
    id: "ss-4",
    source: "sushruta",
    section: "Chikitsasthana Ch.3",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Bhagna Chikitsa",
    title_english: "Fracture Management",
    verse_number: "3.7-18",
    content_sanskrit: "Aanchana-pidana-sankshepana-bandha karshana unmardana",
    content_english: "Fracture management involves traction (Anchana), pressure (Pidana), apposition (Sankshepana), immobilization (Bandha), counter-traction (Karshana), and massage (Unmardana). Twelve types of fractures described.",
    keywords: ["bhagna", "fracture", "orthopedics", "bone", "splinting", "traction"],
    clinical_relevance: "Fracture reduction principles match modern orthopedics. Traction, immobilization, and rehabilitation concepts remain unchanged."
  },
  {
    id: "ss-5",
    source: "sushruta",
    section: "Uttaratantra Ch.1-18",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Netra Roga Chikitsa",
    title_english: "Eye Disease Treatment",
    verse_number: "1.20-26",
    content_sanskrit: "Shalakyam netra-karna-nasa-mukha roga pratishedhartham",
    content_english: "76 eye diseases are classified by anatomical location: eyelid (Vartmagata), conjunctiva (Sandhigata), sclera (Shuklagata), cornea (Krishnagata), and lens (Drishtigata). Surgical procedures for cataracts described.",
    keywords: ["netra", "eye", "ophthalmology", "cataract", "shalakya", "vision"],
    clinical_relevance: "Couching for cataracts is earliest documented eye surgery. Anatomical classification of eye diseases predates modern ophthalmology."
  },
  {
    id: "ss-6",
    source: "sushruta",
    section: "Uttaratantra Ch.19-26",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Karna-Nasa-Mukha Roga",
    title_english: "ENT Procedures",
    verse_number: "19.3-10",
    content_sanskrit: "Karna-nadi-pratinaha pratishyaya-arsha-galashundika",
    content_english: "ENT diseases include ear discharge, nasal polyps, rhinitis, tonsillitis, and dental conditions. Procedures include ear piercing, nasal irrigation, and tonsil excision.",
    keywords: ["ENT", "ear", "nose", "throat", "karna", "nasa", "tonsil", "polyp"],
    clinical_relevance: "Nasya (nasal therapy) validated for sinusitis. Ear and throat surgical procedures demonstrate advanced surgical skill."
  },
  {
    id: "ss-7",
    source: "sushruta",
    section: "Sutrasthana Ch.14",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Shonitavarnaniya",
    title_english: "Wound Healing & Blood Disorders",
    verse_number: "14.3-15",
    content_sanskrit: "Vranah dve vidhe shuddhah dushta-iti",
    content_english: "Wounds classified as clean (Shuddha) and contaminated (Dushta). Sixty measures for wound management including cleaning, debridement, dressing, and promotion of granulation tissue.",
    keywords: ["vrana", "wound", "healing", "surgery", "dressing", "debridement"],
    clinical_relevance: "Wound bed preparation, debridement, and moist healing concepts predate modern wound care by millennia. Honey dressing validated by research."
  },
  {
    id: "ss-8",
    source: "sushruta",
    section: "Sutrasthana Ch.16",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Rhinoplasty (Nasikasandhana)",
    title_english: "Nose Reconstruction",
    verse_number: "16.3-8",
    content_sanskrit: "Nasa-agra sthaanam pramaanam cha ganda-sthaat patra-aakritim chhitva",
    content_english: "For reconstruction of a severed nose, a leaf-shaped flap is taken from the cheek, attached to the nasal stump with sutures, and tubes inserted to maintain airway during healing.",
    keywords: ["rhinoplasty", "plastic surgery", "reconstruction", "nose", "flap surgery"],
    clinical_relevance: "World's first documented plastic surgery procedure. The 'Indian forehead flap' rhinoplasty technique is still used in modern reconstructive surgery."
  },
  {
    id: "ss-9",
    source: "sushruta",
    section: "Sharira Sthana Ch.5",
    category: "Anatomy (Shareera)",
    title_sanskrit: "Dhamani Vijnana",
    title_english: "Vascular Anatomy",
    verse_number: "5.3-9",
    content_sanskrit: "Chaturvimshati dhamanyah naabheh prabhavanti",
    content_english: "Twenty-four Dhamanis (major vessels) originate from the umbilicus and distribute throughout the body. Ten carry Vata, ten carry Pitta, and four carry Kapha.",
    keywords: ["dhamani", "vessels", "vascular", "anatomy", "circulation", "arteries"],
    clinical_relevance: "Vascular anatomy knowledge. Understanding of arterial distribution and pulse points essential for surgical practice."
  },
  {
    id: "ss-10",
    source: "sushruta",
    section: "Sutrasthana Ch.15",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Ksharakarma",
    title_english: "Chemical Cauterization",
    verse_number: "15.3-12",
    content_sanskrit: "Kshaarah sarva-shastra pradhaanatamah",
    content_english: "Kshara (alkaline preparations) is superior to surgical instruments as it performs excision, incision, and scraping simultaneously. Pratisaraniya (external) and Paniya (internal) forms described.",
    keywords: ["kshara", "cautery", "chemical", "alkaline", "fistula", "hemorrhoids"],
    clinical_relevance: "Kshara Sutra for fistula-in-ano is WHO-recognized. Chemical cauterization for hemorrhoids shows comparable results to surgical methods."
  },
  {
    id: "ss-11",
    source: "sushruta",
    section: "Chikitsasthana Ch.17",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Raktamokshana",
    title_english: "Bloodletting Therapy",
    verse_number: "17.3-8",
    content_sanskrit: "Jalauka-shringa-alabu-prachchhana siravyadhana cha",
    content_english: "Five methods of bloodletting: Leeches (Jalauka) for Pitta, horn (Shringa) for Vata, gourd (Alabu) for Kapha, scarification (Prachanna), and venipuncture (Siravyadha).",
    keywords: ["raktamokshana", "bloodletting", "leech", "venipuncture", "blood purification"],
    clinical_relevance: "Medicinal leech therapy (hirudotherapy) is FDA-approved for microsurgery complications. Wet cupping shows anti-inflammatory benefits in studies."
  },
  {
    id: "ah-1",
    source: "ashtanga_hridaya",
    section: "Sutrasthana Ch.18-19",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Panchakarma Vidhi",
    title_english: "Five Purification Procedures",
    verse_number: "18.1-8",
    content_sanskrit: "Vamana virechana nasya raktamokshana bastyah pancha karmani",
    content_english: "Panchakarma consists of Vamana (emesis), Virechana (purgation), Nasya (nasal therapy), Raktamokshana (bloodletting), and Basti (enema). Preparatory procedures include Snehana and Svedana.",
    keywords: ["panchakarma", "detox", "purification", "vamana", "virechana", "basti", "nasya"],
    clinical_relevance: "Comprehensive detoxification protocol. Research shows Panchakarma reduces oxidative stress markers, improves lipid profiles, and modulates immune parameters."
  },
  {
    id: "ah-2",
    source: "ashtanga_hridaya",
    section: "Uttarasthana Ch.39",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Rasayana Vidhi",
    title_english: "Rejuvenation Procedures",
    verse_number: "39.3-15",
    content_sanskrit: "Kamya-naimittika-ajasrika rasayana trividham smritam",
    content_english: "Three types of Rasayana: Kamya (promotive/elective), Naimittika (curative/disease-specific), and Ajasrika (daily dietary Rasayana like milk and ghee). Key drugs: Amalaki, Haritaki, Guduchi.",
    keywords: ["rasayana", "rejuvenation", "amalaki", "haritaki", "guduchi", "anti-aging", "immunity"],
    clinical_relevance: "Adaptogenic herbs validated scientifically. Triphala shows antioxidant, Guduchi immunomodulatory, Ashwagandha anti-stress properties in clinical trials."
  },
  {
    id: "ah-3",
    source: "ashtanga_hridaya",
    section: "Uttarasthana Ch.40",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Vajikarana Vidhi",
    title_english: "Aphrodisiac Therapy",
    verse_number: "40.2-10",
    content_sanskrit: "Vajikaranena pumsaam pushti-bala-harsha vardhanam",
    content_english: "Vajikarana promotes strength, vigor, and reproductive health. Includes Shukra-janana (spermatogenesis), Shukra-pravartaka (ejaculatory), and Shukra-stambhaka (retention) therapies.",
    keywords: ["vajikarana", "aphrodisiac", "fertility", "reproductive", "sexual health"],
    clinical_relevance: "Male and female reproductive health. Ashwagandha and Kapikacchu show improved sperm parameters. Shatavari supports female reproductive health."
  },
  {
    id: "ah-4",
    source: "ashtanga_hridaya",
    section: "Uttarasthana Ch.1-3",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Bala Roga Chikitsa",
    title_english: "Pediatric Medicine",
    verse_number: "1.1-10",
    content_sanskrit: "Ksheerapa-ksheerannada-annada avastha balasya",
    content_english: "Pediatric care divided by age: exclusive breastfeeding (Ksheerapa), weaning period (Ksheerannada), and food-eating stage (Annada). Includes neonatal care, Suvarnaprashana (gold immunization), and childhood diseases.",
    keywords: ["bala", "pediatrics", "child", "neonatal", "breastfeeding", "suvarnaprashana", "immunization"],
    clinical_relevance: "Suvarnaprashana (gold-medicated ghee) shows immunostimulant effects in studies. Age-specific dietary guidelines mirror modern pediatric nutrition."
  },
  {
    id: "ah-5",
    source: "ashtanga_hridaya",
    section: "Sutrasthana Ch.11",
    category: "Diet (Ahara)",
    title_sanskrit: "Matrashitiya",
    title_english: "Quantity of Food",
    verse_number: "11.3-8",
    content_sanskrit: "Trividham kuksheh bhagam kalpayeet ahara-arthi",
    content_english: "Divide the stomach into three parts: one-third for solid food, one-third for liquids, and one-third for Vata (gas/movement). This ensures optimal digestion.",
    keywords: ["ahara", "food", "quantity", "digestion", "diet", "portion", "eating"],
    clinical_relevance: "Portion control concept. Not overfilling the stomach allows proper peristalsis and enzyme action. Parallels modern intermittent fasting concepts."
  },
  {
    id: "ah-6",
    source: "ashtanga_hridaya",
    section: "Sutrasthana Ch.12",
    category: "Diet (Ahara)",
    title_sanskrit: "Annapana Vidhi",
    title_english: "Rules of Food & Drink",
    verse_number: "12.1-10",
    content_sanskrit: "Ushnam snigdham matravat jirnae virya-aviruddham",
    content_english: "Eight rules of eating: food should be warm, unctuous, in proper quantity, eaten after previous meal is digested, non-contradictory in potency, in pleasant surroundings, not too quickly, and not too slowly.",
    keywords: ["anna", "food rules", "eating", "diet", "nutrition", "viruddha ahara"],
    clinical_relevance: "Mindful eating guidelines. Warm food improves digestion, proper intervals prevent metabolic overload. Food combining (Viruddha Ahara) concept."
  },
  {
    id: "ah-7",
    source: "ashtanga_hridaya",
    section: "Sutrasthana Ch.13",
    category: "Diet (Ahara)",
    title_sanskrit: "Viruddha Ahara",
    title_english: "Incompatible Foods",
    verse_number: "13.1-12",
    content_sanskrit: "Matsya-dugdham viruddham payasaa amla phalaani cha",
    content_english: "Fish with milk, milk with sour fruits, hot honey, equal quantities of ghee and honey, and radish with milk are among 18 types of food incompatibilities that generate toxins.",
    keywords: ["viruddha ahara", "incompatible", "food combining", "toxins", "diet", "nutrition"],
    clinical_relevance: "Food interaction concept. Some combinations increase histamine, cause protein denaturation, or generate free radicals. Basis for food allergy management."
  },
  {
    id: "ah-8",
    source: "ashtanga_hridaya",
    section: "Chikitsasthana Ch.21",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Basti Chikitsa",
    title_english: "Enema Therapy",
    verse_number: "21.1-12",
    content_sanskrit: "Bastih bhagavaan ardhe chikitsaayaam athavaa adhikah",
    content_english: "Basti (medicated enema) constitutes half or even more of the entire treatment system. Anuvasana (oil enema), Niruha (decoction enema), and Uttarabasti (urethral/vaginal) are the types.",
    keywords: ["basti", "enema", "vata", "colon", "lower GI", "panchakarma"],
    clinical_relevance: "Colonic drug delivery bypasses first-pass metabolism. Basti delivers medications for local and systemic effects. Research supports efficacy in IBS and neurological conditions."
  },
  {
    id: "ah-9",
    source: "ashtanga_hridaya",
    section: "Nidanasthana Ch.12",
    category: "Diseases (Vyadhi)",
    title_sanskrit: "Hridroga Nidana",
    title_english: "Heart Disease Etiology",
    verse_number: "12.1-6",
    content_sanskrit: "Atichinta-atibhaya-atyudvega hridrogasya karanani",
    content_english: "Heart disease caused by excessive worry, fear, anxiety, excessive fasting, overeating, and trauma. Five types based on Tridosha, Krimija (infective), and Tridoshaja.",
    keywords: ["hridroga", "heart", "cardiac", "anxiety", "stress", "cardiovascular"],
    clinical_relevance: "Psychosomatic cardiac disease recognition. Stress-induced cardiomyopathy (Takotsubo), anxiety-related arrhythmias validate the mind-heart connection."
  },
  {
    id: "ah-10",
    source: "ashtanga_hridaya",
    section: "Nidanasthana Ch.5",
    category: "Diseases (Vyadhi)",
    title_sanskrit: "Panduroga Nidana",
    title_english: "Anemia Etiology",
    verse_number: "5.1-6",
    content_sanskrit: "Mrid-bhakshana-abhojana krimijam cha pandurogam janayanti",
    content_english: "Anemia caused by eating clay/mud, poor nutrition, worm infestation, and blood loss. Five types described. Characteristic pallor of skin, nails, and eyes noted.",
    keywords: ["pandu", "anemia", "iron", "hemoglobin", "pallor", "blood", "nutrition"],
    clinical_relevance: "Pica (clay eating), nutritional deficiency, parasitic infestation, and hemorrhage as anemia causes are clinically accurate. Iron-rich diet recommended."
  },
  {
    id: "ah-11",
    source: "ashtanga_hridaya",
    section: "Chikitsasthana Ch.8",
    category: "Diseases (Vyadhi)",
    title_sanskrit: "Vatavyadhi",
    title_english: "Neurological Disorders",
    verse_number: "8.1-12",
    content_sanskrit: "Pakshaghata-ardita-gridhrasi-apatantraka lakshana",
    content_english: "Vata disorders include Pakshaghata (hemiplegia), Ardita (facial palsy), Gridhrasi (sciatica), Apatantraka (tetany), Kampavata (Parkinson's), and 80 other Nanatmaja Vata Vikaras.",
    keywords: ["vata", "neurological", "paralysis", "sciatica", "parkinson", "stroke"],
    clinical_relevance: "Comprehensive neurology. Pakshaghata management with Basti and oil therapies parallels modern neurorehabilitation. Ashwagandha shows neuroprotective effects."
  },
  {
    id: "ah-12",
    source: "ashtanga_hridaya",
    section: "Sharira Sthana Ch.3",
    category: "Anatomy (Shareera)",
    title_sanskrit: "Anga Vibhaga Sharira",
    title_english: "Regional Anatomy",
    verse_number: "3.1-8",
    content_sanskrit: "Shaaka-madhya-shakha-antara pratyanga vibhagena",
    content_english: "Body divided into six regions: four limbs, trunk, and head. Detailed enumeration of 360 bones, 210 joints, 900 ligaments, 700 blood vessels, 500 muscles, and other structures.",
    keywords: ["anatomy", "sharira", "bones", "joints", "muscles", "regional anatomy"],
    clinical_relevance: "Systematic anatomical enumeration. Though numbers differ from modern counts, the organized regional approach to anatomy teaching remains standard."
  },
  {
    id: "cs-21",
    source: "charaka",
    section: "Sutrasthana Ch.7",
    category: "Diet (Ahara)",
    title_sanskrit: "Navegandharaniya",
    title_english: "Suppressible & Non-suppressible Urges",
    verse_number: "7.3-6",
    content_sanskrit: "Vegaan na dharayet dheemaan jihmaan dhaarayeet budhaah",
    content_english: "Thirteen natural urges (flatus, stool, urine, sneeze, thirst, hunger, sleep, cough, breath, yawn, tears, vomiting, ejaculation) should never be suppressed. Mental urges (greed, grief, anger) should be controlled.",
    keywords: ["vega", "urges", "suppression", "natural urges", "prevention", "lifestyle"],
    clinical_relevance: "Suppression of natural urges causes specific diseases. Holding urine causes UTI, suppressing flatus causes bloating. Validates psychosomatic medicine."
  },
  {
    id: "cs-22",
    source: "charaka",
    section: "Sutrasthana Ch.11",
    category: "Diagnostics (Nidana)",
    title_sanskrit: "Trividha Roga Vishesha Vijnaniya",
    title_english: "Threefold Disease Classification",
    verse_number: "11.45-48",
    content_sanskrit: "Nija-agantu-manasa bheda trividha vyadhayah smritah",
    content_english: "Diseases are threefold: Nija (endogenous/internal), Agantu (exogenous/trauma), and Manasa (psychological). Each requires different diagnostic and therapeutic approaches.",
    keywords: ["classification", "disease", "endogenous", "exogenous", "psychological", "diagnosis"],
    clinical_relevance: "Biopsychosocial disease model. Recognizes internal, external, and psychological causation requiring integrated treatment approaches."
  },
  {
    id: "ss-12",
    source: "sushruta",
    section: "Sutrasthana Ch.35",
    category: "Diagnostics (Nidana)",
    title_sanskrit: "Aturopakramaniya",
    title_english: "Patient Examination Method",
    verse_number: "35.3-10",
    content_sanskrit: "Prashna-darshana-sparshana pariksha trividha",
    content_english: "Patient examination involves three methods: Prashna (interrogation/history), Darshana (inspection/observation), and Sparshana (palpation). Systematic approach from head to toe described.",
    keywords: ["pariksha", "examination", "diagnosis", "history", "inspection", "palpation"],
    clinical_relevance: "Clinical examination methodology. History-taking, inspection, and palpation remain fundamental to medical practice worldwide."
  },
  {
    id: "ss-13",
    source: "sushruta",
    section: "Chikitsasthana Ch.1",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Dvivraniya Chikitsa",
    title_english: "Wound Classification & Treatment",
    verse_number: "1.3-8",
    content_sanskrit: "Nija agantu dwividho vranah shodhana ropana lepana",
    content_english: "Wounds are Nija (disease-related) or Agantu (traumatic). Treatment in stages: cleansing (Shodhana), granulation promotion (Ropana), application of pastes (Lepana), and protecting (Kavala).",
    keywords: ["wound", "healing", "stages", "debridement", "granulation", "dressing"],
    clinical_relevance: "Staged wound management approach. TIME (Tissue, Infection, Moisture, Edge) framework of modern wound care mirrors Sushruta's systematic approach."
  },
  {
    id: "ah-13",
    source: "ashtanga_hridaya",
    section: "Sutrasthana Ch.2",
    category: "Diet (Ahara)",
    title_sanskrit: "Dinacharya Adhyaya",
    title_english: "Daily Regimen",
    verse_number: "2.1-14",
    content_sanskrit: "Abhyanga-udwartana-vyayama-snana-anjana-nasya karma",
    content_english: "Daily routine includes oil massage (Abhyanga), dry powder massage (Udwartana), exercise (Vyayama), bathing (Snana), eye drops (Anjana), nasal drops (Nasya), and meditation (Dhyana).",
    keywords: ["dinacharya", "routine", "abhyanga", "massage", "exercise", "oil", "self-care"],
    clinical_relevance: "Self-care routine reduces stress hormones. Oil massage improves circulation and lymph drainage. Nasya maintains nasal mucosal health."
  },
  {
    id: "ah-14",
    source: "ashtanga_hridaya",
    section: "Chikitsasthana Ch.14",
    category: "Diseases (Vyadhi)",
    title_sanskrit: "Gulma Chikitsa",
    title_english: "Abdominal Mass Treatment",
    verse_number: "14.1-8",
    content_sanskrit: "Vataja pittaja kaphaja raktaja sannipataja gulma",
    content_english: "Five types of Gulma (abdominal mass/tumor): Vataja (functional/spastic), Pittaja (inflammatory), Kaphaja (cystic/growth), Raktaja (vascular), and Sannipataja (malignant). Treatment based on etiology.",
    keywords: ["gulma", "tumor", "mass", "abdomen", "cyst", "abdominal pain"],
    clinical_relevance: "Differential diagnosis of abdominal masses. Functional vs organic vs malignant classification guides investigation and management strategy."
  },
  {
    id: "cs-23",
    source: "charaka",
    section: "Chikitsasthana Ch.30",
    category: "Diseases (Vyadhi)",
    title_sanskrit: "Yonivyapad",
    title_english: "Gynecological Disorders",
    verse_number: "30.7-15",
    content_sanskrit: "Vimshati yonivyapadah mithya-achara-artava-dushti hetukah",
    content_english: "Twenty types of gynecological disorders caused by improper lifestyle, menstrual irregularities, and dosha imbalances. Includes dysmenorrhea, amenorrhea, infertility, and uterine disorders.",
    keywords: ["yoni", "gynecology", "menstrual", "fertility", "reproductive", "women"],
    clinical_relevance: "Comprehensive gynecology. Dosha-based classification helps personalize treatment for PCOS, endometriosis, and infertility management."
  },
  {
    id: "cs-24",
    source: "charaka",
    section: "Sutrasthana Ch.30",
    category: "Herbs (Dravya)",
    title_sanskrit: "Arthedasha Mahamuliya",
    title_english: "Ten Roots & Medicinal Plants",
    verse_number: "30.3-12",
    content_sanskrit: "Dashamoola-panchamula brihat-laghu bhedena",
    content_english: "Dashamoola (ten roots) includes Bilva, Agnimantha, Shyonaka, Patala, Gambhari (Brihat), and Shalaparni, Prishniparni, Brihati, Kantakari, Gokshura (Laghu). Anti-inflammatory and analgesic.",
    keywords: ["dashamoola", "roots", "anti-inflammatory", "pain", "herbs", "formulation"],
    clinical_relevance: "Dashamoola decoction shows potent anti-inflammatory activity comparable to NSAIDs. Used in post-surgical care and musculoskeletal disorders."
  },
  {
    id: "cs-25",
    source: "charaka",
    section: "Chikitsasthana Ch.12",
    category: "Diseases (Vyadhi)",
    title_sanskrit: "Shwasa-Kasa Chikitsa",
    title_english: "Respiratory Disease Treatment",
    verse_number: "12.8-15",
    content_sanskrit: "Tamaka shwasa pratyusha-sheeta-abhrapaya hetukah",
    content_english: "Five types of Shwasa (dyspnea) including Tamaka Shwasa (bronchial asthma) triggered by cold, clouds, dust, and wind. Treatment involves bronchodilator herbs, steam inhalation, and Vamana.",
    keywords: ["shwasa", "asthma", "bronchitis", "respiratory", "dyspnea", "cough", "kasa"],
    clinical_relevance: "Asthma triggers and management. Vasa (Adhatoda vasica) is source of bromhexine. Steam inhalation and trigger avoidance remain primary treatment."
  },
  {
    id: "ah-15",
    source: "ashtanga_hridaya",
    section: "Sutrasthana Ch.14",
    category: "Treatments (Chikitsa)",
    title_sanskrit: "Nasya Vidhi",
    title_english: "Nasal Medication Procedures",
    verse_number: "14.1-8",
    content_sanskrit: "Nasa hi shiraso dwaram tena dattam nasya-aushadham",
    content_english: "The nose is the gateway to the brain. Nasal medications reach the brain directly. Types: Virechana (cleansing), Brimhana (nourishing), Shamana (pacifying). Indicated in all diseases above the clavicle.",
    keywords: ["nasya", "nasal", "brain", "sinus", "head", "nose", "neuro"],
    clinical_relevance: "Intranasal drug delivery bypasses blood-brain barrier. Modern nasal sprays (insulin, oxytocin, vaccines) validate this route. Anu Taila shows sinusitis benefits."
  },
  {
    id: "ah-16",
    source: "ashtanga_hridaya",
    section: "Chikitsasthana Ch.6",
    category: "Diseases (Vyadhi)",
    title_sanskrit: "Amavata Chikitsa",
    title_english: "Rheumatoid Arthritis Treatment",
    verse_number: "6.1-8",
    content_sanskrit: "Mandagni-viruddhahara-viharaat ama-vata-prakopah",
    content_english: "Amavata (rheumatoid arthritis) caused by weak digestion, incompatible food, and sedentary lifestyle. Ama combines with Vata causing joint inflammation, stiffness, and pain.",
    keywords: ["amavata", "rheumatoid", "arthritis", "joint", "inflammation", "autoimmune"],
    clinical_relevance: "Gut-joint axis in autoimmunity. Leaky gut theory parallels Ama concept. Anti-inflammatory herbs (Shallaki, Guggulu) show efficacy in clinical trials."
  },
  {
    id: "cs-26",
    source: "charaka",
    section: "Sutrasthana Ch.26",
    category: "Herbs (Dravya)",
    title_sanskrit: "Atreyabhadrakapiya",
    title_english: "Properties of Key Herbs",
    verse_number: "26.42-60",
    content_sanskrit: "Amalaki vayasthapana-anam shreshtha guduchi amritaa cha",
    content_english: "Amalaki (Indian Gooseberry) is best among anti-aging herbs. Guduchi (Tinospora) is the best immunomodulator. Haridra (Turmeric) is best anti-inflammatory. Detailed properties of 500+ herbs.",
    keywords: ["amalaki", "guduchi", "haridra", "turmeric", "herbs", "amla", "properties"],
    clinical_relevance: "Top herbs validated: Curcumin (anti-inflammatory), Amla (antioxidant richest source of Vitamin C), Guduchi (immunomodulator). All with extensive clinical trial data."
  },
  {
    id: "ss-14",
    source: "sushruta",
    section: "Sharira Sthana Ch.9",
    category: "Anatomy (Shareera)",
    title_sanskrit: "Garbhini Vyakarana",
    title_english: "Obstetric Care",
    verse_number: "9.1-10",
    content_sanskrit: "Masanumasika garbhini paricharya vidhih",
    content_english: "Month-by-month pregnancy care protocol: specific diet, activities, medicines for each trimester. Includes Garbhasthapana (anti-abortifacient) drugs and delivery preparation.",
    keywords: ["garbhini", "pregnancy", "obstetrics", "prenatal", "antenatal", "delivery"],
    clinical_relevance: "Structured antenatal care. Trimester-specific dietary recommendations parallel modern prenatal nutrition. Garbhasthapana herbs show uterine-tonic properties."
  },
];

const SOURCE_LABELS: Record<string, string> = {
  charaka: "Charaka Samhita",
  sushruta: "Sushruta Samhita",
  ashtanga_hridaya: "Ashtanga Hridaya",
};

const SOURCE_COLORS: Record<string, string> = {
  charaka: "bg-amber-100 text-amber-800",
  sushruta: "bg-blue-100 text-blue-800",
  ashtanga_hridaya: "bg-emerald-100 text-emerald-800",
};

const CATEGORIES = [
  "All",
  "Diseases (Vyadhi)",
  "Treatments (Chikitsa)",
  "Herbs (Dravya)",
  "Anatomy (Shareera)",
  "Diagnostics (Nidana)",
  "Diet (Ahara)",
];

const SOURCES = ["All", "charaka", "sushruta", "ashtanga_hridaya"];

export default function ClassicalReferenceEngine() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const filteredResults = useMemo(() => {
    let results = REFERENCES_DB;

    if (sourceFilter !== "All") {
      results = results.filter((r) => r.source === sourceFilter);
    }
    if (categoryFilter !== "All") {
      results = results.filter((r) => r.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.title_english.toLowerCase().includes(query) ||
          r.title_sanskrit.toLowerCase().includes(query) ||
          r.content_english.toLowerCase().includes(query) ||
          r.content_sanskrit.toLowerCase().includes(query) ||
          r.keywords.some((k) => k.toLowerCase().includes(query)) ||
          r.clinical_relevance.toLowerCase().includes(query) ||
          r.section.toLowerCase().includes(query)
      );
    }
    return results;
  }, [searchQuery, sourceFilter, categoryFilter]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast("Bookmark removed");
      } else {
        next.add(id);
        toast.success("Reference bookmarked");
      }
      return next;
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-amber-700" />
          <h1 className="text-3xl font-bold text-gray-900">
            Classical Reference Engine
          </h1>
        </div>
        <p className="text-gray-600">
          Search Charaka Samhita, Sushruta Samhita & Ashtanga Hridaya
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          className="pl-12 h-14 text-lg rounded-xl border-2 border-amber-200 focus:border-amber-500"
          placeholder="Search by disease, treatment, herb, or concept..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <Button
                key={s}
                variant={sourceFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setSourceFilter(s)}
                className={sourceFilter === s ? "bg-amber-700 hover:bg-amber-800" : ""}
              >
                {s === "All" ? "All Sources" : SOURCE_LABELS[s]}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                variant={categoryFilter === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(c)}
                className={categoryFilter === c ? "bg-amber-700 hover:bg-amber-800" : ""}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found
      </p>

      {/* Results */}
      <div className="space-y-4">
        {filteredResults.map((ref) => (
          <Card
            key={ref.id}
            className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
            style={{
              borderLeftColor:
                ref.source === "charaka"
                  ? "#b45309"
                  : ref.source === "sushruta"
                  ? "#1d4ed8"
                  : "#047857",
            }}
            onClick={() => setExpandedId(expandedId === ref.id ? null : ref.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={SOURCE_COLORS[ref.source]}>
                      {SOURCE_LABELS[ref.source]}
                    </Badge>
                    <span className="text-sm text-gray-500">{ref.section}</span>
                    <span className="text-sm text-gray-400">v.{ref.verse_number}</span>
                  </div>
                  <CardTitle className="text-lg">
                    <span className="text-amber-800 italic">{ref.title_sanskrit}</span>
                    {" — "}
                    <span>{ref.title_english}</span>
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(ref.id);
                  }}
                >
                  {bookmarks.has(ref.id) ? (
                    <BookmarkCheck className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium text-green-800">Clinical Relevance: </span>
                {ref.clinical_relevance}
              </p>
              {expandedId === ref.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Sanskrit</p>
                    <p className="text-sm italic text-amber-900 bg-amber-50 p-3 rounded">
                      {ref.content_sanskrit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Translation</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {ref.content_english}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ref.keywords.map((kw) => (
                      <Badge key={kw} variant="secondary" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredResults.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No references found matching your search.</p>
            <p className="text-sm mt-1">Try different keywords or clear filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
