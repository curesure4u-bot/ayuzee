import { supabase } from "@/integrations/supabase/client";

/**
 * Follow-up Reminder Engine
 * Scans prescriptions with follow_up_date that have passed without a new visit,
 * and auto-creates CRM tasks for the front desk to call/WhatsApp the patient.
 */
export function useFollowUpEngine() {
  /**
   * Scan for missed follow-ups and create CRM tasks.
   * Call this from a daily cron or manually from admin panel.
   */
  const generateFollowUpTasks = async (branch = "Main Branch") => {
    const today = new Date().toISOString().slice(0, 10);

    // Find prescriptions with follow_up_date <= today that haven't been followed up
    const { data: duePrescriptions, error } = await (supabase as any)
      .from("hms_prescriptions")
      .select("id, patient_id, patient_display_id, patient_name, doctor_name, follow_up_date, diagnosis")
      .eq("branch", branch)
      .not("follow_up_date", "is", null)
      .lte("follow_up_date", today)
      .in("status", ["active", "dispensed"]);

    if (error) throw error;

    let created = 0;
    let skipped = 0;

    for (const rx of (duePrescriptions || [])) {
      // Check if patient has visited on or after follow_up_date
      const { count: visitCount } = await (supabase as any)
        .from("hms_op_visits")
        .select("id", { count: "exact" })
        .eq("patient_id", rx.patient_id)
        .gte("visit_date", rx.follow_up_date);

      if ((visitCount || 0) > 0) {
        skipped++;
        continue; // Patient already came back
      }

      // Check if CRM task already exists for this prescription
      const { count: taskCount } = await (supabase as any)
        .from("hms_crm_tasks")
        .select("id", { count: "exact" })
        .eq("reference_id", rx.id)
        .eq("reference_type", "prescription")
        .eq("task_type", "follow_up");

      if ((taskCount || 0) > 0) {
        skipped++;
        continue; // Task already created
      }

      // Create CRM task
      await (supabase as any)
        .from("hms_crm_tasks")
        .insert({
          patient_id: rx.patient_id,
          patient_name: rx.patient_name,
          task_type: "follow_up",
          description: `Follow-up overdue for ${rx.patient_name} (${rx.patient_display_id}). Was due ${rx.follow_up_date}. Doctor: ${rx.doctor_name}. Diagnosis: ${rx.diagnosis || "—"}`,
          due_date: today,
          priority: "high",
          reference_type: "prescription",
          reference_id: rx.id,
          branch,
          status: "pending",
        });

      created++;
    }

    return { created, skipped, total: (duePrescriptions || []).length };
  };

  /**
   * Get patients who haven't returned within expected days after their last visit
   * (for clinics that don't always set follow_up_date)
   */
  const getInactivePatients = async (daysInactive = 30, branch = "Main Branch") => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const { data, error } = await (supabase as any)
      .from("hms_op_patients")
      .select("id, patient_id, first_name, last_name, mobile, last_visit_date")
      .eq("branch", branch)
      .eq("is_active", true)
      .not("last_visit_date", "is", null)
      .lte("last_visit_date", cutoffDate.toISOString().slice(0, 10))
      .order("last_visit_date", { ascending: true })
      .limit(50);

    if (error) throw error;
    return data || [];
  };

  /**
   * Create reactivation tasks for inactive patients
   */
  const createReactivationTasks = async (patientIds: string[], branch = "Main Branch") => {
    const today = new Date().toISOString().slice(0, 10);
    let created = 0;

    for (const patientId of patientIds) {
      // Get patient info
      const { data: patient } = await (supabase as any)
        .from("hms_op_patients")
        .select("first_name, last_name, mobile, patient_id, last_visit_date")
        .eq("id", patientId)
        .single();

      if (!patient) continue;

      // Check if task already exists
      const { count } = await (supabase as any)
        .from("hms_crm_tasks")
        .select("id", { count: "exact" })
        .eq("patient_id", patientId)
        .eq("task_type", "reactivation")
        .in("status", ["pending", "in_progress"]);

      if ((count || 0) > 0) continue;

      await (supabase as any)
        .from("hms_crm_tasks")
        .insert({
          patient_id: patientId,
          patient_name: `${patient.first_name} ${patient.last_name || ""}`.trim(),
          patient_phone: patient.mobile,
          task_type: "reactivation",
          description: `Patient ${patient.patient_id} last visited on ${patient.last_visit_date}. Call to check wellness and offer follow-up appointment.`,
          due_date: today,
          priority: "normal",
          branch,
          status: "pending",
        });

      created++;
    }

    return { created };
  };

  return { generateFollowUpTasks, getInactivePatients, createReactivationTasks };
}
