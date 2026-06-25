// Dravyaguna — Ayurvedic ingredient encyclopedia (seed data)
export type Rasa = "Madhura" | "Amla" | "Lavana" | "Katu" | "Tikta" | "Kashaya";
export type Veerya = "Ushna" | "Sheeta";
export type Vipaka = "Madhura" | "Amla" | "Katu";
export type DoshaEffect = "pacifies" | "aggravates" | "neutral";

export interface Ingredient {
  id: string;
  sanskrit: string;
  common: string;
  latin: string;
  rasa: Rasa[];
  guna: string[];
  veerya: Veerya;
  vipaka: Vipaka;
  dosha: { vata: DoshaEffect; pitta: DoshaEffect; kapha: DoshaEffect };
  prabhava?: string;
  oneLine: string;
  conditions: string[];
  role: string; // Pradhana / Yoga vahi / Anupana etc.
  reference: string;
  usedIn: string[]; // formula ids matching ClassicalFormulary seed
}

export const RASA_STYLES: Record<Rasa, string> = {
  Madhura: "bg-green-100 text-green-800 border-green-200",
  Amla: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Lavana: "bg-blue-100 text-blue-800 border-blue-200",
  Katu: "bg-red-100 text-red-800 border-red-200",
  Tikta: "bg-purple-100 text-purple-800 border-purple-200",
  Kashaya: "bg-amber-200 text-amber-900 border-amber-300",
};

// Known viruddha (incompatible) pairs — illustrative, not exhaustive
export const VIRUDDHA_PAIRS: Array<[string, string, string]> = [
  ["honey-equivalent", "ghee-equivalent", "Equal parts honey + ghee — classical Samyoga Viruddha"],
  ["yashthimadhu", "guggulu", "Demulcent vs scraping action — reduces guggulu efficacy"],
  ["pippali", "shilajatu", "Use cautiously together in long courses (Veerya conflict)"],
];

