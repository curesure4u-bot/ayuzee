import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IncentiveRule {
  id: string;
  name: string;
  code: string;
  description: string | null;
  applicableRoles: string[];
  applicableDepartments: string[];
  metric: string;
  calcType: "fixed" | "percentage" | "slab" | "formula";
  percentage: number;
  fixedAmount: number;
  slabs: { from: number; to: number; amount: number }[];
  minAmount: number;
  maxAmount: number;
  frequency: "monthly" | "quarterly" | "annual";
  isActive: boolean;
}

export interface EmployeeIncentive {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  role: string;
  incentiveRuleId: string;
  ruleName: string;
  ruleCode: string;
  month: number;
  year: number;
  metricValue: number;
  targetValue: number;
  achievementPct: number;
  calculatedAmount: number;
  approvedAmount: number;
  status: "calculated" | "approved" | "paid" | "rejected" | "on_hold";
  remarks: string | null;
}

export interface IncentiveSummary {
  totalCalculated: number;
  totalApproved: number;
  totalPaid: number;
  pendingApproval: number;
  employeesEligible: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_RULES: IncentiveRule[] = [
  { id: "ir1", name: "Doctor Consultation Incentive", code: "DOC-CONS", description: "10% of revenue above ₹2L target", applicableRoles: ["doctor"], applicableDepartments: [], metric: "revenue", calcType: "percentage", percentage: 10, fixedAmount: 0, slabs: [], minAmount: 0, maxAmount: 50000, frequency: "monthly", isActive: true },
  { id: "ir2", name: "Therapist Procedure Incentive", code: "THER-PROC", description: "Slab-based on procedures completed", applicableRoles: ["therapist"], applicableDepartments: ["Panchakarma"], metric: "procedures", calcType: "slab", percentage: 0, fixedAmount: 0, slabs: [{ from: 0, to: 30, amount: 0 }, { from: 31, to: 50, amount: 2000 }, { from: 51, to: 80, amount: 4000 }, { from: 81, to: 999, amount: 7000 }], minAmount: 0, maxAmount: 10000, frequency: "monthly", isActive: true },
  { id: "ir3", name: "Perfect Attendance Bonus", code: "ATTEND-PERF", description: "₹1000 bonus for zero absences", applicableRoles: [], applicableDepartments: [], metric: "attendance", calcType: "fixed", percentage: 0, fixedAmount: 1000, slabs: [], minAmount: 0, maxAmount: 1000, frequency: "monthly", isActive: true },
  { id: "ir4", name: "Pharmacy Sales Incentive", code: "PHARM-SALE", description: "5% of pharmacy sales above ₹1L target", applicableRoles: ["pharmacist"], applicableDepartments: ["Pharmacy"], metric: "revenue", calcType: "percentage", percentage: 5, fixedAmount: 0, slabs: [], minAmount: 0, maxAmount: 15000, frequency: "monthly", isActive: true },
  { id: "ir5", name: "Branch Target Achievement", code: "BRANCH-TGT", description: "Quarterly bonus for branch managers", applicableRoles: [], applicableDepartments: ["Administration"], metric: "target_achievement", calcType: "slab", percentage: 0, fixedAmount: 0, slabs: [{ from: 80, to: 90, amount: 5000 }, { from: 91, to: 100, amount: 10000 }, { from: 101, to: 999, amount: 15000 }], minAmount: 0, maxAmount: 15000, frequency: "quarterly", isActive: true },
];

const MOCK_INCENTIVES: EmployeeIncentive[] = [
  { id: "ei1", employeeId: "1", employeeName: "Dr. Arun Sharma", employeeCode: "EMP-0001", department: "Ayurveda", role: "Senior Doctor", incentiveRuleId: "ir1", ruleName: "Doctor Consultation Incentive", ruleCode: "DOC-CONS", month: 8, year: 2026, metricValue: 320000, targetValue: 200000, achievementPct: 160, calculatedAmount: 12000, approvedAmount: 12000, status: "approved", remarks: null },
  { id: "ei2", employeeId: "2", employeeName: "Dr. Meena Patel", employeeCode: "EMP-0002", department: "Panchakarma", role: "Doctor", incentiveRuleId: "ir1", ruleName: "Doctor Consultation Incentive", ruleCode: "DOC-CONS", month: 8, year: 2026, metricValue: 280000, targetValue: 200000, achievementPct: 140, calculatedAmount: 8000, approvedAmount: 8000, status: "approved", remarks: null },
  { id: "ei3", employeeId: "7", employeeName: "Suresh Therapist", employeeCode: "EMP-0007", department: "Panchakarma", role: "Therapist (Senior)", incentiveRuleId: "ir2", ruleName: "Therapist Procedure Incentive", ruleCode: "THER-PROC", month: 8, year: 2026, metricValue: 62, targetValue: 50, achievementPct: 124, calculatedAmount: 4000, approvedAmount: 4000, status: "approved", remarks: null },
  { id: "ei4", employeeId: "8", employeeName: "Priya Therapist", employeeCode: "EMP-0008", department: "Panchakarma", role: "Therapist", incentiveRuleId: "ir2", ruleName: "Therapist Procedure Incentive", ruleCode: "THER-PROC", month: 8, year: 2026, metricValue: 45, targetValue: 50, achievementPct: 90, calculatedAmount: 2000, approvedAmount: 0, status: "calculated", remarks: null },
  { id: "ei5", employeeId: "5", employeeName: "Vikram R", employeeCode: "EMP-0005", department: "Pharmacy", role: "Pharmacist", incentiveRuleId: "ir4", ruleName: "Pharmacy Sales Incentive", ruleCode: "PHARM-SALE", month: 8, year: 2026, metricValue: 160000, targetValue: 100000, achievementPct: 160, calculatedAmount: 3000, approvedAmount: 3000, status: "approved", remarks: null },
  { id: "ei6", employeeId: "3", employeeName: "Rajesh K", employeeCode: "EMP-0003", department: "Front Office", role: "Receptionist", incentiveRuleId: "ir3", ruleName: "Perfect Attendance Bonus", ruleCode: "ATTEND-PERF", month: 8, year: 2026, metricValue: 26, targetValue: 26, achievementPct: 100, calculatedAmount: 1000, approvedAmount: 1000, status: "approved", remarks: "Zero absences" },
  { id: "ei7", employeeId: "10", employeeName: "Kavita S", employeeCode: "EMP-0010", department: "Administration", role: "Admin Manager", incentiveRuleId: "ir5", ruleName: "Branch Target Achievement", ruleCode: "BRANCH-TGT", month: 8, year: 2026, metricValue: 95, targetValue: 100, achievementPct: 95, calculatedAmount: 10000, approvedAmount: 0, status: "calculated", remarks: "Q2 target 95% achieved" },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useHrmsIncentives = (month?: number, year?: number) => {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  const [rules, setRules] = useState<IncentiveRule[]>(MOCK_RULES);
  const [incentives, setIncentives] = useState<EmployeeIncentive[]>(MOCK_INCENTIVES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch incentive rules
      const { data: ruleRows, error: rulesErr } = await (supabase as any)
        .from("hrms_incentive_rules")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (rulesErr) {
        setError(rulesErr.message);
        setLoading(false);
        return;
      }

      if (ruleRows && ruleRows.length > 0) {
        setRules(ruleRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          code: r.code,
          description: r.description,
          applicableRoles: r.applicable_roles || [],
          applicableDepartments: r.applicable_departments || [],
          metric: r.metric,
          calcType: r.calc_type,
          percentage: Number(r.percentage) || 0,
          fixedAmount: Number(r.fixed_amount) || 0,
          slabs: r.slabs || [],
          minAmount: Number(r.min_amount) || 0,
          maxAmount: Number(r.max_amount) || 999999,
          frequency: r.frequency,
          isActive: r.is_active,
        })));
      }

