import { supabase } from "@/integrations/supabase/client";

export type EnrollPkParams = {
  patient_id: string;
  patient_display_id: string;
  patient_name: string;
  package_id?: string;
  package_name: string;
  prescribing_doctor: string;
  start_date: string;
  total_sessions: number;
  pain_score_before?: number;
  odi_before?: number;
  total_amount?: number;
  branch?: string;
};

export type RecordSessionParams = {
  enrollment_id: string;
  patient_id: string;
  session_number: number;
  therapy_name: string;
  therapy_type?: "external" | "internal" | "procedure" | "poorvakarma" | "pradhana" | "paschath";
  therapist_name?: string;
  room?: string;
  oil_used?: string;
  oil_quantity_ml?: number;
  herbs_used?: string;
  materials_notes?: string;
  pain_before?: number;
  pain_after?: number;
  bp_before?: string;
  bp_after?: string;
  patient_response?: string;
  observations?: string;
  adverse_reactions?: string;
  duration_min?: number;
  branch?: string;
};

export function usePanchakarma() {
  const enrollPatient = async (params: EnrollPkParams) => {
    const endDate = new Date(params.start_date);
    endDate.setDate(endDate.getDate() + params.total_sessions - 1);

    const { data, error } = await (supabase as any)
      .from("hms_pk_enrollments")
      .insert({
        patient_id: params.patient_id,
        patient_display_id: params.patient_display_id,
        patient_name: params.patient_name,
        package_id: params.package_id || null,
        package_name: params.package_name,
        prescribing_doctor: params.prescribing_doctor,
        start_date: params.start_date,
        end_date: endDate.toISOString().slice(0, 10),
        total_sessions: params.total_sessions,
        pain_score_before: params.pain_score_before || null,
        odi_before: params.odi_before || null,
        total_amount: params.total_amount || 0,
        branch: params.branch || "Main Branch",
      })
      .select("id")
      .single();

    if (error) throw error;
    return { enrollmentId: data.id };
  };

  const recordSession = async (params: RecordSessionParams) => {
    const { data, error } = await (supabase as any)
      .from("hms_pk_sessions")
      .insert({
        enrollment_id: params.enrollment_id,
        patient_id: params.patient_id,
        session_number: params.session_number,
        session_date: new Date().toISOString().slice(0, 10),
        therapy_name: params.therapy_name,
        therapy_type: params.therapy_type || "external",
        start_time: new Date().toISOString(),
        end_time: params.duration_min
          ? new Date(Date.now() + params.duration_min * 60000).toISOString()
          : null,
        duration_min: params.duration_min || null,
        therapist_name: params.therapist_name || null,
        room: params.room || null,
        oil_used: params.oil_used || null,
        oil_quantity_ml: params.oil_quantity_ml || null,
        herbs_used: params.herbs_used || null,
        materials_notes: params.materials_notes || null,
        pain_before: params.pain_before ?? null,
        pain_after: params.pain_after ?? null,
        bp_before: params.bp_before || null,
        bp_after: params.bp_after || null,
        patient_response: params.patient_response || null,
        observations: params.observations || null,
        adverse_reactions: params.adverse_reactions || null,
        status: "completed",
        branch: params.branch || "Main Branch",
      })
      .select("id")
      .single();

    if (error) throw error;

    // Update enrollment completed sessions count
    const { data: enrollment } = await (supabase as any)
      .from("hms_pk_enrollments")
      .select("completed_sessions, total_sessions")
      .eq("id", params.enrollment_id)
      .single();

    if (enrollment) {
      const newCompleted = (enrollment.completed_sessions || 0) + 1;
      const updateData: Record<string, any> = {
        completed_sessions: newCompleted,
        updated_at: new Date().toISOString(),
      };
      // Auto-complete enrollment if all sessions done
      if (newCompleted >= enrollment.total_sessions) {
        updateData.status = "completed";
        // Store final pain score
        if (params.pain_after !== undefined) {
          updateData.pain_score_after = params.pain_after;
        }
      }
      await (supabase as any)
        .from("hms_pk_enrollments")
        .update(updateData)
        .eq("id", params.enrollment_id);
    }

    return { sessionId: data.id };
  };

  const getActiveEnrollments = async (branch = "Main Branch") => {
    const { data, error } = await (supabase as any)
      .from("hms_pk_enrollments")
      .select("*")
      .eq("status", "active")
      .eq("branch", branch)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const getSessionsForEnrollment = async (enrollmentId: string) => {
    const { data, error } = await (supabase as any)
      .from("hms_pk_sessions")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .order("session_number");

    if (error) throw error;
    return data || [];
  };

  const getTodaySessions = async (branch = "Main Branch") => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await (supabase as any)
      .from("hms_pk_sessions")
      .select("*, hms_pk_enrollments(patient_name, package_name)")
      .eq("session_date", today)
      .eq("branch", branch)
      .order("start_time");

    if (error) throw error;
    return data || [];
  };

  const getPackages = async (branch = "Main Branch") => {
    const { data, error } = await (supabase as any)
      .from("hms_pk_packages")
      .select("*")
      .eq("is_active", true)
      .eq("branch", branch)
      .order("price");

    if (error) throw error;
    return data || [];
  };

  return { enrollPatient, recordSession, getActiveEnrollments, getSessionsForEnrollment, getTodaySessions, getPackages };
}
