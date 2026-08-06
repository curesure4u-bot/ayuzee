/**
 * Ayuzee ↔ AYUSH HMS Bridge Service
 * Handles data synchronization between the Ayuzee aggregator platform
 * and the standalone AYUSH HMS clinic management tool.
 */
import { supabase } from "@/integrations/supabase/client";

export type BridgeType =
  | "appointment"
  | "patient"
  | "doctor"
  | "prescription_order"
  | "stock_product"
  | "lab_report"
  | "review_feedback"
  | "treatment_outcome";

export type SyncStatus = "pending" | "synced" | "failed" | "conflict";
export type SyncDirection = "ayuzee_to_hms" | "hms_to_ayuzee" | "bidirectional";

export interface BridgeRecord {
  id: string;
  bridge_type: BridgeType;
  ayuzee_id: string;
  hms_id: string | null;
  sync_status: SyncStatus;
  sync_direction: SyncDirection;
  last_synced_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface BridgeConfig {
  id: string;
  clinic_name: string | null;
  sync_appointments: boolean;
  sync_prescriptions: boolean;
  sync_stock: boolean;
  sync_lab_reports: boolean;
  sync_patient_profiles: boolean;
  sync_reviews: boolean;
  sync_treatment_outcomes: boolean;
  auto_queue_online_bookings: boolean;
  auto_push_prescription_to_shop: boolean;
  auto_trigger_review_after_visit: boolean;
  stock_visibility_public: boolean;
  is_active: boolean;
}

export interface SyncStats {
  total: number;
  synced: number;
  pending: number;
  failed: number;
  conflict: number;
}

// ─── BRIDGE CONFIG ──────────────────────────────────────────────────────────

/** Get or create bridge config for current user's clinic */
export async function getBridgeConfig(): Promise<BridgeConfig | null> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) return null;

  const { data } = await supabase
    .from("ayuzee_hms_bridge_config")
    .select("*")
    .eq("owner_id", sess.session.user.id)
    .maybeSingle();

  return (data as BridgeConfig) ?? null;
}

/** Update bridge config toggles */
export async function updateBridgeConfig(updates: Partial<BridgeConfig>): Promise<boolean> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) return false;

  const { error } = await supabase
    .from("ayuzee_hms_bridge_config")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("owner_id", sess.session.user.id);

  return !error;
}

/** Initialize bridge config for a new clinic */
export async function initBridgeConfig(clinicName: string): Promise<boolean> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) return false;

  const { error } = await supabase
    .from("ayuzee_hms_bridge_config")
    .upsert({
      owner_id: sess.session.user.id,
      clinic_name: clinicName,
      is_active: true,
    });

  return !error;
}

// ─── SYNC STATS ─────────────────────────────────────────────────────────────

/** Get sync statistics grouped by type */
export async function getSyncStats(): Promise<Record<BridgeType, SyncStats>> {
  const { data } = await supabase
    .from("ayuzee_hms_bridge")
    .select("bridge_type, sync_status");

  const stats: Record<string, SyncStats> = {};
  const types: BridgeType[] = [
    "appointment", "patient", "doctor", "prescription_order",
    "stock_product", "lab_report", "review_feedback", "treatment_outcome",
  ];

  types.forEach((t) => {
    stats[t] = { total: 0, synced: 0, pending: 0, failed: 0, conflict: 0 };
  });

  ((data ?? []) as { bridge_type: string; sync_status: string }[]).forEach((row) => {
    const s = stats[row.bridge_type];
    if (!s) return;
    s.total++;
    if (row.sync_status === "synced") s.synced++;
    else if (row.sync_status === "pending") s.pending++;
    else if (row.sync_status === "failed") s.failed++;
    else if (row.sync_status === "conflict") s.conflict++;
  });

  return stats as Record<BridgeType, SyncStats>;
}

/** Get recent bridge records */
export async function getRecentBridgeRecords(limit = 50): Promise<BridgeRecord[]> {
  const { data } = await supabase
    .from("ayuzee_hms_bridge")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as BridgeRecord[];
}

// ─── SYNC OPERATIONS ────────────────────────────────────────────────────────

/** Sync a confirmed Ayuzee appointment to HMS OPD queue */
export async function syncAppointmentToHms(appointmentId: string): Promise<boolean> {
  const { data: appt } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .maybeSingle();

  if (!appt) return false;

  // Create/update bridge record
  const { error } = await supabase.from("ayuzee_hms_bridge").upsert({
    bridge_type: "appointment",
    ayuzee_id: appointmentId,
    sync_status: "synced",
    sync_direction: "ayuzee_to_hms",
    last_synced_at: new Date().toISOString(),
    metadata: {
      patient_user_id: (appt as any).user_id,
      doctor_id: (appt as any).doctor_id,
      appointment_date: (appt as any).appointment_date,
      time_slot: (appt as any).time_slot,
      mode: (appt as any).mode,
    },
  }, { onConflict: "ayuzee_id" });

  // Log the sync
  await logSync("appointment", appointmentId, "ayuzee", "hms", "sync", !error);
  return !error;
}

