import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ShiftCollection {
  mode: string;
  count: number;
  amount: number;
}

export interface ShiftSummary {
  id: string;
  shiftName: string;
  cashier: string;
  startTime: string;
  endTime: string;
  openingCash: number;
  collections: ShiftCollection[];
  totalCollection: number;
  refunds: number;
  expenses: number;
  expectedCash: number;
  actualCash: number | null;
  difference: number;
  status: "Open" | "Closed" | "Discrepancy" | "Verified";
}

export interface DayEndStats {
  totalDayCollection: number;
  totalCash: number;
  totalDigital: number;
  hasDiscrepancy: boolean;
  billCount: number;
}

export interface DayEndCloseData {
  shifts: ShiftSummary[];
  stats: DayEndStats;
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_SHIFTS: ShiftSummary[] = [
  {
    id: "1", shiftName: "Morning", cashier: "Rec. Priya", startTime: "07:00 AM", endTime: "02:00 PM",
    openingCash: 2000,
    collections: [
      { mode: "Cash", count: 18, amount: 12500 },
      { mode: "UPI", count: 22, amount: 18200 },
      { mode: "Card", count: 8, amount: 9800 },
      { mode: "Cheque", count: 2, amount: 4500 },
    ],
    totalCollection: 45000, refunds: 700, expenses: 1800,
    expectedCash: 12000, actualCash: 12000, difference: 0, status: "Closed",
  },
  {
    id: "2", shiftName: "Evening", cashier: "Rec. Meena", startTime: "02:00 PM", endTime: "09:00 PM",
    openingCash: 2000,
    collections: [
      { mode: "Cash", count: 12, amount: 8500 },
      { mode: "UPI", count: 15, amount: 11200 },
      { mode: "Card", count: 5, amount: 6300 },
      { mode: "Cheque", count: 0, amount: 0 },
    ],
    totalCollection: 26000, refunds: 350, expenses: 800,
    expectedCash: 8850, actualCash: 8700, difference: -150, status: "Discrepancy",
  },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useDayEndClose = (date?: string): DayEndCloseData & {
  closeShift: (shiftId: string, actualCash: number, denomination?: Record<string, number>) => Promise<boolean>;
  closeDay: () => Promise<boolean>;
  refetch: () => void;
} => {
  const targetDate = date || new Date().toISOString().split("T")[0];

  const [data, setData] = useState<DayEndCloseData>({
    shifts: MOCK_SHIFTS,
    stats: {
      totalDayCollection: 71000,
      totalCash: 21000,
      totalDigital: 45500,
      hasDiscrepancy: true,
      billCount: 67,
    },
    loading: true,
    error: null,
  });

  const fetchShifts = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data: rows, error } = await (supabase as any)
        .from("hms_shift_closings")
        .select("*")
        .eq("shift_date", targetDate)
        .order("start_time", { ascending: true });

      if (error) {
        console.warn("Day-end fetch error (using fallback):", error.message);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (!rows || rows.length === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      const shifts: ShiftSummary[] = rows.map((r: any) => {
        const collections: ShiftCollection[] = [
          { mode: "Cash", count: r.cash_count || 0, amount: Number(r.cash_amount) || 0 },
          { mode: "UPI", count: r.upi_count || 0, amount: Number(r.upi_amount) || 0 },
          { mode: "Card", count: r.card_count || 0, amount: Number(r.card_amount) || 0 },
          { mode: "Cheque", count: r.cheque_count || 0, amount: Number(r.cheque_amount) || 0 },
        ];

        return {
          id: r.id,
          shiftName: r.shift_name,
          cashier: r.cashier_name,
          startTime: r.start_time,
          endTime: r.end_time || "—",
          openingCash: Number(r.opening_cash) || 0,
          collections,
          totalCollection: Number(r.total_collection) || 0,
          refunds: Number(r.refunds) || 0,
          expenses: Number(r.expenses_paid) || 0,
          expectedCash: Number(r.expected_cash) || 0,
          actualCash: r.actual_cash != null ? Number(r.actual_cash) : null,
          difference: Number(r.difference) || 0,
          status: r.status as ShiftSummary["status"],
        };
      });

      const totalDayCollection = shifts.reduce((s, sh) => s + sh.totalCollection, 0);
      const totalCash = shifts.reduce((s, sh) => s + (sh.collections.find((c) => c.mode === "Cash")?.amount || 0), 0);
      const totalDigital = shifts.reduce((s, sh) =>
        s + sh.collections.filter((c) => c.mode !== "Cash" && c.mode !== "Cheque").reduce((ss, c) => ss + c.amount, 0), 0);
      const hasDiscrepancy = shifts.some((s) => s.status === "Discrepancy");
      const billCount = shifts.reduce((s, sh) => s + sh.collections.reduce((ss, c) => ss + c.count, 0), 0);

      setData({
        shifts,
        stats: { totalDayCollection, totalCash, totalDigital, hasDiscrepancy, billCount },
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Day-end unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [targetDate]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const closeShift = async (shiftId: string, actualCash: number, denomination?: Record<string, number>): Promise<boolean> => {
    const shift = data.shifts.find((s) => s.id === shiftId);
    if (!shift) return false;

    const difference = actualCash - shift.expectedCash;
    const status = Math.abs(difference) <= 5 ? "Closed" : "Discrepancy";

    const { error } = await (supabase as any)
      .from("hms_shift_closings")
      .update({
        actual_cash: actualCash,
        difference,
        status,
        denomination: denomination || {},
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", shiftId);

    if (!error) fetchShifts();
    return !error;
  };

  const closeDay = async (): Promise<boolean> => {
    // Close all open shifts
    const openShifts = data.shifts.filter((s) => s.status === "Open");
    if (openShifts.length > 0) return false; // Can't close day with open shifts

    // Mark all shifts as verified if no discrepancy
    const { error } = await (supabase as any)
      .from("hms_shift_closings")
      .update({ status: "Verified", updated_at: new Date().toISOString() })
      .eq("shift_date", targetDate)
      .eq("status", "Closed");

    if (!error) fetchShifts();
    return !error;
  };

  return { ...data, closeShift, closeDay, refetch: fetchShifts };
};
