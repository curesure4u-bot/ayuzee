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
};

export type Category = {
  key: string;
  icon: string;
  name: string;
  sanskrit: string;
  modern: string;
  diseases: Disease[];
};

const d = (
  ch: number,
  name: string,
  modern: string,
  extra?: Partial<Disease>,
): Disease => ({
  ch,
  key: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  modern,
  ...extra,
});

// Two flagship diseases ship with full protocols; others render a graceful
// "protocol coming soon" state until DB-backed content is added.
const TAMAKA_SWASA: Partial<Disease> = {
  definition:
    "Tamaka Swasa is a Vata-Kaphaja disorder marked by recurrent paroxysmal dyspnoea with wheezing, cough and chest tightness, equivalent to Bronchial Asthma.",
  nidana:
    "Exposure to cold/dust/smoke, Guru-Abhishyandi ahara, Sheeta jala snana, Rajas-Dhuma sevana, allergens, viral infection, exertion, atopy.",
  lakshana: [
    "Shwasa kruchrata (difficulty in breathing)",
    "Ghurghuruka (wheezing)",
    "Kasa with shleshma nishtheevana",
    "Aaseena labhate saukhyam (relief in sitting posture)",
    "Lalata sweda, mukha shosha",
  ],
  diagnostic:
    "Episodic wheeze + dyspnoea, reversibility on bronchodilator (PEFR ≥12%/200 mL on spirometry), nocturnal cough, atopy history.",
  pathya:
    "Ushna jala, Yava, Purana shali, Mudga yusha, Patola, Karkati, Draksha, Dadima, Madhu, Ardraka.",
  apathya:
    "Sheeta jala, Dadhi, Matsya, Masha, Pishtanna, Guru-Abhishyandi ahara, Dhuma, Rajas, Diwaswapna.",
  prognosis:
    "Sukha-sadhya in early stage; Krichra-sadhya when chronic; Yapya when recurrent with cor pulmonale.",
  references: "AYUSH ASTG 2017 — Chapter 2, p. 18-26.",
  levels: [
    {
      level: 1,
      label: "Level 1",
      facility: "PHC / Dispensary",
      description: "Symptomatic relief, lifestyle counselling, Shamana therapy.",
      medicines: [
        { name: "Sitopaladi Churna", formulation: "Churna", dose: "3 g BD", anupana: "Madhu", duration: "14 days", isCommon: true },
        { name: "Vasavaleha", formulation: "Avaleha", dose: "10 g BD", anupana: "Ushna jala", duration: "14 days" },
        { name: "Kanakasava", formulation: "Asava", dose: "15 ml BD post-meal", anupana: "Equal water", duration: "14 days" },
      ],
    },
    {
      level: 2,
      label: "Level 2",
      facility: "CHC",
      description: "Add Rasaushadhi for refractory cases.",
      panchakarma: "Vamana in Kapha-pradhana, Virechana in Pitta-anubandha.",
      medicines: [
        { dosha: "Vata-Kapha", name: "Shwasa Kuthara Rasa", formulation: "Vati", dose: "125 mg BD", anupana: "Ardraka swarasa + Madhu", duration: "21 days" },
        { name: "Bharangyadi Kashaya", formulation: "Kashaya", dose: "15 ml BD before meals", anupana: "Equal water", duration: "21 days" },
        { name: "Talisadi Churna", formulation: "Churna", dose: "3 g TDS", anupana: "Madhu", duration: "21 days" },
      ],
    },
    {
      level: 3,
      label: "Level 3",
      facility: "District / Specialty Hospital",
      description: "Specialist Panchakarma + Rasayana for steroid-dependent cases.",
      panchakarma: "Vamana → Virechana → Shamana → Rasayana (Chyavanaprasha, Agastya Haritaki).",
      medicines: [
        { name: "Chyavanaprasha", formulation: "Avaleha", dose: "10 g OD AM", anupana: "Warm milk", duration: "3 months (Rasayana)" },
        { name: "Agastya Haritaki Avaleha", formulation: "Avaleha", dose: "10 g HS", anupana: "Ushna jala", duration: "1 month" },
        { name: "Swasahara Lauha", formulation: "Lauha", dose: "125 mg BD", anupana: "Madhu + Ghrita", duration: "30 days" },
      ],
    },
  ],
};

