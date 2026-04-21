// CCRAS Manual of SOPs for Prakriti Assessment — encoded question bank.
// Each option maps to one of the three doshas: Vata, Pitta, Kapha.

export type Dosha = "vata" | "pitta" | "kapha";

export interface PrakritiOption {
  label: string;
  dosha: Dosha;
}

export interface PrakritiQuestion {
  id: string;
  section: "physical" | "physiological" | "psychological";
  trait: string;
  question: string;
  options: PrakritiOption[];
}

export const PRAKRITI_QUESTIONS: PrakritiQuestion[] = [
  // ---------------- PHYSICAL ----------------
  { id: "built", section: "physical", trait: "Built (Sharira)",
    question: "How would you describe your body build?",
    options: [
      { label: "Lean / thin, prominent joints & veins", dosha: "vata" },
      { label: "Medium, well-proportioned, moderate musculature", dosha: "pitta" },
      { label: "Large, heavy, broad frame, well-developed", dosha: "kapha" },
    ]},
  { id: "weight", section: "physical", trait: "Body Weight",
    question: "Your typical body weight tendency is:",
    options: [
      { label: "Low — hard to gain weight", dosha: "vata" },
      { label: "Moderate — easy to maintain", dosha: "pitta" },
      { label: "Heavy — gains easily, hard to lose", dosha: "kapha" },
    ]},
  { id: "height", section: "physical", trait: "Height",
    question: "Your height compared to family/peers is:",
    options: [
      { label: "Very tall or very short (irregular)", dosha: "vata" },
      { label: "Average / medium", dosha: "pitta" },
      { label: "Tall and well-built or short and stocky", dosha: "kapha" },
    ]},
  { id: "skin_colour", section: "physical", trait: "Skin Colour (Twak Varna)",
    question: "Your natural skin tone is:",
    options: [
      { label: "Dark / dusky / blackish", dosha: "vata" },
      { label: "Fair, reddish, copper or yellowish tinge", dosha: "pitta" },
      { label: "Fair, glowing, white-ish", dosha: "kapha" },
    ]},
  { id: "skin_texture", section: "physical", trait: "Skin Texture",
    question: "Your skin texture is usually:",
    options: [
      { label: "Dry, rough, cracks, cold to touch", dosha: "vata" },
      { label: "Soft, warm, oily, with moles/freckles", dosha: "pitta" },
      { label: "Thick, smooth, oily, cool, well-hydrated", dosha: "kapha" },
    ]},
  { id: "eyes_size", section: "physical", trait: "Eyes (Netra) — Size",
    question: "Your eyes are:",
    options: [
      { label: "Small, sunken, dry", dosha: "vata" },
      { label: "Medium, sharp, sensitive to light", dosha: "pitta" },
      { label: "Large, attractive, with thick lashes", dosha: "kapha" },
    ]},
  { id: "eyes_colour", section: "physical", trait: "Eyes — Colour",
    question: "Eye colour / appearance:",
    options: [
      { label: "Dull brown / blackish, slightly muddy", dosha: "vata" },
      { label: "Sharp light brown / hazel / greenish, intense gaze", dosha: "pitta" },
      { label: "Deep black or blue, calm, moist appearance", dosha: "kapha" },
    ]},
  { id: "hair_quality", section: "physical", trait: "Hair (Kesha) — Quality",
    question: "Your scalp hair is:",
    options: [
      { label: "Dry, brittle, frizzy, splits easily", dosha: "vata" },
      { label: "Fine, soft, prone to early greying / balding", dosha: "pitta" },
      { label: "Thick, oily, lustrous, wavy, abundant", dosha: "kapha" },
    ]},
  { id: "hair_loss", section: "physical", trait: "Hair Fall & Greying",
    question: "Tendency for hair fall / greying:",
    options: [
      { label: "Hair falls due to dryness, dandruff", dosha: "vata" },
      { label: "Premature greying / balding", dosha: "pitta" },
      { label: "Minimal hair fall, retains colour long", dosha: "kapha" },
    ]},
  { id: "teeth", section: "physical", trait: "Teeth (Danta)",
    question: "Your teeth are:",
    options: [
      { label: "Small, irregular, cracked, sensitive", dosha: "vata" },
      { label: "Medium, yellowish, prone to bleeding gums", dosha: "pitta" },
      { label: "Large, white, strong, well-set", dosha: "kapha" },
    ]},
  { id: "nails", section: "physical", trait: "Nails (Nakha)",
    question: "Your nails are:",
    options: [
      { label: "Small, brittle, rough, break easily", dosha: "vata" },
      { label: "Medium, soft, pinkish, flexible", dosha: "pitta" },
      { label: "Large, thick, smooth, strong, shiny", dosha: "kapha" },
    ]},
  { id: "joints", section: "physical", trait: "Joints (Sandhi)",
    question: "Your joints are:",
    options: [
      { label: "Prominent, cracking sounds on movement", dosha: "vata" },
      { label: "Loose, soft, moderate", dosha: "pitta" },
      { label: "Well-built, firm, well-lubricated", dosha: "kapha" },
    ]},
  { id: "voice", section: "physical", trait: "Voice (Vani)",
    question: "Your voice is:",
    options: [
      { label: "Low, hoarse, rough, breaks/cracks", dosha: "vata" },
      { label: "Sharp, clear, commanding, medium pitch", dosha: "pitta" },
      { label: "Deep, soft, melodious, pleasant", dosha: "kapha" },
    ]},

  // ---------------- PHYSIOLOGICAL ----------------
  { id: "appetite", section: "physiological", trait: "Appetite (Kshudha)",
    question: "Your appetite is:",
    options: [
      { label: "Irregular — sometimes strong, sometimes none", dosha: "vata" },
      { label: "Strong, sharp — gets irritated if delayed", dosha: "pitta" },
      { label: "Steady but low — can skip meals easily", dosha: "kapha" },
    ]},
  { id: "thirst", section: "physiological", trait: "Thirst (Trishna)",
    question: "Thirst pattern:",
    options: [
      { label: "Variable, irregular", dosha: "vata" },
      { label: "Frequent, intense", dosha: "pitta" },
      { label: "Low, rarely thirsty", dosha: "kapha" },
    ]},
  { id: "digestion", section: "physiological", trait: "Digestion (Agni)",
    question: "Your digestion is:",
    options: [
      { label: "Irregular — gas, bloating, constipation", dosha: "vata" },
      { label: "Strong & quick — heartburn if spicy", dosha: "pitta" },
      { label: "Slow, heavy feeling after meals", dosha: "kapha" },
    ]},
  { id: "taste", section: "physiological", trait: "Taste preference (Rasa)",
    question: "Tastes you prefer most:",
    options: [
      { label: "Sweet, sour, salty, warm food", dosha: "vata" },
      { label: "Sweet, bitter, astringent, cool food", dosha: "pitta" },
      { label: "Pungent, bitter, astringent, light food", dosha: "kapha" },
    ]},
  { id: "stool", section: "physiological", trait: "Stool (Mala)",
    question: "Bowel movements are:",
    options: [
      { label: "Dry, hard, irregular, constipation", dosha: "vata" },
      { label: "Loose, soft, frequent, yellowish", dosha: "pitta" },
      { label: "Well-formed, heavy, regular, slow", dosha: "kapha" },
    ]},
  { id: "urine", section: "physiological", trait: "Urine (Mutra)",
    question: "Urine frequency / colour:",
    options: [
      { label: "Scanty, pale, infrequent", dosha: "vata" },
      { label: "Yellow, frequent, burning at times", dosha: "pitta" },
      { label: "Clear, abundant, pale", dosha: "kapha" },
    ]},
  { id: "sweat", section: "physiological", trait: "Sweat (Sweda)",
    question: "Sweating tendency:",
    options: [
      { label: "Minimal sweating, no odour", dosha: "vata" },
      { label: "Profuse sweating, strong odour", dosha: "pitta" },
      { label: "Moderate sweating, mild odour", dosha: "kapha" },
    ]},
  { id: "sleep", section: "physiological", trait: "Sleep (Nidra)",
    question: "Your sleep is:",
    options: [
      { label: "Light, interrupted, less than 6 hrs", dosha: "vata" },
      { label: "Sound but moderate, 6–8 hrs", dosha: "pitta" },
      { label: "Deep, heavy, long (>8 hrs), hard to wake", dosha: "kapha" },
    ]},
  { id: "tolerance_cold", section: "physiological", trait: "Tolerance to cold/heat",
    question: "Climate you tolerate worst:",
    options: [
      { label: "Cold, dry, windy weather", dosha: "vata" },
      { label: "Hot, humid weather", dosha: "pitta" },
      { label: "Cold, damp, humid weather", dosha: "kapha" },
    ]},
  { id: "stamina", section: "physiological", trait: "Physical stamina",
    question: "Physical endurance:",
    options: [
      { label: "Low — tires quickly", dosha: "vata" },
      { label: "Moderate but intense for short bursts", dosha: "pitta" },
      { label: "High — sustained endurance, strong", dosha: "kapha" },
    ]},
  { id: "gait", section: "physiological", trait: "Gait (Gati)",
    question: "Your walking style:",
    options: [
      { label: "Quick, unsteady, light", dosha: "vata" },
      { label: "Determined, focused, medium pace", dosha: "pitta" },
      { label: "Slow, steady, graceful", dosha: "kapha" },
    ]},
  { id: "menstrual", section: "physiological", trait: "Menstrual cycle (if applicable)",
    question: "Menstrual cycle (skip if not applicable):",
    options: [
      { label: "Irregular, scanty, painful, dark", dosha: "vata" },
      { label: "Regular, heavy, bright red, hot flashes", dosha: "pitta" },
      { label: "Regular, moderate, pale, with mucus", dosha: "kapha" },
    ]},

  // ---------------- PSYCHOLOGICAL ----------------
  { id: "memory", section: "psychological", trait: "Memory (Smriti)",
    question: "Your memory is:",
    options: [
      { label: "Quick to learn, quick to forget", dosha: "vata" },
      { label: "Sharp, clear, selective", dosha: "pitta" },
      { label: "Slow to learn but never forgets", dosha: "kapha" },
    ]},
  { id: "speech", section: "psychological", trait: "Speech (Vak)",
    question: "Your way of speaking:",
    options: [
      { label: "Fast, talkative, jumps topics", dosha: "vata" },
      { label: "Sharp, articulate, persuasive", dosha: "pitta" },
      { label: "Slow, calm, measured, melodious", dosha: "kapha" },
    ]},
  { id: "emotions", section: "psychological", trait: "Emotional tendency",
    question: "Under stress you feel:",
    options: [
      { label: "Anxious, fearful, worried", dosha: "vata" },
      { label: "Irritable, angry, critical", dosha: "pitta" },
      { label: "Withdrawn, attached, complacent", dosha: "kapha" },
    ]},
  { id: "decisions", section: "psychological", trait: "Decision making",
    question: "How do you make decisions?",
    options: [
      { label: "Quickly but change mind often", dosha: "vata" },
      { label: "Decisive, logical, firm", dosha: "pitta" },
      { label: "Slowly, after much thought, sticks with it", dosha: "kapha" },
    ]},
  { id: "dreams", section: "psychological", trait: "Dreams (Swapna)",
    question: "Your dreams are usually about:",
    options: [
      { label: "Flying, running, fearful, restless", dosha: "vata" },
      { label: "Fire, fighting, conflict, vivid colours", dosha: "pitta" },
      { label: "Water, romance, calm, peaceful scenes", dosha: "kapha" },
    ]},
  { id: "social", section: "psychological", trait: "Social nature",
    question: "Socially you are:",
    options: [
      { label: "Enthusiastic but inconsistent friendships", dosha: "vata" },
      { label: "Selective, leadership-driven, competitive", dosha: "pitta" },
      { label: "Loyal, calm, steady, long-lasting bonds", dosha: "kapha" },
    ]},
  { id: "spending", section: "psychological", trait: "Money / spending",
    question: "Your money habit:",
    options: [
      { label: "Spends impulsively on small things", dosha: "vata" },
      { label: "Spends on luxury, status, quality items", dosha: "pitta" },
      { label: "Saves carefully, accumulates wealth", dosha: "kapha" },
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
  const scores: { name: Dosha; n: number }[] = [
    { name: "vata", n: v },
    { name: "pitta", n: p },
    { name: "kapha", n: k },
  ].sort((a, b) => b.n - a.n);

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

export const DOSHA_GUIDANCE: Record<string, { title: string; traits: string[]; diet: string[]; lifestyle: string[] }> = {
  vata: {
    title: "Vata — Air & Ether",
    traits: ["Creative, quick-thinking, energetic in bursts", "Tendency to dryness, cold, irregularity", "Light frame, variable digestion"],
    diet: ["Warm, moist, oily, grounding foods", "Cooked grains, root vegetables, ghee, nuts", "Avoid raw salads, cold drinks, dry snacks"],
    lifestyle: ["Maintain regular routine — sleep & meals at fixed times", "Daily warm oil self-massage (Abhyanga) with sesame oil", "Gentle yoga, slow walks, meditation; avoid over-exertion"],
  },
  pitta: {
    title: "Pitta — Fire & Water",
    traits: ["Sharp intellect, focused, ambitious", "Strong digestion, warm body, prone to inflammation", "Medium build, fair sensitive skin"],
    diet: ["Cool, sweet, bitter, astringent foods", "Coconut, cucumber, leafy greens, milk, ghee", "Avoid spicy, fried, sour, fermented food and alcohol"],
    lifestyle: ["Avoid midday sun and excess heat", "Cooling abhyanga with coconut/sunflower oil", "Moderate exercise — swimming, moonlight walks; cultivate patience"],
  },
  kapha: {
    title: "Kapha — Earth & Water",
    traits: ["Calm, loving, steady, strong endurance", "Slow metabolism, tendency to weight gain & congestion", "Heavy build, smooth oily skin"],
    diet: ["Light, warm, dry, spicy foods", "Millets, legumes, ginger, pepper, leafy greens", "Avoid heavy dairy, sweets, fried foods, daytime sleep"],
    lifestyle: ["Vigorous daily exercise — running, brisk yoga, dance", "Dry powder massage (Udvartana) instead of oil", "Wake before sunrise, stay active and stimulated"],
  },
};

export function getGuidance(dominant: string) {
  const parts = dominant.split("-") as Dosha[];
  return parts.map((d) => DOSHA_GUIDANCE[d]).filter(Boolean);
}
