import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WorkforceStats {
  totalEmployees: number;
  activeEmployees: number;
  onProbation: number;
  onNoticePeriod: number;
  newJoiners: number; // last 30 days
  relievedThisMonth: number;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  onLeave: number;
  halfDay: number;
  weeklyOff: number;
  attendancePercentage: number;
}

export interface DepartmentBreakdown {
  department: string;
  count: number;
}

export interface HrAlert {
  id: string;
  type: "warning" | "info" | "critical";
  title: string;
  description: string;
  module: string;
}

export interface HrmsDashboardData {
  workforce: WorkforceStats;
  attendance: AttendanceStats;
  departments: DepartmentBreakdown[];
  alerts: HrAlert[];
  recentJoiners: { id: string; name: string; role: string; department: string; joinDate: string }[];
  loading: boolean;
  error: string | null;
}

// ─── Mock / Fallback Data ────────────────────────────────────────────────────

const MOCK_WORKFORCE: WorkforceStats = {
  totalEmployees: 24,
  activeEmployees: 20,
  onProbation: 3,
  onNoticePeriod: 1,
  newJoiners: 2,
  relievedThisMonth: 0,
};

const MOCK_ATTENDANCE: AttendanceStats = {
  present: 16,
  absent: 2,
  onLeave: 1,
  halfDay: 1,
  weeklyOff: 4,
  attendancePercentage: 85,
};

const MOCK_DEPARTMENTS: DepartmentBreakdown[] = [
  { department: "Panchakarma", count: 6 },
  { department: "Ayurveda", count: 4 },
  { department: "Front Office", count: 3 },
  { department: "Pharmacy", count: 3 },
  { department: "Laboratory", count: 2 },
  { department: "Administration", count: 3 },
  { department: "IPD / Nursing", count: 2 },
  { department: "Housekeeping", count: 1 },
];

const MOCK_ALERTS: HrAlert[] = [
  { id: "1", type: "warning", title: "Probation Ending", description: "Mohan P's probation ends in 5 days. Confirmation decision needed.", module: "employees" },
  { id: "2", type: "info", title: "Training Due", description: "3 staff need to complete mandatory Fire Safety training this month.", module: "training" },
  { id: "3", type: "critical", title: "Registration Expiring", description: "Dr. Meena's TNBIM registration expires on Sept 15, 2026.", module: "documents" },
  { id: "4", type: "warning", title: "Attendance Alert", description: "Sunita M has been absent for 3 consecutive days without leave application.", module: "attendance" },
  { id: "5", type: "info", title: "Leave Pending", description: "2 leave requests awaiting HR approval.", module: "leave" },
];

const MOCK_RECENT_JOINERS = [
  { id: "1", name: "Preethi S", role: "Therapist", department: "Panchakarma", joinDate: "2026-08-01" },
  { id: "2", name: "Karthik R", role: "Lab Technician", department: "Laboratory", joinDate: "2026-07-20" },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useHrmsDashboard = (): HrmsDashboardData & { refetch: () => void } => {
  const [data, setData] = useState<HrmsDashboardData>({
    workforce: MOCK_WORKFORCE,
    attendance: MOCK_ATTENDANCE,
    departments: MOCK_DEPARTMENTS,
    alerts: MOCK_ALERTS,
    recentJoiners: MOCK_RECENT_JOINERS,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch all active employees
      const { data: employees, error: empError } = await (supabase as any)
        .from("hms_staff")
        .select("id, name, role, department, employee_status, today_attendance, join_date, employment_type")
        .eq("is_active", true)
        .order("name");

      if (empError) {
        console.warn("HRMS Dashboard fetch error (using fallback):", empError.message);
        setData((prev) => ({ ...prev, loading: false, error: empError.message }));
        return;
      }

      if (!employees || employees.length === 0) {
        setData((prev) => ({ ...prev, loading: false }));
        return;
      }

      // Calculate workforce stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const workforce: WorkforceStats = {
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e: any) => e.employee_status === "active" || !e.employee_status).length,
        onProbation: employees.filter((e: any) => e.employee_status === "probation" || e.employment_type === "probation").length,
        onNoticePeriod: employees.filter((e: any) => e.employee_status === "notice_period").length,
        newJoiners: employees.filter((e: any) => e.join_date && new Date(e.join_date) >= thirtyDaysAgo).length,
        relievedThisMonth: employees.filter((e: any) => e.employee_status === "relieved").length,
      };

      // Calculate attendance stats
      const attendance: AttendanceStats = {
        present: employees.filter((e: any) => e.today_attendance === "present").length,
        absent: employees.filter((e: any) => e.today_attendance === "absent").length,
        onLeave: employees.filter((e: any) => e.today_attendance === "leave").length,
        halfDay: employees.filter((e: any) => e.today_attendance === "half_day").length,
        weeklyOff: employees.filter((e: any) => e.today_attendance === "holiday").length,
        attendancePercentage: 0,
      };
      const workingStaff = workforce.activeEmployees - attendance.weeklyOff;
      attendance.attendancePercentage = workingStaff > 0
        ? Math.round(((attendance.present + attendance.halfDay * 0.5) / workingStaff) * 100)
        : 0;

      // Department breakdown
      const deptMap = new Map<string, number>();
      employees.forEach((e: any) => {
        const dept = e.department || "Unassigned";
        deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
      });
      const departments: DepartmentBreakdown[] = Array.from(deptMap.entries())
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count);

      // Recent joiners (last 60 days)
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const recentJoiners = employees
        .filter((e: any) => e.join_date && new Date(e.join_date) >= sixtyDaysAgo)
        .map((e: any) => ({
          id: e.id,
          name: e.name,
          role: e.role,
          department: e.department,
          joinDate: e.join_date,
        }))
        .slice(0, 5);

      setData({
        workforce,
        attendance,
        departments,
        alerts: MOCK_ALERTS, // Alerts require more complex queries — keep mock for now
        recentJoiners: recentJoiners.length > 0 ? recentJoiners : MOCK_RECENT_JOINERS,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("HRMS Dashboard error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refetch: fetchData };
};
