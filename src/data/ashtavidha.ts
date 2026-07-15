// Ashtavidha Pareeksha — Mala Pareeksha reference & analysis engine
// Ayuzee original content. No third-party branding.

export type StoolType = {
  id: number;
  name: string;
  icon: string;
  dosha: "Vata" | "Pitta" | "Kapha" | "Pitta-Kapha" | "Balanced" | "Mixed";
  agni: "Sama" | "Vishama" | "Tikshna" | "Manda";
  ama: "Low" | "Moderate" | "High";
  interpretation: string;
  clinicalNote: string;
  advice: string;
  risk: "normal" | "observe" | "attention" | "urgent";
};

export const STOOL_TYPES: StoolType[] = [
  { id: 1, name: "Hard, dry lumps", icon: "🪨", dosha: "Vata", agni: "Vishama", ama: "Moderate",
    interpretation: "Vata imbalance with dryness and poor elimination.",
    clinicalNote: "Constipation, dehydration, low fibre intake.",
    advice: "Warm water, ghee, soaked raisins, Triphala, sesame oil, fibre-rich foods.", risk: "observe" },
  { id: 2, name: "Lumpy, dry, cracked", icon: "🌰", dosha: "Vata", agni: "Vishama", ama: "Moderate",
    interpretation: "Vata aggravation with irregular digestion, bloating and gas.",
    clinicalNote: "Irregular meal timing, cold/dry foods.",
    advice: "Warm cooked meals, ginger, ajwain, ghee, buttermilk, routine & rest.", risk: "observe" },
  { id: 3, name: "Solid, well-formed", icon: "🌿", dosha: "Balanced", agni: "Sama", ama: "Low",
    interpretation: "Balanced doshas, good digestion, optimal absorption.",
    clinicalNote: "Healthy baseline.",
    advice: "Continue balanced diet, hydration, exercise and daily routine.", risk: "normal" },
  { id: 4, name: "Soft, smooth", icon: "💧", dosha: "Pitta", agni: "Sama", ama: "Low",
    interpretation: "Pitta balance, healthy digestion and metabolism.",
    clinicalNote: "Generally normal variant.",
    advice: "Keep meals light and warm; avoid excess spice; stay hydrated.", risk: "normal" },
  { id: 5, name: "Soft, mushy", icon: "🌊", dosha: "Pitta", agni: "Tikshna", ama: "Moderate",
    interpretation: "Pitta imbalance, poor absorption, possible mild infection or intolerance.",
    clinicalNote: "Loose but formed; watch hydration.",
    advice: "Avoid oily/spicy foods; take buttermilk, ginger, coriander; rest.", risk: "observe" },
  { id: 6, name: "Loose, pasty", icon: "💨", dosha: "Pitta-Kapha", agni: "Manda", ama: "High",
    interpretation: "Pitta & Kapha imbalance with inflammation and irritation.",
    clinicalNote: "Malabsorption suspected; monitor.",
    advice: "Rice water, pomegranate, cumin, nutmeg, light diet; avoid dairy & fried foods.", risk: "attention" },
  { id: 7, name: "Watery / diarrhea", icon: "🚰", dosha: "Pitta", agni: "Tikshna", ama: "High",
    interpretation: "Severe Pitta imbalance, infection, or dehydration risk.",
    clinicalNote: "Risk of electrolyte loss; hydrate.",
    advice: "ORS, rice water, bael fruit, pomegranate, nutmeg, rest & rehydration.", risk: "urgent" },
  { id: 8, name: "Oily / greasy", icon: "🫙", dosha: "Kapha", agni: "Manda", ama: "High",
    interpretation: "Poor fat digestion, Ama (toxins), liver imbalance, weak metabolism.",
    clinicalNote: "Consider fat malabsorption workup if persistent.",
    advice: "Trikatu, warm water, avoid heavy/oily foods, light diet, detox & herbs.", risk: "attention" },
  { id: 9, name: "Foul smell / undigested food", icon: "🌫️", dosha: "Kapha", agni: "Manda", ama: "High",
    interpretation: "Weak Agni, bacterial imbalance, toxin buildup.",
    clinicalNote: "Chew well; investigate malabsorption if chronic.",
    advice: "Ginger, lemon, hing, cumin; eat mindfully; improve Agni.", risk: "attention" },
  { id: 10, name: "Sticks to commode wall", icon: "🧴", dosha: "Kapha", agni: "Manda", ama: "High",
    interpretation: "Excess Ama, sluggish digestion, Kapha imbalance, poor fat metabolism.",
    clinicalNote: "Reduce heavy/oily diet; hydrate.",
    advice: "Eat light warm meals, reduce fried/heavy foods, ajwain, ginger, cumin, exercise regularly.", risk: "observe" },
  { id: 11, name: "Floating lumps / hard to flush", icon: "🫧", dosha: "Vata", agni: "Vishama", ama: "Moderate",
    interpretation: "Gas in stool, Vata imbalance, incomplete digestion, undigested fibre.",
    clinicalNote: "Excess fermentation in gut.",
    advice: "Eat warm fresh meals, chew well, avoid gas-forming foods, ajwain, ginger, hing, cumin.", risk: "observe" },
];

