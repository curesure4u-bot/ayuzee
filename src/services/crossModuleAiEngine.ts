// ============================================================
// Cross-Module AI Integration Engine
// Connects: Reception → Doctor → Pharmacy → Billing
// Provides intelligent context flow across the entire patient journey
// ============================================================

import type {
  Patient, PatientVitals, MedicalHistory, OPVisit,
  AIPrescriptionSuggestion, AITreatmentPlan, AICrossModuleContext,
  AIDiagnosisSuggestion, PrescriptionMedicine, LabOrder,
} from "@/types/patient-hms";

// Simulate AI delay
const aiDelay = (ms: number = 800) => new Promise((r) => setTimeout(r, ms));

// ─── RECEPTION MODULE AI ────────────────────────────────────

/**
 * AI Triage Assessment at Reception
 * Analyzes patient symptoms and history to determine urgency
 */
export async function aiTriageAssessment(
  chiefComplaint: string,
  age: number,
  gender: string,
  vitalSigns?: Partial<PatientVitals>
): Promise<{
  triageLevel: "Green" | "Yellow" | "Orange" | "Red";
  urgency: string;
  suggestedDepartment: string;
  suggestedDoctor: string;
  estimatedWaitTime: number; // minutes
  alerts: string[];
}> {
  await aiDelay(600);

  const complaint = chiefComplaint.toLowerCase();
  let level: "Green" | "Yellow" | "Orange" | "Red" = "Green";
  let urgency = "Routine";
  let dept = "General OPD";
  let doctor = "Dr. Mohamad Saleem MD (AYURVEDA)";
  const alerts: string[] = [];

  // AI rule-based triage
  if (complaint.includes("chest pain") || complaint.includes("breathless") || complaint.includes("unconscious")) {
    level = "Red";
    urgency = "Emergency - Immediate attention required";
    dept = "Emergency";
    alerts.push("Critical symptom detected — alert emergency team");
  } else if (complaint.includes("fever") && age > 60) {
    level = "Orange";
    urgency = "Urgent - Senior patient with fever";
    alerts.push("Geriatric patient with fever — monitor closely");
  } else if (complaint.includes("pain") || complaint.includes("swelling")) {
    level = "Yellow";
    urgency = "Semi-urgent";
    if (complaint.includes("joint") || complaint.includes("back") || complaint.includes("knee")) {
      dept = "Panchakarma / Ortho";
      doctor = "Dr. Mohamad Saleem MD (AYURVEDA)";
    }
  }

  // Vital signs alerts
  if (vitalSigns?.bloodPressure) {
    const [sys] = vitalSigns.bloodPressure.split("/").map(Number);
    if (sys > 180) { level = "Red"; alerts.push("Hypertensive crisis — BP > 180 systolic"); }
    else if (sys > 140) alerts.push("Elevated BP — monitor");
  }
  if (vitalSigns?.sugar && vitalSigns.sugar > 300) {
    level = "Orange";
    alerts.push("Very high blood sugar — diabetic emergency risk");
  }
  if (vitalSigns?.temperature && vitalSigns.temperature > 103) {
    level = "Orange";
    alerts.push("High fever > 103°F — investigate cause");
  }

  return {
    triageLevel: level,
    urgency,
    suggestedDepartment: dept,
    suggestedDoctor: doctor,
    estimatedWaitTime: level === "Red" ? 0 : level === "Orange" ? 5 : level === "Yellow" ? 15 : 30,
    alerts,
  };
}

/**
 * AI Smart Queue Optimization
 * Reorders the queue based on triage levels and wait times
 */
export async function aiOptimizeQueue(
  queue: { patientId: string; triageLevel: string; waitTime: number; doctor: string }[]
): Promise<{ patientId: string; newPosition: number; reason: string }[]> {
  await aiDelay(400);
  return queue
    .sort((a, b) => {
      const priority = { Red: 0, Orange: 1, Yellow: 2, Green: 3 };
      const pA = priority[a.triageLevel as keyof typeof priority] ?? 3;
      const pB = priority[b.triageLevel as keyof typeof priority] ?? 3;
      if (pA !== pB) return pA - pB;
      return b.waitTime - a.waitTime;
    })
    .map((item, idx) => ({
      patientId: item.patientId,
      newPosition: idx + 1,
      reason: `Triage: ${item.triageLevel}, Wait: ${item.waitTime}min`,
    }));
}

// ─── DOCTOR CONSULTATION MODULE AI ─────────────────────────

