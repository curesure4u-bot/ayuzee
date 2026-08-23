import { supabase } from "@/integrations/supabase/client";

/**
 * Flag 40: Patient Feedback & NPS Scoring
 *
 * Captures patient feedback, calculates NPS (Net Promoter Score),
 * and alerts on low scores.
 */

export interface SubmitFeedbackParams {
  patient_id?: string;
  patient_name: string;
  visit_id?: string;
  doctor_name?: string;
  // NPS question: "How likely are you to recommend us?" (0-10)
  nps_score: number;
  // Individual ratings (1-5)
  rating_overall?: number;
  rating_doctor?: number;
  rating_staff?: number;
  rating_facility?: number;
  rating_wait_time?: number;
  // Open feedback
  feedback_text?: string;
  would_return?: boolean;
  branch?: string;
}

export interface NpsResult {
  totalResponses: number;
  promoters: number; // 9-10
  passives: number; // 7-8
  detractors: number; // 0-6
  npsScore: number; // (promoters% - detractors%)
  avgOverall: number;
  avgDoctor: number;
  recentLowScores: { patient_name: string; nps_score: number; feedback_text: string | null; created_at: string }[];
}

export function usePatientFeedback() {
  const submitFeedback = async (params: SubmitFeedbackParams) => {
    const { data, error } = await (supabase as any)
      .from("hms_patient_feedback")
      .insert({
        patient_name: params.patient_name,
        patient_id: params.patient_id || null,
        visit_id: params.visit_id || null,
        doctor_name: params.doctor_name || null,
        nps_score: params.nps_score,
        rating_overall: params.rating_overall || null,
        rating_doctor: params.rating_doctor || null,
        rating_staff: params.rating_staff || null,
        rating_facility: params.rating_facility || null,
        rating_wait_time: params.rating_wait_time || null,
        feedback_text: params.feedback_text || null,
        would_return: params.would_return ?? null,
        branch: params.branch || "Main Branch",
      })
      .select("id")
      .single();

    if (error) throw error;

    // If low NPS (detractor: 0-6), create alert CRM task
    if (params.nps_score <= 6) {
      try {
        await (supabase as any)
          .from("hms_crm_tasks")
          .insert({
            patient_name: params.patient_name,
            patient_id: params.patient_id || null,
            task_type: "feedback",
            description: `⚠️ Low NPS (${params.nps_score}/10) from ${params.patient_name}. Feedback: "${params.feedback_text || "No comment"}". Doctor: ${params.doctor_name || "—"}. Needs manager follow-up.`,
            due_date: new Date().toISOString().slice(0, 10),
            priority: params.nps_score <= 3 ? "urgent" : "high",
            branch: params.branch || "Main Branch",
            status: "pending",
          });
      } catch { /* non-blocking */ }
    }

    return { feedbackId: data.id };
  };

  const calculateNps = async (startDate?: string, endDate?: string, branch = "Main Branch"): Promise<NpsResult> => {
    let query = (supabase as any)
      .from("hms_patient_feedback")
      .select("nps_score, rating_overall, rating_doctor, patient_name, feedback_text, created_at")
      .eq("branch", branch)
      .not("nps_score", "is", null);

    if (startDate) query = query.gte("created_at", startDate + "T00:00:00");
    if (endDate) query = query.lte("created_at", endDate + "T23:59:59");

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    const responses = data || [];
    const total = responses.length;

    if (total === 0) {
      return { totalResponses: 0, promoters: 0, passives: 0, detractors: 0, npsScore: 0, avgOverall: 0, avgDoctor: 0, recentLowScores: [] };
    }

    let promoters = 0, passives = 0, detractors = 0;
    let sumOverall = 0, countOverall = 0;
    let sumDoctor = 0, countDoctor = 0;

    responses.forEach((r: any) => {
      if (r.nps_score >= 9) promoters++;
      else if (r.nps_score >= 7) passives++;
      else detractors++;

      if (r.rating_overall) { sumOverall += r.rating_overall; countOverall++; }
      if (r.rating_doctor) { sumDoctor += r.rating_doctor; countDoctor++; }
    });

    const npsScore = Math.round(((promoters - detractors) / total) * 100);
    const avgOverall = countOverall > 0 ? Math.round((sumOverall / countOverall) * 10) / 10 : 0;
    const avgDoctor = countDoctor > 0 ? Math.round((sumDoctor / countDoctor) * 10) / 10 : 0;

    // Recent low scores (detractors)
    const recentLowScores = responses
      .filter((r: any) => r.nps_score <= 6)
      .slice(0, 10)
      .map((r: any) => ({
        patient_name: r.patient_name,
        nps_score: r.nps_score,
        feedback_text: r.feedback_text,
        created_at: r.created_at,
      }));

    return { totalResponses: total, promoters, passives, detractors, npsScore, avgOverall, avgDoctor, recentLowScores };
  };

  return { submitFeedback, calculateNps };
}
