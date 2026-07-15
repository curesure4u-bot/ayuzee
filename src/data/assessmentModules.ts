// Configurations for the 6 wellness assessment modules.
// Universal scale: Never/No=0, Rarely/Mild=1, Sometimes/Moderate=2, Often/High=3, Almost always/Severe=4

export type DoshaKey = "vata" | "pitta" | "kapha";
export type AgniKey = "vishama" | "tikshna" | "manda" | "sama";
export type ManasKey = "sattva" | "rajas" | "tamas";

export interface AssessmentQuestion {
  id: number;
  text: string;
  // category key — meaning depends on the module's scoring type
  category?: string;
}

export interface ResultBlock {
  insight: string;
  cause: string;
  lifestyle: string;
  food: string;
  yoga: string;
  consult: string;
  next: string;
}

export interface AssessmentModule {
  slug: string;
  title: string;
  subtitle: string;
  purpose: string;
  emoji: string;
  // categorized => sum per category, dominant wins; total => single sum bucketed
  scoring: "categorized" | "total";
  // for categorized: which category counts as "good" (high = healthy) — Sama / Sattva
  positiveCategory?: string;
  questions: AssessmentQuestion[];
  // For "total" scoring — buckets by score range with label
  totalBuckets?: { max: number; label: string; tone: "good" | "mild" | "moderate" | "severe" }[];
  // Per-category labels (display name)
  categoryLabels?: Record<string, string>;
  // Result content per dominant category OR per total bucket label
  results: Record<string, ResultBlock>;
  // Optional red-flag rule for spine
  redFlag?: { questionIds: number[]; threshold: number; message: string };
}

const SCALE = ["Never / No", "Rarely / Mild", "Sometimes / Moderate", "Often / High", "Almost always / Severe"];
export const ANSWER_SCALE = SCALE;

