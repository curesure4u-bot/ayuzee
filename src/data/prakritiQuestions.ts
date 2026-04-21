// CCRAS / Ministry of AYUSH — Manual of SOPs for Prakriti Assessment.
// Each option maps to one of the three doshas: Vata, Pitta, Kapha.
// Sanskrit terms, classical references, examiner notes & section intros are
// taken from the CCRAS SOP Manual (2nd Edition, 2020).

export type Dosha = "vata" | "pitta" | "kapha";

export interface PrakritiOption {
  label: string;
  sanskrit?: string;     // e.g. "Krisha Sharira"
  dosha: Dosha;
}

export interface PrakritiQuestion {
  id: string;
  section: "physical" | "physiological" | "psychological";
  trait: string;          // English trait
  sanskritTrait?: string; // Sanskrit trait
  question: string;
  reference?: string;     // classical reference, e.g. "Charaka Vimana 8/96"
  examinerNote?: string;  // for doctor / therapist mode
  image?: string;         // /prakriti/<id>.jpg (3-panel composite)
  options: PrakritiOption[];
}

export const SECTION_INTROS: Record<string, { title: string; sanskrit: string; intro: string }> = {
  physical: {
    title: "Physical Traits",
    sanskrit: "Sharira Lakshana",
    intro: "Observable bodily characteristics — built, complexion, skin, eyes, hair, teeth, nails, joints and voice. The assessor inspects the subject in good natural light, with the patient seated comfortably and minimally clothed where appropriate.",
  },
  physiological: {
    title: "Physiological Traits",
    sanskrit: "Kriya Lakshana",
    intro: "Functional patterns of the body — appetite, digestion, sweat, sleep, stamina, thermoregulation and elimination. These are recorded from patient history over the last 1–3 months of normal health.",
  },
  psychological: {
    title: "Psychological Traits",
    sanskrit: "Manasika Lakshana",
    intro: "Mental and behavioural tendencies — memory, speech, emotional response, decision-making, dreams and social conduct. Recorded through structured interview and, where possible, observation.",
  },
};

