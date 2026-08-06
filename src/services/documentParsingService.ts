/**
 * Medical Document Parsing Service
 * Handles upload, AI extraction, and structured data normalization
 * Similar to Eka.care's Medical Document Parsing API
 */

export interface ParsedLabValue {
  test_name: string;
  parameter_name: string;
  value: number | null;
  value_text: string;
  unit: string;
  normal_range_min: number | null;
  normal_range_max: number | null;
  normal_range_text: string;
  is_abnormal: boolean;
  is_critical: boolean;
  loinc_code?: string;
}

export interface ParsedMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
  is_ayush: boolean;
  formulation_type?: string;
}

export interface ParsedDiagnosis {
  name: string;
  icd_code?: string;
  type: "primary" | "secondary" | "provisional";
  notes?: string;
}

export interface DocumentParseResult {
  document_type: string;
  document_date: string | null;
  issuing_facility: string | null;
  issuing_doctor: string | null;
  confidence_score: number;
  extracted_text: string;
  lab_values: ParsedLabValue[];
  medications: ParsedMedication[];
  diagnoses: ParsedDiagnosis[];
  vitals: Record<string, string | number>;
  procedures: string[];
  summary: string;
}

/**
 * Simulate AI document parsing (in production, this calls GPT-4 Vision or similar)
 * Accepts base64 image or PDF URL, returns structured medical data
 */
export async function parseMedialDocument(
  fileUrl: string,
  fileType: string
): Promise<DocumentParseResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // In production, this would call:
  // 1. OCR service (Tesseract/Google Vision/AWS Textract) for text extraction
  // 2. AI model (GPT-4V/Claude) for structured data extraction
  // 3. LOINC/SNOMED mapping service for code assignment

  // Return simulated result for demo
  if (fileType === "lab_report" || fileUrl.includes("lab")) {
    return simulateLabReport();
  } else if (fileType === "prescription" || fileUrl.includes("rx")) {
    return simulatePrescription();
  } else {
    return simulateGenericDocument();
  }
}

function simulateLabReport(): DocumentParseResult {
  return {
    document_type: "lab_report",
    document_date: "2026-07-25",
    issuing_facility: "SRL Diagnostics, Chennai",
    issuing_doctor: "Dr. Pathologist",
    confidence_score: 94.5,
    extracted_text: "Complete Blood Count (CBC)\nHemoglobin: 12.8 g/dL\nWBC: 7200 /cumm\nPlatelet: 250000 /cumm\nRBC: 4.5 million/cumm\nESR: 18 mm/hr...",
    lab_values: [
      { test_name: "CBC", parameter_name: "Hemoglobin", value: 12.8, value_text: "12.8", unit: "g/dL", normal_range_min: 12.0, normal_range_max: 16.0, normal_range_text: "12.0-16.0", is_abnormal: false, is_critical: false, loinc_code: "718-7" },
      { test_name: "CBC", parameter_name: "WBC Count", value: 7200, value_text: "7200", unit: "/cumm", normal_range_min: 4000, normal_range_max: 11000, normal_range_text: "4000-11000", is_abnormal: false, is_critical: false, loinc_code: "6690-2" },
      { test_name: "CBC", parameter_name: "Platelet Count", value: 250000, value_text: "2.5 Lakh", unit: "/cumm", normal_range_min: 150000, normal_range_max: 400000, normal_range_text: "1.5-4.0 Lakh", is_abnormal: false, is_critical: false, loinc_code: "777-3" },
      { test_name: "CBC", parameter_name: "ESR", value: 18, value_text: "18", unit: "mm/hr", normal_range_min: 0, normal_range_max: 15, normal_range_text: "0-15", is_abnormal: true, is_critical: false, loinc_code: "30341-2" },
      { test_name: "Lipid Profile", parameter_name: "Total Cholesterol", value: 220, value_text: "220", unit: "mg/dL", normal_range_min: 0, normal_range_max: 200, normal_range_text: "<200", is_abnormal: true, is_critical: false, loinc_code: "2093-3" },
      { test_name: "Lipid Profile", parameter_name: "LDL", value: 145, value_text: "145", unit: "mg/dL", normal_range_min: 0, normal_range_max: 100, normal_range_text: "<100", is_abnormal: true, is_critical: false, loinc_code: "2089-1" },
    ],
    medications: [],
    diagnoses: [],
    vitals: {},
    procedures: [],
    summary: "CBC mostly normal (mild ESR elevation suggesting inflammation). Lipid profile shows elevated total cholesterol and LDL — lifestyle modification and possible treatment recommended.",
  };
}

function simulatePrescription(): DocumentParseResult {
  return {
    document_type: "prescription",
    document_date: "2026-07-28",
    issuing_facility: "Apollo Clinic, Tirunelveli",
    issuing_doctor: "Dr. Ramesh Kumar",
    confidence_score: 91.2,
    extracted_text: "Rx\n1. Tab Amlodipine 5mg OD x 30 days\n2. Dashamoolarishtam 15ml BD x 15 days\n3. Ashwagandha Churna 3g BD x 30 days...",
    lab_values: [],
    medications: [
      { name: "Amlodipine 5mg", dosage: "5mg", frequency: "Once daily", duration: "30 days", route: "Oral", instructions: "Take in morning", is_ayush: false },
      { name: "Dashamoolarishtam", dosage: "15ml", frequency: "Twice daily (BD)", duration: "15 days", route: "Oral", instructions: "After food with equal water", is_ayush: true, formulation_type: "Arishtam" },
      { name: "Ashwagandha Churna", dosage: "3g", frequency: "Twice daily (BD)", duration: "30 days", route: "Oral", instructions: "With warm milk or honey", is_ayush: true, formulation_type: "Churna" },
    ],
    diagnoses: [
      { name: "Essential Hypertension", icd_code: "I10", type: "primary" },
      { name: "Generalized Anxiety", icd_code: "F41.1", type: "secondary" },
    ],
    vitals: { bp: "140/90", pulse: "82" },
    procedures: [],
    summary: "Prescription for hypertension management with integrated AYUSH approach. Allopathic Amlodipine for BP control combined with Ayurvedic Dashamoolarishtam (anti-inflammatory) and Ashwagandha (adaptogen for anxiety).",
  };
}

function simulateGenericDocument(): DocumentParseResult {
  return {
    document_type: "consultation_note",
    document_date: "2026-07-20",
    issuing_facility: "Unknown Clinic",
    issuing_doctor: null,
    confidence_score: 72.0,
    extracted_text: "Patient consultation notes...",
    lab_values: [],
    medications: [],
    diagnoses: [],
    vitals: {},
    procedures: [],
    summary: "General consultation note. Low confidence in extraction — manual review recommended.",
  };
}

/**
 * Classify document type from filename/content
 */
export function classifyDocumentType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("lab") || lower.includes("report") || lower.includes("test") || lower.includes("cbc") || lower.includes("lipid")) return "lab_report";
  if (lower.includes("rx") || lower.includes("prescription") || lower.includes("presc")) return "prescription";
  if (lower.includes("discharge") || lower.includes("summary")) return "discharge_summary";
  if (lower.includes("xray") || lower.includes("mri") || lower.includes("ct") || lower.includes("scan")) return "imaging_report";
  if (lower.includes("insurance") || lower.includes("policy")) return "insurance_card";
  if (lower.includes("vaccine") || lower.includes("covid") || lower.includes("cowin")) return "vaccination_certificate";
  return "other";
}
