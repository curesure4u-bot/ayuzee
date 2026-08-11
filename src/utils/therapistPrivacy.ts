/**
 * Therapist Privacy Utilities
 * 
 * CRITICAL BUSINESS RULE:
 * - Therapists NEVER work independently — always under doctor's instruction
 * - Therapists should NOT see full patient identity (name, phone, email)
 * - Names are masked to first name + last initial (e.g., "Rahul S.")
 * - Phone numbers are NEVER shown to therapists
 * - Patient codes (AYZ-XXXX) used instead of identifiable info
 * - All actions require doctor instruction/approval
 * - Therapists can ONLY communicate with doctors, NOT patients directly
 * - If therapists know patient details, they may bypass the platform
 * 
 * This protects: patient privacy, platform revenue, doctor authority
 */

/**
 * Mask patient name: "Rahul Sharma" → "Rahul S."
 * "Mohammed Abdul Rahman" → "Mohammed A."
 * Single name stays as-is with asterisks: "Priya" → "Pr***"
 */
export function maskPatientName(fullName: string): string {
  if (!fullName) return "Patient";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) {
    // Single name: show first 2 chars + asterisks
    return parts[0].length > 2 ? `${parts[0].slice(0, 2)}***` : parts[0];
  }
  // Multi-word: first name + last initial
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

/**
 * Generate anonymous patient code from name/id
 * Used in progress tracker and history views
 */
export function patientCode(patientName: string, index?: number): string {
  // Simple hash-like code from name
  const hash = patientName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const code = (hash % 9000 + 1000).toString();
  return `AYZ-${code}`;
}

/**
 * Format for session display: "Session #5 | Abhyanga | Dr. Assigned"
 * Never shows patient-identifiable info in list views
 */
export function sessionLabel(therapyName: string, sessionDate: string): string {
  return `${therapyName} · ${new Date(sessionDate).toLocaleDateString()}`;
}

/**
 * Doctor instruction notice text
 */
export const DOCTOR_INSTRUCTION_NOTICE = 
  "All therapies are conducted under the prescription and supervision of the assigned Ayurvedic doctor. " +
  "Do not proceed without doctor's written instruction.";

export const PRIVACY_NOTICE = 
  "Patient identity details are protected. Contact the prescribing doctor for any patient-related queries.";

export const NO_DIRECT_CONTACT_NOTICE =
  "Direct patient contact is not permitted through this platform. " +
  "All communication must go through the prescribing doctor.";