export const ASHTAVIDHA_ITEMS = [
  { key: "nadi", name: "Nadi Pareeksha", desc: "Pulse examination", icon: "💓", enabled: false },
  { key: "mootra", name: "Mootra Pareeksha", desc: "Urine examination", icon: "💧", enabled: false },
  { key: "mala", name: "Mala Pareeksha", desc: "Stool examination", icon: "🌿", enabled: true },
  { key: "jihwa", name: "Jihwa Pareeksha", desc: "Tongue examination", icon: "👅", enabled: false },
  { key: "shabda", name: "Shabda Pareeksha", desc: "Voice examination", icon: "🔊", enabled: false },
  { key: "sparsha", name: "Sparsha Pareeksha", desc: "Touch examination", icon: "✋", enabled: false },
  { key: "drik", name: "Drik Pareeksha", desc: "Eye examination", icon: "👁️", enabled: false },
  { key: "aakruti", name: "Aakruti Pareeksha", desc: "General appearance", icon: "🧍", enabled: false },
];

// Field option catalogs (data-driven UI)
export const MALA_OPTIONS = {
  frequency: ["daily", "twice", "alternate", "constipation", "loose", "multiple"],
  colour: ["brown", "dark brown", "yellow", "green", "black", "red", "pale", "white"],
  smell: ["normal", "strong", "foul", "sour", "putrid"],
  yesNo: ["yes", "no"],
  severity: ["none", "mild", "moderate", "severe"],
  appetite: ["poor", "normal", "good", "excess"],
  waterIntake: ["low", "average", "good"],
  foodPattern: ["healthy", "spicy", "oily", "junk", "irregular"],
  stress: ["low", "moderate", "high"],
  sleep: ["poor", "average", "good"],
  exercise: ["never", "occasional", "regular"],
} as const;

// Extended structured Mala fields (Varna, Pramana, Gandha, Plava, etc.)
export const VARNA_OPTIONS: { value: string; label: string }[] = [
  { value: "yellow_brown", label: "Yellow-brown (normal)" },
  { value: "pale_clay", label: "Pale / clay" },
  { value: "black_tarry", label: "Black / tarry" },
  { value: "blood_tinged", label: "Blood-tinged" },
  { value: "green", label: "Green" },
  { value: "other", label: "Other" },
];
export const PRAMANA_OPTIONS = ["scanty", "normal", "excessive"] as const;
export const GANDHA_OPTIONS = ["normal", "foul", "sour", "odorless"] as const;
export const PLAVA_OPTIONS: { value: string; label: string }[] = [
  { value: "floats", label: "Floats" },
  { value: "sinks", label: "Sinks" },
  { value: "not_observed", label: "Not observed" },
];
export const TIME_OF_DAY_OPTIONS = ["morning", "afternoon", "evening", "irregular"] as const;
export const ASSOCIATED_SYMPTOMS = [
  "Straining", "Urgency", "Incomplete evacuation", "Pain", "Blood", "Mucus", "None",
] as const;

export type MalaExtendedFields = {
  varna?: string;
  varna_note?: string;
  akriti_bristol_type?: number | null;
  pramana?: string;
  gandha?: string;
  ama_present?: boolean | null;
  ama_note?: string;
  plava_pariksha?: string;
  frequency_per_day?: number | null;
  time_of_day_pattern?: string;
  associated_symptoms?: string[];
};

