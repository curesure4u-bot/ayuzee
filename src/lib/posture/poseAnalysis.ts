// Ayuzee AI Posture Screening — pose analysis utilities
// Original implementation. Uses MediaPipe Pose via CDN ESM.

export type Landmark = { x: number; y: number; z?: number; visibility?: number };
export type Landmarks = Landmark[];

// MediaPipe Pose landmark indices we use
export const LM = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 29], [27, 31],
  [24, 26], [26, 28], [28, 30], [28, 32],
];

export type ViewType = "front" | "side" | "back" | "walking";

export interface ViewMetrics {
  shoulderTiltDeg?: number; // front/back
  hipTiltDeg?: number;      // front/back
  headOffsetPx?: number;    // front/back: head x offset vs midpoint
  earToShoulderDeg?: number; // side: forward head
  hipKneeAnkleDeg?: number;  // side: knee alignment
  shoulderToHipLeanDeg?: number; // side: trunk lean
  kneeValgusPx?: number;    // front: knees inward vs ankles
  weightShiftPx?: number;   // front/back: hip midpoint vs ankle midpoint
}

export interface Finding {
  code: string;
  label: string;
  severity: "good" | "mild" | "moderate" | "severe";
  description: string;
}

export interface ViewAnalysis {
  view: ViewType;
  metrics: ViewMetrics;
  findings: Finding[];
}

const angleDeg = (a: Landmark, b: Landmark) => {
  const dy = b.y - a.y;
  const dx = b.x - a.x;
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

const angleAt = (a: Landmark, b: Landmark, c: Landmark) => {
  // angle ABC in degrees
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (mag === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / mag));
  return Math.acos(cos) * (180 / Math.PI);
};

export const analyzeFront = (lm: Landmarks): ViewAnalysis => {
  const metrics: ViewMetrics = {};
  const findings: Finding[] = [];

  const ls = lm[LM.LEFT_SHOULDER], rs = lm[LM.RIGHT_SHOULDER];
  const lh = lm[LM.LEFT_HIP], rh = lm[LM.RIGHT_HIP];
  const lk = lm[LM.LEFT_KNEE], rk = lm[LM.RIGHT_KNEE];
  const la = lm[LM.LEFT_ANKLE], ra = lm[LM.RIGHT_ANKLE];
  const nose = lm[LM.NOSE];

  if (ls && rs) {
    const tilt = Math.abs(angleDeg(ls, rs));
    metrics.shoulderTiltDeg = +tilt.toFixed(1);
    if (tilt > 5)
      findings.push({
        code: "uneven_shoulders",
        label: "Uneven shoulders",
        severity: tilt > 10 ? "moderate" : "mild",
        description: `Shoulder line tilted ${tilt.toFixed(1)}° from horizontal.`,
      });
  }

  if (lh && rh) {
    const tilt = Math.abs(angleDeg(lh, rh));
    metrics.hipTiltDeg = +tilt.toFixed(1);
    if (tilt > 4)
      findings.push({
        code: "pelvic_tilt_lateral",
        label: "Lateral pelvic tilt",
        severity: tilt > 9 ? "moderate" : "mild",
        description: `Pelvis tilted ${tilt.toFixed(1)}° to one side.`,
      });
  }

  if (ls && rs && nose) {
    const midX = (ls.x + rs.x) / 2;
    const off = Math.abs(nose.x - midX);
    metrics.headOffsetPx = +off.toFixed(3);
    if (off > 0.04)
      findings.push({
        code: "head_lateral_shift",
        label: "Head lateral shift",
        severity: off > 0.07 ? "moderate" : "mild",
        description: "Head is not centered over shoulders.",
      });
  }

  if (lk && rk && la && ra) {
    const kneeDist = Math.abs(lk.x - rk.x);
    const ankleDist = Math.abs(la.x - ra.x);
    const valgus = ankleDist - kneeDist;
    metrics.kneeValgusPx = +valgus.toFixed(3);
    if (valgus > 0.04)
      findings.push({
        code: "knee_valgus",
        label: "Knee inward collapse (valgus)",
        severity: valgus > 0.08 ? "moderate" : "mild",
        description: "Knees fall inward relative to ankles.",
      });
    else if (valgus < -0.04)
      findings.push({
        code: "knee_varus",
        label: "Bow-legs tendency (varus)",
        severity: -valgus > 0.08 ? "moderate" : "mild",
        description: "Knees bow outward relative to ankles.",
      });
  }

  if (lh && rh && la && ra) {
    const hipMid = (lh.x + rh.x) / 2;
    const ankleMid = (la.x + ra.x) / 2;
    const shift = Math.abs(hipMid - ankleMid);
    metrics.weightShiftPx = +shift.toFixed(3);
    if (shift > 0.04)
      findings.push({
        code: "weight_shift",
        label: "Weight shift imbalance",
        severity: shift > 0.08 ? "moderate" : "mild",
        description: "Pelvis is shifted off the base of support.",
      });
  }

  return { view: "front", metrics, findings };
};

