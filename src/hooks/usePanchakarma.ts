import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TherapySession {
  id: string;
  patientName: string;
  therapy: string;
  therapist: string;
  room: string;
  timeSlot: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
  oilUsed: string;
  oilQty: string;
  notes: string;
}

export interface ActivePackage {
  id: string;
  patientName: string;
  packageName: string;
  totalSessions: number;
  completedSessions: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "paused" | "cancelled";
}

export interface PanchakarmaData {
  sessions: TherapySession[];
  packages: ActivePackage[];
  completedCount: number;
  inProgressCount: number;
  scheduledCount: number;
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock ───────────────────────────────────────────────────────────

const MOCK_SESSIONS: TherapySession[] = [
  { id: "1", patientName: "Ramesh Kumar", therapy: "Abhyanga", therapist: "Suresh (M)", room: "Room 1", timeSlot: "09:00-10:00", status: "completed", oilUsed: "Dhanwantharam Tailam", oilQty: "200ml", notes: "" },
  { id: "2", patientName: "Lakshmi Devi", therapy: "Shirodhara", therapist: "Priya (F)", room: "Room 2", timeSlot: "09:30-10:30", status: "in_progress", oilUsed: "Ksheerabala Tailam", oilQty: "500ml", notes: "" },
  { id: "3", patientName: "Sunil Menon", therapy: "Vasti (Kashaya)", therapist: "Arun (M)", room: "Room 3", timeSlot: "10:00-11:00", status: "scheduled", oilUsed: "Dashamoola Kashaya", oilQty: "400ml", notes: "" },
  { id: "4", patientName: "Meera Nair", therapy: "Pizhichil", therapist: "Kavitha (F)", room: "Room 1", timeSlot: "11:00-12:30", status: "scheduled", oilUsed: "Murivenna", oilQty: "1000ml", notes: "" },
  { id: "5", patientName: "Anand Sharma", therapy: "Nasya", therapist: "Suresh (M)", room: "Room 4", timeSlot: "10:30-11:00", status: "scheduled", oilUsed: "Anu Tailam", oilQty: "10ml", notes: "" },
];

const MOCK_PACKAGES: ActivePackage[] = [
  { id: "1", patientName: "Ramesh Kumar", packageName: "14-day Panchakarma (Full)", totalSessions: 42, completedSessions: 28, startDate: "2026-07-25", endDate: "2026-08-07", status: "active" },
  { id: "2", patientName: "Lakshmi Devi", packageName: "7-day Shirodhara Course", totalSessions: 7, completedSessions: 5, startDate: "2026-08-01", endDate: "2026-08-07", status: "active" },
  { id: "3", patientName: "Sunil Menon", packageName: "21-day Detox Program", totalSessions: 63, completedSessions: 12, startDate: "2026-07-20", endDate: "2026-08-10", status: "active" },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const usePanchakarma = (date?: string): PanchakarmaData & {
  updateSessionStatus: (id: string, status: TherapySession["status"]) => Promise<boolean>;
  addSession: (session: Omit<TherapySession, "id">) => Promise<boolean>;
  refetch: () => void;
} => {
  const targetDate = date || new Date().toISOString().split("T")[0];

  const [data, setData] = useState<PanchakarmaData>({
    sessions: MOCK_SESSIONS,
    packages: MOCK_PACKAGES,
    completedCount: 1,
    inProgressCount: 1,
    scheduledCount: 3,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch today's sessions
      const { data: sessions, error: sessErr } = await (supabase as any)
        .from("pk_therapy_sessions")
        .select("*")
        .eq("session_date", targetDate)
        .order("time_slot", { ascending: true });

      // Fetch active patient packages
      const { data: pkgs, error: pkgErr } = await (supabase as any)
        .from("pk_patient_packages")
        .select("*")
        .eq("status", "active")
        .order("start_date", { ascending: false });

      if (sessErr && pkgErr) {
        console.warn("Panchakarma fetch error (using fallback):", sessErr?.message);
        setData((prev) => ({ ...prev, loading: false, error: sessErr?.message }));
        return;
      }

      // If no data, keep mock
      if ((!sessions || sessions.length === 0) && (!pkgs || pkgs.length === 0)) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      const mappedSessions: TherapySession[] = (sessions || []).map((s: any) => ({
        id: s.id,
        patientName: s.patient_name,
        therapy: s.therapy_name,
        therapist: s.therapist_name || "—",
        room: s.room || "—",
        timeSlot: s.time_slot || "—",
        status: s.status,
        oilUsed: s.oil_used || "",
        oilQty: s.oil_quantity || "",
        notes: s.therapist_notes || "",
      }));

      const mappedPackages: ActivePackage[] = (pkgs || []).map((p: any) => ({
        id: p.id,
        patientName: p.patient_name,
        packageName: p.package_name,
        totalSessions: p.total_sessions,
        completedSessions: p.completed_sessions,
        startDate: p.start_date,
        endDate: p.end_date || "—",
        status: p.status,
      }));

      const finalSessions = mappedSessions.length > 0 ? mappedSessions : MOCK_SESSIONS;
      setData({
        sessions: finalSessions,
        packages: mappedPackages.length > 0 ? mappedPackages : MOCK_PACKAGES,
        completedCount: finalSessions.filter((s) => s.status === "completed").length,
        inProgressCount: finalSessions.filter((s) => s.status === "in_progress").length,
        scheduledCount: finalSessions.filter((s) => s.status === "scheduled").length,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Panchakarma unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [targetDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateSessionStatus = async (id: string, status: TherapySession["status"]): Promise<boolean> => {
    const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
    if (status === "in_progress") updates.started_at = new Date().toISOString();
    if (status === "completed") updates.completed_at = new Date().toISOString();

    const { error } = await (supabase as any)
      .from("pk_therapy_sessions")
      .update(updates)
      .eq("id", id);

    if (!error) {
      // If completed, increment patient package completed_sessions
      const session = data.sessions.find((s) => s.id === id);
      if (status === "completed" && session) {
        // Optimistic local update
        setData((prev) => ({
          ...prev,
          sessions: prev.sessions.map((s) => s.id === id ? { ...s, status } : s),
          completedCount: prev.completedCount + 1,
          inProgressCount: prev.inProgressCount - (session.status === "in_progress" ? 1 : 0),
          scheduledCount: prev.scheduledCount - (session.status === "scheduled" ? 1 : 0),
        }));
      } else {
        setData((prev) => ({
          ...prev,
          sessions: prev.sessions.map((s) => s.id === id ? { ...s, status } : s),
        }));
      }
    }
    return !error;
  };

  const addSession = async (session: Omit<TherapySession, "id">): Promise<boolean> => {
    const { data: sess } = await supabase.auth.getSession();

    const { error } = await (supabase as any)
      .from("pk_therapy_sessions")
      .insert({
        patient_name: session.patientName,
        therapy_name: session.therapy,
        therapist_name: session.therapist,
        room: session.room,
        session_date: targetDate,
        time_slot: session.timeSlot,
        status: "scheduled",
        oil_used: session.oilUsed,
        oil_quantity: session.oilQty,
        created_by: sess.session?.user?.id,
      });

    if (!error) fetchData();
    return !error;
  };

  return { ...data, updateSessionStatus, addSession, refetch: fetchData };
};
