import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  annualQuota: number;
  maxConsecutiveDays: number;
  minAdvanceNotice: number;
  isPaid: boolean;
  isCarryForward: boolean;
  requiresDocument: boolean;
  documentAfterDays: number;
  color: string;
  isActive: boolean;
}

export interface LeaveBalance {
  id: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  color: string;
  credited: number;
  used: number;
  pending: number;
  available: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  isHalfDay: boolean;
  halfDayType: string | null;
  reason: string;
  documentUrl: string | null;
  status: "pending" | "manager_approved" | "approved" | "rejected" | "cancelled" | "revoked";
  managerRemarks: string | null;
  hrRemarks: string | null;
  appliedAt: string;
}

export interface ApplyLeaveInput {
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  isHalfDay: boolean;
  halfDayType?: string;
  reason: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_LEAVE_TYPES: LeaveType[] = [
  { id: "lt1", name: "Casual Leave", code: "CL", annualQuota: 12, maxConsecutiveDays: 3, minAdvanceNotice: 1, isPaid: true, isCarryForward: false, requiresDocument: false, documentAfterDays: 0, color: "#3B82F6", isActive: true },
  { id: "lt2", name: "Sick Leave", code: "SL", annualQuota: 12, maxConsecutiveDays: 7, minAdvanceNotice: 0, isPaid: true, isCarryForward: false, requiresDocument: true, documentAfterDays: 2, color: "#EF4444", isActive: true },
  { id: "lt3", name: "Earned Leave", code: "EL", annualQuota: 15, maxConsecutiveDays: 15, minAdvanceNotice: 7, isPaid: true, isCarryForward: true, requiresDocument: false, documentAfterDays: 0, color: "#8B5CF6", isActive: true },
  { id: "lt4", name: "Compensatory Off", code: "CO", annualQuota: 0, maxConsecutiveDays: 2, minAdvanceNotice: 1, isPaid: true, isCarryForward: false, requiresDocument: false, documentAfterDays: 0, color: "#10B981", isActive: true },
  { id: "lt5", name: "Loss of Pay", code: "LOP", annualQuota: 365, maxConsecutiveDays: 365, minAdvanceNotice: 1, isPaid: false, isCarryForward: false, requiresDocument: false, documentAfterDays: 0, color: "#6B7280", isActive: true },
  { id: "lt6", name: "On Duty", code: "OD", annualQuota: 30, maxConsecutiveDays: 5, minAdvanceNotice: 1, isPaid: true, isCarryForward: false, requiresDocument: false, documentAfterDays: 0, color: "#F59E0B", isActive: true },
];

const MOCK_BALANCES: LeaveBalance[] = [
  { id: "b1", leaveTypeId: "lt1", leaveTypeName: "Casual Leave", leaveTypeCode: "CL", color: "#3B82F6", credited: 12, used: 4, pending: 1, available: 7 },
  { id: "b2", leaveTypeId: "lt2", leaveTypeName: "Sick Leave", leaveTypeCode: "SL", color: "#EF4444", credited: 12, used: 2, pending: 0, available: 10 },
  { id: "b3", leaveTypeId: "lt3", leaveTypeName: "Earned Leave", leaveTypeCode: "EL", color: "#8B5CF6", credited: 15, used: 3, pending: 2, available: 10 },
  { id: "b4", leaveTypeId: "lt4", leaveTypeName: "Compensatory Off", leaveTypeCode: "CO", color: "#10B981", credited: 2, used: 1, pending: 0, available: 1 },
  { id: "b5", leaveTypeId: "lt5", leaveTypeName: "Loss of Pay", leaveTypeCode: "LOP", color: "#6B7280", credited: 365, used: 0, pending: 0, available: 365 },
];

const MOCK_REQUESTS: LeaveRequest[] = [
  { id: "lr1", employeeId: "9", employeeName: "Mohan P", employeeCode: "EMP-0009", department: "Panchakarma", leaveTypeId: "lt1", leaveTypeName: "Casual Leave", leaveTypeCode: "CL", fromDate: "2026-08-25", toDate: "2026-08-26", totalDays: 2, isHalfDay: false, halfDayType: null, reason: "Family function", documentUrl: null, status: "pending", managerRemarks: null, hrRemarks: null, appliedAt: "2026-08-20T10:00:00Z" },
  { id: "lr2", employeeId: "4", employeeName: "Sunita M", employeeCode: "EMP-0004", department: "IPD", leaveTypeId: "lt2", leaveTypeName: "Sick Leave", leaveTypeCode: "SL", fromDate: "2026-08-21", toDate: "2026-08-23", totalDays: 3, isHalfDay: false, halfDayType: null, reason: "Medical appointment and rest", documentUrl: null, status: "pending", managerRemarks: null, hrRemarks: null, appliedAt: "2026-08-19T09:30:00Z" },
  { id: "lr3", employeeId: "3", employeeName: "Rajesh K", employeeCode: "EMP-0003", department: "Front Office", leaveTypeId: "lt3", leaveTypeName: "Earned Leave", leaveTypeCode: "EL", fromDate: "2026-09-01", toDate: "2026-09-05", totalDays: 5, isHalfDay: false, halfDayType: null, reason: "Annual family vacation", documentUrl: null, status: "manager_approved", managerRemarks: "Approved. Coverage arranged.", hrRemarks: null, appliedAt: "2026-08-15T14:00:00Z" },
  { id: "lr4", employeeId: "7", employeeName: "Suresh Therapist", employeeCode: "EMP-0007", department: "Panchakarma", leaveTypeId: "lt1", leaveTypeName: "Casual Leave", leaveTypeCode: "CL", fromDate: "2026-08-18", toDate: "2026-08-18", totalDays: 0.5, isHalfDay: true, halfDayType: "second_half", reason: "Personal work", documentUrl: null, status: "approved", managerRemarks: null, hrRemarks: "OK", appliedAt: "2026-08-16T08:00:00Z" },
  { id: "lr5", employeeId: "6", employeeName: "Anita D", employeeCode: "EMP-0006", department: "Laboratory", leaveTypeId: "lt1", leaveTypeName: "Casual Leave", leaveTypeCode: "CL", fromDate: "2026-08-10", toDate: "2026-08-10", totalDays: 1, isHalfDay: false, halfDayType: null, reason: "Personal emergency", documentUrl: null, status: "rejected", managerRemarks: null, hrRemarks: "Staff shortage on that day. Please reschedule.", appliedAt: "2026-08-08T11:00:00Z" },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useHrmsLeave = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(MOCK_LEAVE_TYPES);
  const [balances, setBalances] = useState<LeaveBalance[]>(MOCK_BALANCES);
  const [requests, setRequests] = useState<LeaveRequest[]>(MOCK_REQUESTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch leave types
      const { data: types, error: typesErr } = await (supabase as any)
        .from("hrms_leave_types")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (typesErr) {
        setError(typesErr.message);
        setLoading(false);
        return;
      }

      if (types && types.length > 0) {
        setLeaveTypes(types.map((t: any) => ({
          id: t.id,
          name: t.name,
          code: t.code,
          annualQuota: t.annual_quota,
          maxConsecutiveDays: t.max_consecutive_days,
          minAdvanceNotice: t.min_days_advance_notice,
          isPaid: t.is_paid,
          isCarryForward: t.is_carry_forward,
          requiresDocument: t.requires_document,
          documentAfterDays: t.document_after_days,
          color: t.color,
          isActive: t.is_active,
        })));
      }

      // 2. Fetch current user's leave balances
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;

      if (uid) {
        // Get employee_id for current user
        const { data: empRow } = await (supabase as any)
          .from("hms_staff")
          .select("id")
          .eq("user_id", uid)
          .eq("is_active", true)
          .maybeSingle();

        if (empRow) {
          const currentYear = new Date().getFullYear();
          const { data: bals } = await (supabase as any)
            .from("hrms_leave_balances")
            .select("*, hrms_leave_types(name, code, color)")
            .eq("employee_id", empRow.id)
            .eq("year", currentYear);

          if (bals && bals.length > 0) {
            setBalances(bals.map((b: any) => ({
              id: b.id,
              leaveTypeId: b.leave_type_id,
              leaveTypeName: b.hrms_leave_types?.name || "Unknown",
              leaveTypeCode: b.hrms_leave_types?.code || "?",
              color: b.hrms_leave_types?.color || "#6B7280",
              credited: Number(b.credited) || 0,
              used: Number(b.used) || 0,
              pending: Number(b.pending) || 0,
              available: Number(b.available) || 0,
            })));
          }
        }
      }

      // 3. Fetch leave requests (HR sees all pending, employee sees own)
      const { data: reqs } = await (supabase as any)
        .from("hrms_leave_requests")
        .select("*, hms_staff(name, employee_code, department), hrms_leave_types(name, code)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (reqs && reqs.length > 0) {
        setRequests(reqs.map((r: any) => ({
          id: r.id,
          employeeId: r.employee_id,
          employeeName: r.hms_staff?.name || "Unknown",
          employeeCode: r.hms_staff?.employee_code || "",
          department: r.hms_staff?.department || "",
          leaveTypeId: r.leave_type_id,
          leaveTypeName: r.hrms_leave_types?.name || "Unknown",
          leaveTypeCode: r.hrms_leave_types?.code || "?",
          fromDate: r.from_date,
          toDate: r.to_date,
          totalDays: Number(r.total_days),
          isHalfDay: r.is_half_day,
          halfDayType: r.half_day_type,
          reason: r.reason,
          documentUrl: r.document_url,
          status: r.status,
          managerRemarks: r.manager_remarks,
          hrRemarks: r.hr_remarks,
          appliedAt: r.created_at,
        })));
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Apply Leave ─────────────────────────────────────────────────────────

  const applyLeave = async (input: ApplyLeaveInput): Promise<boolean> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;
      if (!uid) return false;

      // Get employee_id
      const { data: emp } = await (supabase as any)
        .from("hms_staff")
        .select("id, branch_id, organisation_id")
        .eq("user_id", uid)
        .eq("is_active", true)
        .maybeSingle();

      if (!emp) return false;

      const { error } = await (supabase as any)
        .from("hrms_leave_requests")
        .insert({
          employee_id: emp.id,
          leave_type_id: input.leaveTypeId,
          from_date: input.fromDate,
          to_date: input.toDate,
          total_days: input.totalDays,
          is_half_day: input.isHalfDay,
          half_day_type: input.halfDayType || null,
          reason: input.reason,
          status: "pending",
          applied_by: uid,
          branch_id: emp.branch_id,
          organisation_id: emp.organisation_id,
        });

      if (error) {
        console.error("Apply leave error:", error);
        return false;
      }

      await fetchAll();
      return true;
    } catch {
      return false;
    }
  };

  // ─── Approve Leave ───────────────────────────────────────────────────────

  const approveLeave = async (requestId: string, remarks?: string): Promise<boolean> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;

      const { error } = await (supabase as any)
        .from("hrms_leave_requests")
        .update({
          status: "approved",
          hr_action_by: uid,
          hr_action_at: new Date().toISOString(),
          hr_remarks: remarks || "Approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) return false;

      setRequests((prev) =>
        prev.map((r) => r.id === requestId ? { ...r, status: "approved" as const, hrRemarks: remarks || "Approved" } : r)
      );
      return true;
    } catch {
      return false;
    }
  };

  // ─── Reject Leave ────────────────────────────────────────────────────────

  const rejectLeave = async (requestId: string, reason: string): Promise<boolean> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;

      const { error } = await (supabase as any)
        .from("hrms_leave_requests")
        .update({
          status: "rejected",
          hr_action_by: uid,
          hr_action_at: new Date().toISOString(),
          hr_remarks: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) return false;

      setRequests((prev) =>
        prev.map((r) => r.id === requestId ? { ...r, status: "rejected" as const, hrRemarks: reason } : r)
      );
      return true;
    } catch {
      return false;
    }
  };

  // ─── Cancel Leave (by employee) ─────────────────────────────────────────

  const cancelLeave = async (requestId: string, reason?: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from("hrms_leave_requests")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancel_reason: reason || "Cancelled by employee",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) return false;

      setRequests((prev) =>
        prev.map((r) => r.id === requestId ? { ...r, status: "cancelled" as const } : r)
      );
      return true;
    } catch {
      return false;
    }
  };

  // ─── Computed values ─────────────────────────────────────────────────────

  const pendingRequests = requests.filter((r) => r.status === "pending" || r.status === "manager_approved");
  const approvedRequests = requests.filter((r) => r.status === "approved");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");

  return {
    leaveTypes,
    balances,
    requests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    loading,
    error,
    applyLeave,
    approveLeave,
    rejectLeave,
    cancelLeave,
    refetch: fetchAll,
  };
};
