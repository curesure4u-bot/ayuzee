import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types matching the MisCollection UI shape ───────────────────────────────

export interface DailySummaryRow {
  user: string;
  cash: number;
  card: number;
  cheque: number;
  dd: number;
  neft: number;
  credit: number;
  gpay: number;
  total: number;
}

export interface CollectionByDept {
  dept: string;
  amount: number;
  pct: number;
}

export interface IncomeByPaymentType {
  name: string;
  value: number;
}

export interface HourlyCollection {
  hour: string;
  amount: number;
}

export interface MisCollectionFilters {
  dateFrom: string;
  dateTo: string;
  location: string;
}

export interface MisCollectionData {
  dailySummary: DailySummaryRow[];
  collectionByDept: CollectionByDept[];
  incomeByPaymentType: IncomeByPaymentType[];
  hourlyCollection: HourlyCollection[];
  grandTotal: number;
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data (shown when Supabase tables have no data) ────────────

const MOCK_DAILY_SUMMARY: DailySummaryRow[] = [
  { user: "Dr. Sivarama Krishnan", cash: 8500, card: 2000, cheque: 0, dd: 0, neft: 0, credit: 3500, gpay: 5000, total: 19000 },
  { user: "Kumar (Cashier)", cash: 12000, card: 1500, cheque: 0, dd: 0, neft: 0, credit: 2000, gpay: 8200, total: 23700 },
  { user: "Priya (Pharmacy)", cash: 5200, card: 800, cheque: 0, dd: 0, neft: 0, credit: 1500, gpay: 3800, total: 11300 },
  { user: "Anitha (Lab)", cash: 2800, card: 0, cheque: 0, dd: 0, neft: 1200, credit: 0, gpay: 2700, total: 6700 },
];

const MOCK_BY_DEPT: CollectionByDept[] = [
  { dept: "OPD Consultation", amount: 28500, pct: 42 },
  { dept: "Pharmacy", amount: 18500, pct: 27 },
  { dept: "Lab & Diagnostics", amount: 9800, pct: 14 },
  { dept: "Panchakarma", amount: 8200, pct: 12 },
  { dept: "IP & Procedures", amount: 3500, pct: 5 },
];

const MOCK_BY_PAYMENT: IncomeByPaymentType[] = [
  { name: "Cash", value: 28500 },
  { name: "GPay/UPI", value: 19700 },
  { name: "Credit", value: 7000 },
  { name: "Card", value: 4300 },
  { name: "NEFT", value: 1200 },
];

const MOCK_HOURLY: HourlyCollection[] = [
  { hour: "9AM", amount: 8500 },
  { hour: "10AM", amount: 12200 },
  { hour: "11AM", amount: 9800 },
  { hour: "12PM", amount: 7500 },
  { hour: "1PM", amount: 3200 },
  { hour: "2PM", amount: 5800 },
  { hour: "3PM", amount: 8900 },
  { hour: "4PM", amount: 4800 },
];

// ─── Payment mode label mapping ─────────────────────────────────────────────

const PAYMENT_MODE_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  gpay: "GPay/UPI",
  upi: "GPay/UPI",
  neft: "NEFT",
  credit: "Credit",
  cheque: "Cheque",
  dd: "DD",
  wallet: "Wallet",
  insurance: "Insurance",
  other: "Other",
};

// ─── Hour formatting helper ─────────────────────────────────────────────────