/**
 * AI Clinical Decision Support during Consultation
 * Provides real-time suggestions based on symptoms + history + vitals
 */
export async function aiClinicalDecisionSupport(
  chiefComplaint: string,
  history: Partial<MedicalHistory>,
  vitals: Partial<PatientVitals>,
  currentMedications?: string[]
): Promise<{
  differentialDiagnoses: AIDiagnosisSuggestion[];
  suggestedInvestigations: string[];
  redFlags: string[];
  ayurvedicCorrelation: { dosha: string; dushya: string; srotas: string; agni: string };
}> {
  await aiDelay(1000);

  const complaint = chiefComplaint.toLowerCase();
  const diagnoses: AIDiagnosisSuggestion[] = [];
  const investigations: string[] = [];
  const redFlags: string[] = [];

  // AI pattern matching for Ayurveda diagnosis
  if (complaint.includes("joint") || complaint.includes("knee") || complaint.includes("pain")) {
    diagnoses.push(
      { condition: "Sandhivata", confidence: 85, ayurvedicName: "Sandhivata", modernName: "Osteoarthritis", supportingEvidence: ["Joint pain", "Age-related degeneration"], suggestedInvestigations: ["X-ray", "ESR", "CRP"] },
      { condition: "Amavata", confidence: 45, ayurvedicName: "Amavata", modernName: "Rheumatoid Arthritis", supportingEvidence: ["Multiple joint involvement", "Morning stiffness"], suggestedInvestigations: ["RA Factor", "Anti-CCP", "CRP"] },
      { condition: "Vatarakta", confidence: 25, ayurvedicName: "Vatarakta", modernName: "Gouty Arthritis", supportingEvidence: ["Acute onset", "Single joint"], suggestedInvestigations: ["Serum Uric Acid", "Synovial fluid"] }
    );
    investigations.push("X-ray of affected joint", "ESR", "CRP", "RA Factor", "Vitamin D3", "Serum Calcium");
  } else if (complaint.includes("skin") || complaint.includes("eczema") || complaint.includes("itching")) {
    diagnoses.push(
      { condition: "Vicharchika", confidence: 80, ayurvedicName: "Vicharchika", modernName: "Eczema", supportingEvidence: ["Itching", "Scaling", "Redness"], suggestedInvestigations: ["IgE levels", "Skin biopsy"] },
      { condition: "Kitibha", confidence: 40, ayurvedicName: "Kitibha Kushtha", modernName: "Psoriasis", supportingEvidence: ["Silvery scales", "Chronic"], suggestedInvestigations: ["Skin biopsy", "ASO titre"] }
    );
    investigations.push("CBC", "IgE Total", "Absolute Eosinophil Count", "Blood Sugar");
  } else if (complaint.includes("diabetes") || complaint.includes("sugar")) {
    diagnoses.push(
      { condition: "Madhumeha", confidence: 90, ayurvedicName: "Madhumeha", modernName: "Type 2 Diabetes Mellitus", supportingEvidence: ["Polyuria", "Polydipsia", "Elevated sugar"], suggestedInvestigations: ["HbA1c", "FBS", "PPBS"] }
    );
    investigations.push("HbA1c", "Fasting Blood Sugar", "Post-Prandial Blood Sugar", "Lipid Profile", "Urine Albumin", "Serum Creatinine");
  }

  // Drug interaction warnings
  if (currentMedications?.includes("metformin") && complaint.includes("kidney")) {
    redFlags.push("Metformin use with renal concerns — check eGFR before continuing");
  }
  if (history?.allergies?.some((a) => a.toLowerCase().includes("sulfa"))) {
    redFlags.push("Known sulfa allergy — avoid sulfonamide-based medications");
  }

  return {
    differentialDiagnoses: diagnoses,
    suggestedInvestigations: investigations,
    redFlags,
    ayurvedicCorrelation: {
      dosha: complaint.includes("pain") ? "Vata Vriddhi" : "Pitta-Kapha Dushti",
      dushya: complaint.includes("joint") ? "Asthi, Majja" : "Rakta, Twak",
      srotas: complaint.includes("joint") ? "Asthivaha Srotas" : "Raktavaha Srotas",
      agni: "Vishama Agni (irregular digestive fire)",
    },
  };
}

/**
 * AI Treatment Protocol Generator
 * Creates phased Ayurveda treatment plan based on diagnosis
 */
