import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching TreatmentPlanner UI ──────────────────────────────────────

export interface TreatmentPlanDay {
  id: string;
  dayNumber: number;
  phase: string;
  activity: string;
  status: "pending" | "done" | "skipped" | "modified";
}

export interface TreatmentPlanData {
  id: string | null;
  patient: string;
  title: string;
  doctor: string;
  startDate: string;
  endDate: string;
  currentDay: number;
  totalDays: number;
  status: string;
  days: TreatmentPlanDay[];
}

export interface PatientTreatmentPlanResult {
  plan: TreatmentPlanData;
  loading: boolean;
  error: string | null;
  markDayComplete: (dayId: string) => Promise<boolean>;
  refetch: () => void;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_PLAN: TreatmentPlanData = {
  id: null,
  patient: "Mr. Rajesh Kumar",
  title: "14-Day Panchakarma Journey – Kati Basti Protocol",
  doctor: "Dr. Anand Sharma",
  startDate: "2026-07-25",
  endDate: "2026-08-07",
  currentDay: 14,
  totalDays: 14,
  status: "active",
  days: [
    { id: "1", dayNumber: 1, phase: "Purva Karma", activity: "Deepana-Pachana (Trikatu Churna 3g TDS)", status: "done" },
    { id: "2", dayNumber: 2, phase: "Purva Karma", activity: "Deepana-Pachana + Mild Abhyanga", status: "done" },
    { id: "3", dayNumber: 3, phase: "Purva Karma", activity: "Snehapana – Guggulutiktaka Ghritam 30ml", status: "done" },
    { id: "4", dayNumber: 4, phase: "Purva Karma", activity: "Snehapana – Guggulutiktaka Ghritam 50ml", status: "done" },
    { id: "5", dayNumber: 5, phase: "Purva Karma", activity: "Snehapana – Guggulutiktaka Ghritam 80ml", status: "done" },
    { id: "6", dayNumber: 6, phase: "Purva Karma", activity: "Rest Day + Sarvanga Abhyanga + Bashpa Swedana", status: "done" },
    { id: "7", dayNumber: 7, phase: "Pradhana Karma", activity: "Kati Basti – Dhanwantharam Tailam (45 min)", status: "done" },
    { id: "8", dayNumber: 8, phase: "Pradhana Karma", activity: "Kati Basti + Nadi Swedana to lumbar region", status: "done" },
    { id: "9", dayNumber: 9, phase: "Pradhana Karma", activity: "Kati Basti + Patra Pinda Sweda", status: "done" },
    { id: "10", dayNumber: 10, phase: "Pradhana Karma", activity: "Kati Basti + Greeva Basti (added)", status: "done" },
    { id: "11", dayNumber: 11, phase: "Pradhana Karma", activity: "Kati Basti + Matra Basti (60ml Anu Tailam)", status: "done" },
    { id: "12", dayNumber: 12, phase: "Paschat Karma", activity: "Samsarjana Krama – Peya (rice water only)", status: "done" },
    { id: "13", dayNumber: 13, phase: "Paschat Karma", activity: "Samsarjana Krama – Vilepi (thin rice gruel)", status: "done" },
    { id: "14", dayNumber: 14, phase: "Paschat Karma", activity: "Samsarjana – Akrita Yusha, back to normal diet", status: "done" },
  ],
};

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const usePatientTreatmentPlan = (patientId?: string): PatientTreatmentPlanResult => {
  const [plan, setPlan] = useState<TreatmentPlanData>(MOCK_PLAN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch active treatment plan
      const { data: planRow, error: planErr } = await (supabase as any)
        .from("patient_treatment_plans")
        .select("*")
        .eq("patient_id", patientId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planErr) {
        console.warn("Treatment plan fetch error (using fallback):", planErr.message);
        setLoading(false);
        setError(planErr.message);
        return;
      }

      if (!planRow) {
        setLoading(false);
        return;
      }

      // Fetch plan days
      const { data: dayRows, error: daysErr } = await (supabase as any)
        .from("patient_treatment_plan_days")
        .select("*")
        .eq("plan_id", planRow.id)
        .order("day_number", { ascending: true });

      if (daysErr) {
        console.warn("Treatment plan days fetch error:", daysErr.message);
      }

      const days: TreatmentPlanDay[] = (dayRows || []).map((d: any) => ({
        id: d.id,
        dayNumber: d.day_number,
        phase: d.phase,
        activity: d.activity,
        status: d.status || "pending",
      }));

      // Calculate current day
      const startDate = new Date(planRow.start_date);
      const today = new Date();
      const diffDays = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
      const currentDay = Math.min(diffDays, planRow.total_days);

      setPlan({
        id: planRow.id,
        patient: planRow.patient_name || MOCK_PLAN.patient,
        title: planRow.title,
        doctor: planRow.doctor_name || "",
        startDate: planRow.start_date,
        endDate: planRow.end_date || "",
        currentDay,
        totalDays: planRow.total_days,
        status: planRow.status,
        days: days.length > 0 ? days : MOCK_PLAN.days,
      });
      setLoading(false);
    } catch (err: any) {
      console.error("Treatment plan unexpected error:", err);
      setLoading(false);
      setError(err.message || "Unknown error");
    }
  }, [patientId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const markDayComplete = async (dayId: string): Promise<boolean> => {
    const { error } = await (supabase as any)
      .from("patient_treatment_plan_days")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", dayId);

    if (!error) {
      setPlan((prev) => ({
        ...prev,
        days: prev.days.map((d) => d.id === dayId ? { ...d, status: "done" as const } : d),
      }));
    }
    return !error;
  };

  return { plan, loading, error, markDayComplete, refetch: fetchPlan };
};