/** Rule-based Dosha correlation from the extended Mala fields. Deterministic, not AI. */
export function suggestDoshaCorrelation(
  ext: MalaExtendedFields,
  stoolTypeId?: number | null,
): string {
  let vata = 0, pitta = 0, kapha = 0;
  if (ext.akriti_bristol_type === 1 || ext.akriti_bristol_type === 2) vata += 2;
  if (ext.akriti_bristol_type === 5) pitta += 1;
  if (ext.akriti_bristol_type === 6 || ext.akriti_bristol_type === 7) pitta += 2;
  if (stoolTypeId) {
    const st = STOOL_TYPES.find((s) => s.id === stoolTypeId);
    if (st?.dosha === "Vata") vata += 1;
    if (st?.dosha === "Pitta") pitta += 1;
    if (st?.dosha === "Kapha") kapha += 1;
    if (st?.dosha === "Pitta-Kapha") { pitta += 1; kapha += 1; }
  }
  if (ext.varna === "pale_clay") kapha += 1;
  if (ext.varna === "black_tarry" || ext.varna === "blood_tinged") pitta += 2;
  if (ext.varna === "green") pitta += 1;
  if (ext.pramana === "scanty") vata += 1;
  if (ext.pramana === "excessive") kapha += 1;
  if (ext.gandha === "foul") kapha += 1;
  if (ext.gandha === "sour") pitta += 1;
  if (ext.gandha === "odorless") vata += 1;
  if (ext.ama_present) kapha += 1;
  if (ext.plava_pariksha === "floats") kapha += 1;
  if (ext.plava_pariksha === "sinks") vata += 1;
  if (typeof ext.frequency_per_day === "number") {
    if (ext.frequency_per_day <= 0.5) vata += 1;
    if (ext.frequency_per_day >= 3) pitta += 1;
  }
  if (ext.time_of_day_pattern === "irregular") vata += 1;
  const sym = ext.associated_symptoms ?? [];
  if (sym.includes("Straining") || sym.includes("Incomplete evacuation")) vata += 1;
  if (sym.includes("Blood") || sym.includes("Urgency")) pitta += 1;
  if (sym.includes("Mucus")) kapha += 1;
  if (sym.includes("Pain")) vata += 1;

  const top = Math.max(vata, pitta, kapha);
  if (top === 0) return "Insufficient data";
  const winners: string[] = [];
  if (vata === top) winners.push("Vata");
  if (pitta === top) winners.push("Pitta");
  if (kapha === top) winners.push("Kapha");
  const label = winners.length === 1 ? `${winners[0]} predominance` : `${winners.join("-")} mixed`;
  return `${label} (V:${vata} · P:${pitta} · K:${kapha})`;
}

export type PatientInfo = {
  patientId?: string;
  uhid?: string;
  name?: string;
  age?: string;
  gender?: string;
  weight?: string;
  height?: string;
  bmi?: string;
  occupation?: string;
  phone?: string;
  visitDate?: string;
  consultant?: string;
  chiefComplaint?: string;
  duration?: string;
};

export type MalaResponses = {
  frequency?: string;
  colour?: string;
  smell?: string;
  mucus?: string;
  blood?: string;
  undigestedFood?: string;
  oilLayer?: string;
  floating?: string;
  difficulty?: string;
  burning?: string;
  pain?: string;
  gas?: string;
  bloating?: string;
  appetite?: string;
  waterIntake?: string;
  foodPattern?: string;
  stress?: string;
  sleep?: string;
  exercise?: string;
  // legacy compatibility
  urgency?: boolean;
  painDuringStool?: boolean;
  _patient?: PatientInfo;
  _extras?: {
    yoga?: string;
    pranayama?: string;
    referral?: string;
    warnings?: string;
  };
};

export type MalaAnalysis = {
  stool: StoolType;
  dosha: string;
  agni: string;
  ama: string;
  dhatu: "Normal" | "Affected";
  srotas: "Normal" | "Affected";
  impression: "Normal" | "Needs Observation" | "Needs Consultation" | "Urgent Referral";
  risk: StoolType["risk"];
  reasons: string[];
  summary: string;
};