export async function aiGenerateTreatmentProtocol(
  diagnosis: string,
  severity: "Mild" | "Moderate" | "Severe",
  patientAge: number,
  dosha: string
): Promise<AITreatmentPlan[]> {
  await aiDelay(1200);

  if (diagnosis.toLowerCase().includes("sandhivata") || diagnosis.toLowerCase().includes("arthritis")) {
    return [
      {
        phase: "Phase 1: Ama Pachana (Detox Prep)",
        duration: "5-7 days",
        procedures: ["Deepana-Pachana therapy"],
        medicines: [
          { medicine: "Chitrakadi Vati", form: "Vati", dose: "2 tabs", frequency: "BD", duration: "7 days", instruction: "Before Food", rationale: "Agni deepana for Ama pachana" },
          { medicine: "Hingvashtak Churna", form: "Churnam", dose: "3g", frequency: "BD", duration: "7 days", instruction: "Before Food", rationale: "Digestive stimulant" },
        ],
        diet: ["Light warm food", "Avoid cold/raw items", "Include ginger water", "Avoid curd and heavy foods"],
        lifestyle: ["Warm water bath", "Avoid cold exposure", "Light exercise only"],
      },
      {
        phase: "Phase 2: Shodhana (Purification)",
        duration: "7-14 days",
        procedures: ["Abhyanga with Dhanwantharam Tailam", "Swedana (Nadi/Patra)", "Janu Basti", "Podikizhi / Elakizhi"],
        medicines: [
          { medicine: "Guggulutiktakam Kashayam", form: "Kashayam", dose: "15ml", frequency: "BD", duration: "14 days", instruction: "Before Food", rationale: "Anti-inflammatory Kashayam for joint disorders" },
        ],
        diet: ["Pathya Ahara as per Ayurveda", "Warm soups", "Avoid Viruddha Ahara"],
        lifestyle: ["Bed rest during intensive therapy", "Gentle ROM exercises post-therapy"],
        yoga: ["Pawanmuktasana series (joint freeing)", "Gentle Tadasana"],
      },
      {
        phase: "Phase 3: Shamana (Palliative & Maintenance)",
        duration: "30-60 days",
        procedures: ["Follow-up oil application"],
        medicines: [
          { medicine: "Yogaraja Guggulu", form: "Guggulu", dose: "2 tabs", frequency: "TDS", duration: "30 days", instruction: "After Food", rationale: "Classical formulation for Vata disorders of joints" },
          { medicine: "Rasnasaptakam Kashayam", form: "Kashayam", dose: "15ml", frequency: "BD", duration: "30 days", instruction: "Before Food", rationale: "Potent anti-Vata formulation" },
          { medicine: "Ashwagandha Churnam", form: "Churnam", dose: "3g", frequency: "HS", duration: "60 days", instruction: "After Food", rationale: "Rasayana - tissue nourishment & strength" },
        ],
        diet: ["Regular warm meals", "Include ghee, milk (if tolerated)", "Anti-inflammatory spices: turmeric, ginger"],
        lifestyle: ["Daily oil application to joints", "20 min walking", "Avoid stair climbing"],
        yoga: ["Virabhadrasana (modified)", "Trikonasana", "Shavasana with guided relaxation"],
      },
    ];
  }

  // Default generic plan
  return [
    {
      phase: "Phase 1: Assessment & Stabilization",
      duration: "7 days",
      procedures: ["Initial assessment"],
      medicines: [{ medicine: "As per consultation", form: "Tablet", dose: "Per doctor", frequency: "BD", duration: "7 days", instruction: "After Food", rationale: "Customized based on diagnosis" }],
      diet: ["Balanced diet", "Avoid processed foods"],
      lifestyle: ["Adequate rest", "Stress management"],
    },
  ];
}

// ─── PHARMACY MODULE AI ─────────────────────────────────────

/**
 * AI Drug Interaction Checker
 * Validates prescription against allergies, current medications, and Ayurveda viruddha
 */
