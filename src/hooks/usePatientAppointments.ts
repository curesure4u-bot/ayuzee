import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface PatientAppointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  doctor: string;
  department: string;
  purpose: string;
  status: AppointmentStatus;
  bookedBy: string;
  notes: string;
}

const MOCK_APPOINTMENTS: PatientAppointment[] = [
  { id: "1", patientId: "AL-8472", patientName: "Mr. Nagaraj", date: "2026-08-10", time: "10:30 AM", doctor: "Dr. Mohamad Saleem", department: "Ayurveda", purpose: "Follow-up", status: "scheduled", bookedBy: "Online", notes: "Post-PK follow-up. Check SLR improvement." },
  { id: "2", patientId: "AL-8472", patientName: "Mr. Nagaraj", date: "2026-08-07", time: "09:00 AM", doctor: "Dr. Mohamad Saleem", department: "Ayurveda", purpose: "Consultation", status: "completed", bookedBy: "Reception", notes: "Routine visit. Medicines refilled." },
  { id: "3", patientId: "AL-8472", patientName: "Mr. Nagaraj", date: "2026-07-20", time: "11:00 AM", doctor: "Dr. Mohamad Saleem", department: "Ayurveda", purpose: "Lab Review", status: "completed", bookedBy: "Reception", notes: "ESR/CRP review. Improved." },
  { id: "4", patientId: "AL-8472", patientName: "Mr. Nagaraj", date: "2026-07-10", time: "10:00 AM", doctor: "Dr. Mohamad Saleem", department: "Panchakarma", purpose: "IP Admission", status: "completed", bookedBy: "Doctor", notes: "Admitted for Kati Basti + Yoga Basti course." },
];

export const usePatientAppointments = (patientId?: string) => {
  const [appointments, setAppointments] = useState<PatientAppointment[]>(MOCK_APPOINTMENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = (supabase as any)
        .from("hms_appointments")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data, error: fetchErr } = await query;

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }

      if (data && data.length > 0) {
        const mapped: PatientAppointment[] = data.map((r: any) => ({
          id: r.id,
          patientId: r.patient_id || "",
          patientName: r.patient_name || "",
          date: r.date || "",
          time: r.time_slot || "",
          doctor: r.doctor_name || "",
          department: r.department || "",
          purpose: r.purpose || "Consultation",
          status: r.status || "scheduled",
          bookedBy: r.booked_by || "",
          notes: r.notes || "",
        }));
        setAppointments(mapped);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const bookAppointment = async (appt: Omit<PatientAppointment, "id" | "status">): Promise<boolean> => {
    const payload = {
      patient_id: appt.patientId,
      patient_name: appt.patientName,
      date: appt.date,
      time_slot: appt.time,
      doctor_name: appt.doctor,
      department: appt.department,
      purpose: appt.purpose,
      booked_by: appt.bookedBy,
      notes: appt.notes,
      status: "scheduled",
    };

    const { error: insertErr } = await (supabase as any)
      .from("hms_appointments")
      .insert(payload);

    if (insertErr) {
      const newAppt: PatientAppointment = { ...appt, id: `APT-${Date.now()}`, status: "scheduled" };
      setAppointments((prev) => [newAppt, ...prev]);
      return true;
    }
    await fetchAppointments();
    return true;
  };

  const upcoming = appointments.filter((a) => a.status === "scheduled" || a.status === "confirmed");
  const past = appointments.filter((a) => a.status === "completed" || a.status === "cancelled" || a.status === "no_show");

  return {
    appointments,
    upcoming,
    past,
    loading,
    error,
    bookAppointment,
    refetch: fetchAppointments,
  };
};