// ---------- 1. Vikriti ----------
const vikriti: AssessmentModule = {
  slug: "vikriti",
  title: "Vikriti Assessment",
  subtitle: "Current Dosha Imbalance",
  purpose: "Identify which dosha — Vata, Pitta or Kapha — is currently aggravated.",
  emoji: "🌬️",
  scoring: "categorized",
  categoryLabels: { vata: "Vata", pitta: "Pitta", kapha: "Kapha" },
  questions: [
    { id: 1, text: "Do you feel dryness in skin, lips, or hair?", category: "vata" },
    { id: 2, text: "Do you experience variable appetite?", category: "vata" },
    { id: 3, text: "Do you feel anxious, restless, or overthinking?", category: "vata" },
    { id: 4, text: "Is your sleep light or disturbed?", category: "vata" },
    { id: 5, text: "Do you have gas, bloating, or constipation?", category: "vata" },
    { id: 6, text: "Do you get body pain, cracking joints, or stiffness?", category: "vata" },
    { id: 7, text: "Do you feel heat, burning, acidity, or inflammation?", category: "pitta" },
    { id: 8, text: "Do you get angry or irritated quickly?", category: "pitta" },
    { id: 9, text: "Do you sweat excessively or feel hot easily?", category: "pitta" },
    { id: 10, text: "Do you have loose stools or frequent bowel urgency?", category: "pitta" },
    { id: 11, text: "Do you get skin rashes, redness, pimples, or itching?", category: "pitta" },
    { id: 12, text: "Do you feel excessive hunger or thirst?", category: "pitta" },
    { id: 13, text: "Do you feel heaviness or laziness in the body?", category: "kapha" },
    { id: 14, text: "Do you feel sleepy during the day?", category: "kapha" },
    { id: 15, text: "Do you have slow digestion or low appetite?", category: "kapha" },
    { id: 16, text: "Do you gain weight easily?", category: "kapha" },
    { id: 17, text: "Do you have mucus, cold, cough, or congestion?", category: "kapha" },
    { id: 18, text: "Do you feel emotionally stuck, dull, or unmotivated?", category: "kapha" },
    { id: 19, text: "Do your symptoms change frequently?", category: "vata" },
    { id: 20, text: "Do your symptoms worsen after oily, sweet, or heavy food?", category: "kapha" },
  ],
  results: {
    vata: {
      insight: "Vata dosha (Air + Ether) is currently aggravated, leading to dryness, irregularity and restlessness.",
      cause: "Irregular routine, cold/dry foods, late nights, excess travel, stress and overthinking.",
      lifestyle: "Fixed sleep & meal times, daily warm oil self-massage (abhyanga), early dinner, keep warm.",
      food: "Warm, moist, slightly oily, cooked foods — ghee, soups, root vegetables, dates. Avoid raw salads, cold drinks, dry snacks.",
      yoga: "Slow grounding asanas, Nadi Shodhana, Bhramari, 5–10 min meditation.",
      consult: "If anxiety, insomnia, severe constipation or chronic joint pain persists for 4+ weeks.",
      next: "Take the Ama assessment to check digestive toxin load.",
    },
    pitta: {
      insight: "Pitta dosha (Fire + Water) is currently aggravated — heat, acidity and irritability are surfacing.",
      cause: "Spicy/sour/oily food, skipping meals, sun exposure, anger, overworking, alcohol.",
      lifestyle: "Avoid mid-day sun, finish work by 6 pm, cool baths, moonlight walks, limit screen heat.",
      food: "Cooling, sweet, bitter foods — coconut water, cucumber, milk, ghee, leafy greens, sweet fruit. Avoid chilli, fermented food, coffee.",
      yoga: "Sheetali, Sheetkari pranayama, Chandra Namaskar, Yoga Nidra.",
      consult: "If chronic acidity, skin inflammation or BP spikes persist for 4+ weeks.",
      next: "Take the Gut Reset assessment to evaluate digestive health.",
    },
    kapha: {
      insight: "Kapha dosha (Water + Earth) is currently aggravated — heaviness, slowness and congestion dominate.",
      cause: "Daytime sleep, sedentary lifestyle, heavy/sweet/oily food, dairy excess, lack of exercise.",
      lifestyle: "Wake before sunrise, vigorous exercise daily, dry brushing, no daytime naps, keep environment warm & dry.",
      food: "Light, warm, dry, spiced foods — millets, ginger, black pepper, honey (raw), legumes. Avoid dairy, sugar, fried food, bananas.",
      yoga: "Surya Namaskar, Kapalabhati, Bhastrika, brisk walking.",
      consult: "If persistent congestion, weight gain or sustained low mood lasts 4+ weeks.",
      next: "Take the Manas assessment to check mental balance.",
    },
  },
};

