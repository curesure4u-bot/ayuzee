import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type JobStatus = "open" | "in_progress" | "completed" | "overdue";
export type JobPriority = "low" | "medium" | "high" | "critical";
export type JobType = "corrective" | "preventive" | "periodic";

export interface MaintenanceJob {
  id: string;
  jobNo: string;
  title: string;
  department: string;
  location: string;
  priority: JobPriority;
  reportedBy: string;
  assignedTo: string;
  reportedDate: string;
  dueDate: string;
  status: JobStatus;
  type: JobType;
  notes: string;
}

const MOCK_JOBS: MaintenanceJob[] = [
  { id: "1", jobNo: "MNT-0234", title: "AC not cooling - PK Room 2", department: "Panchakarma", location: "Block B, PK-2", priority: "high", reportedBy: "Nurse Kavitha", assignedTo: "Rajesh (Electrician)", reportedDate: "2026-08-07 08:30", dueDate: "2026-08-07", status: "in_progress", type: "corrective", notes: "" },
  { id: "2", jobNo: "MNT-0233", title: "Shirodhara pot stand loose bolt", department: "Panchakarma", location: "Block B, PK-1", priority: "medium", reportedBy: "Therapist Suresh", assignedTo: "Mohan (Fitter)", reportedDate: "2026-08-06", dueDate: "2026-08-07", status: "open", type: "corrective", notes: "" },
  { id: "3", jobNo: "MNT-0232", title: "Water heater not working - Room 201", department: "IPD", location: "2nd Floor, Room 201", priority: "high", reportedBy: "Front Office", assignedTo: "Rajesh (Electrician)", reportedDate: "2026-08-06", dueDate: "2026-08-06", status: "overdue", type: "corrective", notes: "" },
  { id: "4", jobNo: "MNT-0231", title: "Monthly generator service", department: "Admin", location: "Generator Room", priority: "medium", reportedBy: "System (Auto)", assignedTo: "External Vendor", reportedDate: "2026-08-07", dueDate: "2026-08-20", status: "open", type: "periodic", notes: "" },
  { id: "5", jobNo: "MNT-0230", title: "Fire extinguisher refill (Block A)", department: "Safety", location: "All floors - Block A", priority: "medium", reportedBy: "System (Auto)", assignedTo: "Fire Safety Co.", reportedDate: "2026-08-01", dueDate: "2026-08-31", status: "in_progress", type: "periodic", notes: "" },
  { id: "6", jobNo: "MNT-0229", title: "Plumbing leak fixed - Kitchen", department: "Kitchen", location: "Ground Floor Kitchen", priority: "high", reportedBy: "Kitchen Manager", assignedTo: "Vijay (Plumber)", reportedDate: "2026-08-05", dueDate: "2026-08-05", status: "completed", type: "corrective", notes: "" },
];

export const useMaintenance = () => {
  const [jobs, setJobs] = useState<MaintenanceJob[]>(MOCK_JOBS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_maintenance_jobs")
        .select("*")
        .order("reported_date", { ascending: false })
        .limit(50);

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }

      if (data && data.length > 0) {
        const mapped: MaintenanceJob[] = data.map((r: any) => ({
          id: r.id,
          jobNo: r.job_no || "",
          title: r.title || "",
          department: r.department || "",
          location: r.location_detail || "",
          priority: r.priority || "medium",
          reportedBy: r.reported_by || "",
          assignedTo: r.assigned_to || "",
          reportedDate: r.reported_date || "",
          dueDate: r.due_date || "",
          status: r.status || "open",
          type: r.job_type || "corrective",
          notes: r.notes || "",
        }));
        setJobs(mapped);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateStatus = async (id: string, status: JobStatus): Promise<boolean> => {
    const updates: Record<string, any> = { status };
    if (status === "completed") updates.completed_at = new Date().toISOString();

    const { error: updateErr } = await (supabase as any)
      .from("hms_maintenance_jobs")
      .update(updates)
      .eq("id", id);

    if (updateErr) {
      setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status } : j));
      return true;
    }
    await fetchJobs();
    return true;
  };

  const createJob = async (job: Omit<MaintenanceJob, "id" | "jobNo" | "status">): Promise<boolean> => {
    const payload = {
      job_no: `MNT-${String(Date.now()).slice(-4)}`,
      title: job.title,
      department: job.department,
      location_detail: job.location,
      priority: job.priority,
      reported_by: job.reportedBy,
      assigned_to: job.assignedTo,
      due_date: job.dueDate,
      job_type: job.type,
      notes: job.notes,
      status: "open",
    };

    const { error: insertErr } = await (supabase as any)
      .from("hms_maintenance_jobs")
      .insert(payload);

    if (insertErr) {
      const newJob: MaintenanceJob = {
        ...job, id: `MJ-${Date.now()}`, jobNo: payload.job_no, status: "open",
      };
      setJobs((prev) => [newJob, ...prev]);
      return true;
    }
    await fetchJobs();
    return true;
  };

  const activeCount = jobs.filter((j) => j.status === "open" || j.status === "in_progress").length;
  const overdueCount = jobs.filter((j) => j.status === "overdue").length;
  const completedCount = jobs.filter((j) => j.status === "completed").length;
  const periodicCount = jobs.filter((j) => j.type === "periodic").length;

  return {
    jobs,
    loading,
    error,
    activeCount,
    overdueCount,
    completedCount,
    periodicCount,
    updateStatus,
    createJob,
    refetch: fetchJobs,
  };
};
