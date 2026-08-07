import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AccountsKPI {
  label: string;
  value: number;
  formatted: string;
  change: number;
  trend: "up" | "down";
}

export interface RevenueMonthly {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

export interface RevenueSource {
  name: string;
  value: number;
  percentage: number;
}

export interface PaymentModeBreakdown {
  name: string;
  value: number;
  percentage: number;
}

export interface AIInsight {
  type: "alert" | "opportunity" | "target" | "saving" | "followup";
  text: string;
  priority: "high" | "medium" | "low";
}

export interface AccountsDashboardData {
  kpis: AccountsKPI[];
  monthlyTrend: RevenueMonthly[];
  revenueSources: RevenueSource[];
  paymentModes: PaymentModeBreakdown[];
  aiInsights: AIInsight[];
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_KPIS: AccountsKPI[] = [
  { label: "Total Revenue", value: 680000, formatted: "₹6,80,000", change: 12.5, trend: "up" },
  { label: "Total Expenses", value: 370000, formatted: "₹3,70,000", change: -2.3, trend: "down" },
  { label: "Net Profit", value: 310000, formatted: "₹3,10,000", change: 28.4, trend: "up" },
  { label: "Pending Dues", value: 68500, formatted: "₹68,500", change: 5.2, trend: "up" },
];

const MOCK_MONTHLY: RevenueMonthly[] = [
  { month: "Feb", revenue: 520000, expense: 310000, profit: 210000 },
  { month: "Mar", revenue: 610000, expense: 340000, profit: 270000 },
  { month: "Apr", revenue: 575000, expense: 355000, profit: 220000 },
  { month: "May", revenue: 690000, expense: 380000, profit: 310000 },
  { month: "Jun", revenue: 725000, expense: 395000, profit: 330000 },
  { month: "Jul", revenue: 680000, expense: 370000, profit: 310000 },
  { month: "Aug", revenue: 420000, expense: 210000, profit: 210000 },
];

const MOCK_SOURCES: RevenueSource[] = [
  { name: "Consultation (OPD)", value: 285000, percentage: 32 },
  { name: "Pharmacy (OTC)", value: 195000, percentage: 22 },
  { name: "Prescription Sales", value: 125000, percentage: 14 },
  { name: "Lab & Diagnostics", value: 95000, percentage: 11 },
  { name: "Panchakarma", value: 145000, percentage: 16 },
  { name: "IPD & Procedures", value: 85000, percentage: 5 },
];

const MOCK_PAYMENT_MODES: PaymentModeBreakdown[] = [
  { name: "Cash", value: 320000, percentage: 42 },
  { name: "GPay/UPI", value: 245000, percentage: 32 },
  { name: "Net Banking", value: 85000, percentage: 11 },
  { name: "Card", value: 65000, percentage: 9 },
  { name: "Insurance", value: 45000, percentage: 6 },
];

const MOCK_INSIGHTS: AIInsight[] = [
  { type: "alert", text: "₹12,500 GPay payment from yesterday not yet reconciled. Verify with bank.", priority: "high" },
  { type: "opportunity", text: "OTC sales up 23% this week. Consider increasing popular item stock.", priority: "medium" },
  { type: "target", text: "Branch Kadayanallur at 78% of monthly target. 8 days remaining.", priority: "medium" },
  { type: "saving", text: "₹8,200 in variable expenses can be optimized by consolidating vendor orders.", priority: "low" },
  { type: "followup", text: "15 patients have pending dues > 30 days. Auto-reminders scheduled.", priority: "high" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, "")}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useAccountsDashboard = (period: string = "this-month"): AccountsDashboardData => {
  const [data, setData] = useState<AccountsDashboardData>({
    kpis: MOCK_KPIS,
    monthlyTrend: MOCK_MONTHLY,
    revenueSources: MOCK_SOURCES,
    paymentModes: MOCK_PAYMENT_MODES,
    aiInsights: MOCK_INSIGHTS,
    loading: true,
    error: null,
  });

  const fetchDashboard = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const today = new Date();
      const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
      const todayStr = today.toISOString().split("T")[0];

      // Fetch revenue from mis_daily_collection (this month)
      const { data: collections, error: collErr } = await (supabase as any)
        .from("mis_daily_collection")
        .select("amount, payment_mode, department")
        .gte("collection_date", monthStart)
        .lte("collection_date", todayStr);

      // Fetch expenses this month
      const { data: expenses, error: expErr } = await (supabase as any)
        .from("hms_expense_entries")
        .select("amount, category")
        .gte("expense_date", monthStart)
        .lte("expense_date", todayStr)
        .eq("status", "Approved");

      // Fetch appointment fees as secondary revenue source
      const { data: apptFees } = await supabase
        .from("appointments")
        .select("fee, status")
        .gte("appointment_date", monthStart)
        .lte("appointment_date", todayStr)
        .neq("status", "cancelled");

      // If all fail, stay on mock
      if (collErr && expErr) {
        console.warn("Accounts dashboard fetch error (using fallback):", collErr?.message);
        setData((prev) => ({ ...prev, loading: false, error: collErr?.message }));
        return;
      }

      // Calculate revenue from collections
      const collectionTotal = (collections || []).reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0);
      const apptTotal = (apptFees || []).reduce((s: number, a: any) => s + (Number(a.fee) || 0), 0);
      const totalRevenue = collectionTotal > 0 ? collectionTotal : apptTotal;