// ---------- 2. Ama ----------
const ama: AssessmentModule = {
  slug: "ama",
  title: "Ama Assessment",
  subtitle: "Digestive Toxin & Metabolic Burden",
  purpose: "Estimate the level of undigested metabolic residue (Ama) in your system.",
  emoji: "🫧",
  scoring: "total",
  totalBuckets: [
    { max: 20, label: "Low Ama", tone: "good" },
    { max: 40, label: "Moderate Ama", tone: "mild" },
    { max: 60, label: "High Ama", tone: "moderate" },
    { max: 80, label: "Severe Ama", tone: "severe" },
  ],
  questions: [
    "Do you feel heaviness after food?",
    "Do you feel tired even after rest?",
    "Do you have coated tongue in the morning?",
    "Do you have bad breath or unpleasant taste?",
    "Do you feel bloated after meals?",
    "Do you have sticky or foul-smelling stools?",
    "Do you feel sleepy after eating?",
    "Do you have low appetite?",
    "Do you feel body stiffness in the morning?",
    "Do you experience brain fog or dullness?",
    "Do you get frequent cold, cough, or allergies?",
    "Do you feel laziness or lack of enthusiasm?",
    "Do you crave sweets, fried food, or junk food?",
    "Do you feel incomplete bowel evacuation?",
    "Do you feel heaviness in stomach or chest?",
    "Do you feel swelling or puffiness?",
    "Do you feel your digestion is slow?",
    "Do you get skin dullness, itching, or eruptions?",
    "Do you feel body odor or excessive sweating?",
    "Do symptoms worsen after heavy, oily, or late-night food?",
  ].map((text, i) => ({ id: i + 1, text })),
  results: {
    "Low Ama": {
      insight: "Your digestion is processing food cleanly. Minimal toxin build-up detected.",
      cause: "Healthy routine, balanced meals and good sleep are supporting your Agni.",
      lifestyle: "Maintain your current routine. Continue early dinners and morning movement.",
      food: "Seasonal, freshly cooked meals. Sip warm water through the day.",
      yoga: "Daily 15 min — sun salutations, Anulom Vilom.",
      consult: "Not required at this stage.",
      next: "Take the Agni assessment to fine-tune your digestive fire.",
    },
    "Moderate Ama": {
      insight: "Some metabolic residue is accumulating — early signs of sluggish digestion.",
      cause: "Occasional heavy/late meals, irregular sleep, low water intake or mild stress.",
      lifestyle: "Light diet for 1–2 weeks, warm water on waking, finish dinner by 7 pm.",
      food: "Khichdi, moong dal soup, steamed veg, ginger tea. Avoid dairy, fried, fermented food.",
      yoga: "Kapalabhati 5 min, brisk 30-min walk after dinner.",
      consult: "Not urgent — review in 2 weeks if no improvement.",
      next: "Take the Agni assessment to identify your digestion type.",
    },
    "High Ama": {
      insight: "A significant toxin load is present — your Agni is working below capacity.",
      cause: "Sustained poor diet, late nights, sedentary lifestyle, suppressed elimination.",
      lifestyle: "Structured 21-day gut reset: warm water, early dinner, no snacking, daily exercise.",
      food: "Mono-meals (khichdi), bitter herbs (neem, methi), ginger-jeera-dhaniya tea, no dairy/sugar/wheat.",
      yoga: "Kapalabhati, Agnisar Kriya, twists (Vakrasana, Ardha Matsyendrasana).",
      consult: "See an Ayurvedic doctor to rule out underlying conditions.",
      next: "Take the Gut Reset assessment for a focused plan.",
    },
    "Severe Ama": {
      insight: "Heavy toxin accumulation. Body is struggling to metabolise and eliminate properly.",
      cause: "Long-term lifestyle imbalance, possible undiagnosed metabolic or digestive disorder.",
      lifestyle: "Physician-guided detox; do not self-prescribe Panchakarma.",
      food: "Strict light diet under supervision. Hydration with herbal decoctions only.",
      yoga: "Gentle pranayama only until cleared by a Vaidya.",
      consult: "Book a consultation immediately — Panchakarma screening recommended.",
      next: "Book a Vaidya consultation, then re-assess after treatment.",
    },
  },
};

