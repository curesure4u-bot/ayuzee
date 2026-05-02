import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "info_requested";

export type ProductApproval = {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  mrp: number | null;
  stock: number;
  unit: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  ayush_system: string | null;
  approval_status: ApprovalStatus;
  rejection_reason: string | null;
  requested_info: string | null;
  approved_by: string | null;
  approved_at: string | null;
  manufacturer_name: string | null;
  uploaded_by: string | null;
  submitted_at: string | null;
  created_at: string;
  license_number: string | null;
  license_url: string | null;
  gmp_certificate_url: string | null;
  iso_certificate_url: string | null;
  fssai_certificate_url: string | null;
  batch_number: string | null;
  expiry_date: string | null;
  ingredients: string[] | null;
  claims: string | null;
};

export const useProductApprovals = (status: ApprovalStatus) => {
  return useQuery({
    queryKey: ["product-approvals", status],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("products")
        .select("*")
        .eq("approval_status", status)
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProductApproval[];
    },
  });
};

export const useApprovalCounts = () => {
  return useQuery({
    queryKey: ["product-approval-counts"],
    queryFn: async () => {
      const statuses: ApprovalStatus[] = ["pending", "approved", "rejected", "info_requested"];
      const result: Record<ApprovalStatus, number> = {
        pending: 0,
        approved: 0,
        rejected: 0,
        info_requested: 0,
      };
      await Promise.all(
        statuses.map(async (s) => {
          const { count } = await (supabase as any)
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("approval_status", s);
          result[s] = count ?? 0;
        }),
      );
      return result;
    },
    refetchInterval: 30000,
  });
};

const notifyManufacturer = async (
  product: Pick<ProductApproval, "id" | "name" | "manufacturer_name">,
  action: "approved" | "rejected" | "info_requested",
  message?: string,
) => {
  // Best-effort notification; never block the action if email isn't configured.
  try {
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: `product-${action}`,
        idempotencyKey: `product-${action}-${product.id}-${Date.now()}`,
        templateData: {
          productName: product.name,
          manufacturerName: product.manufacturer_name ?? "",
          message: message ?? "",
        },
      },
    });
  } catch {
    /* silent */
  }
};

export const useApproveProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: ProductApproval) => {
      const { data: actor } = await supabase.auth.getUser();
      const { error } = await (supabase as any)
        .from("products")
        .update({
          approval_status: "approved",
          is_approved: true,
          approved_by: actor.user?.id ?? null,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
          requested_info: null,
        })
        .eq("id", product.id);
      if (error) throw error;
      await notifyManufacturer(product, "approved");
      return product.id;
    },
    onMutate: async (product) => {
      await qc.cancelQueries({ queryKey: ["product-approvals"] });
      const prev = qc.getQueryData<ProductApproval[]>(["product-approvals", product.approval_status]);
      qc.setQueryData<ProductApproval[]>(
        ["product-approvals", product.approval_status],
        (old) => (old ?? []).filter((p) => p.id !== product.id),
      );
      return { prev, status: product.approval_status };
    },
    onError: (err: any, _product, ctx) => {
      if (ctx?.prev) qc.setQueryData(["product-approvals", ctx.status], ctx.prev);
      toast.error(err.message ?? "Failed to approve product");
    },
    onSuccess: () => toast.success("Product approved"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["product-approvals"] });
      qc.invalidateQueries({ queryKey: ["product-approval-counts"] });
    },
  });
};

export const useRejectProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ product, reason }: { product: ProductApproval; reason: string }) => {
      const { error } = await (supabase as any)
        .from("products")
        .update({
          approval_status: "rejected",
          is_approved: false,
          rejection_reason: reason,
        })
        .eq("id", product.id);
      if (error) throw error;
      await notifyManufacturer(product, "rejected", reason);
      return product.id;
    },
    onMutate: async ({ product }) => {
      await qc.cancelQueries({ queryKey: ["product-approvals"] });
      const prev = qc.getQueryData<ProductApproval[]>(["product-approvals", product.approval_status]);
      qc.setQueryData<ProductApproval[]>(
        ["product-approvals", product.approval_status],
        (old) => (old ?? []).filter((p) => p.id !== product.id),
      );
      return { prev, status: product.approval_status };
    },
    onError: (err: any, vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["product-approvals", ctx.status], ctx.prev);
      toast.error(err.message ?? "Failed to reject product");
    },
    onSuccess: () => toast.success("Product rejected"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["product-approvals"] });
      qc.invalidateQueries({ queryKey: ["product-approval-counts"] });
    },
  });
};

export const useRequestInfo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ product, info }: { product: ProductApproval; info: string }) => {
      const { error } = await (supabase as any)
        .from("products")
        .update({
          approval_status: "info_requested",
          requested_info: info,
        })
        .eq("id", product.id);
      if (error) throw error;
      await notifyManufacturer(product, "info_requested", info);
      return product.id;
    },
    onMutate: async ({ product }) => {
      await qc.cancelQueries({ queryKey: ["product-approvals"] });
      const prev = qc.getQueryData<ProductApproval[]>(["product-approvals", product.approval_status]);
      qc.setQueryData<ProductApproval[]>(
        ["product-approvals", product.approval_status],
        (old) => (old ?? []).filter((p) => p.id !== product.id),
      );
      return { prev, status: product.approval_status };
    },
    onError: (err: any, vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["product-approvals", ctx.status], ctx.prev);
      toast.error(err.message ?? "Failed to request info");
    },
    onSuccess: () => toast.success("Info requested from manufacturer"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["product-approvals"] });
      qc.invalidateQueries({ queryKey: ["product-approval-counts"] });
    },
  });
};

export const useBulkApprove = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (products: ProductApproval[]) => {
      const { data: actor } = await supabase.auth.getUser();
      const ids = products.map((p) => p.id);
      const { error } = await (supabase as any)
        .from("products")
        .update({
          approval_status: "approved",
          is_approved: true,
          approved_by: actor.user?.id ?? null,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
          requested_info: null,
        })
        .in("id", ids);
      if (error) throw error;
      await Promise.all(products.map((p) => notifyManufacturer(p, "approved")));
      return ids;
    },
    onSuccess: (ids) => toast.success(`${ids.length} product(s) approved`),
    onError: (e: any) => toast.error(e.message ?? "Bulk approval failed"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["product-approvals"] });
      qc.invalidateQueries({ queryKey: ["product-approval-counts"] });
    },
  });
};
