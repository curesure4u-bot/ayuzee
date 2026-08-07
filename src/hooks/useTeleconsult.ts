import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ConsultStatus = "waiting" | "active" | "completed" | "no_show" | "scheduled";

export interface TeleconsultSession {
  id: string;
  patient: string;
  phone: string;
  doctor: string;
  scheduledAt: string;
  duration: string;
  type: string;
  status: ConsultStatus;
  payment: string;
  notes: string;
}

const MOCK_CONSULTS: TeleconsultSession[] = [
  { id: "1", patient: "Priya Menon (Dubai)", phone: "+971-50-1234567", doctor: "Dr. Arun Sharma", scheduledAt: "2026-08-07 11:00", duration: "—", type: "International Follow-up", status: "waiting", payment: "₹800 (Paid)", notes: "" },
  { id: "2", patient: "Rahul Kumar (Bangalore)", phone: "+91-9876500020", doctor: "Dr. Arun Sharma", scheduledAt: "2026-08-07 11:30", duration: "—", type: "New Consultation", status: "scheduled", payment: "₹500 (Paid)", notes: "" },
  { id: "3", patient: "Ananya S. (Chennai)", phone: "+91-9876500021", doctor: "Dr. Meena Patel", scheduledAt: "2026-08-07 12:00", duration: "—", type: "Panchakarma Review", status: "scheduled", payment: "₹400 (Paid)", notes: "" },
  { id: "4", patient: "Mohammed F. (Muscat)", phone: "+968-9876-5432", doctor: "Dr. Arun Sharma", scheduledAt: "2026-08-07 09:30", duration: "18 min", type: "Follow-up", status: "completed", payment: "₹800 (Paid)", notes: "Medicines continued. Advised local Panchakarma center." },
  { id: "5", patient: "Lakshmi Nair (Mumbai)", phone: "+91-9876500022", doctor: "Dr. Priya Das", scheduledAt: "2026-08-07 10:00", duration: "22 min", type: "New Consultation", status: "completed", payment: "₹500 (Paid)", notes: "Homeopathy case taken. Arsenicum Album 30C prescribed." },
  { id: "6", patient: "David Thomas (USA)", phone: "+1-408-555-1234", doctor: "Dr. Arun Sharma", scheduledAt: "2026-08-07 08:00", duration: "—", type: "International New", status: "no_show", payment: "₹1200 (Paid)", notes: "Patient did not join. WhatsApp sent." },
];

export const useTeleconsult = () => {
  const [sessions, setSessions] = useState<TeleconsultSession[]>(MOCK_CONSULTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_teleconsult_sessions")
        .select("*")
        .gte("scheduled_at", today)
        .order("scheduled_at");

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }

      if (data && data.length > 0) {
        const mapped: TeleconsultSession[] = data.map((r: any) => ({
          id: r.id,
          patient: r.patient_name || "",
          phone: r.phone || "",
          doctor: r.doctor_name || "",
          scheduledAt: r.scheduled_at || "",
          duration: r.duration || "—",
          type: r.consult_type || "New Consultation",
          status: r.status || "scheduled",
          payment: r.payment_status || "",
          notes: r.notes || "",
        }));
        setSessions(mapped);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const updateStatus = async (id: string, status: ConsultStatus, extra?: Record<string, any>): Promise<boolean> => {
    const updates: Record<string, any> = { status, ...extra };
    if (status === "active") updates.started_at = new Date().toISOString();
    if (status === "completed") updates.completed_at = new Date().toISOString();

    const { error: updateErr } = await (supabase as any)
      .from("hms_teleconsult_sessions")
      .update(updates)
      .eq("id", id);

    if (updateErr) {
      setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status, ...extra } : s));
      return true;
    }
    await fetchSessions();
    return true;
  };

  const scheduleSession = async (session: Omit<TeleconsultSession, "id" | "duration" | "status" | "notes">): Promise<boolean> => {
    const payload = {
      patient_name: session.patient,
      phone: session.phone,
      doctor_name: session.doctor,
      scheduled_at: session.scheduledAt,
      consult_type: session.type,
      payment_status: session.payment,
      status: "scheduled",
    };

    const { error: insertErr } = await (supabase as any)
      .from("hms_teleconsult_sessions")
      .insert(payload);

    if (insertErr) {
      const newSession: TeleconsultSession = {
        ...session, id: `TC-${Date.now()}`, duration: "—", status: "scheduled", notes: "",
      };
      setSessions((prev) => [...prev, newSession]);
      return true;
    }
    await fetchSessions();
    return true;
  };

  const waiting = sessions.filter((s) => s.status === "waiting").length;
  const completed = sessions.filter((s) => s.status === "completed").length;
  const scheduled = sessions.filter((s) => s.status === "scheduled").length;
  const noShow = sessions.filter((s) => s.status === "no_show").length;

  return {
    sessions,
    loading,
    error,
    waiting,
    completed,
    scheduled,
    noShow,
    totalToday: sessions.length,
    updateStatus,
    scheduleSession,
    refetch: fetchSessions,
  };
};
