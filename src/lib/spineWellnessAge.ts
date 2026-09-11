// ─────────────────────────────────────────────────────────────
// Spine AYUSH — Wellness Age (estimated biological age) engine
//
// This produces an ESTIMATED "Wellness Age" from validated functional
// markers plus Ayurvedic/lifestyle inputs. It is a wellness estimate,
// NOT a lab-grade epigenetic clock.
//
// Methodology basis (references):
// - Functional aging markers (grip strength, gait speed, 30s sit-to-stand,
//   single-leg balance) are validated predictors of healthy aging and a
//   "physical fitness age" that can differ from chronological age.
//   (Physical Fitness Age vs chronological age — PubMed 35587763;
//    DO-HEALTH functional aging — Nature s41514-026-00360-2)
// - Ayurvedic Rasayana framing: Agni (digestion), Ojas (vitality), sleep,
//   stress as determinants of healthful longevity (Rasayana/Vajikarana —
//   PMC3968692).
//
// Approach: each marker is scored 0-100 vs age/gender-appropriate norms,
// combined into a weighted Vitality Score (0-100). The score is mapped to
// an age offset (better than typical for age => younger wellness age).
// ─────────────────────────────────────────────────────────────

export interface WellnessInputs {
  chronologicalAge: number;
  gender?: string; // 'male' | 'female' | other
  // functional
  gripStrengthKg?: number | null;
  gaitSpeedMs?: number | null;      // m/s
  sitToStand?: number | null;       // reps in 30s
  balanceSeconds?: number | null;   // single-leg stand (eyes open)
  flexibilityCm?: number | null;    // sit-and-reach (can be negative)
  restingHr?: number | null;
  // vitals / body
  bpSystolic?: number | null;
  bpDiastolic?: number | null;
  waistHipRatio?: number | null;
  // ayurvedic + lifestyle (0-10)
  agniScore?: number | null;
  sleepScore?: number | null;
  stressScore?: number | null;      // higher = more stress (inverted)
  activityScore?: number | null;
  dietScore?: number | null;
  ojasScore?: number | null;
}

