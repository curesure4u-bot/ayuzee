import { supabase } from "@/integrations/supabase/client";

export type StartScribeParams = {
  visit_id?: string;
  patient_id?: string;
  language?: string;
};

export function useAiScribe() {
  const startSession = async (params: StartScribeParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;

    const { data, error } = await (supabase as any)
      .from("hms_ai_scribe_sessions")
      .insert({
        visit_id: params.visit_id || null,
        patient_id: params.patient_id || null,
        doctor_user_id: uid,
        language: params.language || "en",
        status: "recording",
      })
      .select("id")
      .single();

    if (error) throw error;
    return { sessionId: data.id };
  };

  const endRecording = async (sessionId: string, transcript: string, audioUrl?: string) => {
    const { error } = await (supabase as any)
      .from("hms_ai_scribe_sessions")
      .update({
        session_end: new Date().toISOString(),
        transcript,
        audio_url: audioUrl || null,
        status: "processing",
      })
      .eq("id", sessionId);

    if (error) throw error;
  };

  const saveGeneratedNotes = async (
    sessionId: string,
    notes: { subjective: string; objective: string; assessment: string; plan: string },
    confidence?: number
  ) => {
    const { error } = await (supabase as any)
      .from("hms_ai_scribe_sessions")
      .update({
        generated_subjective: notes.subjective,
        generated_objective: notes.objective,
        generated_assessment: notes.assessment,
        generated_plan: notes.plan,
        confidence_score: confidence || null,
        status: "generated",
      })
      .eq("id", sessionId);

    if (error) throw error;
  };

  const acceptNotes = async (sessionId: string, finalNoteId?: string) => {
    const { error } = await (supabase as any)
      .from("hms_ai_scribe_sessions")
      .update({
        doctor_accepted: true,
        final_note_id: finalNoteId || null,
        status: "accepted",
      })
      .eq("id", sessionId);

    if (error) throw error;
  };

  const rejectNotes = async (sessionId: string) => {
    const { error } = await (supabase as any)
      .from("hms_ai_scribe_sessions")
      .update({ status: "rejected" })
      .eq("id", sessionId);

    if (error) throw error;
  };

  const getSessionHistory = async (limit = 20) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;

    const { data, error } = await (supabase as any)
      .from("hms_ai_scribe_sessions")
      .select("*")
      .eq("doctor_user_id", uid)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  };

  return { startSession, endRecording, saveGeneratedNotes, acceptNotes, rejectNotes, getSessionHistory };
}
