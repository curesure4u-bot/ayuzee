import { z } from "zod";

/**
 * Zod validation schemas for all HMS hook inputs.
 * Use: const validated = billingSchema.parse(input);
 * Throws ZodError with detailed messages on invalid input.
 */

// ─── Billing ──────────────────────────────────────────────────────────────────

export const billItemSchema = z.object({
  item_type: z.enum(["service", "medicine", "investigation", "procedure", "consumable", "package"]),
  item_name: z.string().min(1, "Item name required"),
  quantity: z.number().int().positive("Quantity must be > 0"),
  unit_price: z.number().nonnegative("Price cannot be negative"),
  discount_pct: z.number().min(0).max(100).optional(),
  tax_pct: z.number().min(0).max(100).optional(),
  total: z.number().nonnegative(),
});

export const createBillSchema = z.object({
  patient_id: z.string().uuid("Invalid patient ID"),
  patient_display_id: z.string().min(1),
  patient_name: z.string().min(1, "Patient name required"),
  visit_id: z.string().uuid().optional(),
  bill_type: z.enum(["consultation", "pharmacy", "lab", "procedure", "package", "ip", "miscellaneous"]).optional(),
  items: z.array(billItemSchema).min(1, "At least one item required"),
  discount_amount: z.number().nonnegative().optional(),
  discount_reason: z.string().optional(),
  payment_mode: z.enum(["cash", "card", "upi", "online", "cheque", "insurance", "wallet", "credit", "split"]),
  payment_reference: z.string().optional(),
  doctor_name: z.string().optional(),
  department: z.string().optional(),
  branch: z.string().optional(),
});

// ─── Prescription ─────────────────────────────────────────────────────────────

export const prescriptionItemSchema = z.object({
  medicine_name: z.string().min(1, "Medicine name required"),
  generic_name: z.string().optional(),
  medicine_type: z.enum(["internal", "external", "procedure", "investigation"]).optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  duration_days: z.number().int().positive().optional(),
  route: z.enum(["oral", "topical", "nasal", "rectal", "injectable", "inhalation", "sublingual", "other"]).optional(),
  timing: z.string().optional(),
  anupana: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  instructions: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  patient_id: z.string().uuid("Invalid patient ID"),
  patient_display_id: z.string().min(1),
  patient_name: z.string().min(1, "Patient name required"),
  doctor_name: z.string().min(1, "Doctor name required"),
  visit_id: z.string().uuid().optional(),
  diagnosis: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, "At least one medicine required"),
  follow_up_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format: YYYY-MM-DD").optional(),
  special_instructions: z.string().optional(),
  diet_instructions: z.string().optional(),
  branch: z.string().optional(),
});

// ─── Appointment ──────────────────────────────────────────────────────────────

export const bookAppointmentSchema = z.object({
  patient_name: z.string().min(1, "Patient name required"),
  patient_phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit Indian mobile required").optional(),
  doctor_name: z.string().min(1, "Doctor name required"),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format: YYYY-MM-DD").refine((d) => new Date(d) >= new Date(new Date().toISOString().slice(0, 10)), "Cannot book in the past"),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Time format: HH:MM"),
  consultation_type: z.enum(["in_person", "teleconsult", "follow_up", "emergency"]).optional(),
  chief_complaint: z.string().max(500).optional(),
  branch: z.string().optional(),
});

// ─── Lab Order ────────────────────────────────────────────────────────────────

export const labTestSchema = z.object({
  test_name: z.string().min(1, "Test name required"),
  test_code: z.string().optional(),
  sample_type: z.string().optional(),
});

export const createLabOrderSchema = z.object({
  patient_id: z.string().uuid("Invalid patient ID"),
  patient_display_id: z.string().min(1),
  patient_name: z.string().min(1, "Patient name required"),
  ordered_by_name: z.string().min(1, "Doctor name required"),
  priority: z.enum(["routine", "urgent", "stat"]).optional(),
  tests: z.array(labTestSchema).min(1, "At least one test required"),
  branch: z.string().optional(),
});

// ─── Patient Registration ─────────────────────────────────────────────────────

export const patientRegistrationSchema = z.object({
  first_name: z.string().min(1, "First name required").max(100),
  last_name: z.string().max(100).optional(),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit Indian mobile required"),
  gender: z.enum(["Male", "Female", "Other"]),
  age_years: z.number().int().min(0).max(150).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  email: z.string().email().optional().or(z.literal("")),
  blood_group: z.string().optional(),
});

// ─── IPD Admission ────────────────────────────────────────────────────────────

export const admitPatientSchema = z.object({
  patient_id: z.string().uuid(),
  patient_display_id: z.string().min(1),
  patient_name: z.string().min(1),
  ward_id: z.string().uuid("Select a ward"),
  bed_id: z.string().uuid("Select a bed"),
  ward_name: z.string().min(1),
  bed_number: z.string().min(1),
  admitting_doctor: z.string().min(1, "Admitting doctor required"),
  diagnosis: z.string().optional(),
  reason_for_admission: z.string().optional(),
  advance_amount: z.number().nonnegative().optional(),
  branch: z.string().optional(),
});

// ─── GRN ──────────────────────────────────────────────────────────────────────

export const grnItemSchema = z.object({
  product_name: z.string().min(1, "Product name required"),
  batch_number: z.string().min(1, "Batch number required"),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format: YYYY-MM-DD").refine((d) => new Date(d) > new Date(), "Expiry must be in the future"),
  received_qty: z.number().int().positive("Quantity must be > 0"),
  purchase_rate: z.number().positive("Rate must be > 0"),
  free_qty: z.number().int().nonnegative().optional(),
  mrp: z.number().nonnegative().optional(),
});

export const createGrnSchema = z.object({
  supplier_name: z.string().min(1, "Supplier name required"),
  supplier_invoice_no: z.string().optional(),
  items: z.array(grnItemSchema).min(1, "At least one item required"),
  branch: z.string().optional(),
});

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Validate input and return clean data or throw formatted error.
 * Usage: const data = validate(createBillSchema, rawInput);
 */
export function validate<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const firstError = result.error.errors[0];
    throw new Error(firstError?.message || "Validation failed");
  }
  return result.data;
}