      // 2. Fetch employee incentives for selected period
      const { data: incRows } = await (supabase as any)
        .from("hrms_employee_incentives")
        .select("*, hms_staff(name, employee_code, department, role), hrms_incentive_rules(name, code)")
        .eq("month", m)
        .eq("year", y)
        .order("created_at", { ascending: false });

      if (incRows && incRows.length > 0) {
        setIncentives(incRows.map((i: any) => ({
          id: i.id,
          employeeId: i.employee_id,
          employeeName: i.hms_staff?.name || "Unknown",
          employeeCode: i.hms_staff?.employee_code || "",
          department: i.hms_staff?.department || "",
          role: i.hms_staff?.role || "",
          incentiveRuleId: i.incentive_rule_id,
          ruleName: i.hrms_incentive_rules?.name || "Unknown",
          ruleCode: i.hrms_incentive_rules?.code || "",
          month: i.month,
          year: i.year,
          metricValue: Number(i.metric_value),
          targetValue: Number(i.target_value),
          achievementPct: Number(i.achievement_pct),
          calculatedAmount: Number(i.calculated_amount),
          approvedAmount: Number(i.approved_amount),
          status: i.status,
          remarks: i.remarks,
        })));
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [m, y]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Approve Incentive ───────────────────────────────────────────────────

  const approveIncentive = async (id: string, amount?: number): Promise<boolean> => {
    try {
      const incentive = incentives.find((i) => i.id === id);
      if (!incentive) return false;

      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;

      const { error } = await (supabase as any)
        .from("hrms_employee_incentives")
        .update({
          status: "approved",
          approved_amount: amount ?? incentive.calculatedAmount,
          approved_by: uid,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) return false;

      setIncentives((prev) =>
        prev.map((i) => i.id === id
          ? { ...i, status: "approved" as const, approvedAmount: amount ?? i.calculatedAmount }
          : i
        )
      );
      return true;
    } catch {
      return false;
    }
  };

  // ─── Reject Incentive ────────────────────────────────────────────────────

  const rejectIncentive = async (id: string, reason: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from("hrms_employee_incentives")
        .update({
          status: "rejected",
          remarks: reason,
          approved_amount: 0,
        })
        .eq("id", id);

      if (error) return false;

      setIncentives((prev) =>
        prev.map((i) => i.id === id
          ? { ...i, status: "rejected" as const, approvedAmount: 0, remarks: reason }
          : i
        )
      );
      return true;
    } catch {
      return false;
    }
  };

  // ─── Summary ─────────────────────────────────────────────────────────────

  const summary: IncentiveSummary = {
    totalCalculated: incentives.reduce((s, i) => s + i.calculatedAmount, 0),
    totalApproved: incentives.filter((i) => i.status === "approved" || i.status === "paid").reduce((s, i) => s + i.approvedAmount, 0),
    totalPaid: incentives.filter((i) => i.status === "paid").reduce((s, i) => s + i.approvedAmount, 0),
    pendingApproval: incentives.filter((i) => i.status === "calculated").length,
    employeesEligible: new Set(incentives.map((i) => i.employeeId)).size,
  };

  const pendingIncentives = incentives.filter((i) => i.status === "calculated");
  const approvedIncentives = incentives.filter((i) => i.status === "approved" || i.status === "paid");

  return {
    rules,
    incentives,
    pendingIncentives,
    approvedIncentives,
    summary,
    loading,
    error,
    approveIncentive,
    rejectIncentive,
    refetch: fetchAll,
  };
};