export const analyzeSide = (lm: Landmarks): ViewAnalysis => {
  const metrics: ViewMetrics = {};
  const findings: Finding[] = [];

  // Use whichever side has higher visibility for ear/shoulder/hip
  const useLeft =
    (lm[LM.LEFT_EAR]?.visibility ?? 0) >= (lm[LM.RIGHT_EAR]?.visibility ?? 0);
  const ear = useLeft ? lm[LM.LEFT_EAR] : lm[LM.RIGHT_EAR];
  const shoulder = useLeft ? lm[LM.LEFT_SHOULDER] : lm[LM.RIGHT_SHOULDER];
  const hip = useLeft ? lm[LM.LEFT_HIP] : lm[LM.RIGHT_HIP];
  const knee = useLeft ? lm[LM.LEFT_KNEE] : lm[LM.RIGHT_KNEE];
  const ankle = useLeft ? lm[LM.LEFT_ANKLE] : lm[LM.RIGHT_ANKLE];

  if (ear && shoulder) {
    // Forward head: ear should be roughly above shoulder; positive offset = head forward
    const dx = ear.x - shoulder.x;
    // angle from vertical
    const dy = shoulder.y - ear.y;
    const ang = Math.abs(Math.atan2(dx, dy) * (180 / Math.PI));
    metrics.earToShoulderDeg = +ang.toFixed(1);
    if (ang > 8)
      findings.push({
        code: "forward_head",
        label: "Forward head posture",
        severity: ang > 18 ? "severe" : ang > 12 ? "moderate" : "mild",
        description: `Head translated ${ang.toFixed(1)}° forward of shoulders.`,
      });
  }

  if (shoulder && hip) {
    const dx = shoulder.x - hip.x;
    const dy = hip.y - shoulder.y;
    const ang = Math.atan2(dx, dy) * (180 / Math.PI);
    metrics.shoulderToHipLeanDeg = +ang.toFixed(1);
    if (Math.abs(ang) > 6)
      findings.push({
        code: ang > 0 ? "thoracic_kyphosis" : "lumbar_extension",
        label: ang > 0 ? "Hunchback / kyphotic tendency" : "Excess lumbar extension",
        severity: Math.abs(ang) > 14 ? "moderate" : "mild",
        description: "Trunk alignment deviates from vertical.",
      });
  }

  // Rounded shoulder estimation: shoulder anterior to ear-hip line
  if (ear && shoulder && hip) {
    // Project shoulder onto ear-hip line
    const ex = hip.x - ear.x, ey = hip.y - ear.y;
    const sx = shoulder.x - ear.x, sy = shoulder.y - ear.y;
    const t = (sx * ex + sy * ey) / (ex * ex + ey * ey || 1);
    const px = ear.x + t * ex, py = ear.y + t * ey;
    const off = shoulder.x - px;
    if (Math.abs(off) > 0.025)
      findings.push({
        code: "rounded_shoulders",
        label: "Rounded shoulders",
        severity: Math.abs(off) > 0.06 ? "moderate" : "mild",
        description: "Shoulder sits anterior to the ear-hip line.",
      });
  }

  if (hip && knee && ankle) {
    const a = angleAt(hip, knee, ankle);
    metrics.hipKneeAnkleDeg = +a.toFixed(1);
    if (a < 165)
      findings.push({
        code: "knee_flexion",
        label: "Knee flexion at standing",
        severity: a < 150 ? "moderate" : "mild",
        description: `Hip-knee-ankle angle ${a.toFixed(1)}°. Should be near 180° in relaxed standing.`,
      });
    else if (a > 183)
      findings.push({
        code: "knee_hyperextension",
        label: "Knee hyperextension",
        severity: "mild",
        description: `Hip-knee-ankle angle ${a.toFixed(1)}°.`,
      });
  }

  // Pelvic tilt indication via hip-knee horizontal offset
  if (hip && knee) {
    const dx = hip.x - knee.x;
    if (dx > 0.04)
      findings.push({
        code: "anterior_pelvic_tilt",
        label: "Anterior pelvic tilt tendency",
        severity: "mild",
        description: "Pelvis appears tilted forward relative to knees.",
      });
    else if (dx < -0.04)
      findings.push({
        code: "posterior_pelvic_tilt",
        label: "Posterior pelvic tilt tendency",
        severity: "mild",
        description: "Pelvis appears tilted backward relative to knees.",
      });
  }

  return { view: "side", metrics, findings };
};

