import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NursingTask {
  id: string;
  patientName: string;
  ward: string;
  bed: string;
  taskType: string;
  description: string;
  scheduledTime: string;
  status: "pending" | "in_progress" | "completed" | "skipped" | "overdue";
  assignedNurse: string;
  vitalBp: string;
  vitalPulse: string;
  vitalTemp: string;
  vitalSpo2: string;
}

export interface NursingData {
  tasks: NursingTask[];
  admitted: number;
  medsDueNow: number;
  vitalsPending: number;
  dischargeToday: number;
  loading: boolean;
  error: string | null;
}

const MOCK_TASKS: NursingTask[] = [
  { id: "1", patientName: "Ramesh Kumar (Bed 3)", ward: "General", bed: "3", taskType: "medication", description: "Yogaraja Guggulu 2 tabs", scheduledTime: "14:00", status: "pending", assignedNurse: "Nurse Priya", vitalBp: "130/84", vitalPulse: "78", vitalTemp: "98.4", vitalSpo2: "97" },
  { id: "2", patientName: "Sunil Menon (Bed 5)", ward: "General", bed: "5", taskType: "dressing", description: "Post-Ksharasutra dressing change", scheduledTime: "10:00", status: "pending", assignedNurse: "Nurse Anu", vitalBp: "122/78", vitalPulse: "72", vitalTemp: "98.2", vitalSpo2: "98" },
  { id: "3", patientName: "Meera Nair (PK Suite 2)", ward: "Panchakarma", bed: "PK-2", taskType: "medication", description: "Snehapana - Indukantham Ghritam 50ml", scheduledTime: "06:00", status: "completed", assignedNurse: "Nurse Kavitha", vitalBp: "118/74", vitalPulse: "68", vitalTemp: "98.0", vitalSpo2: "99" },
];

export const useNursingStation = (ward?: string): NursingData & {
  completeTask: (id: string) => Promise<boolean>;
  refetch: () => void;
} => {
  const [data, setData] = useState<NursingData>({
    tasks: MOCK_TASKS,
    admitted: 12, medsDueNow: 3, vitalsPending: 8, dischargeToday: 4,
    loading: true, error: null,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      let query = (supabase as any).from("hms_nursing_tasks").select("*")
        .in("status", ["pending", "in_progress", "overdue"])
        .order("scheduled_time", { ascending: true });

      if (ward && ward !== "all") query = query.eq("ward", ward);

      const { data: rows, error } = await query;
      if (error) { setData((prev) => ({ ...prev, loading: false, error: error.message })); return; }
      if (!rows || rows.length === 0) { setData((prev) => ({ ...prev, loading: false })); return; }

      const tasks: NursingTask[] = rows.map((r: any) => ({
        id: r.id, patientName: r.patient_name, ward: r.ward || "", bed: r.bed || "",
        taskType: r.task_type, description: r.description, scheduledTime: r.scheduled_time ? new Date(r.scheduled_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "",
        status: r.status, assignedNurse: r.assigned_nurse || "",
        vitalBp: r.vital_bp || "", vitalPulse: r.vital_pulse || "", vitalTemp: r.vital_temp || "", vitalSpo2: r.vital_spo2 || "",
      }));

      setData({
        tasks,
        admitted: new Set(tasks.map((t) => t.patientName)).size,
        medsDueNow: tasks.filter((t) => t.taskType === "medication" && t.status === "pending").length,
        vitalsPending: tasks.filter((t) => t.taskType === "vitals" && t.status === "pending").length,
        dischargeToday: tasks.filter((t) => t.taskType === "discharge_prep").length,
        loading: false, error: null,
      });
    } catch (err: any) {
      setData((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  }, [ward]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const completeTask = async (id: string): Promise<boolean> => {
    const { error } = await (supabase as any).from("hms_nursing_tasks")
      .update({ status: "completed", completed_time: new Date().toISOString() }).eq("id", id);
    if (!error) setData((prev) => ({ ...prev, tasks: prev.tasks.map((t) => t.id === id ? { ...t, status: "completed" as const } : t) }));
    return !error;
  };

  return { ...data, completeTask, refetch: fetchData };
};
