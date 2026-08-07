import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching DoctorRevenue UI ─────────────────────────────────────────

export interface RevenueKPI {
  label: string;
  value: number;
  formatted: string;
  trend: string;
}

export interface RevenueBreakdown {
  category: string;
  percentage: number;
  amount: number;
  formatted: string;
  color: string;
}

export interface DailyEarning {
  day: string;
  amount: number;
  date: string;
}

export interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  formatted: string;
  status: string;
  method: string;
  reference: string | null;
}

export interface DoctorRevenueData {
  kpis: RevenueKPI[];
  breakdown: RevenueBreakdown[];
  dailyEarnings: DailyEarning[];
  payoutHistory: PayoutRecord[];
  totalThisMonth: number;
  loading: boolean;
  error: string | null;
}

// ─── Category color mapping ──────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  consultation: "bg-blue-500",
  lab_commission: "bg-green-500",
  pk_referral: "bg-purple-500",
  pharmacy: "bg-orange-500",
  incentive: "bg-pink-500",
  procedure: "bg-cyan-500",
  franchise: "bg-indigo-500",
  teleconsult: "bg-teal-500",
  other: "bg-gray-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  consultation: "Consultation Fees",
  lab_commission: "Lab Commission",
  pk_referral: "PK Referral",
  pharmacy: "Pharmacy",
  incentive: "Incentive Bonus",
  procedure: "Procedures",
  franchise: "Franchise",
  teleconsult: "Teleconsult",
  other: "Other",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function getDayName(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short" });
}

function getStartOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split("T")[0];
}

function getStartOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_KPIS: RevenueKPI[] = [
  { label: "Today", value: 12500, formatted: "₹12,500", trend: "+8%" },
  { label: "This Week", value: 68000, formatted: "₹68,000", trend: "+12%" },
  { label: "This Month", value: 285000, formatted: "₹2,85,000", trend: "+5%" },
];

const MOCK_BREAKDOWN: RevenueBreakdown[] = [
  { category: "Consultation Fees", percentage: 45, amount: 128250, formatted: "₹1,28,250", color: "bg-blue-500" },
  { category: "Lab Commission", percentage: 20, amount: 57000, formatted: "₹57,000", color: "bg-green-500" },
  { category: "PK Referral", percentage: 18, amount: 51300, formatted: "₹51,300", color: "bg-purple-500" },
  { category: "Pharmacy", percentage: 12, amount: 34200, formatted: "₹34,200", color: "bg-orange-500" },
  { category: "Incentive Bonus", percentage: 5, amount: 14250, formatted: "₹14,250", color: "bg-pink-500" },
];

const MOCK_DAILY: DailyEarning[] = [
  { day: "Mon", amount: 11200, date: "" },
  { day: "Tue", amount: 13500, date: "" },
  { day: "Wed", amount: 9800, date: "" },
  { day: "Thu", amount: 14200, date: "" },
  { day: "Fri", amount: 12500, date: "" },
  { day: "Sat", amount: 6800, date: "" },
];

