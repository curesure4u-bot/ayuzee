// ============================================================
// Patient AI Service - Cross-module AI Intelligence
// Provides AI-powered suggestions, analysis, and automation
// ============================================================

import type {
  AIPatientInsight,
  AIDiagnosisSuggestion,
  AIPrescriptionSuggestion,
  AICrossModuleContext,
  Patient,
  PatientVitals,
  MedicalHistory,
  PatientSearchResult,
} from "@/types/patient-hms";

// Simulate AI processing delay
const aiDelay = (ms: number = 800) => new Promise((r) => setTimeout(r, ms));

/**
 * AI-powered duplicate patient detection
 * Checks mobile, name similarity, DOB match
 */
export async function detectDuplicatePatient(
  mobile: string,
  name: string,
  dob?: string
): Promise<{ isDuplicate: boolean; matches: PatientSearchResult[]; confidence: number }> {
  await aiDelay(600);
  // In production, this would query Supabase with fuzzy matching
  // For now, simulate the response
  if (mobile === "9443314670") {
    return {
      isDuplicate: true,
      confidence: 95,
      matches: [
        {
          sNo: 1,
          id: "AL-8472",
          name: "Mr. Nagaraj 14233",
          dobAge: "05/06/1961 / 65 years",
          phone: "9443314670",
          registrationDate: "13/04/2023",
          address: "THIRUTHANGAL, Tirunelveli",
          groupTag: "SURANDAI",
        },
      ],
    };
  }
  return { isDuplicate: false, matches: [], confidence: 0 };
}

/**
 * AI-powered address auto-complete based on pincode/area
 */
export async function aiAddressAutoComplete(input: string): Promise<{
  suggestions: { area: string; city: string; district: string; state: string; zip: string }[];
}> {
  await aiDelay(400);
  // Simulated pincode lookup
  if (input.startsWith("627")) {
    return {
      suggestions: [
        { area: "THIRUTHANGAL", city: "Tirunelveli", district: "Tirunelveli", state: "Tamil Nadu", zip: "627951" },
        { area: "SURANDAI", city: "Tirunelveli", district: "Tirunelveli", state: "Tamil Nadu", zip: "627859" },
        { area: "KADAYANALLUR", city: "Tenkasi", district: "Tenkasi", state: "Tamil Nadu", zip: "627751" },
      ],
    };
  }
  return { suggestions: [] };
}

/**
 * AI-powered patient name suggestions based on partial input
 */
export async function aiNameSuggestion(partialName: string): Promise<string[]> {
  await aiDelay(300);
  const names = [
    "Nagaraj", "Nagarajan", "Nagalakshmi", "Nagammal",
    "Rajeswari", "Rajesh", "Rajendran",
    "Kalpana", "Kamala", "Kannan",
  ];
  return names.filter((n) => n.toLowerCase().startsWith(partialName.toLowerCase())).slice(0, 5);
}

/**
 * AI-powered age calculation from DOB
 */