// ---------- 3. Agni ----------
const agni: AssessmentModule = {
  slug: "agni",
  title: "Agni Assessment",
  subtitle: "Digestive Fire Type",
  purpose: "Identify your current digestion pattern — Vishama, Tikshna, Manda or Sama.",
  emoji: "🔥",
  scoring: "categorized",
  positiveCategory: "sama",
  categoryLabels: { vishama: "Vishama (Irregular)", tikshna: "Tikshna (Sharp)", manda: "Manda (Slow)", sama: "Sama (Balanced)" },
  questions: [
    { id: 1, text: "Is your appetite irregular?", category: "vishama" },
    { id: 2, text: "Do you feel gas or bloating often?", category: "vishama" },
    { id: 3, text: "Do you sometimes feel hungry and sometimes not?", category: "vishama" },
    { id: 4, text: "Do you get constipation or irregular bowel movement?", category: "vishama" },
    { id: 5, text: "Does stress immediately affect your digestion?", category: "vishama" },
    { id: 6, text: "Do you feel excessive hunger?", category: "tikshna" },
    { id: 7, text: "Do you feel burning sensation or acidity?", category: "tikshna" },
    { id: 8, text: "Do you get loose stools or frequent stools?", category: "tikshna" },
    { id: 9, text: "Do you become angry when hungry?", category: "tikshna" },
    { id: 10, text: "Do spicy foods worsen your symptoms?", category: "tikshna" },
    { id: 11, text: "Do you feel low appetite?", category: "manda" },
    { id: 12, text: "Do you feel heaviness after eating?", category: "manda" },
    { id: 13, text: "Do you feel sleepy after food?", category: "manda" },
    { id: 14, text: "Do you digest food slowly?", category: "manda" },
    { id: 15, text: "Do you feel mucus, cold, or congestion after food?", category: "manda" },
    { id: 16, text: "Do you feel light and energetic after proper meals?", category: "sama" },
    { id: 17, text: "Do you pass regular, comfortable stools?", category: "sama" },
    { id: 18, text: "Is your hunger timely and stable?", category: "sama" },
    { id: 19, text: "Do you feel mentally clear after eating?", category: "sama" },
    { id: 20, text: "Is your digestion comfortable without gas, acidity, or heaviness?", category: "sama" },
  ],
  results: {
    vishama: {
      insight: "Vishama Agni — your digestion is irregular, governed by Vata.",
      cause: "Stress, irregular meal timings, cold/dry foods, anxiety.",
      lifestyle: "Fixed meal times, warmth, oil massage, calming evening routine.",
      food: "Warm cooked meals, ghee, soups, soaked dry fruits. Avoid raw, cold, dry foods.",
      yoga: "Nadi Shodhana, Vajrasana after meals, slow stretches.",
      consult: "If bloating, gas or constipation persists despite routine correction.",
      next: "Take the Vikriti assessment to confirm Vata imbalance.",
    },
    tikshna: {
      insight: "Tikshna Agni — your digestive fire is sharp, governed by Pitta.",
      cause: "Excess spicy/sour food, alcohol, anger, skipping meals.",
      lifestyle: "Eat on time, avoid mid-day sun, cool environment, finish work early.",
      food: "Cooling foods — milk, ghee, coconut, sweet fruits, cucumber. Avoid chilli, fermented food, coffee.",
      yoga: "Sheetali, Chandra Namaskar, Yoga Nidra.",
      consult: "If acidity, ulcers or hyper-acidity recurs.",
      next: "Take the Vikriti assessment to confirm Pitta imbalance.",
    },
    manda: {
      insight: "Manda Agni — your digestion is slow, governed by Kapha.",
      cause: "Heavy/sweet/oily food, daytime sleep, sedentary lifestyle.",
      lifestyle: "Vigorous morning exercise, no daytime naps, eat only when truly hungry.",
      food: "Light, warm, spiced foods — ginger, black pepper, millets, legumes. Avoid dairy, sugar, fried food.",
      yoga: "Surya Namaskar, Kapalabhati, Bhastrika.",
      consult: "If weight gain, lethargy or chronic congestion persists.",
      next: "Take the Vikriti assessment to confirm Kapha imbalance.",
    },
    sama: {
      insight: "Sama Agni — congratulations, your digestion is balanced and efficient.",
      cause: "Healthy routine, mindful eating and good sleep are working in your favour.",
      lifestyle: "Maintain your current rhythm. Adjust seasonally.",
      food: "Continue seasonal, freshly cooked meals at consistent times.",
      yoga: "Daily 15–20 min of any practice you enjoy.",
      consult: "Not required.",
      next: "Take the Manas assessment to evaluate mental balance.",
    },
  },
};

