import { supabase } from "@/integrations/supabase/client";

/**
 * Flag 39: Doctor Revenue & Incentive Calculation
 *
 * Calculates: total revenue generated, consultation count, commission earned,
 * based on configurable commission rules.
 */

export interface DoctorRevenueData {
  doctorName: string;
  totalRevenue: number;
  consultationCount: number;
  pharmacyRevenue: number;
  procedureRevenue: number;
  commission: number;
  commissionPct: number;
  pendingPayout: number;
}

export interface CommissionRule {
  type: "consultation" | "pharmacy" | "procedure" | "package";
  percentage: number;
  flatFee?: number;
}

// Default commission rules (can be overridden from DB later)
const DEFAULT_RULES: CommissionRule[] = [
  { type: "consultation", percentage: 60 }, // Doctor gets 60% of consultation fee
  { type: "pharmacy", percentage: 5 },     // 5% of pharmacy sales they generate
  { type: "procedure", percentage: 40 },   // 40% of procedure revenue
  { type: "package", percentage: 30 },     // 30% of PK package revenue
];

export function useDoctorRevenue() {
  const calculateRevenue = async (
    doctorName: string,
    startDate: string,
    endDate: string,
    branch = "Main Branch",
    rules: CommissionRule[] = DEFAULT_RULES
  ): Promise<DoctorRevenueData> => {
    // Fetch all bills for this doctor in the period
    const { data: bills } = await (supabase as any)
      .from("hms_bills")
      .select("total_amount, paid_amount, bill_type")
      .eq("doctor_name", doctorName)
      .eq("branch", branch)
      .eq("is_cancelled", false)
      .gte("bill_date", startDate)
      .lte("bill_date", endDate);

    const allBills = bills || [];

    const consultationRevenue = allBills
      .filter((b: any) => b.bill_type === "consultation")
      .reduce((s: number, b: any) => s + (b.paid_amount || 0), 0);

    const pharmacyRevenue = allBills
      .filter((b: any) => b.bill_type === "pharmacy")
      .reduce((s: number, b: any) => s + (b.paid_amount || 0), 0);

    const procedureRevenue = allBills
      .filter((b: any) => ["procedure", "package"].includes(b.bill_type))
      .reduce((s: number, b: any) => s + (b.paid_amount || 0), 0);

    const totalRevenue = allBills.reduce((s: number, b: any) => s + (b.paid_amount || 0), 0);

    // Calculate commission
    const consultRule = rules.find((r) => r.type === "consultation");
    const pharmaRule = rules.find((r) => r.type === "pharmacy");
    const procRule = rules.find((r) => r.type === "procedure");

    const commission =
      (consultationRevenue * (consultRule?.percentage || 0) / 100) +
      (pharmacyRevenue * (pharmaRule?.percentage || 0) / 100) +
      (procedureRevenue * (procRule?.percentage || 0) / 100);

    const avgPct = totalRevenue > 0 ? (commission / totalRevenue) * 100 : 0;

    // Count consultations
    const { count: consultCount } = await (supabase as any)
      .from("hms_op_visits")
      .select("id", { count: "exact" })
      .eq("doctor_name", doctorName)
      .eq("branch", branch)
      .gte("visit_date", startDate)
      .lte("visit_date", endDate)
      .in("status", ["completed", "checked_out"]);

    return {
      doctorName,
      totalRevenue,
      consultationCount: consultCount || 0,
      pharmacyRevenue,
      procedureRevenue,
      commission: Math.round(commission),
      commissionPct: Math.round(avgPct * 10) / 10,
      pendingPayout: Math.round(commission), // In real system, subtract already-paid
    };
  };

  const getAllDoctorsRevenue = async (startDate: string, endDate: string, branch = "Main Branch") => {
    // Get unique doctor names from bills
    const { data: bills } = await (supabase as any)
      .from("hms_bills")
      .select("doctor_name")
      .eq("branch", branch)
      .eq("is_cancelled", false)
      .not("doctor_name", "is", null)
      .gte("bill_date", startDate)
      .lte("bill_date", endDate);

    const doctorNames = [...new Set((bills || []).map((b: any) => b.doctor_name).filter(Boolean))];

    const results: DoctorRevenueData[] = [];
    for (const name of doctorNames) {
      const rev = await calculateRevenue(name as string, startDate, endDate, branch);
      results.push(rev);
    }

    // Sort by total revenue descending
    results.sort((a, b) => b.totalRevenue - a.totalRevenue);
    return results;
  };

  return { calculateRevenue, getAllDoctorsRevenue };
}
