/**
 * Ayuzee MCP Server Service
 * Model Context Protocol — Exposes EMR tools for AI assistants
 * Inspired by Eka.care's 20+ MCP tools
 *
 * This defines the tool schemas that AI clients can discover and invoke.
 * In production, these would be served via a remote MCP endpoint.
 */

export interface McpTool {
  name: string;
  description: string;
  category: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface McpToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  execution_time_ms: number;
}

/**
 * All available MCP tools for the Ayuzee Health OS
 */
export const ayuzeeMcpTools: McpTool[] = [
  // Patient Management
  {
    name: "search_patients",
    description: "Search patients by name, mobile number, email, or UHID",
    category: "patient_management",
    inputSchema: { type: "object", properties: { query: { type: "string", description: "Search term (name, phone, email, or UHID)" }, limit: { type: "number", default: 10 } }, required: ["query"] },
  },
  {
    name: "get_patient_details",
    description: "Get complete patient profile including demographics, medical history, and active prescriptions",
    category: "patient_management",
    inputSchema: { type: "object", properties: { patient_id: { type: "string" } }, required: ["patient_id"] },
  },
  {
    name: "add_patient",
    description: "Register a new patient in the system",
    category: "patient_management",
    inputSchema: { type: "object", properties: { name: { type: "string" }, mobile: { type: "string" }, email: { type: "string" }, dob: { type: "string" }, gender: { type: "string" } }, required: ["name", "mobile"] },
  },
  // Appointments
  {
    name: "get_available_slots",
    description: "Check doctor availability and open appointment slots",
    category: "appointments",
    inputSchema: { type: "object", properties: { doctor_id: { type: "string" }, date: { type: "string", format: "date" }, clinic_id: { type: "string" } }, required: ["doctor_id", "date"] },
  },
  {
    name: "book_appointment",
    description: "Book an appointment for a patient with a specific doctor",
    category: "appointments",
    inputSchema: { type: "object", properties: { patient_id: { type: "string" }, doctor_id: { type: "string" }, slot_time: { type: "string", format: "date-time" }, clinic_id: { type: "string" }, type: { type: "string", enum: ["consultation", "follow_up", "panchakarma", "teleconsult"] } }, required: ["patient_id", "doctor_id", "slot_time"] },
  },
  {
    name: "reschedule_appointment",
    description: "Reschedule an existing appointment to a new time slot",
    category: "appointments",
    inputSchema: { type: "object", properties: { appointment_id: { type: "string" }, new_slot_time: { type: "string", format: "date-time" } }, required: ["appointment_id", "new_slot_time"] },
  },
  {
    name: "cancel_appointment",
    description: "Cancel an appointment with optional reason",
    category: "appointments",
    inputSchema: { type: "object", properties: { appointment_id: { type: "string" }, reason: { type: "string" } }, required: ["appointment_id"] },
  },
  {
    name: "get_appointments",
    description: "List appointments filtered by patient, doctor, or date",
    category: "appointments",
    inputSchema: { type: "object", properties: { patient_id: { type: "string" }, doctor_id: { type: "string" }, date: { type: "string" }, status: { type: "string" } } },
  },
  // Prescriptions
  {
    name: "get_prescriptions",
    description: "Get prescriptions for a patient (active or historical)",
    category: "prescriptions",
    inputSchema: { type: "object", properties: { patient_id: { type: "string" }, status: { type: "string", enum: ["active", "completed", "all"] } }, required: ["patient_id"] },
  },
  // AYUSH Formulary
  {
    name: "search_formulary",
    description: "Search AYUSH classical formulations by name, ingredient, or indication",
    category: "formulary",
    inputSchema: { type: "object", properties: { query: { type: "string" }, system: { type: "string", enum: ["ayurveda", "siddha", "unani", "homeopathy"] }, indication: { type: "string" } }, required: ["query"] },
  },
  {
    name: "get_formulation_details",
    description: "Get complete details of an AYUSH formulation including ingredients, dosage, and indications",
    category: "formulary",
    inputSchema: { type: "object", properties: { formulation_id: { type: "string" } }, required: ["formulation_id"] },
  },
  // Medications
  {
    name: "search_medications",
    description: "Search medicines by name, get dosage forms, manufacturers, interactions",
    category: "medications",
    inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  },
  {
    name: "check_drug_interactions",
    description: "Check interactions between multiple medicines (including herb-drug)",
    category: "medications",
    inputSchema: { type: "object", properties: { medications: { type: "array", items: { type: "string" } } }, required: ["medications"] },
  },
  // Vitals
  {
    name: "get_patient_vitals",
    description: "Get patient's latest or historical vitals (BP, sugar, SpO2, etc.)",
    category: "vitals",
    inputSchema: { type: "object", properties: { patient_id: { type: "string" }, vital_type: { type: "string" }, days: { type: "number", default: 30 } }, required: ["patient_id"] },
  },
  {
    name: "record_vitals",
    description: "Record patient vitals from device or manual entry",
    category: "vitals",
    inputSchema: { type: "object", properties: { patient_id: { type: "string" }, vital_type: { type: "string" }, value: { type: "number" }, unit: { type: "string" }, context: { type: "string" } }, required: ["patient_id", "vital_type", "value", "unit"] },
  },
  // Lab
  {
    name: "get_lab_reports",
    description: "Get patient lab reports and test results",
    category: "lab",
    inputSchema: { type: "object", properties: { patient_id: { type: "string" }, test_name: { type: "string" } }, required: ["patient_id"] },
  },
  // ABDM
  {
    name: "verify_abha",
    description: "Verify a patient using their ABHA ID or number",
    category: "abdm",
    inputSchema: { type: "object", properties: { abha_id: { type: "string" } }, required: ["abha_id"] },
  },
  // Clinic
  {
    name: "get_doctor_profile",
    description: "Get doctor details, qualifications, and specializations",
    category: "clinic",
    inputSchema: { type: "object", properties: { doctor_id: { type: "string" } }, required: ["doctor_id"] },
  },
  {
    name: "search_doctors",
    description: "Find doctors by name, specialty, or availability",
    category: "clinic",
    inputSchema: { type: "object", properties: { query: { type: "string" }, specialty: { type: "string" } }, required: ["query"] },
  },
  {
    name: "get_clinic_services",
    description: "List services offered by a clinic including pricing",
    category: "clinic",
    inputSchema: { type: "object", properties: { clinic_id: { type: "string" } }, required: ["clinic_id"] },
  },
];