export const PRAKRITI_QUESTIONS: PrakritiQuestion[] = [
  // ---------------- PHYSICAL ----------------
  { id: "built", section: "physical", trait: "Built", sanskritTrait: "Sharira",
    question: "How would you describe your body build?",
    reference: "Charaka Vimana 8/96–98",
    examinerNote: "Observe the subject standing in relaxed posture. Note frame size, prominence of joints/veins and overall proportion.",
    image: "/prakriti/built.jpg",
    options: [
      { label: "Lean / thin, prominent joints & veins", sanskrit: "Krisha Sharira", dosha: "vata" },
      { label: "Medium, well-proportioned, moderate musculature", sanskrit: "Madhyama Sharira", dosha: "pitta" },
      { label: "Large, heavy, broad frame, well-developed", sanskrit: "Sthula Sharira", dosha: "kapha" },
    ]},
  { id: "weight", section: "physical", trait: "Body Weight", sanskritTrait: "Sharira Bhara",
    question: "Your typical body weight tendency is:",
    reference: "Charaka Vimana 8/96",
    examinerNote: "Record current weight and patient-reported lifetime tendency. Look for ease of weight gain or loss.",
    image: "/prakriti/weight.jpg",
    options: [
      { label: "Low — hard to gain weight", sanskrit: "Alpa Bhara", dosha: "vata" },
      { label: "Moderate — easy to maintain", sanskrit: "Madhyama Bhara", dosha: "pitta" },
      { label: "Heavy — gains easily, hard to lose", sanskrit: "Adhika Bhara", dosha: "kapha" },
    ]},
  { id: "height", section: "physical", trait: "Height", sanskritTrait: "Praman",
    question: "Your height compared to family/peers is:",
    reference: "Charaka Vimana 8/97",
    examinerNote: "Measure standing height; compare with regional/familial norms.",
    image: "/prakriti/height.jpg",
    options: [
      { label: "Very tall or very short (irregular)", sanskrit: "Ati-Dirgha / Hrasva", dosha: "vata" },
      { label: "Average / medium", sanskrit: "Madhyama", dosha: "pitta" },
      { label: "Tall and well-built or short and stocky", sanskrit: "Dirgha-Sthula", dosha: "kapha" },
    ]},
  { id: "skin_colour", section: "physical", trait: "Skin Colour", sanskritTrait: "Twak Varna",
    question: "Your natural skin tone is:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Inspect inner forearm in natural daylight. Avoid sun-exposed areas.",
    image: "/prakriti/skin_colour.jpg",
    options: [
      { label: "Dark / dusky / blackish", sanskrit: "Krishna / Shyama", dosha: "vata" },
      { label: "Fair, reddish, copper or yellowish tinge", sanskrit: "Tamra / Pita", dosha: "pitta" },
      { label: "Fair, glowing, white-ish", sanskrit: "Gaura / Shukla", dosha: "kapha" },
    ]},
  { id: "skin_texture", section: "physical", trait: "Skin Texture", sanskritTrait: "Twak Sparsha",
    question: "Your skin texture is usually:",
    reference: "Charaka Vimana 8/98; Sushruta Sharira 4/63",
    examinerNote: "Palpate the inner forearm and back of the hand for moisture, warmth and roughness.",
    image: "/prakriti/skin_texture.jpg",
    options: [
      { label: "Dry, rough, cracks, cold to touch", sanskrit: "Ruksha", dosha: "vata" },
      { label: "Soft, warm, oily, with moles/freckles", sanskrit: "Snigdha-Ushna", dosha: "pitta" },
      { label: "Thick, smooth, oily, cool, well-hydrated", sanskrit: "Snigdha-Shita", dosha: "kapha" },
    ]},
  { id: "eyes_size", section: "physical", trait: "Eyes — Size", sanskritTrait: "Netra Praman",
    question: "Your eyes are:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Observe palpebral aperture in neutral gaze.",
    image: "/prakriti/eyes_size.jpg",
    options: [
      { label: "Small, sunken, dry", sanskrit: "Hrasva-Nimagna", dosha: "vata" },
      { label: "Medium, sharp, sensitive to light", sanskrit: "Madhyama-Tikshna", dosha: "pitta" },
      { label: "Large, attractive, with thick lashes", sanskrit: "Vishala-Akarshaka", dosha: "kapha" },
    ]},
  { id: "eyes_colour", section: "physical", trait: "Eyes — Colour", sanskritTrait: "Netra Varna",
    question: "Eye colour / appearance:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Inspect iris and sclera in good light.",
    image: "/prakriti/eyes_colour.jpg",
    options: [
      { label: "Dull brown / blackish, slightly muddy", sanskrit: "Mlana-Krishna", dosha: "vata" },
      { label: "Sharp light brown / hazel / greenish, intense gaze", sanskrit: "Pingala-Tikshna", dosha: "pitta" },
      { label: "Deep black or blue, calm, moist appearance", sanskrit: "Shyama-Snigdha", dosha: "kapha" },
    ]},
  { id: "hair_quality", section: "physical", trait: "Hair — Quality", sanskritTrait: "Kesha",
    question: "Your scalp hair is:",
    reference: "Charaka Vimana 8/98; Sushruta Sharira 4/63",
    examinerNote: "Observe scalp hair texture, density and lustre without product.",
    image: "/prakriti/hair_quality.jpg",
    options: [
      { label: "Dry, brittle, frizzy, splits easily", sanskrit: "Ruksha-Khara", dosha: "vata" },
      { label: "Fine, soft, prone to early greying / balding", sanskrit: "Mridu-Tanu", dosha: "pitta" },
      { label: "Thick, oily, lustrous, wavy, abundant", sanskrit: "Snigdha-Bahala", dosha: "kapha" },
    ]},
  { id: "hair_loss", section: "physical", trait: "Hair Fall & Greying", sanskritTrait: "Khalitya / Palitya",
    question: "Tendency for hair fall / greying:",
    reference: "Sushruta Nidana 13",
    examinerNote: "Ask history of hair fall, dandruff and greying onset.",
    image: "/prakriti/hair_loss.jpg",
    options: [
      { label: "Hair falls due to dryness, dandruff", sanskrit: "Ruksha-Khalitya", dosha: "vata" },
      { label: "Premature greying / balding", sanskrit: "Akala Palitya", dosha: "pitta" },
      { label: "Minimal hair fall, retains colour long", sanskrit: "Sthira Kesha", dosha: "kapha" },
    ]},
  { id: "teeth", section: "physical", trait: "Teeth", sanskritTrait: "Danta",
    question: "Your teeth are:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Inspect dentition for size, alignment, colour and gum health.",
    image: "/prakriti/teeth.jpg",
    options: [
      { label: "Small, irregular, cracked, sensitive", sanskrit: "Sukshma-Vishama", dosha: "vata" },
      { label: "Medium, yellowish, prone to bleeding gums", sanskrit: "Madhyama-Pita", dosha: "pitta" },
      { label: "Large, white, strong, well-set", sanskrit: "Mahat-Shukla", dosha: "kapha" },
    ]},
  { id: "nails", section: "physical", trait: "Nails", sanskritTrait: "Nakha",
    question: "Your nails are:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Inspect nails on both hands for size, smoothness and colour.",
    image: "/prakriti/nails.jpg",
    options: [
      { label: "Small, brittle, rough, break easily", sanskrit: "Ruksha-Khara", dosha: "vata" },
      { label: "Medium, soft, pinkish, flexible", sanskrit: "Mridu-Rakta", dosha: "pitta" },
      { label: "Large, thick, smooth, strong, shiny", sanskrit: "Snigdha-Sthira", dosha: "kapha" },
    ]},
  { id: "joints", section: "physical", trait: "Joints", sanskritTrait: "Sandhi",
    question: "Your joints are:",
    reference: "Charaka Vimana 8/97",
    examinerNote: "Observe knees/elbows/knuckles. Listen for crepitus on movement.",
    image: "/prakriti/joints.jpg",
    options: [
      { label: "Prominent, cracking sounds on movement", sanskrit: "Sphutita-Sandhi", dosha: "vata" },
      { label: "Loose, soft, moderate", sanskrit: "Shithila-Sandhi", dosha: "pitta" },
      { label: "Well-built, firm, well-lubricated", sanskrit: "Sushlishta-Sandhi", dosha: "kapha" },
    ]},
  { id: "voice", section: "physical", trait: "Voice", sanskritTrait: "Vani / Swara",
    question: "Your voice is:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Listen to a short recited prose. Note pitch, tone, timbre.",
    image: "/prakriti/voice.jpg",
    options: [
      { label: "Low, hoarse, rough, breaks/cracks", sanskrit: "Khara-Kshina Swara", dosha: "vata" },
      { label: "Sharp, clear, commanding, medium pitch", sanskrit: "Tikshna Swara", dosha: "pitta" },
      { label: "Deep, soft, melodious, pleasant", sanskrit: "Snigdha-Gambhira Swara", dosha: "kapha" },
    ]},

  // ---------------- PHYSIOLOGICAL ----------------
  { id: "appetite", section: "physiological", trait: "Appetite", sanskritTrait: "Kshudha / Agni",
    question: "Your appetite is:",
    reference: "Charaka Vimana 6/12",
    examinerNote: "Ask about hunger pattern over a typical week.",
    image: "/prakriti/appetite.jpg",
    options: [
      { label: "Irregular — sometimes strong, sometimes none", sanskrit: "Vishama Agni", dosha: "vata" },
      { label: "Strong, sharp — gets irritated if delayed", sanskrit: "Tikshna Agni", dosha: "pitta" },
      { label: "Steady but low — can skip meals easily", sanskrit: "Manda Agni", dosha: "kapha" },
    ]},
  { id: "thirst", section: "physiological", trait: "Thirst", sanskritTrait: "Trishna",
    question: "Thirst pattern:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Quantify daily fluid intake and frequency of thirst.",
    image: "/prakriti/thirst.jpg",
    options: [
      { label: "Variable, irregular", sanskrit: "Vishama Trishna", dosha: "vata" },
      { label: "Frequent, intense", sanskrit: "Adhika Trishna", dosha: "pitta" },
      { label: "Low, rarely thirsty", sanskrit: "Alpa Trishna", dosha: "kapha" },
    ]},
  { id: "digestion", section: "physiological", trait: "Digestion", sanskritTrait: "Jarana Shakti",
    question: "Your digestion is:",
    reference: "Charaka Vimana 6/12",
    examinerNote: "Ask about post-meal comfort, bloating, heartburn, heaviness.",
    image: "/prakriti/digestion.jpg",
    options: [
      { label: "Irregular — gas, bloating, constipation", sanskrit: "Vishama Pachana", dosha: "vata" },
      { label: "Strong & quick — heartburn if spicy", sanskrit: "Tikshna Pachana", dosha: "pitta" },
      { label: "Slow, heavy feeling after meals", sanskrit: "Manda Pachana", dosha: "kapha" },
    ]},
  { id: "taste", section: "physiological", trait: "Taste preference", sanskritTrait: "Rasa Pradhanya",
    question: "Tastes you prefer most:",
    reference: "Charaka Sutra 26",
    examinerNote: "Ask which six tastes the patient naturally craves.",
    image: "/prakriti/taste.jpg",
    options: [
      { label: "Sweet, sour, salty, warm food", sanskrit: "Madhura-Amla-Lavana", dosha: "vata" },
      { label: "Sweet, bitter, astringent, cool food", sanskrit: "Madhura-Tikta-Kashaya", dosha: "pitta" },
      { label: "Pungent, bitter, astringent, light food", sanskrit: "Katu-Tikta-Kashaya", dosha: "kapha" },
    ]},
  { id: "stool", section: "physiological", trait: "Stool", sanskritTrait: "Mala",
    question: "Bowel movements are:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Use Bristol Stool Chart for clarity. Ask about frequency.",
    image: "/prakriti/stool.jpg",
    options: [
      { label: "Dry, hard, irregular, constipation", sanskrit: "Ruksha-Vibandha", dosha: "vata" },
      { label: "Loose, soft, frequent, yellowish", sanskrit: "Drava-Pita", dosha: "pitta" },
      { label: "Well-formed, heavy, regular, slow", sanskrit: "Snigdha-Sushlishta", dosha: "kapha" },
    ]},
  { id: "urine", section: "physiological", trait: "Urine", sanskritTrait: "Mutra",
    question: "Urine frequency / colour:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Record colour, volume and burning sensation if any.",
    image: "/prakriti/urine.jpg",
    options: [
      { label: "Scanty, pale, infrequent", sanskrit: "Alpa Mutra", dosha: "vata" },
      { label: "Yellow, frequent, burning at times", sanskrit: "Pita-Daha Mutra", dosha: "pitta" },
      { label: "Clear, abundant, pale", sanskrit: "Bahu-Shveta Mutra", dosha: "kapha" },
    ]},
  { id: "sweat", section: "physiological", trait: "Sweat", sanskritTrait: "Sweda",
    question: "Sweating tendency:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Ask about sweating in normal climate, exertion and odour.",
    image: "/prakriti/sweat.jpg",
    options: [
      { label: "Minimal sweating, no odour", sanskrit: "Alpa Sweda", dosha: "vata" },
      { label: "Profuse sweating, strong odour", sanskrit: "Adhika-Daurgandhya Sweda", dosha: "pitta" },
      { label: "Moderate sweating, mild odour", sanskrit: "Madhyama Sweda", dosha: "kapha" },
    ]},
  { id: "sleep", section: "physiological", trait: "Sleep", sanskritTrait: "Nidra",
    question: "Your sleep is:",
    reference: "Charaka Sutra 21",
    examinerNote: "Record total sleep, depth and ease of waking.",
    image: "/prakriti/sleep.jpg",
    options: [
      { label: "Light, interrupted, less than 6 hrs", sanskrit: "Alpa-Vighnayukta Nidra", dosha: "vata" },
      { label: "Sound but moderate, 6–8 hrs", sanskrit: "Madhyama Nidra", dosha: "pitta" },
      { label: "Deep, heavy, long (>8 hrs), hard to wake", sanskrit: "Gaadha-Atinidra", dosha: "kapha" },
    ]},
  { id: "tolerance_cold", section: "physiological", trait: "Climate tolerance", sanskritTrait: "Sahatva",
    question: "Climate you tolerate worst:",
    reference: "Charaka Vimana 8/97",
    examinerNote: "Identify the season/climate that causes most discomfort.",
    image: "/prakriti/tolerance_cold.jpg",
    options: [
      { label: "Cold, dry, windy weather", sanskrit: "Shita-Asahishnu", dosha: "vata" },
      { label: "Hot, humid weather", sanskrit: "Ushna-Asahishnu", dosha: "pitta" },
      { label: "Cold, damp, humid weather", sanskrit: "Shita-Ardra-Asahishnu", dosha: "kapha" },
    ]},
  { id: "stamina", section: "physiological", trait: "Physical stamina", sanskritTrait: "Vyayama Shakti",
    question: "Physical endurance:",
    reference: "Charaka Vimana 8/97",
    examinerNote: "Ask about ability to sustain physical work.",
    image: "/prakriti/stamina.jpg",
    options: [
      { label: "Low — tires quickly", sanskrit: "Alpa Vyayama Shakti", dosha: "vata" },
      { label: "Moderate but intense for short bursts", sanskrit: "Madhyama Shakti", dosha: "pitta" },
      { label: "High — sustained endurance, strong", sanskrit: "Pravara Shakti", dosha: "kapha" },
    ]},
  { id: "gait", section: "physiological", trait: "Gait", sanskritTrait: "Gati",
    question: "Your walking style:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Observe a 10-step natural walk in the consultation room.",
    image: "/prakriti/gait.jpg",
    options: [
      { label: "Quick, unsteady, light", sanskrit: "Chala-Laghu Gati", dosha: "vata" },
      { label: "Determined, focused, medium pace", sanskrit: "Madhyama Gati", dosha: "pitta" },
      { label: "Slow, steady, graceful", sanskrit: "Manda-Sthira Gati", dosha: "kapha" },
    ]},
  { id: "menstrual", section: "physiological", trait: "Menstrual cycle (if applicable)", sanskritTrait: "Artava",
    question: "Menstrual cycle (skip if not applicable):",
    reference: "Sushruta Sharira 2",
    examinerNote: "Ask cycle regularity, flow, colour, pain. Skip for male / pre-menarche / post-menopausal patients.",
    image: "/prakriti/menstrual.jpg",
    options: [
      { label: "Irregular, scanty, painful, dark", sanskrit: "Vataja Artava", dosha: "vata" },
      { label: "Regular, heavy, bright red, hot flashes", sanskrit: "Pittaja Artava", dosha: "pitta" },
      { label: "Regular, moderate, pale, with mucus", sanskrit: "Kaphaja Artava", dosha: "kapha" },
    ]},

  // ---------------- PSYCHOLOGICAL ----------------
  { id: "memory", section: "psychological", trait: "Memory", sanskritTrait: "Smriti",
    question: "Your memory is:",
    reference: "Charaka Sharira 1/100",
    examinerNote: "Ask about short-term recall and long-term retention.",
    image: "/prakriti/memory.jpg",
    options: [
      { label: "Quick to learn, quick to forget", sanskrit: "Alpa Smriti", dosha: "vata" },
      { label: "Sharp, clear, selective", sanskrit: "Tikshna Smriti", dosha: "pitta" },
      { label: "Slow to learn but never forgets", sanskrit: "Sthira Smriti", dosha: "kapha" },
    ]},
  { id: "speech", section: "psychological", trait: "Speech", sanskritTrait: "Vak",
    question: "Your way of speaking:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Ask the patient to read aloud one short paragraph; note pace and clarity.",
    image: "/prakriti/speech.jpg",
    options: [
      { label: "Fast, talkative, jumps topics", sanskrit: "Shighra-Bahubhashi", dosha: "vata" },
      { label: "Sharp, articulate, persuasive", sanskrit: "Tikshna-Spashta", dosha: "pitta" },
      { label: "Slow, calm, measured, melodious", sanskrit: "Manda-Snigdha", dosha: "kapha" },
    ]},
  { id: "emotions", section: "psychological", trait: "Emotional tendency", sanskritTrait: "Manas Bhava",
    question: "Under stress you feel:",
    reference: "Charaka Sharira 4",
    examinerNote: "Ask the dominant emotional reaction to recent stressors.",
    image: "/prakriti/emotions.jpg",
    options: [
      { label: "Anxious, fearful, worried", sanskrit: "Bhaya-Chinta", dosha: "vata" },
      { label: "Irritable, angry, critical", sanskrit: "Krodha-Asuya", dosha: "pitta" },
      { label: "Withdrawn, attached, complacent", sanskrit: "Moha-Lobha", dosha: "kapha" },
    ]},
  { id: "decisions", section: "psychological", trait: "Decision making", sanskritTrait: "Buddhi",
    question: "How do you make decisions?",
    reference: "Charaka Sharira 1",
    examinerNote: "Ask about a recent significant decision and process.",
    image: "/prakriti/decisions.jpg",
    options: [
      { label: "Quickly but change mind often", sanskrit: "Chala Buddhi", dosha: "vata" },
      { label: "Decisive, logical, firm", sanskrit: "Tikshna Buddhi", dosha: "pitta" },
      { label: "Slowly, after much thought, sticks with it", sanskrit: "Sthira Buddhi", dosha: "kapha" },
    ]},
  { id: "dreams", section: "psychological", trait: "Dreams", sanskritTrait: "Swapna",
    question: "Your dreams are usually about:",
    reference: "Charaka Indriya 5",
    examinerNote: "Ask the recurring theme of dreams over recent weeks.",
    image: "/prakriti/dreams.jpg",
    options: [
      { label: "Flying, running, fearful, restless", sanskrit: "Akasha-Charana Swapna", dosha: "vata" },
      { label: "Fire, fighting, conflict, vivid colours", sanskrit: "Agni-Yuddha Swapna", dosha: "pitta" },
      { label: "Water, romance, calm, peaceful scenes", sanskrit: "Jala-Shanta Swapna", dosha: "kapha" },
    ]},
  { id: "social", section: "psychological", trait: "Social nature", sanskritTrait: "Sangati",
    question: "Socially you are:",
    reference: "Charaka Sharira 4",
    examinerNote: "Ask about friendship duration and social engagement style.",
    image: "/prakriti/social.jpg",
    options: [
      { label: "Enthusiastic but inconsistent friendships", sanskrit: "Chala Mitrata", dosha: "vata" },
      { label: "Selective, leadership-driven, competitive", sanskrit: "Netritva Pradhana", dosha: "pitta" },
      { label: "Loyal, calm, steady, long-lasting bonds", sanskrit: "Sthira Mitrata", dosha: "kapha" },
    ]},
  { id: "spending", section: "psychological", trait: "Money / spending", sanskritTrait: "Vyaya",
    question: "Your money habit:",
    reference: "Charaka Vimana 8/98",
    examinerNote: "Ask the natural attitude toward saving versus spending.",
    image: "/prakriti/spending.jpg",
    options: [
      { label: "Spends impulsively on small things", sanskrit: "Chala Vyaya", dosha: "vata" },
      { label: "Spends on luxury, status, quality items", sanskrit: "Tikshna Vyaya", dosha: "pitta" },
      { label: "Saves carefully, accumulates wealth", sanskrit: "Sthira Sangraha", dosha: "kapha" },
    ]},
];

