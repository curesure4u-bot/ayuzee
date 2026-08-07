import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching ComplianceScore UI ───────────────────────────────────────

export interface ComplianceCategory {
  label: string;
  score: number;
  detail: string;
}

export interface ComplianceBadge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
  progressCurrent: number;
  progressTarget: number;
}

export interface WeeklyCheckin {
  id: string;
  week: string;
  score: number;
  note: string;
}

export interface PatientComplianceData {
  overallScore: number;
  categories: ComplianceCategory[];
  badges: ComplianceBadge[];
  weeklyCheckins: WeeklyCheckin[];
  streakDays: number;
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_CATEGORIES: ComplianceCategory[] = [
  { label: "Medication Adherence", score: 85, detail: "Missed 2 doses this week (Maharasnadi Kashayam)" },
  { label: "Diet Compliance (Pathya)", score: 70, detail: "Had cold foods 2x, skipped warm breakfast 1x" },
  { label: "Yoga/Exercise", score: 65, detail: "Completed 4/7 prescribed yoga sessions" },
  { label: "Follow-up Visits", score: 100, detail: "All scheduled visits attended on time" },
  { label: "Lifestyle Changes", score: 60, detail: "Sleep by 10 PM – achieved 3/7 days" },
];

const MOCK_BADGES: ComplianceBadge[] = [
  { id: "1", name: "Consistent Patient", description: "7-day streak of medication adherence", earned: true, earnedAt: "2026-08-01", progressCurrent: 7, progressTarget: 7 },
  { id: "2", name: "Follow-up Champion", description: "Never missed a scheduled visit", earned: true, earnedAt: "2026-07-20", progressCurrent: 5, progressTarget: 5 },
  { id: "3", name: "Yoga Warrior", description: "Complete 30 consecutive yoga sessions", earned: false, earnedAt: null, progressCurrent: 18, progressTarget: 30 },
  { id: "4", name: "Pathya Perfect", description: "100% diet compliance for 7 days", earned: false, earnedAt: null, progressCurrent: 3, progressTarget: 7 },
];

const MOCK_CHECKINS: WeeklyCheckin[] = [
  { id: "1", week: "Jul 28 - Aug 3", score: 75, note: "Good week. Missed yoga 2 days due to travel." },
  { id: "2", week: "Aug 4 - Aug 7", score: 78, note: "Improved. Back from travel. All medicines taken." },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const usePatientCompliance = (patientId?: string): PatientComplianceData & {
  submitCheckin: (scores: { medication: number; diet: number; yoga: number; followup: number; lifestyle: number; note?: string }) => Promise<boolean>;
  refetch: () => void;
} => {
  const [data, setData] = useState<PatientComplianceData>({
    overallScore: 78,
    categories: MOCK_CATEGORIES,
    badges: MOCK_BADGES,
    weeklyCheckins: MOCK_CHECKINS,
    streakDays: 5,
    loading: true,
    error: null,
  });

  const fetchCompliance = useCallback(async () => {
    if (!patientId) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch recent compliance scores (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const { data: scores, error: scoreErr } = await (supabase as any)
        .from("patient_compliance_scores")
        .select("*")
        .eq("patient_id", patientId)
        .gte("score_date", thirtyDaysAgo)
        .order("score_date", { ascending: false });

      // Fetch badges
      const { data: badges, error: badgeErr } = await (supabase as any)
        .from("patient_compliance_badges")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (scoreErr && badgeErr) {
        console.warn("Patient compliance fetch error (using fallback):", scoreErr?.message);
        setData((prev) => ({ ...prev, loading: false, error: scoreErr?.message || badgeErr?.message }));
        return;
      }

      // If no data, keep mock
      if ((!scores || scores.length === 0) && (!badges || badges.length === 0)) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      // Latest score
      const latest = scores?.[0];
      const overallScore = latest?.overall_score || 0;

      const categories: ComplianceCategory[] = latest ? [
        { label: "Medication Adherence", score: latest.medication_adherence || 0, detail: "" },
        { label: "Diet Compliance (Pathya)", score: latest.diet_compliance || 0, detail: "" },
        { label: "Yoga/Exercise", score: latest.yoga_exercise || 0, detail: "" },
        { label: "Follow-up Visits", score: latest.followup_visits || 0, detail: "" },
        { label: "Lifestyle Changes", score: latest.lifestyle_changes || 0, detail: "" },
      ] : MOCK_CATEGORIES;

      // Map badges
      const mappedBadges: ComplianceBadge[] = (badges && badges.length > 0)
        ? badges.map((b: any) => ({
            id: b.id,
            name: b.badge_name,
            description: b.badge_description || "",
            earned: b.earned || false,
            earnedAt: b.earned_at || null,
            progressCurrent: b.progress_current || 0,
            progressTarget: b.progress_target || 1,
          }))
        : MOCK_BADGES;

      // Weekly check-ins (group scores by week)
      const weeklyCheckins: WeeklyCheckin[] = [];
      if (scores && scores.length > 0) {
        // Group by week — take the latest entry per week
        const weekMap = new Map<string, any>();
        for (const s of scores) {
          const d = new Date(s.score_date);
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - d.getDay());
          const key = weekStart.toISOString().split("T")[0];
          if (!weekMap.has(key)) weekMap.set(key, s);
        }
        for (const [weekKey, s] of weekMap) {
          const start = new Date(weekKey);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          weeklyCheckins.push({
            id: s.id,
            week: `${start.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`,
            score: s.overall_score,
            note: s.notes || "",
          });
        }
      }

      // Calculate streak
      let streak = 0;
      if (scores) {
        for (const s of scores) {
          if (s.overall_score >= 70) streak++;
          else break;
        }
      }

      setData({
        overallScore,
        categories,
        badges: mappedBadges,
        weeklyCheckins: weeklyCheckins.length > 0 ? weeklyCheckins : MOCK_CHECKINS,
        streakDays: streak,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Patient compliance unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [patientId]);

  useEffect(() => {
    fetchCompliance();
  }, [fetchCompliance]);

  const submitCheckin = async (scores: { medication: number; diet: number; yoga: number; followup: number; lifestyle: number; note?: string }): Promise<boolean> => {
    if (!patientId) return false;
    const { data: sess } = await supabase.auth.getSession();

    const overall = Math.round((scores.medication + scores.diet + scores.yoga + scores.followup + scores.lifestyle) / 5);

    const { error } = await (supabase as any)
      .from("patient_compliance_scores")
      .upsert({
        patient_id: patientId,
        score_date: new Date().toISOString().split("T")[0],
        overall_score: overall,
        medication_adherence: scores.medication,
        diet_compliance: scores.diet,
        yoga_exercise: scores.yoga,
        followup_visits: scores.followup,
        lifestyle_changes: scores.lifestyle,
        notes: scores.note || null,
        checked_in_by: sess.session?.user?.id,
      }, { onConflict: "patient_id,score_date" });

    if (!error) fetchCompliance();
    return !error;
  };

  return { ...data, submitCheckin, refetch: fetchCompliance };
};