const MOCK_PAYOUTS: PayoutRecord[] = [
  { id: "1", date: "01 Jul 2026", amount: 272000, formatted: "₹2,72,000", status: "Paid", method: "Bank Transfer", reference: null },
  { id: "2", date: "01 Jun 2026", amount: 258000, formatted: "₹2,58,000", status: "Paid", method: "Bank Transfer", reference: null },
  { id: "3", date: "01 May 2026", amount: 291000, formatted: "₹2,91,000", status: "Paid", method: "Bank Transfer", reference: null },
  { id: "4", date: "01 Apr 2026", amount: 245000, formatted: "₹2,45,000", status: "Paid", method: "Bank Transfer", reference: null },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useDoctorRevenue = (): DoctorRevenueData => {
  const [data, setData] = useState<DoctorRevenueData>({
    kpis: MOCK_KPIS,
    breakdown: MOCK_BREAKDOWN,
    dailyEarnings: MOCK_DAILY,
    payoutHistory: MOCK_PAYOUTS,
    totalThisMonth: 285000,
    loading: true,
    error: null,
  });

  const fetchRevenue = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        setData((prev) => ({ ...prev, loading: false }));
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const weekStart = getStartOfWeek();
      const monthStart = getStartOfMonth();

      // ─── Fetch revenue entries for this month ──────────────────────

      const { data: entries, error } = await (supabase as any)
        .from("doctor_revenue_entries")
        .select("id, entry_date, category, amount, payment_status")
        .eq("doctor_id", uid)
        .gte("entry_date", monthStart)
        .lte("entry_date", today)
        .neq("payment_status", "cancelled")
        .order("entry_date", { ascending: false });

      if (error) {
        console.warn("Doctor revenue fetch error (using fallback):", error.message);
        // Fallback: try to compute from appointments table
        const { data: appts } = await supabase
          .from("appointments")
          .select("appointment_date, fee, status")
          .eq("doctor_id", uid)
          .gte("appointment_date", monthStart)
          .lte("appointment_date", today)
          .neq("status", "cancelled");

        if (appts && appts.length > 0) {
          const todayTotal = appts.filter((a) => a.appointment_date === today).reduce((s, a) => s + (Number(a.fee) || 0), 0);
          const weekTotal = appts.filter((a) => a.appointment_date >= weekStart).reduce((s, a) => s + (Number(a.fee) || 0), 0);
          const monthTotal = appts.reduce((s, a) => s + (Number(a.fee) || 0), 0);

          setData((prev) => ({
            ...prev,
            kpis: [
              { label: "Today", value: todayTotal, formatted: `₹${todayTotal.toLocaleString("en-IN")}`, trend: "" },
              { label: "This Week", value: weekTotal, formatted: `₹${weekTotal.toLocaleString("en-IN")}`, trend: "" },
              { label: "This Month", value: monthTotal, formatted: `₹${monthTotal.toLocaleString("en-IN")}`, trend: "" },
            ],
            totalThisMonth: monthTotal,
            loading: false,
            error: null,
          }));
          return;
        }

        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (!entries || entries.length === 0) {
        // Also try appointments table as secondary source
        const { data: appts } = await supabase
          .from("appointments")
          .select("appointment_date, fee, status")
          .eq("doctor_id", uid)
          .gte("appointment_date", monthStart)
          .lte("appointment_date", today)
          .neq("status", "cancelled");

        if (appts && appts.length > 0) {
          const todayTotal = appts.filter((a) => a.appointment_date === today).reduce((s, a) => s + (Number(a.fee) || 0), 0);
          const weekTotal = appts.filter((a) => a.appointment_date >= weekStart).reduce((s, a) => s + (Number(a.fee) || 0), 0);
          const monthTotal = appts.reduce((s, a) => s + (Number(a.fee) || 0), 0);

          setData((prev) => ({
            ...prev,
            kpis: [
              { label: "Today", value: todayTotal, formatted: `₹${todayTotal.toLocaleString("en-IN")}`, trend: "" },
              { label: "This Week", value: weekTotal, formatted: `₹${weekTotal.toLocaleString("en-IN")}`, trend: "" },
              { label: "This Month", value: monthTotal, formatted: `₹${monthTotal.toLocaleString("en-IN")}`, trend: "" },
            ],
            breakdown: [{ category: "Consultation Fees", percentage: 100, amount: monthTotal, formatted: formatINR(monthTotal), color: "bg-blue-500" }],
            totalThisMonth: monthTotal,
            loading: false,
            error: null,
          }));
          return;
        }

        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      // ─── Calculate KPIs ────────────────────────────────────────────

      const todayTotal = entries.filter((e: any) => e.entry_date === today).reduce((s: number, e: any) => s + Number(e.amount), 0);
      const weekTotal = entries.filter((e: any) => e.entry_date >= weekStart).reduce((s: number, e: any) => s + Number(e.amount), 0);
      const monthTotal = entries.reduce((s: number, e: any) => s + Number(e.amount), 0);

      const kpis: RevenueKPI[] = [
        { label: "Today", value: todayTotal, formatted: `₹${todayTotal.toLocaleString("en-IN")}`, trend: "" },
        { label: "This Week", value: weekTotal, formatted: `₹${weekTotal.toLocaleString("en-IN")}`, trend: "" },
        { label: "This Month", value: monthTotal, formatted: `₹${monthTotal.toLocaleString("en-IN")}`, trend: "" },
      ];

      // ─── Calculate Breakdown by Category ───────────────────────────

      const catMap = new Map<string, number>();
      for (const entry of entries) {
        const cat = entry.category || "other";
        catMap.set(cat, (catMap.get(cat) || 0) + Number(entry.amount));
      }

      const breakdown: RevenueBreakdown[] = Array.from(catMap.entries())
        .map(([cat, amount]) => ({
          category: CATEGORY_LABELS[cat] || cat,
          percentage: monthTotal > 0 ? Math.round((amount / monthTotal) * 100) : 0,
          amount,
          formatted: formatINR(amount),
          color: CATEGORY_COLORS[cat] || "bg-gray-500",
        }))
        .sort((a, b) => b.amount - a.amount);

      // ─── Daily Earnings (this week) ────────────────────────────────

      const dailyMap = new Map<string, number>();
      const weekEntries = entries.filter((e: any) => e.entry_date >= weekStart);
      for (const entry of weekEntries) {
        dailyMap.set(entry.entry_date, (dailyMap.get(entry.entry_date) || 0) + Number(entry.amount));
      }

      const dailyEarnings: DailyEarning[] = Array.from(dailyMap.entries())
        .map(([date, amount]) => ({ day: getDayName(date), amount, date }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // ─── Payout History ────────────────────────────────────────────

      const { data: payouts } = await (supabase as any)
        .from("doctor_payouts")
        .select("*")
        .eq("doctor_id", uid)
        .order("payout_date", { ascending: false })
        .limit(6);

      const payoutHistory: PayoutRecord[] = payouts && payouts.length > 0
        ? payouts.map((p: any) => ({
            id: p.id,
            date: new Date(p.payout_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            amount: Number(p.amount),
            formatted: formatINR(Number(p.amount)),
            status: p.status === "paid" ? "Paid" : p.status === "processing" ? "Processing" : "Pending",
            method: p.method === "bank_transfer" ? "Bank Transfer" : p.method === "upi" ? "UPI" : p.method,
            reference: p.reference_number,
          }))
        : MOCK_PAYOUTS;

      setData({
        kpis,
        breakdown: breakdown.length > 0 ? breakdown : MOCK_BREAKDOWN,
        dailyEarnings: dailyEarnings.length > 0 ? dailyEarnings : MOCK_DAILY,
        payoutHistory,
        totalThisMonth: monthTotal,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Doctor revenue unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, []);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  return data;
};
