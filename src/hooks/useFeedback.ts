import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FeedbackSentiment = "positive" | "neutral" | "negative";
export type FeedbackStatus = "new" | "acknowledged" | "resolved";

export interface PatientFeedback {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  rating: number;
  npsScore: number;
  comment: string;
  sentiment: FeedbackSentiment;
  category: string;
  status: FeedbackStatus;
  googleReview: boolean;
}

const MOCK_FEEDBACK: PatientFeedback[] = [
  { id: "1", patient: "Priya Menon", doctor: "Dr. Arun Sharma", date: "2026-08-07", rating: 5, npsScore: 10, comment: "Excellent treatment. My knee pain reduced significantly after Janu Basti. Very caring staff.", sentiment: "positive", category: "Treatment", status: "acknowledged", googleReview: true },
  { id: "2", patient: "Rahul Kumar", doctor: "Dr. Meena Patel", date: "2026-08-07", rating: 4, npsScore: 8, comment: "Good Panchakarma experience. Food could be better during Samsarjana.", sentiment: "positive", category: "Panchakarma", status: "new", googleReview: false },
  { id: "3", patient: "Ananya S.", doctor: "Dr. Arun Sharma", date: "2026-08-06", rating: 5, npsScore: 9, comment: "Doctor explained everything in detail. AI Scribe made the consultation smooth.", sentiment: "positive", category: "Consultation", status: "acknowledged", googleReview: true },
  { id: "4", patient: "Mohammed F.", doctor: "Dr. Priya Das", date: "2026-08-06", rating: 3, npsScore: 5, comment: "Long waiting time in OPD. Treatment was good but reception was slow.", sentiment: "neutral", category: "Waiting Time", status: "resolved", googleReview: false },
  { id: "5", patient: "Suresh M.", doctor: "Dr. Arun Sharma", date: "2026-08-05", rating: 2, npsScore: 3, comment: "Medicine was not available in pharmacy. Had to buy from outside.", sentiment: "negative", category: "Pharmacy", status: "resolved", googleReview: false },
  { id: "6", patient: "Kavitha R.", doctor: "Dr. Meena Patel", date: "2026-08-05", rating: 5, npsScore: 10, comment: "Best Ayurveda hospital! Shirodhara was life-changing for my insomnia.", sentiment: "positive", category: "Panchakarma", status: "acknowledged", googleReview: true },
  { id: "7", patient: "Lakshmi Nair", doctor: "Dr. Arun Sharma", date: "2026-08-04", rating: 4, npsScore: 8, comment: "Good follow-up system. WhatsApp reminders are very helpful.", sentiment: "positive", category: "Follow-up", status: "new", googleReview: false },
];

export const useFeedback = () => {
  const [feedback, setFeedback] = useState<PatientFeedback[]>(MOCK_FEEDBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_patient_feedback")
        .select("*")
        .order("date", { ascending: false })
        .limit(100);

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }

      if (data && data.length > 0) {
        const mapped: PatientFeedback[] = data.map((r: any) => ({
          id: r.id,
          patient: r.patient_name || "",
          doctor: r.doctor_name || "",
          date: r.date || "",
          rating: r.rating || 0,
          npsScore: r.nps_score || 0,
          comment: r.comment || "",
          sentiment: r.sentiment || "neutral",
          category: r.category || "",
          status: r.status || "new",
          googleReview: r.google_review || false,
        }));
        setFeedback(mapped);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

  const updateStatus = async (id: string, status: FeedbackStatus): Promise<boolean> => {
    const { error: updateErr } = await (supabase as any)
      .from("hms_patient_feedback")
      .update({ status })
      .eq("id", id);

    if (updateErr) {
      setFeedback((prev) => prev.map((f) => f.id === id ? { ...f, status } : f));
      return true;
    }
    await fetchFeedback();
    return true;
  };

  const avgRating = feedback.length > 0
    ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1)
    : "0";
  const avgNps = feedback.length > 0
    ? Math.round(feedback.reduce((s, f) => s + f.npsScore, 0) / feedback.length)
    : 0;
  const promoters = feedback.filter((f) => f.npsScore >= 9).length;
  const detractors = feedback.filter((f) => f.npsScore <= 6).length;
  const npsScore = feedback.length > 0
    ? Math.round(((promoters - detractors) / feedback.length) * 100)
    : 0;
  const googleReviews = feedback.filter((f) => f.googleReview).length;
  const complaints = feedback.filter((f) => f.sentiment === "negative").length;

  return {
    feedback,
    loading,
    error,
    avgRating,
    avgNps,
    npsScore,
    promoters,
    detractors,
    googleReviews,
    complaints,
    updateStatus,
    refetch: fetchFeedback,
  };
};
