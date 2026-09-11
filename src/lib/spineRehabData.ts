// ─────────────────────────────────────────────────────────────
// Spine AYUSH — Spinal Injury Rehabilitation protocol data
//
// SCOPE: sub-acute & chronic rehabilitation + integrative supportive care.
// This is an ADJUNCT to neurosurgical / rehabilitation-medicine care —
// NOT acute emergency management. Always screen red flags and refer.
//
// References:
// - Type & timing of rehab after acute/subacute SCI (PMC5684843)
// - Rehabilitation after cervical & lumbar spine surgery (PMC10441252)
// - Multidisciplinary advanced SCI rehab pathway (PMC10886543)
// ─────────────────────────────────────────────────────────────

export interface RehabPhase {
  phase: string;
  window: string;
  focus: string;
  milestones: string[];
}

export interface RehabProtocol {
  key: string;
  title: string;
  scope: string;
  overview: string;
  phases: RehabPhase[];
  integrative: string[];   // AYUSH / Panchakarma / yoga adjuncts
  caregiver: string[];
}

export const REHAB_PROTOCOLS: RehabProtocol[] = [
  {
    key: "post_op",
    title: "Post-Surgical Spine Rehab",
    scope: "After discectomy / laminectomy / fusion",
    overview: "Structured, phased recovery after spine surgery to restore mobility, strength and function while protecting the surgical site. Coordinate with the operating surgeon.",
    phases: [
      { phase: "Protective", window: "Week 0-2", focus: "Wound healing, pain control, safe movement", milestones: ["Pain controlled", "Safe bed mobility & transfers", "Walking short distances", "Log-roll technique learned"] },
      { phase: "Early Mobility", window: "Week 2-6", focus: "Gentle mobility, posture, walking tolerance", milestones: ["Increase walking distance", "Posture & body-mechanics training", "Gentle ROM within limits", "No heavy lifting/twisting"] },
      { phase: "Strengthening", window: "Week 6-12", focus: "Core & spinal stabilization", milestones: ["Core stabilization program", "Progressive strengthening", "Return to light ADLs/work", "Endurance building"] },
      { phase: "Return to Function", window: "Month 3-6", focus: "Full function, prevention", milestones: ["Full ADL/work return", "Maintenance exercise habit", "Ergonomic & lifestyle correction", "Relapse-prevention plan"] },
    ],
    integrative: ["Kati Basti / Panchakarma once wound healed (surgeon-cleared)", "Yoga therapy for posture & core", "Ayurvedic pain & inflammation support", "Nutrition for tissue healing"],
    caregiver: ["Assist safe transfers & log-rolling", "Monitor wound for infection signs", "Encourage adherence to walking targets", "Prevent early heavy lifting/bending"],
  },
  {
    key: "sci",
    title: "Chronic SCI Supportive Rehab",
    scope: "Chronic spinal cord injury (stable, sub-acute/chronic)",
    overview: "Long-term supportive rehabilitation to maximize function, prevent secondary complications and improve quality of life. Integrative adjunct to specialist SCI/rehab-medicine care.",
    phases: [
      { phase: "Stabilization", window: "On enrollment", focus: "Baseline, complication prevention setup", milestones: ["Function baseline (mobility, ADL)", "Pressure-care & skin routine set", "Bladder/bowel routine guidance", "Spasticity baseline"] },
      { phase: "Functional Training", window: "Month 1-3", focus: "Mobility, transfers, ADL independence", milestones: ["Transfer & wheelchair skills", "Upper-body strengthening", "ADL independence gains", "Spasticity management"] },
      { phase: "Community & Maintenance", window: "Month 3+", focus: "Independence, participation, prevention", milestones: ["Home program adherence", "Secondary-complication prevention", "Psychological & social support", "Caregiver competence"] },
    ],
    integrative: ["Panchakarma for spasticity & circulation (as tolerated)", "Yoga therapy / adapted asana & pranayama", "Marma / neuro-stimulation adjuncts (M19 Functional Neurology)", "Ayurvedic support for bladder/bowel & sleep"],
    caregiver: ["Daily skin/pressure checks", "Assist bladder/bowel routine", "Range-of-motion to prevent contractures", "Recognise complication red flags"],
  },
  {
    key: "neuro_rehab",
    title: "Neuro-Rehab (Functional)",
    scope: "Radiculopathy / myelopathy / neuro-recovery",
    overview: "Functional neuro-rehabilitation for nerve-related deficits — combines your Functional Neurology (M19) approach with graded motor & sensory retraining.",
    phases: [
      { phase: "Assessment", window: "Week 0-1", focus: "Deficit mapping", milestones: ["Dermatome/myotome mapping", "Functional baseline", "Goal setting"] },
      { phase: "Retraining", window: "Week 1-8", focus: "Graded motor/sensory retraining", milestones: ["Nerve glide / mobilization", "Motor control retraining", "Sensory re-education", "Balance & proprioception"] },
      { phase: "Integration", window: "Week 8+", focus: "Function & maintenance", milestones: ["Task-specific practice", "Home neuro-program", "Progress re-assessment"] },
    ],
    integrative: ["Functional Neurology protocols (M19)", "Marma therapy for nerve stimulation", "Yoga for neuromuscular control", "Ayurvedic Rasayana for nerve health"],
    caregiver: ["Support home neuro-exercises", "Safety during balance training", "Track functional gains"],
  },
];

// Complication red flags — trigger referral
export const REHAB_RED_FLAGS = [
  { key: "dysreflexia", label: "Autonomic dysreflexia (sudden BP spike, headache, sweating above injury)", action: "EMERGENCY — treat/refer immediately" },
  { key: "pressure_sore", label: "New pressure sore / skin breakdown", action: "Wound care + offloading; refer if deep/infected" },
  { key: "uti", label: "UTI signs (fever, cloudy urine, increased spasticity)", action: "Medical evaluation / antibiotics" },
  { key: "new_deficit", label: "New or worsening neurological deficit", action: "URGENT neurosurgical referral" },
  { key: "dvt", label: "Calf swelling / warmth (possible DVT)", action: "Urgent medical referral" },
  { key: "resp", label: "Breathing difficulty (esp. high injuries)", action: "EMERGENCY referral" },
  { key: "wound_infection", label: "Surgical wound redness/discharge/fever", action: "Refer to surgeon" },
];

export const REHAB_REFERENCES = [
  { label: "Type & timing of rehab after acute/subacute SCI (PMC5684843)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5684843/" },
  { label: "Rehabilitation after cervical & lumbar spine surgery (PMC10441252)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10441252/" },
  { label: "Multidisciplinary advanced SCI rehab pathway (PMC10886543)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10886543/" },
];

export const getRehabProtocol = (key: string) => REHAB_PROTOCOLS.find((p) => p.key === key);

export const INJURY_TYPE_LABEL: Record<string, string> = {
  post_op: "Post-Surgical",
  sci: "Spinal Cord Injury",
  trauma: "Trauma",
  degenerative: "Degenerative",
};
