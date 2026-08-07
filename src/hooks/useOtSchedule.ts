import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OtRoom {
  id: string;
  name: string;
  type: string;
  status: "available" | "in_use" | "cleaning" | "maintenance";
  currentCase: string;
  utilizationToday: number;
}

export interface OtScheduleEntry {
  id: string;
  otRoom: string;
  patient: string;
  procedure: string;
  surgeon: string;
  anesthetist: string;
  nursingTeam: string;
  scheduledTime: string;
  duration: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "delayed";
  type: "elective" | "emergency";
}

export interface OtData {
  rooms: OtRoom[];
  schedule: OtScheduleEntry[];
  inProgress: number;
  upcoming: number;
  completed: number;
  loading: boolean;
  error: string | null;
}

const MOCK_ROOMS: OtRoom[] = [
  { id: "1", name: "OT-1 (Major)", type: "General Surgery", status: "in_use", currentCase: "Ksharasutra - Fistula", utilizationToday: 75 },
  { id: "2", name: "OT-2 (Minor)", type: "Minor Procedures", status: "available", currentCase: "", utilizationToday: 40 },
  { id: "3", name: "OT-3 (Panchakarma Surgical)", type: "Ayurveda Para-Surgical", status: "cleaning", currentCase: "", utilizationToday: 60 },
  { id: "4", name: "OT-4 (Emergency)", type: "Emergency", status: "available", currentCase: "", utilizationToday: 20 },
];

const MOCK_SCHEDULE: OtScheduleEntry[] = [
  { id: "1", otRoom: "OT-1", patient: "Sunil Menon", procedure: "Ksharasutra Application (Fistula)", surgeon: "Dr. Nair", anesthetist: "Dr. Anand (LA)", nursingTeam: "Nurse Priya, Nurse Anu", scheduledTime: "09:00-10:30", duration: "90 min", status: "in_progress", type: "elective" },
  { id: "2", otRoom: "OT-3", patient: "Ramesh Kumar", procedure: "Agnikarma - Bilateral Heel", surgeon: "Dr. Nair", anesthetist: "N/A (Local)", nursingTeam: "Nurse Kavitha", scheduledTime: "10:00-10:30", duration: "30 min", status: "completed", type: "elective" },
  { id: "3", otRoom: "OT-2", patient: "Lakshmi Devi", procedure: "Jalaukavacharana (Leech Therapy)", surgeon: "Dr. Sharma", anesthetist: "N/A", nursingTeam: "Nurse Priya", scheduledTime: "11:00-11:45", duration: "45 min", status: "scheduled", type: "elective" },
  { id: "4", otRoom: "OT-1", patient: "Anand Sharma", procedure: "Raktamokshana (Bloodletting)", surgeon: "Dr. Nair", anesthetist: "N/A (Local)", nursingTeam: "Nurse Anu", scheduledTime: "11:30-12:00", duration: "30 min", status: "scheduled", type: "elective" },
];

export const useOtSchedule = (date?: string): OtData & {
  updateStatus: (id: string, status: string) => Promise<boolean>;
  refetch: () => void;
} => {
  const targetDate = date || new Date().toISOString().split("T")[0];
  const [data, setData] = useState<OtData>({
    rooms: MOCK_ROOMS, schedule: MOCK_SCHEDULE,
    inProgress: 1, upcoming: 2, completed: 1,
    loading: true, error: null,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [{ data: rooms, error: roomErr }, { data: schedule, error: schErr }] = await Promise.all([
        (supabase as any).from("hms_ot_rooms").select("*").eq("is_active", true),
        (supabase as any).from("hms_ot_schedule").select("*").eq("schedule_date", targetDate).order("scheduled_time"),
      ]);

      if (roomErr && schErr) { setData((prev) => ({ ...prev, loading: false, error: roomErr?.message })); return; }
      if ((!rooms || rooms.length === 0) && (!schedule || schedule.length === 0)) { setData((prev) => ({ ...prev, loading: false })); return; }

      const mappedRooms: OtRoom[] = (rooms || []).map((r: any) => ({
        id: r.id, name: r.name, type: r.room_type || "", status: r.status,
        currentCase: r.current_case || "", utilizationToday: r.utilization_today || 0,
      }));

      const mappedSchedule: OtScheduleEntry[] = (schedule || []).map((s: any) => ({
        id: s.id, otRoom: s.ot_room, patient: s.patient_name, procedure: s.procedure_name,
        surgeon: s.surgeon_name || "", anesthetist: s.anesthetist || "", nursingTeam: s.nursing_team || "",
        scheduledTime: s.scheduled_time || "", duration: s.duration || "", status: s.status, type: s.procedure_type,
      }));

      const finalSchedule = mappedSchedule.length > 0 ? mappedSchedule : MOCK_SCHEDULE;
      setData({
        rooms: mappedRooms.length > 0 ? mappedRooms : MOCK_ROOMS,
        schedule: finalSchedule,
        inProgress: finalSchedule.filter((s) => s.status === "in_progress").length,
        upcoming: finalSchedule.filter((s) => s.status === "scheduled").length,
        completed: finalSchedule.filter((s) => s.status === "completed").length,
        loading: false, error: null,
      });
    } catch (err: any) {
      setData((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  }, [targetDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: string, status: string): Promise<boolean> => {
    const updates: Record<string, any> = { status };
    if (status === "in_progress") updates.started_at = new Date().toISOString();
    if (status === "completed") updates.completed_at = new Date().toISOString();
    const { error } = await (supabase as any).from("hms_ot_schedule").update(updates).eq("id", id);
    if (!error) fetchData();
    return !error;
  };

  return { ...data, updateStatus, refetch: fetchData };
};