// ---------- 4. Spine Health ----------
const spine: AssessmentModule = {
  slug: "spine",
  title: "Spine Health Assessment",
  subtitle: "Pain, Posture & Mobility",
  purpose: "Assess spine load, posture issues and nerve symptom risk.",
  emoji: "🦴",
  scoring: "total",
  totalBuckets: [
    { max: 20, label: "Low spine risk", tone: "good" },
    { max: 40, label: "Moderate spine load", tone: "mild" },
    { max: 60, label: "High spine dysfunction", tone: "moderate" },
    { max: 80, label: "Severe spine risk", tone: "severe" },
  ],
  redFlag: {
    questionIds: [3, 4, 10, 13],
    threshold: 3,
    message: "You may need clinical evaluation because nerve-related or sleep-disturbing symptoms are present.",
  },
  questions: [
    "Do you have neck pain?",
    "Do you have low back pain?",
    "Do you have pain radiating to arm or leg?",
    "Do you feel numbness or tingling?",
    "Do you feel morning stiffness?",
    "Do you feel pain after long sitting?",
    "Do you use mobile/laptop for long hours?",
    "Do you sit more than 6 hours daily?",
    "Do you feel posture imbalance or forward head posture?",
    "Do you feel weakness in legs or hands?",
    "Do you avoid bending due to pain?",
    "Do you avoid walking due to pain?",
    "Do you have disturbed sleep due to pain?",
    "Do you take painkillers frequently?",
    "Do you feel stress increases your pain?",
    "Do you have past fall, injury, or accident history?",
    "Do you feel stiffness after travel?",
    "Do you have obesity or belly heaviness affecting posture?",
    "Do you feel pain while lifting weight?",
    "Do you feel your spine problem is affecting confidence/work?",
  ].map((text, i) => ({ id: i + 1, text })),
  results: {
    "Low spine risk": {
      insight: "Your spine appears to be in good condition with minimal load.",
      cause: "Active lifestyle, decent posture and limited prolonged sitting.",
      lifestyle: "Continue daily movement, stretch hourly, ergonomic workstation.",
      food: "Anti-inflammatory diet — turmeric, ghee, leafy greens, omega-3s.",
      yoga: "Bhujangasana, Marjariasana, Setu Bandhasana — 10 min daily.",
      consult: "Not required unless new symptoms appear.",
      next: "Take the Vikriti assessment to check overall dosha balance.",
    },
    "Moderate spine load": {
      insight: "Early signs of strain — your spine is being overworked.",
      cause: "Prolonged sitting, screen overuse, poor posture, weak core.",
      lifestyle: "Stand-up breaks every 45 min, posture correction, daily walk.",
      food: "Add turmeric milk, methi, ginger, ashwagandha. Reduce excess salt & cold drinks.",
      yoga: "Tadasana, Bhujangasana, Shalabhasana, Pawanmuktasana series.",
      consult: "If pain persists 2+ weeks, see a physiotherapist or Ayurveda doctor.",
      next: "Take the Ama assessment to check inflammation load.",
    },
    "High spine dysfunction": {
      insight: "Significant spine dysfunction — pain & stiffness are affecting daily life.",
      cause: "Long-standing postural strain, possibly disc or facet joint involvement.",
      lifestyle: "Reduce sitting drastically, sleep on firm mattress, avoid heavy lifting.",
      food: "Warm anti-inflammatory diet, Mahanarayan oil massage externally.",
      yoga: "Only under guidance — gentle Pawanmuktasana, traction stretches.",
      consult: "Doctor consultation recommended — imaging may be needed.",
      next: "Book a Panchakarma consultation (Kati Basti, Greeva Basti).",
    },
    "Severe spine risk": {
      insight: "Severe spine compromise — urgent clinical evaluation needed.",
      cause: "Possible disc prolapse, nerve compression or chronic inflammation.",
      lifestyle: "Avoid bending, twisting, heavy lifting. Rest with proper support.",
      food: "Doctor-guided diet plan.",
      yoga: "Stop unsupervised practice. Wait for professional guidance.",
      consult: "Book an appointment with an orthopaedic or Panchakarma specialist now.",
      next: "After evaluation, follow personalised plan from your doctor.",
    },
  },
};