const isYes = (v?: string) => (v ?? "").toLowerCase() === "yes";
const sev = (v?: string) => {
  const s = (v ?? "").toLowerCase();
  return s === "severe" ? 3 : s === "moderate" ? 2 : s === "mild" ? 1 : 0;
};

export function analyzeMala(stoolTypeId: number, r: MalaResponses): MalaAnalysis | null {
  const st = STOOL_TYPES.find((s) => s.id === stoolTypeId);
  if (!st) return null;

  let risk: StoolType["risk"] = st.risk;
  const reasons: string[] = [];

  // Red flags
  if (isYes(r.blood) || (r.colour ?? "").toLowerCase() === "red") { risk = "urgent"; reasons.push("Blood in stool"); }
  if ((r.colour ?? "").toLowerCase() === "black") { risk = "urgent"; reasons.push("Black stool — possible upper GI bleed"); }
  if (stoolTypeId === 7 && (r.frequency === "multiple" || r.frequency === "loose")) {
    risk = "urgent"; reasons.push("Severe diarrhea pattern");
  }
  if (sev(r.pain) >= 3) { if (risk !== "urgent") risk = "attention"; reasons.push("Severe pain"); }
  if (sev(r.burning) >= 3) { if (risk !== "urgent") risk = "attention"; reasons.push("Severe burning"); }

  // Dosha scoring
  let vata = 0, pitta = 0, kapha = 0;
  if (st.dosha === "Vata") vata += 2;
  if (st.dosha === "Pitta") pitta += 2;
  if (st.dosha === "Kapha") kapha += 2;
  if (st.dosha === "Pitta-Kapha") { pitta += 1; kapha += 1; }
  if (r.frequency === "constipation") vata += 1;
  if (r.frequency === "loose" || r.frequency === "multiple") pitta += 1;
  if (r.smell === "foul" || r.smell === "putrid") kapha += 1;
  if (isYes(r.oilLayer)) kapha += 1;
  if (isYes(r.floating)) vata += 1;
  if (isYes(r.bloating) || sev(r.gas) > 0) vata += 1;
  const top = Math.max(vata, pitta, kapha);
  const dominant: string[] = [];
  if (vata === top) dominant.push("Vata");
  if (pitta === top) dominant.push("Pitta");
  if (kapha === top) dominant.push("Kapha");
  const dosha = dominant.length > 1 ? "Mixed" : dominant[0];

  // Agni
  const agni = st.agni;

  // Ama
  let amaScore = st.ama === "High" ? 2 : st.ama === "Moderate" ? 1 : 0;
  if (isYes(r.undigestedFood)) amaScore++;
  if (r.smell === "foul" || r.smell === "putrid") amaScore++;
  if (isYes(r.oilLayer)) amaScore++;
  const ama = amaScore >= 3 ? "High" : amaScore >= 1 ? "Moderate" : "Low";

  // Dhatu & Srotas
  const dhatu: MalaAnalysis["dhatu"] =
    ama === "High" || isYes(r.blood) || isYes(r.undigestedFood) ? "Affected" : "Normal";
  const srotas: MalaAnalysis["srotas"] =
    isYes(r.mucus) || isYes(r.blood) || sev(r.pain) >= 2 || ama === "High" ? "Affected" : "Normal";

  // Impression
  const impression: MalaAnalysis["impression"] =
    risk === "urgent" ? "Urgent Referral"
    : risk === "attention" ? "Needs Consultation"
    : risk === "observe" ? "Needs Observation"
    : "Normal";

  return {
    stool: st,
    dosha,
    agni,
    ama,
    dhatu,
    srotas,
    impression,
    risk,
    reasons,
    summary: `${st.interpretation} Probable ${dosha} involvement with ${agni} Agni and ${ama} Ama. Dhatu ${dhatu.toLowerCase()}, Srotas ${srotas.toLowerCase()}.`,
  };
}

export const RISK_LABEL: Record<string, string> = {
  normal: "Normal",
  observe: "Needs observation",
  attention: "Needs doctor attention",
  urgent: "Urgent attention required",
};

export function computeBMI(weightKg?: string, heightCm?: string): string {
  const w = parseFloat(weightKg ?? "");
  const h = parseFloat(heightCm ?? "");
  if (!w || !h) return "";
  const m = h / 100;
  return (w / (m * m)).toFixed(1);
}
