import { supabase } from "@/integrations/supabase/client";

export type MarkAttendanceParams = {
  staff_id: string;
  employee_id: string;
  employee_name: string;
  status: "present" | "absent" | "half_day" | "late" | "on_duty" | "wfh" | "leave" | "holiday" | "week_off";
  check_in?: string; // ISO timestamp
  leave_type?: string;
  notes?: string;
  branch?: string;
};

export function useAttendance() {
  const markAttendance = async (params: MarkAttendanceParams) => {
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await (supabase as any)
      .from("hms_attendance")
      .upsert({
        staff_id: params.staff_id,
        employee_id: params.employee_id,
        employee_name: params.employee_name,
        attendance_date: today,
        check_in: params.check_in || (params.status === "present" ? new Date().toISOString() : null),
        status: params.status,
        leave_type: params.leave_type || null,
        notes: params.notes || null,
        branch: params.branch || "Main Branch",
      }, { onConflict: "staff_id,attendance_date" })
      .select("id")
      .single();

    if (error) throw error;
    return { id: data.id };
  };

  const checkOut = async (staffId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const checkOutTime = new Date().toISOString();

    // Get check-in time to calculate hours
    const { data: record } = await (supabase as any)
      .from("hms_attendance")
      .select("check_in")
      .eq("staff_id", staffId)
      .eq("attendance_date", today)
      .single();

    let totalHours = 0;
    if (record?.check_in) {
      totalHours = Math.round(((new Date(checkOutTime).getTime() - new Date(record.check_in).getTime()) / 3600000) * 100) / 100;
    }

    const { error } = await (supabase as any)
      .from("hms_attendance")
      .update({ check_out: checkOutTime, total_hours: totalHours })
      .eq("staff_id", staffId)
      .eq("attendance_date", today);

    if (error) throw error;
    return { totalHours };
  };

  const getTodayAttendance = async (branch = "Main Branch") => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await (supabase as any)
      .from("hms_attendance")
      .select("*")
      .eq("attendance_date", today)
      .eq("branch", branch)
      .order("employee_name");

    if (error) throw error;
    return data || [];
  };

  const getMonthlyReport = async (staffId: string, month: number, year: number) => {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10); // last day

    const { data, error } = await (supabase as any)
      .from("hms_attendance")
      .select("*")
      .eq("staff_id", staffId)
      .gte("attendance_date", startDate)
      .lte("attendance_date", endDate)
      .order("attendance_date");

    if (error) throw error;
    return data || [];
  };

  return { markAttendance, checkOut, getTodayAttendance, getMonthlyReport };
}