export const INGREDIENTS: Ingredient[] = [
  {
    id: "ashwagandha", sanskrit: "अश्वगन्धा", common: "Indian Ginseng / Winter Cherry", latin: "Withania somnifera",
    rasa: ["Tikta", "Kashaya", "Madhura"], guna: ["Laghu", "Snigdha"], veerya: "Ushna", vipaka: "Madhura",
    dosha: { vata: "pacifies", pitta: "neutral", kapha: "pacifies" },
    prabhava: "Balya (strength-promoting) & Vajikara (aphrodisiac)",
    oneLine: "Premier Rasayana for debility, stress and Vata disorders.",
    conditions: ["Debility", "Insomnia", "Anxiety", "Sandhivata", "Klaibya"],
    role: "Pradhana Dravya in Rasayana yogas; Yoga Vahi with milk.",
    reference: "Bhavaprakasha Nighantu, Guduchyadi Varga",
    usedIn: ["ashwagandha-churna", "mahanarayan-taila"],
  },
  {
    id: "shatavari", sanskrit: "शतावरी", common: "Wild Asparagus", latin: "Asparagus racemosus",
    rasa: ["Madhura", "Tikta"], guna: ["Guru", "Snigdha"], veerya: "Sheeta", vipaka: "Madhura",
    dosha: { vata: "pacifies", pitta: "pacifies", kapha: "aggravates" },
    prabhava: "Stanyajanana (galactagogue)",
    oneLine: "Cooling Rasayana for women's reproductive health and Pitta disorders.",
    conditions: ["Amenorrhea", "Low lactation", "Hyperacidity", "Menopause"],
    role: "Pradhana in Stree-roga yogas.",
    reference: "Charaka Samhita, Sutrasthana 4",
    usedIn: [],
  },
  {
    id: "guduchi", sanskrit: "गुडूची", common: "Heart-leaved Moonseed / Giloy", latin: "Tinospora cordifolia",
    rasa: ["Tikta", "Kashaya"], guna: ["Laghu", "Snigdha"], veerya: "Ushna", vipaka: "Madhura",
    dosha: { vata: "pacifies", pitta: "pacifies", kapha: "pacifies" },
    prabhava: "Tridoshahara & Rasayana",
    oneLine: "Universal immunomodulator and antipyretic.",
    conditions: ["Jwara (Fever)", "Pandu", "Madhumeha", "Amavata"],
    role: "Pradhana in Jwara & Amavata chikitsa.",
    reference: "Bhavaprakasha Nighantu, Guduchyadi Varga",
    usedIn: [],
  },
  {
    id: "triphala", sanskrit: "त्रिफला", common: "Three Fruits", latin: "Group: Terminalia chebula + T. bellirica + Phyllanthus emblica",
    rasa: ["Kashaya", "Amla", "Madhura", "Tikta", "Katu"], guna: ["Laghu", "Ruksha"], veerya: "Ushna", vipaka: "Madhura",
    dosha: { vata: "neutral", pitta: "pacifies", kapha: "pacifies" },
    prabhava: "Tridoshashamaka Rasayana",
    oneLine: "Gentle Rasayana for digestion, eyes and bowel regularity.",
    conditions: ["Constipation", "Netra roga", "Medoroga"],
    role: "Anupana & Yoga Vahi in numerous Vati & Churna formulas.",
    reference: "Ashtanga Hridaya, Uttara 13",
    usedIn: ["triphala-churna", "yogaraja-guggulu", "arogyavardhini-vati"],
  },
  {
    id: "haridra", sanskrit: "हरिद्रा", common: "Turmeric", latin: "Curcuma longa",
    rasa: ["Tikta", "Katu"], guna: ["Laghu", "Ruksha"], veerya: "Ushna", vipaka: "Katu",
    dosha: { vata: "neutral", pitta: "pacifies", kapha: "pacifies" },
    prabhava: "Kushtaghna, Krimighna, Varnya",
    oneLine: "Best blood purifier and skin-healer.",
    conditions: ["Kushtha (Skin)", "Prameha", "Allergy"],
    role: "Pradhana in skin & metabolic yogas.",
    reference: "Bhavaprakasha Nighantu, Haritakyadi Varga",
    usedIn: [],
  },
  {
    id: "arjuna", sanskrit: "अर्जुन", common: "Arjuna Bark", latin: "Terminalia arjuna",
    rasa: ["Kashaya"], guna: ["Laghu", "Ruksha"], veerya: "Sheeta", vipaka: "Katu",
    dosha: { vata: "neutral", pitta: "pacifies", kapha: "pacifies" },
    prabhava: "Hridya (cardio-tonic)",
    oneLine: "Premier cardio-tonic for Hridroga.",
    conditions: ["Hridroga (Heart disease)", "Hypertension", "Rakta pitta"],
    role: "Pradhana in cardiac yogas.",
    reference: "Bhavaprakasha Nighantu, Vatadi Varga",
    usedIn: [],
  },
  {
    id: "brahmi", sanskrit: "ब्राह्मी", common: "Indian Pennywort", latin: "Bacopa monnieri",
    rasa: ["Tikta", "Kashaya"], guna: ["Laghu", "Snigdha"], veerya: "Sheeta", vipaka: "Madhura",
    dosha: { vata: "pacifies", pitta: "pacifies", kapha: "pacifies" },
    prabhava: "Medhya (cognition enhancer)",
    oneLine: "Best Medhya Rasayana for memory and mental disorders.",
    conditions: ["Smriti hrasa", "Apasmara (Epilepsy)", "Unmada"],
    role: "Pradhana in Medhya yogas; Yoga Vahi with ghrita.",
    reference: "Charaka Samhita, Chikitsa 1",
    usedIn: ["brahmi-ghrita"],
  },
  {
    id: "shankhapushpi", sanskrit: "शङ्खपुष्पी", common: "Aloe Weed", latin: "Convolvulus pluricaulis",
    rasa: ["Tikta", "Kashaya"], guna: ["Snigdha", "Pichchhila"], veerya: "Sheeta", vipaka: "Madhura",
    dosha: { vata: "pacifies", pitta: "pacifies", kapha: "neutral" },
    prabhava: "Medhya, Manas Shamaka",
    oneLine: "Calming Medhya for anxiety and insomnia.",
    conditions: ["Anidra", "Chitta udvega", "Apasmara"],
    role: "Pradhana in psychiatric yogas.",
    reference: "Bhavaprakasha Nighantu",
    usedIn: [],
  },
  {
    id: "punarnava", sanskrit: "पुनर्नवा", common: "Spreading Hogweed", latin: "Boerhavia diffusa",
    rasa: ["Madhura", "Tikta", "Kashaya"], guna: ["Laghu", "Ruksha"], veerya: "Ushna", vipaka: "Madhura",
    dosha: { vata: "pacifies", pitta: "neutral", kapha: "pacifies" },
    prabhava: "Shothaghna (anti-edema), Mutrala",
    oneLine: "Best diuretic for edema and renal disorders.",
    conditions: ["Shotha", "Mutrakricchra", "Yakrit vikara"],
    role: "Pradhana in Shotha chikitsa.",
    reference: "Bhavaprakasha Nighantu, Guduchyadi Varga",
    usedIn: [],
  },
  {
    id: "gokshura", sanskrit: "गोक्षुर", common: "Small Caltrops", latin: "Tribulus terrestris",
    rasa: ["Madhura"], guna: ["Guru", "Snigdha"], veerya: "Sheeta", vipaka: "Madhura",
    dosha: { vata: "pacifies", pitta: "pacifies", kapha: "neutral" },
    prabhava: "Mutrala, Vajikara",
    oneLine: "Diuretic & rejuvenator for urinary and reproductive systems.",
    conditions: ["Ashmari", "Mutrakricchra", "Klaibya"],
    role: "Pradhana in Mutravaha srotas yogas.",
    reference: "Charaka Samhita, Sutrasthana 4",
    usedIn: ["chandraprabha-vati", "dashamula-kwatha"],
  },
  {
    id: "vacha", sanskrit: "वचा", common: "Sweet Flag", latin: "Acorus calamus",
    rasa: ["Katu", "Tikta"], guna: ["Laghu", "Tikshna"], veerya: "Ushna", vipaka: "Katu",
    dosha: { vata: "pacifies", pitta: "aggravates", kapha: "pacifies" },
    prabhava: "Medhya, Vakshuddhikara (clears speech)",
    oneLine: "Sharp Medhya useful in speech and consciousness disorders.",
    conditions: ["Apasmara", "Speech delay", "Kasa"],
    role: "Adjuvant in Vati & Ghrita yogas.",
    reference: "Bhavaprakasha Nighantu, Haritakyadi Varga",
    usedIn: ["chandraprabha-vati", "brahmi-ghrita"],
  },
  {
    id: "bala", sanskrit: "बला", common: "Country Mallow", latin: "Sida cordifolia",
    rasa: ["Madhura"], guna: ["Guru", "Snigdha"], veerya: "Sheeta", vipaka: "Madhura",
    dosha: { vata: "pacifies", pitta: "pacifies", kapha: "neutral" },
    prabhava: "Balya (strength), Brimhana",
    oneLine: "Cooling Vata-pacifier for neurological & musculoskeletal weakness.",
    conditions: ["Vatavyadhi", "Paralysis", "Debility"],
    role: "Pradhana in Vata-shamaka tailas.",
    reference: "Ashtanga Hridaya, Chikitsa 21",
    usedIn: ["mahanarayan-taila", "ksheerabala-taila"],
  },
  {
    id: "dashamula", sanskrit: "दशमूल", common: "Ten Roots", latin: "Group of 10 classical roots",
    rasa: ["Tikta", "Kashaya", "Madhura"], guna: ["Laghu", "Ruksha"], veerya: "Ushna", vipaka: "Katu",
    dosha: { vata: "pacifies", pitta: "neutral", kapha: "pacifies" },
    prabhava: "Tridoshashamaka, Shothaghna",
    oneLine: "Foundational Vata-Kapha pacifying group.",
    conditions: ["Vatavyadhi", "Sutika roga", "Shotha"],
    role: "Pradhana in Kashaya & Taila yogas.",
    reference: "Sahasrayogam, Kashaya Prakarana",
    usedIn: ["dashamula-kwatha"],
  },
  {
    id: "nimba", sanskrit: "निम्ब", common: "Neem", latin: "Azadirachta indica",
    rasa: ["Tikta", "Kashaya"], guna: ["Laghu", "Ruksha"], veerya: "Sheeta", vipaka: "Katu",
    dosha: { vata: "aggravates", pitta: "pacifies", kapha: "pacifies" },
    prabhava: "Kushtaghna, Krimighna",
    oneLine: "Premier blood purifier for skin and infections.",
    conditions: ["Kushtha", "Visarpa", "Krimi"],
    role: "Pradhana in Tikta-skandha yogas.",
    reference: "Bhavaprakasha Nighantu",
    usedIn: ["mahatiktaka-ghrita"],
  },
  {
    id: "kutki", sanskrit: "कटुकी", common: "Picrorhiza", latin: "Picrorhiza kurroa",
    rasa: ["Tikta"], guna: ["Laghu", "Ruksha"], veerya: "Sheeta", vipaka: "Katu",
    dosha: { vata: "aggravates", pitta: "pacifies", kapha: "pacifies" },
    prabhava: "Yakrit-uttejaka (hepatic stimulant)",
    oneLine: "Best hepato-protective bitter.",
    conditions: ["Kamala", "Yakrit vikara", "Jwara"],
    role: "Pradhana in liver yogas.",
    reference: "Bhavaprakasha Nighantu, Haritakyadi Varga",
    usedIn: ["arogyavardhini-vati", "mahatiktaka-ghrita"],
  },
  {
    id: "vidanga", sanskrit: "विडङ्ग", common: "False Black Pepper", latin: "Embelia ribes",
    rasa: ["Katu", "Kashaya"], guna: ["Laghu", "Ruksha", "Tikshna"], veerya: "Ushna", vipaka: "Katu",
    dosha: { vata: "pacifies", pitta: "neutral", kapha: "pacifies" },
    prabhava: "Krimighna (anti-parasitic)",
    oneLine: "Best anti-helminthic drug in Ayurveda.",
    conditions: ["Krimi roga", "Udarashoola", "Agnimandya"],
    role: "Pradhana in Krimighna yogas.",
    reference: "Charaka Samhita, Chikitsa 7",
    usedIn: [],
  },
  {
    id: "pippali", sanskrit: "पिप्पली", common: "Long Pepper", latin: "Piper longum",
    rasa: ["Katu"], guna: ["Laghu", "Snigdha", "Tikshna"], veerya: "Ushna", vipaka: "Madhura",
    dosha: { vata: "pacifies", pitta: "aggravates", kapha: "pacifies" },
    prabhava: "Yoga Vahi par excellence; Rasayana for respiratory system",
    oneLine: "Bio-enhancer and Rasayana for Pranavaha srotas.",
    conditions: ["Kasa", "Shwasa", "Agnimandya", "Pleeha vikara"],
    role: "Yoga Vahi & Anupana in countless yogas.",
    reference: "Charaka Samhita, Chikitsa 1.3",
    usedIn: ["sitopaladi-churna"],
  },
  {
    id: "shilajatu", sanskrit: "शिलाजतु", common: "Shilajit", latin: "Asphaltum punjabianum",
    rasa: ["Katu", "Tikta", "Kashaya", "Lavana"], guna: ["Guru"], veerya: "Ushna", vipaka: "Katu",
    dosha: { vata: "pacifies", pitta: "neutral", kapha: "pacifies" },
    prabhava: "Rasayana, Yogavahi for minerals",
    oneLine: "Mineral pitch — Rasayana for Prameha and debility.",
    conditions: ["Madhumeha", "Klaibya", "Mutra vikara"],
    role: "Pradhana mineral in Vati yogas.",
    reference: "Charaka Samhita, Chikitsa 1.3",
    usedIn: ["chandraprabha-vati"],
  },
  {
    id: "guggulu", sanskrit: "गुग्गुलु", common: "Indian Bdellium", latin: "Commiphora wightii",
    rasa: ["Tikta", "Katu", "Kashaya"], guna: ["Laghu", "Ruksha", "Tikshna"], veerya: "Ushna", vipaka: "Katu",
    dosha: { vata: "pacifies", pitta: "neutral", kapha: "pacifies" },
    prabhava: "Lekhana (scraping) & Sandhaniya (healing)",
    oneLine: "Best lipid-scraper and joint-healer.",
    conditions: ["Amavata", "Medoroga", "Vatavyadhi"],
    role: "Pradhana in Guggulu kalpas.",
    reference: "Sharangadhara Samhita, Madhyama Khanda 7",
    usedIn: ["chandraprabha-vati", "yogaraja-guggulu"],
  },
  {
    id: "yashthimadhu", sanskrit: "यष्टिमधु", common: "Licorice", latin: "Glycyrrhiza glabra",
    rasa: ["Madhura"], guna: ["Guru", "Snigdha"], veerya: "Sheeta", vipaka: "Madhura",
    dosha: { vata: "pacifies", pitta: "pacifies", kapha: "aggravates" },
    prabhava: "Rasayana for Pranavaha srotas",
    oneLine: "Sweet demulcent for cough, ulcers and ojas-building.",
    conditions: ["Kasa", "Amlapitta", "Vrana"],
    role: "Yoga Vahi & Anupana, often with honey.",
    reference: "Bhavaprakasha Nighantu, Haritakyadi Varga",
    usedIn: [],
  },
];
