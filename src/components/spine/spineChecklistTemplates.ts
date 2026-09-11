// ─── Spine AYUSH SOP / Checklist Templates ───
// Central definition of all standard operating checklists for the spine clinic.
// Each item can be marked `required` (blocks "all clear" until checked) and/or
// `redFlag` (a positive check on a red-flag item means STOP / do not proceed).

export interface ChecklistItem {
  label: string;
  category: string;
  required?: boolean;   // must be checked for the checklist to be "complete"
  redFlag?: boolean;    // checking this means a danger sign is PRESENT → block/stop
  help?: string;        // optional plain-language explanation for non-tech operator
}

export interface ChecklistTemplate {
  type: string;             // stable key stored in DB (checklist_type)
  title: string;
  purpose: string;          // one-line "why this matters"
  icon: string;             // emoji for quick visual ID (non-tech friendly)
  color: string;            // tailwind base color name
  needsPatient?: boolean;   // show patient-name field
  redFlagMode?: boolean;    // if true, any checked redFlag item blocks "all clear"
  items: ChecklistItem[];
}

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. PRE-TREATMENT SAFETY (highest priority — clinical + legal)
  // ─────────────────────────────────────────────────────────────
  {
    type: "pre_treatment_safety",
    title: "Pre-Treatment Safety Screen",
    purpose: "Confirm it is SAFE to treat this patient today. Red flags = STOP and refer.",
    icon: "🛡️",
    color: "red",
    needsPatient: true,
    redFlagMode: true,
    items: [
      // Red flags — if PRESENT (checked), do NOT proceed
      { label: "Loss of bladder / bowel control (incontinence or retention)", category: "Red Flags — STOP if present", redFlag: true, help: "Possible cauda equina — surgical emergency. Refer immediately." },
      { label: "Progressive weakness or numbness in legs", category: "Red Flags — STOP if present", redFlag: true, help: "Worsening nerve compression. Needs urgent medical review." },
      { label: "Saddle anaesthesia (numbness around groin/inner thighs)", category: "Red Flags — STOP if present", redFlag: true, help: "Cauda equina red flag. Do not treat — refer." },
      { label: "Recent significant trauma / suspected fracture", category: "Red Flags — STOP if present", redFlag: true, help: "Rule out fracture before any manual/heat therapy." },
      { label: "Unexplained weight loss / night pain / cancer history", category: "Red Flags — STOP if present", redFlag: true, help: "Possible sinister cause. Needs investigation first." },
      { label: "Fever with spinal pain", category: "Red Flags — STOP if present", redFlag: true, help: "Possible infection (discitis). Refer for evaluation." },
      // Required safety confirmations
      { label: "Patient identity & today's complaint confirmed", category: "Confirm before treating", required: true },
      { label: "Diagnosis / working impression documented", category: "Confirm before treating", required: true },
      { label: "Therapy-specific contraindications reviewed", category: "Confirm before treating", required: true, help: "E.g. no cupping/Agnikarma on broken/infected skin; caution with osteoporosis, anticoagulants, pregnancy." },
      { label: "Informed consent explained & recorded", category: "Confirm before treating", required: true },
      { label: "Baseline pain (VAS) recorded", category: "Confirm before treating", required: true },
      { label: "Emergency contact / first-aid kit available", category: "Confirm before treating", required: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. DAILY CLINIC OPEN
  // ─────────────────────────────────────────────────────────────
  {
    type: "daily_open",
    title: "Daily Clinic Open Checklist",
    purpose: "Everything ready before the first patient of the day.",
    icon: "🌅",
    color: "amber",
    items: [
      { label: "Treatment rooms clean & sheets changed", category: "Setup", required: true },
      { label: "Oils heated / warmers switched on", category: "Setup", required: true },
      { label: "Consumables stocked (needles, cups, cotton, gloves)", category: "Setup", required: true },
      { label: "Equipment checked & working (EA unit, autoclave)", category: "Setup", required: true },
      { label: "Emergency / first-aid kit present & in date", category: "Safety", required: true },
      { label: "Today's appointments reviewed & confirmed", category: "Schedule", required: true },
      { label: "Sterilization / autoclave cycle done", category: "Safety", required: true },
      { label: "Front desk float cash & payment device ready", category: "Admin" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. DAILY CLINIC CLOSE
  // ─────────────────────────────────────────────────────────────
  {
    type: "daily_close",
    title: "Daily Clinic Close Checklist",
    purpose: "Clean shutdown, records complete, ready for tomorrow.",
    icon: "🌙",
    color: "indigo",
    items: [
      { label: "All today's sessions recorded in system", category: "Records", required: true },
      { label: "Consumables used logged / restock list made", category: "Stock", required: true },
      { label: "Instruments sterilized & stored", category: "Safety", required: true },
      { label: "Rooms cleaned, linen for laundry", category: "Cleaning", required: true },
      { label: "Follow-up messages / reminders sent", category: "Retention" },
      { label: "Day's collection tallied & recorded", category: "Finance", required: true },
      { label: "Equipment switched off, warmers unplugged", category: "Safety", required: true },
      { label: "Doors / cabinets locked, medicines secured", category: "Security", required: true },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. NEW PATIENT ONBOARDING
  // ─────────────────────────────────────────────────────────────
  {
    type: "new_patient_onboarding",
    title: "New Patient Onboarding Checklist",
    purpose: "Every new spine patient starts the same complete, high-quality way.",
    icon: "🧾",
    color: "blue",
    needsPatient: true,
    items: [
      { label: "Registration & contact details captured", category: "Intake", required: true },
      { label: "Spine assessment / AI Spine Score done", category: "Assessment", required: true },
      { label: "Prakriti / constitution noted", category: "Assessment" },
      { label: "Baseline VAS + ODI/NDI recorded", category: "Assessment", required: true },
      { label: "Red-flag safety screen completed", category: "Safety", required: true, help: "Run the Pre-Treatment Safety Screen before any therapy." },
      { label: "Treatment protocol / plan assigned", category: "Plan", required: true },
      { label: "Package & pricing explained", category: "Plan", required: true },
      { label: "Home-care / exercises demonstrated", category: "Education" },
      { label: "Next appointment booked", category: "Retention", required: true },
      { label: "WhatsApp / follow-up consent taken", category: "Retention" },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 5. PANCHAKARMA PRE-PROCEDURE
  // ─────────────────────────────────────────────────────────────
  {
    type: "pk_pre_procedure",
    title: "Panchakarma Pre-Procedure Checklist",
    purpose: "Safe, correct setup before any Panchakarma / Basti / Sweda procedure.",
    icon: "🌿",
    color: "green",
    needsPatient: true,
    redFlagMode: true,
    items: [
      { label: "Active fever / acute illness today", category: "Red Flags — STOP if present", redFlag: true, help: "Postpone Panchakarma during acute illness." },
      { label: "Uncontrolled BP / cardiac instability", category: "Red Flags — STOP if present", redFlag: true, help: "Stabilize / get clearance before heat or Basti." },
      { label: "Pregnancy (unless specifically indicated)", category: "Red Flags — STOP if present", redFlag: true },
      { label: "Correct procedure & body region confirmed", category: "Confirm", required: true },
      { label: "Oils / decoctions prepared & temperature checked", category: "Confirm", required: true, help: "Avoid burns — test temperature before application." },
      { label: "Purva karma (prep) completed as per plan", category: "Confirm", required: true },
      { label: "Consent & procedure explained to patient", category: "Confirm", required: true },
      { label: "Vitals recorded (BP, pulse)", category: "Confirm", required: true },
      { label: "Therapist briefed / assistance available", category: "Confirm" },
      { label: "Post-procedure care items ready", category: "Confirm" },
    ],
  },
];

export const getTemplate = (type: string) =>
  CHECKLIST_TEMPLATES.find((t) => t.type === type);