      // Calculate expenses
      const totalExpenses = (expenses || []).reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0);
      const netProfit = totalRevenue - totalExpenses;

      // If no real data yet, keep mock
      if (totalRevenue === 0 && totalExpenses === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      // Build KPIs
      const kpis: AccountsKPI[] = [
        { label: "Total Revenue", value: totalRevenue, formatted: formatINR(totalRevenue), change: 0, trend: "up" },
        { label: "Total Expenses", value: totalExpenses, formatted: formatINR(totalExpenses), change: 0, trend: "down" },
        { label: "Net Profit", value: netProfit, formatted: formatINR(netProfit), change: netProfit > 0 ? Math.round((netProfit / Math.max(totalRevenue, 1)) * 100) : 0, trend: netProfit > 0 ? "up" : "down" },
        { label: "Pending Dues", value: MOCK_KPIS[3].value, formatted: MOCK_KPIS[3].formatted, change: 0, trend: "up" },
      ];

      // Revenue by department/source
      const deptMap = new Map<string, number>();
      for (const c of (collections || [])) {
        const dept = c.department || "General";
        deptMap.set(dept, (deptMap.get(dept) || 0) + (Number(c.amount) || 0));
      }
      const revenueSources: RevenueSource[] = Array.from(deptMap.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0,
        }))
        .sort((a, b) => b.value - a.value);

      // Payment mode breakdown
      const modeMap = new Map<string, number>();
      for (const c of (collections || [])) {
        const mode = c.payment_mode || "cash";
        const label = mode === "gpay" || mode === "upi" ? "GPay/UPI" : mode === "cash" ? "Cash" : mode === "card" ? "Card" : mode === "neft" ? "Net Banking" : mode;
        modeMap.set(label, (modeMap.get(label) || 0) + (Number(c.amount) || 0));
      }
      const paymentModes: PaymentModeBreakdown[] = Array.from(modeMap.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0,
        }))
        .sort((a, b) => b.value - a.value);

      setData({
        kpis,
        monthlyTrend: MOCK_MONTHLY, // Would need historical data — keep mock for now
        revenueSources: revenueSources.length > 0 ? revenueSources : MOCK_SOURCES,
        paymentModes: paymentModes.length > 0 ? paymentModes : MOCK_PAYMENT_MODES,
        aiInsights: MOCK_INSIGHTS, // AI insights are generated server-side — keep mock
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Accounts dashboard unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [period]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return data;
};