export function calculateAge(dob: string): { years: number; months: number; days: number } {
  const birthDate = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

/**
 * AI-powered patient risk assessment based on vitals and history
 */
export async function assessPatientRisk(
  vitals?: PatientVitals,
  history?: MedicalHistory,
  age?: number
): Promise<AIPatientInsight> {
  await aiDelay(1000);
  const insights: string[] = [];
  const actions: string[] = [];
  let riskLevel: AIPatientInsight["riskLevel"] = "Low";

  if (vitals) {
    if (vitals.bloodPressure) {
      const [sys] = vitals.bloodPressure.split("/").map(Number);
      if (sys > 140) {
        insights.push("Elevated blood pressure detected — Rakta Vata Vriddhi suspected");
        actions.push("Recommend Sarpagandha Vati or Arjuna Ksheerapaka");
        riskLevel = "Medium";
      }
    }
    if (vitals.sugar && vitals.sugar > 200) {
      insights.push("High blood sugar — Prameha/Madhumeha pattern");
      actions.push("Investigate HbA1c, recommend Nisha Amalaki Churna");
      riskLevel = "High";
    }
    if (vitals.bmi && vitals.bmi > 30) {
      insights.push("Obesity indicated — Sthaulya/Medoroga");
      actions.push("Recommend Triphala Guggulu, dietary modification (Lekhana Ahara)");
    }
  }

  if (age && age > 60) {
    insights.push("Geriatric patient — Vata-dominant age, careful drug dosing required");
    actions.push("Consider Rasayana therapy for rejuvenation");
  }

  if (history?.allergies && history.allergies.length > 0) {
    insights.push(`Known allergies: ${history.allergies.join(", ")}`);
    actions.push("Cross-check all prescriptions for allergy interactions");
  }

  return {
    patientId: vitals?.patientId ?? "",
    riskLevel,
    insights: insights.length > 0 ? insights : ["Patient appears healthy with no immediate concerns"],
    suggestedActions: actions.length > 0 ? actions : ["Continue routine follow-up"],
    generatedAt: new Date().toISOString(),
  };
}

/**
 * AI-powered smart patient ID generation
 */
export function generatePatientId(locationPrefix: string, lastId: number): string {
  return `${locationPrefix}-${lastId + 1}`;
}

/**
 * AI-powered consultation fee suggestion based on visit type and doctor
 */
export async function suggestConsultationFee(
  visitType: string,
  doctorSpecialty: string,
  isFollowUp: boolean
): Promise<{ suggestedFee: number; discountEligible: boolean; reason: string }> {
  await aiDelay(300);
  let fee = 200;
  if (visitType === "Consultation") fee = isFollowUp ? 100 : 200;
  if (visitType === "OP Treatment") fee = 500;
  if (visitType === "Diagnostic") fee = 300;
  if (visitType === "Procedure") fee = 1500;

  return {
    suggestedFee: fee,
    discountEligible: isFollowUp,
    reason: isFollowUp
      ? "Follow-up visit — 50% discount applicable per policy"
      : `Standard ${doctorSpecialty} consultation fee`,
  };
}

/**
 * AI-powered source attribution tracking
 */
export function getSourceOptions(): { value: string; label: string }[] {
  return [
    { value: "walk_in", label: "Walk-In" },
    { value: "family", label: "Family" },
    { value: "friend", label: "Friend/Referral" },
    { value: "google", label: "Google Search" },
    { value: "social_media", label: "Social Media" },
    { value: "newspaper", label: "Newspaper" },
    { value: "tv", label: "TV Advertisement" },
    { value: "doctor_referral", label: "Doctor Referral" },
    { value: "patient_referral", label: "Patient Referral" },
    { value: "online_booking", label: "Online Booking" },
    { value: "camp", label: "Health Camp" },
    { value: "other", label: "Other" },
  ];
}

/**
 * AI-powered cross-module context builder
 * Aggregates data from reception, pharmacy, lab, and billing
 */
export async function buildCrossModuleContext(patientId: string): Promise<AICrossModuleContext> {
  await aiDelay(500);
  return {
    receptionNotes: "Patient arrived on time. No special requirements.",
    triageLevel: "Green",
    vitalsAlert: [],
    drugInteractions: [],
    allergyAlerts: [],
    pendingInvestigations: [],
    insuranceEligibility: false,
    predictedBillAmount: 200,
    pharmacyStockAlert: [],
    followUpDueAlerts: [],
  };
}

/**
 * AI-powered smart search with fuzzy matching
 */
export async function aiSmartSearch(
  query: string
): Promise<{ type: "id" | "name" | "phone"; confidence: number; suggestion: string }> {
  await aiDelay(200);
  // Detect query type
  if (/^[A-Z]{2,}-\d+$/i.test(query)) {
    return { type: "id", confidence: 99, suggestion: "Searching by Patient ID" };
  }
  if (/^\d{10}$/.test(query)) {
    return { type: "phone", confidence: 99, suggestion: "Searching by mobile number" };
  }
  if (/^\d+$/.test(query) && query.length < 10) {
    return { type: "id", confidence: 80, suggestion: "Partial ID match — showing possible results" };
  }
  return { type: "name", confidence: 90, suggestion: "Searching by patient name" };
}

/**
 * Indian states list for address forms
 */
export function getIndianStates(): string[] {
  return [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
  ];
}