// ---------- 5. Gut Reset ----------
const gut: AssessmentModule = {
  slug: "gut",
  title: "Gut Reset Assessment",
  subtitle: "Bloating, Acidity & Bowel Health",
  purpose: "Evaluate gut imbalance and the need for a structured reset.",
  emoji: "🌿",
  scoring: "total",
  totalBuckets: [
    { max: 20, label: "Healthy gut pattern", tone: "good" },
    { max: 40, label: "Mild gut imbalance", tone: "mild" },
    { max: 60, label: "Gut reset recommended", tone: "moderate" },
    { max: 80, label: "Strong gut correction needed", tone: "severe" },
  ],
  questions: [
    "Do you experience bloating?",
    "Do you have acidity or burning?",
    "Do you burp frequently?",
    "Do you feel heaviness after meals?",
    "Do you have constipation?",
    "Do you have loose stools?",
    "Do you have alternating constipation and loose stools?",
    "Do you feel incomplete evacuation?",
    "Do you have food intolerance?",
    "Do you feel sleepy after food?",
    "Do you crave sugar or bakery foods?",
    "Do you eat late at night?",
    "Do you skip breakfast or meals?",
    "Do you eat while stressed or distracted?",
    "Do you drink less water?",
    "Do you consume frequent tea/coffee?",
    "Do you have abdominal pain or cramps?",
    "Do you feel low energy due to digestion?",
    "Do you feel skin issues linked with food?",
    "Do gut issues affect your mood or focus?",
  ].map((text, i) => ({ id: i + 1, text })),
  results: {
    "Healthy gut pattern": {
      insight: "Your gut is functioning well — digestion, elimination and energy are in sync.",
      cause: "Mindful eating, hydration and good routine are supporting your gut.",
      lifestyle: "Maintain meal timings, stay hydrated, sleep by 10:30 pm.",
      food: "Continue seasonal whole foods, fermented buttermilk, soaked nuts.",
      yoga: "Vajrasana after meals, 10 min Anulom Vilom.",
      consult: "Not required.",
      next: "Take the Agni assessment to fine-tune digestive fire.",
    },
    "Mild gut imbalance": {
      insight: "Early gut imbalance — symptoms are mild but should not be ignored.",
      cause: "Skipped meals, late dinners, stress eating, low water intake.",
      lifestyle: "Eat 3 meals at fixed times, drink warm water, no screens during meals.",
      food: "Add jeera-saunf-ajwain tea, buttermilk, soaked methi seeds. Reduce caffeine.",
      yoga: "Pawanmuktasana, Vajrasana, Kapalabhati 5 min.",
      consult: "If symptoms persist 3+ weeks, consult a Vaidya.",
      next: "Take the Ama assessment to check toxin load.",
    },
    "Gut reset recommended": {
      insight: "Your gut needs a structured reset — significant imbalance present.",
      cause: "Sustained poor eating habits, processed food, irregular schedule, stress.",
      lifestyle: "21-day gut reset: 3 meals, no snacking, dinner by 7 pm, daily walk.",
      food: "Khichdi, moong soup, steamed veg, ghee, ginger. Eliminate dairy, wheat, sugar, processed food.",
      yoga: "Kapalabhati, Agnisar Kriya, twists, brisk walk after dinner.",
      consult: "Vaidya consultation recommended for a personalised plan.",
      next: "Book a consultation, then re-assess after the reset.",
    },
    "Strong gut correction needed": {
      insight: "Severe gut dysfunction — extensive correction and supervision required.",
      cause: "Long-standing imbalance — possible IBS, SIBO, gastritis or chronic stress.",
      lifestyle: "Doctor-guided plan only. Strict routine, no self-medication.",
      food: "Customised elimination diet under supervision.",
      yoga: "Gentle pranayama only until cleared.",
      consult: "Book a doctor consultation immediately.",
      next: "Book a Vaidya consultation; consider Panchakarma screening.",
    },
  },
};