export interface WellnessResult {
  vitalityScore: number;       // 0-100
  biologicalAge: number;       // estimated
  ageGap: number;              // biologicalAge - chronologicalAge (negative = younger)
  category: "excellent" | "good" | "average" | "needs_attention";
  breakdown: { label: string; score: number; weight: number }[];
  recommendations: string[];
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

// Linear score: value between poor..good maps to 0..100 (higher input = better)
function scoreHigher(value: number | null | undefined, poor: number, good: number): number | null {
  if (value == null || isNaN(value)) return null;
  return clamp(((value - poor) / (good - poor)) * 100);
}
// Lower input is better (e.g. resting HR, WHR)
function scoreLower(value: number | null | undefined, good: number, poor: number): number | null {
  if (value == null || isNaN(value)) return null;
  return clamp(((poor - value) / (poor - good)) * 100);
}
// 0-10 self/clinician rating -> 0-100
function score10(value: number | null | undefined, invert = false): number | null {
  if (value == null || isNaN(value)) return null;
  const v = clamp(value, 0, 10) * 10;
  return invert ? 100 - v : v;
}

export function computeWellnessAge(input: WellnessInputs): WellnessResult {
  const male = (input.gender || "").toLowerCase().startsWith("m");

  // Grip strength norms (kg) — approx healthy adult ranges (gender-adjusted)
  const gripGood = male ? 45 : 28;
  const gripPoor = male ? 20 : 12;

  const markers: { label: string; score: number | null; weight: number }[] = [
    { label: "Grip Strength", score: scoreHigher(input.gripStrengthKg, gripPoor, gripGood), weight: 3 },
    { label: "Gait Speed", score: scoreHigher(input.gaitSpeedMs, 0.6, 1.4), weight: 3 },
    { label: "Sit-to-Stand (30s)", score: scoreHigher(input.sitToStand, 8, 20), weight: 3 },
    { label: "Balance", score: scoreHigher(input.balanceSeconds, 5, 45), weight: 2 },
    { label: "Flexibility", score: scoreHigher(input.flexibilityCm, -10, 15), weight: 1 },
    { label: "Resting Heart Rate", score: scoreLower(input.restingHr, 60, 90), weight: 2 },
    { label: "Blood Pressure", score: scoreLower(input.bpSystolic, 115, 150), weight: 2 },
    { label: "Waist-Hip Ratio", score: scoreLower(input.waistHipRatio, male ? 0.85 : 0.75, male ? 1.05 : 0.95), weight: 2 },
    { label: "Agni (Digestion)", score: score10(input.agniScore), weight: 2 },
    { label: "Sleep Quality", score: score10(input.sleepScore), weight: 2 },
    { label: "Stress (lower better)", score: score10(input.stressScore, true), weight: 2 },
    { label: "Activity Level", score: score10(input.activityScore), weight: 2 },
    { label: "Diet Quality", score: score10(input.dietScore), weight: 1 },
    { label: "Ojas (Vitality)", score: score10(input.ojasScore), weight: 2 },
  ];

  const present = markers.filter((m) => m.score != null) as { label: string; score: number; weight: number }[];
  const totalWeight = present.reduce((a, m) => a + m.weight, 0) || 1;
  const vitalityScore = Math.round(present.reduce((a, m) => a + m.score * m.weight, 0) / totalWeight);

  // Map vitality to age offset. 50 = neutral (bio age = chrono age).
  // Each point above/below 50 shifts wellness age by ~0.24 yrs, capped at ±12.
  const offset = clamp(((50 - vitalityScore) * 0.24), -12, 12);
  const biologicalAge = Math.max(18, Math.round((input.chronologicalAge + offset) * 10) / 10);
  const ageGap = Math.round((biologicalAge - input.chronologicalAge) * 10) / 10;

  const category: WellnessResult["category"] =
    vitalityScore >= 80 ? "excellent" : vitalityScore >= 65 ? "good" : vitalityScore >= 50 ? "average" : "needs_attention";

  // Recommendations from weakest markers
  const recs: string[] = [];
  const weak = [...present].sort((a, b) => a.score - b.score).slice(0, 4);
  const recMap: Record<string, string> = {
    "Grip Strength": "Add resistance/strength training 2-3x/week to rebuild muscle.",
    "Gait Speed": "Daily brisk walking + spine mobility to improve pace and endurance.",
    "Sit-to-Stand (30s)": "Lower-body strengthening (squats, chair rises) for functional power.",
    "Balance": "Balance & proprioception drills; yoga postures for stability.",
    "Flexibility": "Daily stretching + spine flexibility routine.",
    "Resting Heart Rate": "Cardio conditioning + Pranayama breathing to lower resting HR.",
    "Blood Pressure": "Reduce salt, manage stress, and review BP with your physician.",
    "Waist-Hip Ratio": "Diet + core work to reduce central fat.",
    "Agni (Digestion)": "Rasayana diet, warm cooked foods, and digestive herbs to strengthen Agni.",
    "Sleep Quality": "Sleep hygiene + evening Abhyanga; target 7-8 hrs.",
    "Stress (lower better)": "Daily meditation/breathwork; consider Shirodhara.",
    "Activity Level": "Increase daily movement; structured exercise plan.",
    "Diet Quality": "Move to a seasonal, Prakriti-appropriate diet (Ritucharya).",
    "Ojas (Vitality)": "Rasayana therapy (e.g. Ashwagandha) to build Ojas and vitality.",
  };
  for (const m of weak) if (recMap[m.label]) recs.push(recMap[m.label]);
  if (ageGap <= -3) recs.unshift("Excellent — your body is functioning younger than your age. Maintain with quarterly Rasayana.");
  else if (ageGap >= 3) recs.unshift("Your wellness age is above your years — a rejuvenation program can reverse this.");

  return {
    vitalityScore,
    biologicalAge,
    ageGap,
    category,
    breakdown: present.map((m) => ({ label: m.label, score: Math.round(m.score), weight: m.weight })),
    recommendations: recs,
  };
}

export const WELLNESS_REFERENCES = [
  { label: "Physical Fitness Age vs chronological age (PubMed 35587763)", url: "https://pubmed.ncbi.nlm.nih.gov/35587763/" },
  { label: "Functional aging — grip, gait, sit-to-stand (Nature Aging, DO-HEALTH)", url: "https://www.nature.com/articles/s41514-026-00360-2" },
  { label: "Rasayana & Vajikarana rejuvenation (PMC3968692)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3968692/" },
];
