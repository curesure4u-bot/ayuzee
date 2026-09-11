// ─────────────────────────────────────────────────────────────
// Spine AYUSH — Vitality & Vajikarana clinical reference data
//
// PROFESSIONAL / EDUCATIONAL CLINICAL TOOL. Non-explicit.
// For use by the physician. Content is a clinical synthesis of
// pelvic floor rehabilitation (validated in urology/physiotherapy)
// and Ayurvedic Vajikarana/Rasayana principles.
//
// References:
// - Pelvic floor muscle training improves ED & PE (PubMed 30979506)
// - RCT: PFMT + biofeedback for ED (PMC1324914)
// - Kegel exercises overview (NCBI Bookshelf NBK555898)
// - Vajikarana / Rasayana (PMC3968692)
// ─────────────────────────────────────────────────────────────

export interface VitalityCondition {
  key: string;
  title: string;
  audience: "men" | "women" | "both";
  overview: string;
  pelvic: string[];
  ayurvedic: string[];
  spine: string[];
  lifestyle: string[];
  redFlags: string[];
}

export const VITALITY_CONDITIONS: VitalityCondition[] = [
  {
    key: "pe",
    title: "Premature Ejaculation",
    audience: "men",
    overview: "Combines pelvic floor conditioning, ejaculatory-control techniques, Vajikarana support and stress reduction. Pelvic floor training roughly doubles ejaculatory latency in studies.",
    pelvic: [
      "Identify the PC muscle (brief stop-urine-flow test — once only, for identification)",
      "Kegel: contract 3s / relax 3s, 10 reps, 3 sets/day",
      "Progress to 5-10s holds over 4-6 weeks",
      "Reverse Kegels (relaxation) for control",
      "Start-stop & pause technique practice",
    ],
    ayurvedic: ["Vajikarana Rasayana per physician assessment", "Ashwagandha / Kapikacchu as indicated", "Medhya (calming) herbs for the anxiety component"],
    spine: ["Assess lumbosacral (S2-S4) / pelvic nerve involvement", "Posture & core stability correction", "Address lower-back dysfunction"],
    lifestyle: ["Breathwork to reduce performance anxiety", "Sleep 7-8h; limit alcohol", "Supportive partner communication"],
    redFlags: ["Sudden onset with neurological signs — refer", "Genital pain / infection — refer"],
  },
  {
    key: "ed",
    title: "Erectile Difficulty",
    audience: "men",
    overview: "Pelvic floor rehabilitation + blood flow, spine/nerve assessment, Vajikarana and metabolic correction. Important: new-onset ED can be an early cardiovascular warning sign.",
    pelvic: ["Pelvic floor strengthening (Kegel protocol)", "Perineal muscle activation", "Progressive hold training over 8-12 weeks"],
    ayurvedic: ["Vajikarana Rasayana per assessment", "Ojas-building / circulation-supporting herbs as indicated"],
    spine: ["Lumbosacral / pelvic nerve assessment", "Mobility work to support pelvic blood flow"],
    lifestyle: ["Cardio-metabolic screening (BP, sugar, lipids)", "Weight management, activity, sleep, stress"],
    redFlags: ["New ED — screen for cardiovascular disease / diabetes — REFER", "Sudden ED after trauma — refer"],
  },
  {
    key: "low_libido",
    title: "Low Libido",
    audience: "both",
    overview: "Hormonal/lifestyle factors, Ojas-building Rasayana, and stress & sleep correction. Applies to both men and women.",
    pelvic: ["General pelvic floor conditioning for tone & awareness"],
    ayurvedic: ["Ojas-building Rasayana (Vajikarana)", "Adaptogens (e.g. Ashwagandha) as indicated"],
    spine: ["Address chronic pain / spine issues that sap vitality"],
    lifestyle: ["Sleep, stress and diet optimization", "Regular exercise; reduce late nights", "Screen for depression / relationship factors"],
    redFlags: ["Persistent low mood — mental-health referral", "Hormonal red flags — endocrine referral"],
  },
  {
    key: "frigidity",
    title: "Low Arousal / Frigidity",
    audience: "women",
    overview: "Pelvic floor awareness, blood flow, psychological factors and Ayurvedic support for women, delivered sensitively.",
    pelvic: ["Pelvic floor awareness & relaxation training", "Kegel + reverse-Kegel for tone and release"],
    ayurvedic: ["Ayurvedic / Vajikarana protocols for women as indicated"],
    spine: ["Lumbosacral / pelvic assessment", "Posture and core"],
    lifestyle: ["Address stress, sleep and relationship factors sensitively", "Counseling referral where appropriate"],
    redFlags: ["Pain with intimacy (dyspareunia) — gynae referral", "Post-partum / menopausal factors — specialist"],
  },
  {
    key: "performance_anxiety",
    title: "Performance Anxiety",
    audience: "both",
    overview: "Primarily psychological — mind-body practices, breathwork and gradual desensitization, combined with pelvic control training to build confidence.",
    pelvic: ["Pelvic control training to build confidence", "Paced breathing during practice"],
    ayurvedic: ["Medhya (calming) Rasayana as indicated"],
    spine: ["Relaxation-focused posture & breathing"],
    lifestyle: ["Mind-body meditation (see Dispenza tools)", "4-7-8 breathwork; sleep; reduce stimulants", "Consider counseling"],
    redFlags: ["Severe anxiety / depression — mental-health referral"],
  },
  {
    key: "metabolic",
    title: "Metabolic / Obesity-linked",
    audience: "both",
    overview: "Weight and metabolic correction improves hormonal balance, blood flow and sexual function. Ties into the Wellness Age module.",
    pelvic: ["Pelvic floor conditioning alongside general fitness"],
    ayurvedic: ["Metabolism-supporting Rasayana as indicated", "Diet per Prakriti"],
    spine: ["Spine-safe exercise progression for heavier patients"],
    lifestyle: ["Structured weight loss (link to Wellness Age)", "Activity, diet, sleep, stress", "Screen sugar / lipids / thyroid"],
    redFlags: ["Uncontrolled diabetes / BP — medical management first"],
  },
];