export async function aiDrugInteractionCheck(
  newMedicines: string[],
  existingMedicines: string[],
  allergies: string[],
  patientAge: number
): Promise<{
  safe: boolean;
  interactions: { drug1: string; drug2: string; severity: "Low" | "Medium" | "High"; description: string }[];
  allergyConflicts: string[];
  dosageWarnings: string[];
  ayurvedaViruddha: string[];
}> {
  await aiDelay(500);

  const interactions: { drug1: string; drug2: string; severity: "Low" | "Medium" | "High"; description: string }[] = [];
  const allergyConflicts: string[] = [];
  const dosageWarnings: string[] = [];
  const ayurvedaViruddha: string[] = [];

  // Check Ayurveda Viruddha (incompatibilities)
  const allMeds = [...newMedicines, ...existingMedicines].map((m) => m.toLowerCase());
  if (allMeds.some((m) => m.includes("ghritam")) && allMeds.some((m) => m.includes("madhu") || m.includes("honey"))) {
    ayurvedaViruddha.push("Ghee + Honey in equal quantities is Viruddha (incompatible) — adjust proportions");
  }
  if (allMeds.some((m) => m.includes("milk")) && allMeds.some((m) => m.includes("fish") || m.includes("sour"))) {
    ayurvedaViruddha.push("Milk with sour items is Viruddha — avoid taking together");
  }

  // Age-based warnings
  if (patientAge > 65) {
    dosageWarnings.push("Geriatric patient — consider 50-75% of standard adult dose for potent formulations");
  }
  if (patientAge < 12) {
    dosageWarnings.push("Pediatric patient — use age-appropriate dosage calculations");
  }

  // Allergy check
  for (const med of newMedicines) {
    for (const allergy of allergies) {
      if (med.toLowerCase().includes(allergy.toLowerCase())) {
        allergyConflicts.push(`${med} may conflict with known allergy: ${allergy}`);
      }
    }
  }

  return {
    safe: interactions.length === 0 && allergyConflicts.length === 0,
    interactions,
    allergyConflicts,
    dosageWarnings,
    ayurvedaViruddha,
  };
}

/**
 * AI Stock Prediction & Reorder Alert
 * Predicts when pharmacy stock will run low based on prescription patterns
 */
export async function aiStockPrediction(
  medicineName: string,
  currentStock: number,
  dailyConsumption: number
): Promise<{
  daysUntilStockout: number;
  reorderNeeded: boolean;
  suggestedReorderQty: number;
  urgency: "Normal" | "Soon" | "Urgent" | "Critical";
}> {
  await aiDelay(300);

  const daysLeft = dailyConsumption > 0 ? Math.floor(currentStock / dailyConsumption) : 999;
  let urgency: "Normal" | "Soon" | "Urgent" | "Critical" = "Normal";
  if (daysLeft < 3) urgency = "Critical";
  else if (daysLeft < 7) urgency = "Urgent";
  else if (daysLeft < 14) urgency = "Soon";

  return {
    daysUntilStockout: daysLeft,
    reorderNeeded: daysLeft < 14,
    suggestedReorderQty: Math.max(dailyConsumption * 30, 100), // 30-day buffer
    urgency,
  };
}

/**
 * AI Prescription-to-Pharmacy Bridge
 * Converts doctor's prescription into pharmacy-ready order with stock verification
 */
export async function aiPrescriptionToPharmacy(
  prescription: PrescriptionMedicine[]
): Promise<{
  readyToDispense: { medicine: string; available: boolean; stock: number; substitute?: string }[];
  totalEstimatedCost: number;
  outOfStockItems: string[];
  substituteSuggestions: { original: string; substitute: string; reason: string }[];
}> {
  await aiDelay(700);

  const readyToDispense = prescription.map((med) => ({
    medicine: med.name,
    available: Math.random() > 0.2, // 80% in stock
    stock: Math.floor(Math.random() * 500) + 10,
    substitute: undefined as string | undefined,
  }));

  const outOfStock = readyToDispense.filter((m) => !m.available).map((m) => m.medicine);
  const substitutes = outOfStock.map((med) => ({
    original: med,
    substitute: `${med} (Generic equivalent)`,
    reason: "Original out of stock — generic has same composition",
  }));

  return {
    readyToDispense,
    totalEstimatedCost: prescription.length * 250, // Avg cost estimation
    outOfStockItems: outOfStock,
    substituteSuggestions: substitutes,
  };
}

// ─── BILLING MODULE AI ──────────────────────────────────────

/**
 * AI Smart Billing - Auto-generates bill based on services rendered
 * Tracks consultation + procedures + medicines + lab tests
 */