const MADHUMEHA: Partial<Disease> = {
  definition:
    "Madhumeha is a Vataja Prameha characterised by passage of sweet (Madhura) urine, equivalent to Diabetes Mellitus.",
  nidana:
    "Atisampoorana ahara, Diwaswapna, Asyasukha, Avyayama, sedentary lifestyle, excess Madhura-Snigdha-Guru ahara, Bija dosha (genetic).",
  lakshana: [
    "Prabhuta-Avila mutrata (polyuria with turbidity)",
    "Pipasa adhikya (polydipsia)",
    "Kshudha adhikya (polyphagia)",
    "Karapada daha-suptata",
    "Daurbalya, Karshya",
  ],
  diagnostic:
    "FBS ≥126 mg/dL, PPBS ≥200 mg/dL, HbA1c ≥6.5%, or random ≥200 mg/dL with classical symptoms.",
  pathya: "Yava, Kulattha, Mudga, Karela, Methi, Jambu, Amalaki, walking 30 min/day.",
  apathya: "Guda, Ikshu, Dadhi, Pishtanna, Nava anna, Diwaswapna, Avyayama.",
  prognosis: "Yapya — controllable with sustained regimen; complications if neglected.",
  references: "AYUSH ASTG 2017 — Chapter 11, p. 92-101.",
  levels: [
    {
      level: 1,
      label: "Level 1",
      facility: "PHC",
      description: "Diet, exercise, single-herb Shamana.",
      medicines: [
        { name: "Nisha Amalaki Churna", formulation: "Churna", dose: "3 g BD", anupana: "Ushna jala", duration: "60 days", isCommon: true },
        { name: "Mehari Churna", formulation: "Churna", dose: "3 g BD before meals", anupana: "Ushna jala", duration: "60 days" },
      ],
    },
    {
      level: 2,
      label: "Level 2",
      facility: "CHC",
      description: "Compound formulations for moderate hyperglycaemia.",
      medicines: [
        { name: "Chandraprabha Vati", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "90 days" },
        { name: "Vasanta Kusumakara Rasa", formulation: "Rasa", dose: "125 mg OD AM", anupana: "Madhu + Ghrita", duration: "30 days" },
        { name: "Asanadi Kashaya", formulation: "Kashaya", dose: "15 ml BD before meals", anupana: "Equal water", duration: "60 days" },
      ],
    },
    {
      level: 3,
      label: "Level 3",
      facility: "District / Specialty Hospital",
      description: "Panchakarma + Rasayana for complications (neuropathy, nephropathy).",
      panchakarma: "Udvartana, Takra Dhara, Virechana with Trivrit, followed by Rasayana.",
      medicines: [
        { name: "Shilajatu Rasayana", formulation: "Rasayana", dose: "250 mg BD", anupana: "Warm milk", duration: "3 months" },
        { name: "Triphala Guggulu", formulation: "Vati", dose: "500 mg BD", anupana: "Ushna jala", duration: "90 days" },
      ],
    },
  ],
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
      d(2, "Tamaka Swasa", "Bronchial Asthma", TAMAKA_SWASA),
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
      d(11, "Madhumeha", "Diabetes Mellitus", MADHUMEHA),
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
];

export function findDisease(categoryKey: string, diseaseKey: string) {
  const category = CATEGORIES.find((c) => c.key === categoryKey);
  if (!category) return null;
  const disease = category.diseases.find((dx) => dx.key === diseaseKey);
  if (!disease) return null;
  return { category, disease };
}