export interface PrakritiResult {
  vata: number;
  pitta: number;
  kapha: number;
  total: number;
  vataPct: number;
  pittaPct: number;
  kaphaPct: number;
  dominant: string; // e.g. "vata", "vata-pitta"
}

export function scorePrakriti(responses: Record<string, Dosha>): PrakritiResult {
  let v = 0, p = 0, k = 0;
  Object.values(responses).forEach((d) => {
    if (d === "vata") v++;
    else if (d === "pitta") p++;
    else if (d === "kapha") k++;
  });
  const total = v + p + k || 1;
  const scores: { name: Dosha; n: number }[] = (
    [
      { name: "vata" as Dosha, n: v },
      { name: "pitta" as Dosha, n: p },
      { name: "kapha" as Dosha, n: k },
    ]
  ).sort((a, b) => b.n - a.n);

  const top = scores[0].n;
  const dominant = scores
    .filter((s) => top - s.n <= 1) // dual prakriti if within 1 point
    .map((s) => s.name)
    .join("-");

  return {
    vata: v, pitta: p, kapha: k, total,
    vataPct: Math.round((v / total) * 100),
    pittaPct: Math.round((p / total) * 100),
    kaphaPct: Math.round((k / total) * 100),
    dominant,
  };
}

export interface DoshaGuide {
  title: string;
  element: string;
  qualities: string[];     // gunas
  traits: string[];
  diet: string[];
  avoid: string[];
  lifestyle: string[];
  exercise: string;
  ritucharya: string;      // best season / season to be careful in
  commonImbalances: string[];
}