export async function aiSmartBillGeneration(
  patientId: string,
  visitId: string,
  services: { type: string; name: string; qty: number }[]
): Promise<{
  lineItems: { particular: string; qty: number; rate: number; gst: number; total: number }[];
  subtotal: number;
  gstTotal: number;
  grandTotal: number;
  discountEligible: boolean;
  discountReason?: string;
  insuranceCoverage?: number;
  paymentSuggestion: string;
}> {
  await aiDelay(600);

  const rateCard: Record<string, number> = {
    "Consultation": 200,
    "Follow-up": 100,
    "Panchakarma - Abhyanga": 800,
    "Panchakarma - Swedana": 500,
    "Panchakarma - Basti": 1200,
    "Panchakarma - Virechana": 1500,
    "Panchakarma - Nasya": 400,
    "Janu Basti": 600,
    "Kati Basti": 600,
    "Podikizhi": 700,
    "Elakizhi": 800,
    "Pizhichil": 2000,
    "Shirodhara": 1000,
    "Lab - CBC": 350,
    "Lab - ESR": 100,
    "Lab - Blood Sugar": 80,
    "Lab - HbA1c": 450,
    "Lab - Lipid Profile": 500,
    "X-ray": 300,
  };

  const lineItems = services.map((s) => {
    const rate = rateCard[s.name] ?? 200;
    const gst = s.type === "Lab" ? 0 : rate * 0.05; // 5% GST on services
    return {
      particular: s.name,
      qty: s.qty,
      rate,
      gst: gst * s.qty,
      total: (rate + gst) * s.qty,
    };
  });

  const subtotal = lineItems.reduce((s, i) => s + i.rate * i.qty, 0);
  const gstTotal = lineItems.reduce((s, i) => s + i.gst, 0);
  const grandTotal = subtotal + gstTotal;

  return {
    lineItems,
    subtotal,
    gstTotal,
    grandTotal,
    discountEligible: services.length > 3,
    discountReason: services.length > 3 ? "Package discount eligible (3+ services)" : undefined,
    insuranceCoverage: 0,
    paymentSuggestion: grandTotal > 5000 ? "Suggest EMI or split payment option" : "Standard payment",
  };
}

/**
 * AI Revenue Analytics for Patient
 * Lifetime value, payment patterns, outstanding dues
 */
export async function aiPatientRevenueAnalytics(patientId: string): Promise<{
  lifetimeValue: number;
  totalVisits: number;
  avgBillPerVisit: number;
  paymentReliability: "Excellent" | "Good" | "Fair" | "Poor";
  outstandingDues: number;
  preferredPaymentMode: string;
  nextVisitPrediction: string;
}> {
  await aiDelay(400);

  return {
    lifetimeValue: 94503,
    totalVisits: 28,
    avgBillPerVisit: 3375,
    paymentReliability: "Excellent",
    outstandingDues: 0,
    preferredPaymentMode: "Cash",
    nextVisitPrediction: "Based on patterns, next visit likely in 15-20 days for follow-up",
  };
}

// ─── CROSS-MODULE CONTEXT FLOW ──────────────────────────────

/**
 * Master AI Context Builder
 * Aggregates data from ALL modules to provide holistic patient intelligence
 * This is the "brain" that connects Reception → Doctor → Pharmacy → Billing
 */
