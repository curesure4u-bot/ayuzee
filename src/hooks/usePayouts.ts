import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type PayoutStatus = "pending" | "approved" | "rejected" | "processed" | "hold";

export interface PayoutRequestRow {
  id: string;
  requester_user_id: string;
  amount: number;
  type: string;
  status: PayoutStatus;
  notes: string | null;
  admin_note: string | null;
  account_holder_name: string | null;
  account_number_masked: string | null;
  ifsc_code: string | null;
  bank_name: string | null;
  bank_branch: string | null;
  payment_method: string | null;
  utr_number: string | null;
  tds_amount: number | null;
  net_amount: number | null;
  rejection_reason: string | null;
  hold_reason: string | null;
  supporting_documents: any;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  processed_at: string | null;
  // joined
  requester?: { full_name: string | null; phone: string | null; avatar_url: string | null } | null;
  wallet?: { balance: number; lifetime_earned: number; lifetime_spent: number } | null;
  role?: string | null;
}

export const TDS_THRESHOLD = 30000;
export const TDS_RATE = 0.10;

export const computeTds = (amount: number) => (amount > TDS_THRESHOLD ? Math.round(amount * TDS_RATE * 100) / 100 : 0);

export function usePayouts(status: PayoutStatus | "all" = "pending") {
  return useQuery({
    queryKey: ["admin-payouts", status],
    queryFn: async () => {
      let q = supabase
        .from("payout_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (status !== "all") q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      const rows = (data ?? []) as any[];
      if (rows.length === 0) return [] as PayoutRequestRow[];

      const userIds = Array.from(new Set(rows.map((r) => r.requester_user_id)));
      const [profilesRes, walletsRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, phone, avatar_url").in("user_id", userIds),
        supabase.from("ayuzee_wallets").select("user_id, balance, lifetime_earned, lifetime_spent").in("user_id", userIds),
        supabase.from("user_roles").select("user_id, role").in("user_id", userIds),
      ]);
      const pMap = new Map((profilesRes.data ?? []).map((p) => [p.user_id, p]));
      const wMap = new Map((walletsRes.data ?? []).map((w) => [w.user_id, w]));
      const rMap = new Map<string, string>();
      (rolesRes.data ?? []).forEach((r) => {
        // Pick the first interesting role per user
        if (!rMap.has(r.user_id)) rMap.set(r.user_id, r.role as string);
      });
      return rows.map((r) => ({
        ...r,
        requester: pMap.get(r.requester_user_id) ?? null,
        wallet: wMap.get(r.requester_user_id) ?? null,
        role: rMap.get(r.requester_user_id) ?? null,
      })) as PayoutRequestRow[];
    },
  });
}

export function usePayoutCounts() {
  return useQuery({
    queryKey: ["admin-payouts-counts"],
    queryFn: async () => {
      const statuses: PayoutStatus[] = ["pending", "approved", "rejected", "processed", "hold"];
      const out: Record<string, number> = {};
      await Promise.all(
        statuses.map(async (s) => {
          const { count } = await supabase
            .from("payout_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", s);
          out[s] = count ?? 0;
        }),
      );
      return out;
    },
    refetchInterval: 30000,
  });
}

export function usePayoutAnalytics() {
  return useQuery({
    queryKey: ["admin-payout-analytics"],
    queryFn: async () => {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [pendingRes, processedRes] = await Promise.all([
        supabase.from("payout_requests").select("amount").eq("status", "pending"),
        supabase
          .from("payout_requests")
          .select("amount, created_at, processed_at")
          .eq("status", "processed")
          .gte("processed_at", monthStart.toISOString()),
      ]);

      const totalPending = (pendingRes.data ?? []).reduce((s, r: any) => s + Number(r.amount || 0), 0);
      const totalProcessedThisMonth = (processedRes.data ?? []).reduce((s, r: any) => s + Number(r.amount || 0), 0);
      const times = (processedRes.data ?? [])
        .filter((r: any) => r.processed_at && r.created_at)
        .map((r: any) => new Date(r.processed_at).getTime() - new Date(r.created_at).getTime());
      const avgMs = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
      const avgHours = avgMs / (1000 * 60 * 60);

      return {
        totalPending,
        totalProcessedThisMonth,
        pendingCount: pendingRes.data?.length ?? 0,
        avgProcessingHours: Math.round(avgHours * 10) / 10,
      };
    },
    refetchInterval: 60000,
  });
}

interface ProcessArgs {
  payout_request_id: string;
  action: "approve" | "reject" | "hold" | "process";
  payment_method?: "manual" | "razorpay" | "neft" | "rtgs" | "upi";
  utr_number?: string;
  rejection_reason?: string;
  hold_reason?: string;
  admin_note?: string;
  tds_amount?: number;
}

export function usePayoutAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: ProcessArgs) => {
      const { data, error } = await supabase.functions.invoke("process-payout", { body: args });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as { ok: true; status: PayoutStatus };
    },
    onSuccess: (_d, vars) => {
      toast.success(
        vars.action === "approve"
          ? "Payout approved"
          : vars.action === "reject"
          ? "Payout rejected"
          : vars.action === "hold"
          ? "Payout placed on hold"
          : "Payout processed",
      );
      qc.invalidateQueries({ queryKey: ["admin-payouts"] });
      qc.invalidateQueries({ queryKey: ["admin-payouts-counts"] });
      qc.invalidateQueries({ queryKey: ["admin-payout-analytics"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Action failed"),
  });
}

export function usePayoutHistory(userId?: string) {
  return useQuery({
    queryKey: ["payout-history", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payout_requests")
        .select("id, amount, status, processed_at, created_at")
        .eq("requester_user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePayoutAuditLog(payoutId?: string) {
  return useQuery({
    queryKey: ["payout-audit", payoutId],
    enabled: !!payoutId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payout_audit_log")
        .select("*")
        .eq("payout_request_id", payoutId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
