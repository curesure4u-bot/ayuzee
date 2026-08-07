import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | "Rent & Utilities" | "Staff Salary" | "Lab Supplies" | "Maintenance"
  | "Marketing" | "Transport" | "Professional Fees" | "Office Supplies"
  | "Medicine Purchase" | "Equipment" | "Insurance" | "Taxes" | "Other";

export type PaymentMode = "Cash" | "Bank Transfer" | "UPI" | "Cheque" | "Credit Card";
export type ExpenseStatus = "Pending" | "Approved" | "Rejected";

export interface ExpenseEntry {
  id: string;
  voucherNo: string;
  date: string;
  category: ExpenseCategory;
  subCategory: string;
  description: string;
  amount: number;
  paidTo: string;
  mode: PaymentMode;
  approvedBy: string;
  status: ExpenseStatus;
  receipt: boolean;
}

export interface CategorySummary {
  name: string;
  total: number;
  percentage: number;
}

export interface ExpenseManagementData {
  expenses: ExpenseEntry[];
  categories: CategorySummary[];
  totalMonth: number;
  totalWeek: number;
  pendingCount: number;
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock data ──────────────────────────────────────────────────────

const MOCK_EXPENSES: ExpenseEntry[] = [
  { id: "1", voucherNo: "EXP-2026-0451", date: "2026-08-07", category: "Rent & Utilities", subCategory: "Electricity", description: "EB Bill - August 2026", amount: 18500, paidTo: "TNEB", mode: "Bank Transfer", approvedBy: "Admin", status: "Approved", receipt: true },
  { id: "2", voucherNo: "EXP-2026-0452", date: "2026-08-07", category: "Staff Salary", subCategory: "Technician", description: "Tech. Arun - Aug salary advance", amount: 15000, paidTo: "Arun K", mode: "Bank Transfer", approvedBy: "Dr. Mohamad Saleem", status: "Approved", receipt: false },
  { id: "3", voucherNo: "EXP-2026-0453", date: "2026-08-06", category: "Lab Supplies", subCategory: "Reagents", description: "Beckman reagent order - Glucose + Creatinine", amount: 5600, paidTo: "Beckman Coulter India", mode: "Bank Transfer", approvedBy: "Lab Manager", status: "Approved", receipt: true },
  { id: "4", voucherNo: "EXP-2026-0454", date: "2026-08-06", category: "Maintenance", subCategory: "Equipment Repair", description: "AC repair - Lab room", amount: 3500, paidTo: "Cool Care Services", mode: "Cash", approvedBy: "Admin", status: "Approved", receipt: false },
  { id: "5", voucherNo: "EXP-2026-0455", date: "2026-08-05", category: "Marketing", subCategory: "Printing", description: "Patient pamphlets - 1000 copies", amount: 4200, paidTo: "Sri Murugan Printers", mode: "Cash", approvedBy: "Admin", status: "Approved", receipt: true },
  { id: "6", voucherNo: "EXP-2026-0456", date: "2026-08-07", category: "Transport", subCategory: "Fuel", description: "Home collection bike - Petrol", amount: 800, paidTo: "Petty Cash", mode: "Cash", approvedBy: "Supervisor", status: "Approved", receipt: false },
  { id: "7", voucherNo: "EXP-2026-0457", date: "2026-08-07", category: "Office Supplies", subCategory: "Stationery", description: "Printer paper, ink, files", amount: 2100, paidTo: "Lakshmi Stores", mode: "Cash", approvedBy: "Admin", status: "Pending", receipt: false },
  { id: "8", voucherNo: "EXP-2026-0458", date: "2026-08-07", category: "Professional Fees", subCategory: "Audit", description: "CA audit fees - Q2", amount: 25000, paidTo: "M/s. Kumar & Associates", mode: "Cheque", approvedBy: "Dr. Mohamad Saleem", status: "Pending", receipt: false },
];

const MOCK_CATEGORIES: CategorySummary[] = [
  { name: "Staff Salary", total: 285000, percentage: 40 },
  { name: "Rent & Utilities", total: 42000, percentage: 14 },
  { name: "Lab Supplies", total: 68000, percentage: 12 },
  { name: "Professional Fees", total: 35000, percentage: 8 },
  { name: "Maintenance", total: 18500, percentage: 7 },
  { name: "Marketing", total: 12000, percentage: 5 },
  { name: "Transport", total: 8500, percentage: 4 },
  { name: "Office Supplies", total: 6200, percentage: 3 },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useExpenseManagement = (filters?: { search?: string; category?: string; dateFrom?: string; dateTo?: string }): ExpenseManagementData & {
  createExpense: (expense: Omit<ExpenseEntry, "id" | "voucherNo">) => Promise<boolean>;
  approveExpense: (id: string) => Promise<boolean>;
  rejectExpense: (id: string) => Promise<boolean>;
  refetch: () => void;
} => {
  const [data, setData] = useState<ExpenseManagementData>({
    expenses: MOCK_EXPENSES,
    categories: MOCK_CATEGORIES,
    totalMonth: 475200,
    totalWeek: 74700,
    pendingCount: 2,
    loading: true,
    error: null,
  });

  const fetchExpenses = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch expense entries
      let query = (supabase as any)
        .from("hms_expense_entries")
        .select("*")
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (filters?.category && filters.category !== "ALL") {
        query = query.eq("category", filters.category);
      }
      if (filters?.dateFrom) {
        query = query.gte("expense_date", filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte("expense_date", filters.dateTo);
      }

      const { data: rows, error } = await query;

      if (error) {
        console.warn("Expense fetch error (using fallback):", error.message);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (!rows || rows.length === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      // Map rows
      let expenses: ExpenseEntry[] = rows.map((r: any) => ({
        id: r.id,
        voucherNo: r.voucher_no || "—",
        date: r.expense_date,
        category: r.category as ExpenseCategory,
        subCategory: r.sub_category || "",
        description: r.description,
        amount: Number(r.amount),
        paidTo: r.paid_to,
        mode: r.payment_mode as PaymentMode,
        approvedBy: r.approved_by_name || "—",
        status: r.status as ExpenseStatus,
        receipt: Boolean(r.receipt_url),
      }));

      // Apply search filter locally
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        expenses = expenses.filter((e) =>
          e.description.toLowerCase().includes(s) ||
          e.paidTo.toLowerCase().includes(s) ||
          e.voucherNo.toLowerCase().includes(s)
        );
      }

      // Calculate category summaries
      const catMap = new Map<string, number>();
      let totalAll = 0;
      for (const e of rows.filter((r: any) => r.status === "Approved")) {
        const cat = e.category;
        const amt = Number(e.amount);
        catMap.set(cat, (catMap.get(cat) || 0) + amt);
        totalAll += amt;
      }
      const categories: CategorySummary[] = Array.from(catMap.entries())
        .map(([name, total]) => ({
          name,
          total,
          percentage: totalAll > 0 ? Math.round((total / totalAll) * 100) : 0,
        }))
        .sort((a, b) => b.total - a.total);

      // Calculate week total
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStr = weekAgo.toISOString().split("T")[0];
      const totalWeek = rows
        .filter((r: any) => r.expense_date >= weekStr && r.status === "Approved")
        .reduce((s: number, r: any) => s + Number(r.amount), 0);

      const pendingCount = rows.filter((r: any) => r.status === "Pending").length;

      setData({
        expenses,
        categories: categories.length > 0 ? categories : MOCK_CATEGORIES,
        totalMonth: totalAll,
        totalWeek,
        pendingCount,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Expense unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [filters?.search, filters?.category, filters?.dateFrom, filters?.dateTo]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = async (expense: Omit<ExpenseEntry, "id" | "voucherNo">): Promise<boolean> => {
    const { data: sess } = await supabase.auth.getSession();

    const { error } = await (supabase as any)
      .from("hms_expense_entries")
      .insert({
        expense_date: expense.date,
        category: expense.category,
        sub_category: expense.subCategory,
        description: expense.description,
        amount: expense.amount,
        paid_to: expense.paidTo,
        payment_mode: expense.mode,
        approved_by_name: expense.approvedBy,
        status: expense.status,
        created_by: sess.session?.user?.id,
      });

    if (!error) fetchExpenses();
    return !error;
  };

  const approveExpense = async (id: string): Promise<boolean> => {
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await (supabase as any)
      .from("hms_expense_entries")
      .update({ status: "Approved", approved_by: sess.session?.user?.id, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) fetchExpenses();
    return !error;
  };

  const rejectExpense = async (id: string): Promise<boolean> => {
    const { error } = await (supabase as any)
      .from("hms_expense_entries")
      .update({ status: "Rejected", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) fetchExpenses();
    return !error;
  };

  return { ...data, createExpense, approveExpense, rejectExpense, refetch: fetchExpenses };
};
