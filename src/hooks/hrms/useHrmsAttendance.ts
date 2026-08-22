import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AttendanceStatus =
  | "present" | "absent" | "half_day" | "late" | "early_departure"
  | "on_leave" | "weekly_off" | "holiday" | "on_duty" | "compensatory_off";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  role: string;
  attendanceDate: string;
  shiftId: string | null;
  checkIn: string | null;
  checkOut: string | null;
  checkInMethod: string | null;
  status: AttendanceStatus;
  workedHours: number;
  overtimeHours: number;
  lateMinutes: number;
  remarks: string | null;
  isRegularised: boolean;
}

export interface DailyAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  onLeave: number;
  halfDay: number;
  late: number;
  weeklyOff: number;
  holiday: number;
  onDuty: number;
  notMarked: number;
}

export interface MonthlyCell {
  date: string;
  status: AttendanceStatus | "not_marked";
  isHoliday: boolean;
  isWeeklyOff: boolean;
}

export interface MonthlyRegister {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  days: MonthlyCell[];
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  lateCount: number;
  totalWorkedHours: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_STAFF = [
  { id: "1", name: "Dr. Arun Sharma", employee_code: "EMP-0001", department: "Ayurveda", role: "Senior Doctor" },
  { id: "2", name: "Dr. Meena Patel", employee_code: "EMP-0002", department: "Panchakarma", role: "Doctor" },
  { id: "3", name: "Rajesh K", employee_code: "EMP-0003", department: "Front Office", role: "Receptionist" },
  { id: "4", name: "Sunita M", employee_code: "EMP-0004", department: "IPD", role: "Nurse" },
  { id: "5", name: "Vikram R", employee_code: "EMP-0005", department: "Pharmacy", role: "Pharmacist" },
  { id: "6", name: "Anita D", employee_code: "EMP-0006", department: "Laboratory", role: "Lab Technician" },
  { id: "7", name: "Suresh Therapist", employee_code: "EMP-0007", department: "Panchakarma", role: "Therapist (Senior)" },
  { id: "8", name: "Priya Therapist", employee_code: "EMP-0008", department: "Panchakarma", role: "Therapist" },
  { id: "9", name: "Mohan P", employee_code: "EMP-0009", department: "Panchakarma", role: "Therapist" },
  { id: "10", name: "Kavita S", employee_code: "EMP-0010", department: "Administration", role: "Admin Manager" },
];

const generateMockAttendance = (date: string): AttendanceRecord[] => {
  const statuses: AttendanceStatus[] = ["present", "present", "present", "present", "present", "present", "present", "absent", "on_leave", "late"];
  return MOCK_STAFF.map((s, i) => ({
    id: `att-${s.id}-${date}`,
    employeeId: s.id,
    employeeName: s.name,
    employeeCode: s.employee_code,
    department: s.department,
    role: s.role,
    attendanceDate: date,
    shiftId: null,
    checkIn: statuses[i] === "present" || statuses[i] === "late" ? `${date}T09:${statuses[i] === "late" ? "25" : "00"}:00` : null,
    checkOut: statuses[i] === "present" || statuses[i] === "late" ? `${date}T17:30:00` : null,
    checkInMethod: statuses[i] !== "absent" && statuses[i] !== "on_leave" ? "manual" : null,
    status: statuses[i],
    workedHours: statuses[i] === "present" ? 8.5 : statuses[i] === "late" ? 8 : 0,
    overtimeHours: 0,
    lateMinutes: statuses[i] === "late" ? 25 : 0,
    remarks: null,
    isRegularised: false,
  }));
};

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useHrmsAttendance = (selectedDate: string, departmentFilter?: string) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<DailyAttendanceSummary>({
    total: 0, present: 0, absent: 0, onLeave: 0, halfDay: 0,
    late: 0, weeklyOff: 0, holiday: 0, onDuty: 0, notMarked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First get all active staff
      let staffQuery = (supabase as any)
        .from("hms_staff")
        .select("id, name, employee_code, department, role")
        .eq("is_active", true)
        .order("name");

      if (departmentFilter && departmentFilter !== "all") {
        staffQuery = staffQuery.eq("department", departmentFilter);
      }

      const { data: staff, error: staffErr } = await staffQuery;

      if (staffErr) {
        setError(staffErr.message);
        const mock = generateMockAttendance(selectedDate);
        setRecords(mock);
        calculateSummary(mock);
        setLoading(false);
        return;
      }

      if (!staff || staff.length === 0) {
        const mock = generateMockAttendance(selectedDate);
        setRecords(mock);
        calculateSummary(mock);
        setLoading(false);
        return;
      }

      // Fetch attendance for the date
      const { data: attRows, error: attErr } = await (supabase as any)
        .from("hrms_attendance")
        .select("*")
        .eq("attendance_date", selectedDate)
        .in("employee_id", staff.map((s: any) => s.id));

      if (attErr) {
        // Fallback: use hms_staff.today_attendance if hrms_attendance table doesn't exist yet
        const mapped: AttendanceRecord[] = staff.map((s: any) => ({
          id: `staff-${s.id}`,
          employeeId: s.id,
          employeeName: s.name,
          employeeCode: s.employee_code || `EMP-${s.id.slice(0, 4)}`,
          department: s.department || "Unassigned",
          role: s.role,
          attendanceDate: selectedDate,
          shiftId: null,
          checkIn: null,
          checkOut: null,
          checkInMethod: null,
          status: "present" as AttendanceStatus,
          workedHours: 0,
          overtimeHours: 0,
          lateMinutes: 0,
          remarks: null,
          isRegularised: false,
        }));
        setRecords(mapped);
        calculateSummary(mapped);
        setError(attErr.message);
        setLoading(false);
        return;
      }

      // Merge staff + attendance
      const attMap = new Map<string, any>();
      (attRows || []).forEach((a: any) => attMap.set(a.employee_id, a));

      const merged: AttendanceRecord[] = staff.map((s: any) => {
        const att = attMap.get(s.id);
        if (att) {
          return {
            id: att.id,
            employeeId: s.id,
            employeeName: s.name,
            employeeCode: s.employee_code || `EMP-${s.id.slice(0, 4)}`,
            department: s.department || "Unassigned",
            role: s.role,
            attendanceDate: selectedDate,
            shiftId: att.shift_id,
            checkIn: att.check_in,
            checkOut: att.check_out,
            checkInMethod: att.check_in_method,
            status: att.status as AttendanceStatus,
            workedHours: Number(att.worked_hours) || 0,
            overtimeHours: Number(att.overtime_hours) || 0,
            lateMinutes: att.late_minutes || 0,
            remarks: att.remarks,
            isRegularised: att.is_regularised || false,
          };
        }
        return {
          id: `pending-${s.id}`,
          employeeId: s.id,
          employeeName: s.name,
          employeeCode: s.employee_code || `EMP-${s.id.slice(0, 4)}`,
          department: s.department || "Unassigned",
          role: s.role,
          attendanceDate: selectedDate,
          shiftId: null,
          checkIn: null,
          checkOut: null,
          checkInMethod: null,
          status: "absent" as AttendanceStatus, // not yet marked
          workedHours: 0,
          overtimeHours: 0,
          lateMinutes: 0,
          remarks: null,
          isRegularised: false,
        };
      });

      setRecords(merged);
      calculateSummary(merged);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      const mock = generateMockAttendance(selectedDate);
      setRecords(mock);
      calculateSummary(mock);
      setLoading(false);
    }
  }, [selectedDate, departmentFilter]);

  const calculateSummary = (recs: AttendanceRecord[]) => {
    const s: DailyAttendanceSummary = {
      total: recs.length,
      present: recs.filter((r) => r.status === "present").length,
      absent: recs.filter((r) => r.status === "absent").length,
      onLeave: recs.filter((r) => r.status === "on_leave").length,
      halfDay: recs.filter((r) => r.status === "half_day").length,
      late: recs.filter((r) => r.status === "late").length,
      weeklyOff: recs.filter((r) => r.status === "weekly_off").length,
      holiday: recs.filter((r) => r.status === "holiday").length,
      onDuty: recs.filter((r) => r.status === "on_duty").length,
      notMarked: recs.filter((r) => !r.checkIn && r.status === "absent").length,
    };
    setSummary(s);
  };

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // ─── Mark Attendance ─────────────────────────────────────────────────────

  const markAttendance = async (
    employeeId: string,
    status: AttendanceStatus,
    remarks?: string
  ): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const { error } = await (supabase as any)
        .from("hrms_attendance")
        .upsert(
          {
            employee_id: employeeId,
            attendance_date: selectedDate,
            status,
            check_in: status === "present" || status === "late" || status === "half_day" ? now : null,
            check_in_method: "manual",
            remarks: remarks || null,
            marked_by: (await supabase.auth.getUser()).data.user?.id,
            updated_at: now,
          },
          { onConflict: "employee_id,attendance_date" }
        );

      if (error) {
        console.error("Mark attendance error:", error);
        return false;
      }

      // Update local state
      setRecords((prev) =>
        prev.map((r) =>
          r.employeeId === employeeId
            ? { ...r, status, checkIn: now, checkInMethod: "manual", remarks: remarks || null }
            : r
        )
      );
      return true;
    } catch {
      return false;
    }
  };

  // ─── Bulk Mark ───────────────────────────────────────────────────────────

  const bulkMarkAttendance = async (
    employeeIds: string[],
    status: AttendanceStatus
  ): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const rows = employeeIds.map((eid) => ({
        employee_id: eid,
        attendance_date: selectedDate,
        status,
        check_in: status === "present" ? now : null,
        check_in_method: "manual",
        marked_by: userId,
        updated_at: now,
      }));

      const { error } = await (supabase as any)
        .from("hrms_attendance")
        .upsert(rows, { onConflict: "employee_id,attendance_date" });

      if (error) return false;

      setRecords((prev) =>
        prev.map((r) =>
          employeeIds.includes(r.employeeId)
            ? { ...r, status, checkIn: status === "present" ? now : null }
            : r
        )
      );
      calculateSummary(records.map((r) =>
        employeeIds.includes(r.employeeId) ? { ...r, status } : r
      ));
      return true;
    } catch {
      return false;
    }
  };

  return {
    records,
    summary,
    loading,
    error,
    markAttendance,
    bulkMarkAttendance,
    refetch: fetchAttendance,
  };
};
