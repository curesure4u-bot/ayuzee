import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Safe count helper — returns 0 if table missing or query fails
const safeCount = async (
  table: string,
  filter?: (q: any) => any
): Promise<number> => {
  let q: any = (supabase as any).from(table).select("*", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count, error } = await q;
  if (error) return 0;
  return count ?? 0;
};

const sumOrders = async (filter?: (q: any) => any): Promise<number> => {
  let q: any = (supabase as any).from("orders").select("total, order_status, payment_status");
  if (filter) q = filter(q);
  const { data, error } = await q;
  if (error || !data) return 0;
  return data.reduce((sum: number, r: any) => sum + Number(r.total || 0), 0);
};

const sumWalletByType = async (
  type: string,
  source?: string
): Promise<number> => {
  let q: any = (supabase as any)
    .from("ayuzee_wallet_transactions")
    .select("amount, type, source");
  q = q.eq("type", type);
  if (source) q = q.eq("source", source);
  const { data, error } = await q;
  if (error || !data) return 0;
  return data.reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
};

const sumPayoutsPending = async (): Promise<number> => {
  const { data, error } = await (supabase as any)
    .from("payout_requests")
    .select("amount")
    .eq("status", "pending");
  if (error || !data) return 0;
  return data.reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
};

export type AdminStat = {
  key: string;
  fetcher: () => Promise<number>;
};

const STAT_FETCHERS: Record<string, () => Promise<number>> = {
  totalUsers: () => safeCount("profiles"),
  totalDoctors: () => safeCount("user_roles", (q) => q.eq("role", "doctor")),
  totalPatients: () => safeCount("user_roles", (q) => q.eq("role", "patient")),
  totalManufacturers: () => safeCount("manufacturers", (q) => q.eq("approval_status", "approved")),
  pendingManufacturers: () => safeCount("manufacturers", (q) => q.eq("approval_status", "pending")),
  totalOrders: () => safeCount("orders"),
  gmv: () => sumOrders((q) => q.neq("order_status", "cancelled")),
  ayuzeeRevenue: () => sumOrders((q) => q.eq("order_status", "delivered").eq("payment_status", "paid")),
  doctorCommissions: () => sumWalletByType("credit", "commission"),
  pendingProductApprovals: () => safeCount("products", (q) => q.eq("approval_status", "pending")),
  pendingPayouts: () => safeCount("payout_requests", (q) => q.eq("status", "pending")),
  pendingPayoutsAmount: sumPayoutsPending,
};

export const useAdminStat = (key: keyof typeof STAT_FETCHERS) =>
  useQuery({
    queryKey: ["admin-stat", key],
    queryFn: STAT_FETCHERS[key],
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

export default useAdminStat;
