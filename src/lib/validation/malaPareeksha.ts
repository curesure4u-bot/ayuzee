// Client-side validation & sanitization for Mala Pareeksha submissions.
// Mirrors server-side rules (triggers + CHECK constraints) for fast UX feedback.
// Server remains the source of truth.

import { z } from "zod";

/** Strip HTML tags and dangerous control characters, trim, cap length. */
export function sanitizeText(input: unknown, maxLen = 2000): string | null {
  if (input === null || input === undefined) return null;
  let v = String(input);
  // Remove HTML tags
  v = v.replace(/<[^>]*>/g, "");
  // Remove control chars (keep \t \n \r)
  // eslint-disable-next-line no-control-regex
  v = v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  v = v.trim();
  if (!v) return null;
  if (v.length > maxLen) v = v.slice(0, maxLen);
  return v;
}

/** Recursively sanitize every string value inside a JSON-safe object. */
export function sanitizeJson<T = unknown>(value: T, depth = 0): T {
  if (depth > 8) return value; // guard against pathological nesting
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    return (sanitizeText(value, 4000) ?? "") as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 200).map((v) => sanitizeJson(v, depth + 1)) as unknown as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof k !== "string" || k.length > 80) continue;
      out[k] = sanitizeJson(v, depth + 1);
    }
    return out as unknown as T;
  }
  return value;
}

const cleanText = (max: number) =>
  z.preprocess((v) => sanitizeText(v, max), z.string().max(max).nullable().optional());

const Dosha = z.enum(["Vata", "Pitta", "Kapha", "Pitta-Kapha", "Mixed", "Balanced", "Unknown"]).nullable().optional();
const Ama = z.enum(["Low", "Moderate", "High"]).nullable().optional();
const Risk = z.enum(["normal", "observe", "attention", "urgent"]).nullable().optional();
const Gender = z.enum(["Male", "Female", "Other"]).nullable().optional();

export const MalaPayloadSchema = z.object({
  patient_user_id: z.string().uuid(),
  doctor_user_id: z.string().uuid().nullable().optional(),
  patient_name: z.preprocess((v) => sanitizeText(v, 120),
    z.string().min(1, "Patient name is required").max(120)),
  patient_age: z.number().int().min(0).max(150).nullable().optional(),
  patient_gender: z.preprocess((v) => sanitizeText(v, 20), Gender),
  patient_ref: cleanText(60),
  assessment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  stool_type: z.number().int().min(1).max(11),
  responses: z.preprocess((v) => sanitizeJson(v), z.record(z.string(), z.any())),
  analysis: z.preprocess((v) => sanitizeJson(v), z.record(z.string(), z.any())),
  dosha: z.preprocess((v) => sanitizeText(v, 30), Dosha),
  agni: cleanText(30),
  ama: z.preprocess((v) => sanitizeText(v, 20), Ama),
  risk_level: z.preprocess((v) => sanitizeText(v, 20), Risk),
  diagnosis_note: cleanText(2000),
  diet_advice: cleanText(2000),
  lifestyle_advice: cleanText(2000),
  medicines: cleanText(2000),
  panchakarma: cleanText(2000),
  followup_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid follow-up date")
    .nullable()
    .optional(),
  red_flag_warning: cleanText(500),

  // Extended clinical fields
  varna: z.enum(["yellow_brown","pale_clay","black_tarry","blood_tinged","green","other"]).nullable().optional(),
  varna_note: cleanText(300),
  akriti_bristol_type: z.number().int().min(1).max(7).nullable().optional(),
  pramana: z.enum(["scanty","normal","excessive"]).nullable().optional(),
  gandha: z.enum(["normal","foul","sour","odorless"]).nullable().optional(),
  ama_present: z.boolean().nullable().optional(),
  ama_note: cleanText(300),
  plava_pariksha: z.enum(["floats","sinks","not_observed"]).nullable().optional(),
  frequency_per_day: z.number().min(0).max(30).nullable().optional(),
  time_of_day_pattern: z.enum(["morning","afternoon","evening","irregular"]).nullable().optional(),
  associated_symptoms: z.array(z.string().max(60)).max(10).nullable().optional(),
  suggested_dosha_correlation: cleanText(120),
});

export type MalaPayload = z.infer<typeof MalaPayloadSchema>;

/** Guard for phone shapes we accept from patient info block. */
export const PhoneSchema = z
  .string()
  .regex(/^[0-9+\-\s()]{6,20}$/, "Invalid phone number")
  .optional()
  .or(z.literal(""));

/** Cap the JSON size (bytes) before sending — mirrors 32KB DB cap. */
export function withinJsonBudget(obj: unknown, maxBytes = 30000): boolean {
  try {
    return new Blob([JSON.stringify(obj)]).size <= maxBytes;
  } catch {
    return false;
  }
}
