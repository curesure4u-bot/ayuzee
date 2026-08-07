import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching PatientTimeline UI ───────────────────────────────────────

export type TimelineEventType =
  | "visit" | "prescription" | "therapy" | "lab" | "imaging"
  | "nadi" | "payment" | "admission" | "discharge" | "procedure"
  | "follow_up" | "teleconsult" | "note" | "vital" | "referral";

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type: TimelineEventType;
  title: string;
  detail: string;
  doctorName: string | null;
  color: string;
}

export interface PatientTimelineData {
  events: TimelineEvent[];
  loading: boolean;
  error: string | null;
}

// ─── Color mapping per event type ────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  visit: "bg-blue-500",
  prescription: "bg-green-500",
  therapy: "bg-purple-500",
  lab: "bg-orange-500",
  imaging: "bg-indigo-500",
  nadi: "bg-teal-500",
  payment: "bg-yellow-600",
  admission: "bg-red-500",
  discharge: "bg-emerald-500",
  procedure: "bg-pink-500",
  follow_up: "bg-cyan-500",
  teleconsult: "bg-sky-500",
  note: "bg-gray-500",
  vital: "bg-lime-500",
  referral: "bg-amber-500",
};

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_EVENTS: TimelineEvent[] = [
  { id: "1", date: "2026-08-01", time: "10:30 AM", type: "visit", title: "OPD Consultation – Dr. Anand Sharma", detail: "Chief complaint: Chronic lower back pain (Kati Shoola). Prakriti: Vata-Kapha. Advised Panchakarma.", color: "bg-blue-500", doctorName: "Dr. Anand Sharma" },
  { id: "2", date: "2026-08-01", time: "11:00 AM", type: "prescription", title: "Prescription Issued", detail: "Yogaraja Guggulu 2 BD, Maharasnadi Kashayam 15ml BD before food, Dhanwantharam Tailam for external application.", color: "bg-green-500", doctorName: "Dr. Anand Sharma" },
  { id: "3", date: "2026-08-02", time: "09:00 AM", type: "therapy", title: "Panchakarma – Abhyanga + Swedana", detail: "Full body Abhyanga with Dhanwantharam Tailam (45 min) followed by Bashpa Swedana (15 min). Therapist: Mr. Suresh.", color: "bg-purple-500", doctorName: null },
  { id: "4", date: "2026-08-03", time: "08:30 AM", type: "lab", title: "Lab – ESR, CRP, RA Factor", detail: "ESR: 28 mm/hr (H), CRP: 12 mg/L (H), RA Factor: Negative. Suggests active inflammation.", color: "bg-orange-500", doctorName: null },
  { id: "5", date: "2026-08-04", time: "10:00 AM", type: "imaging", title: "X-Ray Lumbosacral Spine", detail: "Mild degenerative changes at L4-L5. No fracture or dislocation. Disc space narrowing noted.", color: "bg-indigo-500", doctorName: null },
  { id: "6", date: "2026-08-05", time: "09:30 AM", type: "nadi", title: "Nadi Pariksha Report", detail: "Vata aggravation detected. Pitta mildly elevated. Kapha stable. Recommended: Vata-shamana protocol.", color: "bg-teal-500", doctorName: "Dr. Anand Sharma" },
  { id: "7", date: "2026-08-06", time: "11:00 AM", type: "payment", title: "Payment – ₹8,500", detail: "Panchakarma package (7 days Kati Basti) – ₹7,000. Medicines – ₹1,500. Mode: UPI.", color: "bg-yellow-600", doctorName: null },
  { id: "8", date: "2026-08-07", time: "10:30 AM", type: "follow_up", title: "Follow-up – Dr. Anand Sharma", detail: "Patient reports 60% relief in back pain. Continue treatment for 7 more days. Added Kati Basti.", color: "bg-blue-500", doctorName: "Dr. Anand Sharma" },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const usePatientTimeline = (patientId?: string, filterType?: TimelineEventType): PatientTimelineData & {
  addEvent: (event: Omit<TimelineEvent, "id" | "color">) => Promise<boolean>;
  refetch: () => void;
} => {
  const [data, setData] = useState<PatientTimelineData>({
    events: MOCK_EVENTS,
    loading: true,
    error: null,
  });

  const fetchTimeline = useCallback(async () => {
    if (!patientId) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let query = (supabase as any)
        .from("patient_timeline_events")
        .select("*")
        .eq("patient_id", patientId)
        .order("event_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100);

      if (filterType) {
        query = query.eq("event_type", filterType);
      }

      const { data: rows, error } = await query;

      if (error) {
        console.warn("Patient timeline fetch error (using fallback):", error.message);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (!rows || rows.length === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      const events: TimelineEvent[] = rows.map((r: any) => ({
        id: r.id,
        date: r.event_date,
        time: r.event_time || "",
        type: r.event_type as TimelineEventType,
        title: r.title,
        detail: r.detail || "",
        doctorName: r.doctor_name || null,
        color: TYPE_COLORS[r.event_type] || "bg-gray-500",
      }));

      setData({ events, loading: false, error: null });
    } catch (err: any) {
      console.error("Patient timeline unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [patientId, filterType]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const addEvent = async (event: Omit<TimelineEvent, "id" | "color">): Promise<boolean> => {
    if (!patientId) return false;

    const { data: sess } = await supabase.auth.getSession();
    const { error } = await (supabase as any)
      .from("patient_timeline_events")
      .insert({
        patient_id: patientId,
        event_date: event.date,
        event_time: event.time,
        event_type: event.type,
        title: event.title,
        detail: event.detail,
        doctor_name: event.doctorName,
        created_by: sess.session?.user?.id,
      });

    if (!error) fetchTimeline();
    return !error;
  };

  return { ...data, addEvent, refetch: fetchTimeline };
};