export const DOSHA_GUIDANCE: Record<string, DoshaGuide> = {
  vata: {
    title: "Vata — Air & Ether",
    element: "Vayu + Akasha",
    qualities: ["Ruksha (dry)", "Laghu (light)", "Shita (cold)", "Khara (rough)", "Sukshma (subtle)", "Chala (mobile)"],
    traits: ["Creative, quick-thinking, energetic in bursts", "Tendency to dryness, cold and irregularity", "Light frame, variable digestion and sleep"],
    diet: ["Warm, moist, oily, grounding foods", "Cooked grains (rice, wheat), root vegetables", "Ghee, sesame oil, soaked nuts, dates, milk"],
    avoid: ["Raw salads, cold drinks, dry crackers, popcorn", "Excess caffeine and carbonated drinks", "Fasting, skipping meals, eating on the go"],
    lifestyle: ["Maintain a regular daily routine — sleep & meals at fixed times", "Daily warm sesame-oil self-massage (Abhyanga)", "Practice Nasya with anu taila; oil pulling with sesame oil", "Avoid late nights and over-stimulation"],
    exercise: "Gentle, grounding — slow yoga (forward bends, restorative), tai chi, walking. Avoid vigorous endurance sports.",
    ritucharya: "Vata aggravates in autumn (Sharad/Hemanta). Stay especially warm and oiled Sept–Feb.",
    commonImbalances: ["Constipation, bloating, dry skin", "Anxiety, insomnia, restlessness", "Joint pain, cracking joints, sciatica"],
  },
  pitta: {
    title: "Pitta — Fire & Water",
    element: "Agni + Jala",
    qualities: ["Ushna (hot)", "Tikshna (sharp)", "Drava (liquid)", "Snigdha (oily)", "Amla (sour)", "Sara (flowing)"],
    traits: ["Sharp intellect, focused, ambitious, natural leader", "Strong digestion and metabolism", "Medium build, fair sensitive skin, prone to inflammation"],
    diet: ["Cool, sweet, bitter and astringent foods", "Coconut water, cucumber, leafy greens, sweet fruits", "Milk, ghee, basmati rice, mung dal"],
    avoid: ["Spicy, fried, sour, fermented food", "Alcohol, tobacco, excess coffee", "Skipping meals — never let yourself get over-hungry"],
    lifestyle: ["Avoid the midday sun (10 am – 2 pm)", "Cooling Abhyanga with coconut or sunflower oil", "Moonlight walks; spend time near water bodies", "Cultivate patience and humility"],
    exercise: "Moderate, cooling — swimming, moonlight walking, gentle cycling. Avoid hot yoga and noon workouts.",
    ritucharya: "Pitta aggravates in summer (Greeshma) and early monsoon. Take extra cooling care May–August.",
    commonImbalances: ["Acidity, heartburn, gastritis, ulcers", "Skin rashes, acne, eczema, premature greying", "Anger, irritability, perfectionism, burnout"],
  },
  kapha: {
    title: "Kapha — Earth & Water",
    element: "Prithvi + Jala",
    qualities: ["Guru (heavy)", "Shita (cold)", "Snigdha (oily)", "Mridu (soft)", "Sthira (stable)", "Pichchhila (sticky)"],
    traits: ["Calm, loving, steady, strong endurance, devoted", "Slow metabolism — tendency to weight gain & congestion", "Heavy build, smooth oily skin, deep voice"],
    diet: ["Light, warm, dry, spicy foods", "Millets, barley, legumes, leafy greens", "Ginger, black pepper, turmeric, honey"],
    avoid: ["Heavy dairy (cheese, ice-cream), wheat overload", "Sweets, fried foods, deep-fried snacks", "Daytime sleep, sedentary lifestyle"],
    lifestyle: ["Wake before sunrise (Brahma muhurta)", "Dry powder massage (Udvartana) instead of oil", "Stay active and stimulated through the day", "Practice Nasya, Kavala (medicated gargling) regularly"],
    exercise: "Vigorous and energising — running, brisk yoga (sun salutations), HIIT, dance, swimming. Daily, not optional.",
    ritucharya: "Kapha aggravates in late winter / spring (Vasanta). Detox in March–May with Panchakarma if possible.",
    commonImbalances: ["Weight gain, lethargy, daytime drowsiness", "Cold, cough, sinusitis, allergies, asthma", "Diabetes, high cholesterol, depression, attachment"],
  },
};

export function getGuidance(dominant: string) {
  const parts = dominant.split("-") as Dosha[];
  return parts.map((d) => DOSHA_GUIDANCE[d]).filter(Boolean);
}