function formatHour(h: number): string {
  if (h === 0) return "12AM";
  if (h < 12) return `${h}AM`;
  if (h === 12) return "12PM";
  return `${h - 12}PM`;
}

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useMisCollection = (filters: MisCollectionFilters): MisCollectionData => {
  const [data, setData] = useState<MisCollectionData>({
    dailySummary: MOCK_DAILY_SUMMARY,
    collectionByDept: MOCK_BY_DEPT,
    incomeByPaymentType: MOCK_BY_PAYMENT,
    hourlyCollection: MOCK_HOURLY,
    grandTotal: MOCK_DAILY_SUMMARY.reduce((s, r) => s + r.total, 0),
    loading: true,
    error: null,
  });

  const fetchCollection = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Build query for daily collection rows
      let query = (supabase as any)
        .from("mis_daily_collection")
        .select("collected_by_name, department, payment_mode, amount, bill_count, created_at")
        .gte("collection_date", filters.dateFrom)
        .lte("collection_date", filters.dateTo)
        .order("collected_by_name");

      if (filters.location && filters.location !== "all") {
        query = query.eq("location", filters.location);
      }

      const { data: rows, error } = await query;

      if (error) {
        console.warn("MIS Collection fetch error (using fallback):", error.message);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      // If no data yet, keep mock fallback
      if (!rows || rows.length === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      // ─── Aggregate: Daily Summary by User ───────────────────────────

      const userMap = new Map<string, DailySummaryRow>();
      for (const row of rows) {
        const user = row.collected_by_name || "Unknown";
        if (!userMap.has(user)) {
          userMap.set(user, { user, cash: 0, card: 0, cheque: 0, dd: 0, neft: 0, credit: 0, gpay: 0, total: 0 });
        }
        const entry = userMap.get(user)!;
        const amount = Number(row.amount) || 0;
        const mode = (row.payment_mode || "cash").toLowerCase();

        switch (mode) {
          case "cash": entry.cash += amount; break;
          case "card": entry.card += amount; break;
          case "cheque": entry.cheque += amount; break;
          case "dd": entry.dd += amount; break;
          case "neft": entry.neft += amount; break;
          case "credit": entry.credit += amount; break;
          case "gpay": case "upi": entry.gpay += amount; break;
          default: entry.cash += amount;
        }
        entry.total += amount;
      }
      const dailySummary = Array.from(userMap.values());

      // ─── Aggregate: By Department ──────────────────────────────────

      const deptMap = new Map<string, number>();
      let totalAll = 0;
      for (const row of rows) {
        const dept = row.department || "General";
        const amount = Number(row.amount) || 0;
        deptMap.set(dept, (deptMap.get(dept) || 0) + amount);
        totalAll += amount;
      }
      const collectionByDept: CollectionByDept[] = Array.from(deptMap.entries())
        .map(([dept, amount]) => ({
          dept,
          amount,
          pct: totalAll > 0 ? Math.round((amount / totalAll) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      // ─── Aggregate: By Payment Type ────────────────────────────────

      const payMap = new Map<string, number>();
      for (const row of rows) {
        const mode = (row.payment_mode || "cash").toLowerCase();
        const label = PAYMENT_MODE_LABELS[mode] || mode;
        payMap.set(label, (payMap.get(label) || 0) + (Number(row.amount) || 0));
      }
      const incomeByPaymentType: IncomeByPaymentType[] = Array.from(payMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // ─── Aggregate: Hourly Collection ──────────────────────────────

      const hourMap = new Map<number, number>();
      for (const row of rows) {
        if (row.created_at) {
          const hour = new Date(row.created_at).getHours();
          hourMap.set(hour, (hourMap.get(hour) || 0) + (Number(row.amount) || 0));
        }
      }
      const hourlyCollection: HourlyCollection[] = Array.from(hourMap.entries())
        .map(([h, amount]) => ({ hour: formatHour(h), amount }))
        .sort((a, b) => {
          // Sort by actual hour number
          const getH = (s: string) => {
            const n = parseInt(s);
            if (s.includes("AM")) return n === 12 ? 0 : n;
            return n === 12 ? 12 : n + 12;
          };
          return getH(a.hour) - getH(b.hour);
        });

      const grandTotal = dailySummary.reduce((s, r) => s + r.total, 0);

      setData({
        dailySummary,
        collectionByDept,
        incomeByPaymentType,
        hourlyCollection,
        grandTotal,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("MIS Collection unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [filters.dateFrom, filters.dateTo, filters.location]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  // Real-time subscription for live collection updates
  useEffect(() => {
    const channel = (supabase as any)
      .channel("mis-collection-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mis_daily_collection" },
        () => {
          // Re-fetch on any change
          fetchCollection();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCollection]);

  return data;
};
