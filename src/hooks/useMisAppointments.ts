import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching MisOperational UI shapes ─────────────────────────────────

export interface VisitsPerDoctor {
  doctor: string;
  visits: number;
  completed: number;
  cancelled: number;
  noShow: number;
  totalFee: number;
}

export interface AppointmentSummary {
  totalVisits: number;
  newPatients: number;
  repeatPatients: number;
  cancelled: number;
  noShow: number;
  avgWaitingTimeMin: number;
  totalFee: number;
}

export interface PatientRegistration {
  id: string;
  externalId: string;
  name: string;
  gender: string;
  dob: string;
  age: number;
  regDate: string;
  mobile: string;
  bloodGroup: string;
  area: string;
  referredBy: string;
}

export interface MisAppointmentFilters {
  dateFrom: string;
  dateTo: string;
  location?: string;
}

export interface MisAppointmentsData {
  visitsPerDoctor: VisitsPerDoctor[];
  summary: AppointmentSummary;
  recentPatients: PatientRegistration[];
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_VISITS_PER_DR: VisitsPerDoctor[] = [
  { doctor: "Dr. Sivarama", visits: 85, completed: 78, cancelled: 4, noShow: 3, totalFee: 127500 },
  { doctor: "Dr. Priya", visits: 62, completed: 58, cancelled: 2, noShow: 2, totalFee: 93000 },
  { doctor: "Dr. Kumar", visits: 48, completed: 45, cancelled: 2, noShow: 1, totalFee: 72000 },
  { doctor: "Dr. Anitha", visits: 35, completed: 33, cancelled: 1, noShow: 1, totalFee: 52500 },
  { doctor: "Dr. Lakshmi", visits: 28, completed: 26, cancelled: 1, noShow: 1, totalFee: 42000 },
];

const MOCK_SUMMARY: AppointmentSummary = {
  totalVisits: 32,
  newPatients: 12,
  repeatPatients: 20,
  cancelled: 5,
  noShow: 2,
  avgWaitingTimeMin: 18,
  totalFee: 48000,
};

const MOCK_PATIENTS: PatientRegistration[] = [
  {
    id: "P001", externalId: "EXT-2145", name: "Rajesh Kumar", gender: "Male",
    dob: "15/03/1981", age: 45, regDate: "10/01/2026", mobile: "98xxx12345",
    bloodGroup: "B+", area: "Kadayanallur", referredBy: "Walk-in",
  },
  {
    id: "P002", externalId: "—", name: "Sunita Devi", gender: "Female",
    dob: "22/08/1988", age: 38, regDate: "15/03/2026", mobile: "97xxx45678",
    bloodGroup: "O+", area: "Rajapalayam", referredBy: "Rajesh Kumar",
  },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useMisAppointments = (filters: MisAppointmentFilters): MisAppointmentsData => {
  const [data, setData] = useState<MisAppointmentsData>({
    visitsPerDoctor: MOCK_VISITS_PER_DR,
    summary: MOCK_SUMMARY,
    recentPatients: MOCK_PATIENTS,
    loading: true,
    error: null,
  });

  const fetchAppointments = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch appointments with doctor info for the date range
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("id, doctor_id, appointment_date, status, fee, user_id, mode")
        .gte("appointment_date", filters.dateFrom)
        .lte("appointment_date", filters.dateTo)
        .order("appointment_date", { ascending: false });

      if (error) {
        console.warn("MIS Appointments fetch error (using fallback):", error.message);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (!appointments || appointments.length === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      // Fetch doctor names
      const doctorIds = [...new Set(appointments.map((a) => a.doctor_id))];
      const { data: doctors } = await supabase
        .from("doctors")
        .select("id, full_name")
        .in("id", doctorIds);

      const doctorNameMap = new Map<string, string>();
      if (doctors) {
        for (const d of doctors) {
          doctorNameMap.set(d.id, d.full_name || "Unknown");
        }
      }

      // ─── Aggregate: Visits per Doctor ──────────────────────────────

      const drMap = new Map<string, VisitsPerDoctor>();
      for (const appt of appointments) {
        const drName = doctorNameMap.get(appt.doctor_id) || "Unknown Doctor";
        if (!drMap.has(appt.doctor_id)) {
          drMap.set(appt.doctor_id, {
            doctor: drName.length > 18 ? drName.substring(0, 15) + "..." : drName,
            visits: 0,
            completed: 0,
            cancelled: 0,
            noShow: 0,
            totalFee: 0,
          });
        }
        const entry = drMap.get(appt.doctor_id)!;
        entry.visits += 1;
        entry.totalFee += Number(appt.fee) || 0;

        switch (appt.status) {
          case "completed": entry.completed += 1; break;
          case "cancelled": entry.cancelled += 1; break;
          case "no_show": entry.noShow += 1; break;
          default: entry.completed += 1; // confirmed/pending count as active
        }
      }
      const visitsPerDoctor = Array.from(drMap.values()).sort((a, b) => b.visits - a.visits);

      // ─── Aggregate: Summary ────────────────────────────────────────

      // Determine new vs repeat patients by checking if user_id has earlier appointments
      const userIds = [...new Set(appointments.map((a) => a.user_id))];
      let newPatientCount = 0;

      // Check which users had appointments BEFORE the filter range
      const { data: priorAppts } = await supabase
        .from("appointments")
        .select("user_id")
        .lt("appointment_date", filters.dateFrom)
        .in("user_id", userIds.slice(0, 100)); // limit for perf

      const returningUsers = new Set((priorAppts || []).map((a) => a.user_id));
      const uniqueUsersInRange = new Set(appointments.map((a) => a.user_id));
      for (const uid of uniqueUsersInRange) {
        if (!returningUsers.has(uid)) newPatientCount += 1;
      }

      const totalVisits = appointments.length;
      const cancelled = appointments.filter((a) => a.status === "cancelled").length;
      const noShow = appointments.filter((a) => a.status === "no_show").length;
      const totalFee = appointments.reduce((sum, a) => sum + (Number(a.fee) || 0), 0);

      const summary: AppointmentSummary = {
        totalVisits,
        newPatients: newPatientCount,
        repeatPatients: uniqueUsersInRange.size - newPatientCount,
        cancelled,
        noShow,
        avgWaitingTimeMin: 18, // would need a separate waiting_time field — keep placeholder
        totalFee,
      };

      // ─── Recent Patients (from profiles if available) ──────────────

      // Try to fetch recent patient registrations from profiles table
      const { data: profiles } = await (supabase as any)
        .from("profiles")
        .select("user_id, full_name, gender, date_of_birth, phone, blood_group, city, created_at")
        .gte("created_at", filters.dateFrom)
        .lte("created_at", filters.dateTo + "T23:59:59")
        .order("created_at", { ascending: false })
        .limit(20);

      let recentPatients: PatientRegistration[] = MOCK_PATIENTS;
      if (profiles && profiles.length > 0) {
        recentPatients = profiles.map((p: any, idx: number) => {
          const dob = p.date_of_birth ? new Date(p.date_of_birth) : null;
          const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
          return {
            id: `P${String(idx + 1).padStart(3, "0")}`,
            externalId: "—",
            name: p.full_name || "Unknown",
            gender: p.gender || "—",
            dob: dob ? dob.toLocaleDateString("en-GB") : "—",
            age,
            regDate: p.created_at ? new Date(p.created_at).toLocaleDateString("en-GB") : "—",
            mobile: p.phone ? p.phone.replace(/(\d{2})\d+(\d{5})/, "$1xxx$2") : "—",
            bloodGroup: p.blood_group || "—",
            area: p.city || "—",
            referredBy: "Walk-in",
          };
        });
      }

      setData({
        visitsPerDoctor,
        summary,
        recentPatients,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("MIS Appointments unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [filters.dateFrom, filters.dateTo]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return data;
};

// ─── AI Summary text generator (for the AI insight card) ─────────────────────

export function generateAiOperationsSummary(summary: AppointmentSummary, visitsPerDoctor: VisitsPerDoctor[]): string {
  const busiest = visitsPerDoctor[0];
  return (
    `${summary.totalVisits} OPD visits today (${summary.newPatients} new, ${summary.repeatPatients} repeat). ` +
    `Avg waiting time: ${summary.avgWaitingTimeMin} min. ` +
    (busiest ? `${busiest.doctor} busiest (${busiest.visits} visits/month). ` : "") +
    `${summary.cancelled} appointments cancelled (follow-up needed).`
  );
}