/** Sync HMS prescription to Ayuzee (create order suggestion for patient) */
export async function syncPrescriptionToAyuzee(
  prescriptionId: string,
  patientId: string,
  doctorId: string,
  medicines: { name: string; dosage: string; quantity: number }[]
): Promise<boolean> {
  const { error } = await supabase.from("ayuzee_hms_bridge").insert({
    bridge_type: "prescription_order",
    ayuzee_id: patientId,
    hms_id: prescriptionId,
    sync_status: "synced",
    sync_direction: "hms_to_ayuzee",
    last_synced_at: new Date().toISOString(),
    metadata: { patient_id: patientId, doctor_id: doctorId, medicines },
  });

  await logSync("prescription_order", prescriptionId, "hms", "ayuzee", "create", !error);
  return !error;
}

/** Link Ayuzee patient to HMS patient record */
export async function bridgePatient(ayuzeeUserId: string, hmsPatientId: string): Promise<boolean> {
  const { error } = await supabase.from("ayuzee_hms_bridge").upsert({
    bridge_type: "patient",
    ayuzee_id: ayuzeeUserId,
    hms_id: hmsPatientId,
    sync_status: "synced",
    sync_direction: "bidirectional",
    last_synced_at: new Date().toISOString(),
  }, { onConflict: "ayuzee_id" });

  await logSync("patient", ayuzeeUserId, "ayuzee", "hms", "sync", !error);
  return !error;
}

/** Sync HMS lab report to patient's Ayuzee dashboard */
export async function syncLabReportToAyuzee(
  reportId: string,
  patientId: string,
  reportData: { test_name: string; result_url?: string; date: string }
): Promise<boolean> {
  const { error } = await supabase.from("ayuzee_hms_bridge").insert({
    bridge_type: "lab_report",
    ayuzee_id: patientId,
    hms_id: reportId,
    sync_status: "synced",
    sync_direction: "hms_to_ayuzee",
    last_synced_at: new Date().toISOString(),
    metadata: reportData,
  });

  await logSync("lab_report", reportId, "hms", "ayuzee", "create", !error);
  return !error;
}

/** Trigger review request after HMS marks consultation complete */
export async function triggerReviewAfterVisit(
  appointmentId: string,
  patientId: string,
  doctorId: string
): Promise<boolean> {
  const { error } = await supabase.from("ayuzee_hms_bridge").insert({
    bridge_type: "review_feedback",
    ayuzee_id: appointmentId,
    sync_status: "pending",
    sync_direction: "hms_to_ayuzee",
    metadata: { patient_id: patientId, doctor_id: doctorId, action: "request_review" },
  });

  return !error;
}

/** Retry a failed sync */
export async function retrySyncRecord(bridgeId: string): Promise<boolean> {
  const { error } = await supabase
    .from("ayuzee_hms_bridge")
    .update({ sync_status: "pending", error_message: null, updated_at: new Date().toISOString() })
    .eq("id", bridgeId);

  return !error;
}

/** Mark a bridge record as resolved */
export async function resolveConflict(bridgeId: string, resolution: "keep_ayuzee" | "keep_hms"): Promise<boolean> {
  const { error } = await supabase
    .from("ayuzee_hms_bridge")
    .update({ sync_status: "synced", metadata: { resolved: resolution }, updated_at: new Date().toISOString() })
    .eq("id", bridgeId);

  await logSync("conflict", bridgeId, resolution === "keep_ayuzee" ? "ayuzee" : "hms", resolution === "keep_ayuzee" ? "hms" : "ayuzee", "conflict_resolve", !error);
  return !error;
}

// ─── INTERNAL HELPERS ───────────────────────────────────────────────────────

async function logSync(
  entityType: string,
  entityId: string,
  source: "ayuzee" | "hms",
  target: "ayuzee" | "hms",
  operation: string,
  success: boolean
): Promise<void> {
  const { data: sess } = await supabase.auth.getSession();
  await supabase.from("ayuzee_hms_sync_log").insert({
    entity_type: entityType,
    entity_id: entityId,
    source_system: source,
    target_system: target,
    operation,
    status: success ? "success" : "failed",
    performed_by: sess.session?.user.id ?? null,
  });
}

/** Get sync log history */
export async function getSyncLog(limit = 100): Promise<any[]> {
  const { data } = await supabase
    .from("ayuzee_hms_sync_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