// Levelled Kegel / pelvic-floor training program (both genders)
export interface KegelLevel {
  level: number;
  name: string;
  weeks: string;
  hold: string;
  routine: string;
  goal: string;
}
export const KEGEL_PROGRAM: KegelLevel[] = [
  { level: 1, name: "Awareness", weeks: "Week 1-2", hold: "3s hold / 3s rest", routine: "10 reps x 3 sets/day", goal: "Correctly locate & isolate the pelvic floor (PC) muscle." },
  { level: 2, name: "Foundation", weeks: "Week 3-4", hold: "5s hold / 5s rest", routine: "12 reps x 3 sets/day", goal: "Build baseline endurance and control." },
  { level: 3, name: "Strength", weeks: "Week 5-8", hold: "8-10s hold / 10s rest", routine: "12 reps x 3 sets + quick flicks", goal: "Increase strength and add fast-twitch 'quick flicks'." },
  { level: 4, name: "Control", weeks: "Week 9-12", hold: "10s hold + reverse Kegels", routine: "Maintenance 3 sets/day", goal: "Master relaxation (reverse Kegel) and functional control." },
];

export const KEGEL_TIPS = [
  "Breathe normally — never hold your breath.",
  "Don't tighten the abdomen, thighs or buttocks — isolate the pelvic floor.",
  "Empty the bladder before practice.",
  "Consistency beats intensity — daily practice for 8-12 weeks shows results.",
  "The stop-urine test is for identification ONCE — not a regular exercise.",
  "Reverse Kegels (gentle release/bearing-down) matter as much as contraction for control.",
];

export const VITALITY_REFERENCES = [
  { label: "Pelvic floor muscle training improves ED & PE (PubMed 30979506)", url: "https://pubmed.ncbi.nlm.nih.gov/30979506/" },
  { label: "RCT: pelvic floor exercises + biofeedback for ED (PMC1324914)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1324914/" },
  { label: "Kegel exercises — clinical overview (NCBI NBK555898)", url: "https://www.ncbi.nlm.nih.gov/sites/books/NBK555898/" },
  { label: "Vajikarana & Rasayana (PMC3968692)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3968692/" },
];

export const buildVitalityPlan = (conditionKey: string) => {
  const c = VITALITY_CONDITIONS.find((x) => x.key === conditionKey);
  if (!c) return null;
  return {
    condition: c.title,
    pelvic: c.pelvic,
    ayurvedic: c.ayurvedic,
    spine: c.spine,
    lifestyle: c.lifestyle,
    redFlags: c.redFlags,
  };
};
