import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  Manufacturer,
  ManufacturerApprovalStatus,
  ManufacturerVerificationLog,
  DocumentVerificationStatus,
} from "@/types/manufacturer";

const TABLE = "manufacturers";
const LOGS = "manufacturer_verification_logs";

/**
 * List manufacturers filtered by approval status.
 */
export const useManufacturers = (status: ManufacturerApprovalStatus, sort: "newest" | "oldest" = "newest") => {
  return useQuery({
    queryKey: ["manufacturer-approvals", status, sort],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE as any)
        .select("*")
        .eq("approval_status", status)
        .order("submitted_at", { ascending: sort === "oldest" });
      if (error) throw error;
      return (data ?? []) as unknown as Manufacturer[];
    },
  });
};

/**
 * Counts per approval bucket + simple monthly stats.
 */
export const useManufacturerCounts = () => {
  return useQuery({
    queryKey: ["manufacturer-approval-counts"],
    queryFn: async () => {
      const result: Record<ManufacturerApprovalStatus, number> = {
        pending: 0,
        approved: 0,
        rejected: 0,
      };
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      await Promise.all(
        (Object.keys(result) as ManufacturerApprovalStatus[]).map(async (s) => {
          const { count } = await supabase
            .from(TABLE as any)
            .select("id", { count: "exact", head: true })
            .eq("approval_status", s);
          result[s] = count ?? 0;
        }),
      );

      const { count: approvedThisMonth } = await supabase
        .from(TABLE as any)
        .select("id", { count: "exact", head: true })
        .eq("approval_status", "approved")
        .gte("approved_at", monthStart.toISOString());

      const { count: rejectedThisMonth } = await supabase
        .from(TABLE as any)
        .select("id", { count: "exact", head: true })
        .eq("approval_status", "rejected")
        .gte("updated_at", monthStart.toISOString());

      return {
        ...result,
        approvedThisMonth: approvedThisMonth ?? 0,
        rejectedThisMonth: rejectedThisMonth ?? 0,
      };
    },
    refetchInterval: 30000,
  });
};

/**
 * Verification logs for a single manufacturer.
 */
export const useVerificationLogs = (manufacturerId: string) => {
  return useQuery({
    queryKey: ["mfr-verif-logs", manufacturerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(LOGS as any)
        .select("*")
        .eq("manufacturer_id", manufacturerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ManufacturerVerificationLog[];
    },
    enabled: !!manufacturerId,
  });
};

/**
 * Insert a verification log row (verify / mark issue / pending).
 */
export const useVerifyDocument = (manufacturerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      type: string;
      status: DocumentVerificationStatus;
      comments?: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from(LOGS as any).insert({
        manufacturer_id: manufacturerId,
        document_type: input.type,
        status: input.status,
        comments: input.comments ?? null,
        verified_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mfr-verif-logs", manufacturerId] });
      toast.success("Document status updated");
    },
    onError: (e: any) => toast.error(e.message ?? "Failed to update document"),
  });
};

/**
 * Bulk approve manufacturers (admin action).
 */
export const useBulkApproveManufacturers = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from(TABLE as any)
        .update({
          approval_status: "approved",
          approved_by: user?.id ?? null,
          approved_at: new Date().toISOString(),
        })
        .in("id", ids);
      if (error) throw error;
      return ids;
    },
    onSuccess: (ids) => {
      toast.success(`${ids?.length ?? 0} manufacturer(s) approved`);
      qc.invalidateQueries({ queryKey: ["manufacturer-approvals"] });
      qc.invalidateQueries({ queryKey: ["manufacturer-approval-counts"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Bulk approval failed"),
  });
};

/**
 * Schedule a verification call — best-effort email + audit note.
 */
export const useScheduleCall = () => {
  return useMutation({
    mutationFn: async (input: {
      manufacturer: Manufacturer;
      datetime: string;
      notes: string;
    }) => {
      const { manufacturer: m, datetime, notes } = input;
      if (!m.contact_email) throw new Error("Manufacturer has no contact email");
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          to: m.contact_email,
          subject: `Ayuzee — Verification call scheduled with ${m.company_name}`,
          html: `<p>Hello ${m.contact_person_name ?? m.company_name},</p>
                 <p>We've scheduled a verification call with you on
                 <strong>${new Date(datetime).toLocaleString("en-IN")}</strong>.</p>
                 <p><strong>Points to discuss:</strong><br/>${notes.replace(/\n/g, "<br/>")}</p>`,
        },
      });
    },
    onSuccess: () => toast.success("Call scheduled and invite sent"),
    onError: (e: any) => toast.error(e.message ?? "Failed to schedule call"),
  });
};
