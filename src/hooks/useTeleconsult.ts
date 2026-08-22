import { supabase } from "@/integrations/supabase/client";

export type CreateTeleconsultParams = {
  patient_name: string;
  patient_phone?: string;
  doctor_name: string;
  appointment_id?: string;
  scheduled_time?: string;
  branch?: string;
};

export function useTeleconsult() {
  const createSession = async (params: CreateTeleconsultParams) => {
    const roomId = `tc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const { data, error } = await (supabase as any)
      .from("hms_teleconsult_sessions")
      .insert({
        patient_name: params.patient_name,
        doctor_name: params.doctor_name,
        room_id: roomId,
        room_url: `/consultation/${roomId}/room`,
        status: "scheduled",
        appointment_id: params.appointment_id || null,
        branch: params.branch || "Main Branch",
      })
      .select("id, room_id, room_url")
      .single();

    if (error) throw error;
    return { sessionId: data.id, roomId: data.room_id, roomUrl: data.room_url };
  };

  const doctorJoin = async (sessionId: string) => {
    const { error } = await (supabase as any)
      .from("hms_teleconsult_sessions")
      .update({
        doctor_joined_at: new Date().toISOString(),
        actual_start: new Date().toISOString(),
        status: "in_progress",
      })
      .eq("id", sessionId);
    if (error) throw error;
  };

  const patientJoin = async (sessionId: string) => {
    const { error } = await (supabase as any)
      .from("hms_teleconsult_sessions")
      .update({ patient_joined_at: new Date().toISOString() })
      .eq("id", sessionId);
    if (error) throw error;
  };

  const endSession = async (sessionId: string, prescriptionId?: string) => {
    const now = new Date().toISOString();
    const { data: session } = await (supabase as any)
      .from("hms_teleconsult_sessions")
      .select("actual_start")
      .eq("id", sessionId)
      .single();

    let durationMin = 0;
    if (session?.actual_start) {
      durationMin = Math.round((new Date(now).getTime() - new Date(session.actual_start).getTime()) / 60000);
    }

    const { error } = await (supabase as any)
      .from("hms_teleconsult_sessions")
      .update({
        actual_end: now,
        actual_duration_min: durationMin,
        prescription_id: prescriptionId || null,
        status: "completed",
      })
      .eq("id", sessionId);
    if (error) throw error;
  };

  const rateSession = async (sessionId: string, rating: number, feedback?: string) => {
    const { error } = await (supabase as any)
      .from("hms_teleconsult_sessions")
      .update({ patient_rating: rating, patient_feedback: feedback || null })
      .eq("id", sessionId);
    if (error) throw error;
  };

  const getTodaySessions = async (doctorName?: string, branch = "Main Branch") => {
    let query = (supabase as any)
      .from("hms_teleconsult_sessions")
      .select("*")
      .eq("branch", branch)
      .gte("created_at", new Date().toISOString().slice(0, 10) + "T00:00:00")
      .order("created_at");

    if (doctorName) query = query.eq("doctor_name", doctorName);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  return { createSession, doctorJoin, patientJoin, endSession, rateSession, getTodaySessions };
}
