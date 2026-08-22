import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PayrollRun {
  id: string;
  month: number;
  year: number;
  periodLabel: string;
  status: "draft" | "processing" | "hr_review" | "approved" | "locked" | "cancelled";
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalEmployerContribution: number;
  processedAt: string | null;
  approvedAt: string | null;
  lockedAt: string | null;
}

export interface PayrollItem {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  
  // Attendance
  workingDays: number;
  presentDays: number;
  lopDays: number;
  paidDays: number;
  
  // Earnings
  basic: number;
  hra: number;
  specialAllowance: number;
  medicalAllowance: number;
  conveyance: number;
  overtimePay: number;
  incentive: number;
  bonus: number;
  arrears: number;
  otherEarnings: number;
  grossSalary: number;
  
  // Deductions
  pfEmployee: number;
  esiEmployee: number;
  professionalTax: number;
  tds: number;
  loanDeduction: number;
  advanceDeduction: number;
  lopDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  
  // Net
  netSalary: number;
  paymentStatus: string;
}

export interface SalaryRegisterEntry {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  annualCtc: number;
  monthlyCtc: number;
  basic: number;
  hra: number;
  grossSalary: number;
  netSalary: number;
  bankName: string | null;
  bankAccount: string | null;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PAYROLL_RUNS: PayrollRun[] = [
  { id: "pr1", month: 8, year: 2026, periodLabel: "August 2026", status: "draft", totalEmployees: 10, totalGross: 486000, totalDeductions: 72900, totalNet: 413100, totalEmployerContribution: 45000, processedAt: null, approvedAt: null, lockedAt: null },
  { id: "pr2", month: 7, year: 2026, periodLabel: "July 2026", status: "locked", totalEmployees: 10, totalGross: 481000, totalDeductions: 70500, totalNet: 410500, totalEmployerContribution: 44200, processedAt: "2026-07-26T10:00:00Z", approvedAt: "2026-07-28T14:00:00Z", lockedAt: "2026-07-30T09:00:00Z" },
  { id: "pr3", month: 6, year: 2026, periodLabel: "June 2026", status: "locked", totalEmployees: 9, totalGross: 456000, totalDeductions: 66800, totalNet: 389200, totalEmployerContribution: 42000, processedAt: "2026-06-26T10:00:00Z", approvedAt: "2026-06-28T14:00:00Z", lockedAt: "2026-06-30T09:00:00Z" },
];

const MOCK_PAYROLL_ITEMS: PayrollItem[] = [
  { id: "pi1", payrollRunId: "pr1", employeeId: "1", employeeName: "Dr. Arun Sharma", employeeCode: "EMP-0001", department: "Ayurveda", workingDays: 26, presentDays: 26, lopDays: 0, paidDays: 26, basic: 48000, hra: 14400, specialAllowance: 18000, medicalAllowance: 1250, conveyance: 1600, overtimePay: 0, incentive: 12000, bonus: 0, arrears: 0, otherEarnings: 0, grossSalary: 95250, pfEmployee: 5760, esiEmployee: 0, professionalTax: 1250, tds: 8500, loanDeduction: 0, advanceDeduction: 0, lopDeduction: 0, otherDeductions: 0, totalDeductions: 15510, netSalary: 79740, paymentStatus: "pending" },
  { id: "pi2", payrollRunId: "pr1", employeeId: "2", employeeName: "Dr. Meena Patel", employeeCode: "EMP-0002", department: "Panchakarma", workingDays: 26, presentDays: 25, lopDays: 0, paidDays: 26, basic: 34000, hra: 10200, specialAllowance: 12750, medicalAllowance: 1250, conveyance: 1600, overtimePay: 0, incentive: 8000, bonus: 0, arrears: 0, otherEarnings: 0, grossSalary: 67800, pfEmployee: 4080, esiEmployee: 0, professionalTax: 1025, tds: 3500, loanDeduction: 0, advanceDeduction: 0, lopDeduction: 0, otherDeductions: 0, totalDeductions: 8605, netSalary: 59195, paymentStatus: "pending" },
  { id: "pi3", payrollRunId: "pr1", employeeId: "3", employeeName: "Rajesh K", employeeCode: "EMP-0003", department: "Front Office", workingDays: 26, presentDays: 26, lopDays: 0, paidDays: 26, basic: 10000, hra: 3000, specialAllowance: 3750, medicalAllowance: 1250, conveyance: 1600, overtimePay: 0, incentive: 0, bonus: 0, arrears: 0, otherEarnings: 0, grossSalary: 19600, pfEmployee: 1200, esiEmployee: 147, professionalTax: 0, tds: 0, loanDeduction: 0, advanceDeduction: 0, lopDeduction: 0, otherDeductions: 0, totalDeductions: 1347, netSalary: 18253, paymentStatus: "pending" },
  { id: "pi4", payrollRunId: "pr1", employeeId: "4", employeeName: "Sunita M", employeeCode: "EMP-0004", department: "IPD", workingDays: 26, presentDays: 22, lopDays: 2, paidDays: 24, basic: 14000, hra: 4200, specialAllowance: 5250, medicalAllowance: 1250, conveyance: 1600, overtimePay: 0, incentive: 0, bonus: 0, arrears: 0, otherEarnings: 0, grossSalary: 26300, pfEmployee: 1680, esiEmployee: 197, professionalTax: 135, tds: 0, loanDeduction: 0, advanceDeduction: 0, lopDeduction: 2692, otherDeductions: 0, totalDeductions: 4704, netSalary: 21596, paymentStatus: "pending" },
  { id: "pi5", payrollRunId: "pr1", employeeId: "5", employeeName: "Vikram R", employeeCode: "EMP-0005", department: "Pharmacy", workingDays: 26, presentDays: 26, lopDays: 0, paidDays: 26, basic: 16000, hra: 4800, specialAllowance: 6000, medicalAllowance: 1250, conveyance: 1600, overtimePay: 0, incentive: 3000, bonus: 0, arrears: 0, otherEarnings: 0, grossSalary: 32650, pfEmployee: 1920, esiEmployee: 0, professionalTax: 315, tds: 0, loanDeduction: 0, advanceDeduction: 0, lopDeduction: 0, otherDeductions: 0, totalDeductions: 2235, netSalary: 30415, paymentStatus: "pending" },
  { id: "pi6", payrollRunId: "pr1", employeeId: "7", employeeName: "Suresh Therapist", employeeCode: "EMP-0007", department: "Panchakarma", workingDays: 26, presentDays: 26, lopDays: 0, paidDays: 26, basic: 14000, hra: 4200, specialAllowance: 5250, medicalAllowance: 1250, conveyance: 1600, overtimePay: 0, incentive: 4000, bonus: 0, arrears: 0, otherEarnings: 0, grossSalary: 30300, pfEmployee: 1680, esiEmployee: 0, professionalTax: 315, tds: 0, loanDeduction: 0, advanceDeduction: 0, lopDeduction: 0, otherDeductions: 0, totalDeductions: 1995, netSalary: 28305, paymentStatus: "pending" },
];

const MOCK_SALARY_REGISTER: SalaryRegisterEntry[] = [
  { employeeId: "1", employeeName: "Dr. Arun Sharma", employeeCode: "EMP-0001", department: "Ayurveda", designation: "Senior Consultant", annualCtc: 1440000, monthlyCtc: 120000, basic: 48000, hra: 14400, grossSalary: 95250, netSalary: 79740, bankName: "IOB", bankAccount: "****4521" },
  { employeeId: "2", employeeName: "Dr. Meena Patel", employeeCode: "EMP-0002", department: "Panchakarma", designation: "Consultant", annualCtc: 1020000, monthlyCtc: 85000, basic: 34000, hra: 10200, grossSalary: 67800, netSalary: 59195, bankName: "SBI", bankAccount: "****7890" },
  { employeeId: "3", employeeName: "Rajesh K", employeeCode: "EMP-0003", department: "Front Office", designation: "Receptionist", annualCtc: 300000, monthlyCtc: 25000, basic: 10000, hra: 3000, grossSalary: 19600, netSalary: 18253, bankName: "ICICI", bankAccount: "****3456" },
  { employeeId: "4", employeeName: "Sunita M", employeeCode: "EMP-0004", department: "IPD", designation: "Staff Nurse", annualCtc: 420000, monthlyCtc: 35000, basic: 14000, hra: 4200, grossSalary: 26300, netSalary: 21596, bankName: "KVB", bankAccount: "****6789" },
  { employeeId: "5", employeeName: "Vikram R", employeeCode: "EMP-0005", department: "Pharmacy", designation: "Pharmacist", annualCtc: 480000, monthlyCtc: 40000, basic: 16000, hra: 4800, grossSalary: 32650, netSalary: 30415, bankName: "IOB", bankAccount: "****1234" },
  { employeeId: "7", employeeName: "Suresh Therapist", employeeCode: "EMP-0007", department: "Panchakarma", designation: "Senior Therapist", annualCtc: 420000, monthlyCtc: 35000, basic: 14000, hra: 4200, grossSalary: 30300, netSalary: 28305, bankName: "PNB", bankAccount: "****5678" },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useHrmsPayroll = (selectedMonth?: number, selectedYear?: number) => {
  const now = new Date();
  const month = selectedMonth ?? now.getMonth() + 1;
  const year = selectedYear ?? now.getFullYear();

  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(MOCK_PAYROLL_RUNS);
  const [currentRun, setCurrentRun] = useState<PayrollRun | null>(MOCK_PAYROLL_RUNS[0]);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>(MOCK_PAYROLL_ITEMS);
  const [salaryRegister, setSalaryRegister] = useState<SalaryRegisterEntry[]>(MOCK_SALARY_REGISTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch payroll runs
      const { data: runs, error: runsErr } = await (supabase as any)
        .from("hrms_payroll_runs")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(12);

      if (runsErr) {
        setError(runsErr.message);
        setLoading(false);
        return;
      }

      if (runs && runs.length > 0) {
        const mapped: PayrollRun[] = runs.map((r: any) => ({
          id: r.id,
          month: r.month,
          year: r.year,
          periodLabel: r.period_label || `${new Date(r.year, r.month - 1).toLocaleString("en-IN", { month: "long" })} ${r.year}`,
          status: r.status,
          totalEmployees: r.total_employees,
          totalGross: Number(r.total_gross) || 0,
          totalDeductions: Number(r.total_deductions) || 0,
          totalNet: Number(r.total_net) || 0,
          totalEmployerContribution: Number(r.total_employer_contribution) || 0,
          processedAt: r.processed_at,
          approvedAt: r.approved_at,
          lockedAt: r.locked_at,
        }));
        setPayrollRuns(mapped);

        // Find current month's run
        const current = mapped.find((r) => r.month === month && r.year === year);
        setCurrentRun(current || mapped[0] || null);
      }

      // 2. Fetch payroll items for the current run
      const targetRun = payrollRuns.find((r) => r.month === month && r.year === year);
      if (targetRun) {
        const { data: items } = await (supabase as any)
          .from("hrms_payroll_items")
          .select("*, hms_staff(name, employee_code, department)")
          .eq("payroll_run_id", targetRun.id)
          .order("hms_staff(name)");

        if (items && items.length > 0) {
          setPayrollItems(items.map((i: any) => ({
            id: i.id,
            payrollRunId: i.payroll_run_id,
            employeeId: i.employee_id,
            employeeName: i.hms_staff?.name || "Unknown",
            employeeCode: i.hms_staff?.employee_code || "",
            department: i.hms_staff?.department || "",
            workingDays: i.working_days,
            presentDays: Number(i.present_days),
            lopDays: Number(i.lop_days),
            paidDays: Number(i.paid_days),
            basic: Number(i.basic),
            hra: Number(i.hra),
            specialAllowance: Number(i.special_allowance),
            medicalAllowance: Number(i.medical_allowance),
            conveyance: Number(i.conveyance),
            overtimePay: Number(i.overtime_pay),
            incentive: Number(i.incentive),
            bonus: Number(i.bonus),
            arrears: Number(i.arrears),
            otherEarnings: Number(i.other_earnings),
            grossSalary: Number(i.gross_salary),
            pfEmployee: Number(i.pf_employee),
            esiEmployee: Number(i.esi_employee),
            professionalTax: Number(i.professional_tax),
            tds: Number(i.tds),
            loanDeduction: Number(i.loan_deduction),
            advanceDeduction: Number(i.advance_deduction),
            lopDeduction: Number(i.lop_deduction),
            otherDeductions: Number(i.other_deductions),
            totalDeductions: Number(i.total_deductions),
            netSalary: Number(i.net_salary),
            paymentStatus: i.payment_status,
          })));
        }
      }

      // 3. Fetch salary register
      const { data: salaries } = await (supabase as any)
        .from("hrms_employee_salary")
        .select("*, hms_staff(name, employee_code, department, role)")
        .eq("is_active", true)
        .order("hms_staff(name)");

      if (salaries && salaries.length > 0) {
        setSalaryRegister(salaries.map((s: any) => ({
          employeeId: s.employee_id,
          employeeName: s.hms_staff?.name || "Unknown",
          employeeCode: s.hms_staff?.employee_code || "",
          department: s.hms_staff?.department || "",
          designation: s.hms_staff?.role || "",
          annualCtc: Number(s.annual_ctc),
          monthlyCtc: Number(s.monthly_ctc),
          basic: Number(s.basic),
          hra: Number(s.hra),
          grossSalary: Number(s.gross_salary),
          netSalary: Number(s.net_salary),
          bankName: s.bank_name,
          bankAccount: s.bank_account_no ? `****${s.bank_account_no.slice(-4)}` : null,
        })));
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  // ─── Process Payroll (create/start a run) ────────────────────────────────

  const processPayroll = async (m: number, y: number): Promise<boolean> => {
    try {
      const label = `${new Date(y, m - 1).toLocaleString("en-IN", { month: "long" })} ${y}`;
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;

      const { error } = await (supabase as any)
        .from("hrms_payroll_runs")
        .upsert({
          month: m,
          year: y,
          period_label: label,
          status: "processing",
          total_employees: salaryRegister.length,
          total_gross: salaryRegister.reduce((s, e) => s + e.grossSalary, 0),
          total_deductions: 0,
          total_net: salaryRegister.reduce((s, e) => s + e.netSalary, 0),
          processed_by: uid,
          processed_at: new Date().toISOString(),
        }, { onConflict: "organisation_id,branch_id,month,year" });

      if (error) return false;
      await fetchPayroll();
      return true;
    } catch {
      return false;
    }
  };

  // ─── Approve Payroll ─────────────────────────────────────────────────────

  const approvePayroll = async (runId: string): Promise<boolean> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;

      const { error } = await (supabase as any)
        .from("hrms_payroll_runs")
        .update({
          status: "approved",
          approved_by: uid,
          approved_at: new Date().toISOString(),
        })
        .eq("id", runId);

      if (error) return false;
      setPayrollRuns((prev) => prev.map((r) => r.id === runId ? { ...r, status: "approved" as const } : r));
      if (currentRun?.id === runId) setCurrentRun((prev) => prev ? { ...prev, status: "approved" } : prev);
      return true;
    } catch {
      return false;
    }
  };

  // ─── Lock Payroll ────────────────────────────────────────────────────────

  const lockPayroll = async (runId: string): Promise<boolean> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;

      const { error } = await (supabase as any)
        .from("hrms_payroll_runs")
        .update({
          status: "locked",
          locked_by: uid,
          locked_at: new Date().toISOString(),
        })
        .eq("id", runId);

      if (error) return false;
      setPayrollRuns((prev) => prev.map((r) => r.id === runId ? { ...r, status: "locked" as const } : r));
      if (currentRun?.id === runId) setCurrentRun((prev) => prev ? { ...prev, status: "locked" } : prev);
      return true;
    } catch {
      return false;
    }
  };

  // ─── Computed ────────────────────────────────────────────────────────────

  const totalPayroll = payrollItems.reduce((s, i) => s + i.netSalary, 0);
  const totalGross = payrollItems.reduce((s, i) => s + i.grossSalary, 0);
  const totalDeductions = payrollItems.reduce((s, i) => s + i.totalDeductions, 0);
  const totalPF = payrollItems.reduce((s, i) => s + i.pfEmployee, 0);
  const totalESI = payrollItems.reduce((s, i) => s + i.esiEmployee, 0);

  return {
    payrollRuns,
    currentRun,
    payrollItems,
    salaryRegister,
    loading,
    error,
    totalPayroll,
    totalGross,
    totalDeductions,
    totalPF,
    totalESI,
    processPayroll,
    approvePayroll,
    lockPayroll,
    refetch: fetchPayroll,
  };
};