/**
 * Execute an MCP tool (simulated — in production connects to Supabase)
 */
export async function executeMcpTool(toolName: string, params: Record<string, unknown>): Promise<McpToolResult> {
  const startTime = Date.now();
  await new Promise(r => setTimeout(r, 200 + Math.random() * 300));

  const tool = ayuzeeMcpTools.find(t => t.name === toolName);
  if (!tool) {
    return { success: false, error: `Tool "${toolName}" not found`, execution_time_ms: Date.now() - startTime };
  }

  // Simulated responses
  const responses: Record<string, unknown> = {
    search_patients: { results: [{ id: "pat_001", name: "Rajesh Kumar", mobile: "+919876543210", uhid: "AYU-2026-00142" }], total: 1 },
    get_patient_details: { id: "pat_001", name: "Rajesh Kumar", age: 41, gender: "Male", prakriti: "Vata-Pitta", active_medications: 3, last_visit: "2026-07-28" },
    get_available_slots: { doctor: "Dr. Saleem", date: params.date, slots: ["09:00", "09:30", "10:00", "11:00", "11:30", "14:00", "14:30", "15:00"] },
    book_appointment: { appointment_id: "apt_new_001", status: "confirmed", time: params.slot_time, patient_notified: true },
    search_formulary: { results: [{ id: "form_001", name: "Dashamoolarishtam", system: "Ayurveda", reference: "AFI Part-I", indications: ["Vataroga", "Shoola"] }] },
    search_medications: { results: [{ name: "Ashwagandha Churna", type: "AYUSH", manufacturer: "Arya Vaidya Sala", forms: ["Churna", "Tablet", "Capsule"] }] },
    get_patient_vitals: { patient_id: params.patient_id, latest: { bp: "128/82", heart_rate: 72, spo2: 97, blood_sugar: 142 } },
  };

  return {
    success: true,
    data: responses[toolName] || { message: `Tool ${toolName} executed successfully`, params },
    execution_time_ms: Date.now() - startTime,
  };
}