export async function buildMasterAIContext(
  patientId: string,
  currentModule: "reception" | "consultation" | "pharmacy" | "billing" | "discharge"
): Promise<AICrossModuleContext & {
  moduleSpecificSuggestions: string[];
  patientJourneySummary: string;
  nextBestAction: string;
  riskAlerts: string[];
}> {
  await aiDelay(800);

  const baseContext: AICrossModuleContext = {
    receptionNotes: "Patient checked in. Vitals recorded. No acute distress.",
    triageLevel: "Green",
    vitalsAlert: [],
    drugInteractions: [],
    allergyAlerts: [],
    pendingInvestigations: ["HbA1c due (last done 3 months ago)"],
    insuranceEligibility: false,
    predictedBillAmount: 1500,
    pharmacyStockAlert: [],
    followUpDueAlerts: ["Review due from last prescription (30 days ago)"],
  };

  let suggestions: string[] = [];
  let journeySummary = "";
  let nextAction = "";
  let riskAlerts: string[] = [];

  switch (currentModule) {
    case "reception":
      suggestions = [
        "This is a returning patient — last visit 10 days ago for hip pain",
        "Patient has active Panchakarma treatment plan in progress",
        "Outstanding balance: ₹0 — all bills cleared",
        "AI recommends: Check vitals (BP was borderline last visit)",
      ];
      journeySummary = "Regular patient since 2023. 28 visits. Active treatment for Sandhivata.";
      nextAction = "Record vitals → Route to Dr. Mohamad Saleem → Panchakarma dept";
      break;

    case "consultation":
      suggestions = [
        "Previous diagnosis: Sandhivata (OA Knee bilateral)",
        "Last Rx: Yogaraja Guggulu + Rasnasaptakam Kashayam (30 days)",
        "Patient reports improvement in morning stiffness (from history)",
        "Suggest: Review X-ray comparison, consider tapering Guggulu",
        "AI recommends: Continue Shamana phase, add Rasayana",
      ];
      journeySummary = "Phase 3 (Shamana) of 3-phase protocol. Good compliance. Pain 4/10 → 2/10.";
      nextAction = "Update case sheet → Write prescription → Schedule next Panchakarma review";
      riskAlerts = ["HbA1c overdue — request lab test", "Age 65 — monitor BP at each visit"];
      break;

    case "pharmacy":
      suggestions = [
        "Prescription contains 5 medicines — all in stock",
        "Patient's preferred packaging: 30-day supply",
        "No drug interactions detected with current medications",
        "AI suggests: Include Triphala Churna (complementary for Sandhivata)",
        "Reminder: Set refill reminder for Day 25",
      ];
      journeySummary = "Dispensing regular monthly medications. Patient prefers branded AVN/Alshifa.";
      nextAction = "Verify stock → Dispense → Set refill reminder → Generate pharmacy bill";
      break;

    case "billing":
      suggestions = [
        "Consultation fee: ₹200 (follow-up rate)",
        "Total with pharmacy: Estimated ₹3,500-4,000",
        "Patient always pays cash — no credit needed",
        "Package discount applicable: 3+ Panchakarma sessions this month",
        "Print consolidated bill for insurance claim preparation",
      ];
      journeySummary = "Lifetime value: ₹94,503. Payment reliability: Excellent. All dues cleared.";
      nextAction = "Generate consolidated bill → Apply package discount → Collect payment → Print receipt";
      break;

    case "discharge":
      suggestions = [
        "IP stay: 7 days. All procedures completed as planned.",
        "Condition improved: Pain score 8→3, ROM improved",
        "Generate discharge summary with medication chart",
        "Schedule follow-up: 15 days post-discharge",
        "Share Pathya-Apathya (do's and don'ts) via WhatsApp",
      ];
      journeySummary = "Successful IP admission for intensive Panchakarma. All vitals stable at discharge.";
      nextAction = "Complete discharge summary → Final billing → Set follow-up reminder → Send care plan";
      break;
  }

  return {
    ...baseContext,
    moduleSpecificSuggestions: suggestions,
    patientJourneySummary: journeySummary,
    nextBestAction: nextAction,
    riskAlerts,
  };
}

/**
 * AI Follow-up Intelligence
 * Determines when and why a patient should return
 */
export async function aiFollowUpIntelligence(
  patientId: string,
  lastVisitDate: string,
  diagnosis: string,
  treatmentPhase: string
): Promise<{
  suggestedFollowUpDate: string;
  reason: string;
  priority: "Routine" | "Important" | "Urgent";
  reminderChannels: ("SMS" | "WhatsApp" | "Call" | "App")[];
  testsToOrder: string[];
}> {
  await aiDelay(400);

  const lastVisit = new Date(lastVisitDate);
  const followUp = new Date(lastVisit);
  followUp.setDate(followUp.getDate() + 15); // Default 15 days

  return {
    suggestedFollowUpDate: followUp.toISOString().slice(0, 10),
    reason: `Review ${diagnosis} treatment progress. Currently in ${treatmentPhase}.`,
    priority: "Important",
    reminderChannels: ["WhatsApp", "SMS"],
    testsToOrder: ["ESR", "CRP"],
  };
}

/**
 * AI Patient Compliance Tracker
 * Monitors medication adherence and appointment attendance
 */
export async function aiComplianceTracker(patientId: string): Promise<{
  medicationAdherence: number; // percentage
  appointmentAttendance: number; // percentage
  lastPharmacyRefill: string;
  missedAppointments: number;
  suggestions: string[];
}> {
  await aiDelay(300);

  return {
    medicationAdherence: 85,
    appointmentAttendance: 92,
    lastPharmacyRefill: "21/07/2026",
    missedAppointments: 2,
    suggestions: [
      "Good adherence overall — reinforce importance of evening dose",
      "Patient typically delays refill by 2-3 days — set early reminder",
      "Consider simplified regimen if possible (combine BD medicines)",
    ],
  };
}