// ---------- 6. Manas ----------
const manas: AssessmentModule = {
  slug: "manas",
  title: "Manas Assessment",
  subtitle: "Mind, Mood & Mental Balance",
  purpose: "Map your mental tendencies across Sattva, Rajas and Tamas.",
  emoji: "🧘",
  scoring: "categorized",
  positiveCategory: "sattva",
  categoryLabels: { sattva: "Sattva (Clarity)", rajas: "Rajas (Activity)", tamas: "Tamas (Inertia)" },
  questions: [
    { id: 1, text: "Do you feel calm and emotionally stable?", category: "sattva" },
    { id: 2, text: "Do you feel grateful in daily life?", category: "sattva" },
    { id: 3, text: "Can you focus without distraction?", category: "sattva" },
    { id: 4, text: "Do you sleep peacefully?", category: "sattva" },
    { id: 5, text: "Do you respond thoughtfully instead of reacting?", category: "sattva" },
    { id: 6, text: "Do you feel restless or impatient?", category: "rajas" },
    { id: 7, text: "Do you overthink frequently?", category: "rajas" },
    { id: 8, text: "Do you feel anger or irritation quickly?", category: "rajas" },
    { id: 9, text: "Do you feel pressure to achieve constantly?", category: "rajas" },
    { id: 10, text: "Do you find it hard to relax?", category: "rajas" },
    { id: 11, text: "Do you feel dull, lazy, or inactive?", category: "tamas" },
    { id: 12, text: "Do you feel low motivation?", category: "tamas" },
    { id: 13, text: "Do you oversleep or feel sleepy during the day?", category: "tamas" },
    { id: 14, text: "Do you procrastinate important tasks?", category: "tamas" },
    { id: 15, text: "Do you feel emotionally heavy or stuck?", category: "tamas" },
    { id: 16, text: "Do you feel anxious about the future?", category: "rajas" },
    { id: 17, text: "Do you feel regret or sadness about the past?", category: "tamas" },
    { id: 18, text: "Do you practice prayer, meditation, breathing, or reflection?", category: "sattva" },
    { id: 19, text: "Do you spend excessive time on phone/social media?", category: "rajas" },
    { id: 20, text: "Do you avoid responsibilities due to mental tiredness?", category: "tamas" },
  ],
  results: {
    sattva: {
      insight: "Sattva dominant — your mind is clear, calm and balanced.",
      cause: "Regular sadhana, mindful living, healthy relationships and clean food.",
      lifestyle: "Continue meditation, journaling, time in nature, conscious media diet.",
      food: "Sattvic foods — fresh fruits, milk, ghee, soaked almonds, legumes, whole grains.",
      yoga: "Continue daily meditation, Anulom Vilom, gentle asana.",
      consult: "Not required.",
      next: "Take the Vikriti assessment to maintain physical balance.",
    },
    rajas: {
      insight: "Rajas dominant — restlessness, overthinking and constant activity are draining you.",
      cause: "Over-stimulation — screens, deadlines, ambition, caffeine, conflict.",
      lifestyle: "Digital sunset by 9 pm, evening walks, journaling, reduce caffeine.",
      food: "Cooling, sattvic foods. Avoid spicy, fried, fermented, stimulants.",
      yoga: "Sheetali, Bhramari, Yoga Nidra, slow yin yoga.",
      consult: "If anxiety, palpitations or insomnia persist 4+ weeks, consult a doctor.",
      next: "Take the Vikriti assessment to check Vata/Pitta involvement.",
    },
    tamas: {
      insight: "Tamas dominant — heaviness, low motivation and inertia are present.",
      cause: "Sedentary lifestyle, oversleep, processed food, isolation, low purpose.",
      lifestyle: "Wake by 6 am, sunlight exposure, structured day, social connection.",
      food: "Light, fresh, warm sattvic foods. Avoid stale, leftover, heavy, fried food.",
      yoga: "Surya Namaskar, Kapalabhati, Bhastrika, brisk walk.",
      consult: "If persistent low mood, hopelessness or social withdrawal — consult a mental health professional promptly.",
      next: "Take the Ama assessment to address physical heaviness too.",
    },
  },
};

export const ASSESSMENT_MODULES: Record<string, AssessmentModule> = {
  vikriti, ama, agni, spine, gut, manas,
};

export const ASSESSMENT_LIST = [vikriti, ama, agni, spine, gut, manas];