export const analyzeBack = (lm: Landmarks): ViewAnalysis => {
  // Reuse front-view symmetry checks (shoulders, hips, knees, ankles)
  const a = analyzeFront(lm);
  // Add scoliosis suspicion if shoulder tilt + hip tilt are opposing
  const ls = lm[LM.LEFT_SHOULDER], rs = lm[LM.RIGHT_SHOULDER];
  const lh = lm[LM.LEFT_HIP], rh = lm[LM.RIGHT_HIP];
  const findings = [...a.findings];
  if (ls && rs && lh && rh) {
    const sTilt = ls.y - rs.y;
    const hTilt = lh.y - rh.y;
    if (Math.sign(sTilt) !== Math.sign(hTilt) && Math.abs(sTilt) > 0.02 && Math.abs(hTilt) > 0.02) {
      findings.push({
        code: "scoliosis_suspicion",
        label: "Scoliosis suspicion",
        severity: "moderate",
        description: "Opposing shoulder and hip tilt suggests possible spinal curvature. Clinical evaluation advised.",
      });
    }
  }
  return { view: "back", metrics: a.metrics, findings };
};

export const analyzeLandmarks = (view: ViewType, lm: Landmarks): ViewAnalysis => {
  if (view === "front") return analyzeFront(lm);
  if (view === "side") return analyzeSide(lm);
  if (view === "back") return analyzeBack(lm);
  return { view, metrics: {}, findings: [] };
};

// Section scores out of 100 (0 = perfect, 100 = severe)
const sevWeight = (s: Finding["severity"]) => (s === "severe" ? 30 : s === "moderate" ? 18 : s === "mild" ? 8 : 0);

const scoreFor = (codes: string[], findings: Finding[]) => {
  const matched = findings.filter((f) => codes.includes(f.code));
  let score = 0;
  for (const m of matched) score += sevWeight(m.severity);
  return Math.min(100, score);
};

export interface PostureScores {
  head: number;
  shoulder: number;
  spine: number;
  pelvic: number;
  knee: number;
  overall: number;
  riskLevel: "Good posture" | "Mild imbalance" | "Moderate imbalance" | "Severe imbalance";
}

export const computeScores = (analyses: ViewAnalysis[]): PostureScores => {
  const all = analyses.flatMap((a) => a.findings);
  const head = scoreFor(["forward_head", "head_lateral_shift"], all);
  const shoulder = scoreFor(["uneven_shoulders", "rounded_shoulders"], all);
  const spine = scoreFor(["thoracic_kyphosis", "lumbar_extension", "scoliosis_suspicion"], all);
  const pelvic = scoreFor(["pelvic_tilt_lateral", "anterior_pelvic_tilt", "posterior_pelvic_tilt", "weight_shift"], all);
  const knee = scoreFor(["knee_valgus", "knee_varus", "knee_flexion", "knee_hyperextension"], all);
  const overall = Math.round((head + shoulder + spine + pelvic + knee) / 5);
  const riskLevel: PostureScores["riskLevel"] =
    overall <= 25 ? "Good posture" : overall <= 50 ? "Mild imbalance" : overall <= 75 ? "Moderate imbalance" : "Severe imbalance";
  return { head, shoulder, spine, pelvic, knee, overall, riskLevel };
};

// Corrective plan generator based on findings
export interface Exercise {
  name: string;
  category: "stretch" | "strengthen" | "yoga" | "ergonomic" | "breathing";
  duration: string;
  instructions: string;
}

const EXERCISES: Record<string, Exercise[]> = {
  forward_head: [
    { name: "Chin tuck", category: "strengthen", duration: "10 reps × 3 sets", instructions: "Gently retract chin keeping eyes level. Hold 5s." },
    { name: "Neck retraction", category: "stretch", duration: "10 reps", instructions: "Pull head straight back without tilting." },
  ],
  rounded_shoulders: [
    { name: "Wall angel", category: "strengthen", duration: "12 reps × 2 sets", instructions: "Stand against wall, slide arms up and down keeping contact." },
    { name: "Doorway pec stretch", category: "stretch", duration: "30s × 3", instructions: "Forearm against doorframe, step forward to stretch chest." },
  ],
  uneven_shoulders: [
    { name: "Single-arm lat stretch", category: "stretch", duration: "30s each side", instructions: "Reach overhead, side bend toward opposite side." },
  ],
  thoracic_kyphosis: [
    { name: "Cat-Cow (Marjaryasana–Bitilasana)", category: "yoga", duration: "8 cycles", instructions: "Mobilize thoracic spine through flexion and extension." },
    { name: "Bhujangasana (modified cobra)", category: "yoga", duration: "5 breaths × 3", instructions: "Lift chest gently, elbows bent, shoulders away from ears." },
  ],
  scoliosis_suspicion: [
    { name: "Side plank (concave side up)", category: "strengthen", duration: "20s × 3", instructions: "Strengthen lateral trunk on the convex side." },
  ],
  anterior_pelvic_tilt: [
    { name: "Hip flexor stretch", category: "stretch", duration: "30s each side × 2", instructions: "Half-kneeling lunge with posterior pelvic tilt." },
    { name: "Setu Bandhasana (bridge)", category: "yoga", duration: "5 breaths × 3", instructions: "Glute and hamstring activation." },
    { name: "Dead bug", category: "strengthen", duration: "10 reps each side", instructions: "Brace core, alternate opposite arm/leg lower." },
  ],
  posterior_pelvic_tilt: [
    { name: "Hamstring stretch", category: "stretch", duration: "30s each leg × 2", instructions: "Seated forward fold, neutral spine." },
    { name: "Hip flexor activation (knee drive)", category: "strengthen", duration: "10 reps each", instructions: "Standing knee raises to 90°." },
  ],
  pelvic_tilt_lateral: [
    { name: "Side-lying hip abduction (Clamshell)", category: "strengthen", duration: "12 reps × 3", instructions: "Strengthen gluteus medius." },
  ],
  weight_shift: [
    { name: "Single-leg stance balance", category: "strengthen", duration: "30s each leg", instructions: "Stand on one leg, eyes open then closed." },
  ],
  knee_valgus: [
    { name: "Mini-band squats", category: "strengthen", duration: "12 reps × 3", instructions: "Band above knees, push knees outward." },
    { name: "Glute bridge with band", category: "strengthen", duration: "12 reps × 3", instructions: "" },
  ],
  knee_varus: [
    { name: "Adductor strengthening (ball squeeze)", category: "strengthen", duration: "10 reps × 3", instructions: "" },
  ],
  knee_flexion: [
    { name: "Quadriceps activation", category: "strengthen", duration: "10 reps × 3", instructions: "Long-sit knee extensions." },
  ],
  head_lateral_shift: [
    { name: "Postural awareness drill", category: "ergonomic", duration: "Daily", instructions: "Mirror feedback to align ears over shoulders." },
  ],
};

const ERGONOMIC_TIPS = [
  "Set monitor top at eye level, screen ~arm length away.",
  "Keep elbows at ~90° with wrists neutral while typing.",
  "Feet flat on floor; thighs parallel to ground.",
  "Take a 30-second posture break every 30 minutes.",
  "Avoid crossing legs while sitting — alternate sides.",
];

export const generateCorrectivePlan = (analyses: ViewAnalysis[]) => {
  const all = analyses.flatMap((a) => a.findings);
  const codes = Array.from(new Set(all.map((f) => f.code)));
  const exercises: Exercise[] = [];
  const seen = new Set<string>();
  for (const code of codes) {
    for (const ex of EXERCISES[code] ?? []) {
      if (!seen.has(ex.name)) {
        exercises.push(ex);
        seen.add(ex.name);
      }
    }
  }
  // Always include a breathing baseline
  exercises.push({
    name: "Diaphragmatic breathing",
    category: "breathing",
    duration: "5 min daily",
    instructions: "Inhale through nose 4s, exhale 6s, expanding lower ribs.",
  });
  const yoga = exercises.filter((e) => e.category === "yoga").map((e) => e.name);
  return { exercises, yoga, ergonomics: ERGONOMIC_TIPS };
};
